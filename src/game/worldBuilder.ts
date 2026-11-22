import * as THREE from 'three';
import { ADAB_MISSIONS, BONUS_STARS, WORLD_PLATFORMS } from './curriculum';
import { AvatarStyle, MissionId } from './types';

export interface AvatarRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  shadowDisc: THREE.Mesh;
  songkokMesh: THREE.Group;
  tudungMesh: THREE.Group;
}

export interface StationVisual {
  missionId: MissionId;
  group: THREE.Group;
  beaconRing: THREE.Mesh;
  beaconArrow: THREE.Mesh;
  animatedParts: THREE.Object3D[];
}

export interface BonusStarVisual {
  id: string;
  group: THREE.Group;
  starMesh: THREE.Mesh;
  shadowDisc: THREE.Mesh;
  baseY: number;
}

export interface BuiltWorld {
  avatar: AvatarRig;
  stations: Map<MissionId, StationVisual>;
  bonusStars: Map<string, BonusStarVisual>;
  collidables: THREE.Object3D[];
  swayingTrees: THREE.Group[];
  disposables: {
    geometries: THREE.BufferGeometry[];
    materials: THREE.Material[];
    textures: THREE.Texture[];
  };
}

function createCanvasTexture(
  size: number,
  drawFn: (ctx: CanvasRenderingContext2D, size: number) => void,
  repeatX = 1,
  repeatY = 1,
  anisotropy = 4,
  isColor = true
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawFn(ctx, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  return tex;
}

export function createSoftShadowTexture(): THREE.CanvasTexture {
  return createCanvasTexture(
    128,
    (ctx, s) => {
      const grad = ctx.createRadialGradient(s / 2, s / 2, s * 0.08, s / 2, s / 2, s * 0.48);
      grad.addColorStop(0, 'rgba(15, 28, 20, 0.55)');
      grad.addColorStop(0.55, 'rgba(15, 28, 20, 0.24)');
      grad.addColorStop(1, 'rgba(15, 28, 20, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, s, s);
    },
    1,
    1,
    1,
    true
  );
}

export function createCourtyardTileTexture(anisotropy: number): THREE.CanvasTexture {
  return createCanvasTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = '#EFE6D5';
      ctx.fillRect(0, 0, s, s);

      const tile = s / 4;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const alt = (r + c) % 2 === 0;
          ctx.fillStyle = alt ? '#F4ECE0' : '#E7DAC4';
          ctx.fillRect(c * tile + 2, r * tile + 2, tile - 4, tile - 4);
          ctx.strokeStyle = 'rgba(138, 114, 82, 0.22)';
          ctx.lineWidth = 2;
          ctx.strokeRect(c * tile + 4, r * tile + 4, tile - 8, tile - 8);
        }
      }
    },
    6,
    6,
    anisotropy,
    true
  );
}

export function createWoodTexture(anisotropy: number): THREE.CanvasTexture {
  return createCanvasTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = '#9C6639';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 42; i++) {
        const y = (i / 42) * s;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(65, 38, 16, 0.14)' : 'rgba(222, 178, 128, 0.12)';
        ctx.fillRect(0, y, s, 4);
      }
    },
    2,
    2,
    anisotropy,
    true
  );
}

export function createMengkuangMatTexture(anisotropy: number): THREE.CanvasTexture {
  return createCanvasTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = '#D9B675';
      ctx.fillRect(0, 0, s, s);
      const step = 16;
      for (let y = 0; y < s; y += step) {
        for (let x = 0; x < s; x += step) {
          const even = ((x + y) / step) % 2 === 0;
          ctx.fillStyle = even ? '#E4C78D' : '#C79F5B';
          ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
        }
      }
      // Decorative emerald border band
      ctx.strokeStyle = '#0F766E';
      ctx.lineWidth = 14;
      ctx.strokeRect(10, 10, s - 20, s - 20);
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 4;
      ctx.strokeRect(22, 22, s - 44, s - 44);
    },
    1,
    1,
    anisotropy,
    true
  );
}

export function createGrassTexture(anisotropy: number): THREE.CanvasTexture {
  return createCanvasTexture(
    256,
    (ctx, s) => {
      ctx.fillStyle = '#73B358';
      ctx.fillRect(0, 0, s, s);
      for (let i = 0; i < 240; i++) {
        const x = (Math.sin(i * 19.7) * 0.5 + 0.5) * s;
        const y = (Math.cos(i * 31.3) * 0.5 + 0.5) * s;
        ctx.fillStyle = i % 3 === 0 ? '#5FA046' : '#85C569';
        ctx.fillRect(x, y, 6, 4);
      }
    },
    14,
    14,
    anisotropy,
    true
  );
}

