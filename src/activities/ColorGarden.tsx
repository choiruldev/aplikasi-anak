import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { TapHintFinger, VisualStarMeter } from '../components/Art.tsx';
import {
  playBubblePop,
  playNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  speakPhrase,
  stopVoice,
  type VoiceClipId
} from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';
import { isColorDiscoveryComplete } from '../lib/toddler.ts';

interface ToddlerColorItem {
  id: string;
  name: string;
  hex: string;
  lightHex: string;
  emoji: string;
  itemTitle: string;
  voiceId: VoiceClipId;
  noteFreq: number;
}

const TODDLER_COLORS: ToddlerColorItem[] = [
  { id: 'merah', name: 'MERAH', hex: '#FF3B30', lightHex: '#FFEBEA', emoji: '🍎', itemTitle: 'Apel', voiceId: 'color-toddler-merah', noteFreq: 261.63 },
  { id: 'kuning', name: 'KUNING', hex: '#F7B731', lightHex: '#FFFBEA', emoji: '🍌', itemTitle: 'Pisang', voiceId: 'color-toddler-kuning', noteFreq: 329.63 },
  { id: 'hijau', name: 'HIJAU', hex: '#34C759', lightHex: '#EAF8EE', emoji: '🐸', itemTitle: 'Katak', voiceId: 'color-toddler-hijau', noteFreq: 392.0 },
  { id: 'biru', name: 'BIRU', hex: '#007AFF', lightHex: '#EBF4FE', emoji: '🐳', itemTitle: 'Paus', voiceId: 'color-toddler-biru', noteFreq: 440.0 },
  { id: 'jingga', name: 'JINGGA', hex: '#FF9500', lightHex: '#FFF4E5', emoji: '🍊', itemTitle: 'Jeruk', voiceId: 'color-toddler-jingga', noteFreq: 293.66 },
  { id: 'ungu', name: 'UNGU', hex: '#AF52DE', lightHex: '#F6EBFB', emoji: '🍇', itemTitle: 'Anggur', voiceId: 'color-toddler-ungu', noteFreq: 523.25 }
];

const MIX_RECIPES = [
  { a: 'merah', b: 'kuning', result: 'jingga', label: 'Merah + Kuning = Jingga' },
  { a: 'biru', b: 'kuning', result: 'hijau', label: 'Biru + Kuning = Hijau' },
  { a: 'merah', b: 'biru', result: 'ungu', label: 'Merah + Biru = Ungu' }
];

