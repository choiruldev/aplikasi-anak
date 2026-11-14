import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SETTINGS,
  parseProgressRaw,
  parseSettingsRaw,
  rolloverIfNeeded,
  toggleFavoriteModule
} from './storage.ts';
import {
  addDailyNote,
  createEmptyJournal,
  parseJournalRaw,
  toggleImmunization,
  toggleRoutineItem
} from './journalStorage.ts';
import {
  addProfile,
  createInitialProfilesState,
  migrateLegacySingleProfile,
  parseProfilesStateRaw,
  switchProfile,
  updateActiveProfileSettings
} from './profilesStorage.ts';
import {
  addBabyCareEntry,
  createEmptyBabyCare,
  deleteBabyCareEntry,
  formatElapsedShort,
  getTodayCareSummary,
  parseBabyCareRaw
} from './babyCareStorage.ts';
import {
  buildSparklinePoints,
  getGrowthReferenceForMonths
} from './growthReference.ts';
import { computePillarBalance, computeStreakInfo } from './stats.ts';
import { STIMULATION_MISSIONS } from '../data/stimulationData.ts';
import { createBackupJson, parseAndValidateBackup } from './backup.ts';

test('storage supports nightMode, favoriteModules, playCounts, tummyTimeSeconds, activeDates', () => {
  const settings = parseSettingsRaw(JSON.stringify({ childName: 'Kiko', nightMode: true }));
  assert.equal(settings.nightMode, true);
  assert.equal(DEFAULT_SETTINGS.nightMode, false);

  const progress = parseProgressRaw(
    JSON.stringify({
      date: '2026-11-14',
      playedSeconds: 120,
      stickers: ['sticker-colors'],
      completedCounts: { colors: 2 },
      completedMissions: ['m-1'],
      favoriteModules: ['colors', 'colors'],
      playCounts: { colors: 5 },
      tummyTimeSeconds: 300,
      activeDates: ['2026-11-13', '2026-11-14']
    }),
    '2026-11-14'
  );
  assert.deepEqual(progress.favoriteModules, ['colors']);
  assert.equal(progress.playCounts.colors, 5);
  assert.equal(progress.tummyTimeSeconds, 300);

  const toggled = toggleFavoriteModule(progress, 'shapes');
  assert.deepEqual(toggled.favoriteModules, ['shapes', 'colors']);
  const toggledOff = toggleFavoriteModule(toggled, 'colors');
  assert.deepEqual(toggledOff.favoriteModules, ['shapes']);

  // Rollover preserves favoriteModules, playCounts, stickers, and activeDates, while resetting daily tummyTimeSeconds
  const rolled = rolloverIfNeeded(toggledOff, '2026-11-15');
  assert.equal(rolled.playedSeconds, 0);
  assert.equal(rolled.tummyTimeSeconds, 0);
  assert.deepEqual(rolled.favoriteModules, ['shapes']);
  assert.equal(rolled.playCounts.colors, 5);
  assert.deepEqual(rolled.activeDates, ['2026-11-13', '2026-11-14']);
});

test('journalStorage tracks tags on notes, daily routines, and immunizations safely', () => {
  let j = createEmptyJournal();
  j = addDailyNote(j, {
    date: '2026-11-14',
    mood: 'happy',
    text: 'Ketawa keras main cilukba',
    tags: ['bahasa', 'sosial']
  });
  assert.deepEqual(j.dailyNotes[0].tags, ['bahasa', 'sosial']);

  j = toggleRoutineItem(j, '2026-11-14', 'rt-morning-1');
  assert.deepEqual(j.completedRoutineIds['2026-11-14'], ['rt-morning-1']);
  j = toggleRoutineItem(j, '2026-11-14', 'rt-morning-1');
  assert.deepEqual(j.completedRoutineIds['2026-11-14'], []);

  j = toggleImmunization(j, 'imm-hb0', '2026-11-14');
  assert.equal(j.completedImmunizations['imm-hb0'], '2026-11-14');

  const reparsed = parseJournalRaw(JSON.stringify(j));
  assert.equal(reparsed.completedImmunizations['imm-hb0'], '2026-11-14');
});

