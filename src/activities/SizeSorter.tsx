import { useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import { playBubblePop, playGentlePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

type ObjKind = 'elephant' | 'mouse' | 'watermelon' | 'cherry' | 'bus' | 'bike' | 'tree' | 'flower';

interface PairRound {
  id: string;
  bigKind: ObjKind;
  bigName: string;
  smallKind: ObjKind;
  smallName: string;
  ask: 'besar' | 'kecil';
}

const PAIR_ROUNDS: PairRound[] = [
  { id: 'p1', bigKind: 'elephant', bigName: 'Gajah', smallKind: 'mouse', smallName: 'Tikus', ask: 'besar' },
  { id: 'p2', bigKind: 'watermelon', bigName: 'Semangka', smallKind: 'cherry', smallName: 'Ceri', ask: 'kecil' },
  { id: 'p3', bigKind: 'bus', bigName: 'Bus', smallKind: 'bike', smallName: 'Sepeda', ask: 'besar' },
  { id: 'p4', bigKind: 'tree', bigName: 'Pohon', smallKind: 'flower', smallName: 'Bunga', ask: 'kecil' }
];

function ObjectArt({ kind, scale = 1 }: { kind: ObjKind; scale?: number }): JSX.Element {
  const px = Math.round(76 * scale);
  return (
    <svg width={px} height={px} viewBox="0 0 80 80" aria-hidden="true">
      {kind === 'elephant' && (
        <>
          <circle cx="18" cy="40" r="14" fill="#6D98B6" />
          <circle cx="62" cy="40" r="14" fill="#6D98B6" />
          <circle cx="40" cy="40" r="22" fill="#89B4D1" stroke="#182421" strokeWidth="2.5" />
          <circle cx="32" cy="34" r="3" fill="#182421" />
          <circle cx="48" cy="34" r="3" fill="#182421" />
          <path d="M40 44v18c0 6 8 6 10 0" stroke="#6D98B6" strokeWidth="8" strokeLinecap="round" fill="none" />
        </>
      )}
      {kind === 'mouse' && (
        <>
          <circle cx="24" cy="26" r="11" fill="#A0A8B0" stroke="#182421" strokeWidth="2" />
          <circle cx="56" cy="26" r="11" fill="#A0A8B0" stroke="#182421" strokeWidth="2" />
          <circle cx="40" cy="44" r="17" fill="#C2C9D1" stroke="#182421" strokeWidth="2.5" />
          <circle cx="34" cy="40" r="2.5" fill="#182421" />
          <circle cx="46" cy="40" r="2.5" fill="#182421" />
          <circle cx="40" cy="48" r="3" fill="#E85A71" />
        </>
      )}
      {kind === 'watermelon' && (
        <>
          <path d="M10 42C10 64 26 70 40 70C54 70 70 64 70 42Z" fill="#2B9361" stroke="#182421" strokeWidth="2.5" />
          <path d="M16 42C16 59 28 64 40 64C52 64 64 59 64 42Z" fill="#E53935" />
          <circle cx="32" cy="50" r="2.5" fill="#182421" />
          <circle cx="48" cy="50" r="2.5" fill="#182421" />
        </>
      )}
      {kind === 'cherry' && (
        <>
          <path d="M28 46C32 26 42 18 42 18C42 18 48 26 52 46" stroke="#2B6E4F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="52" r="11" fill="#D93848" stroke="#182421" strokeWidth="2" />
          <circle cx="52" cy="52" r="11" fill="#D93848" stroke="#182421" strokeWidth="2" />
        </>
      )}
      {kind === 'bus' && (
        <>
          <rect x="8" y="20" width="64" height="36" rx="8" fill="#F7B731" stroke="#182421" strokeWidth="2.5" />
          <rect x="14" y="26" width="14" height="12" rx="2" fill="#E6F4FC" />
          <rect x="33" y="26" width="14" height="12" rx="2" fill="#E6F4FC" />
          <rect x="52" y="26" width="14" height="12" rx="2" fill="#E6F4FC" />
          <circle cx="22" cy="58" r="7" fill="#182421" />
          <circle cx="58" cy="58" r="7" fill="#182421" />
        </>
      )}
      {kind === 'bike' && (
        <>
          <circle cx="22" cy="52" r="12" fill="none" stroke="#8045D9" strokeWidth="4" />
          <circle cx="58" cy="52" r="12" fill="none" stroke="#8045D9" strokeWidth="4" />
          <path d="M22 52l14-20h14l8 20" stroke="#2B6E4F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {kind === 'tree' && (
        <>
          <rect x="33" y="46" width="14" height="24" rx="4" fill="#8A5A3B" />
          <circle cx="40" cy="32" r="22" fill="#2B9361" stroke="#182421" strokeWidth="2.5" />
        </>
      )}
      {kind === 'flower' && (
        <>
          <rect x="37" y="42" width="6" height="24" rx="3" fill="#2B9361" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={40 + Math.cos((a * Math.PI) / 180) * 12} cy={30 + Math.sin((a * Math.PI) / 180) * 12} r="9" fill="#FF80AB" />
          ))}
          <circle cx="40" cy="30" r="8" fill="#FFD166" />
        </>
      )}
    </svg>
  );
}

