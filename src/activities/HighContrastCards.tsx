import { useState, type JSX } from 'react';
import { playBubblePop } from '../lib/audio.ts';

interface ContrastCard {
  id: string;
  title: string;
  tip: string;
  renderGraphic: (inverted: boolean) => JSX.Element;
}

const CARDS: ContrastCard[] = [
  {
    id: 'concentric',
    title: 'Lingkaran Fokus',
    tip: 'Tahan diam 10–15 detik di depan mata agar fokus bayi terkunci.',
    renderGraphic: (inverted) => {
      const fg = inverted ? '#FFFFFF' : '#111111';
      const bg = inverted ? '#111111' : '#FFFFFF';
      return (
        <svg viewBox="0 0 280 280" className="hc-svg" aria-hidden="true">
          <rect width="280" height="280" fill={bg} rx="24" />
          <circle cx="140" cy="140" r="112" fill={fg} />
          <circle cx="140" cy="140" r="84" fill={bg} />
          <circle cx="140" cy="140" r="56" fill={fg} />
          <circle cx="140" cy="140" r="28" fill={bg} />
          <circle cx="140" cy="140" r="12" fill="#E53935" />
        </svg>
      );
    }
  },
  {
    id: 'checkerboard',
    title: 'Papan Catur',
    tip: 'Pola kotak kontras tinggi membantu stimulasi retina 0–3 bulan.',
    renderGraphic: (inverted) => {
      const fg = inverted ? '#FFFFFF' : '#111111';
      const bg = inverted ? '#111111' : '#FFFFFF';
      const cells: JSX.Element[] = [];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const filled = (row + col) % 2 === 0;
          cells.push(
            <rect
              key={`${row}-${col}`}
              x={20 + col * 60}
              y={20 + row * 60}
              width="60"
              height="60"
              fill={filled ? fg : bg}
            />
          );
        }
      }
      return (
        <svg viewBox="0 0 280 280" className="hc-svg" aria-hidden="true">
          <rect width="280" height="280" fill={bg} rx="24" />
          <g>{cells}</g>
          <rect x="20" y="20" width="240" height="240" fill="none" stroke={fg} strokeWidth="4" />
        </svg>
      );
    }
  },
  {
    id: 'stripes',
    title: 'Garis Kontras',
    tip: 'Geser perlahan ke kiri-kanan 15° untuk melatih gerak bola mata.',
    renderGraphic: (inverted) => {
      const fg = inverted ? '#FFFFFF' : '#111111';
      const bg = inverted ? '#111111' : '#FFFFFF';
      return (
        <svg viewBox="0 0 280 280" className="hc-svg" aria-hidden="true">
          <rect width="280" height="280" fill={bg} rx="24" />
          <rect x="26" y="24" width="32" height="232" rx="6" fill={fg} />
          <rect x="86" y="24" width="32" height="232" rx="6" fill={fg} />
          <rect x="146" y="24" width="32" height="232" rx="6" fill="#E53935" />
          <rect x="206" y="24" width="32" height="232" rx="6" fill={fg} />
        </svg>
      );
    }
  },
  {
    id: 'spiral',
    title: 'Spiral Tenang',
    tip: 'Cocok saat bayi dalam kondisi tenang dan terjaga (quiet alert).',
    renderGraphic: (inverted) => {
      const fg = inverted ? '#FFFFFF' : '#111111';
      const bg = inverted ? '#111111' : '#FFFFFF';
      return (
        <svg viewBox="0 0 280 280" className="hc-svg" aria-hidden="true">
          <rect width="280" height="280" fill={bg} rx="24" />
          <path
            d="M140 140
               m 0 -10
               a 10 10 0 0 1 10 10
               a 20 20 0 0 1 -20 20
               a 32 32 0 0 1 -32 -32
               a 46 46 0 0 1 46 -46
               a 60 60 0 0 1 60 60
               a 76 76 0 0 1 -76 76
               a 92 92 0 0 1 -92 -92
               a 106 106 0 0 1 106 -106"
            fill="none"
            stroke={fg}
            strokeWidth="15"
            strokeLinecap="round"
          />
          <circle cx="140" cy="140" r="10" fill="#E53935" />
        </svg>
      );
    }
  },
  {
    id: 'smile',
    title: 'Wajah Senyum',
    tip: 'Bayi paling tertarik pada pola menyerupai wajah manusia.',
    renderGraphic: (inverted) => {
      const fg = inverted ? '#FFFFFF' : '#111111';
      const bg = inverted ? '#111111' : '#FFFFFF';
      return (
        <svg viewBox="0 0 280 280" className="hc-svg" aria-hidden="true">
          <rect width="280" height="280" fill={bg} rx="24" />
          <circle cx="140" cy="140" r="108" fill="none" stroke={fg} strokeWidth="14" />
          <circle cx="98" cy="116" r="18" fill={fg} />
          <circle cx="182" cy="116" r="18" fill={fg} />
          <circle cx="94" cy="111" r="5" fill={bg} />
          <circle cx="178" cy="111" r="5" fill={bg} />
          <path
            d="M88 168 Q140 216 192 168"
            fill="none"
            stroke="#E53935"
            strokeWidth="16"
            strokeLinecap="round"
          />
        </svg>
      );
    }
  },
  {
    id: 'moon-star',
    title: 'Bulan & Bintang',
    tip: 'Sebutkan nama objek lembut ("Ini bulan!") sambil tersenyum.',
    renderGraphic: (inverted) => {
      const fg = inverted ? '#FFFFFF' : '#111111';
      const bg = inverted ? '#111111' : '#FFFFFF';
      return (
        <svg viewBox="0 0 280 280" className="hc-svg" aria-hidden="true">
          <rect width="280" height="280" fill={bg} rx="24" />
          <path d="M148 48 A88 88 0 1 0 218 192 A66 66 0 1 1 148 48 Z" fill={fg} />
          <polygon
            points="196,68 205,90 229,92 210,107 216,130 196,117 176,130 182,107 163,92 187,90"
            fill="#E53935"
          />
        </svg>
      );
    }
  }
];

