import { useEffect, useState, type JSX } from 'react';
import { IconSpeaker, TapHintFinger, VisualStarMeter } from '../components/Art.tsx';
import {
  playBubblePop,
  playGentlePop,
  playStepNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface NumberCard {
  value: number;
  word: string;
  itemTitle: string;
  voiceId: VoiceClipId;
  color: string;
  bgTint: string;
  type: 'apple' | 'duck' | 'star' | 'car' | 'fish';
}

const NUMBER_CARDS: NumberCard[] = [
  { value: 1, word: 'SATU', itemTitle: 'Apel', voiceId: 'number-1', color: '#D94848', bgTint: '#FDEEEA', type: 'apple' },
  { value: 2, word: 'DUA', itemTitle: 'Bebek', voiceId: 'number-2', color: '#D98A00', bgTint: '#FDF6E2', type: 'duck' },
  { value: 3, word: 'TIGA', itemTitle: 'Bintang', voiceId: 'number-3', color: '#E07A18', bgTint: '#FFF8E0', type: 'star' },
  { value: 4, word: 'EMPAT', itemTitle: 'Mobil', voiceId: 'number-4', color: '#2978B5', bgTint: '#E8F3FA', type: 'car' },
  { value: 5, word: 'LIMA', itemTitle: 'Ikan', voiceId: 'number-5', color: '#1D9A9E', bgTint: '#E6F7F7', type: 'fish' },
  { value: 6, word: 'ENAM', itemTitle: 'Apel', voiceId: 'number-6', color: '#E53935', bgTint: '#FEECEC', type: 'apple' },
  { value: 7, word: 'TUJUH', itemTitle: 'Bebek', voiceId: 'number-7', color: '#D98A00', bgTint: '#FFF6DB', type: 'duck' },
  { value: 8, word: 'DELAPAN', itemTitle: 'Bintang', voiceId: 'number-8', color: '#8045D9', bgTint: '#F2EBFF', type: 'star' },
  { value: 9, word: 'SEMBILAN', itemTitle: 'Mobil', voiceId: 'number-9', color: '#2B6E4F', bgTint: '#EAF6EE', type: 'car' },
  { value: 10, word: 'SEPULUH', itemTitle: 'Ikan', voiceId: 'number-10', color: '#1982C4', bgTint: '#E6F4FC', type: 'fish' }
];

const COUNT_CLIPS: VoiceClipId[] = [
  'count-1', 'count-2', 'count-3', 'count-4', 'count-5',
  'count-6', 'count-7', 'count-8', 'count-9', 'count-10'
];

function MiniItemSvg({ type, active, size = 48 }: { type: NumberCard['type']; active: boolean; size?: number }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      style={{ opacity: active ? 1 : 0.42, filter: active ? 'none' : 'grayscale(0.6)', transition: 'transform 0.18s ease' }}
      aria-hidden="true"
    >
      {type === 'apple' && (
        <>
          <ellipse cx="26" cy="36" rx="17" ry="19" fill="#E53935" />
          <ellipse cx="38" cy="36" rx="17" ry="19" fill="#E53935" />
          <path d="M32 18C34 10 38 8 40 8" stroke="#795548" strokeWidth="4" strokeLinecap="round" />
          <path d="M36 14C44 12 48 16 48 18C44 22 38 18 36 14Z" fill="#43A047" />
        </>
      )}
      {type === 'duck' && (
        <>
          <path d="M14 42C14 34 26 28 38 28C44 28 54 34 54 44C54 50 44 54 32 54C20 54 14 48 14 42Z" fill="#FBC02D" />
          <circle cx="24" cy="24" r="14" fill="#FBC02D" />
          <circle cx="20" cy="22" r="2.5" fill="#182421" />
          <polygon points="12,24 2,28 12,32" fill="#E65100" />
        </>
      )}
      {type === 'star' && (
        <polygon points="32,6 39,22 56,23 43,35 47,52 32,43 17,52 21,35 8,23 25,22" fill="#FFD166" stroke="#E07A18" strokeWidth="3.5" strokeLinejoin="round" />
      )}
      {type === 'car' && (
        <>
          <rect x="8" y="28" width="48" height="18" rx="6" fill="#2978B5" />
          <path d="M16 28L24 16H40L48 28Z" fill="#1B5685" />
          <circle cx="18" cy="46" r="7" fill="#182421" />
          <circle cx="46" cy="46" r="7" fill="#182421" />
        </>
      )}
      {type === 'fish' && (
        <>
          <ellipse cx="28" cy="32" rx="20" ry="14" fill="#1D9A9E" />
          <polygon points="46,32 58,20 58,44" fill="#136E71" />
          <circle cx="18" cy="28" r="3" fill="#FFFFFF" />
          <circle cx="18" cy="28" r="1.5" fill="#182421" />
        </>
      )}
    </svg>
  );
}

