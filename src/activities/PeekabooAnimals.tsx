import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { AnimalIllustration, IconSpeaker, TapHintFinger, VisualStarMeter, type AnimalId } from '../components/Art.tsx';
import {
  playAnimalMotif,
  playBoingSound,
  playBubblePop,
  playRustleSound,
  playSuccessChime,
  playVoice,
  preloadVoices,
  speakPhrase,
  stopVoice,
  type VoiceClipId
} from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';
import { getNextAnimalIndex } from '../lib/toddler.ts';

interface PeekabooAnimal {
  id: string;
  artId?: AnimalId;
  emoji?: string;
  name: string;
  soundWord: string;
  voiceId?: VoiceClipId;
  habitat: 'semak' | 'kolam' | 'padang';
  bgTint: string;
  accent: string;
}

const PEEKABOO_ANIMALS: PeekabooAnimal[] = [
  { id: 'cat', artId: 'cat', name: 'Kucing', soundWord: 'Meong!', voiceId: 'animal-cat', habitat: 'semak', bgTint: '#FFF3E8', accent: '#E06B34' },
  { id: 'duck', artId: 'duck', name: 'Bebek', soundWord: 'Kwek kwek!', voiceId: 'animal-duck', habitat: 'kolam', bgTint: '#FFFBE6', accent: '#C68500' },
  { id: 'cow', artId: 'cow', name: 'Sapi', soundWord: 'Mooo!', voiceId: 'animal-cow', habitat: 'padang', bgTint: '#F0F7F4', accent: '#2B9361' },
  { id: 'frog', artId: 'frog', name: 'Katak', soundWord: 'Krok krok!', voiceId: 'animal-frog', habitat: 'kolam', bgTint: '#ECF8F0', accent: '#1F7A5C' },
  { id: 'elephant', artId: 'elephant', name: 'Gajah', soundWord: 'Tuut!', voiceId: 'animal-elephant', habitat: 'padang', bgTint: '#EEF6FB', accent: '#2978B5' },
  { id: 'bird', artId: 'bird', name: 'Burung', soundWord: 'Cuit cuit!', voiceId: 'animal-bird', habitat: 'semak', bgTint: '#F3EEFB', accent: '#7C4DFF' },
  { id: 'chicken', emoji: '🐔', name: 'Ayam', soundWord: 'Kukuruyuk!', habitat: 'padang', bgTint: '#FFF4E5', accent: '#D95E32' },
  { id: 'sheep', emoji: '🐑', name: 'Domba', soundWord: 'Mbeeek!', habitat: 'padang', bgTint: '#EEF4F8', accent: '#5D8AA8' },
  { id: 'lion', emoji: '🦁', name: 'Singa', soundWord: 'Roaaar!', habitat: 'semak', bgTint: '#FFF2DC', accent: '#C68500' },
  { id: 'whale', emoji: '🐳', name: 'Paus', soundWord: 'Byuuur!', habitat: 'kolam', bgTint: '#E6F4FC', accent: '#1982C4' }
];

type Stage = 'hidden' | 'peeking' | 'popped';

