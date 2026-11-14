import { type AgeBand, isValidAgeBand, isValidIsoDate } from './development.ts';
import {
  createEmptyJournal,
  type JournalData,
  parseJournalRaw
} from './journalStorage.ts';
import {
  type AppSettings,
  createEmptyProgress,
  type DailyProgress,
  DEFAULT_SETTINGS,
  parseProgressRaw,
  parseSettingsRaw,
  rolloverIfNeeded,
  todayKey
} from './storage.ts';
import {
  type BabyCareData,
  createEmptyBabyCare,
  parseBabyCareRaw
} from './babyCareStorage.ts';

export type ProfileAvatarId = 'sprout' | 'bunny' | 'bear' | 'chick' | 'star';

export const PROFILE_AVATARS: { id: ProfileAvatarId; label: string }[] = [
  { id: 'sprout', label: 'Tunas' },
  { id: 'bunny', label: 'Kelinci' },
  { id: 'bear', label: 'Beruang' },
  { id: 'chick', label: 'Anak Ayam' },
  { id: 'star', label: 'Bintang' }
];

export interface ChildProfile {
  id: string;
  avatarId: ProfileAvatarId;
  settings: AppSettings;
  progress: DailyProgress;
  journal: JournalData;
  babyCare: BabyCareData;
}

export interface ProfilesState {
  activeProfileId: string;
  profiles: ChildProfile[];
}

export const PROFILES_KEY = 'cilukba.profiles.v1';
const LEGACY_SETTINGS_KEY = 'kecilmain.settings.v1';
const LEGACY_PROGRESS_KEY = 'kecilmain.progress.v1';
const LEGACY_JOURNAL_KEY = 'kecilmain.journal.v1';

const VALID_AVATARS: ProfileAvatarId[] = ['sprout', 'bunny', 'bear', 'chick', 'star'];

