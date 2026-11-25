import { useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import { playBubblePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';
import {
  generateMathQuestion,
  type MathQuestionMode,
  type PatternToken
} from '../lib/mathGame.ts';

function TokenShapeSvg({ token, size = 34 }: { token: PatternToken; size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      {token === 'circle' && <circle cx="20" cy="20" r="14" fill="#E85A5A" />}
      {token === 'square' && <rect x="7" y="7" width="26" height="26" rx="5" fill="#2D8CF0" />}
      {token === 'triangle' && <polygon points="20,5 35,33 5,33" fill="#2B9361" />}
      {token === 'star' && (
        <polygon
          points="20,4 24.5,14 35,15.5 27.5,23 29.2,34 20,28.8 10.8,34 12.5,23 5,15.5 15.5,14"
          fill="#F7B731"
        />
      )}
    </svg>
  );
}

const ITEM_EMOJI: Record<'apple' | 'star' | 'duck' | 'berry', string> = {
  apple: '🍎',
  star: '⭐',
  duck: '🦆',
  berry: '🍓'
};

export function MathPatterns({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [mode, setMode] = useState<MathQuestionMode>('add');
  const [seed, setSeed] = useState(11);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Pilih jawaban yang tepat!');
  const [rewarded, setRewarded] = useState(false);

  const item = generateMathQuestion(mode, seed);

  function switchMode(nextMode: MathQuestionMode): void {
    setMode(nextMode);
    setSeed((s) => s + 7);
    setFeedback('Pilih jawaban yang tepat!');
  }

  function handlePick(opt: string): void {
    if (opt === item.answer) {
      triggerHaptic('success');
      playSuccessChime();
      setFeedback('Hebat, jawaban benar!');
      speakPhrase(mode === 'pattern' ? 'Pola tepat!' : `Betul, ${opt}!`);
      const next = score + 1;
      setScore(next);
      if (next >= 5 && !rewarded) {
        setRewarded(true);
        fireConfetti();
        onComplete('sticker-numbers');
      }
      window.setTimeout(() => {
        setSeed((s) => s + 13);
        setFeedback('Soal baru! Yuk hitung!');
      }, 850);
    } else {
      playBubblePop(240);
      setFeedback('Hitung pelan sekali lagi ya!');
    }
  }

  return (
    <section className="game-clean-stage" aria-label="Hitung dan Pola">
      <div className="game-top-bar">
        <VisualStarMeter count={Math.min(score, 5)} total={5} />
        <div className="chip-row" role="tablist">
          {(
            [
              ['add', 'Tambah (+)'],
              ['sub', 'Kurang (-)'],
              ['pattern', 'Pola']
            ] as Array<[MathQuestionMode, string]>
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              className={`pill-btn touch-safe ${mode === m ? 'is-active' : ''}`}
              onClick={() => switchMode(m)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="game-mini-status">{feedback}</p>

      {mode === 'pattern' ? (
        <div className="math-visual-card">
          {item.patternTokens?.map((tok, i) => (
            <span key={i} className="pattern-token">
              <TokenShapeSvg token={tok} size={36} />
            </span>
          ))}
          <span className="pattern-token is-blank">?</span>
        </div>
      ) : (
        <div className="math-visual-card">
          <div className="math-dots-group">
            {Array.from({ length: item.a }).map((_, i) => (
              <span key={i} className="math-fruit-emoji" aria-hidden="true">
                {ITEM_EMOJI[item.itemKind]}
              </span>
            ))}
          </div>
          <strong>{mode === 'add' ? '+' : '−'}</strong>
          <div className="math-dots-group">
            {Array.from({ length: item.b }).map((_, i) => (
              <span key={i} className={`math-fruit-emoji ${mode === 'sub' ? 'is-crossed' : ''}`} aria-hidden="true">
                {ITEM_EMOJI[item.itemKind]}
              </span>
            ))}
          </div>
          <strong>= ?</strong>
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
            {mode === 'pattern' ? <TokenShapeSvg token={opt as PatternToken} size={38} /> : opt}
          </button>
        ))}
      </div>
    </section>
  );
}
