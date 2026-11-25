import { useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import { playBubblePop, playGentlePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

type HabitMode = 'handwash' | 'brush' | 'tidy';

const HAND_SPOTS = [
  { id: 'h1', cx: 118, cy: 138 },
  { id: 'h2', cx: 162, cy: 156 },
  { id: 'h3', cx: 144, cy: 96 },
  { id: 'h4', cx: 192, cy: 118 },
  { id: 'h5', cx: 130, cy: 184 }
];

const TOOTH_SPOTS = [
  { id: 't1', cx: 108, cy: 112 },
  { id: 't2', cx: 146, cy: 112 },
  { id: 't3', cx: 184, cy: 112 },
  { id: 't4', cx: 126, cy: 158 },
  { id: 't5', cx: 170, cy: 158 }
];

const TOYS = [
  { id: 'ball', label: 'Bola', color: '#2D8CF0' },
  { id: 'block', label: 'Balok', color: '#F7B731' },
  { id: 'car', label: 'Mobil', color: '#E07A18' }
];

export function GoodHabits({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [mode, setMode] = useState<HabitMode>('handwash');
  const [cleanedHands, setCleanedHands] = useState<string[]>([]);
  const [cleanedTeeth, setCleanedTeeth] = useState<string[]>([]);
  const [storedToys, setStoredToys] = useState<string[]>([]);
  const [completedModes, setCompletedModes] = useState<HabitMode[]>([]);
  const [rewarded, setRewarded] = useState(false);

  function markModeDone(finishedMode: HabitMode, praise: string): void {
    triggerHaptic('success');
    playSuccessChime();
    fireConfetti({ count: 35 });
    speakPhrase(praise);
    setCompletedModes((prev) => {
      const next = prev.includes(finishedMode) ? prev : [...prev, finishedMode];
      if (next.length >= 2 && !rewarded) {
        setRewarded(true);
        onComplete('sticker-motor');
      }
      return next;
    });
  }

  function cleanHandSpot(id: string): void {
    if (cleanedHands.includes(id)) return;
    triggerHaptic('tap');
    playBubblePop(420 + cleanedHands.length * 45);
    const next = [...cleanedHands, id];
    setCleanedHands(next);
    if (next.length >= HAND_SPOTS.length) {
      markModeDone('handwash', 'Hore! Tangan bersih berkilau!');
    }
  }

  function cleanToothSpot(id: string): void {
    if (cleanedTeeth.includes(id)) return;
    triggerHaptic('tap');
    playBubblePop(500 + cleanedTeeth.length * 45);
    const next = [...cleanedTeeth, id];
    setCleanedTeeth(next);
    if (next.length >= TOOTH_SPOTS.length) {
      markModeDone('brush', 'Hebat! Gigi putih bersih!');
    }
  }

  function storeToy(id: string): void {
    if (storedToys.includes(id)) return;
    triggerHaptic('tap');
    playGentlePop();
    const next = [...storedToys, id];
    setStoredToys(next);
    speakPhrase('Masuk kotak!');
    if (next.length >= TOYS.length) {
      markModeDone('tidy', 'Pintar! Semua mainan sudah rapi!');
    }
  }

  const resetCurrent = () => {
    playGentlePop();
    if (mode === 'handwash') setCleanedHands([]);
    else if (mode === 'brush') setCleanedTeeth([]);
    else setStoredToys([]);
  };

  return (
    <section className="game-clean-stage" aria-label="Kebiasaan Baik">
      <div className="game-top-bar">
        <VisualStarMeter count={completedModes.length} total={3} />
        <div className="chip-row" role="tablist">
          {(
            [
              ['handwash', 'Cuci Tangan'],
              ['brush', 'Sikat Gigi'],
              ['tidy', 'Rapikan']
            ] as Array<[HabitMode, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              className={`pill-btn touch-safe ${mode === id ? 'is-active' : ''}`}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'handwash' && (
        <div className="habit-visual-stage">
          <p className="game-mini-status">
            {cleanedHands.length >= HAND_SPOTS.length
              ? 'Tangan bersih berkilau!'
              : 'Ketuk atau gosok noda lumpur dengan sabun!'}
          </p>
          <svg viewBox="0 0 300 240" className="habit-svg-arena" role="img" aria-label="Cuci Tangan">
            <rect width="300" height="240" rx="22" fill="#E6F5FC" />
            <path
              d="M98 188V100c0-11 18-11 18 0v32V76c0-11 18-11 18 0v56V68c0-11 18-11 18 0v64V80c0-11 18-11 18 0v66l16-14c10-8 24 4 14 16l-28 42c-12 18-28 28-48 28-24 0-42-14-42-30Z"
              fill="#FBD3B6"
              stroke="#C98A63"
              strokeWidth="4"
            />
            {HAND_SPOTS.map((s) => {
              const clean = cleanedHands.includes(s.id);
              return (
                <g
                  key={s.id}
                  onPointerDown={() => cleanHandSpot(s.id)}
                  onPointerEnter={(e) => {
                    if (e.buttons > 0) cleanHandSpot(s.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {clean ? (
                    <>
                      <circle cx={s.cx} cy={s.cy} r="18" fill="#7AD2FA" fillOpacity="0.55" stroke="#FFFFFF" strokeWidth="2.5" />
                      <circle cx={s.cx - 5} cy={s.cy - 5} r="4" fill="#FFFFFF" />
                    </>
                  ) : (
                    <circle cx={s.cx} cy={s.cy} r="19" fill="#8A5A3B" stroke="#5E3A23" strokeWidth="2.5" />
                  )}
                </g>
              );
            })}
          </svg>
          {cleanedHands.length >= HAND_SPOTS.length && (
            <button type="button" className="btn-primary-calm" onClick={() => setMode('brush')}>
              Lanjut Sikat Gigi →
            </button>
          )}
        </div>
      )}

      {mode === 'brush' && (
        <div className="habit-visual-stage">
          <p className="game-mini-status">
            {cleanedTeeth.length >= TOOTH_SPOTS.length
              ? 'Gigi putih & sehat!'
              : 'Gosok semua noda kuning di gigi!'}
          </p>
          <svg viewBox="0 0 300 240" className="habit-svg-arena" role="img" aria-label="Sikat Gigi">
            <rect width="300" height="240" rx="22" fill="#FFF0F4" />
            <ellipse cx="150" cy="134" rx="98" ry="62" fill="#E85A71" stroke="#B53147" strokeWidth="5" />
            <rect x="78" y="92" width="144" height="40" rx="14" fill="#FFFFFF" stroke="#D5DCE0" strokeWidth="3" />
            <rect x="86" y="140" width="128" height="36" rx="14" fill="#FFFFFF" stroke="#D5DCE0" strokeWidth="3" />
            {TOOTH_SPOTS.map((s) => {
              const clean = cleanedTeeth.includes(s.id);
              return (
                <g
                  key={s.id}
                  onPointerDown={() => cleanToothSpot(s.id)}
                  onPointerEnter={(e) => {
                    if (e.buttons > 0) cleanToothSpot(s.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {clean ? (
                    <polygon
                      points={`${s.cx},${s.cy - 11} ${s.cx + 3},${s.cy - 3} ${s.cx + 11},${s.cy} ${s.cx + 3},${s.cy + 3} ${s.cx},${s.cy + 11} ${s.cx - 3},${s.cy + 3} ${s.cx - 11},${s.cy} ${s.cx - 3},${s.cy - 3}`}
                      fill="#5DBBF2"
                    />
                  ) : (
                    <circle cx={s.cx} cy={s.cy} r="15" fill="#F7C948" stroke="#D99B00" strokeWidth="2.5" />
                  )}
                </g>
              );
            })}
          </svg>
          {cleanedTeeth.length >= TOOTH_SPOTS.length && (
            <button type="button" className="btn-primary-calm" onClick={() => setMode('tidy')}>
              Lanjut Rapikan Mainan →
            </button>
          )}
        </div>
      )}

      {mode === 'tidy' && (
        <div className="habit-visual-stage">
          <p className="game-mini-status">
            {storedToys.length >= TOYS.length
              ? 'Semua mainan rapi di kotak!'
              : 'Ketuk mainan untuk dimasukkan ke kotak!'}
          </p>

          <div className="tidy-toys-row">
            {TOYS.map((toy) => {
              const stored = storedToys.includes(toy.id);
              return (
                <button
                  key={toy.id}
                  type="button"
                  disabled={stored}
                  className={`tidy-toy-btn ${stored ? 'is-stored' : ''}`}
                  onClick={() => storeToy(toy.id)}
                >
                  <svg width="54" height="54" viewBox="0 0 60 60" aria-hidden="true">
                    {toy.id === 'ball' && <circle cx="30" cy="30" r="22" fill={toy.color} stroke="#182421" strokeWidth="3" />}
                    {toy.id === 'block' && <rect x="10" y="10" width="40" height="40" rx="8" fill={toy.color} stroke="#182421" strokeWidth="3" />}
                    {toy.id === 'car' && (
                      <>
                        <rect x="8" y="24" width="44" height="18" rx="6" fill={toy.color} stroke="#182421" strokeWidth="3" />
                        <circle cx="18" cy="44" r="6" fill="#182421" />
                        <circle cx="42" cy="44" r="6" fill="#182421" />
                      </>
                    )}
                  </svg>
                  <strong>{stored ? '✓ Rapi' : toy.label}</strong>
                </button>
              );
            })}
          </div>

          <div className="toy-box-visual">
            <strong>Kotak Mainan ({storedToys.length}/{TOYS.length})</strong>
          </div>

          {storedToys.length >= TOYS.length && (
            <button type="button" className="btn-outline touch-safe" onClick={resetCurrent}>
              Main Lagi
            </button>
          )}
        </div>
      )}
    </section>
  );
}
