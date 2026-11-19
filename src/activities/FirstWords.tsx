import { useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import { playGentlePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface WordItem {
  id: string;
  idLabel: string;
  enLabel: string;
  category: 'Buah' | 'Benda' | 'Kendaraan';
  tint: string;
  renderArt: () => JSX.Element;
}

const WORDS: WordItem[] = [
  {
    id: 'apel',
    idLabel: 'Apel',
    enLabel: 'Apple',
    category: 'Buah',
    tint: '#FFE8E8',
    renderArt: () => (
      <svg viewBox="0 0 80 80" width="76" height="76" aria-hidden="true">
        <path d="M40 20c5-7 13-7 13-2s-8 6-13 2Z" fill="#2B6E4F" />
        <path d="M40 16v8" stroke="#6B4423" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M40 26c15-4 24 8 20 24s-14 18-20 15c-6 3-16 1-20-15s5-28 20-24Z" fill="#E84848" />
        <ellipse cx="31" cy="36" rx="4" ry="7" fill="#FF8A8A" opacity="0.6" />
      </svg>
    )
  },
  {
    id: 'pisang',
    idLabel: 'Pisang',
    enLabel: 'Banana',
    category: 'Buah',
    tint: '#FFF7DB',
    renderArt: () => (
      <svg viewBox="0 0 80 80" width="76" height="76" aria-hidden="true">
        <path d="M18 52c14 14 42 4 46-28 1-4-4-7-6-3-4 18-22 28-38 22-4-1-5 6-2 9Z" fill="#F7B731" stroke="#D98A00" strokeWidth="2.5" />
      </svg>
    )
  },
  {
    id: 'bola',
    idLabel: 'Bola',
    enLabel: 'Ball',
    category: 'Benda',
    tint: '#E8F3FF',
    renderArt: () => (
      <svg viewBox="0 0 80 80" width="76" height="76" aria-hidden="true">
        <circle cx="40" cy="40" r="24" fill="#2D8CF0" />
        <path d="M22 25c10 10 26 10 36 0M22 55c10-10 26-10 36 0" stroke="#FFFDF7" strokeWidth="4" fill="none" />
        <circle cx="40" cy="40" r="24" fill="none" stroke="#182421" strokeWidth="2.5" />
      </svg>
    )
  },
  {
    id: 'buku',
    idLabel: 'Buku',
    enLabel: 'Book',
    category: 'Benda',
    tint: '#EAF8EE',
    renderArt: () => (
      <svg viewBox="0 0 80 80" width="76" height="76" aria-hidden="true">
        <rect x="16" y="20" width="48" height="40" rx="5" fill="#2B6E4F" />
        <rect x="20" y="24" width="18" height="32" rx="2" fill="#FFFDF7" />
        <rect x="42" y="24" width="18" height="32" rx="2" fill="#FFFDF7" />
        <line x1="24" y1="32" x2="34" y2="32" stroke="#95B5A4" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="46" y1="32" x2="56" y2="32" stroke="#95B5A4" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'mobil',
    idLabel: 'Mobil',
    enLabel: 'Car',
    category: 'Kendaraan',
    tint: '#FFF0E5',
    renderArt: () => (
      <svg viewBox="0 0 80 80" width="76" height="76" aria-hidden="true">
        <path d="M16 42l8-14h28l10 14H16Z" fill="#E07A18" />
        <rect x="12" y="40" width="56" height="14" rx="6" fill="#E07A18" />
        <circle cx="24" cy="56" r="7" fill="#182421" />
        <circle cx="56" cy="56" r="7" fill="#182421" />
        <circle cx="24" cy="56" r="3" fill="#FFFDF7" />
        <circle cx="56" cy="56" r="3" fill="#FFFDF7" />
      </svg>
    )
  },
  {
    id: 'sepeda',
    idLabel: 'Sepeda',
    enLabel: 'Bicycle',
    category: 'Kendaraan',
    tint: '#F2ECFF',
    renderArt: () => (
      <svg viewBox="0 0 80 80" width="76" height="76" aria-hidden="true">
        <circle cx="22" cy="52" r="12" fill="none" stroke="#8045D9" strokeWidth="4" />
        <circle cx="58" cy="52" r="12" fill="none" stroke="#8045D9" strokeWidth="4" />
        <path d="M22 52l14-20h14l8 20M36 32l4 20h18" fill="none" stroke="#2B6E4F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];

export function FirstWords({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [bilingual, setBilingual] = useState(false);
  const [tappedIds, setTappedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [rewarded, setRewarded] = useState(false);

  const handleTap = (word: WordItem) => {
    triggerHaptic('tap');
    playGentlePop();
    setActiveId(word.id);
    speakPhrase(bilingual ? word.enLabel : word.idLabel, bilingual ? 'en-US' : 'id-ID');
    if (!tappedIds.includes(word.id)) {
      const next = [...tappedIds, word.id];
      setTappedIds(next);
      if (next.length >= 5 && !rewarded) {
        setRewarded(true);
        triggerHaptic('success');
        fireConfetti();
        playSuccessChime();
        onComplete('sticker-alphabet');
      }
    }
  };

  return (
    <div className="edu-stage">
      <div className="edu-stage-top">
        <VisualStarMeter count={Math.min(tappedIds.length, 5)} total={5} />
        <button
          type="button"
          className={`pill-btn small ${bilingual ? 'is-active' : ''}`}
          onClick={() => setBilingual((v) => !v)}
        >
          {bilingual ? 'EN · English' : 'ID · Indonesia'}
        </button>
      </div>

      <div className="edu-cards-grid">
        {WORDS.map((word) => {
          const isSelected = activeId === word.id;
          return (
            <button
              key={word.id}
              type="button"
              className={`edu-word-card ${isSelected ? 'is-active' : ''}`}
              style={{ backgroundColor: word.tint }}
              onClick={() => handleTap(word)}
            >
              {word.renderArt()}
              <strong>{bilingual ? word.enLabel : word.idLabel}</strong>
              <span>{word.category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
