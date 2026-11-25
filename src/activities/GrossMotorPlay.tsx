import { useEffect, useRef, useState, type JSX } from 'react';
import { ActionPoseIllustration, IconSpeaker, type ActionPoseId } from '../components/Art';
import {
  playGentlePop,
  playNote,
  playStepNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio';
import { startBgm, stopLullabyBgm } from '../lib/bgm';
import { fireConfetti, triggerHaptic } from '../lib/confetti';

interface GrossMotorCard {
  id: ActionPoseId;
  voiceId: VoiceClipId;
  title: string;
  chipLabel: string;
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
    chipLabel: '🐰 Kelinci',
    instruction: 'Lompat dua kaki seperti kelinci!',
    mode: 'count',
    target: 5,
    unitLabel: 'lompat'
  },
  {
    id: 'plane',
    voiceId: 'motor-plane',
    title: 'Pesawat Seimbang',
    chipLabel: '✈️ Pesawat',
    instruction: 'Rentangkan tangan dan jaga seimbang!',
    mode: 'timer',
    target: 8,
    unitLabel: 'detik'
  },
  {
    id: 'stomp',
    voiceId: 'motor-stomp',
    title: 'Langkah Gajah',
    chipLabel: '🐘 Gajah',
    instruction: 'Hentakkan kaki kiri kanan pelan!',
    mode: 'count',
    target: 6,
    unitLabel: 'langkah'
  },
  {
    id: 'reach',
    voiceId: 'motor-reach',
    title: 'Petik Bintang',
    chipLabel: '⭐ Bintang',
    instruction: 'Berjinjit tinggi raih bintang!',
    mode: 'count',
    target: 5,
    unitLabel: 'raih'
  },
  {
    id: 'freeze',
    voiceId: 'motor-freeze',
    title: 'Patung Musik',
    chipLabel: '🎵 Patung',
    instruction: 'Menari saat musik bunyi, diam saat berhenti!',
    mode: 'freeze',
    target: 12,
    unitLabel: 'detik'
  }
];

const COUNT_CLIPS: VoiceClipId[] = ['count-1', 'count-2', 'count-3', 'count-4', 'count-5', 'count-6'];

