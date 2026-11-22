/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AdabMissionModal } from './components/AdabMissionModal';
import { BadgesModal } from './components/BadgesModal';
import { CertificateModal } from './components/CertificateModal';
import { GameHud } from './components/GameHud';
import { PauseModal } from './components/PauseModal';
import { TitleScreen } from './components/TitleScreen';
import { soundManager } from './game/audio';
import { ADAB_MISSIONS } from './game/curriculum';
import {
  collectBonusStar,
  completeMission,
  createInitialGameState,
} from './game/gameLogic';
import { ThreeGameEngine } from './game/ThreeGameEngine';
import { AvatarStyle, GameProgressState, MissionId } from './game/types';

function shouldAutostart(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('autostart') === '1';
}

export default function App() {
  const [gameState, setGameState] = useState<GameProgressState>(() =>
    createInitialGameState({ phase: shouldAutostart() ? 'playing' : 'title' })
  );

  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<ThreeGameEngine | null>(null);
  const stateRef = useRef<GameProgressState>(gameState);
  stateRef.current = gameState;

  // Mirror phase to document.body.dataset.state for testability & shell hygiene
  useEffect(() => {
    document.body.dataset.state = gameState.phase;
  }, [gameState.phase]);

  // Auto-dismiss celebration toast
  useEffect(() => {
    if (!gameState.recentToast) return;
    const timer = window.setTimeout(() => {
      setGameState((prev) =>
        prev.recentToast?.id === gameState.recentToast?.id
          ? { ...prev, recentToast: null }
          : prev
      );
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [gameState.recentToast]);

  // Mount Three.js engine once
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const engine = new ThreeGameEngine(container, {
      getState: () => stateRef.current,
      onNearStationChange: (stationId) => {
        setGameState((prev) =>
          prev.nearStationId === stationId ? prev : { ...prev, nearStationId: stationId }
        );
      },
      onCollectBonusStar: (starId) => {
        setGameState((prev) => collectBonusStar(prev, starId));
      },
      onRequestInteract: (stationId) => {
        soundManager.playClick();
        engine.clearInputs();
        setGameState((prev) => ({
          ...prev,
          openMissionModalId: stationId,
        }));
      },
      onElapsedTick: (elapsedSeconds) => {
        setGameState((prev) => ({ ...prev, elapsedSeconds }));
      },
    });

    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleStartGame = useCallback(() => {
    soundManager.playClick();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    engineRef.current?.resetPlayerPosition();
    engineRef.current?.clearInputs();
    setGameState((prev) => ({
      ...createInitialGameState({
        phase: 'playing',
        studentName: prev.studentName,
        studentClass: prev.studentClass,
        avatarStyle: prev.avatarStyle,
        isMuted: prev.isMuted,
      }),
    }));
  }, []);

  const handleRestartGame = useCallback(() => {
    soundManager.playClick();
    soundManager.stopNarration();
    engineRef.current?.resetPlayerPosition();
    engineRef.current?.clearInputs();
    setGameState((prev) =>
      createInitialGameState({
        phase: 'playing',
        studentName: prev.studentName,
        studentClass: prev.studentClass,
        avatarStyle: prev.avatarStyle,
        isMuted: prev.isMuted,
      })
    );
  }, []);

  const handleBackToTitle = useCallback(() => {
    soundManager.playClick();
    soundManager.stopNarration();
    engineRef.current?.resetPlayerPosition();
    engineRef.current?.clearInputs();
    setGameState((prev) =>
      createInitialGameState({
        phase: 'title',
        studentName: prev.studentName,
        studentClass: prev.studentClass,
        avatarStyle: prev.avatarStyle,
        isMuted: prev.isMuted,
      })
    );
  }, []);

  const handleToggleMute = useCallback(() => {
    setGameState((prev) => {
      const nextMuted = !prev.isMuted;
      soundManager.setMuted(nextMuted);
      return { ...prev, isMuted: nextMuted };
    });
  }, []);

  const handlePauseToggle = useCallback(() => {
    soundManager.playClick();
    soundManager.stopNarration();
    engineRef.current?.clearInputs();
    setGameState((prev) => {
      if (prev.phase === 'playing') {
        return { ...prev, phase: 'paused', openMissionModalId: null, showBadgesModal: false };
      }
      if (prev.phase === 'paused') {
        return { ...prev, phase: 'playing' };
      }
      return prev;
    });
  }, []);

  const handleAvatarChange = useCallback((style: AvatarStyle) => {
    soundManager.playClick();
    engineRef.current?.setAvatarStyle(style);
    setGameState((prev) => ({ ...prev, avatarStyle: style }));
  }, []);

  const handleCompleteMission = useCallback((missionId: MissionId) => {
    soundManager.playMissionComplete();
    const mission = ADAB_MISSIONS.find((m) => m.id === missionId);
    if (mission) {
      engineRef.current?.triggerBurst(
        mission.stationPos.x,
        mission.stationPos.y + 1.0,
        mission.stationPos.z,
        0x10b981,
        24
      );
    }
    setGameState((prev) => completeMission(prev, missionId));
  }, []);

  // Global Keyboard Shortcuts (Title Enter/Space, Esc/P Pause, M Mute, B Badges, R Restart)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return;
      }

      const cur = stateRef.current;

      if (cur.phase === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleStartGame();
        }
        return;
      }

      if (cur.phase === 'gameover') {
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (cur.openMissionModalId) {
          soundManager.stopNarration();
          setGameState((prev) => ({ ...prev, openMissionModalId: null }));
        } else if (cur.showBadgesModal) {
          setGameState((prev) => ({ ...prev, showBadgesModal: false }));
        } else {
          handlePauseToggle();
        }
        return;
      }

      if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.code === 'KeyB' && cur.phase === 'playing' && !cur.openMissionModalId) {
        e.preventDefault();
        soundManager.playClick();
        setGameState((prev) => ({ ...prev, showBadgesModal: !prev.showBadgesModal }));
      } else if (e.code === 'KeyR' && cur.phase === 'playing' && !cur.openMissionModalId) {
        e.preventDefault();
        handleRestartGame();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePauseToggle, handleRestartGame, handleStartGame, handleToggleMute]);

  const activeOpenMission = gameState.openMissionModalId
    ? ADAB_MISSIONS.find((m) => m.id === gameState.openMissionModalId) ?? null
    : null;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#DCF2F8]">
      {/* Isolated WebGL 3D Canvas Container */}
      <div
        ref={canvasMountRef}
        data-testid="game-canvas"
        className="fixed inset-0 w-full h-full"
      />

      {/* Title Screen Overlay */}
      {gameState.phase === 'title' && (
        <TitleScreen
          studentName={gameState.studentName}
          studentClass={gameState.studentClass}
          avatarStyle={gameState.avatarStyle}
          onNameChange={(studentName) => setGameState((prev) => ({ ...prev, studentName }))}
          onClassChange={(studentClass) => setGameState((prev) => ({ ...prev, studentClass }))}
          onAvatarChange={handleAvatarChange}
          onStart={handleStartGame}
        />
      )}

      {/* Playing HUD */}
      {gameState.phase === 'playing' && (
        <GameHud
          state={gameState}
          onToggleMute={handleToggleMute}
          onPause={handlePauseToggle}
          onRestart={handleRestartGame}
          onOpenBadges={() => {
            soundManager.playClick();
            engineRef.current?.clearInputs();
            setGameState((prev) => ({ ...prev, showBadgesModal: true }));
          }}
          onInteractStation={(id) => {
            soundManager.playClick();
            engineRef.current?.clearInputs();
            setGameState((prev) => ({ ...prev, openMissionModalId: id }));
          }}
          onVirtualMove={(x, z) => engineRef.current?.setVirtualMove(x, z)}
          onVirtualJump={() => engineRef.current?.triggerVirtualJump()}
        />
      )}

      {/* Interactive Adab Step Mission Modal */}
      {gameState.phase === 'playing' && activeOpenMission && (
        <AdabMissionModal
          mission={activeOpenMission}
          onComplete={handleCompleteMission}
          onMistake={() =>
            setGameState((prev) => ({ ...prev, mistakesCount: prev.mistakesCount + 1 }))
          }
          onClose={() =>
            setGameState((prev) => ({ ...prev, openMissionModalId: null }))
          }
        />
      )}

      {/* Lencana Pencapaian Modal */}
      {gameState.phase === 'playing' && gameState.showBadgesModal && (
        <BadgesModal
          unlockedBadges={gameState.unlockedBadges}
          onClose={() =>
            setGameState((prev) => ({ ...prev, showBadgesModal: false }))
          }
        />
      )}

      {/* Pause Modal */}
      {gameState.phase === 'paused' && (
        <PauseModal
          starsEarned={gameState.starsEarned}
          completedCount={gameState.completedMissions.length}
          onResume={handlePauseToggle}
          onRestart={handleRestartGame}
          onBackToTitle={handleBackToTitle}
        />
      )}

      {/* Victory / Sijil Kejayaan Modal */}
      {gameState.phase === 'gameover' && (
        <CertificateModal
          state={gameState}
          onNameChange={(studentName) => setGameState((prev) => ({ ...prev, studentName }))}
          onClassChange={(studentClass) => setGameState((prev) => ({ ...prev, studentClass }))}
          onPlayAgain={handleRestartGame}
        />
      )}
    </main>
  );
}
