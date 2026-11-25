import { useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import { playBubblePop, playGentlePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

type BodyPartId = 'mata' | 'hidung' | 'mulut' | 'telinga' | 'tangan' | 'kaki';
type EmotionId = 'happy' | 'sad' | 'calm' | 'angry';

const BODY_LABELS: Record<BodyPartId, { name: string; say: string }> = {
  mata: { name: 'Mata', say: 'Mata! Untuk melihat dunia.' },
  telinga: { name: 'Telinga', say: 'Telinga! Untuk mendengar musik.' },
  hidung: { name: 'Hidung', say: 'Hidung! Untuk mencium bunga.' },
  mulut: { name: 'Mulut', say: 'Mulut! Untuk tersenyum dan bicara.' },
  tangan: { name: 'Tangan', say: 'Tangan! Untuk melambai dan memeluk.' },
  kaki: { name: 'Kaki', say: 'Kaki! Untuk berjalan dan melompat.' }
};

interface EmotionStory {
  id: string;
  scene: string;
  answer: EmotionId;
}

const STORIES: EmotionStory[] = [
  { id: 's1', scene: 'Dapat kado mainan baru! Perasaannya...', answer: 'happy' },
  { id: 's2', scene: 'Balon terbang lepas ke langit... Perasaannya...', answer: 'sad' },
  { id: 's3', scene: 'Dipeluk hangat Ayah dan Bunda. Perasaannya...', answer: 'calm' },
  { id: 's4', scene: 'Menara balok jatuh kena senggol! Perasaannya...', answer: 'angry' }
];

const EMOTIONS: Array<{ id: EmotionId; label: string; bg: string }> = [
  { id: 'happy', label: 'Senang', bg: '#FFF4D6' },
  { id: 'sad', label: 'Sedih', bg: '#E6F1FF' },
  { id: 'calm', label: 'Tenang', bg: '#E6F6EC' },
  { id: 'angry', label: 'Kesal', bg: '#FFEAE8' }
];

function EmotionFaceSvg({ id, size = 56 }: { id: EmotionId; size?: number }): JSX.Element {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <circle
        cx="32"
        cy="32"
        r="25"
        fill={id === 'happy' ? '#FFD166' : id === 'sad' ? '#9BC9FF' : id === 'calm' ? '#9EE2BF' : '#FFA69E'}
        stroke="#182421"
        strokeWidth="2.5"
      />
      {id === 'angry' ? (
        <>
          <path d="M19 23L27 27M45 23L37 27" stroke="#182421" strokeWidth="3" strokeLinecap="round" />
          <circle cx="24" cy="30" r="2.6" fill="#182421" />
          <circle cx="40" cy="30" r="2.6" fill="#182421" />
          <path d="M23 44C27 39 37 39 41 44" stroke="#182421" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="23" cy="27" r="3" fill="#182421" />
          <circle cx="41" cy="27" r="3" fill="#182421" />
          {id === 'happy' && <path d="M21 37C25 45 39 45 43 37" stroke="#182421" strokeWidth="3" strokeLinecap="round" fill="none" />}
          {id === 'sad' && <path d="M22 44C26 38 38 38 42 44" stroke="#182421" strokeWidth="3" strokeLinecap="round" fill="none" />}
          {id === 'calm' && <line x1="24" y1="40" x2="40" y2="40" stroke="#182421" strokeWidth="3" strokeLinecap="round" />}
        </>
      )}
    </svg>
  );
}

export function BodyEmotions({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [tab, setTab] = useState<'body' | 'emotions'>('body');
  const [activePart, setActivePart] = useState<BodyPartId | null>(null);
  const [seenParts, setSeenParts] = useState<BodyPartId[]>([]);
  const [storyIdx, setStoryIdx] = useState(0);
  const [storyScore, setStoryScore] = useState(0);
  const [feedback, setFeedback] = useState('Ketuk bagian tubuh si kecil!');
  const [rewarded, setRewarded] = useState(false);

  const story = STORIES[storyIdx % STORIES.length];

  function tapBodyPart(part: BodyPartId): void {
    triggerHaptic('tap');
    playGentlePop();
    setActivePart(part);
    setFeedback(BODY_LABELS[part].say);
    speakPhrase(BODY_LABELS[part].say);
    setSeenParts((prev) => {
      const next = prev.includes(part) ? prev : [...prev, part];
      if (next.length >= 5 && !rewarded) {
        setRewarded(true);
        triggerHaptic('success');
        playSuccessChime();
        fireConfetti();
        onComplete('sticker-peekaboo');
      }
      return next;
    });
  }

  function answerEmotion(picked: EmotionId): void {
    if (picked === story.answer) {
      triggerHaptic('success');
      playSuccessChime();
      fireConfetti({ count: 28 });
      const label = EMOTIONS.find((e) => e.id === picked)?.label ?? '';
      setFeedback(`Betul! Ekspresi ${label}!`);
      speakPhrase(`Betul, ${label}!`);
      const next = storyScore + 1;
      setStoryScore(next);
      if (next >= 3 && !rewarded) {
        setRewarded(true);
        onComplete('sticker-peekaboo');
      }
      window.setTimeout(() => setStoryIdx((i) => (i + 1) % STORIES.length), 1000);
    } else {
      playBubblePop(250);
      setFeedback('Yuk coba ekspresi satu lagi!');
    }
  }

  return (
    <section className="game-clean-stage" aria-label="Tubuh dan Emosi">
      <div className="game-top-bar">
        <VisualStarMeter count={tab === 'body' ? Math.min(5, seenParts.length) : Math.min(4, storyScore)} total={tab === 'body' ? 5 : 4} />
        <div className="chip-row" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'body'}
            className={`pill-btn touch-safe ${tab === 'body' ? 'is-active' : ''}`}
            onClick={() => {
              setTab('body');
              setFeedback('Ketuk mata, telinga, tangan, atau kaki!');
            }}
          >
            Tubuhku
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'emotions'}
            className={`pill-btn touch-safe ${tab === 'emotions' ? 'is-active' : ''}`}
            onClick={() => {
              setTab('emotions');
              setFeedback('Pilih ekspresi yang cocok!');
            }}
          >
            Cerita Emosi
          </button>
        </div>
      </div>

      {tab === 'body' ? (
        <div className="habit-visual-stage">
          <p className="game-mini-status">{feedback}</p>
          <svg viewBox="0 0 280 280" className="body-character-svg" role="img" aria-label="Karakter anak interaktif">
            <rect width="280" height="280" rx="24" fill="#F2F9F4" />
            {/* Shirt & Body */}
            <rect x="96" y="136" width="88" height="74" rx="26" fill="#2B6E4F" />
            {/* Ears */}
            <g onClick={() => tapBodyPart('telinga')} style={{ cursor: 'pointer' }}>
              <circle cx="78" cy="84" r="16" fill={activePart === 'telinga' ? '#F7B731' : '#FBD3B6'} stroke="#182421" strokeWidth="3" />
              <circle cx="202" cy="84" r="16" fill={activePart === 'telinga' ? '#F7B731' : '#FBD3B6'} stroke="#182421" strokeWidth="3" />
            </g>
            {/* Head */}
            <circle cx="140" cy="84" r="56" fill="#FBD3B6" stroke="#182421" strokeWidth="3.5" />
            {/* Hair */}
            <path d="M88 72C94 34 186 34 192 72C170 52 110 52 88 72Z" fill="#2B2420" />
            {/* Eyes */}
            <g onClick={() => tapBodyPart('mata')} style={{ cursor: 'pointer' }}>
              <circle cx="118" cy="80" r="14" fill={activePart === 'mata' ? '#FFF2B2' : '#FFFFFF'} stroke="#182421" strokeWidth="3" />
              <circle cx="162" cy="80" r="14" fill={activePart === 'mata' ? '#FFF2B2' : '#FFFFFF'} stroke="#182421" strokeWidth="3" />
              <circle cx="118" cy="80" r="5" fill="#182421" />
              <circle cx="162" cy="80" r="5" fill="#182421" />
            </g>
            {/* Nose */}
            <circle cx="140" cy="96" r="9" fill={activePart === 'hidung' ? '#F7B731' : '#F2A384'} stroke="#182421" strokeWidth="2.5" onClick={() => tapBodyPart('hidung')} style={{ cursor: 'pointer' }} />
            {/* Mouth */}
            <path d="M122 114C130 126 150 126 158 114" stroke={activePart === 'mulut' ? '#D8435E' : '#182421'} strokeWidth="6" strokeLinecap="round" fill="none" onClick={() => tapBodyPart('mulut')} style={{ cursor: 'pointer' }} />
            {/* Hands */}
            <g onClick={() => tapBodyPart('tangan')} style={{ cursor: 'pointer' }}>
              <rect x="46" y="146" width="52" height="26" rx="13" fill={activePart === 'tangan' ? '#F7B731' : '#FBD3B6'} stroke="#182421" strokeWidth="3" />
              <rect x="182" y="146" width="52" height="26" rx="13" fill={activePart === 'tangan' ? '#F7B731' : '#FBD3B6'} stroke="#182421" strokeWidth="3" />
            </g>
            {/* Feet */}
            <g onClick={() => tapBodyPart('kaki')} style={{ cursor: 'pointer' }}>
              <rect x="102" y="206" width="30" height="52" rx="14" fill={activePart === 'kaki' ? '#F7B731' : '#E07A18'} stroke="#182421" strokeWidth="3" />
              <rect x="148" y="206" width="30" height="52" rx="14" fill={activePart === 'kaki' ? '#F7B731' : '#E07A18'} stroke="#182421" strokeWidth="3" />
            </g>
          </svg>
        </div>
      ) : (
        <div className="habit-visual-stage">
          <div className="story-prompt-card">
            <p>{story.scene}</p>
          </div>
          <p className="game-mini-status">{feedback}</p>
          <div className="edu-cards-grid">
            {EMOTIONS.map((em) => (
              <button
                key={em.id}
                type="button"
                className="edu-word-card"
                style={{ backgroundColor: em.bg }}
                onClick={() => answerEmotion(em.id)}
              >
                <EmotionFaceSvg id={em.id} size={58} />
                <strong>{em.label}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
