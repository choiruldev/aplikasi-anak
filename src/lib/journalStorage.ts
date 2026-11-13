import { isValidIsoDate } from './development.ts';
import { todayKey } from './storage.ts';

export type NoteMood = 'happy' | 'calm' | 'fussy';

export interface MilestoneRecord {
  checked: boolean;
  achievedAt?: string;
}

export interface GrowthEntry {
  id: string;
  date: string;
  weightKg?: number;
  heightCm?: number;
  note?: string;
}

export interface DailyNote {
  id: string;
  date: string;
  mood: NoteMood;
  text: string;
}

export interface JournalData {
  milestoneStatus: Record<string, MilestoneRecord>;
  growthLogs: GrowthEntry[];
  dailyNotes: DailyNote[];
  savedTipIds: string[];
}

const JOURNAL_KEY = 'kecilmain.journal.v1';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function isPositiveMeasurement(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function createEmptyJournal(): JournalData {
  return {
    milestoneStatus: {},
    growthLogs: [],
    dailyNotes: [],
    savedTipIds: []
  };
}

export function parseJournalRaw(raw: string | null): JournalData {
  if (!raw) return createEmptyJournal();
  try {
    const parsed = JSON.parse(raw) as Partial<JournalData>;
    const milestoneStatus: Record<string, MilestoneRecord> = {};
    if (parsed.milestoneStatus && typeof parsed.milestoneStatus === 'object') {
      for (const [id, rec] of Object.entries(parsed.milestoneStatus)) {
        if (rec && typeof rec === 'object' && typeof rec.checked === 'boolean') {
          milestoneStatus[id] = rec.checked
            ? {
                checked: true,
                achievedAt: typeof rec.achievedAt === 'string' ? rec.achievedAt : undefined
              }
            : { checked: false };
        }
      }
    }

    const growthLogs: GrowthEntry[] = Array.isArray(parsed.growthLogs)
      ? parsed.growthLogs.filter(
          (g): g is GrowthEntry =>
            Boolean(g) &&
            typeof g.id === 'string' &&
            typeof g.date === 'string' &&
            (g.weightKg === undefined || isPositiveMeasurement(g.weightKg)) &&
            (g.heightCm === undefined || isPositiveMeasurement(g.heightCm)) &&
            (g.weightKg !== undefined || g.heightCm !== undefined)
        )
      : [];

    const validMoods: NoteMood[] = ['happy', 'calm', 'fussy'];
    const dailyNotes: DailyNote[] = Array.isArray(parsed.dailyNotes)
      ? parsed.dailyNotes.filter(
          (n): n is DailyNote =>
            Boolean(n) &&
            typeof n.id === 'string' &&
            typeof n.date === 'string' &&
            validMoods.includes(n.mood) &&
            typeof n.text === 'string' &&
            n.text.trim().length > 0
        )
      : [];

    const savedTipIds = Array.isArray(parsed.savedTipIds)
      ? Array.from(new Set(parsed.savedTipIds.filter((id): id is string => typeof id === 'string')))
      : [];

    return {
      milestoneStatus,
      growthLogs,
      dailyNotes,
      savedTipIds
    };
  } catch {
    return createEmptyJournal();
  }
}

export function loadJournal(): JournalData {
  try {
    return parseJournalRaw(localStorage.getItem(JOURNAL_KEY));
  } catch {
    return createEmptyJournal();
  }
}

export function saveJournal(data: JournalData): void {
  try {
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota errors in private browsing
  }
}

export function toggleMilestone(
  data: JournalData,
  milestoneId: string,
  dateKey: string = todayKey()
): JournalData {
  const prev = data.milestoneStatus[milestoneId]?.checked ?? false;
  const nextRecord: MilestoneRecord = prev
    ? { checked: false }
    : { checked: true, achievedAt: dateKey };
  return {
    ...data,
    milestoneStatus: {
      ...data.milestoneStatus,
      [milestoneId]: nextRecord
    }
  };
}

export function addGrowthLog(
  data: JournalData,
  input: { date: string; weightKg?: number; heightCm?: number; note?: string }
): JournalData {
  const hasWeightInput = input.weightKg !== undefined;
  const hasHeightInput = input.heightCm !== undefined;
  if (!hasWeightInput && !hasHeightInput) return data;
  if (hasWeightInput && !isPositiveMeasurement(input.weightKg)) return data;
  if (hasHeightInput && !isPositiveMeasurement(input.heightCm)) return data;

  const entry: GrowthEntry = {
    id: makeId('g'),
    date: isValidIsoDate(input.date) ? input.date : todayKey(),
    ...(hasWeightInput ? { weightKg: Math.round(input.weightKg! * 100) / 100 } : {}),
    ...(hasHeightInput ? { heightCm: Math.round(input.heightCm! * 10) / 10 } : {}),
    ...(input.note?.trim() ? { note: input.note.trim().slice(0, 120) } : {})
  };

  const growthLogs = [entry, ...data.growthLogs].sort((a, b) => b.date.localeCompare(a.date));
  return { ...data, growthLogs };
}

export function deleteGrowthLog(data: JournalData, id: string): JournalData {
  return {
    ...data,
    growthLogs: data.growthLogs.filter((item) => item.id !== id)
  };
}

export function addDailyNote(
  data: JournalData,
  input: { date: string; mood: NoteMood; text: string }
): JournalData {
  const trimmed = input.text.trim();
  if (!trimmed) return data;

  const entry: DailyNote = {
    id: makeId('n'),
    date: isValidIsoDate(input.date) ? input.date : todayKey(),
    mood: input.mood,
    text: trimmed.slice(0, 280)
  };

  const dailyNotes = [entry, ...data.dailyNotes].sort((a, b) => b.date.localeCompare(a.date));
  return { ...data, dailyNotes };
}

export function deleteDailyNote(data: JournalData, id: string): JournalData {
  return {
    ...data,
    dailyNotes: data.dailyNotes.filter((item) => item.id !== id)
  };
}

export function toggleSavedTip(data: JournalData, tipId: string): JournalData {
  const exists = data.savedTipIds.includes(tipId);
  return {
    ...data,
    savedTipIds: exists
      ? data.savedTipIds.filter((id) => id !== tipId)
      : [tipId, ...data.savedTipIds]
  };
}

export function formatJournalSummary(params: {
  childName: string;
  ageLabel: string;
  phaseLabel: string;
  achievedCount: number;
  totalPhaseMilestones: number;
  latestGrowth?: GrowthEntry;
  recentNotes: DailyNote[];
}): string {
  const lines = [
    `Catatan Tumbuh Kembang — ${params.childName} (${params.ageLabel})`,
    `Fase: ${params.phaseLabel}`,
    `Milestone tercapai: ${params.achievedCount}/${params.totalPhaseMilestones}`
  ];

  if (params.latestGrowth) {
    const parts: string[] = [];
    if (params.latestGrowth.weightKg !== undefined) {
      parts.push(`${params.latestGrowth.weightKg} kg`);
    }
    if (params.latestGrowth.heightCm !== undefined) {
      parts.push(`${params.latestGrowth.heightCm} cm`);
    }
    if (parts.length > 0) {
      lines.push(`Pertumbuhan terakhir (${params.latestGrowth.date}): ${parts.join(' · ')}`);
    }
  }

  if (params.recentNotes.length > 0) {
    lines.push('Catatan terbaru:');
    for (const note of params.recentNotes.slice(0, 3)) {
      lines.push(`- [${note.date}] ${note.text}`);
    }
  }

  return lines.join('\n');
}
