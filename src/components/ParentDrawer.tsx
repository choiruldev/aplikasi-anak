import { useMemo, useState, type JSX } from 'react';
import type { AppSettings, DailyProgress } from '../lib/storage';
import { IconCheck, IconDownload } from './Art';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface ParentDrawerProps {
  settings: AppSettings;
  progress: DailyProgress;
  installEvent: BeforeInstallPromptEvent | null;
  isStandalone?: boolean;
  isIos?: boolean;
  onUpdateSettings: (next: AppSettings) => void;
  onResetTodayTimer: () => void;
  onTriggerInstall: () => void;
  onOpenInstallGuide?: () => void;
  onClose: () => void;
}

const LIMIT_OPTIONS = [
  { label: '10 mnt', value: 10 },
  { label: '15 mnt', value: 15 },
  { label: '20 mnt', value: 20 },
  { label: '30 mnt', value: 30 },
  { label: 'Bebas', value: 0 }
];

export function ParentDrawer({
  settings,
  progress,
  installEvent,
  isStandalone,
  isIos,
  onUpdateSettings,
  onResetTodayTimer,
  onTriggerInstall,
  onOpenInstallGuide,
  onClose
}: ParentDrawerProps): JSX.Element {
  const challenge = useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 5 + Math.floor(Math.random() * 4);
    const answer = a + b;
    const choices = [answer - 2, answer, answer + 3].sort((x, y) => x - y);
    return { a, b, answer, choices };
  }, []);

  const [unlocked, setUnlocked] = useState(false);
  const [wrongMsg, setWrongMsg] = useState(false);

  const playedMinutes = Math.floor(progress.playedSeconds / 60);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="parent-modal-title">
      <div className="modal-sheet">
        <div className="modal-top">
          <h2 id="parent-modal-title" className="modal-title">
            {unlocked ? 'Ruang Orang Tua' : 'Kunci Orang Tua'}
          </h2>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Tutup
          </button>
        </div>

        {!unlocked ? (
          <div className="gate-box">
            <p className="gate-desc">
              Jawab hitungan singkat ini untuk membuka pengaturan batas waktu dan suara:
            </p>
            <p className="gate-equation">
              {challenge.a} + {challenge.b} = ?
            </p>
            <div className="gate-choices">
              {challenge.choices.map((val) => (
                <button
                  key={val}
                  type="button"
                  className="gate-choice-btn"
                  onClick={() => {
                    if (val === challenge.answer) {
                      setUnlocked(true);
                      setWrongMsg(false);
                    } else {
                      setWrongMsg(true);
                    }
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            {wrongMsg && <p className="gate-hint">Belum tepat, silakan coba angka lainnya.</p>}
          </div>
        ) : (
          <div className="parent-controls">
            <div className="field-group">
              <label htmlFor="child-name-input" className="field-label">
                Nama Panggilan Anak
              </label>
              <input
                id="child-name-input"
                type="text"
                maxLength={20}
                value={settings.childName}
                onChange={(e) => onUpdateSettings({ ...settings, childName: e.target.value })}
                className="text-input"
              />
            </div>

            <div className="field-group">
              <span className="field-label">Batas Waktu Layar Harian</span>
              <div className="limit-pills">
                {LIMIT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`mode-tab ${settings.dailyLimitMinutes === opt.value ? 'is-active' : ''}`}
                    onClick={() => onUpdateSettings({ ...settings, dailyLimitMinutes: opt.value })}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="usage-row">
                <span>Durasi bermain hari ini: <strong>{playedMinutes} menit</strong></span>
                {progress.playedSeconds > 0 && (
                  <button type="button" className="link-btn" onClick={onResetTodayTimer}>
                    Ulangi Timer Hari Ini
                  </button>
                )}
              </div>
            </div>

            <div className="field-group">
              <span className="field-label">Suara &amp; Musik</span>
              <div className="toggle-row">
                <button
                  type="button"
                  className={`mode-tab ${settings.soundEnabled ? 'is-active' : ''}`}
                  onClick={() =>
                    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
                  }
                >
                  Efek Bunyi: {settings.soundEnabled ? 'Aktif' : 'Mati'}
                </button>
                <button
                  type="button"
                  className={`mode-tab ${settings.voiceEnabled ? 'is-active' : ''}`}
                  onClick={() =>
                    onUpdateSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })
                  }
                >
                  Suara Pemandu: {settings.voiceEnabled ? 'Aktif' : 'Mati'}
                </button>
                <button
                  type="button"
                  className={`mode-tab ${settings.bgmEnabled ? 'is-active' : ''}`}
                  onClick={() =>
                    onUpdateSettings({ ...settings, bgmEnabled: !settings.bgmEnabled })
                  }
                >
                  🎵 Musik Pengantar: {settings.bgmEnabled ? 'Aktif' : 'Mati'}
                </button>
              </div>
            </div>

            <div className="field-group">
              <span className="field-label">Pilar Tumbuh Kembang Hari Ini</span>
              <div className="development-pillars-grid">
                <div className="pillar-item">
                  <div className="pillar-top">
                    <span className="pillar-title">🧠 Kognitif &amp; Spasial</span>
                    <span className="pillar-count">{(progress.completedCounts['shapes'] ?? 0) + (progress.completedCounts['puzzle'] ?? 0)} sesi</span>
                  </div>
                  <div className="pillar-bar-track">
                    <div
                      className="pillar-bar-fill fill-blue"
                      style={{
                        width: `${Math.min(100, (((progress.completedCounts['shapes'] ?? 0) + (progress.completedCounts['puzzle'] ?? 0)) / 4) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-top">
                    <span className="pillar-title">🖐️ Motorik Halus &amp; Menulis</span>
                    <span className="pillar-count">{(progress.completedCounts['trace'] ?? 0) + (progress.completedCounts['coloring'] ?? 0)} sesi</span>
                  </div>
                  <div className="pillar-bar-track">
                    <div
                      className="pillar-bar-fill fill-green"
                      style={{
                        width: `${Math.min(100, (((progress.completedCounts['trace'] ?? 0) + (progress.completedCounts['coloring'] ?? 0)) / 4) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-top">
                    <span className="pillar-title">🏃 Motorik Kasar &amp; Refleks</span>
                    <span className="pillar-count">{(progress.completedCounts['motor'] ?? 0) + (progress.completedCounts['balloon'] ?? 0)} sesi</span>
                  </div>
                  <div className="pillar-bar-track">
                    <div
                      className="pillar-bar-fill fill-orange"
                      style={{
                        width: `${Math.min(100, (((progress.completedCounts['motor'] ?? 0) + (progress.completedCounts['balloon'] ?? 0)) / 4) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="pillar-item">
                  <div className="pillar-top">
                    <span className="pillar-title">👂 Sensori &amp; Bahasa</span>
                    <span className="pillar-count">{progress.completedCounts['sensory'] ?? 0} sesi</span>
                  </div>
                  <div className="pillar-bar-track">
                    <div
                      className="pillar-bar-fill fill-purple"
                      style={{
                        width: `${Math.min(100, ((progress.completedCounts['sensory'] ?? 0) / 3) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="field-group">
              <span className="field-label">Ringkasan Aktivitas Hari Ini</span>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-val">{progress.completedCounts['sensory'] ?? 0}</span>
                  <span className="stat-lbl">Suara &amp; Warna</span>
                </div>
                <div className="stat-box">
                  <span className="stat-val">{progress.completedCounts['shapes'] ?? 0}</span>
                  <span className="stat-lbl">Pasang Bentuk</span>
                </div>
                <div className="stat-box">
                  <span className="stat-val">{progress.completedCounts['trace'] ?? 0}</span>
                  <span className="stat-lbl">Jejak Jari</span>
                </div>
                <div className="stat-box">
                  <span className="stat-val">{progress.completedCounts['motor'] ?? 0}</span>
                  <span className="stat-lbl">Ayo Gerak</span>
                </div>
                <div className="stat-box">
                  <span className="stat-val">{progress.completedCounts['coloring'] ?? 0}</span>
                  <span className="stat-lbl">Buku Warna</span>
                </div>
                <div className="stat-box">
                  <span className="stat-val">{progress.completedCounts['puzzle'] ?? 0}</span>
                  <span className="stat-lbl">Puzzle Keping</span>
                </div>
                <div className="stat-box">
                  <span className="stat-val">{progress.completedCounts['balloon'] ?? 0}</span>
                  <span className="stat-lbl">Tangkap Balon</span>
                </div>
              </div>
            </div>

            <div className={`field-group install-box ${isStandalone ? 'is-installed' : ''}`}>
              <span className="field-label">Status Aplikasi PWA Offline</span>
              {isStandalone ? (
                <div className="installed-badge-box">
                  <div className="installed-pill">
                    <IconCheck size={18} />
                    <span>Aplikasi Terpasang (Mode Layar Penuh Aktif)</span>
                  </div>
                  <p className="install-note">
                    KecilMain berjalan mandiri langsung dari HP Anda, siap dimainkan kapan pun tanpa koneksi internet.
                  </p>
                </div>
              ) : installEvent ? (
                <div className="install-action-wrap">
                  <button type="button" className="primary-action-btn" onClick={onTriggerInstall}>
                    <IconDownload size={20} />
                    <span>Pasang KecilMain di Layar Utama</span>
                  </button>
                  <p className="install-note">
                    Pasang sekali agar anak bisa bermain offline tanpa kuota dan tanpa gangguan tombol browser.
                  </p>
                </div>
              ) : (
                <div className="install-action-wrap">
                  <p className="install-note">
                    {isIos
                      ? 'Di iPhone/iPad (Safari): ketuk tombol Bagikan (Share) di Safari lalu pilih "Tambah ke Layar Utama".'
                      : 'KecilMain dapat dipasang ke layar utama HP Anda agar bisa dimainkan secara offline.'}
                  </p>
                  {onOpenInstallGuide && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        onClose();
                        onOpenInstallGuide();
                      }}
                    >
                      Buka Panduan Pasang Lengkap
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
