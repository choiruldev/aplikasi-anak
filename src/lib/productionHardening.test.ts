import assert from 'node:assert/strict';
import test from 'node:test';
import { MAX_BACKUP_BYTES, parseAndValidateBackup } from './backup.ts';
import { computeTargetDateFromBirth } from './calendarIcs.ts';
import { buildDoctorReportPdfBytes } from './doctorReport.ts';

test('computeTargetDateFromBirth schedules immunization from birthDate + dueMonths and clamps past dates', () => {
  assert.equal(computeTargetDateFromBirth('2026-01-15', 9, '2026-06-01'), '2026-10-15');
  assert.equal(computeTargetDateFromBirth('2026-01-31', 1, '2026-02-01'), '2026-02-28');
  // Already past due -> clamps to fallback/today
  assert.equal(computeTargetDateFromBirth('2025-01-01', 2, '2026-11-25'), '2026-11-25');
  // Missing birthDate -> falls back safely
  assert.equal(computeTargetDateFromBirth(undefined, 9, '2026-11-25'), '2026-11-25');
});

test('buildDoctorReportPdfBytes wraps long medical lines without truncating trailing words', () => {
  const longNote =
    'Catatan panjang pemeriksaan posyandu bulan November berat badan naik stabil nafsu makan baik anak aktif bermain bersama keluarga di rumah';
  const bytes = buildDoctorReportPdfBytes({
    childName: 'Raka',
    ageLabel: '18 bln',
    genderLabel: 'Laki-laki',
    generatedDate: '2026-11-25',
    summaryLines: [longNote]
  });
  const text = new TextDecoder().decode(bytes);
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.ok(text.includes('di rumah'), 'trailing words must survive word-wrap instead of being sliced off');
});

test('parseAndValidateBackup rejects oversized payloads above 2 MB safely', () => {
  const oversized = ' '.repeat(MAX_BACKUP_BYTES + 16) + '{}';
  const res = parseAndValidateBackup(oversized);
  assert.equal(res.ok, false);
});
