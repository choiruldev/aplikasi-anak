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
import { fireConfetti, triggerHaptic } from '../lib/confetti';

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

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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
    stopVoice();
    countRef.current = 0;
    setCount(0);
    setRunning(false);
    setFrozenPhase(false);
    setFinished(false);
    playVoice(card.voiceId, 80);
    return () => {
      stopVoice();
    };
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
        triggerHaptic('success');
        fireConfetti();
        window.setTimeout(() => {
          playSuccessChime();
          onCompleteRef.current('sticker-motor');
          playVoice('motor-done', 460);
        }, 220);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, finished, card]);

  function handleCountStep(): void {
    if (finished) return;
    triggerHaptic('tap');
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
      triggerHaptic('success');
      fireConfetti();
      window.setTimeout(() => {
        playSuccessChime();
        onComplete('sticker-motor');
        playVoice('motor-done', 480);
      }, 650);
    }
  }

  function handleToggleTimer(): void {
    if (!running) {
      setRunning(true);
      playGentlePop();
      playVoice(card.mode === 'freeze' ? 'motor-start-dance' : 'motor-start-balance');
    } else {
      stopVoice();
      playGentlePop();
      setRunning(false);
    }
  }

  function handleRestart(): void {
    stopVoice();
    countRef.current = 0;
    setCount(0);
    setRunning(false);
    setFrozenPhase(false);
    setFinished(false);
    playGentlePop();
    playVoice(card.voiceId, 80);
  }

  function handleSelectCard(idx: number): void {
    if (idx === cardIdx) return;
    stopVoice();
    countRef.current = 0;
    setCount(0);
    setRunning(false);
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
            onClick={() => handleSelectCard(idx)}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className={`motor-arena ${frozenPhase ? 'is-frozen' : ''}`}>
        <button
          type="button"
          className="motor-pose-btn"
          onClick={handlePoseClick}
          aria-label={`Aksi gerak ${card.title}`}
        >
          <ActionPoseIllustration pose={card.id} active={posePulse} />
          <span className="motor-pose-hint">
            {card.mode === 'count'
              ? 'Ketuk untuk hitung 👆'
              : running
                ? (frozenPhase ? '🧊 Diam jadi patung!' : '⏱ Sedang berjalan...')
                : '▶ Ketuk untuk Mulai'}
          </span>
        </button>

        <div className="motor-controls">
          <div className="motor-counter">
            <span className="motor-big-num">{count}</span>
            <span className="motor-unit">/ {card.target} {card.unitLabel}</span>
          </div>

          {frozenPhase && <p className="freeze-banner">DIAM JADI PATUNG!</p>}

          {finished ? (
            <div className="motor-finish-actions">
              <button
                type="button"
                className="secondary-action-btn"
                onClick={handleRestart}
              >
                🔄 Ulangi
              </button>
              <button
                type="button"
                className="primary-action-btn"
                onClick={() => handleSelectCard((cardIdx + 1) % CARDS.length)}
              >
                Tantangan Berikutnya ➡
              </button>
            </div>
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
              onClick={handleToggleTimer}
            >
              {card.mode === 'freeze' ? (
                running ? (
                  frozenPhase ? '🧊 DIAM JADI PATUNG!' : '⏸ Jeda Musik Menari'
                ) : count > 0 ? (
                  '▶ Lanjutkan Menari'
                ) : (
                  '▶ Putar Musik Menari'
                )
              ) : (
                running ? (
                  `⏸ Jeda (${count}/${card.target}s)`
                ) : count > 0 ? (
                  '▶ Lanjutkan Hitung'
                ) : (
                  `▶ Mulai Hitung (${card.target} Detik)`
                )
              )}
            </button>
          )}

          <div className="motor-guide-box">
            <span className="motor-guide-icon">💡</span>
            <div className="motor-guide-text">
              <strong>Panduan Orang Tua:</strong>{' '}
              {card.mode === 'timer' && (
                <span>Tekan tombol <strong>Mulai</strong> 1 kali. Balita berdiri merentangkan tangan seperti sayap pesawat selama 8 detik. Timer & musik berjalan otomatis tanpa perlu diklik terus-menerus!</span>
              )}
              {card.mode === 'freeze' && (
                <span>Tekan tombol <strong>Mulai</strong> 1 kali. Musik akan berputar dan anak bebas menari. Saat musik berhenti & muncul tanda <em>DIAM JADI PATUNG</em>, anak harus mematung!</span>
              )}
              {card.mode === 'count' && (
                <span>Ajak anak melakukan gerakan di ruangan nyata. Setiap kali selesai 1 kali gerakan, ketuk tombol atau gambar untuk menambah hitungan!</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
