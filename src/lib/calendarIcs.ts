import { isValidIsoDate } from './development.ts';

function toIcsDate(dateIso: string): string {
  const safe = isValidIsoDate(dateIso) ? dateIso : '2026-11-19';
  return safe.replaceAll('-', '');
}

function escapeIcsText(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n');
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
