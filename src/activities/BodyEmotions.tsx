import { useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import { playGentlePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface PromptItem {
  id: string;
  label: string;
  sub: string;
  bg: string;
  kind: 'happy' | 'sad' | 'calm' | 'hand' | 'foot' | 'eye';
}

const ITEMS: PromptItem[] = [
  { id: 'happy', label: 'Senang', sub: 'Senyum lebar!', bg: '#FFF5DC', kind: 'happy' },
  { id: 'sad', label: 'Sedih', sub: 'Butuh peluk', bg: '#E8F2FF', kind: 'sad' },
  { id: 'calm', label: 'Tenang', sub: 'Tarik napas', bg: '#E7F6EE', kind: 'calm' },
  { id: 'eye', label: 'Mata', sub: 'Melihat dunia', bg: '#F2ECFF', kind: 'eye' },
  { id: 'hand', label: 'Tangan', sub: 'Melambai & tepuk', bg: '#FFEFE5', kind: 'hand' },
  { id: 'foot', label: 'Kaki', sub: 'Melangkah & lompat', bg: '#FFEBEE', kind: 'foot' }
];

function renderArt(kind: PromptItem['kind']): JSX.Element {
  switch (kind) {
    case 'happy':
      return (
        <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
          <circle cx="32" cy="32" r="24" fill="#FFD166" />
          <circle cx="24" cy="27" r="3" fill="#182421" />
          <circle cx="40" cy="27" r="3" fill="#182421" />
          <path d="M22 37c4 7 16 7 20 0" stroke="#182421" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'sad':
      return (
        <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
          <circle cx="32" cy="32" r="24" fill="#9BC9FF" />
          <circle cx="24" cy="27" r="3" fill="#182421" />
          <circle cx="40" cy="27" r="3" fill="#182421" />
          <path d="M23 42c4-5 14-5 18 0" stroke="#182421" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'calm':
      return (
        <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
          <circle cx="32" cy="32" r="24" fill="#9EE2BF" />
          <path d="M20 27c2 2 6 2 8 0M36 27c2 2 6 2 8 0" stroke="#182421" strokeWidth="3" strokeLinecap="round" fill="none" />
          <line x1="25" y1="39" x2="39" y2="39" stroke="#182421" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'eye':
      return (
        <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
          <path d="M8 32c7-12 41-12 48 0-7 12-41 12-48 0Z" fill="#FFFFFF" stroke="#5A4FB8" strokeWidth="3" />
          <circle cx="32" cy="32" r="9" fill="#5A4FB8" />
          <circle cx="35" cy="29" r="2.5" fill="#FFFFFF" />
        </svg>
      );
    case 'hand':
      return (
        <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
          <path d="M20 42V22c0-3 5-3 5 0v10V16c0-3 5-3 5 0v16V15c0-3 5-3 5 0v17V20c0-3 5-3 5 0v22c0 8-5 12-10 12s-10-4-10-12Z" fill="#E07A18" />
        </svg>
      );
    case 'foot':
      return (
        <svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true">
          <ellipse cx="34" cy="38" rx="11" ry="16" fill="#D8435E" />
          <circle cx="24" cy="18" r="3.5" fill="#D8435E" />
          <circle cx="32" cy="15" r="3.5" fill="#D8435E" />
          <circle cx="40" cy="17" r="3" fill="#D8435E" />
        </svg>
      );
  }
}

export function BodyEmotions({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [seen, setSeen] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSelect = (item: PromptItem) => {
    triggerHaptic('tap');
    playGentlePop();
    setActiveId(item.id);
    speakPhrase(`${item.label}. ${item.sub}`);
    if (!seen.includes(item.id)) {
      const next = [...seen, item.id];
      setSeen(next);
      if (next.length >= 5 && !done) {
        setDone(true);
        triggerHaptic('success');
        fireConfetti();
        playSuccessChime();
        onComplete('sticker-peekaboo');
      }
    }
  };

  return (
    <div className="edu-stage">
      <div className="edu-stage-top">
        <VisualStarMeter count={Math.min(seen.length, 5)} total={5} />
        <span className="pill-badge">Ketuk ekspresi atau tubuh</span>
      </div>
      <div className="edu-cards-grid">
        {ITEMS.map((it) => (
          <button
            key={it.id}
            type="button"
            className={`edu-word-card ${activeId === it.id ? 'is-active' : ''}`}
            style={{ backgroundColor: it.bg }}
            onClick={() => handleSelect(it)}
          >
            {renderArt(it.kind)}
            <strong>{it.label}</strong>
            <span>{it.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
