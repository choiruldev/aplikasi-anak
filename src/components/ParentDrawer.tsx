import { useRef, useState, type JSX } from 'react';
import { AGE_PHASES } from '../data/stimulationData.ts';
import { computeAgeInfo, type AgeBand } from '../lib/development.ts';
import {
  PROFILE_AVATARS,
  type ChildProfile,
  type ProfileAvatarId
} from '../lib/profilesStorage.ts';
import type { AppSettings } from '../lib/storage.ts';
import { todayKey } from '../lib/storage.ts';
import { AvatarIcon, MoonIcon } from './ModuleIcons.tsx';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface ParentDrawerProps {
  open: boolean;
  onClose: () => void;
  profiles: ChildProfile[];
  activeProfileId: string;
  activeAvatarId: ProfileAvatarId;
  settings: AppSettings;
  onSwitchProfile: (profileId: string) => void;
  onAddProfile: (input: { childName: string; ageBand: AgeBand; avatarId: ProfileAvatarId }) => void;
  onDeleteProfile: (profileId: string) => void;
  onUpdateSettings: (next: AppSettings, avatarId?: ProfileAvatarId) => void;
  playedSeconds: number;
  isGameTimeUp: boolean;
  onResetTimer: () => void;
  onExportBackup: () => void;
  onImportBackup: (rawJson: string) => { ok: boolean; error?: string };
  installEvent: BeforeInstallPromptEvent | null;
  isIos: boolean;
  onOpenInstallGuide: () => void;
}

const LIMIT_OPTIONS = [
  { value: 0, label: 'Bebas' },
  { value: 10, label: '10m' },
  { value: 15, label: '15m' },
  { value: 20, label: '20m' },
  { value: 30, label: '30m' }
];

function makeMathChallenge() {
  const a = 3 + Math.floor(Math.random() * 6);
  const b = 2 + Math.floor(Math.random() * 7);
  return { a, b, answer: a + b };
}