test('profilesStorage supports migration from v1 single profile and switching between siblings', () => {
  const migrated = migrateLegacySingleProfile(
    JSON.stringify({ childName: 'Bimo', ageBand: '6-12m', nightMode: true }),
    JSON.stringify({ date: '2026-11-14', stickers: ['sticker-sensory'], playedSeconds: 60 }),
    JSON.stringify(createEmptyJournal()),
    '2026-11-14'
  );
  assert.equal(migrated.profiles.length, 1);
  assert.equal(migrated.profiles[0].settings.childName, 'Bimo');
  assert.equal(migrated.profiles[0].settings.ageBand, '6-12m');
  assert.deepEqual(migrated.profiles[0].progress.stickers, ['sticker-sensory']);

  const withSister = addProfile(migrated, {
    childName: 'Naya',
    ageBand: '3-5y',
    avatarId: 'bunny'
  });
  assert.equal(withSister.profiles.length, 2);
  const secondId = withSister.profiles[1].id;
  const switched = switchProfile(withSister, secondId);
  assert.equal(switched.activeProfileId, secondId);

  const updated = updateActiveProfileSettings(switched, {
    ...switched.profiles[1].settings,
    childName: 'Naya Ceria'
  });
  assert.equal(updated.profiles[1].settings.childName, 'Naya Ceria');

  const parsed = parseProfilesStateRaw(JSON.stringify(updated), '2026-11-14');
  assert.equal(parsed.profiles.length, 2);
  assert.equal(parsed.activeProfileId, secondId);
});

test('babyCareStorage logs feed, sleep, diaper and formats elapsed duration', () => {
  let care = createEmptyBabyCare();
  const baseTime = Date.UTC(2026, 10, 14, 10, 0, 0);
  care = addBabyCareEntry(care, { type: 'feed', timestamp: baseTime, note: 'ASI kiri', date: '2026-11-14' });
  care = addBabyCareEntry(care, { type: 'diaper', timestamp: baseTime + 1000 * 60 * 30, date: '2026-11-14' });
  care = addBabyCareEntry(care, { type: 'sleep', timestamp: baseTime + 1000 * 60 * 45, date: '2026-11-14' });

  const summary = getTodayCareSummary(care, '2026-11-14');
  assert.equal(summary.feedCount, 1);
  assert.equal(summary.diaperCount, 1);
  assert.equal(summary.sleepCount, 1);
  assert.equal(summary.lastFeed?.timestamp, baseTime);

  assert.equal(formatElapsedShort(baseTime, baseTime + 1000 * 60 * 45), '45m lalu');
  assert.equal(formatElapsedShort(baseTime, baseTime + 1000 * 60 * 130), '2j 10m lalu');

  const reparsed = parseBabyCareRaw(JSON.stringify(care));
  assert.equal(reparsed.entries.length, 3);

  care = deleteBabyCareEntry(care, care.entries[0].id);
  assert.equal(care.entries.length, 2);
});

test('growthReference returns age-appropriate reference bands and valid SVG sparkline points', () => {
  const newbornRef = getGrowthReferenceForMonths(0);
  const toddlerRef = getGrowthReferenceForMonths(24);
  assert.ok(newbornRef.weightMinKg < newbornRef.weightMaxKg);
  assert.ok(toddlerRef.heightMinCm > newbornRef.heightMinCm);

  const pts = buildSparklinePoints(
    [
      { id: '1', date: '2026-09-01', weightKg: 7.2, heightCm: 65 },
      { id: '2', date: '2026-10-01', weightKg: 7.8, heightCm: 67.5 },
      { id: '3', date: '2026-11-01', weightKg: 8.3, heightCm: 70 }
    ],
    'weightKg',
    240,
    90
  );
  assert.equal(pts.points.length, 3);
  assert.ok(pts.points[0].x < pts.points[2].x);
  assert.ok(pts.points[2].y < pts.points[0].y); // heavier weight sits higher (smaller y)
});

test('stats calculates consecutive streakDays and 4-pillar developmental balance', () => {
  const streak = computeStreakInfo(
    ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14'],
    '2026-11-14'
  );
  assert.equal(streak.streakDays, 4);
  assert.equal(streak.completedToday, true);

  const yesterdayStreak = computeStreakInfo(['2026-11-12', '2026-11-13'], '2026-11-14');
  assert.equal(yesterdayStreak.streakDays, 2);
  assert.equal(yesterdayStreak.completedToday, false);

  const sampleMission = STIMULATION_MISSIONS.find((m) => m.ageBand === '1-2y');
  assert.ok(sampleMission);
  const progress = parseProgressRaw(
    JSON.stringify({
      date: '2026-11-14',
      completedMissions: [sampleMission.id]
    }),
    '2026-11-14'
  );
  const balance = computePillarBalance(progress, createEmptyJournal(), '1-2y');
  assert.equal(balance.length, 4);
  assert.ok(balance.some((b) => b.percent > 0));
});

test('backup exports and validates multi-profile JSON safely while rejecting malformed input', () => {
  const initial = createInitialProfilesState('2026-11-14');
  const json = createBackupJson(initial);
  const result = parseAndValidateBackup(json, '2026-11-14');
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.state.profiles.length, 1);
  }

  const bad = parseAndValidateBackup('{"schema":"wrong"}', '2026-11-14');
  assert.equal(bad.ok, false);
});
