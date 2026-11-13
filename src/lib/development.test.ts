import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeAgeInfo,
  isModuleLockedByLimit,
  mapMonthsToAgeBand,
  shouldCountScreenTime
} from './development.ts';
import {
  migrateLegacyAgeFilter,
  parseProgressRaw,
  parseSettingsRaw
} from './storage.ts';

test('mapMonthsToAgeBand maps 0-60+ months accurately', () => {
  assert.equal(mapMonthsToAgeBand(0), '0-3m');
  assert.equal(mapMonthsToAgeBand(2), '0-3m');
  assert.equal(mapMonthsToAgeBand(3), '3-6m');
  assert.equal(mapMonthsToAgeBand(6), '6-12m');
  assert.equal(mapMonthsToAgeBand(12), '1-2y');
  assert.equal(mapMonthsToAgeBand(24), '2-3y');
  assert.equal(mapMonthsToAgeBand(36), '3-5y');
  assert.equal(mapMonthsToAgeBand(65), '3-5y');
});

test('computeAgeInfo handles valid, future, and invalid birthDates', () => {
  const ref = new Date('2026-11-13T12:00:00Z');
  const infant = computeAgeInfo('2026-07-10', ref);
  assert.equal(infant?.months, 4);
  assert.equal(infant?.band, '3-6m');
  assert.equal(infant?.label, '4 bln');

  const newborn = computeAgeInfo('2026-11-01', ref);
  assert.equal(newborn?.months, 0);
  assert.equal(newborn?.band, '0-3m');
  assert.equal(newborn?.label, 'Baru lahir');

  const toddler = computeAgeInfo('2024-05-01', ref);
  assert.equal(toddler?.months, 30);
  assert.equal(toddler?.band, '2-3y');
  assert.equal(toddler?.label, '2 thn 6 bln');

  assert.equal(computeAgeInfo('', ref), null);
  assert.equal(computeAgeInfo('not-a-date', ref), null);
  assert.equal(computeAgeInfo('2026-02-30', ref), null);
  assert.equal(computeAgeInfo('2099-01-01', ref), null);
});

test('migrateLegacyAgeFilter converts v1 filters to AgeBand', () => {
  assert.equal(migrateLegacyAgeFilter('1-2.5'), '1-2y');
  assert.equal(migrateLegacyAgeFilter('2.5-4'), '2-3y');
  assert.equal(migrateLegacyAgeFilter('4-5'), '3-5y');
  assert.equal(migrateLegacyAgeFilter('all'), '1-2y');
  assert.equal(migrateLegacyAgeFilter(undefined), '1-2y');
});

test('screen-time limit rules exempt baby tools and modal pauses', () => {
  assert.equal(shouldCountScreenTime(false, false, false), true);
  assert.equal(shouldCountScreenTime(true, false, false), false);
  assert.equal(shouldCountScreenTime(false, true, false), false);
  assert.equal(shouldCountScreenTime(false, false, true), false);

  assert.equal(isModuleLockedByLimit(false, true), true);
  assert.equal(isModuleLockedByLimit(true, true), false);
  assert.equal(isModuleLockedByLimit(false, false), false);
});

test('parseSettingsRaw migrates v1 settings without losing childName or dailyLimitMinutes', () => {
  const legacyRaw = JSON.stringify({
    childName: 'Zayn',
    ageFilter: '2.5-4',
    soundEnabled: false,
    dailyLimitMinutes: 15
  });
  const migrated = parseSettingsRaw(legacyRaw);
  assert.equal(migrated.childName, 'Zayn');
  assert.equal(migrated.ageBand, '2-3y');
  assert.equal(migrated.soundEnabled, false);
  assert.equal(migrated.dailyLimitMinutes, 15);
  assert.equal(migrated.birthDate, undefined);
});

test('parseProgressRaw resets daily counters and missions on calendar rollover', () => {
  const yesterday = JSON.stringify({
    date: '2026-11-12',
    playedSeconds: 900,
    stickers: ['star', 'lion'],
    completedCounts: { peekaboo: 2 },
    completedMissions: ['m1', 'm2']
  });
  const rolled = parseProgressRaw(yesterday, '2026-11-13');
  assert.equal(rolled.date, '2026-11-13');
  assert.equal(rolled.playedSeconds, 0);
  assert.deepEqual(rolled.completedCounts, {});
  assert.deepEqual(rolled.completedMissions, []);
  assert.deepEqual(rolled.stickers, ['star', 'lion']);
});