function makeProfileId(): string {
  return `kid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createInitialProfilesState(today: string = todayKey()): ProfilesState {
  const firstId = 'kid-primary';
  return {
    activeProfileId: firstId,
    profiles: [
      {
        id: firstId,
        avatarId: 'sprout',
        settings: { ...DEFAULT_SETTINGS },
        progress: createEmptyProgress(today),
        journal: createEmptyJournal(),
        babyCare: createEmptyBabyCare()
      }
    ]
  };
}

export function migrateLegacySingleProfile(
  legacySettingsRaw: string | null,
  legacyProgressRaw: string | null,
  legacyJournalRaw: string | null,
  today: string = todayKey()
): ProfilesState {
  const settings = parseSettingsRaw(legacySettingsRaw);
  const progress = parseProgressRaw(legacyProgressRaw, today);
  const journal = parseJournalRaw(legacyJournalRaw);
  const id = 'kid-primary';
  return {
    activeProfileId: id,
    profiles: [
      {
        id,
        avatarId: 'sprout',
        settings,
        progress,
        journal,
        babyCare: createEmptyBabyCare()
      }
    ]
  };
}

export function parseProfilesStateRaw(
  raw: string | null,
  today: string = todayKey()
): ProfilesState {
  if (!raw) return createInitialProfilesState(today);
  try {
    const parsed = JSON.parse(raw) as Partial<ProfilesState>;
    if (!Array.isArray(parsed.profiles) || parsed.profiles.length === 0) {
      return createInitialProfilesState(today);
    }

    const profiles: ChildProfile[] = parsed.profiles
      .filter((p): p is ChildProfile => Boolean(p) && typeof p.id === 'string')
      .slice(0, 6)
      .map((p, idx) => ({
        id: p.id || `kid-${idx + 1}`,
        avatarId: VALID_AVATARS.includes(p.avatarId) ? p.avatarId : 'sprout',
        settings: parseSettingsRaw(JSON.stringify(p.settings ?? DEFAULT_SETTINGS)),
        progress: parseProgressRaw(JSON.stringify(p.progress ?? createEmptyProgress(today)), today),
        journal: parseJournalRaw(JSON.stringify(p.journal ?? createEmptyJournal())),
        babyCare: parseBabyCareRaw(p.babyCare)
      }));

    if (profiles.length === 0) return createInitialProfilesState(today);
    const activeExists = profiles.some((p) => p.id === parsed.activeProfileId);
    return {
      activeProfileId: activeExists ? parsed.activeProfileId! : profiles[0].id,
      profiles
    };
  } catch {
    return createInitialProfilesState(today);
  }
}

export function loadProfilesState(today: string = todayKey()): ProfilesState {
  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    if (stored) {
      return parseProfilesStateRaw(stored, today);
    }
    const migrated = migrateLegacySingleProfile(
      localStorage.getItem(LEGACY_SETTINGS_KEY),
      localStorage.getItem(LEGACY_PROGRESS_KEY),
      localStorage.getItem(LEGACY_JOURNAL_KEY),
      today
    );
    saveProfilesState(migrated);
    return migrated;
  } catch {
    return createInitialProfilesState(today);
  }
}

export function saveProfilesState(state: ProfilesState): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(state));
    const active = getActiveProfile(state);
    localStorage.setItem(LEGACY_SETTINGS_KEY, JSON.stringify(active.settings));
    localStorage.setItem(LEGACY_PROGRESS_KEY, JSON.stringify(active.progress));
    localStorage.setItem(LEGACY_JOURNAL_KEY, JSON.stringify(active.journal));
  } catch {
    // Ignore storage quota errors
  }
}

export function getActiveProfile(state: ProfilesState): ChildProfile {
  return state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0];
}

export function rolloverProfilesIfNeeded(
  state: ProfilesState,
  today: string = todayKey()
): ProfilesState {
  let changed = false;
  const profiles = state.profiles.map((profile) => {
    const nextProgress = rolloverIfNeeded(profile.progress, today);
    if (nextProgress !== profile.progress) {
      changed = true;
      return { ...profile, progress: nextProgress };
    }
    return profile;
  });
  return changed ? { ...state, profiles } : state;
}

export function switchProfile(state: ProfilesState, profileId: string): ProfilesState {
  if (!state.profiles.some((p) => p.id === profileId)) return state;
  return { ...state, activeProfileId: profileId };
}

export function addProfile(
  state: ProfilesState,
  input: {
    childName: string;
    ageBand: AgeBand;
    birthDate?: string;
    avatarId?: ProfileAvatarId;
  },
  today: string = todayKey()
): ProfilesState {
  if (state.profiles.length >= 6) return state;
  const active = getActiveProfile(state);
  const newProfile: ChildProfile = {
    id: makeProfileId(),
    avatarId: input.avatarId && VALID_AVATARS.includes(input.avatarId) ? input.avatarId : 'bunny',
    settings: {
      ...DEFAULT_SETTINGS,
      nightMode: active.settings.nightMode,
      soundEnabled: active.settings.soundEnabled,
      voiceEnabled: active.settings.voiceEnabled,
      childName: input.childName.trim().slice(0, 20) || 'Adik Baru',
      ageBand: isValidAgeBand(input.ageBand) ? input.ageBand : '1-2y',
      birthDate: input.birthDate && isValidIsoDate(input.birthDate) ? input.birthDate : undefined
    },
    progress: createEmptyProgress(today),
    journal: createEmptyJournal(),
    babyCare: createEmptyBabyCare()
  };

  return {
    activeProfileId: newProfile.id,
    profiles: [...state.profiles, newProfile]
  };
}

export function deleteProfile(state: ProfilesState, profileId: string): ProfilesState {
  if (state.profiles.length <= 1) return state;
  const remaining = state.profiles.filter((p) => p.id !== profileId);
  if (remaining.length === state.profiles.length) return state;
  const nextActive =
    state.activeProfileId === profileId ? remaining[0].id : state.activeProfileId;
  return {
    activeProfileId: nextActive,
    profiles: remaining
  };
}

export function updateActiveProfile(
  state: ProfilesState,
  updater: (profile: ChildProfile) => ChildProfile
): ProfilesState {
  return {
    ...state,
    profiles: state.profiles.map((p) => (p.id === state.activeProfileId ? updater(p) : p))
  };
}

export function updateActiveProfileSettings(
  state: ProfilesState,
  settings: AppSettings,
  avatarId?: ProfileAvatarId
): ProfilesState {
  return updateActiveProfile(state, (p) => ({
    ...p,
    settings,
    avatarId: avatarId ?? p.avatarId
  }));
}