export function NumberGarden({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [mode, setMode] = useState<'count' | 'quiz'>('count');
  const [maxRange, setMaxRange] = useState<5 | 10>(5);
  const [selectedNum, setSelectedNum] = useState(1);
  const [countedSet, setCountedSet] = useState<Set<number>>(() => new Set());
  const [completedSet, setCompletedSet] = useState<Set<number>>(() => new Set());
  const [rewarded, setRewarded] = useState(false);

  const [quizTarget, setQuizTarget] = useState(2);
  const [quizScore, setQuizScore] = useState(0);
  const [quizMsg, setQuizMsg] = useState('Pilih kotak yang jumlahnya pas!');

  const visibleCards = NUMBER_CARDS.slice(0, maxRange);
  const card = NUMBER_CARDS[Math.min(selectedNum, maxRange) - 1];

  useEffect(() => {
    preloadVoices(['numbers-intro', 'numbers-done', ...COUNT_CLIPS, ...NUMBER_CARDS.map((c) => c.voiceId)]);
    playVoice('numbers-intro', 80);
    return () => stopVoice();
  }, []);

  function startNewQuiz(rangeLimit: 5 | 10 = maxRange): void {
    const target = 1 + Math.floor(Math.random() * rangeLimit);
    setQuizTarget(target);
    setQuizMsg(`Cari kotak berisi ${target} benda!`);
    playVoice(NUMBER_CARDS[target - 1].voiceId, 80);
  }

  const quizOptions = (() => {
    const set = new Set<number>([quizTarget]);
    const pool = [quizTarget - 1, quizTarget + 1, quizTarget + 2, 1, 2, 3, 4, 5];
    for (const n of pool) {
      if (set.size >= 3) break;
      if (n >= 1 && n <= maxRange) set.add(n);
    }
    return Array.from(set).sort((a, b) => a - b);
  })();

  function handleSelectNumber(num: number): void {
    playGentlePop();
    triggerHaptic('tap');
    setSelectedNum(num);
    setCountedSet(new Set());
    playVoice(NUMBER_CARDS[num - 1].voiceId, 80);
  }

  function handleTapItem(idx: number): void {
    if (countedSet.has(idx)) {
      playBubblePop(320 + idx * 35);
      return;
    }
    const nextSet = new Set(countedSet);
    nextSet.add(idx);
    setCountedSet(nextSet);
    triggerHaptic('tap');
    playStepNote(nextSet.size);
    const clip = COUNT_CLIPS[nextSet.size - 1];
    if (clip) playVoice(clip);

    if (nextSet.size >= card.value) {
      triggerHaptic('success');
      fireConfetti();
      setCompletedSet((prev) => {
        const next = new Set(prev);
        next.add(card.value);
        if (next.size >= 3 && !rewarded) {
          setRewarded(true);
          window.setTimeout(() => {
            playSuccessChime();
            playVoice('numbers-done');
            onComplete('sticker-numbers');
          }, 600);
        }
        return next;
      });
    }
  }

  function handleAnswerQuiz(picked: number): void {
    if (picked === quizTarget) {
      triggerHaptic('success');
      fireConfetti({ count: 28 });
      playSuccessChime();
      const next = quizScore + 1;
      setQuizScore(next);
      setQuizMsg(`Benar! Ada ${quizTarget} benda!`);
      if (next >= 3 && !rewarded) {
        setRewarded(true);
        onComplete('sticker-numbers');
      }
      window.setTimeout(() => startNewQuiz(), 1100);
    } else {
      playBubblePop(240);
      setQuizMsg(`Itu ${picked}. Yuk cari yang isinya ${quizTarget}!`);
      playVoice(NUMBER_CARDS[quizTarget - 1].voiceId);
    }
  }

  return (
    <section className="game-clean-stage" aria-label="Kebun Angka">
      <div className="game-top-bar">
        <div className="chip-row">
          <button
            type="button"
            className={`pill-btn touch-safe ${mode === 'count' ? 'is-active' : ''}`}
            onClick={() => setMode('count')}
          >
            Hitung
          </button>
          <button
            type="button"
            className={`pill-btn touch-safe ${mode === 'quiz' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('quiz');
              startNewQuiz();
            }}
          >
            Kuis ({quizScore})
          </button>
        </div>

        <div className="game-top-tools">
          <button
            type="button"
            className="pill-btn touch-safe"
            onClick={() => {
              const nextR = maxRange === 5 ? 10 : 5;
              setMaxRange(nextR);
              if (selectedNum > nextR) setSelectedNum(1);
            }}
          >
            1–{maxRange}
          </button>
          <button
            type="button"
            className="icon-tool-btn"
            onClick={() => playVoice(mode === 'quiz' ? NUMBER_CARDS[quizTarget - 1].voiceId : card.voiceId)}
            aria-label="Dengar angka"
          >
            <IconSpeaker size={18} />
          </button>
        </div>
      </div>

      {mode === 'count' ? (
        <>
          <div className="number-grid-bar" role="tablist" aria-label="Pilih angka">
            {visibleCards.map((c) => {
              const active = c.value === card.value;
              const done = completedSet.has(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`num-chip-btn ${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}
                  style={active ? { backgroundColor: c.color, borderColor: c.color, color: '#fff' } : undefined}
                  onClick={() => handleSelectNumber(c.value)}
                >
                  {c.value}
                </button>
              );
            })}
          </div>

          <div className="number-play-card" style={{ backgroundColor: card.bgTint }}>
            <div className="number-play-head">
              <strong style={{ color: card.color }}>{card.value} · {card.word}</strong>
              <VisualStarMeter count={Math.min(countedSet.size, 5)} total={Math.min(card.value, 5)} />
            </div>

            <div className="number-items-grid">
              {Array.from({ length: card.value }).map((_, idx) => {
                const counted = countedSet.has(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`number-item-tap ${counted ? 'is-counted' : ''}`}
                    onClick={() => handleTapItem(idx)}
                    aria-label={`${card.itemTitle} ke ${idx + 1}`}
                  >
                    {countedSet.size === 0 && idx === 0 && (
                      <span className="tile-tap-guide"><TapHintFinger size={30} /></span>
                    )}
                    <MiniItemSvg type={card.type} active={counted} size={50} />
                    {counted && <span className="num-item-badge">{idx + 1}</span>}
                  </button>
                );
              })}
            </div>

            {countedSet.size >= card.value && (
              <button
                type="button"
                className="btn-primary-calm"
                onClick={() => handleSelectNumber(card.value < maxRange ? card.value + 1 : 1)}
              >
                Lanjut Angka {card.value < maxRange ? card.value + 1 : 1} →
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="number-play-card">
          <h2 className="edu-prompt-title">{quizMsg}</h2>
          <div className="num-quiz-grid">
            {quizOptions.map((qty) => (
              <button
                key={qty}
                type="button"
                className="num-quiz-option"
                onClick={() => handleAnswerQuiz(qty)}
              >
                <div className="num-quiz-icons">
                  {Array.from({ length: qty }).map((_, i) => (
                    <MiniItemSvg key={i} type={NUMBER_CARDS[quizTarget - 1].type} active size={32} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
