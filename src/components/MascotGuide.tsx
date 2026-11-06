import { useState, type JSX } from 'react';
import { playGentlePop } from '../lib/audio';
import { triggerHaptic } from '../lib/confetti';

const MASCOT_MESSAGES = [
  'Halo teman kecil! Hari ini kita mau main apa?',
  'Wah, kamu hebat sekali! Jarimu makin lincah!',
  'Tarik napas, tersenyum, lalu kita main lagi yuk!',
  'Ayo coba pasang keping bentuk kayu yang cocok!',
  'Kamu anak pintar, baik, dan selalu ceria!',
  'Kalau lelah bermain, jangan lupa minum air putih ya!'
];

export function MascotGuide({ childName }: { childName?: string }): JSX.Element {
  const [msgIdx, setMsgIdx] = useState(0);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [wobble, setWobble] = useState(false);

  function handleTapMascot(): void {
    playGentlePop();
    triggerHaptic('tap');
    setWobble(true);
    window.setTimeout(() => setWobble(false), 500);

    const nextIdx = (msgIdx + 1) % MASCOT_MESSAGES.length;
    setMsgIdx(nextIdx);
    setBubbleOpen(true);

    const spokenText = childName
      ? MASCOT_MESSAGES[nextIdx].replace('teman kecil', childName)
      : MASCOT_MESSAGES[nextIdx];

    // Optional Web Speech synthesis fallback if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;
        utterance.pitch = 1.25; // Friendly higher pitch for toddler buddy
        window.speechSynthesis.speak(utterance);
      } catch {
        // Safe fallback
      }
    }
  }

  const currentMessage = childName
    ? MASCOT_MESSAGES[msgIdx].replace('teman kecil', childName)
    : MASCOT_MESSAGES[msgIdx];

  return (
    <div className="mascot-container" aria-label="Teman Kiki si Kelinci">
      {bubbleOpen && (
        <div className="mascot-speech-bubble" role="status">
          <p className="mascot-speech-text">{currentMessage}</p>
          <button
            type="button"
            className="mascot-bubble-close"
            onClick={() => setBubbleOpen(false)}
            aria-label="Tutup pesan Kiki"
          >
            ✕
          </button>
        </div>
      )}

      <button
        type="button"
        className={`mascot-avatar-btn ${wobble ? 'is-wobbling' : ''}`}
        onClick={handleTapMascot}
        aria-label="Ketuk Kiki untuk dengar salam semangat"
      >
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          {/* Bunny Ears */}
          <rect x="18" y="4" width="7" height="22" rx="3.5" fill="#FFA931" />
          <rect x="20" y="8" width="3" height="14" rx="1.5" fill="#FFD166" />
          <rect x="35" y="4" width="7" height="22" rx="3.5" fill="#FFA931" />
          <rect x="37" y="8" width="3" height="14" rx="1.5" fill="#FFD166" />
          {/* Bunny Head */}
          <circle cx="30" cy="36" r="18" fill="#FFF0E6" stroke="#FFA931" strokeWidth="2.5" />
          {/* Cheeks */}
          <circle cx="20" cy="40" r="3.5" fill="#FF8A80" opacity="0.6" />
          <circle cx="40" cy="40" r="3.5" fill="#FF8A80" opacity="0.6" />
          {/* Eyes */}
          <circle cx="24" cy="34" r="2.2" fill="#182421" />
          <circle cx="36" cy="34" r="2.2" fill="#182421" />
          {/* Cute Nose & Mouth */}
          <polygon points="28,38 32,38 30,40" fill="#FF5E7E" />
          <path d="M27 42C28.5 43.5 31.5 43.5 33 42" stroke="#182421" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="mascot-pill-label">Hai Kiki! 🐰</span>
      </button>
    </div>
  );
}