export function ParentDrawer({
  open,
  onClose,
  profiles,
  activeProfileId,
  activeAvatarId,
  settings,
  onSwitchProfile,
  onAddProfile,
  onDeleteProfile,
  onUpdateSettings,
  playedSeconds,
  isGameTimeUp,
  onResetTimer,
  onExportBackup,
  onImportBackup,
  installEvent,
  isIos,
  onOpenInstallGuide
}: ParentDrawerProps): JSX.Element | null {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [challenge, setChallenge] = useState(makeMathChallenge);
  const [answerInput, setAnswerInput] = useState('');
  const [resetError, setResetError] = useState(false);

  const [addingKid, setAddingKid] = useState(false);
  const [newKidName, setNewKidName] = useState('');
  const [newKidBand, setNewKidBand] = useState<AgeBand>('1-2y');
  const [newKidAvatar, setNewKidAvatar] = useState<ProfileAvatarId>('bunny');
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const computedAge = computeAgeInfo(settings.birthDate);
  const playedMinutes = Math.floor(playedSeconds / 60);
  const playedRemSeconds = playedSeconds % 60;

  const handleClose = () => {
    setConfirmResetOpen(false);
    setAnswerInput('');
    setResetError(false);
    setAddingKid(false);
    setBackupNotice(null);
    onClose();
  };

  const handleRequestReset = () => {
    if (isGameTimeUp) {
      setChallenge(makeMathChallenge());
      setAnswerInput('');
      setResetError(false);
      setConfirmResetOpen(true);
    } else {
      onResetTimer();
    }
  };

  const handleVerifyReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(answerInput.trim()) === challenge.answer) {
      setConfirmResetOpen(false);
      setAnswerInput('');
      setResetError(false);
      onResetTimer();
      return;
    }
    setResetError(true);
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidName.trim()) return;
    onAddProfile({
      childName: newKidName.trim(),
      ageBand: newKidBand,
      avatarId: newKidAvatar
    });
    setNewKidName('');
    setAddingKid(false);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const res = onImportBackup(text);
      setBackupNotice(res.ok ? 'Data dipulihkan!' : (res.error ?? 'Gagal impor'));
    } catch {
      setBackupNotice('Gagal membaca file.');
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Profil & Pengaturan"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="drawer-sheet">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Orang Tua</span>
            <h2>Profil & Kontrol</h2>
          </div>
          <button type="button" className="btn-outline small" onClick={handleClose}>
            Tutup
          </button>
        </div>

        <div className="drawer-body">
          {/* Multi-Child Switcher */}
          <section className="drawer-section">
            <div className="drawer-section-head">
              <h3>Anak</h3>
              {profiles.length < 6 && (
                <button
                  type="button"
                  className="text-action-btn"
                  onClick={() => setAddingKid((v) => !v)}
                >
                  {addingKid ? 'Batal' : '+ Tambah Anak'}
                </button>
              )}
            </div>

            <div className="profile-switch-row">
              {profiles.map((prof) => {
                const active = prof.id === activeProfileId;
                return (
                  <button
                    key={prof.id}
                    type="button"
                    className={`profile-chip ${active ? 'is-active' : ''}`}
                    onClick={() => onSwitchProfile(prof.id)}
                  >
                    <AvatarIcon avatarId={prof.avatarId} size={22} />
                    <span>{prof.settings.childName}</span>
                  </button>
                );
              })}
            </div>

            {addingKid && (
              <form className="inline-add-kid" onSubmit={handleCreateProfile}>
                <input
                  type="text"
                  maxLength={20}
                  value={newKidName}
                  onChange={(e) => setNewKidName(e.target.value)}
                  placeholder="Nama panggilan anak"
                  required
                />
                <div className="chip-row">
                  {PROFILE_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      className={`avatar-pick-btn ${newKidAvatar === av.id ? 'is-selected' : ''}`}
                      onClick={() => setNewKidAvatar(av.id)}
                      aria-label={`Avatar ${av.label}`}
                    >
                      <AvatarIcon avatarId={av.id} size={26} />
                    </button>
                  ))}
                </div>
                <div className="chip-row">
                  {AGE_PHASES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`pill-btn small ${newKidBand === p.id ? 'is-active' : ''}`}
                      onClick={() => setNewKidBand(p.id)}
                    >
                      {p.shortLabel}
                    </button>
                  ))}
                </div>
                <button type="submit" className="btn-primary-calm small">
                  Simpan Profil
                </button>
              </form>
            )}

            <label className="field-label">
              Nama & Avatar
              <div className="profile-edit-row">
                <input
                  type="text"
                  maxLength={20}
                  value={settings.childName}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, childName: e.target.value })
                  }
                  onBlur={() => {
                    if (!settings.childName.trim()) {
                      onUpdateSettings({ ...settings, childName: 'Adik' });
                    }
                  }}
                />
                <div className="chip-row">
                  {PROFILE_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      className={`avatar-pick-btn ${activeAvatarId === av.id ? 'is-selected' : ''}`}
                      onClick={() => onUpdateSettings(settings, av.id)}
                      aria-label={`Pilih avatar ${av.label}`}
                    >
                      <AvatarIcon avatarId={av.id} size={24} />
                    </button>
                  ))}
                </div>
              </div>
            </label>

            <div className="drawer-row-top">
              <label className="field-label">
                Tanggal Lahir
                <input
                  type="date"
                  max={todayKey()}
                  value={settings.birthDate ?? ''}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      birthDate: e.target.value || undefined
                    })
                  }
                />
              </label>
              {settings.birthDate && (
                <button
                  type="button"
                  className="text-action-btn"
                  onClick={() => onUpdateSettings({ ...settings, birthDate: undefined })}
                >
                  Reset Tgl
                </button>
              )}
            </div>

            {computedAge ? (
              <p className="computed-age-note">
                Usia: <strong>{computedAge.label}</strong> ·{' '}
                {AGE_PHASES.find((p) => p.id === computedAge.band)?.shortLabel}
              </p>
            ) : (
              <div className="chip-row">
                {AGE_PHASES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`pill-btn small ${settings.ageBand === p.id ? 'is-active' : ''}`}
                    onClick={() =>
                      onUpdateSettings({ ...settings, ageBand: p.id as AgeBand })
                    }
                  >
                    {p.shortLabel}
                  </button>
                ))}
              </div>
            )}

            {profiles.length > 1 && (
              <button
                type="button"
                className="text-action-btn danger"
                onClick={() => onDeleteProfile(activeProfileId)}
              >
                Hapus profil {settings.childName}
              </button>
            )}
          </section>

          {/* Screen Time */}
          <section className="drawer-section">
            <h3>Timer Layar 1–5 Thn</h3>
            <div className="chip-row">
              {LIMIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`pill-btn small ${settings.dailyLimitMinutes === opt.value ? 'is-active' : ''}`}
                  onClick={() =>
                    onUpdateSettings({ ...settings, dailyLimitMinutes: opt.value })
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="timer-usage-box">
              <span className="tabular">
                Hari ini: <strong>{playedMinutes}m {playedRemSeconds}d</strong>
              </span>
              <button type="button" className="btn-outline small" onClick={handleRequestReset}>
                Reset
              </button>
            </div>

            {confirmResetOpen && (
              <form className="inline-gate" onSubmit={handleVerifyReset}>
                <label className="field-label">
                  Hitung: {challenge.a} + {challenge.b} = ?
                  <div className="inline-gate-row">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={answerInput}
                      onChange={(e) => {
                        setAnswerInput(e.target.value);
                        setResetError(false);
                      }}
                      autoFocus
                      required
                    />
                    <button type="submit" className="btn-primary-calm small">
                      OK
                    </button>
                  </div>
                </label>
                {resetError && <p className="gate-error">Belum tepat.</p>}
              </form>
            )}

            <label className="toggle-row">
              <div>
                <strong>Kunci Keluar Anak</strong>
                <span>Verifikasi orang tua</span>
              </div>
              <input
                type="checkbox"
                checked={settings.childLockExit}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, childLockExit: e.target.checked })
                }
              />
            </label>
          </section>

          {/* Audio & Theme */}
          <section className="drawer-section">
            <h3>Tampilan & Suara</h3>
            <label className="toggle-row">
              <div className="toggle-title-icon">
                <MoonIcon size={16} />
                <div>
                  <strong>Mode Malam Tenang</strong>
                  <span>Warna redup ramah mata</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.nightMode}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, nightMode: e.target.checked })
                }
              />
            </label>

            <label className="toggle-row">
              <div>
                <strong>Efek Suara</strong>
                <span>Bunyi sentuhan pelan</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
                }
              />
            </label>

            <label className="toggle-row">
              <div>
                <strong>Suara Panduan ID</strong>
                <span>Huruf, angka, warna, hewan</span>
              </div>
              <input
                type="checkbox"
                checked={settings.voiceEnabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, voiceEnabled: e.target.checked })
                }
              />
            </label>

            <label className="toggle-row">
              <div>
                <strong>Musik Latar</strong>
                <span>Lullaby kalem</span>
              </div>
              <input
                type="checkbox"
                checked={settings.bgmEnabled}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, bgmEnabled: e.target.checked })
                }
              />
            </label>
          </section>

          {/* Backup & PWA */}
          <section className="drawer-section">
            <h3>Cadangan Offline</h3>
            <div className="backup-actions-row">
              <button type="button" className="btn-outline small" onClick={onExportBackup}>
                Ekspor JSON
              </button>
              <button
                type="button"
                className="btn-outline small"
                onClick={() => fileInputRef.current?.click()}
              >
                Impor JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                hidden
                onChange={handleImportFile}
              />
            </div>
            {backupNotice && <p className="computed-age-note">{backupNotice}</p>}
          </section>

          {(installEvent || isIos) && (
            <section className="drawer-section">
              <button type="button" className="btn-outline small" onClick={onOpenInstallGuide}>
                Pasang Aplikasi ke Layar Utama
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
