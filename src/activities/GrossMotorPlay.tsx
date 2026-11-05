import { useEffect, useRef, useState, type JSX } from 'react';
import { ActionPoseIllustration, IconSpeaker, type ActionPoseId } from '../components/Art';
import {
  playNote,
  playStepNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio';

interface GrossMotorCard {
  id: ActionPoseId;
  voiceId: VoiceClipId;
  title: string;
  instruction: string;
  mode: 'count' | 'timer' | 'freeze';
  target: number;
  unitLabel: string;
}

const CARDS: GrossMotorCard[] = [
  {
    id: 'bunny',
    voiceId: 'motor-bunny',
    title: 'Lompat Kelinci',
    instruction: 'Ayo berdiri! Lompat dua kaki seperti kelinci lima kali.',
    mode: 'count',
    target: 5,
    unitLabel: 'lompatan'
  },
  {
    id: 'plane',
    voiceId: 'motor-plane',
    title: 'Pesawat Seimbang',
    instruction: 'Rentangkan dua tangan lebar-lebar! Jaga keseimbangan delapan detik.',
    mode: 'timer',
    target: 8,
    unitLabel: 'detik'
  },
  {
    id: 'stomp',
    voiceId: 'motor-stomp',
    title: 'Langkah Gajah',
    instruction: 'Hentakkan kaki kiri dan kanan pelan-pelan enam kali seperti gajah besar!',
    mode: 'count',
    target: 6,
    unitLabel: 'langkah'
  },
  {
    id: 'reach',
    voiceId: 'motor-reach',
    title: 'Petik Bintang',
    instruction: 'Berjinjit tinggi-tinggi dan raih bintang di langit lima kali!',
    mode: 'count',
    target: 5,
    unitLabel: 'raihan'
  },
  {
    id: 'freeze',
    voiceId: 'motor-freeze',
    title: 'Patung Musik',
    instruction: 'Menari gembira saat musik bunyi! Kalau musik berhenti, diam jadi patung!',
    mode: 'freeze',
    target: 10,
    unitLabel: 'detik'
  }
];

const COUNT_CLIPS: VoiceClipId[] = ['count-1', 'count-2', 'count-3', 'count-4', 'count-5', 'count-6'];

export function GrossMotorPlay({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [cardIdx, setCardIdx] = useState(0);
  const card = CARDS[cardIdx];

  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [frozenPhase, setFrozenPhase] = useState(false);
  const [posePulse, setPosePulse] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    preloadVoices([
      ...CARDS.map((c) => c.voiceId),
      ...COUNT_CLIPS,
      'motor-start-balance',
      'motor-start-dance',
      'motor-freeze-now',
      'motor-dance-again',
      'motor-done'
    ]);
    return () => stopVoice();
  }, []);

  useEffect(() => {
    countRef.current = 0;
    setCount(0);
    setRunning(false);
    setFrozenPhase(false);
    setFinished(false);
    playVoice(card.voiceId, 80);
  }, [card]);

  useEffect(() => {
    if (!running || finished) return;
    if (card.mode === 'count') return;

    const timer = window.setInterval(() => {
      const next = countRef.current + 1;
      countRef.current = next;
      setCount(next);

      if (card.mode === 'freeze') {
        const shouldFreeze = next === 4 || next === 5 || next === 6;
        setFrozenPhase(shouldFreeze);
        setPosePulse(!shouldFreeze && next % 2 === 1);
        if (next === 4) {
          playNote(587.33, 0.35, 0.22);
          playVoice('motor-freeze-now');
        } else if (next === 7) {
          playVoice('motor-dance-again');
        } else if (!shouldFreeze) {
          playStepNote(next);
        }
      } else {
        setPosePulse(next % 2 === 1);
        playStepNote(next);
      }

      if (next >= card.target) {
        setRunning(false);
        setFrozenPhase(false);
        setFinished(true);
        window.setTimeout(() => {
          playSuccessChime();
          onComplete('sticker-motor');
          playVoice('motor-done', 460);
        }, 220);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, finished, card, onComplete]);

  function handleCountStep(): void {
    if (finished) return;
    const next = count + 1;
    setCount(next);
    setPosePulse(true);
    window.setTimeout(() => setPosePulse(false), 240);
    playStepNote(next);
    const countClip = COUNT_CLIPS[next - 1];
    if (countClip) {
      playVoice(countClip, 90);
    }

    if (next >= card.target) {
      setFinished(true);
      window.setTimeout(() => {
        playSuccessChime();
        onComplete('sticker-motor');
        playVoice('motor-done', 480);
      }, 650);
    }
  }

  return (
    <section className="activity-stage" aria-labelledby="motor-title">
      <div className="stage-header">
        <div>
          <h1 id="motor-title" className="stage-title">Ayo Gerak: {card.title}</h1>
          <p className="stage-subtitle">{card.instruction}</p>
        </div>
        <button
          type="button"
          className="voice-btn"
          onClick={() => playVoice(card.voiceId)}
        >
          <IconSpeaker size={22} />
          <span>Dengar</span>
        </button>
      </div>

      <div className="glyph-picker" role="tablist" aria-label="Pilih tantangan gerak">
        {CARDS.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={idx === cardIdx}
            className={`mode-tab ${idx === cardIdx ? 'is-active' : ''}`}
            onClick={() => setCardIdx(idx)}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className={`motor-arena ${frozenPhase ? 'is-frozen' : ''}`}>
        <ActionPoseIllustration pose={card.id} active={posePulse} />

        <div className="motor-controls">
          <div className="motor-counter">
            <span className="motor-big-num">{count}</span>
            <span className="motor-unit">/ {card.target} {card.unitLabel}</span>
          </div>

          {frozenPhase && <p className="freeze-banner">DIAM JADI PATUNG!</p>}

          {finished ? (
            <button
              type="button"
              className="primary-action-btn"
              onClick={() => setCardIdx((prev) => (prev + 1) % CARDS.length)}
            >
              Tantangan Berikutnya
            </button>
          ) : card.mode === 'count' ? (
            <button
              type="button"
              className="giant-tap-btn"
              onClick={handleCountStep}
            >
              Ketuk Setiap Selesai ({count + 1})
            </button>
          ) : (
            <button
              type="button"
              className="giant-tap-btn"
              onClick={() => {
                if (!running) {
                  setRunning(true);
                  playVoice(card.mode === 'freeze' ? 'motor-start-dance' : 'motor-start-balance');
                } else {
                  stopVoice();
                  setRunning(false);
                }
              }}
            >
              {running ? 'Jeda Sebentar' : 'Mulai Musik & Hitung'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
