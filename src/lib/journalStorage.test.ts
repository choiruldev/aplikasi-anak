import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addDailyNote,
  addGrowthLog,
  createEmptyJournal,
  deleteDailyNote,
  deleteGrowthLog,
  formatJournalSummary,
  parseJournalRaw,
  toggleMilestone,
  toggleSavedTip
} from './journalStorage.ts';

test('toggleMilestone records and clears achievement date', () => {
  const j0 = createEmptyJournal();
  const j1 = toggleMilestone(j0, 'm-03-1', '2026-11-13');
  assert.deepEqual(j1.milestoneStatus['m-03-1'], { checked: true, achievedAt: '2026-11-13' });
  const j2 = toggleMilestone(j1, 'm-03-1', '2026-11-13');
  assert.deepEqual(j2.milestoneStatus['m-03-1'], { checked: false });
});

test('addGrowthLog validates measurements, sorts newest date first, and deleteGrowthLog removes item', () => {
  let j = createEmptyJournal();
  j = addGrowthLog(j, { date: '2026-10-01', weightKg: 6.2, heightCm: 61.5 });
  j = addGrowthLog(j, { date: '2026-11-01', weightKg: 6.8, heightCm: 63.0 });
  // Invalid measurements ignored
  const beforeLen = j.growthLogs.length;
  j = addGrowthLog(j, { date: '2026-11-05', weightKg: -2, heightCm: 0 });
  j = addGrowthLog(j, { date: '2026-11-05', weightKg: Number.NaN });
  assert.equal(j.growthLogs.length, beforeLen);
  assert.equal(j.growthLogs[0].date, '2026-11-01');
  assert.equal(j.growthLogs[0].weightKg, 6.8);

  const removed = deleteGrowthLog(j, j.growthLogs[0].id);
  assert.equal(removed.growthLogs.length, 1);
  assert.equal(removed.growthLogs[0].date, '2026-10-01');
});

test('addDailyNote rejects blank text, deletes cleanly, and toggleSavedTip deduplicates', () => {
  let j = createEmptyJournal();
  j = addDailyNote(j, { date: '2026-11-13', mood: 'happy', text: '   ' });
  assert.equal(j.dailyNotes.length, 0);
  j = addDailyNote(j, { date: '2026-11-13', mood: 'happy', text: 'Pertama kali tengkurap!' });
  assert.equal(j.dailyNotes.length, 1);

  const afterDel = deleteDailyNote(j, j.dailyNotes[0].id);
  assert.equal(afterDel.dailyNotes.length, 0);

  j = toggleSavedTip(j, 'tip-1');
  assert.deepEqual(j.savedTipIds, ['tip-1']);
  j = toggleSavedTip(j, 'tip-1');
  assert.deepEqual(j.savedTipIds, []);
});

test('parseJournalRaw safely recovers from corrupt JSON, rejects half-invalid growth logs, and formatJournalSummary builds text', () => {
  assert.deepEqual(parseJournalRaw('{broken'), createEmptyJournal());
  const halfInvalidRaw = JSON.stringify({
    milestoneStatus: {},
    growthLogs: [
      { id: 'g-bad', date: '2026-11-01', weightKg: 7.5, heightCm: -1 },
      { id: 'g-ok', date: '2026-11-02', weightKg: 7.6 }
    ],
    dailyNotes: [],
    savedTipIds: []
  });
  const parsed = parseJournalRaw(halfInvalidRaw);
  assert.equal(parsed.growthLogs.length, 1);
  assert.equal(parsed.growthLogs[0].id, 'g-ok');
  const summary = formatJournalSummary({
    childName: 'Kenzo',
    ageLabel: '4 bln',
    phaseLabel: 'Bayi Awal (3–6 Bulan)',
    achievedCount: 3,
    totalPhaseMilestones: 5,
    latestGrowth: { id: 'g1', date: '2026-11-01', weightKg: 6.8, heightCm: 63 },
    recentNotes: [{ id: 'n1', date: '2026-11-13', mood: 'happy', text: 'Tertawa keras' }]
  });
  assert.match(summary, /Kenzo/);
  assert.match(summary, /6\.8 kg/);
  assert.match(summary, /3\/5/);
  assert.match(summary, /Tertawa keras/);
});