export function GrossMotorPlay({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [cardIdx, setCardIdx] = useState(0);
  const card = CARDS[cardIdx];

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [autoBeat, setAutoBeat] = useState(false);
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
    return () => {
      stopVoice();
      stopLullabyBgm();
    };
  }, []);

  useEffect(() => {
    stopVoice();
    stopLullabyBgm();
    countRef.current = 0;
    setCount(0);
    setRunning(false);
    setAutoBeat(false);
    setFrozenPhase(false);
    setFinished(false);
    playVoice(card.voiceId, 80);
    return () => {
      stopVoice();
      stopLullabyBgm();
    };
  }, [card]);

  // Timer & Patung Musik (real dance BGM + sudden silence freeze!)
  useEffect(() => {
    if (!running || finished || card.mode === 'count') return;

    if (card.mode === 'freeze' && !frozenPhase) {
      startBgm('dance');
    }

    const timer = window.setInterval(() => {
      const next = countRef.current + 1;
      countRef.current = next;
      setCount(next);

      if (card.mode === 'freeze') {
        const shouldFreeze = next === 4 || next === 5 || next === 6 || next === 10;
        setFrozenPhase(shouldFreeze);
        setPosePulse(!shouldFreeze && next % 2 === 1);
        if (next === 4 || next === 10) {
          stopLullabyBgm();
          playNote(587.33, 0.25, 0.2);
          playVoice('motor-freeze-now');
        } else if (next === 7) {
          startBgm('dance');
          playVoice('motor-dance-again');
        }
      } else {
        setPosePulse(next % 2 === 1);
        playStepNote(next);
      }

      if (next >= card.target) {
        stopLullabyBgm();
        setRunning(false);
        setFrozenPhase(false);
        setFinished(true);
        triggerHaptic('success');
        fireConfetti();
        window.setTimeout(() => {
          playSuccessChime();
          onCompleteRef.current('sticker-motor');
          playVoice('motor-done', 400);
        }, 220);
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [running, finished, card]);

  // Hands-free Auto-Ritme for count exercises
  useEffect(() => {
    if (!autoBeat || finished || card.mode !== 'count') return;
    const timer = window.setInterval(() => {
      const next = countRef.current + 1;
      countRef.current = next;
      setCount(next);
      setPosePulse(true);
      window.setTimeout(() => setPosePulse(false), 260);
      playStepNote(next);
      const countClip = COUNT_CLIPS[next - 1];
      if (countClip) playVoice(countClip, 80);

      if (next >= card.target) {
        setAutoBeat(false);
        setFinished(true);
        triggerHaptic('success');
        fireConfetti();
        window.setTimeout(() => {
          playSuccessChime();
          onCompleteRef.current('sticker-motor');
          playVoice('motor-done', 440);
        }, 550);
      }
    }, 1550);

    return () => window.clearInterval(timer);
  }, [autoBeat, finished, card]);

  function handleCountStep(): void {
    if (finished) return;
    triggerHaptic('tap');
    const next = countRef.current + 1;
    countRef.current = next;
    setCount(next);
    setPosePulse(true);
    window.setTimeout(() => setPosePulse(false), 240);
    playStepNote(next);
    const countClip = COUNT_CLIPS[next - 1];
    if (countClip) playVoice(countClip, 90);

    if (next >= card.target) {
      setAutoBeat(false);
      setFinished(true);
      triggerHaptic('success');
      fireConfetti();
      window.setTimeout(() => {
        playSuccessChime();
        onComplete('sticker-motor');
        playVoice('motor-done', 460);
      }, 600);
    }
  }

  function handleToggleTimer(): void {
    if (!running) {
      setRunning(true);
      playGentlePop();
      if (card.mode === 'freeze') {
        startBgm('dance');
        playVoice('motor-start-dance');
      } else {
        playVoice('motor-start-balance');
      }
    } else {
      stopVoice();
      stopLullabyBgm();
      playGentlePop();
      setRunning(false);
    }
  }

  function handleRestart(): void {
    stopVoice();
    stopLullabyBgm();
    countRef.current = 0;
    setCount(0);
    setRunning(false);
    setAutoBeat(false);
    setFrozenPhase(false);
    setFinished(false);
    playGentlePop();
    playVoice(card.voiceId, 80);
  }

  function handleSelectCard(idx: number): void {
    if (idx === cardIdx) return;
    stopVoice();
    stopLullabyBgm();
    countRef.current = 0;
    setCount(0);
    setRunning(false);
    setAutoBeat(false);
    setFrozenPhase(false);
    setFinished(false);
    setCardIdx(idx);
  }

  function handlePoseClick(): void {
    if (finished) {
      handleRestart();
      return;
    }
    if (card.mode === 'count') {
      handleCountStep();
    } else {
      handleToggleTimer();
    }
  }

  return (
    <section className="game-clean-stage" aria-label="Gerak Ceria">
      <div className="game-top-bar">
        <span className="game-mini-pill">
          {card.title} · {count}/{card.target} {card.unitLabel}
        </span>

        <div className="game-top-tools">
          {card.mode === 'count' && !finished && (
            <button
              type="button"
              className={`secondary-btn touch-safe ${autoBeat ? 'is-active-chip' : ''}`}
              onClick={() => {
                playGentlePop();
                setAutoBeat((v) => !v);
              }}
              aria-pressed={autoBeat}
            >
              {autoBeat ? '⏸ Auto-Ritme' : '⏱️ Auto-Ritme'}
            </button>
          )}
          <button
            type="button"
            className="icon-tool-btn touch-safe"
            onClick={() => playVoice(card.voiceId)}
            aria-label="Dengar instruksi"
          >
            <IconSpeaker size={20} />
          </button>
        </div>
      </div>

      <div className="game-chip-scroll" role="tablist" aria-label="Pilih tantangan gerak">
        {CARDS.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={idx === cardIdx}
            className={`mode-tab touch-safe ${idx === cardIdx ? 'is-active' : ''}`}
            onClick={() => handleSelectCard(idx)}
          >
            {c.chipLabel}
          </button>
        ))}
      </div>

      <p className="game-mini-status">
        {finished ? 'Yeaaay! Tantangan selesai!' : frozenPhase ? '🧊 DIAM JADI PATUNG!' : card.instruction}
      </p>

      <div className={`motor-arena compact-motor ${frozenPhase ? 'is-frozen' : ''}`}>
        <button
          type="button"
          className="motor-pose-btn"
          onClick={handlePoseClick}
          aria-label={`Aksi gerak ${card.title}`}
        >
          <ActionPoseIllustration pose={card.id} active={posePulse} />
          <span className="motor-pose-hint">
            {card.mode === 'count'
              ? autoBeat
                ? '🎵 Auto-Ritme aktif!'
                : 'Ketuk tiap gerakan 👆'
              : running
                ? frozenPhase
                  ? '🧊 DIAM!'
                  : '🎵 Ayo menari!'
                : '▶ Ketuk untuk Mulai'}
          </span>
        </button>

        <div className="motor-controls">
          <div className="motor-counter">
            <span className="motor-big-num">{count}</span>
            <span className="motor-unit">
              / {card.target} {card.unitLabel}
            </span>
          </div>

          {frozenPhase && <p className="freeze-banner">🧊 DIAM JADI PATUNG!</p>}

          {finished ? (
            <div className="motor-finish-actions">
              <button type="button" className="secondary-btn touch-safe" onClick={handleRestart}>
                🔄 Ulangi
              </button>
              <button
                type="button"
                className="primary-btn touch-safe"
                onClick={() => handleSelectCard((cardIdx + 1) % CARDS.length)}
              >
                Gerakan Berikutnya ➡
              </button>
            </div>
          ) : card.mode === 'count' ? (
            <button type="button" className="giant-tap-btn touch-safe" onClick={handleCountStep}>
              Hitung ({count + 1}/{card.target})
            </button>
          ) : (
            <button type="button" className="giant-tap-btn touch-safe" onClick={handleToggleTimer}>
              {card.mode === 'freeze'
                ? running
                  ? frozenPhase
                    ? '🧊 DIAM JADI PATUNG!'
                    : '⏸ Jeda Musik'
                  : count > 0
                    ? '▶ Lanjut Menari'
                    : '▶ Putar Musik Menari'
                : running
                  ? `⏸ Jeda (${count}/${card.target}d)`
                  : count > 0
                    ? '▶ Lanjut'
                    : `▶ Mulai (${card.target} Detik)`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
