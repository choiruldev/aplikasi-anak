import { useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import { playGentlePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface MathChallenge {
  mode: 'add' | 'pattern';
  a: number;
  b: number;
  answer: string;
  options: string[];
  patternTokens?: string[];
}

const CHALLENGES: MathChallenge[] = [
  { mode: 'add', a: 1, b: 2, answer: '3', options: ['2', '3', '4'] },
  { mode: 'pattern', a: 0, b: 0, answer: '●', options: ['●', '■', '▲'], patternTokens: ['●', '■', '●', '■'] },
  { mode: 'add', a: 2, b: 2, answer: '4', options: ['3', '4', '5'] },
  { mode: 'pattern', a: 0, b: 0, answer: '▲', options: ['●', '▲', '■'], patternTokens: ['▲', '●', '▲', '●'] },
  { mode: 'add', a: 3, b: 2, answer: '5', options: ['4', '5', '6'] }
];

export function MathPatterns({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'idle' | 'ok' | 'try'>('idle');

  const item = CHALLENGES[idx % CHALLENGES.length];

  const handlePick = (opt: string) => {
    if (opt === item.answer) {
      triggerHaptic('success');
      playSuccessChime();
      setFeedback('ok');
      speakPhrase(`Betul, ${opt}!`);
      const next = score + 1;
      setScore(next);
      if (next >= 5) {
        fireConfetti();
        onComplete('sticker-numbers');
      }
      window.setTimeout(() => {
        setFeedback('idle');
        setIdx((p) => (p + 1) % CHALLENGES.length);
      }, 800);
    } else {
      playGentlePop();
      setFeedback('try');
    }
  };

  return (
    <div className="edu-stage">
      <div className="edu-stage-top">
        <VisualStarMeter count={Math.min(score, 5)} total={5} />
        <span className="pill-badge">
          {feedback === 'ok' ? 'Benar!' : feedback === 'try' ? 'Hitung pelan lagi' : 'Pilih jawaban tepat'}
        </span>
      </div>

      {item.mode === 'add' ? (
        <div className="math-visual-card">
          <div className="math-dots-group">
            {Array.from({ length: item.a }).map((_, i) => (
              <span key={i} className="math-dot is-a" />
            ))}
          </div>
          <strong>+</strong>
          <div className="math-dots-group">
            {Array.from({ length: item.b }).map((_, i) => (
              <span key={i} className="math-dot is-b" />
            ))}
          </div>
          <strong>= ?</strong>
        </div>
      ) : (
        <div className="math-visual-card">
          {item.patternTokens?.map((tok, i) => (
            <span key={i} className="pattern-token">{tok}</span>
          ))}
          <span className="pattern-token is-blank">?</span>
        </div>
      )}

      <div className="syllable-choices-row">
        {item.options.map((opt) => (
          <button
            key={opt}
            type="button"
            className="syllable-pick-btn"
            onClick={() => handlePick(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
