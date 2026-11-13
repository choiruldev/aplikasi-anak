import { useEffect, useState, type JSX } from 'react';
import { playGentlePop, playSuccessChime } from '../lib/audio.ts';

interface PromptCard {
  id: string;
  title: string;
  body: string;
}

const PROMPTS: PromptCard[] = [
  {
    id: 'call',
    title: 'Panggil dari sisi kanan-kiri',
    body: 'Sebut namanya dengan nada lembut bergantian dari kanan lalu kiri supaya leher melatih rotasi seimbang.'
  },
  {
    id: 'contrast',
    title: 'Tunjukkan mainan kontras',
    body: 'Letakkan mainan atau kartu kontras berjarak ±25 cm sejajar mata bayi agar ia terdorong mengangkat dagu.'
  },
  {
    id: 'sing',
    title: 'Nyanyi pelan sejajar mata',
    body: 'Turunkan posisi kepala orang tua sejajar matras; melihat wajah Anda membuat bayi merasa lebih tenang.'
  }
];

const PRESET_MINUTES = [1, 3, 5] as const;

interface Props {
  onComplete?: () => void;
}

function formatMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function TummyTimeGuide({ onComplete }: Props): JSX.Element {
  const [presetMinutes, setPresetMinutes] = useState<number>(3);
  const [secondsLeft, setSecondsLeft] = useState<number>(180);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setFinished(true);
          playSuccessChime();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, onComplete]);

  const handleSelectPreset = (mins: number) => {
    playGentlePop();
    setRunning(false);
    setFinished(false);
    setPresetMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const handleReset = () => {
    playGentlePop();
    setRunning(false);
    setFinished(false);
    setSecondsLeft(presetMinutes * 60);
  };

  const toggleRun = () => {
    playGentlePop();
    if (finished) {
      setSecondsLeft(presetMinutes * 60);
      setFinished(false);
    }
    setRunning((r) => !r);
  };

  const activePrompt = PROMPTS[promptIndex];
  const progressPct = Math.round(
    ((presetMinutes * 60 - secondsLeft) / Math.max(1, presetMinutes * 60)) * 100
  );

  return (
    <div className="baby-tool-wrap">
      <div className="baby-tool-banner" role="note">
        Lakukan saat bayi segar · Di matras rata · Awasi penuh tanpa meninggalkan bayi
      </div>

      <div className="tummy-preset-row" role="group" aria-label="Pilih durasi tummy time">
        {PRESET_MINUTES.map((mins) => (
          <button
            key={mins}
            type="button"
            className={`pill-btn ${presetMinutes === mins ? 'is-active' : ''}`}
            onClick={() => handleSelectPreset(mins)}
          >
            {mins} Menit
          </button>
        ))}
      </div>

      <div className="tummy-timer-card">
        <div className="tummy-clock tabular" aria-live="polite">
          {formatMMSS(secondsLeft)}
        </div>
        <div className="linear-track" aria-hidden="true">
          <div className="linear-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="tummy-status">
          {finished
            ? 'Sesi selesai! Peluk si kecil dan beri apresiasi hangat.'
            : running
              ? 'Timer berjalan — jika bayi mulai rewel, boleh berhenti lebih awal.'
              : 'Tekan Mulai saat bayi sudah siap di posisi tengkurap.'}
        </p>
        <div className="baby-tool-controls">
          <button type="button" className="btn-primary-calm" onClick={toggleRun}>
            {running ? 'Jeda' : finished ? 'Ulangi Sesi' : 'Mulai Timer'}
          </button>
          <button type="button" className="btn-outline" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="tummy-prompt-card">
        <div className="tummy-prompt-head">
          <span className="eyebrow">Ide Ajak Bermain ({promptIndex + 1}/{PROMPTS.length})</span>
          <div className="tummy-prompt-tabs">
            {PROMPTS.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                className={`mini-tab ${idx === promptIndex ? 'is-active' : ''}`}
                onClick={() => setPromptIndex(idx)}
                aria-label={`Ide ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
        <h4>{activePrompt.title}</h4>
        <p>{activePrompt.body}</p>
      </div>
    </div>
  );
}
