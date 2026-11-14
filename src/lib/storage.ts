import {
  type AgeBand,
  isValidAgeBand,
  isValidIsoDate
} from './development.ts';

export interface AppSettings {
  childName: string;
  birthDate?: string;
  ageBand: AgeBand;
  childLockExit: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  bgmEnabled: boolean;
  nightMode: boolean;
  dailyLimitMinutes: number; // 0 = unlimited
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD local
  playedSeconds: number;
  stickers: string[];
  completedCounts: Record<string, number>;
  completedMissions: string[];
  favoriteModules: string[];
  playCounts: Record<string, number>;
  tummyTimeSeconds: number;
  activeDates: string[];
}

const SETTINGS_KEY = 'kecilmain.settings.v1';
const PROGRESS_KEY = 'kecilmain.progress.v1';

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function migrateLegacyAgeFilter(legacy?: string): AgeBand {
  switch (legacy) {
    case '1-2.5':
      return '1-2y';
    case '2.5-4':
      return '2-3y';
    case '4-5':
      return '3-5y';
    default:
      return '1-2y';
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  childName: 'Adik',
  ageBand: '1-2y',
  childLockExit: false,
  soundEnabled: true,
  voiceEnabled: true,
  bgmEnabled: false,
  nightMode: false,
  dailyLimitMinutes: 20
};

export function parseSettingsRaw(raw: string | null): AppSettings {
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings> & { ageFilter?: string };
    const ageBand = isValidAgeBand(parsed.ageBand)
      ? parsed.ageBand
      : migrateLegacyAgeFilter(parsed.ageFilter);
    const birthDate =
      typeof parsed.birthDate === 'string' && isValidIsoDate(parsed.birthDate)
        ? parsed.birthDate
        : undefined;

    return {
      childName:
        typeof parsed.childName === 'string' && parsed.childName.trim()
          ? parsed.childName.trim().slice(0, 20)
          : DEFAULT_SETTINGS.childName,
      birthDate,
      ageBand,
      childLockExit:
        typeof parsed.childLockExit === 'boolean'
          ? parsed.childLockExit
          : DEFAULT_SETTINGS.childLockExit,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      voiceEnabled: typeof parsed.voiceEnabled === 'boolean' ? parsed.voiceEnabled : true,
      bgmEnabled: typeof parsed.bgmEnabled === 'boolean' ? parsed.bgmEnabled : false,
      nightMode: typeof parsed.nightMode === 'boolean' ? parsed.nightMode : false,
      dailyLimitMinutes:
        typeof parsed.dailyLimitMinutes === 'number' &&
        Number.isFinite(parsed.dailyLimitMinutes) &&
        parsed.dailyLimitMinutes >= 0
          ? parsed.dailyLimitMinutes
          : DEFAULT_SETTINGS.dailyLimitMinutes
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function loadSettings(): AppSettings {
  try {
    return parseSettingsRaw(localStorage.getItem(SETTINGS_KEY));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota errors in private browsing
  }
}

function sanitizeStringList(value: unknown, limit = 60): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter((item): item is string => typeof item === 'string'))).slice(0, limit);
}

function sanitizeCountMap(value: unknown): Record<string, number> {
  const counts: Record<string, number> = {};
  if (!value || typeof value !== 'object') return counts;
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
      counts[k] = v;
    }
  }
  return counts;
}

export function createEmptyProgress(today: string = todayKey()): DailyProgress {
  return {
    date: today,
    playedSeconds: 0,
    stickers: [],
    completedCounts: {},
    completedMissions: [],
    favoriteModules: [],
    playCounts: {},
    tummyTimeSeconds: 0,
    activeDates: []
  };
}

export function toggleFavoriteModule(progress: DailyProgress, moduleKey: string): DailyProgress {
  const exists = progress.favoriteModules.includes(moduleKey);
  return {
    ...progress,
    favoriteModules: exists
      ? progress.favoriteModules.filter((k) => k !== moduleKey)
      : [moduleKey, ...progress.favoriteModules]
  };
}

export function recordActiveDate(activeDates: string[], dateKey: string = todayKey()): string[] {
  const merged = Array.from(new Set([...activeDates, dateKey].filter(isValidIsoDate))).sort();
  return merged.slice(-60);
}

export function parseProgressRaw(raw: string | null, today: string = todayKey()): DailyProgress {
  const empty = createEmptyProgress(today);
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as Partial<DailyProgress>;
    const stickers = sanitizeStringList(parsed.stickers, 30);
    const favoriteModules = sanitizeStringList(parsed.favoriteModules, 30);
    const playCounts = sanitizeCountMap(parsed.playCounts);
    const activeDates = sanitizeStringList(parsed.activeDates, 60).filter(isValidIsoDate).sort();

    // Reset daily counters and daily missions on calendar rollover, preserving lifetime stickers, favorites, playCounts, activeDates
    if (parsed.date !== today) {
      return {
        date: today,
        playedSeconds: 0,
        stickers,
        completedCounts: {},
        completedMissions: [],
        favoriteModules,
        playCounts,
        tummyTimeSeconds: 0,
        activeDates
      };
    }

    const completedCounts = sanitizeCountMap(parsed.completedCounts);
    const completedMissions = sanitizeStringList(parsed.completedMissions, 60);

    return {
      date: today,
      playedSeconds:
        typeof parsed.playedSeconds === 'number' &&
        Number.isFinite(parsed.playedSeconds) &&
        parsed.playedSeconds >= 0
          ? parsed.playedSeconds
          : 0,
      stickers,
      completedCounts,
      completedMissions,
      favoriteModules,
      playCounts,
      tummyTimeSeconds:
        typeof parsed.tummyTimeSeconds === 'number' &&
        Number.isFinite(parsed.tummyTimeSeconds) &&
        parsed.tummyTimeSeconds >= 0
          ? parsed.tummyTimeSeconds
          : 0,
      activeDates
    };
  } catch {
    return empty;
  }
}

export function rolloverIfNeeded(
  prev: DailyProgress,
  today: string = todayKey()
): DailyProgress {
  if (prev.date === today) return prev;
  return {
    date: today,
    playedSeconds: 0,
    stickers: prev.stickers,
    completedCounts: {},
    completedMissions: [],
    favoriteModules: prev.favoriteModules,
    playCounts: prev.playCounts,
    tummyTimeSeconds: 0,
    activeDates: prev.activeDates
  };
}

export function loadProgress(): DailyProgress {
  const today = todayKey();
  try {
    return parseProgressRaw(localStorage.getItem(PROGRESS_KEY), today);
  } catch {
    return createEmptyProgress(today);
  }
}

export function saveProgress(progress: DailyProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore quota errors in private browsing
  }
}
