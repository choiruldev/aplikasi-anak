export type AgeFilter = 'all' | '1-2.5' | '2.5-4' | '4-5';

export interface AppSettings {
  childName: string;
  ageFilter: AgeFilter;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  dailyLimitMinutes: number; // 0 = unlimited
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD local
  playedSeconds: number;
  stickers: string[];
  completedCounts: Record<string, number>;
}

const SETTINGS_KEY = 'kecilmain.settings.v1';
const PROGRESS_KEY = 'kecilmain.progress.v1';

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DEFAULT_SETTINGS: AppSettings = {
  childName: 'Adik',
  ageFilter: 'all',
  soundEnabled: true,
  voiceEnabled: true,
  dailyLimitMinutes: 20
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const validAge: AgeFilter[] = ['all', '1-2.5', '2.5-4', '4-5'];
    return {
      childName:
        typeof parsed.childName === 'string' && parsed.childName.trim()
          ? parsed.childName.trim().slice(0, 20)
          : DEFAULT_SETTINGS.childName,
      ageFilter: validAge.includes(parsed.ageFilter as AgeFilter)
        ? (parsed.ageFilter as AgeFilter)
        : 'all',
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      voiceEnabled: typeof parsed.voiceEnabled === 'boolean' ? parsed.voiceEnabled : true,
      dailyLimitMinutes:
        typeof parsed.dailyLimitMinutes === 'number' && parsed.dailyLimitMinutes >= 0
          ? parsed.dailyLimitMinutes
          : 20
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota errors in private browsing
  }
}

export function loadProgress(): DailyProgress {
  const today = todayKey();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) {
      return { date: today, playedSeconds: 0, stickers: [], completedCounts: {} };
    }
    const parsed = JSON.parse(raw) as Partial<DailyProgress>;
    const stickers = Array.isArray(parsed.stickers)
      ? parsed.stickers.filter((s): s is string => typeof s === 'string')
      : [];
    // Reset daily screen-time counter on a new calendar day while keeping collected stickers
    if (parsed.date !== today) {
      return { date: today, playedSeconds: 0, stickers, completedCounts: {} };
    }
    return {
      date: today,
      playedSeconds:
        typeof parsed.playedSeconds === 'number' && parsed.playedSeconds >= 0
          ? parsed.playedSeconds
          : 0,
      stickers,
      completedCounts:
        parsed.completedCounts && typeof parsed.completedCounts === 'object'
          ? (parsed.completedCounts as Record<string, number>)
          : {}
    };
  } catch {
    return { date: today, playedSeconds: 0, stickers: [], completedCounts: {} };
  }
}

export function saveProgress(progress: DailyProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore quota errors in private browsing
  }
}
