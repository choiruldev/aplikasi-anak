import { useEffect, useState, type JSX } from 'react';
import { IconSpeaker } from '../components/Art';
import {
  playBubblePop,
  playGentlePop,
  playStepNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio';
import { fireConfetti, triggerHaptic } from '../lib/confetti';

interface NumberCard {
  value: number;
  word: string;
  itemTitle: string;
  voiceId: VoiceClipId;
  color: string;
  borderColor: string;
  bgTint: string;
  type: 'apple' | 'duck' | 'star' | 'butterfly' | 'car' | 'strawberry' | 'fish' | 'balloon' | 'flower' | 'hand';
}

const NUMBER_CARDS: NumberCard[] = [
  {
    value: 1,
    word: 'SATU',
    itemTitle: 'Apel Manis',
    voiceId: 'number-1',
    color: '#D94848',
    borderColor: '#A93232',
    bgTint: '#FDEEEA',
    type: 'apple'
  },
  {
    value: 2,
    word: 'DUA',
    itemTitle: 'Bebek Berenang',
    voiceId: 'number-2',
    color: '#E89F1C',
    borderColor: '#B87B0E',
    bgTint: '#FDF6E2',
    type: 'duck'
  },
  {
    value: 3,
    word: 'TIGA',
    itemTitle: 'Bintang Bersinar',
    voiceId: 'number-3',
    color: '#FFB703',
    borderColor: '#D49200',
    bgTint: '#FFFCEB',
    type: 'star'
  },
  {
    value: 4,
    word: 'EMPAT',
    itemTitle: 'Kupu-kupu Terbang',
    voiceId: 'number-4',
    color: '#7367F0',
    borderColor: '#5446D3',
    bgTint: '#F1EFFF',
    type: 'butterfly'
  },
  {
    value: 5,
    word: 'LIMA',
    itemTitle: 'Mobil Melaju',
    voiceId: 'number-5',
    color: '#2978B5',
    borderColor: '#1B5685',
    bgTint: '#E8F3FA',
    type: 'car'
  },
  {
    value: 6,
    word: 'ENAM',
    itemTitle: 'Stroberi Segar',
    voiceId: 'number-6',
    color: '#E53935',
    borderColor: '#B71C1C',
    bgTint: '#FEECEC',
    type: 'strawberry'
  },
  {
    value: 7,
    word: 'TUJUH',
    itemTitle: 'Ikan Berenang',
    voiceId: 'number-7',
    color: '#1D9A9E',
    borderColor: '#136E71',
    bgTint: '#E6F7F7',
    type: 'fish'
  },
  {
    value: 8,
    word: 'DELAPAN',
    itemTitle: 'Balon Warna',
    voiceId: 'number-8',
    color: '#E06B34',
    borderColor: '#B04E1F',
    bgTint: '#FDF0E9',
    type: 'balloon'
  },
  {
    value: 9,
    word: 'SEMBILAN',
    itemTitle: 'Bunga Mekar',
    voiceId: 'number-9',
    color: '#2B9361',
    borderColor: '#1D6B45',
    bgTint: '#EAF6EE',
    type: 'flower'
  },
  {
    value: 10,
    word: 'SEPULUH',
    itemTitle: 'Jari Tangan Lentur',
    voiceId: 'number-10',
    color: '#FB8C00',
    borderColor: '#C66900',
    bgTint: '#FFF3E0',
    type: 'hand'
  }
];

const COUNT_CLIPS: VoiceClipId[] = [
  'count-1',
  'count-2',
  'count-3',
  'count-4',
  'count-5',
  'count-6',
  'count-7',
  'count-8',
  'count-9',
  'count-10'
];

function ItemIllustration({ type, active }: { type: NumberCard['type']; active: boolean }): JSX.Element {
  const opacity = active ? 1 : 0.45;
  const filter = active ? 'none' : 'grayscale(0.6)';

  return (
    <div
      className={`item-svg-box ${active ? 'is-counted' : 'is-uncounted'}`}
      style={{ opacity, filter, transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      aria-hidden="true"
    >
      {type === 'apple' && (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <ellipse cx="26" cy="36" rx="18" ry="20" fill="#E53935" />
          <ellipse cx="38" cy="36" rx="18" ry="20" fill="#E53935" />
          <path d="M32 18C34 10 38 8 40 8" stroke="#795548" strokeWidth="4" strokeLinecap="round" />
          <path d="M36 14C44 12 48 16 48 18C44 22 38 18 36 14Z" fill="#43A047" />
          <ellipse cx="22" cy="28" rx="3" ry="6" fill="#FFCDD2" opacity="0.6" transform="rotate(-20 22 28)" />
        </svg>
      )}

      {type === 'duck' && (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M14 42C14 34 26 28 38 28C44 28 54 34 54 44C54 50 44 54 32 54C20 54 14 48 14 42Z" fill="#FBC02D" />
          <circle cx="24" cy="24" r="14" fill="#FBC02D" />
          <circle cx="20" cy="22" r="2.5" fill="#182421" />
          <polygon points="12,24 2,28 12,32" fill="#E65100" />
          <path d="M30 38C36 34 44 36 46 42" stroke="#F57F17" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}

      {type === 'star' && (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <polygon
            points="32,6 39,22 56,23 43,35 47,52 32,43 17,52 21,35 8,23 25,22"
            fill="#FFD166"
            stroke="#FFA931"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="30" r="2.2" fill="#182421" />
          <circle cx="38" cy="30" r="2.2" fill="#182421" />
          <path d="M28 36C30 38 34 38 36 36" stroke="#182421" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}

      {type === 'butterfly' && (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <ellipse cx="20" cy="24" rx="12" ry="14" fill="#7367F0" transform="rotate(-15 20 24)" />
          <ellipse cx="44" cy="24" rx="12" ry="14" fill="#7367F0" transform="rotate(15 44 24)" />
          <ellipse cx="24" cy="42" rx="9" ry="10" fill="#FFA931" transform="rotate(-10 24 42)" />
          <ellipse cx="40" cy="42" rx="9" ry="10" fill="#FFA931" transform="rotate(10 40 42)" />
          <rect x="30" y="16" width="4" height="28" rx="2" fill="#182421" />
          <circle cx="32" cy="14" r="3.5" fill="#182421" />
        </svg>
      )}

      {type === 'car' && (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="28" width="48" height="18" rx="6" fill="#2978B5" />
          <path d="M16 28L24 16H40L48 28Z" fill="#1B5685" />
          <rect x="25" y="18" width="14" height="8" rx="2" fill="#E8F3FA" />
          <circle cx="18" cy="46" r="7" fill="#182421" />
          <circle cx="18" cy="46" r="3" fill="#D5CBB4" />
          <circle cx="46" cy="46" r="7" fill="#182421" />
          <circle cx="46" cy="46" r="3" fill="#D5CBB4" />
          <circle cx="10" cy="34" r="3" fill="#FFD166" />
        </svg>
      )}

      {type === 'strawberry' && (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path
            d="M32 56C44 48 50 36 50 26C50 18 42 16 32 18C22 16 14 18 14 26C14 36 20 48 32 56Z"
            fill="#E53935"
          />
          <path d="M32 12C33 8 36 6 38 6" stroke="#43A047" strokeWidth="3" strokeLinecap="round" />
          <polygon points="32,16 26,10 32,6 38,10" fill="#43A047" />
          <circle cx="24" cy="26" r="1.5" fill="#FFD166" />
          <circle cx="32" cy="28" r="1.5" fill="#FFD166" />
          <circle cx="40" cy="26" r="1.5" fill="#FFD166" />
          <circle cx="28" cy="36" r="1.5" fill="#FFD166" />
          <circle cx="36" cy="36" r="1.5" fill="#FFD166" />
          <circle cx="32" cy="44" r="1.5" fill="#FFD166" />
        </svg>
      )}

      {type === 'fish' && (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <ellipse cx="28" cy="32" rx="20" ry="14" fill="#1D9A9E" />
          <polygon points="46,32 58,20 58,44" fill="#136E71" />
          <circle cx="18" cy="28" r="3" fill="#FFFFFF" />
          <circle cx="18" cy="28" r="1.5" fill="#182421" />
          <path d="M26 24C30 28 30 36 26 40" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}

      {type === 'balloon' && (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="26" rx="16" ry="20" fill="#E06B34" />
          <ellipse cx="27" cy="20" rx="4" ry="8" fill="#FFE0B2" opacity="0.6" />
          <polygon points="30,45 34,45 32,48" fill="#B04E1F" />
          <path d="M32 48C34 52 30 56 33 60" stroke="#182421" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}

      {type === 'flower' && (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <circle
              key={angle}
              cx={32 + Math.cos((angle * Math.PI) / 180) * 14}
              cy={32 + Math.sin((angle * Math.PI) / 180) * 14}
              r="10"
              fill="#FF80AB"
            />
          ))}
          <circle cx="32" cy="32" r="10" fill="#FFD54F" />
          <circle cx="30" cy="30" r="1.8" fill="#182421" />
          <circle cx="34" cy="30" r="1.8" fill="#182421" />
          <path d="M30 34C31 35 33 35 34 34" stroke="#182421" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}

      {type === 'hand' && (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path
            d="M20 34V18C20 15 24 15 24 18V30M24 30V12C24 9 28 9 28 12V30M28 30V10C28 7 32 7 32 10V30M32 30V14C32 11 36 11 36 14V34M36 34C38 32 42 32 42 36V44C42 52 34 56 26 56C18 56 16 48 16 44V34C16 32 20 32 20 34Z"
            fill="#FFE0B2"
            stroke="#FB8C00"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

export function NumberGarden({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [selectedNum, setSelectedNum] = useState(1);
  const card = NUMBER_CARDS[selectedNum - 1];

  const [countedSet, setCountedSet] = useState<Set<number>>(() => new Set());
  const [completedSet, setCompletedSet] = useState<Set<number>>(() => new Set());
  const [rewarded, setRewarded] = useState(false);
  const [prompt, setPrompt] = useState('Ayo belajar angka! Sentuh gambar untuk berhitung.');

  useEffect(() => {
    preloadVoices([
      'numbers-intro',
      'numbers-done',
      ...COUNT_CLIPS,
      ...NUMBER_CARDS.map((c) => c.voiceId)
    ]);
    playVoice('numbers-intro', 80);
    return () => stopVoice();
  }, []);

  function handleSelectNumber(num: number): void {
    if (num === selectedNum) return;
    playGentlePop();
    triggerHaptic('tap');
    setSelectedNum(num);
    setCountedSet(new Set());
    const nextCard = NUMBER_CARDS[num - 1];
    setPrompt(`${nextCard.word}! (${nextCard.value} ${nextCard.itemTitle})`);
    playVoice(nextCard.voiceId, 80);
  }

  function handleTapItem(idx: number): void {
    if (countedSet.has(idx)) {
      // Re-trigger sound of this count
      playBubblePop(300 + idx * 40);
      triggerHaptic('tap');
      return;
    }

    const nextCount = countedSet.size + 1;
    const nextSet = new Set(countedSet);
    nextSet.add(idx);
    setCountedSet(nextSet);

    triggerHaptic('tap');
    playStepNote(nextCount);
    const countVoice = COUNT_CLIPS[nextCount - 1];
    if (countVoice) {
      playVoice(countVoice);
    }

    const COUNT_WORDS = ['Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh'];
    const currentWord = COUNT_WORDS[nextCount - 1] || `${nextCount}`;

    if (nextSet.size >= card.value) {
      // Finished counting this card!
      setCompletedSet((prev) => {
        const next = new Set(prev);
        next.add(card.value);
        if (next.size >= 4 && !rewarded) {
          setRewarded(true);
          setPrompt('Hebat! Yeaaay! 🎉 Kamu dapat stiker angka!');
          window.setTimeout(() => {
            playVoice('numbers-done');
            onComplete('sticker-numbers');
          }, 800);
        }
        return next;
      });

      triggerHaptic('success');
      fireConfetti();
      setPrompt(`Hebat! ${card.word}! 🎉 (${card.value} ${card.itemTitle})`);
      window.setTimeout(() => {
        playSuccessChime();
        playVoice(card.voiceId, 320);
      }, 350);
    } else {
      setPrompt(`${currentWord}! (${nextCount} dari ${card.value})`);
    }
  }

  const isCurrentCardFinished = countedSet.size >= card.value;

  return (
    <section className="activity-stage" aria-labelledby="numbers-title">
      <div className="stage-header">
        <div>
          <h1 id="numbers-title" className="stage-title">Taman Angka: {card.word} ({card.value})</h1>
          <p className="stage-subtitle">{prompt}</p>
        </div>
        <button
          type="button"
          className="voice-btn"
          onClick={() => playVoice(card.voiceId)}
          aria-label="Dengar suara angka"
        >
          <IconSpeaker size={22} />
          <span>Dengar</span>
        </button>
      </div>

      {/* Number Buttons Bar (1 - 10) */}
      <div className="number-bar" role="tablist" aria-label="Pilih angka 1 sampai 10">
        {NUMBER_CARDS.map((c) => {
          const isDone = completedSet.has(c.value);
          const isCurrent = c.value === selectedNum;
          return (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              className={`number-tab-btn ${isCurrent ? 'is-active' : ''} ${isDone ? 'is-done' : ''}`}
              style={{
                borderColor: isCurrent ? c.borderColor : isDone ? '#43A047' : 'var(--border)'
              }}
              onClick={() => handleSelectNumber(c.value)}
            >
              <span className="number-tab-digit">{c.value}</span>
              {isDone && <span className="number-done-badge" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage */}
      <div
        className="number-arena"
        style={{
          backgroundColor: card.bgTint,
          borderColor: card.borderColor
        }}
      >
        <div className="number-card-spotlight">
          <div
            className="number-giant-badge"
            style={{
              backgroundColor: card.color,
              borderColor: card.borderColor
            }}
          >
            <span className="number-giant-num">{card.value}</span>
            <span className="number-giant-word">{card.word}</span>
          </div>

          <div className="number-counter-badge">
            <span>Tersentuh: <strong>{countedSet.size}</strong> dari {card.value}</span>
          </div>
        </div>

        {/* Countable Items Grid */}
        <div className="number-items-grid" role="group" aria-label={`Benda berhitung ${card.itemTitle}`}>
          {Array.from({ length: card.value }, (_, i) => {
            const isCounted = countedSet.has(i);
            return (
              <button
                key={i}
                type="button"
                className={`number-item-btn ${isCounted ? 'is-active' : ''}`}
                onClick={() => handleTapItem(i)}
                aria-label={`${card.itemTitle} ke-${i + 1} ${isCounted ? 'sudah dihitung' : 'ketuk untuk menghitung'}`}
              >
                <ItemIllustration type={card.type} active={isCounted} />
                <span className={`number-item-order ${isCounted ? 'is-visible' : ''}`}>
                  {isCounted ? i + 1 : '👆'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Action / Completion Bar */}
        {isCurrentCardFinished && (
          <div className="number-finish-bar">
            <span className="number-finish-text">🎉 Hebat! Semua {card.value} {card.itemTitle} sudah terhitung!</span>
            <div className="number-finish-btns">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  playGentlePop();
                  setCountedSet(new Set());
                }}
              >
                🔄 Hitung Ulang
              </button>
              {selectedNum < 10 && (
                <button
                  type="button"
                  className="primary-action-btn"
                  onClick={() => handleSelectNumber(selectedNum + 1)}
                >
                  Angka {selectedNum + 1} Berikutnya ➡
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
