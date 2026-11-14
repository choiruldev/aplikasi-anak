import { isValidIsoDate } from './development.ts';
import { todayKey } from './storage.ts';

export type BabyCareType = 'feed' | 'sleep' | 'diaper';

export interface BabyCareEntry {
  id: string;
  type: BabyCareType;
  date: string;
  timestamp: number;
  note?: string;
}

export interface BabyCareData {
  entries: BabyCareEntry[];
}

export interface TodayCareSummary {
  feedCount: number;
  sleepCount: number;
  diaperCount: number;
  lastFeed?: BabyCareEntry;
  lastSleep?: BabyCareEntry;
  lastDiaper?: BabyCareEntry;
}

function makeCareId(): string {
  return `care-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createEmptyBabyCare(): BabyCareData {
  return { entries: [] };
}

export function parseBabyCareRaw(raw: unknown): BabyCareData {
  if (!raw) return createEmptyBabyCare();
  try {
    const obj = typeof raw === 'string' ? (JSON.parse(raw) as Partial<BabyCareData>) : (raw as Partial<BabyCareData>);
    const validTypes: BabyCareType[] = ['feed', 'sleep', 'diaper'];
    const entries = Array.isArray(obj.entries)
      ? obj.entries
          .filter(
            (e): e is BabyCareEntry =>
              Boolean(e) &&
              typeof e.id === 'string' &&
              validTypes.includes(e.type) &&
              typeof e.date === 'string' &&
              isValidIsoDate(e.date) &&
              typeof e.timestamp === 'number' &&
              Number.isFinite(e.timestamp) &&
              e.timestamp > 0
          )
          .slice(0, 120)
      : [];
    return { entries };
  } catch {
    return createEmptyBabyCare();
  }
}

export function addBabyCareEntry(
  data: BabyCareData,
  input: { type: BabyCareType; timestamp?: number; date?: string; note?: string }
): BabyCareData {
  const ts =
    typeof input.timestamp === 'number' && Number.isFinite(input.timestamp) && input.timestamp > 0
      ? input.timestamp
      : Date.now();
  const date = input.date && isValidIsoDate(input.date) ? input.date : todayKey();
  const entry: BabyCareEntry = {
    id: makeCareId(),
    type: input.type,
    date,
    timestamp: ts,
    ...(input.note?.trim() ? { note: input.note.trim().slice(0, 80) } : {})
  };
  return {
    entries: [entry, ...data.entries].slice(0, 120)
  };
}

export function deleteBabyCareEntry(data: BabyCareData, id: string): BabyCareData {
  return {
    entries: data.entries.filter((e) => e.id !== id)
  };
}

export function getTodayCareSummary(
  data: BabyCareData,
  dateKey: string = todayKey()
): TodayCareSummary {
  let feedCount = 0;
  let sleepCount = 0;
  let diaperCount = 0;
  let lastFeed: BabyCareEntry | undefined;
  let lastSleep: BabyCareEntry | undefined;
  let lastDiaper: BabyCareEntry | undefined;

  const sorted = [...data.entries].sort((a, b) => b.timestamp - a.timestamp);
  for (const e of sorted) {
    if (e.date === dateKey) {
      if (e.type === 'feed') feedCount += 1;
      else if (e.type === 'sleep') sleepCount += 1;
      else if (e.type === 'diaper') diaperCount += 1;
    }
    if (e.type === 'feed' && !lastFeed) lastFeed = e;
    if (e.type === 'sleep' && !lastSleep) lastSleep = e;
    if (e.type === 'diaper' && !lastDiaper) lastDiaper = e;
  }

  return { feedCount, sleepCount, diaperCount, lastFeed, lastSleep, lastDiaper };
}

export function formatElapsedShort(timestamp: number, nowMs: number = Date.now()): string {
  const diffMin = Math.max(0, Math.floor((nowMs - timestamp) / 60000));
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin}m lalu`;
  const hrs = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (hrs >= 24) {
    const days = Math.floor(hrs / 24);
    return `${days}h lalu`;
  }
  return mins > 0 ? `${hrs}j ${mins}m lalu` : `${hrs}j lalu`;
}
