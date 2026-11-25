import { useState, type JSX } from 'react';
import { IconSpeaker, VisualStarMeter } from '../components/Art.tsx';
import { playBubblePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface SyllableWord {
  first: string;
  second: string;
  full: string;
  meaning: string;
  emoji: string;
  tint: string;
}

const SYLLABLE_WORDS: SyllableWord[] = [
  { first: 'ba', second: 'ju', full: 'baju', meaning: 'Baju', emoji: '👕', tint: '#E8F3FF' },
  { first: 'bo', second: 'la', full: 'bola', meaning: 'Bola', emoji: '⚽', tint: '#E8F7EE' },
  { first: 'bu', second: 'ku', full: 'buku', meaning: 'Buku', emoji: '📖', tint: '#FFF6E0' },
  { first: 'sa', second: 'pi', full: 'sapi', meaning: 'Sapi', emoji: '🐄', tint: '#EEF6EE' },
  { first: 'to', second: 'pi', full: 'topi', meaning: 'Topi', emoji: '🧢', tint: '#E6F5FA' },
  { first: 'ka', second: 'ki', full: 'kaki', meaning: 'Kaki', emoji: '🦶', tint: '#FFF0E6' },
  { first: 'ro', second: 'ti', full: 'roti', meaning: 'Roti', emoji: '🍞', tint: '#FFF5DC' },
  { first: 'ma', second: 'ta', full: 'mata', meaning: 'Mata', emoji: '👀', tint: '#F2ECFF' },
  { first: 'ku', second: 'da', full: 'kuda', meaning: 'Kuda', emoji: '🐴', tint: '#F8EFE8' },
  { first: 'su', second: 'su', full: 'susu', meaning: 'Susu', emoji: '🥛', tint: '#E8F4FA' },
  { first: 'me', second: 'ja', full: 'meja', meaning: 'Meja', emoji: '🪑', tint: '#FFF1E8' },
  { first: 'ja', second: 'ri', full: 'jari', meaning: 'Jari', emoji: '🖐️', tint: '#FFEFF2' }
];

const EXTRA_PARTS = ['ka', 'ti', 'ro', 'mi', 'lu', 'na', 'po'];

export function SyllableBuilder({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [idx, setIdx] = useState(0);
  const [selectedSecond, setSelectedSecond] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [rewarded, setRewarded] = useState(false);

  const word = SYLLABLE_WORDS[idx % SYLLABLE_WORDS.length];
  const choices = Array.from(
    new Set([
      word.second,
      EXTRA_PARTS[idx % EXTRA_PARTS.length],
      EXTRA_PARTS[(idx + 2) % EXTRA_PARTS.length]
    ])
  ).sort();

  const pickSyllable = (part: string) => {
    setSelectedSecond(part);
    if (part === word.second) {
      triggerHaptic('success');
      playSuccessChime();
      speakPhrase(`${word.first}. ${word.second}. ${word.meaning}!`);
      const next = score + 1;
      setScore(next);
      if (next >= 4 && !rewarded) {
        setRewarded(true);
        fireConfetti();
        onComplete('sticker-alphabet');
      }
      window.setTimeout(() => {
        setSelectedSecond(null);
        setIdx((p) => (p + 1) % SYLLABLE_WORDS.length);
      }, 1050);
    } else {
      playBubblePop(250);
      speakPhrase(part);
    }
  };

  return (
    <section className="game-clean-stage" aria-label="Suku Kata">
      <div className="game-top-bar">
        <VisualStarMeter count={Math.min(score, 5)} total={5} />
        <button
          type="button"
          className="icon-tool-btn"
          onClick={() => speakPhrase(`${word.meaning}. ${word.first} dan ${word.second}`)}
          aria-label="Dengar kata"
        >
          <IconSpeaker size={18} />
        </button>
      </div>

      {/* Illustrated picture clue above syllable slots */}
      <div className="syllable-clue-card" style={{ backgroundColor: word.tint }}>
        <span className="syllable-clue-emoji" aria-hidden="true">{word.emoji}</span>
        <strong>{word.meaning}</strong>
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
    </section>
  );
}