export function ColorGarden({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [mode, setMode] = useState<'explore' | 'find' | 'mix'>('explore');
  const [visitedColors, setVisitedColors] = useState<Set<string>>(() => new Set());
  const [rewarded, setRewarded] = useState(false);
  const [featuredColor, setFeaturedColor] = useState<ToddlerColorItem>(TODDLER_COLORS[0]);
  const [findIdx, setFindIdx] = useState(0);
  const [findScore, setFindScore] = useState(0);
  const [mixIdx, setMixIdx] = useState(0);
  const [mixRevealed, setMixRevealed] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetFind = TODDLER_COLORS[findIdx % TODDLER_COLORS.length];
  const recipe = MIX_RECIPES[mixIdx % MIX_RECIPES.length];

  useEffect(() => {
    preloadVoices(['color-toddler-intro', 'color-toddler-done', ...TODDLER_COLORS.map((c) => c.voiceId)]);
    playVoice('color-toddler-intro', 80);
    return () => stopVoice();
  }, []);

  function rewardIfNeeded(count: number): void {
    if (isColorDiscoveryComplete(count, 4) && !rewarded) {
      setRewarded(true);
      triggerHaptic('success');
      fireConfetti();
      window.setTimeout(() => {
        playSuccessChime();
        playVoice('color-toddler-done', 200);
        onComplete('sticker-colors');
      }, 450);
    }
  }

  function handleSelectColor(color: ToddlerColorItem): void {
    triggerHaptic('tap');
    playNote(color.noteFreq, 0.45, 0.28);
    playVoice(color.voiceId, 160);
    setFeaturedColor(color);
    setVisitedColors((prev) => {
      const next = new Set(prev);
      next.add(color.id);
      rewardIfNeeded(next.size);
      return next;
    });
  }

  function handleBackdropTouch(e: ReactPointerEvent<HTMLDivElement>): void {
    // Fixed: ignore any click inside buttons or interactive children
    if ((e.target as HTMLElement).closest('button')) return;
    triggerHaptic('tap');
    playNote(featuredColor.noteFreq, 0.35, 0.2);
  }

  const findChoices = [
    targetFind,
    TODDLER_COLORS[(findIdx + 2) % TODDLER_COLORS.length],
    TODDLER_COLORS[(findIdx + 4) % TODDLER_COLORS.length]
  ].sort((a, b) => a.id.localeCompare(b.id));

  function handleFindPick(picked: ToddlerColorItem): void {
    if (picked.id === targetFind.id) {
      triggerHaptic('success');
      playSuccessChime();
      fireConfetti({ count: 24 });
      const next = findScore + 1;
      setFindScore(next);
      rewardIfNeeded(next + 1);
      window.setTimeout(() => setFindIdx((i) => (i + 1) % TODDLER_COLORS.length), 850);
    } else {
      playBubblePop(240);
      playVoice(targetFind.voiceId);
    }
  }

  const colorById = (id: string) => TODDLER_COLORS.find((c) => c.id === id) ?? TODDLER_COLORS[0];

  return (
    <section
      ref={containerRef}
      className="game-clean-stage"
      onPointerDown={handleBackdropTouch}
      style={{ backgroundColor: mode === 'explore' ? featuredColor.lightHex : undefined, borderRadius: '20px' }}
      aria-label="Taman Warna"
    >
      <div className="game-top-bar">
        <div className="chip-row" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'explore'} className={`pill-btn touch-safe ${mode === 'explore' ? 'is-active' : ''}`} onClick={() => setMode('explore')}>
            Kenal
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'find'}
            className={`pill-btn touch-safe ${mode === 'find' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('find');
              playVoice(targetFind.voiceId, 80);
            }}
          >
            Cari ({findScore})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'mix'}
            className={`pill-btn touch-safe ${mode === 'mix' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('mix');
              setMixRevealed(false);
            }}
          >
            Campur
          </button>
        </div>
        <VisualStarMeter count={Math.min(5, visitedColors.size + findScore)} total={5} />
      </div>

      {mode === 'explore' && (
        <>
          <div className="color-hero-showcase" style={{ borderColor: featuredColor.hex }}>
            <span className="word-card-emoji" aria-hidden="true">{featuredColor.emoji}</span>
            <strong style={{ color: featuredColor.hex }}>{featuredColor.name}</strong>
            <span>{featuredColor.itemTitle} {featuredColor.name.toLowerCase()}</span>
          </div>

          <div className="edu-cards-grid">
            {TODDLER_COLORS.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                className="color-big-tile"
                style={{ backgroundColor: c.hex, color: '#ffffff' }}
                onClick={() => handleSelectColor(c)}
              >
                {visitedColors.size === 0 && idx === 0 && (
                  <span className="tile-tap-guide"><TapHintFinger size={32} /></span>
                )}
                <span style={{ fontSize: '1.8rem' }} aria-hidden="true">{c.emoji}</span>
                <strong>{c.name}</strong>
              </button>
            ))}
          </div>
        </>
      )}

      {mode === 'find' && (
        <div className="habit-visual-stage">
          <h2 className="edu-prompt-title">
            Ketuk benda warna <span style={{ color: targetFind.hex }}>{targetFind.name}</span>!
          </h2>
          <div className="edu-cards-grid">
            {findChoices.map((c) => (
              <button
                key={c.id}
                type="button"
                className="edu-word-card"
                style={{ backgroundColor: c.lightHex, borderColor: c.hex }}
                onClick={() => handleFindPick(c)}
              >
                <span className="word-card-emoji" aria-hidden="true">{c.emoji}</span>
                <strong>{c.itemTitle}</strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {mode === 'mix' && (
        <div className="habit-visual-stage">
          <h2 className="edu-prompt-title">Campur 2 Warna!</h2>
          <div className="mix-equation-row">
            <span className="mix-blob" style={{ backgroundColor: colorById(recipe.a).hex }}>
              {colorById(recipe.a).name}
            </span>
            <strong>+</strong>
            <span className="mix-blob" style={{ backgroundColor: colorById(recipe.b).hex }}>
              {colorById(recipe.b).name}
            </span>
            <strong>=</strong>
            <button
              type="button"
              className="mix-result-btn"
              style={{
                backgroundColor: mixRevealed ? colorById(recipe.result).hex : 'var(--ground)',
                color: mixRevealed ? '#ffffff' : 'var(--ink)'
              }}
              onClick={() => {
                setMixRevealed(true);
                triggerHaptic('success');
                playSuccessChime();
                fireConfetti({ count: 24 });
                speakPhrase(recipe.label);
                rewardIfNeeded(4);
              }}
            >
              {mixRevealed ? colorById(recipe.result).name : 'Ketuk!'}
            </button>
          </div>
          {mixRevealed && (
            <button
              type="button"
              className="btn-primary-calm"
              onClick={() => {
                setMixRevealed(false);
                setMixIdx((i) => (i + 1) % MIX_RECIPES.length);
              }}
            >
              Campuran Berikutnya →
            </button>
          )}
        </div>
      )}
    </section>
  );
}
