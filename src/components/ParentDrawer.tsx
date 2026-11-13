import { useState, type JSX } from 'react';
import { AGE_PHASES } from '../data/stimulationData.ts';
import { computeAgeInfo, type AgeBand } from '../lib/development.ts';
import type { AppSettings } from '../lib/storage.ts';
import { todayKey } from '../lib/storage.ts';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface ParentDrawerProps {
  open: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
  playedSeconds: number;
  isGameTimeUp: boolean;
  onResetTimer: () => void;
  installEvent: BeforeInstallPromptEvent | null;
  isIos: boolean;
  onOpenInstallGuide: () => void;
}

const LIMIT_OPTIONS = [
  { value: 0, label: 'Tanpa Batas' },
  { value: 10, label: '10 mnt' },
  { value: 15, label: '15 mnt' },
  { value: 20, label: '20 mnt' },
  { value: 30, label: '30 mnt' }
];

function makeMathChallenge() {
  const a = 3 + Math.floor(Math.random() * 6);
  const b = 2 + Math.floor(Math.random() * 7);
  return { a, b, answer: a + b };
}

export function ParentDrawer({
  open,
  onClose,
  settings,
  onUpdateSettings,
  playedSeconds,
  isGameTimeUp,
  onResetTimer,
  installEvent,
  isIos,
  onOpenInstallGuide
}: ParentDrawerProps): JSX.Element | null {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [challenge, setChallenge] = useState(makeMathChallenge);
  const [answerInput, setAnswerInput] = useState('');
  const [resetError, setResetError] = useState(false);

  if (!open) return null;

  const computedAge = computeAgeInfo(settings.birthDate);
  const playedMinutes = Math.floor(playedSeconds / 60);
  const playedRemSeconds = playedSeconds % 60;

  const handleClose = () => {
    setConfirmResetOpen(false);
    setAnswerInput('');
    setResetError(false);
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

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Profil Anak & Pengaturan Orang Tua"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="drawer-sheet">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Profil & Preferensi</span>
            <h2>Data Anak & Pengaturan</h2>
          </div>
          <button type="button" className="btn-outline small" onClick={handleClose}>
            Tutup
          </button>
        </div>

        <div className="drawer-body">
          <section className="drawer-section">
            <h3>Profil Si Kecil</h3>
            <label className="field-label">
              Nama panggilan anak
              <input
                type="text"
                maxLength={20}
                value={settings.childName}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    childName: e.target.value
                  })
                }
                onBlur={() => {
                  if (!settings.childName.trim()) {
                    onUpdateSettings({ ...settings, childName: 'Adik' });
                  }
                }}
                placeholder="misal Kenzo"
              />
            </label>

            <div className="drawer-row-top">
              <label className="field-label">
                Tanggal lahir (opsional)
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
                  Hapus tgl lahir
                </button>
              )}
            </div>

            {computedAge ? (
              <p className="computed-age-note">
                Usia otomatis terbaca: <strong>{computedAge.label}</strong> (Fase{' '}
                {AGE_PHASES.find((p) => p.id === computedAge.band)?.shortLabel})
              </p>
            ) : (
              <div className="field-label">
                <span>Pilih fase usia manual</span>
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
              </div>
            )}
          </section>

          <section className="drawer-section">
            <h3>Batas Waktu Simulasi (1–5 Tahun)</h3>
            <p className="muted-copy">
              Berlaku khusus untuk simulasi interaktif 1–5 tahun. Tab Stimulasi, Catatan, Tips, dan Alat Bayi 0–12 bln selalu terbuka.
            </p>
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
                Terpakai hari ini: <strong>{playedMinutes} mnt {playedRemSeconds} dtk</strong>
              </span>
              <button type="button" className="btn-outline small" onClick={handleRequestReset}>
                Reset Timer Hari Ini
              </button>
            </div>

            {confirmResetOpen && (
              <form className="inline-gate" onSubmit={handleVerifyReset}>
                <label className="field-label">
                  Verifikasi Orang Tua: berapa {challenge.a} + {challenge.b} ?
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
                      Reset
                    </button>
                  </div>
                </label>
                {resetError && <p className="gate-error">Jawaban belum tepat.</p>}
              </form>
            )}

            <label className="toggle-row">
              <div>
                <strong>Kunci anak saat keluar simulasi</strong>
                <span>Minta soal hitung sederhana sebelum keluar dari game 1–5 thn</span>
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

          <section className="drawer-section">
            <h3>Audio & Musik</h3>
            <label className="toggle-row">
              <div>
                <strong>Efek suara lembut</strong>
                <span>Bunyi klik & notifikasi pelan saat bermain</span>
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
                <strong>Panduan suara bahasa Indonesia</strong>
                <span>Pelafalan huruf, warna, angka, dan suara hewan</span>
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
                <strong>Musik latar kalem saat simulasi</strong>
                <span>Melodi lullaby pelan yang bisa dinyalakan/matikan</span>
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

          {(installEvent || isIos) && (
            <section className="drawer-section">
              <h3>Simpan di Layar Utama (Offline PWA)</h3>
              <p className="muted-copy">
                Pasang KecilMain seperti aplikasi agar tetap terbuka cepat meski tanpa kuota internet.
              </p>
              <button type="button" className="btn-outline" onClick={onOpenInstallGuide}>
                Lihat Panduan Pasang di HP
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
