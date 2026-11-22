import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ADAB_MISSIONS, BONUS_STARS } from './curriculum';
import {
  clampPlayerToWorld,
  findNearestInteractableStation,
  getActiveMission,
  groundHeightAt,
} from './gameLogic';
import { soundManager } from './audio';
import { AvatarStyle, GamePhase, GameProgressState, MissionId } from './types';
import { buildGameWorld, BuiltWorld } from './worldBuilder';

const _vec3 = new THREE.Vector3();
const _vec3b = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _pColor = new THREE.Color();

interface ParticleSlot {
  active: boolean;
  age: number;
  life: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  colorHex: number;
}

export interface EngineCallbacks {
  getState: () => GameProgressState;
  onNearStationChange: (stationId: MissionId | null) => void;
  onCollectBonusStar: (starId: string) => void;
  onRequestInteract: (stationId: MissionId) => void;
  onElapsedTick: (elapsedSeconds: number) => void;
}

function detectSoftwareGl(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export class ThreeGameEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private world: BuiltWorld;
  private isSoftwareGl: boolean;
  private envRT: THREE.WebGLRenderTarget;

  private frameId = 0;
  private isTimeoutId = false;
  private disposed = false;
  private lastTime = performance.now();

  // Player physics & animation state
  private px = 0;
  private py = 0;
  private pz = 9.5;
  private vx = 0;
  private vy = 0;
  private vz = 0;
  private playerYaw = 0; // 0 = facing -Z
  private grounded = true;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private walkDistance = 0;
  private lastFootstepDist = 0;
  private squashX = 1;
  private squashY = 1;

  // Camera orbit & shake
  private camYaw = 0;
  private camPitch = 0.34;
  private camDist = 9.0;
  private draggingCamera = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private trauma = 0;
  private hitstopTimer = 0;
  private titleOrbitAngle = 0.48;
  private elapsedPlaying = 0;
  private lastReportedSecond = -1;
  private lastNearStation: MissionId | null = null;

  // Input state
  private keysHeld = new Set<string>();
  private virtualMoveX = 0;
  private virtualMoveZ = 0;

  // Pooled particle ring buffer
  private readonly MAX_PARTICLES = 64;
  private particles: ParticleSlot[] = [];
  private particleMesh: THREE.InstancedMesh;
  private particleCursor = 0;

  // Raycaster for direct station click
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();
  private pointerDownPos = { x: 0, y: 0 };

  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareGl();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const rect = container.getBoundingClientRect();
    const w = Math.max(1, rect.width || window.innerWidth);
    const h = Math.max(1, rect.height || window.innerHeight);
    this.renderer.setSize(w, h);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const skyColor = new THREE.Color(0xdcf2f8);
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(0xdcf2f8, 0.015);

    this.camera = new THREE.PerspectiveCamera(52, w / h, 0.1, 140);
    this.camera.position.set(5.8, 4.6, 12.6);
    this.camera.lookAt(-2.6, 1.8, 2.0);

    // Mandatory studio environment reflection via RoomEnvironment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.envRT.texture;
    this.scene.environmentIntensity = 0.62;
    pmrem.dispose();

    // Warm/cool 3-point outdoor courtyard lighting (<= 1 shadow caster)
    const hemi = new THREE.HemisphereLight(0xcceeff, 0x7da15f, 0.68);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff1cc, 1.35);
    sun.position.set(14, 22, 12);
    sun.castShadow = !this.isSoftwareGl;
    if (sun.castShadow) {
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -16;
      sun.shadow.camera.right = 16;
      sun.shadow.camera.top = 16;
      sun.shadow.camera.bottom = -16;
      sun.shadow.camera.near = 2;
      sun.shadow.camera.far = 55;
      sun.shadow.bias = -0.0005;
      sun.shadow.normalBias = 0.02;
    }
    this.scene.add(sun);

    const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.45);
    rimLight.position.set(-14, 10, -14);
    this.scene.add(rimLight);

    const maxAniso = this.isSoftwareGl
      ? 1
      : this.renderer.capabilities.getMaxAnisotropy();
    const initState = callbacks.getState();
    this.world = buildGameWorld(this.scene, maxAniso, initState.avatarStyle);

    // Pooled InstancedMesh Particle Ring Buffer
    const pGeo = new THREE.OctahedronGeometry(0.14, 0);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.5,
    });
    this.particleMesh = new THREE.InstancedMesh(pGeo, pMat, this.MAX_PARTICLES);
    this.particleMesh.frustumCulled = false;
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        age: 0,
        life: 0.6,
        x: 0,
        y: -50,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        colorHex: 0xfbbf24,
      });
      _mat4.makeScale(0, 0, 0);
      this.particleMesh.setMatrixAt(i, _mat4);
      _pColor.setHex(0xfbbf24);
      this.particleMesh.setColorAt(i, _pColor);
    }
    this.particleMesh.instanceMatrix.needsUpdate = true;
    if (this.particleMesh.instanceColor) {
      this.particleMesh.instanceColor.needsUpdate = true;
    }
    this.scene.add(this.particleMesh);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Bind listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleWindowBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    dom.addEventListener('wheel', this.handleWheel, { passive: true });
    dom.addEventListener('webglcontextlost', this.handleContextLost);

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    // Render initial frame immediately so Title Screen never shows an empty sky frame
    if (initState.phase === 'title') {
      this.updateTitleShowcase(0, 0);
    }
    this.renderer.render(this.scene, this.camera);
    this.scheduleNextTick();
  }

  public setAvatarStyle(style: AvatarStyle) {
    this.world.avatar.songkokMesh.visible = style === 'lelaki';
    this.world.avatar.tudungMesh.visible = style === 'perempuan';
  }

  public resetPlayerPosition() {
    this.px = 0;
    this.py = 0;
    this.pz = 9.5;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.playerYaw = 0;
    this.camYaw = 0;
    this.camPitch = 0.42;
    this.grounded = true;
    this.elapsedPlaying = 0;
    this.lastReportedSecond = -1;
    this.lastNearStation = null;
    this.keysHeld.clear();
    this.world.avatar.root.position.set(this.px, this.py, this.pz);
    this.world.avatar.root.rotation.y = 0;
  }

  public clearInputs() {
    this.keysHeld.clear();
    this.virtualMoveX = 0;
    this.virtualMoveZ = 0;
    this.draggingCamera = false;
  }

  public setVirtualMove(x: number, z: number) {
    this.virtualMoveX = x;
    this.virtualMoveZ = z;
  }

  public triggerVirtualJump() {
    this.jumpBufferTimer = 0.14;
  }

  public triggerBurst(x: number, y: number, z: number, colorHex = 0xfbbf24, count = 18) {
    this.trauma = Math.min(1, this.trauma + 0.25);
    this.hitstopTimer = 0.04;
    for (let i = 0; i < count; i++) {
      const slot = this.particles[this.particleCursor];
      this.particleCursor = (this.particleCursor + 1) % this.MAX_PARTICLES;
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 2.2 + Math.random() * 3.5;
      slot.active = true;
      slot.age = 0;
      slot.life = 0.55 + Math.random() * 0.35;
      slot.x = x;
      slot.y = y + 0.6;
      slot.z = z;
      slot.vx = Math.cos(angle) * speed;
      slot.vy = 3.2 + Math.random() * 3.2;
      slot.vz = Math.sin(angle) * speed;
      slot.colorHex = colorHex;
    }
  }

  private handleResize = () => {
    if (this.disposed) return;
    const rect = this.container.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.render(this.scene, this.camera);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (
      document.activeElement &&
      (document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA')
    ) {
      return;
    }
    const state = this.callbacks.getState();
    if (state.phase !== 'playing' || state.openMissionModalId || state.showBadgesModal) {
      return;
    }

    if (e.code === 'Space' && !this.keysHeld.has('Space')) {
      e.preventDefault();
      this.jumpBufferTimer = 0.13;
    }
    if ((e.code === 'KeyE' || e.code === 'Enter') && !this.keysHeld.has(e.code)) {
      if (this.lastNearStation) {
        e.preventDefault();
        this.callbacks.onRequestInteract(this.lastNearStation);
      }
    }
    this.keysHeld.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space' && this.vy > 2.5) {
      this.vy *= 0.48; // variable jump cut
    }
    this.keysHeld.delete(e.code);
  };

  private handleWindowBlur = () => {
    this.clearInputs();
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.clearInputs();
    }
  };

  private handlePointerDown = (e: PointerEvent) => {
    this.draggingCamera = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.draggingCamera) return;
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.camYaw -= dx * 0.0065;
    this.camPitch = THREE.MathUtils.clamp(this.camPitch + dy * 0.005, 0.18, 1.05);
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (!this.draggingCamera) return;
    this.draggingCamera = false;
    const moved = Math.hypot(
      e.clientX - this.pointerDownPos.x,
      e.clientY - this.pointerDownPos.y
    );
    if (moved < 6) {
      this.tryClickStation(e.clientX, e.clientY);
    }
  };

  private handleWheel = (e: WheelEvent) => {
    this.camDist = THREE.MathUtils.clamp(this.camDist + e.deltaY * 0.005, 5.2, 13.5);
  };

  private handleContextLost = (e: Event) => {
    e.preventDefault();
  };

  private tryClickStation(clientX: number, clientY: number) {
    const state = this.callbacks.getState();
    if (state.phase !== 'playing' || state.openMissionModalId || state.showBadgesModal) {
      return;
    }
    const active = getActiveMission(state);
    if (!active) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);

    const visual = this.world.stations.get(active.id);
    if (!visual) return;
    const hits = this.raycaster.intersectObject(visual.group, true);
    if (hits.length > 0) {
      // Allow direct click if player is reasonably close OR within 4.5m
      const dist = Math.hypot(this.px - active.stationPos.x, this.pz - active.stationPos.z);
      if (dist <= active.interactRadius + 2.0) {
        this.callbacks.onRequestInteract(active.id);
      }
    }
  }

  private scheduleNextTick() {
    if (this.disposed) return;
    if (this.isSoftwareGl) {
      this.afterDraw(() => this.tick());
    } else {
      this.isTimeoutId = false;
      this.frameId = requestAnimationFrame(() => this.tick());
    }
  }

  private afterDraw(cb: () => void) {
    if (this.disposed) return;
    try {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.disposed) return;
        const status = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          this.isTimeoutId = true;
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.isTimeoutId = true;
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.isTimeoutId = true;
      this.frameId = window.setTimeout(poll, 5);
    } catch {
      this.isTimeoutId = true;
      this.frameId = window.setTimeout(cb, 80);
    }
  }

  private tick() {
    if (this.disposed) return;
    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const totalDt = Math.min(Math.max(rawDt, 0.001), 0.16);
    const steps = totalDt > 0.05 ? Math.ceil(totalDt / 0.04) : 1;
    const stepDt = totalDt / steps;

    const state = this.callbacks.getState();

    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - totalDt);
    } else {
      this.updateWorldAnimations(now * 0.001, totalDt, state);
      if (state.phase === 'playing' && !state.openMissionModalId && !state.showBadgesModal) {
        for (let s = 0; s < steps; s++) {
          this.updatePlayer(stepDt, state);
        }
      } else if (state.phase === 'title') {
        this.updateTitleShowcase(now * 0.001, totalDt);
      }
    }

    this.updateParticles(totalDt);
    this.updateCamera(totalDt, state.phase);
    this.renderer.render(this.scene, this.camera);
    this.scheduleNextTick();
  }

  private updateWorldAnimations(t: number, dt: number, state: GameProgressState) {
    // Gentle tree canopy sway
    for (let i = 0; i < this.world.swayingTrees.length; i++) {
      const canopy = this.world.swayingTrees[i];
      canopy.rotation.z = Math.sin(t * 1.4 + i) * 0.03;
    }

    // Active station beacon visibility & animation
    const active = getActiveMission(state);
    this.world.stations.forEach((vis, id) => {
      const isActive = active?.id === id;
      vis.beaconRing.visible = isActive && state.phase === 'playing';
      vis.beaconArrow.visible = isActive && state.phase === 'playing';
      if (isActive) {
        const s = 1 + Math.sin(t * 4.5) * 0.09;
        vis.beaconRing.scale.set(s, s, 1);
        vis.beaconArrow.rotation.y += dt * 2.4;
        const baseArrowY = id === 'duduk-doa' ? 1.85 : 2.25;
        vis.beaconArrow.position.y = baseArrowY + Math.sin(t * 3.5) * 0.18;
      }
      // Station ambient micro-animations (water shimmer, steam bob)
      for (const part of vis.animatedParts) {
        part.rotation.y += dt * 0.6;
      }
    });

    // Bonus floating stars visibility & rotation
    for (const b of BONUS_STARS) {
      const vis = this.world.bonusStars.get(b.id);
      if (!vis) continue;
      const collected = state.collectedBonusStars.includes(b.id);
      vis.group.visible = !collected;
      if (!collected) {
        vis.starMesh.rotation.y += dt * 2.1;
        vis.starMesh.position.y = Math.sin(t * 2.8 + b.x) * 0.12;
      }
    }
  }

  private updateTitleShowcase(t: number, dt: number) {
    this.titleOrbitAngle += dt * 0.18;
    // Gentle friendly wave on title screen
    this.world.avatar.root.position.set(0, 0, 5.2);
    this.world.avatar.root.rotation.y = Math.PI + Math.sin(t * 0.7) * 0.15;
    this.world.avatar.rightArmPivot.rotation.z = -2.3 + Math.sin(t * 5.0) * 0.25;
    this.world.avatar.leftArmPivot.rotation.z = 0.08;
    this.world.avatar.leftLegPivot.rotation.x = 0;
    this.world.avatar.rightLegPivot.rotation.x = 0;
  }

  private updatePlayer(dt: number, state: GameProgressState) {
    // Elapsed timer update at 1Hz
    this.elapsedPlaying += dt;
    const wholeSec = Math.floor(this.elapsedPlaying);
    if (wholeSec !== this.lastReportedSecond) {
      this.lastReportedSecond = wholeSec;
      this.callbacks.onElapsedTick(wholeSec);
    }

    // Camera Q/E keyboard orbit
    if (this.keysHeld.has('KeyQ')) this.camYaw += dt * 2.1;
    if (this.keysHeld.has('KeyC')) this.camYaw -= dt * 2.1;

    // Input vector relative to camera yaw
    let inX = this.virtualMoveX;
    let inZ = this.virtualMoveZ;
    if (this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft')) inX -= 1;
    if (this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight')) inX += 1;
    if (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp')) inZ -= 1;
    if (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown')) inZ += 1;

    const len = Math.hypot(inX, inZ);
    if (len > 1) {
      inX /= len;
      inZ /= len;
    }

    const moveSpeed = 6.2;
    const sinY = Math.sin(this.camYaw);
    const cosY = Math.cos(this.camYaw);
    const worldDirX = inX * cosY + inZ * sinY;
    const worldDirZ = -inX * sinY + inZ * cosY;

    const accel = this.grounded ? 18 : 10;
    this.vx = THREE.MathUtils.damp(this.vx, worldDirX * moveSpeed, accel, dt);
    this.vz = THREE.MathUtils.damp(this.vz, worldDirZ * moveSpeed, accel, dt);

    // Coyote time & buffered jump
    if (this.grounded) {
      this.coyoteTimer = 0.1;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
      if (this.coyoteTimer > 0) {
        this.vy = 7.4;
        this.grounded = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.squashX = 0.84;
        this.squashY = 1.2;
        soundManager.playJump();
      }
    }

    // Gravity
    this.vy -= 21 * dt;

    // Integrate position
    const nextX = this.px + this.vx * dt;
    const nextZ = this.pz + this.vz * dt;
    const clamped = clampPlayerToWorld(nextX, nextZ);
    this.px = clamped.x;
    this.pz = clamped.z;
    this.py += this.vy * dt;

    // Ground / platform collision
    const floorY = groundHeightAt(this.px, this.pz, this.py);
    if (this.py <= floorY) {
      if (!this.grounded && this.vy < -3.5) {
        this.squashX = 1.2;
        this.squashY = 0.8;
        soundManager.playLand();
      }
      this.py = floorY;
      this.vy = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }

    // Face movement direction smoothly
    const horizSpeed = Math.hypot(this.vx, this.vz);
    if (horizSpeed > 0.35) {
      const targetYaw = Math.atan2(-this.vx, -this.vz);
      let diff = targetYaw - this.playerYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.playerYaw += diff * (1 - Math.exp(-14 * dt));

      if (this.grounded) {
        this.walkDistance += horizSpeed * dt;
        if (this.walkDistance - this.lastFootstepDist > 1.35) {
          this.lastFootstepDist = this.walkDistance;
          soundManager.playFootstep();
        }
      }
    }

    // Gait-synced limb swing + squash & stretch damping
    this.squashX = THREE.MathUtils.damp(this.squashX, 1, 14, dt);
    this.squashY = THREE.MathUtils.damp(this.squashY, 1, 14, dt);

    const av = this.world.avatar;
    av.root.position.set(this.px, this.py, this.pz);
    av.root.rotation.y = this.playerYaw;
    av.bodyGroup.scale.set(this.squashX, this.squashY, this.squashX);
    av.shadowDisc.position.y = floorY - this.py + 0.025;

    const swingAmp = Math.min(1, horizSpeed / 5.5) * 0.72;
    const phase = this.walkDistance * 3.0;
    av.leftLegPivot.rotation.x = Math.sin(phase) * swingAmp;
    av.rightLegPivot.rotation.x = -Math.sin(phase) * swingAmp;
    av.leftArmPivot.rotation.x = -Math.sin(phase) * swingAmp * 0.85;
    av.rightArmPivot.rotation.x = Math.sin(phase) * swingAmp * 0.85;
    av.rightArmPivot.rotation.z = 0;
    av.leftArmPivot.rotation.z = 0;

    // Check bonus star pickups
    for (const star of BONUS_STARS) {
      if (state.collectedBonusStars.includes(star.id)) continue;
      const d = Math.hypot(this.px - star.x, this.pz - star.z);
      const dy = Math.abs(this.py + 0.8 - star.y);
      if (d < 1.15 && dy < 1.25) {
        soundManager.playStarCollect();
        this.triggerBurst(star.x, star.y, star.z, 0xfbbf24, 16);
        this.callbacks.onCollectBonusStar(star.id);
      }
    }

    // Check active station proximity
    const nearId = findNearestInteractableStation(this.px, this.pz, state);
    if (nearId !== this.lastNearStation) {
      this.lastNearStation = nearId;
      this.callbacks.onNearStationChange(nearId);
    }
  }

  private updateParticles(dt: number) {
    let anyDirty = false;
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      anyDirty = true;
      p.age += dt;
      if (p.age >= p.life) {
        p.active = false;
        _mat4.makeScale(0, 0, 0);
        this.particleMesh.setMatrixAt(i, _mat4);
        continue;
      }
      p.vy -= 11 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      const lifeRatio = 1 - p.age / p.life;
      const s = Math.max(0.01, lifeRatio * 1.15);
      _vec3.set(p.x, p.y, p.z);
      _scale.set(s, s, s);
      _quat.setFromAxisAngle(_vec3b.set(0, 1, 0), p.age * 6);
      _mat4.compose(_vec3, _quat, _scale);
      this.particleMesh.setMatrixAt(i, _mat4);
      _pColor.setHex(p.colorHex);
      this.particleMesh.setColorAt(i, _pColor);
    }
    if (anyDirty) {
      this.particleMesh.instanceMatrix.needsUpdate = true;
      if (this.particleMesh.instanceColor) {
        this.particleMesh.instanceColor.needsUpdate = true;
      }
    }
  }

  private updateCamera(dt: number, phase: GamePhase) {
    if (phase === 'title') {
      const radius = 12.6;
      const cx = Math.sin(this.titleOrbitAngle) * radius;
      const cz = Math.cos(this.titleOrbitAngle) * radius;
      _camPos.set(cx, 4.6, cz);
      this.camera.position.lerp(_camPos, 1 - Math.exp(-4 * dt));
      _camTarget.set(-2.6, 1.8, 2.0);
      this.camera.lookAt(_camTarget);
      return;
    }

    // Third-person Roblox chase camera with exponential damping
    const horizDist = Math.cos(this.camPitch) * this.camDist;
    const vertDist = Math.sin(this.camPitch) * this.camDist + 1.55;

    const desiredX = this.px + Math.sin(this.camYaw) * horizDist;
    const desiredY = this.py + vertDist;
    const desiredZ = this.pz + Math.cos(this.camYaw) * horizDist;

    _camPos.set(desiredX, desiredY, desiredZ);

    const k = 1 - Math.exp(-10 * dt);
    this.camera.position.lerp(_camPos, k);

    _camTarget.set(this.px, this.py + 1.55, this.pz);
    this.camera.lookAt(_camTarget);

    // Trauma camera shake
    if (this.trauma > 0.001) {
      const shake = this.trauma * this.trauma * 0.14;
      this.camera.rotation.z += (Math.random() * 2 - 1) * shake;
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
    }
  }

  public dispose() {
    this.disposed = true;
    if (this.isTimeoutId) {
      window.clearTimeout(this.frameId);
    } else {
      cancelAnimationFrame(this.frameId);
    }
    this.resizeObserver.disconnect();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    dom.removeEventListener('wheel', this.handleWheel);
    dom.removeEventListener('webglcontextlost', this.handleContextLost);

    for (const g of this.world.disposables.geometries) g.dispose();
    for (const m of this.world.disposables.materials) m.dispose();
    for (const t of this.world.disposables.textures) t.dispose();
    this.particleMesh.geometry.dispose();
    (this.particleMesh.material as THREE.Material).dispose();
    this.envRT.dispose();
    this.renderer.dispose();
    if (dom.parentElement === this.container) {
      this.container.removeChild(dom);
    }
  }
}
