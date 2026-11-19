import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SETTINGS,
  parseSettingsRaw
} from './storage.ts';
import {
  addGrowthLog,
  addKpspResult,
  createEmptyJournal,
  parseJournalRaw,
  toggleMpasiFood
} from './journalStorage.ts';
import {
  computeWhoCurveBand,
  evaluateChildGrowthWho,
  lmsZScore
} from './whoGrowth.ts';
import { evaluateKpspAnswers } from '../data/kpspData.ts';
import { generateChildInsights } from './analytics.ts';
import { buildCalendarIcs } from './calendarIcs.ts';
import { buildDoctorReportPdfBytes } from './doctorReport.ts';
import { createEmptyProgress } from './storage.ts';
import { createEmptyBabyCare } from './babyCareStorage.ts';

test('settings & journal support gender, onboardingCompleted, headCircumferenceCm, kpspResults, triedMpasiFoods', () => {
  assert.equal(DEFAULT_SETTINGS.gender, 'boy');
  const legacyParsed = parseSettingsRaw(JSON.stringify({ childName: 'Dina' }));
  assert.equal(legacyParsed.onboardingCompleted, true);

  let j = createEmptyJournal();
  j = addGrowthLog(j, {
    date: '2026-11-18',
    weightKg: 9.6,
    heightCm: 76.5,
    headCircumferenceCm: 46.2
  });
  assert.equal(j.growthLogs[0].headCircumferenceCm, 46.2);

  j = toggleMpasiFood(j, 'mpasi-telur', 'ok');
  assert.equal(j.triedMpasiFoods['mpasi-telur'], 'ok');
  j = toggleMpasiFood(j, 'mpasi-telur', 'reaction');
  assert.equal(j.triedMpasiFoods['mpasi-telur'], 'reaction');

  j = addKpspResult(j, {
    date: '2026-11-18',
    checkpointMonths: 12,
    yesCount: 9,
    totalCount: 10,
    status: 'sesuai',
    weakPillars: []
  });
  assert.equal(j.kpspResults.length, 1);

  const reparsed = parseJournalRaw(JSON.stringify(j));
  assert.equal(reparsed.kpspResults[0].checkpointMonths, 12);
  assert.equal(reparsed.triedMpasiFoods['mpasi-telur'], 'reaction');
  assert.equal(reparsed.growthLogs[0].headCircumferenceCm, 46.2);
});

test('whoGrowth computes accurate WHO LMS Z-scores for boys and girls across 0-60 months', () => {
  // Exact median should produce z-score ~ 0
  assert.equal(Math.round(lmsZScore(10, 0.2, 10, 0.1) * 100), 0);

  const boy12m = evaluateChildGrowthWho({
    gender: 'boy',
    months: 12,
    weightKg: 9.6,
    heightCm: 75.7,
    headCircumferenceCm: 46.1
  });
  assert.ok(boy12m.wfa && Math.abs(boy12m.wfa.zScore) < 0.3);
  assert.equal(boy12m.wfa?.tone, 'ok');
  assert.ok(boy12m.hfa && Math.abs(boy12m.hfa.zScore) < 0.3);
  assert.ok(boy12m.hcfa && Math.abs(boy12m.hcfa.zScore) < 0.4);

  const lowBoy = evaluateChildGrowthWho({
    gender: 'boy',
    months: 12,
    weightKg: 7.0,
    heightCm: 75.7
  });
  assert.ok(lowBoy.wfa && lowBoy.wfa.zScore < -2.0);
  assert.equal(lowBoy.wfa?.tone, 'attention');

  const band = computeWhoCurveBand('girl', 'wfa', 0, 24);
  assert.ok(band.length >= 5);
  assert.ok(band[0].sdMinus2 < band[0].median && band[0].median < band[0].sdPlus2);
});

test('analytics generates actionable insights linked to KPSP weak pillars and growth status', () => {
  let journal = createEmptyJournal();
  journal = addGrowthLog(journal, { date: '2026-11-18', weightKg: 9.6, heightCm: 75.7 });
  journal = addKpspResult(journal, {
    date: '2026-11-18',
    checkpointMonths: 18,
    yesCount: 7,
    totalCount: 10,
    status: 'meragukan',
    weakPillars: ['bahasa']
  });

  const insights = generateChildInsights({
    childName: 'Kiko',
    gender: 'boy',
    months: 18,
    ageBand: '1-2y',
    journal,
    progress: createEmptyProgress('2026-11-18'),
    babyCare: createEmptyBabyCare()
  });

  assert.ok(insights.cards.length >= 2);
  assert.equal(insights.recommendedSim.pillar, 'bahasa');
  assert.ok(insights.recommendedMission.ageBand === '1-2y');
});

test('evaluateKpspAnswers classifies sesuai, meragukan, penyimpangan and identifies weakPillars', () => {
  const ok = evaluateKpspAnswers(12, Array(10).fill(true));
  assert.equal(ok.status, 'sesuai');
  assert.equal(ok.weakPillars.length, 0);

  const mixed = evaluateKpspAnswers(12, [true, true, true, true, true, true, true, false, false, true]);
  assert.equal(mixed.status, 'meragukan');
  assert.ok(mixed.weakPillars.length >= 1);

  const low = evaluateKpspAnswers(12, [false, false, false, false, true, true, true, false, true, false]);
  assert.equal(low.status, 'penyimpangan');
});

test('calendarIcs and doctorReport generate valid RFC5545 .ics and %PDF-1.4 binary', () => {
  const ics = buildCalendarIcs({
    title: 'Imunisasi Campak Rubela (Kiko)',
    dateIso: '2026-12-01',
    description: 'Jadwal kontrol posyandu/dokter anak dari Cilukba.'
  });
  assert.ok(ics.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261201'));
  assert.ok(ics.includes('END:VCALENDAR'));

  const pdfBytes = buildDoctorReportPdfBytes({
    childName: 'Kiko',
    ageLabel: '18 bln',
    genderLabel: 'Laki-laki',
    generatedDate: '2026-11-19',
    summaryLines: [
      'Berat terakhir: 10.9 kg (Z-score BB/U: +0.0 SD - Normal)',
      'Tinggi terakhir: 82.0 cm (Z-score TB/U: -0.1 SD - Normal)',
      'Skrining KPSP 18 bln: Sesuai (9/10)'
    ]
  });
  const text = new TextDecoder().decode(pdfBytes);
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.ok(text.includes('%%EOF'));
  assert.ok(text.includes('Cilukba'));
});
