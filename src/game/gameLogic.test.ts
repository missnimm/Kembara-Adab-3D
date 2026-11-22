import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTotalStars,
  canInteractWithStation,
  clampPlayerToWorld,
  collectBonusStar,
  completeMission,
  computeMasteryGrade,
  createInitialGameState,
  findNearestInteractableStation,
  formatTimeMMSS,
  getActiveMission,
  groundHeightAt,
  isMissionUnlocked,
  WORLD_BOUND_RADIUS,
} from './gameLogic';
import { ADAB_MISSIONS, BONUS_STARS, MAX_TOTAL_STARS } from './curriculum';

test('initial state starts in title phase with 0 stars and mission 1 active', () => {
  const state = createInitialGameState();
  assert.equal(state.phase, 'title');
  assert.equal(state.starsEarned, 0);
  assert.equal(state.maxStars, MAX_TOTAL_STARS);
  assert.equal(state.activeMissionIndex, 0);
  assert.equal(getActiveMission(state)?.id, 'basuh-sebelum');
  assert.equal(isMissionUnlocked(state, 'basuh-sebelum'), true);
  assert.equal(isMissionUnlocked(state, 'duduk-doa'), false);
});

test('missions must be completed in order and award stars and badges', () => {
  let state = createInitialGameState({ phase: 'playing' });

  // Attempting to skip to mission 2 should be ignored
  const skipped = completeMission(state, 'duduk-doa', 1);
  assert.equal(skipped.completedMissions.length, 0);
  assert.equal(skipped.starsEarned, 0);

  // Completing mission 1 unlocks mission 2 and awards 3 stars + badge
  state = completeMission(state, 'basuh-sebelum', 2);
  assert.deepEqual(state.completedMissions, ['basuh-sebelum']);
  assert.deepEqual(state.unlockedBadges, ['lencana-tangan-bersih']);
  assert.equal(state.starsEarned, 3);
  assert.equal(getActiveMission(state)?.id, 'duduk-doa');
  assert.equal(canInteractWithStation(state, 'duduk-doa'), true);
  assert.equal(canInteractWithStation(state, 'basuh-sebelum'), false);
});

test('completing all 6 missions transitions phase to gameover (victory) and awards all badges', () => {
  let state = createInitialGameState({ phase: 'playing' });
  for (let i = 0; i < ADAB_MISSIONS.length; i++) {
    state = completeMission(state, ADAB_MISSIONS[i].id, 100 + i);
  }
  assert.equal(state.phase, 'gameover');
  assert.equal(state.completedMissions.length, 6);
  assert.equal(state.unlockedBadges.length, 6);
  assert.equal(state.starsEarned, 18);
  assert.equal(getActiveMission(state), null);
});

test('collecting bonus stars increments score without duplicating', () => {
  let state = createInitialGameState({ phase: 'playing' });
  state = collectBonusStar(state, BONUS_STARS[0].id, 10);
  assert.equal(state.starsEarned, 1);
  // Collecting same bonus star twice is idempotent
  state = collectBonusStar(state, BONUS_STARS[0].id, 11);
  assert.equal(state.starsEarned, 1);
  assert.equal(calculateTotalStars(['basuh-sebelum'], [BONUS_STARS[0].id]), 4);
});

test('proximity detection identifies active station within radius', () => {
  const state = createInitialGameState({ phase: 'playing' });
  const m1 = ADAB_MISSIONS[0];
  assert.equal(
    findNearestInteractableStation(m1.stationPos.x, m1.stationPos.z, state),
    'basuh-sebelum'
  );
  // Far away returns null
  assert.equal(findNearestInteractableStation(12, 12, state), null);
  // Standing on station 2 while mission 1 is active returns null
  const m2 = ADAB_MISSIONS[1];
  assert.equal(findNearestInteractableStation(m2.stationPos.x, m2.stationPos.z, state), null);
});

test('platform grounding and world clamping keep avatar in bounds and on plinth', () => {
  // Center pavilion plinth is y = 0.25
  assert.equal(groundHeightAt(0, 0, 0), 0.25);
  // Stepping stone at (-7.5, 0.5) has height 0.9; unreachable from y=0, reachable when jumping to y=0.65
  assert.equal(groundHeightAt(-7.5, 0.5, 0), 0);
  assert.equal(groundHeightAt(-7.5, 0.5, 0.65), 0.9);

  const clamped = clampPlayerToWorld(99, -99);
  assert.equal(clamped.x, WORLD_BOUND_RADIUS);
  assert.equal(clamped.z, -WORLD_BOUND_RADIUS);
});

test('formatting and mastery grade calculation work deterministically', () => {
  assert.equal(formatTimeMMSS(75), '01:15');
  assert.equal(computeMasteryGrade(24, 24, 0).grade, 'Mumtaz (Cemerlang)');
  assert.equal(computeMasteryGrade(18, 24, 2).grade, 'Jayyid Jiddan (Sangat Baik)');
  assert.equal(computeMasteryGrade(12, 24, 4).grade, 'Jayyid (Baik)');
});
