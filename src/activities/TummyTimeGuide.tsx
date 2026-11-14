import { useEffect, useRef, useState, type JSX } from 'react';
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
const DAILY_GOAL_SECONDS = 15 * 60;

interface Props {
  dailySeconds?: number;
  onAddSeconds?: (seconds: number) => void;
  onComplete?: () => void;
}

function formatMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function TummyTimeGuide({
  dailySeconds = 0,
  onAddSeconds,
  onComplete
}: Props): JSX.Element {
  const [presetMinutes, setPresetMinutes] = useState<number>(3);
  const [secondsLeft, setSecondsLeft] = useState<number>(180);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const onAddSecondsRef = useRef(onAddSeconds);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onAddSecondsRef.current = onAddSeconds;
  }, [onAddSeconds]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && secondsLeft === 0) {
      setRunning(false);
      setFinished(true);
      playSuccessChime();
      onAddSecondsRef.current?.(presetMinutes * 60);
      onCompleteRef.current?.();
    }
  }, [running, secondsLeft, presetMinutes]);

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
  const goalPct = Math.min(100, Math.round((dailySeconds / DAILY_GOAL_SECONDS) * 100));
  const dailyMinutes = Math.round(dailySeconds / 60);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - goalPct / 100);

  return (
    <div className="baby-tool-wrap">
      <div className="tummy-goal-strip">
        <div className="tummy-goal-left">
          <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r={radius} fill="none" stroke="var(--line)" strokeWidth="5" />
            <circle
              cx="26"
              cy="26"
              r={radius}
              fill="none"
              stroke="var(--sage)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 26 26)"
            />
          </svg>
          <div>
            <strong>{dailyMinutes}/15 mnt</strong>
            <span>Target harian</span>
          </div>
        </div>
        <button
          type="button"
          className="btn-outline btn-compact"
          onClick={() => {
            playGentlePop();
            onAddSeconds?.(60);
          }}
        >
          +1 mnt
        </button>
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
            ? 'Sesi selesai!'
            : running
              ? 'Timer aktif · Awasi selalu'
              : 'Matras rata · Bayi siap tengkurap'}
        </p>
        <div className="baby-tool-controls">
          <button type="button" className="btn-primary-calm" onClick={toggleRun}>
            {running ? 'Jeda' : finished ? 'Ulangi' : 'Mulai'}
          </button>
          <button type="button" className="btn-outline" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="tummy-prompt-card">
        <div className="tummy-prompt-head">
          <span className="eyebrow">Ide Bermain ({promptIndex + 1}/{PROMPTS.length})</span>
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
