export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

export type AvatarStyle = 'lelaki' | 'perempuan';

export type MissionId =
  | 'basuh-sebelum'
  | 'duduk-doa'
  | 'tangan-kanan'
  | 'minum-adab'
  | 'doa-kemas'
  | 'basuh-selepas';

export type InteractiveKind =
  | 'wash-hands'
  | 'recite-doa-before'
  | 'choose-right-hand'
  | 'drink-three-sips'
  | 'clear-and-thanks'
  | 'wash-hands-after';

export interface StationPosition {
  x: number;
  y: number;
  z: number;
}

export interface AdabMission {
  id: MissionId;
  order: number;
  shortTitle: string;
  title: string;
  subtitle: string;
  stationName: string;
  stationPos: StationPosition;
  interactRadius: number;
  starsReward: number;
  badgeId: string;
  interactiveKind: InteractiveKind;
  arabicText?: string;
  rumiText?: string;
  meaningText?: string;
  audioNarration: string;
  stepTips: string[];
  accentHex: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  requiredMissionId: MissionId;
  accentColor: string;
}

export interface BonusStarDef {
  id: string;
  x: number;
  y: number;
  z: number;
  label: string;
}

export interface PlatformBox {
  id: string;
  x: number;
  y: number; // top surface Y
  z: number;
  width: number;
  depth: number;
  height: number;
}

export interface ObstacleBox {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  maxY: number;
}

export interface GameProgressState {
  phase: GamePhase;
  studentName: string;
  studentClass: string;
  avatarStyle: AvatarStyle;
  completedMissions: MissionId[];
  collectedBonusStars: string[];
  unlockedBadges: string[];
  activeMissionIndex: number;
  starsEarned: number;
  maxStars: number;
  elapsedSeconds: number;
  mistakesCount: number;
  nearStationId: MissionId | null;
  openMissionModalId: MissionId | null;
  showBadgesModal: boolean;
  isMuted: boolean;
  recentToast: {
    id: number;
    title: string;
    detail: string;
  } | null;
}