export function PeekabooAnimals({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [mode, setMode] = useState<'peekaboo' | 'guess'>('peekaboo');
  const [animalIndex, setAnimalIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('hidden');
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [guessTargetIdx, setGuessTargetIdx] = useState(0);
  const [guessScore, setGuessScore] = useState(0);
  const [guessMsg, setGuessMsg] = useState('Dengarkan suara, pilih hewannya!');
  const [rewarded, setRewarded] = useState(false);
  const autoNextTimerRef = useRef<number | null>(null);

  const currentAnimal = PEEKABOO_ANIMALS[animalIndex];
  const guessTarget = PEEKABOO_ANIMALS[guessTargetIdx];

  useEffect(() => {
    preloadVoices(
      PEEKABOO_ANIMALS.map((a) => a.voiceId).filter((v): v is VoiceClipId => Boolean(v))
    );
    return () => {
      stopVoice();
      if (autoNextTimerRef.current !== null) window.clearTimeout(autoNextTimerRef.current);
    };
  }, []);

  function playAnimalSound(animal: PeekabooAnimal): void {
    if (animal.artId) playAnimalMotif(animal.artId);
    if (animal.voiceId) playVoice(animal.voiceId, 260);
    else speakPhrase(`${animal.soundWord} Ini ${animal.name}!`);
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

  function handlePeekInteraction(): void {
    if (stage === 'hidden') {
      triggerHaptic('tap');
      playRustleSound();
      setStage('peeking');
    } else if (stage === 'peeking') {
      triggerHaptic('success');
      playBoingSound();
      fireConfetti({ count: 28 });
      setStage('popped');
      playAnimalSound(currentAnimal);

      setDiscoveredCount((prev) => {
        const next = prev + 1;
        if (next >= 5 && !rewarded) {
          setRewarded(true);
          window.setTimeout(() => {
            playSuccessChime();
            onComplete('sticker-peekaboo');
          }, 700);
        }
        return next;
      });

      if (autoNextTimerRef.current !== null) window.clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = window.setTimeout(advanceToNext, 4200);
    } else {
      advanceToNext();
    }
  }

  function setupNextGuess(): void {
    const nextIdx = Math.floor(Math.random() * PEEKABOO_ANIMALS.length);
    setGuessTargetIdx(nextIdx);
    const target = PEEKABOO_ANIMALS[nextIdx];
    setGuessMsg(`Siapa yang bunyi "${target.soundWord}"?`);
    playAnimalSound(target);
  }

  const guessOptions = useMemo(() => {
    const arr = [guessTarget];
    for (let i = 0; i < PEEKABOO_ANIMALS.length && arr.length < 3; i++) {
      const cand = PEEKABOO_ANIMALS[(guessTargetIdx + i * 3 + 1) % PEEKABOO_ANIMALS.length];
      if (!arr.some((x) => x.id === cand.id)) arr.push(cand);
    }
    return arr.sort((a, b) => a.name.localeCompare(b.name));
  }, [guessTarget, guessTargetIdx]);

  function answerGuess(choice: PeekabooAnimal): void {
    if (choice.id === guessTarget.id) {
      triggerHaptic('success');
      playSuccessChime();
      fireConfetti({ count: 26 });
      setGuessMsg(`Betul! Itu ${choice.name} (${choice.soundWord})!`);
      const next = guessScore + 1;
      setGuessScore(next);
      if (next >= 3 && !rewarded) {
        setRewarded(true);
        onComplete('sticker-peekaboo');
      }
      window.setTimeout(setupNextGuess, 1200);
    } else {
      playBubblePop(250);
      setGuessMsg(`Itu ${choice.name}. Yuk dengar lagi!`);
      playAnimalSound(guessTarget);
    }
  }

  function renderAnimalGraphic(animal: PeekabooAnimal, size = 120): JSX.Element {
    if (animal.artId) return <AnimalIllustration id={animal.artId} size={size} />;
    return <span style={{ fontSize: `${Math.round(size * 0.72)}px`, lineHeight: 1 }} aria-hidden="true">{animal.emoji}</span>;
  }

  return (
    <section className="game-clean-stage" aria-label="Cilukba Hewan">
      <div className="game-top-bar">
        <div className="chip-row" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'peekaboo'}
            className={`pill-btn touch-safe ${mode === 'peekaboo' ? 'is-active' : ''}`}
            onClick={() => setMode('peekaboo')}
          >
            Cilukba (10)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'guess'}
            className={`pill-btn touch-safe ${mode === 'guess' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('guess');
              setupNextGuess();
            }}
          >
            Tebak Suara ({guessScore})
          </button>
        </div>

        <div className="game-top-tools">
          <VisualStarMeter count={Math.min(5, mode === 'peekaboo' ? discoveredCount : guessScore)} total={5} />
          {mode === 'guess' && (
            <button type="button" className="icon-tool-btn" onClick={() => playAnimalSound(guessTarget)} aria-label="Putar suara hewan">
              <IconSpeaker size={18} />
            </button>
          )}
        </div>
      </div>

      {mode === 'peekaboo' ? (
        <div
          className="peekaboo-clean-card"
          style={{ backgroundColor: currentAnimal.bgTint }}
          onPointerDown={handlePeekInteraction}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handlePeekInteraction();
          }}
        >
          <h2 className="edu-prompt-title" style={{ color: currentAnimal.accent }}>
            {stage === 'popped'
              ? `${currentAnimal.soundWord} ${currentAnimal.name}`
              : stage === 'peeking'
                ? 'Ciluk...'
                : 'Ketuk semaknya!'}
          </h2>

          <div className="peekaboo-stage-center">
            <div className={`peekaboo-actor stage-${stage}`}>
              {renderAnimalGraphic(currentAnimal, 132)}
            </div>
            <div className={`peekaboo-cover habitat-${currentAnimal.habitat} stage-${stage}`}>
              {discoveredCount === 0 && stage === 'hidden' && (
                <span className="tile-tap-guide"><TapHintFinger size={36} /></span>
              )}
              <svg viewBox="0 0 260 110" width="240" height="102" aria-hidden="true">
                {currentAnimal.habitat === 'kolam' ? (
                  <path d="M10 60 Q50 30 90 60 T170 60 T250 60 V106 H10 Z" fill="#4BA3E3" />
                ) : currentAnimal.habitat === 'padang' ? (
                  <path d="M12 104 Q70 28 130 56 Q190 22 248 104 Z" fill="#7AC77A" />
                ) : (
                  <>
                    <circle cx="70" cy="68" r="42" fill="#3DA57A" />
                    <circle cx="130" cy="52" r="48" fill="#2B6E4F" />
                    <circle cx="190" cy="68" r="42" fill="#3DA57A" />
                  </>
                )}
              </svg>
            </div>
          </div>

          <span className="muted-mini">
            {stage === 'popped' ? 'Ketuk lagi untuk hewan berikutnya' : 'Ketuk di mana saja'}
          </span>
        </div>
      ) : (
        <div className="habit-visual-stage">
          <h2 className="edu-prompt-title">{guessMsg}</h2>
          <div className="edu-cards-grid">
            {guessOptions.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className="edu-word-card"
                style={{ backgroundColor: choice.bgTint }}
                onClick={() => answerGuess(choice)}
              >
                {renderAnimalGraphic(choice, 70)}
                <strong>{choice.name}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
