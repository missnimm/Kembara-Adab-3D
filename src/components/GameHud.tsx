import React from 'react';
import { Award, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { ADAB_MISSIONS } from '../game/curriculum';
import { formatTimeMMSS, getActiveMission } from '../game/gameLogic';
import { GameProgressState, MissionId } from '../game/types';
import { GoldStarSvg } from './AdabIllustrations';

interface GameHudProps {
  state: GameProgressState;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onOpenBadges: () => void;
  onInteractStation: (id: MissionId) => void;
  onVirtualMove: (x: number, z: number) => void;
  onVirtualJump: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  state,
  onToggleMute,
  onPause,
  onRestart,
  onOpenBadges,
  onInteractStation,
  onVirtualMove,
  onVirtualJump,
}) => {
  const activeMission = getActiveMission(state);
  const nearMission = state.nearStationId
    ? ADAB_MISSIONS.find((m) => m.id === state.nearStationId) ?? null
    : null;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-3 sm:p-4 md:p-5">
      {/* Top Row: Left Mission/Star Cluster + Right Utility Controls */}
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        {/* Top-Left Cluster: Stars, Mission Counter, Active Objective */}
        <div
          className="pointer-events-auto rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 border border-amber-900/20 shadow-md min-w-0 max-w-[205px] sm:max-w-sm"
          style={{ backgroundColor: 'rgba(253, 250, 244, 0.92)' }}
        >
          <div className="flex items-center gap-2 sm:gap-3.5 mb-1">
            <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
              <GoldStarSvg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span
                className="font-mono-num text-base sm:text-xl font-bold text-amber-700"
                aria-label={`Bintang Emas ${state.starsEarned} daripada ${state.maxStars}`}
              >
                {state.starsEarned}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 font-mono-num whitespace-nowrap">
                /{state.maxStars}
              </span>
            </div>

            <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
              |
            </span>

            <div className="text-[11px] sm:text-xs font-semibold text-slate-700 font-mono-num whitespace-nowrap">
              Misi {Math.min(state.completedMissions.length + 1, ADAB_MISSIONS.length)}/{ADAB_MISSIONS.length}
              <span className="hidden sm:inline"> · {formatTimeMMSS(state.elapsedSeconds)}</span>
            </div>
          </div>

          {activeMission ? (
            <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-emerald-900 leading-snug truncate sm:whitespace-normal">
              {activeMission.order}. {activeMission.shortTitle} —{' '}
              <span className="font-normal text-slate-700">{activeMission.stationName}</span>
            </p>
          ) : (
            <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-emerald-900">
              Semua misi adab selesai!
            </p>
          )}
        </div>

        {/* Top-Right Cluster: Compact Icon Buttons (Mute, Badges, Pause, Restart) */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenBadges();
            }}
            aria-label={`Lencana Pencapaian (${state.unlockedBadges.length} daripada 6)`}
            className="flex items-center gap-1 px-2 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-amber-900/20 shadow-md text-[11px] sm:text-xs font-bold text-slate-900 hover:bg-amber-50 transition-colors cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: 'rgba(253, 250, 244, 0.92)' }}
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            <span className="font-mono-num">{state.unlockedBadges.length}/6</span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={state.isMuted ? 'Nyahsenyap Audio (M)' : 'Senyapkan Audio (M)'}
            className="p-2 sm:p-2.5 rounded-xl border border-amber-900/20 shadow-md text-slate-800 hover:bg-amber-50 transition-colors cursor-pointer"
            style={{ backgroundColor: 'rgba(253, 250, 244, 0.92)' }}
          >
            {state.isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            aria-label="Jeda Permainan (P / Esc)"
            className="p-2 sm:p-2.5 rounded-xl border border-amber-900/20 shadow-md text-slate-800 hover:bg-amber-50 transition-colors cursor-pointer"
            style={{ backgroundColor: 'rgba(253, 250, 244, 0.92)' }}
          >
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            aria-label="Mula Semula (R)"
            className="p-2 sm:p-2.5 rounded-xl border border-amber-900/20 shadow-md text-slate-800 hover:bg-amber-50 transition-colors cursor-pointer"
            style={{ backgroundColor: 'rgba(253, 250, 244, 0.92)' }}
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Toast Celebration Notification (Top-Center, non-blocking) */}
      {state.recentToast && (
        <div
          key={state.recentToast.id}
          className="self-center px-5 py-2.5 rounded-xl border border-amber-400 shadow-lg text-center"
          style={{ backgroundColor: 'rgba(6, 78, 59, 0.94)' }}
        >
          <p className="font-display text-sm md:text-base font-bold text-amber-300">
            {state.recentToast.title}
          </p>
          <p className="text-xs text-emerald-50">{state.recentToast.detail}</p>
        </div>
      )}

      {/* Bottom Area: Contextual Interact Prompt + Mobile Touch Controls */}
      <div className="flex items-end justify-between gap-4">
        {/* Touch D-Pad (shown on small screens / touch devices) */}
        <div className="md:hidden pointer-events-auto grid grid-cols-3 gap-1 w-32">
          <div />
          <button
            type="button"
            aria-label="Gerak Depan"
            onPointerDown={() => onVirtualMove(0, -1)}
            onPointerUp={() => onVirtualMove(0, 0)}
            onPointerLeave={() => onVirtualMove(0, 0)}
            className="h-11 rounded-lg bg-white/90 border border-slate-300 font-bold text-slate-800 active:bg-emerald-100"
          >
            ▲
          </button>
          <div />
          <button
            type="button"
            aria-label="Gerak Kiri"
            onPointerDown={() => onVirtualMove(-1, 0)}
            onPointerUp={() => onVirtualMove(0, 0)}
            onPointerLeave={() => onVirtualMove(0, 0)}
            className="h-11 rounded-lg bg-white/90 border border-slate-300 font-bold text-slate-800 active:bg-emerald-100"
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="Gerak Belakang"
            onPointerDown={() => onVirtualMove(0, 1)}
            onPointerUp={() => onVirtualMove(0, 0)}
            onPointerLeave={() => onVirtualMove(0, 0)}
            className="h-11 rounded-lg bg-white/90 border border-slate-300 font-bold text-slate-800 active:bg-emerald-100"
          >
            ▼
          </button>
          <button
            type="button"
            aria-label="Gerak Kanan"
            onPointerDown={() => onVirtualMove(1, 0)}
            onPointerUp={() => onVirtualMove(0, 0)}
            onPointerLeave={() => onVirtualMove(0, 0)}
            className="h-11 rounded-lg bg-white/90 border border-slate-300 font-bold text-slate-800 active:bg-emerald-100"
          >
            ▶
          </button>
        </div>

        {/* Center Contextual Station Prompt */}
        <div className="mx-auto pointer-events-auto">
          {nearMission && !state.openMissionModalId && (
            <button
              type="button"
              onClick={() => onInteractStation(nearMission.id)}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-display font-bold text-sm md:text-base shadow-lg border-2 border-amber-300 cursor-pointer whitespace-nowrap animate-float-slow"
            >
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-900 font-mono-num text-xs font-bold">
                E
              </span>
              <span>Laksanakan: {nearMission.shortTitle}</span>
            </button>
          )}
        </div>

        {/* Mobile Jump Button */}
        <div className="md:hidden pointer-events-auto">
          <button
            type="button"
            aria-label="Lompat"
            onPointerDown={onVirtualJump}
            className="px-4 h-12 rounded-xl bg-amber-400 border-2 border-amber-700 font-display font-bold text-slate-900 active:bg-amber-500"
          >
            Lompat
          </button>
        </div>
      </div>
    </div>
  );
};
