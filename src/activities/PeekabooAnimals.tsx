import { useEffect, useRef, useState, type JSX } from 'react';
import { AnimalIllustration, type AnimalId } from '../components/Art';
import {
  playAnimalMotif,
  playBoingSound,
  playRustleSound,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio';
import { fireConfetti, triggerHaptic } from '../lib/confetti';
import { getNextAnimalIndex } from '../lib/toddler';

interface PeekabooAnimal {
  id: AnimalId;
  name: string;
  soundWord: string;
  voiceId: VoiceClipId;
  bgTint: string;
  accent: string;
}

const PEEKABOO_ANIMALS: PeekabooAnimal[] = [
  { id: 'cat', name: 'Kucing', soundWord: 'Meong!', voiceId: 'animal-cat', bgTint: '#FFF3E8', accent: '#E06B34' },
  { id: 'duck', name: 'Bebek', soundWord: 'Kwek kwek!', voiceId: 'animal-duck', bgTint: '#FFFBE6', accent: '#E89F1C' },
  { id: 'cow', name: 'Sapi', soundWord: 'Moo!', voiceId: 'animal-cow', bgTint: '#F0F7F4', accent: '#2B9361' },
  { id: 'frog', name: 'Katak', soundWord: 'Krok krok!', voiceId: 'animal-frog', bgTint: '#ECF8F0', accent: '#1F7A5C' },
  { id: 'elephant', name: 'Gajah', soundWord: 'Tuut!', voiceId: 'animal-elephant', bgTint: '#EEF6FB', accent: '#2978B5' },
  { id: 'bird', name: 'Burung', soundWord: 'Cuit cuit!', voiceId: 'animal-bird', bgTint: '#F3EEFB', accent: '#7C4DFF' }
];

type Stage = 'hidden' | 'peeking' | 'popped';

interface LeafParticle {
  id: number;
  x: number;
  y: number;
  rot: number;
  color: string;
}

export function PeekabooAnimals({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [animalIndex, setAnimalIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('hidden');
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [rewarded, setRewarded] = useState(false);
  const [particles, setParticles] = useState<LeafParticle[]>([]);
  const autoNextTimerRef = useRef<number | null>(null);

  const currentAnimal = PEEKABOO_ANIMALS[animalIndex];

  useEffect(() => {
    preloadVoices(PEEKABOO_ANIMALS.map((a) => a.voiceId));
    return () => {
      stopVoice();
      if (autoNextTimerRef.current !== null) {
        window.clearTimeout(autoNextTimerRef.current);
      }
    };
  }, []);

  function spawnLeaves(): void {
    const leafColors = ['#4CAF50', '#81C784', '#FFD54F', '#FF8A65'];
    const newLeaves: LeafParticle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: 35 + Math.random() * 30, // 35% .. 65%
      y: 50 + Math.random() * 15,
      rot: Math.random() * 360,
      color: leafColors[i % leafColors.length]
    }));
    setParticles(newLeaves);
    window.setTimeout(() => setParticles([]), 750);
  }

  function handleInteraction(): void {
    if (stage === 'hidden') {
      // First tap: Bush shakes and animal peeks!
      triggerHaptic('tap');
      playRustleSound();
      spawnLeaves();
      setStage('peeking');
    } else if (stage === 'peeking') {
      // Second tap: Surprise BOING! Animal leaps up!
      triggerHaptic('success');
      playBoingSound();
      fireConfetti();
      setStage('popped');

      // Play synthesized animal motif + voice clip
      playAnimalMotif(currentAnimal.id);
      playVoice(currentAnimal.voiceId, 320);

      // Check discovery progress
      setDiscoveredCount((prev) => {
        const next = prev + 1;
        if (next >= 5 && !rewarded) {
          setRewarded(true);
          window.setTimeout(() => {
            playSuccessChime();
            onComplete('sticker-sensory');
          }, 800);
        }
        return next;
      });

      // Optional gentle auto-next after 4 seconds if child doesn't tap
      if (autoNextTimerRef.current !== null) {
        window.clearTimeout(autoNextTimerRef.current);
      }
      autoNextTimerRef.current = window.setTimeout(() => {
        advanceToNext();
      }, 4200);
    } else {
      // Tapped while popped: advance immediately to next animal!
      advanceToNext();
    }
  }

  function advanceToNext(): void {
    if (autoNextTimerRef.current !== null) {
      window.clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    stopVoice();
    setStage('hidden');
    setAnimalIndex((prev) => getNextAnimalIndex(prev, PEEKABOO_ANIMALS.length));
  }

  return (
    <div
      className="peekaboo-container"
      style={{ backgroundColor: currentAnimal.bgTint }}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      aria-label="Cilukba Hewan"
    >
      {/* Top Banner / Guidance */}
      <div className="peekaboo-header">
        <h2 className="peekaboo-title">
          {stage === 'popped' ? (
            <span className="peekaboo-shout" style={{ color: currentAnimal.accent }}>
              CILUK... BAAA! 🎉 {currentAnimal.soundWord}
            </span>
          ) : stage === 'peeking' ? (
            <span>Ciluk... Siapa ya? Ketuk lagi! 🙈</span>
          ) : (
            <span>Ketuk semak untuk mencari hewan! 🌿</span>
          )}
        </h2>
        <div className="peekaboo-badge">
          ⭐ Ditemukan: {discoveredCount} {rewarded ? '• Dapat Stiker! 🏆' : ''}
        </div>
      </div>

      {/* Center Stage: The Hiding Spot & Animal */}
      <div className="peekaboo-stage">
        {/* The Animal */}
        <div
          className={`peekaboo-animal-wrapper stage-${stage}`}
          style={{ '--animal-color': currentAnimal.accent } as React.CSSProperties}
        >
          <AnimalIllustration id={currentAnimal.id} size={180} />
          {stage === 'popped' && (
            <div className="peekaboo-animal-tag" style={{ backgroundColor: currentAnimal.accent }}>
              {currentAnimal.name}
            </div>
          )}
        </div>

        {/* Big Bush / Hiding Spot */}
        <div className={`peekaboo-bush ${stage === 'peeking' ? 'is-wiggling' : ''}`}>
          <svg viewBox="0 0 320 180" className="bush-svg" fill="none" aria-hidden="true">
            {/* Soft shadows */}
            <ellipse cx="160" cy="165" rx="140" ry="14" fill="#000000" fillOpacity="0.12" />

            {/* Back foliage */}
            <circle cx="80" cy="110" r="65" fill="#2E7D32" />
            <circle cx="240" cy="110" r="65" fill="#2E7D32" />
            <circle cx="160" cy="70" r="75" fill="#388E3C" />

            {/* Front bright foliage */}
            <circle cx="105" cy="115" r="55" fill="#43A047" />
            <circle cx="215" cy="115" r="55" fill="#43A047" />
            <circle cx="160" cy="100" r="65" fill="#4CAF50" />

            {/* Cute flower accents */}
            <circle cx="110" cy="85" r="9" fill="#FFEB3B" />
            <circle cx="110" cy="85" r="4.5" fill="#FF9800" />
            <circle cx="210" cy="90" r="9" fill="#FF4081" />
            <circle cx="210" cy="90" r="4.5" fill="#FFEB3B" />
          </svg>
        </div>

        {/* Popping Leaf Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="leaf-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              transform: `rotate(${p.rot}deg)`
            }}
          />
        ))}
      </div>

      {/* Bottom Action Prompt */}
      <div className="peekaboo-footer">
        <button
          type="button"
          className="peekaboo-action-btn"
          style={{ backgroundColor: currentAnimal.accent }}
          onClick={(e) => {
            e.stopPropagation();
            handleInteraction();
          }}
        >
          {stage === 'popped' ? 'Lagi! Ganti Hewan 🔄' : stage === 'peeking' ? 'Buka! 🎁' : 'Ketuk Semak! 🌿'}
        </button>
      </div>
    </div>
  );
}
