import { parseProfilesStateRaw, type ProfilesState } from './profilesStorage.ts';
import { todayKey } from './storage.ts';

export const BACKUP_SCHEMA = 'cilukba.backup.v1';
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const LAST_BACKUP_KEY = 'cilukba.lastBackupAt.v1';

export interface CilukbaBackupPayload {
  schema: typeof BACKUP_SCHEMA;
  exportedAt: string;
  state: ProfilesState;
}

export function createBackupJson(state: ProfilesState): string {
  const payload: CilukbaBackupPayload = {
    schema: BACKUP_SCHEMA,
    exportedAt: new Date().toISOString(),
    state
  };
  return JSON.stringify(payload, null, 2);
}

export function recordBackupTimestamp(isoDate: string = todayKey()): void {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, isoDate);
  } catch {
    // Ignore storage errors
  }
}

export function getLastBackupDate(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

export function shouldSuggestBackup(
  totalSavedRecords: number,
  lastBackupIso: string | null,
  todayIso: string = todayKey()
): boolean {
  if (totalSavedRecords < 3) return false;
  if (!lastBackupIso) return true;
  const last = new Date(`${lastBackupIso}T00:00:00`);
  const now = new Date(`${todayIso}T00:00:00`);
  if (Number.isNaN(last.getTime()) || Number.isNaN(now.getTime())) return true;
  const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 30;
}

export type BackupParseResult =
  | { ok: true; state: ProfilesState }
  | { ok: false; error: string };

export function parseAndValidateBackup(
  rawJson: string,
  today: string = todayKey()
): BackupParseResult {
  if (!rawJson.trim()) {
    return { ok: false, error: 'File cadangan kosong.' };
  }
  if (rawJson.length > MAX_BACKUP_BYTES) {
    return { ok: false, error: 'Ukuran file cadangan terlalu besar (maks 2 MB).' };
  }
  try {
    const parsed = JSON.parse(rawJson) as Partial<CilukbaBackupPayload>;
    if (parsed.schema !== BACKUP_SCHEMA || !parsed.state || !Array.isArray(parsed.state.profiles)) {
      return { ok: false, error: 'Format cadangan tidak dikenali.' };
    }
    if (parsed.state.profiles.length === 0) {
      return { ok: false, error: 'Data profil anak kosong.' };
    }
    const normalized = parseProfilesStateRaw(JSON.stringify(parsed.state), today);
    return { ok: true, state: normalized };
  } catch {
    return { ok: false, error: 'File JSON rusak atau tidak valid.' };
  }
}