function createStarShape(outerR = 0.42, innerR = 0.2): THREE.Shape {
  const shape = new THREE.Shape();
  const points = 5;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

export function buildGameWorld(
  scene: THREE.Scene,
  maxAnisotropy: number,
  initialAvatarStyle: AvatarStyle
): BuiltWorld {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const collidables: THREE.Object3D[] = [];
  const swayingTrees: THREE.Group[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    textures.push(t);
    return t;
  };

  const shadowTex = trackTex(createSoftShadowTexture());
  const tileTex = trackTex(createCourtyardTileTexture(maxAnisotropy));
  const woodTex = trackTex(createWoodTexture(maxAnisotropy));
  const matTex = trackTex(createMengkuangMatTexture(maxAnisotropy));
  const grassTex = trackTex(createGrassTexture(maxAnisotropy));

  const shadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    })
  );

  // 1. Extended Outdoor Meadow Terrain (never a boxed void)
  const meadowGeo = trackGeo(new THREE.PlaneGeometry(110, 110, 20, 20));
  meadowGeo.rotateX(-Math.PI / 2);
  const posAttr = meadowGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const dist = Math.hypot(x, z);
    if (dist > 18) {
      const hill = Math.sin(x * 0.14) * Math.cos(z * 0.14) * 1.4 + (dist - 18) * 0.08;
      posAttr.setY(i, Math.max(0, hill));
    }
  }
  meadowGeo.computeVertexNormals();
  const meadowMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
    })
  );
  const meadow = new THREE.Mesh(meadowGeo, meadowMat);
  meadow.receiveShadow = true;
  meadow.position.y = -0.02;
  scene.add(meadow);

  // 2. Paved Courtyard Plaza (offset +0.02 above meadow so zero Z-fighting)
  const plazaGeo = trackGeo(new THREE.BoxGeometry(20, 0.08, 22));
  const plazaMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: tileTex,
      color: 0xffffff,
      roughness: 0.65,
      metalness: 0.04,
    })
  );
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.set(0, -0.02, 0.5);
  plaza.receiveShadow = true;
  scene.add(plaza);

  // Courtyard warm stone trim border
  const borderMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xb08968, roughness: 0.75, metalness: 0.05 })
  );
  const northTrim = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(20.6, 0.14, 0.45)), borderMat);
  northTrim.position.set(0, 0.03, -10.5);
  northTrim.receiveShadow = true;
  scene.add(northTrim);

  // 3. Walkable Platforms (Central Pavilion Plinth & Roblox Stepping Stones)
  const woodMat = trackMat(
    new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0xffffff,
      roughness: 0.68,
      metalness: 0.05,
    })
  );
  const stoneMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xb8a99a, roughness: 0.78, metalness: 0.02 })
  );
  const stoneCapMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5, metalness: 0.08 })
  );

  for (const plat of WORLD_PLATFORMS) {
    if (plat.id === 'pavilion-base') {
      const baseMesh = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(plat.width, plat.height, plat.depth)),
        trackMat(new THREE.MeshStandardMaterial({ color: 0xe6ccb2, roughness: 0.72, metalness: 0.04 }))
      );
      baseMesh.position.set(plat.x, plat.height / 2, plat.z);
      baseMesh.receiveShadow = true;
      baseMesh.castShadow = true;
      scene.add(baseMesh);
    } else {
      const stoneGroup = new THREE.Group();
      const pillar = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(plat.width, plat.height - 0.08, plat.depth)),
        stoneMat
      );
      pillar.position.y = (plat.height - 0.08) / 2;
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      const cap = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(plat.width + 0.12, 0.1, plat.depth + 0.12)),
        stoneCapMat
      );
      cap.position.y = plat.height - 0.05;
      cap.castShadow = true;
      cap.receiveShadow = true;
      stoneGroup.add(pillar, cap);
      stoneGroup.position.set(plat.x, 0, plat.z);
      scene.add(stoneGroup);
    }
  }

  // 4. Composite Central Dining Pavilion (Astaka Makan Utama - 10+ parts)
  const pavilion = new THREE.Group();
  pavilion.position.set(0, 0.25, 0);

  // Woven Tikar Mengkuang mat (+0.025 Y offset to prevent Z-fighting)
  const matMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(4.4, 0.03, 4.4)),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: matTex,
        color: 0xffffff,
        roughness: 0.85,
        metalness: 0.0,
      })
    )
  );
  matMesh.position.y = 0.02;
  matMesh.receiveShadow = true;
  pavilion.add(matMesh);

  // 4 carved wooden corner pillars + stone bases + capitals
  const pillarOffsets = [
    [-2.7, -2.7],
    [2.7, -2.7],
    [-2.7, 2.7],
    [2.7, 2.7],
  ];
  const pillarGeo = trackGeo(new THREE.CylinderGeometry(0.16, 0.19, 3.2, 12));
  const capGeo = trackGeo(new THREE.BoxGeometry(0.46, 0.2, 0.46));
  const pillarBaseGeo = trackGeo(new THREE.BoxGeometry(0.48, 0.22, 0.48));
  for (const [px, pz] of pillarOffsets) {
    const pBase = new THREE.Mesh(pillarBaseGeo, borderMat);
    pBase.position.set(px, 0.11, pz);
    pBase.castShadow = true;
    const pShaft = new THREE.Mesh(pillarGeo, woodMat);
    pShaft.position.set(px, 1.72, pz);
    pShaft.castShadow = true;
    const pCap = new THREE.Mesh(capGeo, woodMat);
    pCap.position.set(px, 3.35, pz);
    pavilion.add(pBase, pShaft, pCap);
    collidables.push(pShaft);
  }

  // Tiered Malaysian-Islamic Pavilion Roof
  const roofLowerMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.45, metalness: 0.12 })
  );
  const roofTrimMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.78 })
  );
  const roofBase = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(4.5, 1.25, 4)),
    roofLowerMat
  );
  roofBase.rotation.y = Math.PI / 4;
  roofBase.position.y = 3.98;
  roofBase.castShadow = true;

  const roofUpper = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(2.3, 0.9, 4)),
    roofLowerMat
  );
  roofUpper.rotation.y = Math.PI / 4;
  roofUpper.position.y = 4.78;
  roofUpper.castShadow = true;

  // Golden Finial Dome (Kubah Kecil)
  const finialDome = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.28, 16, 12)),
    roofTrimMat
  );
  finialDome.position.y = 5.32;
  const finialSpire = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.03, 0.06, 0.45, 8)),
    roofTrimMat
  );
  finialSpire.position.y = 5.65;
  pavilion.add(roofBase, roofUpper, finialDome, finialSpire);

  // Hanging Brass Lantern inside pavilion
  const lanternChain = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 6)),
    roofTrimMat
  );
  lanternChain.position.y = 3.15;
  const lanternBody = new THREE.Mesh(
    trackGeo(new THREE.OctahedronGeometry(0.24, 0)),
    trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.65,
        roughness: 0.25,
      })
    )
  );
  lanternBody.position.y = 2.68;
  pavilion.add(lanternChain, lanternBody);

  // Low Wooden Dining Table + Cushions + Tudung Saji
  const lowTableTop = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.1, 0.1, 1.4)),
    woodMat
  );
  lowTableTop.position.y = 0.44;
  lowTableTop.castShadow = true;
  lowTableTop.receiveShadow = true;
  pavilion.add(lowTableTop);

  const tableLegGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.4, 0.14));
  for (const [lx, lz] of [
    [-0.85, -0.52],
    [0.85, -0.52],
    [-0.85, 0.52],
    [0.85, 0.52],
  ]) {
    const leg = new THREE.Mesh(tableLegGeo, woodMat);
    leg.position.set(lx, 0.2, lz);
    pavilion.add(leg);
  }

  // Tudung saji dome & plates on low table
  const tudungSaji = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.42, 0.28, 12)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.55, metalness: 0.08 }))
  );
  tudungSaji.position.set(0, 0.63, 0);
  const plateMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22, metalness: 0.05 }));
  const plateGeo = trackGeo(new THREE.CylinderGeometry(0.2, 0.16, 0.04, 14));
  for (const [px, pz] of [
    [-0.62, 0.28],
    [0.62, 0.28],
    [-0.62, -0.28],
    [0.62, -0.28],
  ]) {
    const p = new THREE.Mesh(plateGeo, plateMat);
    p.position.set(px, 0.51, pz);
    pavilion.add(p);
  }
  pavilion.add(tudungSaji);

  // 4 Seating Cushions around table
  const cushionMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.85, metalness: 0.0 })
  );
  const cushionGeo = trackGeo(new THREE.BoxGeometry(0.65, 0.12, 0.65));
  for (const [cx, cz] of [
    [-0.62, 1.15],
    [0.62, 1.15],
    [-0.62, -1.15],
    [0.62, -1.15],
  ]) {
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.position.set(cx, 0.09, cz);
    cushion.castShadow = true;
    pavilion.add(cushion);
  }

  scene.add(pavilion);

  // 5. Build All 6 Interactive Adab Stations (Composite 3-12 Part Groups)
  const stations = new Map<MissionId, StationVisual>();
  const beaconMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    })
  );
  const ceramicMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.05 })
  );
  const brassMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.88 })
  );
  const waterMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.78,
      roughness: 0.1,
      metalness: 0.1,
    })
  );

  for (const mission of ADAB_MISSIONS) {
    const stGroup = new THREE.Group();
    stGroup.position.set(mission.stationPos.x, mission.stationPos.y, mission.stationPos.z);

    const animatedParts: THREE.Object3D[] = [];

    if (mission.interactiveKind === 'wash-hands' || mission.interactiveKind === 'wash-hands-after') {
      // Composite Sink Station (6 parts)
      const pedestal = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.95, 0.9, 0.75)), stoneMat);
      pedestal.position.y = 0.45;
      pedestal.castShadow = true;
      const basin = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.15, 0.26, 0.88)), ceramicMat);
      basin.position.y = 0.98;
      basin.castShadow = true;
      const faucetPipe = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.05, 0.06, 0.48, 10)), brassMat);
      faucetPipe.position.set(0, 1.28, -0.28);
      const faucetSpout = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.09, 0.08, 0.28)), brassMat);
      faucetSpout.position.set(0, 1.48, -0.16);
      const soapBottle = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.09, 0.1, 0.28, 10)),
        trackMat(new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.35 }))
      );
      soapBottle.position.set(0.36, 1.24, -0.18);
      const waterStream = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.03, 0.04, 0.36, 8)), waterMat);
      waterStream.position.set(0, 1.26, -0.05);
      animatedParts.push(waterStream);

      const shadow = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(0.95, 20)), shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.025;
      stGroup.add(pedestal, basin, faucetPipe, faucetSpout, soapBottle, waterStream, shadow);
      collidables.push(pedestal);
    } else if (mission.interactiveKind === 'choose-right-hand') {
      // Food Buffet Table (7 parts)
      const tableTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.0, 0.12, 1.1)), woodMat);
      tableTop.position.y = 0.88;
      tableTop.castShadow = true;
      const legGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.85, 0.14));
      for (const [lx, lz] of [
        [-0.82, -0.4],
        [0.82, -0.4],
        [-0.82, 0.4],
        [0.82, 0.4],
      ]) {
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(lx, 0.42, lz);
        leg.castShadow = true;
        stGroup.add(leg);
      }
      const dish1 = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.24, 0.2, 0.06, 14)), ceramicMat);
      dish1.position.set(-0.5, 0.96, 0.1);
      const dish2 = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.24, 0.2, 0.06, 14)), ceramicMat);
      dish2.position.set(0.5, 0.96, 0.1);
      const riceDome = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5)),
        trackMat(new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.7 }))
      );
      riceDome.position.set(-0.5, 0.98, 0.1);
      const kuihBox = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.22, 0.12, 0.22)),
        trackMat(new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 }))
      );
      kuihBox.position.set(0.5, 1.04, 0.1);
      animatedParts.push(kuihBox);

      const shadow = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(1.25, 20)), shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.025;
      stGroup.add(tableTop, dish1, dish2, riceDome, kuihBox, shadow);
      collidables.push(tableTop);
    } else if (mission.interactiveKind === 'drink-three-sips') {
      // Drink Table with Jug & Cups (6 parts)
      const tableBase = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.68, 0.76, 0.85, 12)), woodMat);
      tableBase.position.y = 0.42;
      tableBase.castShadow = true;
      const tray = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.58, 0.52, 0.06, 16)), brassMat);
      tray.position.y = 0.88;
      const teapot = new THREE.Mesh(trackGeo(new THREE.LatheGeometry([
        new THREE.Vector2(0.0, 0),
        new THREE.Vector2(0.18, 0),
        new THREE.Vector2(0.22, 0.16),
        new THREE.Vector2(0.12, 0.34),
        new THREE.Vector2(0.14, 0.4),
        new THREE.Vector2(0.0, 0.42),
      ], 14)), ceramicMat);
      teapot.position.set(-0.15, 0.91, 0);
      const cup1 = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.09, 0.07, 0.16, 12)), waterMat);
      cup1.position.set(0.24, 0.99, 0.14);
      const steamOrb = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(0.08, 10, 8)),
        trackMat(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 }))
      );
      steamOrb.position.set(0.24, 1.25, 0.14);
      animatedParts.push(steamOrb);

      const shadow = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(0.95, 20)), shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.025;
      stGroup.add(tableBase, tray, teapot, cup1, steamOrb, shadow);
      collidables.push(tableBase);
    } else if (mission.interactiveKind === 'clear-and-thanks') {
      // Cleanup & Gratitude Rack (6 parts)
      const counter = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.8, 0.92, 0.85)), woodMat);
      counter.position.y = 0.46;
      counter.castShadow = true;
      const cleanTray = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.85, 0.08, 0.55)),
        trackMat(new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.45 }))
      );
      cleanTray.position.set(-0.35, 0.96, 0);
      const stackPlate = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 14)), ceramicMat);
      stackPlate.position.set(-0.35, 1.06, 0);
      const plaqueStand = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.65, 0.48, 0.08)), brassMat);
      plaqueStand.position.set(0.45, 1.16, -0.15);
      animatedParts.push(plaqueStand);

      const shadow = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(1.15, 20)), shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.025;
      stGroup.add(counter, cleanTray, stackPlate, plaqueStand, shadow);
      collidables.push(counter);
    }

    // Active Mission Beacon Ring + Floating Diamond Indicator
    const beaconRing = new THREE.Mesh(
      trackGeo(new THREE.RingGeometry(1.35, 1.65, 28)),
      beaconMat
    );
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.y = 0.045;
    beaconRing.visible = mission.order === 1;

    const beaconArrow = new THREE.Mesh(
      trackGeo(new THREE.OctahedronGeometry(0.32, 0)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(mission.accentHex),
          emissive: new THREE.Color(mission.accentHex),
          emissiveIntensity: 0.45,
          roughness: 0.2,
          metalness: 0.35,
        })
      )
    );
    beaconArrow.position.set(0, mission.id === 'duduk-doa' ? 1.85 : 2.25, 0);
    beaconArrow.visible = mission.order === 1;

    stGroup.add(beaconRing, beaconArrow);
    scene.add(stGroup);

    stations.set(mission.id, {
      missionId: mission.id,
      group: stGroup,
      beaconRing,
      beaconArrow,
      animatedParts,
    });
  }

  // 6. Floating 3D Collectible Golden Stars (ExtrudeGeometry + Bevel)
  const bonusStars = new Map<string, BonusStarVisual>();
  const starShape = createStarShape(0.42, 0.2);
  const starGeo = trackGeo(
    new THREE.ExtrudeGeometry(starShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 2,
    })
  );
  starGeo.center();
  const goldStarMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.25,
      roughness: 0.18,
      metalness: 0.88,
    })
  );

  for (const b of BONUS_STARS) {
    const g = new THREE.Group();
    g.position.set(b.x, b.y, b.z);
    const mesh = new THREE.Mesh(starGeo, goldStarMat);
    mesh.castShadow = true;

    const shadow = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(0.42, 14)), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -b.y + 0.03;

    g.add(mesh, shadow);
    scene.add(g);
    bonusStars.set(b.id, { id: b.id, group: g, starMesh: mesh, shadowDisc: shadow, baseY: b.y });
  }

  // 7. Garden Trees, Stone Lanterns, Perimeter Fence & Instanced Flowers
  const trunkMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x7c4d2b, roughness: 0.88 }));
  const leafMat1 = trackMat(new THREE.MeshStandardMaterial({ color: 0x2e8b57, roughness: 0.78 }));
  const leafMat2 = trackMat(new THREE.MeshStandardMaterial({ color: 0x3cb371, roughness: 0.72 }));

  const treePositions: [number, number, number][] = [
    [-12.5, -11.0, 1.15],
    [-13.5, -3.5, 0.95],
    [-13.0, 5.5, 1.1],
    [-11.5, 12.0, 1.0],
    [12.5, -11.0, 1.1],
    [13.5, -3.5, 1.05],
    [13.0, 5.5, 0.95],
    [11.5, 12.0, 1.15],
    [-6.0, -13.0, 1.2],
    [6.0, -13.0, 1.1],
    [0.0, -14.5, 1.25],
  ];

  const trunkGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.34, 2.1, 8));
  const crown1Geo = trackGeo(new THREE.DodecahedronGeometry(1.25, 0));
  const crown2Geo = trackGeo(new THREE.DodecahedronGeometry(0.95, 0));
  const crown3Geo = trackGeo(new THREE.DodecahedronGeometry(0.7, 0));

  for (const [tx, tz, scale] of treePositions) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.05;
    trunk.castShadow = true;

    const canopy = new THREE.Group();
    canopy.position.y = 2.4;
    const c1 = new THREE.Mesh(crown1Geo, leafMat1);
    c1.castShadow = true;
    const c2 = new THREE.Mesh(crown2Geo, leafMat2);
    c2.position.set(0.45, 0.75, 0.25);
    c2.castShadow = true;
    const c3 = new THREE.Mesh(crown3Geo, leafMat1);
    c3.position.set(-0.4, 0.95, -0.2);
    canopy.add(c1, c2, c3);
    swayingTrees.push(canopy);

    tree.add(trunk, canopy);
    tree.position.set(tx, 0, tz);
    tree.scale.setScalar(scale);
    scene.add(tree);
  }

  // Decorative Low Courtyard Garden Fence Posts around outer edges
  const fenceGeo = trackGeo(new THREE.BoxGeometry(0.18, 0.75, 0.18));
  const railGeo = trackGeo(new THREE.BoxGeometry(2.6, 0.1, 0.1));
  for (let i = -4; i <= 4; i++) {
    if (Math.abs(i) <= 1) continue; // open front gateway
    const post = new THREE.Mesh(fenceGeo, woodMat);
    post.position.set(i * 2.6, 0.37, 13.8);
    post.castShadow = true;
    scene.add(post);
    if (i < 4 && i !== -2) {
      const rail = new THREE.Mesh(railGeo, woodMat);
      rail.position.set(i * 2.6 + 1.3, 0.52, 13.8);
      scene.add(rail);
    }
  }

  // Instanced Garden Flowers (40 instances) for lively color without draw calls
  const flowerGeo = trackGeo(new THREE.DodecahedronGeometry(0.16, 0));
  const flowerMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
  const flowerCount = 40;
  const flowerInst = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
  const dummy = new THREE.Object3D();
  const fColor = new THREE.Color();
  const palette = [0xf43f5e, 0xfbbf24, 0x38bdf8, 0xa855f7];
  for (let i = 0; i < flowerCount; i++) {
    const angle = (i / flowerCount) * Math.PI * 2;
    const radius = 11.2 + (i % 3) * 1.4;
    dummy.position.set(Math.cos(angle) * radius, 0.14, Math.sin(angle) * radius);
    const s = 0.85 + (i % 4) * 0.12;
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    flowerInst.setMatrixAt(i, dummy.matrix);
    fColor.setHex(palette[i % palette.length]);
    flowerInst.setColorAt(i, fColor);
  }
  flowerInst.instanceMatrix.needsUpdate = true;
  if (flowerInst.instanceColor) flowerInst.instanceColor.needsUpdate = true;
  flowerInst.computeBoundingSphere();
  scene.add(flowerInst);

  // 8. Build Roblox-Style Student Avatar (Composite 12-Part Articulated Character)
  const avatar = createStudentAvatar(
    initialAvatarStyle,
    shadowMat,
    trackGeo,
    trackMat
  );
  avatar.root.position.set(0, 0, 9.5);
  scene.add(avatar.root);

  return {
    avatar,
    stations,
    bonusStars,
    collidables,
    swayingTrees,
    disposables: { geometries, materials, textures },
  };
}

