import { isValidIsoDate } from './development.ts';
import { todayKey } from './storage.ts';

function toIcsDate(dateIso: string): string {
  const safe = isValidIsoDate(dateIso) ? dateIso : todayKey();
  return safe.replaceAll('-', '');
}

function escapeIcsText(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n');
}

export function computeTargetDateFromBirth(
  birthDateIso: string | undefined,
  addMonths: number,
  fallbackIso: string = todayKey()
): string {
  if (!birthDateIso || !isValidIsoDate(birthDateIso)) return fallbackIso;
  const [yStr, mStr, dStr] = birthDateIso.split('-');
  const base = new Date(Date.UTC(Number(yStr), Number(mStr) - 1, Number(dStr)));
  if (Number.isNaN(base.getTime())) return fallbackIso;

  const targetMonthIndex = base.getUTCMonth() + Math.max(0, Math.round(addMonths));
  const targetYear = base.getUTCFullYear() + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const maxDayInMonth = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(base.getUTCDate(), maxDayInMonth);

  const iso = `${targetYear}-${String(normalizedMonth + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
  // If due date is already in the past relative to fallback/today, schedule for fallback/today
  return iso < fallbackIso ? fallbackIso : iso;
}

export function buildCalendarIcs(params: {
  title: string;
  dateIso: string;
  description: string;
}): string {
  const dt = toIcsDate(params.dateIso);
  const uid = `cilukba-${dt}-${Math.random().toString(36).slice(2, 8)}@cilukba.app`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cilukba//Tumbuh Kembang Anak//ID',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${dt}`,
    `SUMMARY:${escapeIcsText(params.title)}`,
    `DESCRIPTION:${escapeIcsText(params.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    ''
  ].join('\r\n');
}
