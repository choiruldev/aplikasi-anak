import { useEffect, useRef, useState, type JSX } from 'react';
import { X } from 'lucide-react';
import { Drawer } from 'vaul';
import { AGE_PHASES } from '../data/stimulationData.ts';
import { computeAgeInfo, type AgeBand } from '../lib/development.ts';
import {
  PROFILE_AVATARS,
  type ChildProfile,
  type ProfileAvatarId
} from '../lib/profilesStorage.ts';
import type { AppSettings, ChildGender } from '../lib/storage.ts';
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
  onAddProfile: (input: { childName: string; gender: ChildGender; ageBand: AgeBand; avatarId: ProfileAvatarId }) => void;
  onDeleteProfile: (profileId: string) => void;
  onUpdateSettings: (next: AppSettings, avatarId?: ProfileAvatarId) => void;
  playedSeconds: number;
  isGameTimeUp: boolean;
  onResetTimer: () => void;
  onExportBackup: () => void;
  onImportBackup: (rawJson: string) => { ok: boolean; error?: string };
  onOpenLegalPrivacy: () => void;
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
  onOpenLegalPrivacy,
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
  const [newKidGender, setNewKidGender] = useState<ChildGender>('boy');
  const [newKidBand, setNewKidBand] = useState<AgeBand>('1-2y');
  const [newKidAvatar, setNewKidAvatar] = useState<ProfileAvatarId>('bunny');
  const [backupNotice, setBackupNotice] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

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
      gender: newKidGender,
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
    if (file.size > 2 * 1024 * 1024) {
      setBackupNotice('Ukuran file terlalu besar (maksimal 2 MB).');
      return;
    }
    try {
      const text = await file.text();
      const res = onImportBackup(text);
      setBackupNotice(res.ok ? 'Data dipulihkan!' : (res.error ?? 'Gagal impor'));
    } catch {
      setBackupNotice('Gagal membaca file.');
    }
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
      }}
      direction={isDesktop ? 'right' : 'bottom'}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="vaul-overlay" />
        <Drawer.Content
          className={`drawer-sheet vaul-drawer-content ${isDesktop ? 'is-desktop-side' : 'is-mobile-bottom'}`}
          aria-label="Profil & Pengaturan"
        >
          {!isDesktop && <div className="vaul-handle-bar" aria-hidden="true" />}
          <div className="drawer-head">
            <div>
              <span className="eyebrow">Orang Tua</span>
              <Drawer.Title asChild>
                <h2>Profil &amp; Kontrol</h2>
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                Kelola profil anak, batas waktu layar, mode malam, suara, dan cadangan data lokal.
              </Drawer.Description>
            </div>
            <button type="button" className="icon-circle-btn" onClick={handleClose} aria-label="Tutup panel">
              <X size={18} />
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
                  <button
                    type="button"
                    className={`pill-btn small ${newKidGender === 'boy' ? 'is-active' : ''}`}
                    onClick={() => setNewKidGender('boy')}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    className={`pill-btn small ${newKidGender === 'girl' ? 'is-active' : ''}`}
                    onClick={() => setNewKidGender('girl')}
                  >
                    Perempuan
                  </button>
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
                  <button
                    type="button"
                    className={`pill-btn small ${settings.gender === 'boy' ? 'is-active' : ''}`}
                    onClick={() => onUpdateSettings({ ...settings, gender: 'boy' })}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    className={`pill-btn small ${settings.gender === 'girl' ? 'is-active' : ''}`}
                    onClick={() => onUpdateSettings({ ...settings, gender: 'girl' })}
                  >
                    Perempuan
                  </button>
                </div>
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
            <button
              type="button"
              className="text-action-btn"
              onClick={onOpenLegalPrivacy}
              style={{ marginTop: '8px' }}
            >
              Privasi, Referensi WHO/KPSP & Hapus Data →
            </button>
          </section>

          {(installEvent || isIos) && (
            <section className="drawer-section">
              <button type="button" className="btn-outline small" onClick={onOpenInstallGuide}>
                Pasang Aplikasi ke Layar Utama
              </button>
            </section>
          )}
        </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
