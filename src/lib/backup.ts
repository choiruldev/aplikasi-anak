import { parseProfilesStateRaw, type ProfilesState } from './profilesStorage.ts';
import { todayKey } from './storage.ts';

export const BACKUP_SCHEMA = 'cilukba.backup.v1';

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
