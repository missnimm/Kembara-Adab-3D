import {
  ACHIEVEMENT_BADGES,
  ADAB_MISSIONS,
  BONUS_STARS,
  MAX_TOTAL_STARS,
  WORLD_PLATFORMS,
} from './curriculum';
import {
  AdabMission,
  AvatarStyle,
  GamePhase,
  GameProgressState,
  MissionId,
  PlatformBox,
} from './types';

export const WORLD_BOUND_RADIUS = 13.5;

export function createInitialGameState(
  overrides?: Partial<Pick<GameProgressState, 'phase' | 'studentName' | 'studentClass' | 'avatarStyle' | 'isMuted'>>
): GameProgressState {
  return {
    phase: overrides?.phase ?? 'title',
    studentName: overrides?.studentName ?? 'Murid Cemerlang',
    studentClass: overrides?.studentClass ?? '2 Al-Farabi',
    avatarStyle: overrides?.avatarStyle ?? 'lelaki',
    completedMissions: [],
    collectedBonusStars: [],
    unlockedBadges: [],
    activeMissionIndex: 0,
    starsEarned: 0,
    maxStars: MAX_TOTAL_STARS,
    elapsedSeconds: 0,
    mistakesCount: 0,
    nearStationId: null,
    openMissionModalId: null,
    showBadgesModal: false,
    isMuted: overrides?.isMuted ?? false,
    recentToast: null,
  };
}

export function getActiveMission(state: GameProgressState): AdabMission | null {
  if (state.activeMissionIndex >= ADAB_MISSIONS.length) {
    return null;
  }
  return ADAB_MISSIONS[state.activeMissionIndex] ?? null;
}

export function isMissionUnlocked(state: GameProgressState, missionId: MissionId): boolean {
  const idx = ADAB_MISSIONS.findIndex((m) => m.id === missionId);
  if (idx === -1) return false;
  if (state.completedMissions.includes(missionId)) return true;
  return idx === state.activeMissionIndex;
}

export function canInteractWithStation(
  state: GameProgressState,
  stationId: MissionId
): boolean {
  const active = getActiveMission(state);
  return active !== null && active.id === stationId && !state.completedMissions.includes(stationId);
}

export function completeMission(
  state: GameProgressState,
  missionId: MissionId,
  toastId = Date.now()
): GameProgressState {
  const mission = ADAB_MISSIONS.find((m) => m.id === missionId);
  if (!mission) return state;

  // Must match active mission and not already completed
  if (state.completedMissions.includes(missionId)) {
    return {
      ...state,
      openMissionModalId: null,
    };
  }
  const active = getActiveMission(state);
  if (!active || active.id !== missionId) {
    return state;
  }

  const completedMissions = [...state.completedMissions, missionId];
  const unlockedBadges = state.unlockedBadges.includes(mission.badgeId)
    ? state.unlockedBadges
    : [...state.unlockedBadges, mission.badgeId];

  const nextIndex = Math.min(ADAB_MISSIONS.length, state.activeMissionIndex + 1);
  const allComplete = completedMissions.length >= ADAB_MISSIONS.length;
  const badge = ACHIEVEMENT_BADGES.find((b) => b.id === mission.badgeId);

  const starsEarned = calculateTotalStars(completedMissions, state.collectedBonusStars);
  const nextPhase: GamePhase = allComplete ? 'gameover' : state.phase;

  return {
    ...state,
    phase: nextPhase,
    completedMissions,
    unlockedBadges,
    activeMissionIndex: nextIndex,
    starsEarned,
    openMissionModalId: null,
    recentToast: {
      id: toastId,
      title: allComplete
        ? 'Tahniah! Semua Misi Adab Selesai!'
        : `Misi ${mission.order} Selesai! +${mission.starsReward} Bintang`,
      detail: badge ? `Lencana dibuka: ${badge.title}` : mission.shortTitle,
    },
  };
}

export function collectBonusStar(
  state: GameProgressState,
  bonusStarId: string,
  toastId = Date.now()
): GameProgressState {
  const star = BONUS_STARS.find((s) => s.id === bonusStarId);
  if (!star || state.collectedBonusStars.includes(bonusStarId)) {
    return state;
  }

  const collectedBonusStars = [...state.collectedBonusStars, bonusStarId];
  const starsEarned = calculateTotalStars(state.completedMissions, collectedBonusStars);

  return {
    ...state,
    collectedBonusStars,
    starsEarned,
    recentToast: {
      id: toastId,
      title: '+1 Bintang Emas Bonus!',
      detail: star.label,
    },
  };
}

export function calculateTotalStars(
  completedMissions: MissionId[],
  collectedBonusStars: string[]
): number {
  const missionStars = completedMissions.reduce((acc, id) => {
    const m = ADAB_MISSIONS.find((item) => item.id === id);
    return acc + (m ? m.starsReward : 0);
  }, 0);
  return missionStars + collectedBonusStars.length;
}

export function findNearestInteractableStation(
  playerX: number,
  playerZ: number,
  state: GameProgressState
): MissionId | null {
  const active = getActiveMission(state);
  if (!active) return null;

  const dx = playerX - active.stationPos.x;
  const dz = playerZ - active.stationPos.z;
  const distSq = dx * dx + dz * dz;
  if (distSq <= active.interactRadius * active.interactRadius) {
    return active.id;
  }
  return null;
}

export function groundHeightAt(
  x: number,
  z: number,
  currentY: number,
  platforms: PlatformBox[] = WORLD_PLATFORMS
): number {
  let highest = 0;
  for (const p of platforms) {
    const halfW = p.width * 0.5 + 0.28;
    const halfD = p.depth * 0.5 + 0.28;
    if (Math.abs(x - p.x) <= halfW && Math.abs(z - p.z) <= halfD) {
      // Only step onto platforms whose top is near or below feet (step-up tolerance 0.35m)
      if (currentY >= p.y - 0.35 && p.y > highest) {
        highest = p.y;
      }
    }
  }
  return highest;
}

export function clampPlayerToWorld(x: number, z: number): { x: number; z: number } {
  const clampedX = Math.max(-WORLD_BOUND_RADIUS, Math.min(WORLD_BOUND_RADIUS, x));
  const clampedZ = Math.max(-WORLD_BOUND_RADIUS, Math.min(WORLD_BOUND_RADIUS, z));
  return { x: clampedX, z: clampedZ };
}

export function formatTimeMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function computeMasteryGrade(starsEarned: number, maxStars: number, mistakes: number): {
  grade: string;
  title: string;
} {
  const ratio = maxStars > 0 ? starsEarned / maxStars : 0;
  if (ratio >= 0.9 && mistakes <= 1) {
    return { grade: 'Mumtaz (Cemerlang)', title: 'Teladan Adab Terbaik' };
  }
  if (ratio >= 0.75) {
    return { grade: 'Jayyid Jiddan (Sangat Baik)', title: 'Pengamal Adab Mulia' };
  }
  return { grade: 'Jayyid (Baik)', title: 'Murid Beradab' };
}

export function updateAvatarPreference(
  state: GameProgressState,
  avatarStyle: AvatarStyle
): GameProgressState {
  return { ...state, avatarStyle };
}
