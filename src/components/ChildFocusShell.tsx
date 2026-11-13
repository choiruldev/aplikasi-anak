import { useState, type JSX, type ReactNode } from 'react';
import { IconLock, IconSpeaker } from '../components/Art.tsx';
import type { SimulationModuleMeta } from '../data/stimulationData.ts';
import { formatRemainingSeconds } from '../lib/geometry.ts';

interface Props {
  moduleMeta: SimulationModuleMeta;
  isTimeUp: boolean;
  remainingSec: number;
  dailyLimitMinutes: number;
  bgmEnabled: boolean;
  childLockExit: boolean;
  onToggleBgm: () => void;
  onExit: () => void;
  onRequestResetTimer: () => void;
  children: ReactNode;
}

function makeGateChallenge() {
  const a = 2 + Math.floor(Math.random() * 6);
  const b = 2 + Math.floor(Math.random() * 6);
  return { a, b, answer: a + b };
}

export function ChildFocusShell({
  moduleMeta,
  isTimeUp,
  remainingSec,
  dailyLimitMinutes,
  bgmEnabled,
  childLockExit,
  onToggleBgm,
  onExit,
  onRequestResetTimer,
  children
}: Props): JSX.Element {
  const [gateAction, setGateAction] = useState<'exit' | 'reset-timer' | null>(null);
  const [challenge, setChallenge] = useState(makeGateChallenge);
  const [inputValue, setInputValue] = useState('');
  const [gateError, setGateError] = useState(false);

  const openGate = (action: 'exit' | 'reset-timer') => {
    setChallenge(makeGateChallenge());
    setInputValue('');
    setGateError(false);
    setGateAction(action);
  };

  const handleBackClick = () => {
    if (childLockExit && !moduleMeta.isBabyTool) {
      openGate('exit');
      return;
    }
    onExit();
  };

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(inputValue.trim()) === challenge.answer) {
      const action = gateAction;
      setGateAction(null);
      if (action === 'exit') {
        onExit();
      } else if (action === 'reset-timer') {
        onRequestResetTimer();
      }
      return;
    }
    setGateError(true);
  };

  const showLockedOverlay = !moduleMeta.isBabyTool && isTimeUp;

  return (
    <div className="focus-shell">
      <header className="focus-topbar">
        <button type="button" className="focus-back-btn" onClick={handleBackClick}>
          ← Kembali
        </button>

        <div className="focus-title-group">
          <strong>{moduleMeta.title}</strong>
          {moduleMeta.isBabyTool ? (
            <span className="focus-sub-badge">Mode Bayi · Bebas Timer</span>
          ) : dailyLimitMinutes > 0 ? (
            <span className="focus-sub-badge tabular">
              Sisa hari ini: {formatRemainingSeconds(remainingSec)}
            </span>
          ) : (
            <span className="focus-sub-badge">Simulasi 1–5 Thn</span>
          )}
        </div>

        <button
          type="button"
          className={`focus-bgm-btn ${bgmEnabled ? 'is-on' : ''}`}
          onClick={onToggleBgm}
          aria-pressed={bgmEnabled}
          aria-label={bgmEnabled ? 'Matikan musik latar' : 'Nyalakan musik latar'}
        >
          <IconSpeaker size={18} />
          <span>{bgmEnabled ? 'Musik On' : 'Musik Off'}</span>
        </button>
      </header>

      <main className="focus-stage">
        {showLockedOverlay ? (
          <div className="focus-rest-card" role="status">
            <div className="focus-rest-icon" aria-hidden="true">
              <IconLock size={28} />
            </div>
            <h2>Waktu Layar Hari Ini Selesai</h2>
            <p>
              Si kecil sudah cukup berinteraksi dengan layar hari ini. Ajak lanjut bermain balok, membaca buku, atau memeluk hangat ya.
            </p>
            <div className="focus-rest-actions">
              <button type="button" className="btn-primary-calm" onClick={onExit}>
                Kembali ke Menu Orang Tua
              </button>
              <button type="button" className="btn-outline" onClick={() => openGate('reset-timer')}>
                Reset Timer (Orang Tua)
              </button>
            </div>
          </div>
        ) : (
          children
        )}
      </main>

      {gateAction && (
        <div className="gate-backdrop" role="dialog" aria-modal="true" aria-label="Verifikasi Orang Tua">
          <form className="gate-modal" onSubmit={handleGateSubmit}>
            <h3>Verifikasi Orang Tua</h3>
            <p className="muted-copy">
              {gateAction === 'exit'
                ? 'Jawab hitungan sederhana untuk keluar dari Mode Fokus Anak.'
                : 'Jawab hitungan sederhana untuk mereset timer layar hari ini.'}
            </p>
            <label className="gate-question">
              Berapa hasil {challenge.a} + {challenge.b} ?
              <input
                type="number"
                inputMode="numeric"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setGateError(false);
                }}
                autoFocus
                required
              />
            </label>
            {gateError && <p className="gate-error">Belum tepat — silakan coba lagi.</p>}
            <div className="gate-actions">
              <button type="button" className="btn-outline" onClick={() => setGateAction(null)}>
                Batal
              </button>
              <button type="submit" className="btn-primary-calm">
                Lanjutkan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
