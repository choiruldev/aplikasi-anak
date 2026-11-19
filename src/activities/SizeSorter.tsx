import { useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import { playGentlePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface SizeRound {
  id: string;
  objectName: string;
  ask: 'besar' | 'kecil';
  color: string;
}

const ROUNDS: SizeRound[] = [
  { id: 'r1', objectName: 'Bola', ask: 'besar', color: '#2D6CDF' },
  { id: 'r2', objectName: 'Bola', ask: 'kecil', color: '#E07A18' },
  { id: 'r3', objectName: 'Bintang', ask: 'besar', color: '#F7B731' },
  { id: 'r4', objectName: 'Kotak', ask: 'kecil', color: '#2B6E4F' },
  { id: 'r5', objectName: 'Lingkaran', ask: 'besar', color: '#8045D9' }
];

export function SizeSorter({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'ok' | 'try'>('idle');
  const current = ROUNDS[roundIdx % ROUNDS.length];
  const bigOnLeft = roundIdx % 2 === 0;

  const choose = (picked: 'besar' | 'kecil') => {
    if (picked === current.ask) {
      triggerHaptic('success');
      playSuccessChime();
      setFeedback('ok');
      const nextScore = score + 1;
      setScore(nextScore);
      if (nextScore >= 5) {
        fireConfetti();
        onComplete('sticker-shapes');
      }
      window.setTimeout(() => {
        setFeedback('idle');
        setRoundIdx((r) => (r + 1) % ROUNDS.length);
      }, 750);
    } else {
      triggerHaptic('tap');
      playGentlePop();
      setFeedback('try');
      speakPhrase(`Yuk cari ${current.objectName} yang ${current.ask}`);
    }
  };

  const renderShape = (isBig: boolean) => {
    const px = isBig ? 96 : 52;
    return (
      <div
        className="size-shape-circle"
        style={{
          width: `${px}px`,
          height: `${px}px`,
          backgroundColor: current.color
        }}
      />
    );
  };

  return (
    <div className="edu-stage">
      <div className="edu-stage-top">
        <VisualStarMeter count={Math.min(score, 5)} total={5} />
        <span className="pill-badge">
          {feedback === 'ok' ? 'Hebat!' : feedback === 'try' ? 'Coba satu lagi' : 'Pilih ukuran tepat'}
        </span>
      </div>

      <h2 className="edu-prompt-title">
        Pilih {current.objectName} yang <span>{current.ask.toUpperCase()}</span>
      </h2>

      <div className="size-choice-row">
        <button
          type="button"
          className="size-choice-card"
          onClick={() => choose(bigOnLeft ? 'besar' : 'kecil')}
        >
          {renderShape(bigOnLeft)}
          <strong>{bigOnLeft ? 'Besar' : 'Kecil'}</strong>
        </button>

        <button
          type="button"
          className="size-choice-card"
          onClick={() => choose(bigOnLeft ? 'kecil' : 'besar')}
        >
          {renderShape(!bigOnLeft)}
          <strong>{bigOnLeft ? 'Kecil' : 'Besar'}</strong>
        </button>
      </div>
    </div>
  );
}
