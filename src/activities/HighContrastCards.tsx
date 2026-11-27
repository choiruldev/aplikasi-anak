import { useEffect, useRef, useState, type JSX } from 'react';
import { useDrag } from '@use-gesture/react';
import { motion, useReducedMotion } from 'motion/react';
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
  },
  {
    id: 'stars-grid',
    title: 'Bintang Kontras',
    tip: 'Pola titik & sudut membantu pelacakan visual 1–4 bulan.',
    renderGraphic: (inverted) => {
      const fg = inverted ? '#FFFFFF' : '#111111';
      const bg = inverted ? '#111111' : '#FFFFFF';
      return (
        <svg viewBox="0 0 280 280" className="hc-svg" aria-hidden="true">
          <rect width="280" height="280" fill={bg} rx="24" />
          <polygon
            points="140,34 166,102 238,106 182,152 200,222 140,182 80,222 98,152 42,106 114,102"
            fill={fg}
          />
          <circle cx="140" cy="140" r="24" fill="#E53935" />
          <circle cx="52" cy="52" r="10" fill={fg} />
          <circle cx="228" cy="52" r="10" fill={fg} />
        </svg>
      );
    }
  },
  {
    id: 'waves',
    title: 'Ombak Lembut',
    tip: 'Ikuti lengkung ombak pelan dari kiri ke kanan.',
    renderGraphic: (inverted) => {
      const fg = inverted ? '#FFFFFF' : '#111111';
      const bg = inverted ? '#111111' : '#FFFFFF';
      return (
        <svg viewBox="0 0 280 280" className="hc-svg" aria-hidden="true">
          <rect width="280" height="280" fill={bg} rx="24" />
          <path d="M24 85 Q82 40 140 85 T256 85" fill="none" stroke={fg} strokeWidth="20" strokeLinecap="round" />
          <path d="M24 145 Q82 100 140 145 T256 145" fill="none" stroke="#E53935" strokeWidth="20" strokeLinecap="round" />
          <path d="M24 205 Q82 160 140 205 T256 205" fill="none" stroke={fg} strokeWidth="20" strokeLinecap="round" />
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
  const [autoSlide, setAutoSlide] = useState(false);
  const [fullFocus, setFullFocus] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>(['concentric']);
  const [dragOffset, setDragOffset] = useState(0);
  const reducedMotion = useReducedMotion();
  const completedRef = useRef(false);
  const swipedRef = useRef(false);

  const card = CARDS[index];

  const stepCard = (delta: number) => {
    const nextIdx = (index + delta + CARDS.length) % CARDS.length;
    playBubblePop(360 + nextIdx * 30);
    setIndex(nextIdx);
    const nextId = CARDS[nextIdx].id;
    setSeenIds((prev) => {
      if (prev.includes(nextId)) return prev;
      const updated = [...prev, nextId];
      if (updated.length >= 6 && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return updated;
    });
  };

  const bindDrag = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dx], tap }) => {
      if (tap) {
        swipedRef.current = false;
        stepCard(1);
        return;
      }
      if (active) {
        setDragOffset(Math.max(-110, Math.min(110, mx)));
      } else {
        const shouldStep = Math.abs(mx) > 48 || (vx > 0.35 && Math.abs(mx) > 20);
        if (shouldStep) {
          swipedRef.current = true;
          stepCard(dx < 0 || mx < 0 ? 1 : -1);
        }
        setDragOffset(0);
      }
    },
    { axis: 'x', filterTaps: true, pointer: { touch: true } }
  );

  useEffect(() => {
    if (!autoSlide) return;
    const id = window.setInterval(() => {
      setIndex((prevIdx) => {
        const nextIdx = (prevIdx + 1) % CARDS.length;
        return nextIdx;
      });
    }, 15000);
    return () => window.clearInterval(id);
  }, [autoSlide]);

  return (
    <div className="baby-tool-wrap">
      {!fullFocus && (
        <div className="soother-top-strip">
          <div className="baby-tool-banner" role="note">
            Jarak 20–30 cm · {index + 1}/{CARDS.length}
          </div>
          <button
            type="button"
            className="btn-outline touch-safe"
            onClick={() => setFullFocus(true)}
          >
            Layar Penuh
          </button>
        </div>
      )}

      <div
        {...bindDrag()}
        role="button"
        tabIndex={0}
        className={`hc-card-stage ${inverted ? 'is-dark' : 'is-light'} ${fullFocus ? 'is-fullfocus' : ''}`}
        style={{ touchAction: 'pan-y', userSelect: 'none' }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
            e.preventDefault();
            stepCard(1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            stepCard(-1);
          }
        }}
        aria-label={`Kartu kontras ${card.title}. Geser atau ketuk untuk berikutnya.`}
      >
        <motion.div
          key={card.id}
          initial={reducedMotion ? false : { opacity: 0.72, scale: 0.96 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: reducedMotion ? 0 : dragOffset,
            rotate: reducedMotion ? 0 : dragOffset * 0.045
          }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {card.renderGraphic(inverted)}
        </motion.div>
      </div>

      {fullFocus ? (
        <button
          type="button"
          className="btn-outline touch-safe"
          onClick={() => setFullFocus(false)}
        >
          Tampilkan Kontrol
        </button>
      ) : (
        <>
          <div className="hc-card-meta">
            <h3>{card.title}</h3>
            <p>{card.tip}</p>
          </div>

          <div className="baby-tool-controls">
            <button type="button" className="btn-outline touch-safe" onClick={() => stepCard(-1)} aria-label="Kartu sebelumnya">
              ← Mundur
            </button>
            <button
              type="button"
              className="btn-outline touch-safe"
              onClick={() => setInverted((v) => !v)}
              aria-pressed={inverted}
            >
              {inverted ? 'Terang' : 'Gelap'}
            </button>
            <button
              type="button"
              className={`btn-outline touch-safe ${autoSlide ? 'is-selected' : ''}`}
              onClick={() => setAutoSlide((v) => !v)}
              aria-pressed={autoSlide}
            >
              {autoSlide ? 'Auto ✓' : 'Auto 15d'}
            </button>
            <button type="button" className="btn-primary-calm touch-safe" onClick={() => stepCard(1)} aria-label="Kartu berikutnya">
              Lanjut →
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
        </>
      )}
    </div>
  );
}