function createStudentAvatar(
  style: AvatarStyle,
  shadowMat: THREE.Material,
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
  trackMat: <T extends THREE.Material>(m: T) => T
): AvatarRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const skinMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xf3c6a5, roughness: 0.65 }));
  const shirtMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.55 }));
  const sampingMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }));
  const pantsMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.72 }));
  const shoeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45 }));
  const eyeMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
  const bagMat = trackMat(new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }));

  // Contact shadow disc grounded at y=0.02
  const shadowDisc = new THREE.Mesh(trackGeo(new THREE.CircleGeometry(0.55, 18)), shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.02;
  root.add(shadowDisc);

  // Legs (pivot at hip y = 0.65)
  const legGeo = trackGeo(new THREE.BoxGeometry(0.26, 0.54, 0.28));
  const shoeGeo = trackGeo(new THREE.BoxGeometry(0.28, 0.14, 0.34));

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.17, 0.65, 0);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.y = -0.27;
  leftLeg.castShadow = true;
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(0, -0.58, 0.03);
  leftShoe.castShadow = true;
  leftLegPivot.add(leftLeg, leftShoe);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.17, 0.65, 0);
  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.y = -0.27;
  rightLeg.castShadow = true;
  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0, -0.58, 0.03);
  rightShoe.castShadow = true;
  rightLegPivot.add(rightLeg, rightShoe);

  bodyGroup.add(leftLegPivot, rightLegPivot);

  // Torso (Baju Melayu / Baju Kurung + Samping)
  const torso = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.66, 0.68, 0.38)), shirtMat);
  torso.position.y = 0.99;
  torso.castShadow = true;

  const samping = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.69, 0.24, 0.41)), sampingMat);
  samping.position.y = 0.76;
  samping.castShadow = true;

  // Backpack
  const satchel = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.46, 0.48, 0.22)), bagMat);
  satchel.position.set(0, 1.0, 0.28);
  satchel.castShadow = true;
  bodyGroup.add(torso, samping, satchel);

  // Arms (pivot at shoulder y = 1.28)
  const sleeveGeo = trackGeo(new THREE.BoxGeometry(0.22, 0.4, 0.24));
  const handGeo = trackGeo(new THREE.BoxGeometry(0.2, 0.18, 0.22));

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.46, 1.28, 0);
  const leftSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  leftSleeve.position.y = -0.18;
  leftSleeve.castShadow = true;
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.y = -0.44;
  leftArmPivot.add(leftSleeve, leftHand);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.46, 1.28, 0);
  const rightSleeve = new THREE.Mesh(sleeveGeo, shirtMat);
  rightSleeve.position.y = -0.18;
  rightSleeve.castShadow = true;
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.y = -0.44;
  rightArmPivot.add(rightSleeve, rightHand);

  bodyGroup.add(leftArmPivot, rightArmPivot);

  // Head + Eyes + Songkok / Tudung (Roblox blocky rounded vibe)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.58, 0);

  const headMesh = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.52, 0.5, 0.5)), skinMat);
  headMesh.castShadow = true;

  // Eyes facing -Z (forward direction)
  const eyeGeo = trackGeo(new THREE.BoxGeometry(0.08, 0.1, 0.04));
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.11, 0.04, -0.255);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.11, 0.04, -0.255);

  const smile = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.18, 0.04, 0.04)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 }))
  );
  smile.position.set(0, -0.1, -0.255);

  // Songkok (Boy)
  const songkokMesh = new THREE.Group();
  const songkokBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.54, 0.22, 0.52)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 }))
  );
  songkokBody.position.y = 0.28;
  songkokBody.castShadow = true;
  const songkokBand = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(0.55, 0.05, 0.53)),
    sampingMat
  );
  songkokBand.position.y = 0.2;
  songkokMesh.add(songkokBody, songkokBand);
  songkokMesh.visible = style === 'lelaki';

  // Tudung (Girl)
  const tudungMesh = new THREE.Group();
  const tudungMat = trackMat(new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.65 }));
  const tudungTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.58, 0.18, 0.56)), tudungMat);
  tudungTop.position.set(0, 0.24, 0.02);
  const tudungBack = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.58, 0.54, 0.26)), tudungMat);
  tudungBack.position.set(0, -0.02, 0.18);
  const tudungSideL = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.1, 0.48, 0.48)), tudungMat);
  tudungSideL.position.set(-0.26, -0.02, 0.02);
  const tudungSideR = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.1, 0.48, 0.48)), tudungMat);
  tudungSideR.position.set(0.26, -0.02, 0.02);
  tudungMesh.add(tudungTop, tudungBack, tudungSideL, tudungSideR);
  tudungMesh.visible = style === 'perempuan';

  headGroup.add(headMesh, leftEye, rightEye, smile, songkokMesh, tudungMesh);
  bodyGroup.add(headGroup);

  return {
    root,
    bodyGroup,
    headGroup,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    shadowDisc,
    songkokMesh,
    tudungMesh,
  };
}
