import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { startLullabyBgm, stopLullabyBgm } from '../lib/bgm.ts';

type SootherSound = 'off' | 'white-noise' | 'rain' | 'lullaby';

interface SoundOption {
  id: Exclude<SootherSound, 'off'>;
  title: string;
  desc: string;
}

const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'white-noise',
    title: 'White Noise Lembut',
    desc: 'Desiran hangat frekuensi rendah (lowpass 900Hz) mirip suasana rahim.'
  },
  {
    id: 'rain',
    title: 'Rintik Hujan Tenang',
    desc: 'Suara hujan lembut terfilter untuk meredam suara bising sekitar.'
  },
  {
    id: 'lullaby',
    title: 'Lullaby Kotak Musik',
    desc: 'Melodi kalem bertempo pelan untuk pengantar tidur siang atau malam.'
  }
];

const TIMER_OPTIONS = [10, 20, 30] as const;

interface Props {
  onComplete?: () => void;
}

function formatMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function BabySoother({ onComplete }: Props): JSX.Element {
  const [activeSound, setActiveSound] = useState<SootherSound>('off');
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [secondsLeft, setSecondsLeft] = useState<number>(600);
  const [rattlePulse, setRattlePulse] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const rattleTimeoutRef = useRef<number | null>(null);

  const ensureContext = useCallback((): AudioContext | null => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctxRef.current) {
      ctxRef.current = new AudioCtx();
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const stopNoiseNodes = useCallback((immediate = false) => {
    if (fadeTimeoutRef.current !== null) {
      window.clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    if (gainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      try {
        gainRef.current.gain.cancelScheduledValues(now);
        gainRef.current.gain.setTargetAtTime(0.0001, now, immediate ? 0.01 : 0.08);
      } catch {
        // Ignore teardown timing edge
      }
    }
    if (sourceRef.current) {
      const src = sourceRef.current;
      sourceRef.current = null;
      const stopSrc = () => {
        try {
          src.stop();
          src.disconnect();
        } catch {
          // Ignore already stopped
        }
      };
      if (immediate) {
        stopSrc();
      } else {
        fadeTimeoutRef.current = window.setTimeout(() => {
          fadeTimeoutRef.current = null;
          stopSrc();
        }, 180);
      }
    }
    gainRef.current = null;
  }, []);

  const stopAllSounds = useCallback(
    (immediate = false) => {
      stopNoiseNodes(immediate);
      stopLullabyBgm();
    },
    [stopNoiseNodes]
  );

  const startNoiseEngine = useCallback(
    (mode: 'white-noise' | 'rain') => {
      const ctx = ensureContext();
      if (!ctx) return;

      stopNoiseNodes();
      stopLullabyBgm();

      const length = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Gently smoothed pink-weighted noise to avoid harsh digital hiss
      let lastOut = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.08 * white) / 1.08;
        data[i] = mode === 'rain' ? lastOut * 2.2 + white * 0.14 : lastOut * 2.4;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      if (mode === 'white-noise') {
        filter.type = 'lowpass';
        filter.frequency.value = 900;
      } else {
        filter.type = 'bandpass';
        filter.frequency.value = 1100;
        filter.Q.value = 0.65;
      }

      const gain = ctx.createGain();
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(mode === 'rain' ? 0.18 : 0.15, now + 0.35);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(now);

      sourceRef.current = source;
      gainRef.current = gain;
    },
    [ensureContext, stopNoiseNodes]
  );

  const handleToggleSound = (soundId: Exclude<SootherSound, 'off'>) => {
    if (activeSound === soundId) {
      stopAllSounds();
      setActiveSound('off');
      return;
    }

    setSecondsLeft(timerMinutes * 60);
    setActiveSound(soundId);

    if (soundId === 'lullaby') {
      stopNoiseNodes();
      startLullabyBgm();
    } else {
      startNoiseEngine(soundId);
    }
    onComplete?.();
  };

  const handleSelectTimer = (mins: number) => {
    setTimerMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  const handleStopSound = () => {
    stopAllSounds();
    setActiveSound('off');
  };

  const playRattle = () => {
    const ctx = ensureContext();
    setRattlePulse(true);
    if (rattleTimeoutRef.current !== null) {
      window.clearTimeout(rattleTimeoutRef.current);
    }
    rattleTimeoutRef.current = window.setTimeout(() => {
      rattleTimeoutRef.current = null;
      setRattlePulse(false);
    }, 180);
    if (!ctx) return;

    const now = ctx.currentTime;
    const pulses = [0, 0.085];
    pulses.forEach((offset, idx) => {
      const len = Math.floor(ctx.sampleRate * 0.06);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = idx === 0 ? 1800 : 2300;
      bandpass.Q.value = 1.6;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.14, now + offset);
      g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);

      noise.connect(bandpass);
      bandpass.connect(g);
      g.connect(ctx.destination);
      noise.start(now + offset);
    });
    onComplete?.();
  };

  useEffect(() => {
    if (activeSound === 'off') return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [activeSound]);

  useEffect(() => {
    if (activeSound !== 'off' && secondsLeft === 0) {
      stopAllSounds();
      setActiveSound('off');
    }
  }, [activeSound, secondsLeft, stopAllSounds]);

  useEffect(() => {
    return () => {
      if (rattleTimeoutRef.current !== null) {
        window.clearTimeout(rattleTimeoutRef.current);
        rattleTimeoutRef.current = null;
      }
      stopAllSounds(true);
      if (ctxRef.current) {
        void ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, [stopAllSounds]);

  return (
    <div className="baby-tool-wrap">
      <div className="baby-tool-banner" role="note">
        Putar volume pelan (±45–50 dB) dan letakkan ponsel berjarak minimal 1 meter dari kepala bayi.
      </div>

      <div className="soother-sound-grid">
        {SOUND_OPTIONS.map((opt) => {
          const isActive = activeSound === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`soother-option ${isActive ? 'is-active' : ''}`}
              onClick={() => handleToggleSound(opt.id)}
              aria-pressed={isActive}
            >
              <div className="soother-option-head">
                <strong>{opt.title}</strong>
                <span className="pill-badge">{isActive ? 'Aktif' : 'Putar'}</span>
              </div>
              <p>{opt.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="soother-timer-box">
        <div className="soother-timer-row">
          <div>
            <span className="eyebrow">Auto-Off Timer</span>
            <div className="soother-countdown tabular">
              {activeSound === 'off' ? `${timerMinutes}:00` : formatMMSS(secondsLeft)}
            </div>
          </div>
          <div className="tummy-preset-row" role="group" aria-label="Durasi mati otomatis">
            {TIMER_OPTIONS.map((mins) => (
              <button
                key={mins}
                type="button"
                className={`pill-btn ${timerMinutes === mins ? 'is-active' : ''}`}
                onClick={() => handleSelectTimer(mins)}
              >
                {mins} mnt
              </button>
            ))}
          </div>
        </div>
        {activeSound !== 'off' && (
          <button type="button" className="btn-outline" onClick={handleStopSound}>
            Matikan Suara
          </button>
        )}
      </div>

      <button
        type="button"
        className={`soother-rattle-pad ${rattlePulse ? 'is-tapped' : ''}`}
        onClick={playRattle}
      >
        <strong>Ketuk Kerincingan Lembut</strong>
        <span>Bunyikan di sisi kiri atau kanan untuk melatih respons menoleh si kecil</span>
      </button>
    </div>
  );
}