interface Props {
  onComplete?: () => void;
}

export function HighContrastCards({ onComplete }: Props): JSX.Element {
  const [index, setIndex] = useState(0);
  const [inverted, setInverted] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>(['concentric']);

  const card = CARDS[index];

  const stepCard = (delta: number) => {
    const nextIdx = (index + delta + CARDS.length) % CARDS.length;
    playBubblePop(360 + nextIdx * 35);
    setIndex(nextIdx);
    const nextId = CARDS[nextIdx].id;
    if (!seenIds.includes(nextId)) {
      const updated = [...seenIds, nextId];
      setSeenIds(updated);
      if (updated.length === CARDS.length) {
        onComplete?.();
      }
    }
  };

  return (
    <div className="baby-tool-wrap">
      <div className="baby-tool-banner" role="note">
        Jarak ideal 20–30 cm · Maks 2–5 mnt · Kartu {index + 1}/{CARDS.length}
      </div>

      <button
        type="button"
        className={`hc-card-stage ${inverted ? 'is-dark' : 'is-light'}`}
        onClick={() => stepCard(1)}
        aria-label={`Kartu kontras ${card.title}. Ketuk untuk kartu berikutnya.`}
      >
        {card.renderGraphic(inverted)}
      </button>

      <div className="hc-card-meta">
        <h3>{card.title}</h3>
        <p>{card.tip}</p>
      </div>

      <div className="baby-tool-controls">
        <button type="button" className="btn-outline" onClick={() => stepCard(-1)}>
          ← Sebelumnya
        </button>
        <button
          type="button"
          className="btn-outline"
          onClick={() => setInverted((v) => !v)}
          aria-pressed={inverted}
        >
          {inverted ? 'Dasar Terang' : 'Dasar Gelap'}
        </button>
        <button type="button" className="btn-primary-calm" onClick={() => stepCard(1)}>
          Berikutnya →
        </button>
      </div>

      <div className="hc-dots" aria-hidden="true">
        {CARDS.map((c, idx) => (
          <span
            key={c.id}
            className={`hc-dot ${idx === index ? 'is-active' : seenIds.includes(c.id) ? 'is-seen' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