const ORDER_SIZES = [
  { id: 's', label: 'Kecil', scale: 0.62, order: 0 },
  { id: 'm', label: 'Sedang', scale: 0.9, order: 1 },
  { id: 'l', label: 'Besar', scale: 1.2, order: 2 }
];

export function SizeSorter({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [level, setLevel] = useState<'compare' | 'order'>('compare');
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [pickedOrder, setPickedOrder] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Pilih yang ukurannya cocok!');
  const [rewarded, setRewarded] = useState(false);

  const current = PAIR_ROUNDS[roundIdx % PAIR_ROUNDS.length];
  const bigOnLeft = roundIdx % 2 === 0;

  function choosePair(picked: 'besar' | 'kecil'): void {
    if (picked === current.ask) {
      triggerHaptic('success');
      playSuccessChime();
      const next = score + 1;
      setScore(next);
      setFeedback(`Betul! Itu yang ${picked}!`);
      speakPhrase(`Betul, ${picked}!`);
      if (next >= 4 && !rewarded) {
        setRewarded(true);
        fireConfetti();
        onComplete('sticker-shapes');
      }
      window.setTimeout(() => setRoundIdx((r) => (r + 1) % PAIR_ROUNDS.length), 850);
    } else {
      playBubblePop(240);
      setFeedback(`Yuk cari yang ${current.ask}!`);
    }
  }

  function pickOrderItem(id: string): void {
    const expected = ORDER_SIZES[pickedOrder.length]?.id;
    if (id === expected) {
      triggerHaptic('tap');
      playGentlePop();
      const next = [...pickedOrder, id];
      setPickedOrder(next);
      if (next.length === 3) {
        triggerHaptic('success');
        playSuccessChime();
        fireConfetti();
        setFeedback('Urutan Kecil → Sedang → Besar tepat!');
        const nextScore = score + 1;
        setScore(nextScore);
        if (!rewarded) {
          setRewarded(true);
          onComplete('sticker-shapes');
        }
        window.setTimeout(() => setPickedOrder([]), 1200);
      }
    } else {
      playBubblePop(230);
      setFeedback('Mulai dari yang paling KECIL ya!');
    }
  }

  const scrambledOrder = [ORDER_SIZES[1], ORDER_SIZES[2], ORDER_SIZES[0]];

  return (
    <section className="game-clean-stage" aria-label="Besar dan Kecil">
      <div className="game-top-bar">
        <VisualStarMeter count={Math.min(score, 4)} total={4} />
        <div className="chip-row" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={level === 'compare'}
            className={`pill-btn touch-safe ${level === 'compare' ? 'is-active' : ''}`}
            onClick={() => setLevel('compare')}
          >
            Bandingkan
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={level === 'order'}
            className={`pill-btn touch-safe ${level === 'order' ? 'is-active' : ''}`}
            onClick={() => {
              setLevel('order');
              setPickedOrder([]);
            }}
          >
            Urutkan 3
          </button>
        </div>
      </div>

      {level === 'compare' ? (
        <>
          <h2 className="edu-prompt-title">
            Mana yang lebih <span>{current.ask.toUpperCase()}</span>?
          </h2>
          <p className="game-mini-status">{feedback}</p>
          <div className="size-choice-row">
            <button
              type="button"
              className="size-choice-card"
              onClick={() => choosePair(bigOnLeft ? 'besar' : 'kecil')}
            >
              <ObjectArt kind={bigOnLeft ? current.bigKind : current.smallKind} scale={bigOnLeft ? 1.25 : 0.72} />
              <strong>{bigOnLeft ? current.bigName : current.smallName}</strong>
            </button>
            <button
              type="button"
              className="size-choice-card"
              onClick={() => choosePair(bigOnLeft ? 'kecil' : 'besar')}
            >
              <ObjectArt kind={bigOnLeft ? current.smallKind : current.bigKind} scale={bigOnLeft ? 0.72 : 1.25} />
              <strong>{bigOnLeft ? current.smallName : current.bigName}</strong>
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="edu-prompt-title">Ketuk urutan: <span>Kecil → Sedang → Besar</span></h2>
          <p className="game-mini-status">{feedback}</p>
          <div className="order-three-row">
            {scrambledOrder.map((item) => {
              const done = pickedOrder.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={done}
                  className={`size-choice-card ${done ? 'is-done' : ''}`}
                  onClick={() => pickOrderItem(item.id)}
                >
                  <ObjectArt kind="watermelon" scale={item.scale} />
                  <strong>{done ? `✓ ${item.label}` : item.label}</strong>
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
