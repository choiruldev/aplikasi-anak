import { useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import { playGentlePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface SyllableWord {
  first: string;
  second: string;
  full: string;
  meaning: string;
}

const SYLLABLE_WORDS: SyllableWord[] = [
  { first: 'ba', second: 'ju', full: 'baju', meaning: 'Baju' },
  { first: 'bo', second: 'la', full: 'bola', meaning: 'Bola' },
  { first: 'ma', second: 'ma', full: 'mama', meaning: 'Mama' },
  { first: 'pa', second: 'pa', full: 'papa', meaning: 'Papa' },
  { first: 'su', second: 'su', full: 'susu', meaning: 'Susu' },
  { first: 'ku', second: 'ku', full: 'kuku', meaning: 'Kuku' }
];

const EXTRA_PARTS = ['ka', 'ti', 'ro', 'mi'];

export function SyllableBuilder({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [idx, setIdx] = useState(0);
  const [selectedSecond, setSelectedSecond] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const word = SYLLABLE_WORDS[idx % SYLLABLE_WORDS.length];
  const choices = Array.from(new Set([word.second, EXTRA_PARTS[idx % EXTRA_PARTS.length], EXTRA_PARTS[(idx + 1) % EXTRA_PARTS.length]])).sort();

  const pickSyllable = (part: string) => {
    setSelectedSecond(part);
    if (part === word.second) {
      triggerHaptic('success');
      playSuccessChime();
      speakPhrase(`${word.first}. ${word.second}. ${word.meaning}!`);
      const next = score + 1;
      setScore(next);
      if (next >= 4) {
        fireConfetti();
        onComplete('sticker-alphabet');
      }
      window.setTimeout(() => {
        setSelectedSecond(null);
        setIdx((p) => (p + 1) % SYLLABLE_WORDS.length);
      }, 950);
    } else {
      playGentlePop();
      speakPhrase(part);
    }
  };

  return (
    <div className="edu-stage">
      <div className="edu-stage-top">
        <VisualStarMeter count={Math.min(score, 4)} total={4} />
        <span className="pill-badge">Susun kata: {word.meaning}</span>
      </div>

      <div className="syllable-slots-row">
        <div className="syllable-box is-filled">{word.first}</div>
        <span className="syllable-plus">+</span>
        <div className={`syllable-box ${selectedSecond === word.second ? 'is-ok' : ''}`}>
          {selectedSecond ?? '?'}
        </div>
        <span className="syllable-plus">=</span>
        <div className="syllable-word-result">
          {selectedSecond === word.second ? word.full : '...'}
        </div>
      </div>

      <div className="syllable-choices-row">
        {choices.map((part) => (
          <button
            key={part}
            type="button"
            className="syllable-pick-btn"
            onClick={() => pickSyllable(part)}
          >
            {part}
          </button>
        ))}
      </div>
    </div>
  );
}
