import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion
} from 'motion/react';
import { AnimalIllustration, IconSpeaker, TapHintFinger, VisualStarMeter, type AnimalId } from '../components/Art.tsx';
import {
  playAnimalMotif,
  playBoingSound,
  playBubblePop,
  playGiggleFlutter,
  playPeekAnticipation,
  playRustleSound,
  playSuccessChime,
  playVoice,
  preloadVoices,
  speakPhrase,
  stopVoice,
  type VoiceClipId
} from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

type ExtraAnimalId = 'bunny' | 'lion' | 'sheep' | 'chick';
type SpotId = 'bush' | 'barn' | 'gift';
type PeekStage = 'hidden' | 'peeking' | 'popped';

interface PeekabooAnimal {
  id: string;
  artId?: AnimalId;
  extraId?: ExtraAnimalId;
  name: string;
  soundWord: string;
  voiceId?: VoiceClipId;
  accent: string;
  cardTint: string;
}

const PEEKABOO_ANIMALS: PeekabooAnimal[] = [
  { id: 'cat', artId: 'cat', name: 'Kucing', soundWord: 'Meong!', voiceId: 'animal-cat', accent: '#E06B34', cardTint: '#FFF3E8' },
  { id: 'duck', artId: 'duck', name: 'Bebek', soundWord: 'Kwek kwek!', voiceId: 'animal-duck', accent: '#C68500', cardTint: '#FFFBE6' },
  { id: 'cow', artId: 'cow', name: 'Sapi', soundWord: 'Mooo!', voiceId: 'animal-cow', accent: '#2B9361', cardTint: '#EFF8F3' },
  { id: 'frog', artId: 'frog', name: 'Katak', soundWord: 'Krok krok!', voiceId: 'animal-frog', accent: '#1F7A5C', cardTint: '#ECF8F0' },
  { id: 'elephant', artId: 'elephant', name: 'Gajah', soundWord: 'Tuut!', voiceId: 'animal-elephant', accent: '#2978B5', cardTint: '#EEF6FB' },
  { id: 'bird', artId: 'bird', name: 'Burung', soundWord: 'Cuit cuit!', voiceId: 'animal-bird', accent: '#6C4CE6', cardTint: '#F3EEFB' },
  { id: 'bunny', extraId: 'bunny', name: 'Kelinci', soundWord: 'Cit cit!', accent: '#D85A7F', cardTint: '#FFF0F5' },
  { id: 'lion', extraId: 'lion', name: 'Singa', soundWord: 'Roaaar!', accent: '#C8760A', cardTint: '#FFF4DF' },
  { id: 'sheep', extraId: 'sheep', name: 'Domba', soundWord: 'Mbeeek!', accent: '#4C7A99', cardTint: '#EEF5FA' },
  { id: 'chick', extraId: 'chick', name: 'Anak Ayam', soundWord: 'Piyik piyik!', accent: '#D9820B', cardTint: '#FFF9E0' }
];

const SPOTS: Array<{ id: SpotId; label: string; decoyEmoji: string; decoyName: string }> = [
  { id: 'bush', label: 'Semak Berbunga', decoyEmoji: '🦋', decoyName: 'Kupu-kupu!' },
  { id: 'barn', label: 'Rumah Kayu', decoyEmoji: '🐝', decoyName: 'Lebah kecil!' },
  { id: 'gift', label: 'Kotak Kado', decoyEmoji: '🌸', decoyName: 'Bunga mekar!' }
];

const SPRING_SOFT = { type: 'spring' as const, stiffness: 200, damping: 17, mass: 0.9 };
const SPRING_BOUNCY = { type: 'spring' as const, stiffness: 240, damping: 15, mass: 0.85 };

function ExtraAnimalSvg({ id, size = 120 }: { id: ExtraAnimalId; size?: number }): JSX.Element {
  switch (id) {
    case 'bunny':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <ellipse cx="36" cy="22" rx="8" ry="20" fill="#FFFDF9" stroke="#D85A7F" strokeWidth="3" />
          <ellipse cx="36" cy="24" rx="4" ry="12" fill="#FFB8CE" />
          <ellipse cx="60" cy="22" rx="8" ry="20" fill="#FFFDF9" stroke="#D85A7F" strokeWidth="3" />
          <ellipse cx="60" cy="24" rx="4" ry="12" fill="#FFB8CE" />
          <circle cx="48" cy="56" r="27" fill="#FFFDF9" stroke="#D85A7F" strokeWidth="3" />
          <circle cx="38" cy="52" r="4.5" fill="#182421" />
          <circle cx="36.5" cy="50.5" r="1.6" fill="#FFFFFF" />
          <circle cx="58" cy="52" r="4.5" fill="#182421" />
          <circle cx="56.5" cy="50.5" r="1.6" fill="#FFFFFF" />
          <ellipse cx="31" cy="60" rx="5" ry="3" fill="#FFA6C1" opacity="0.8" />
          <ellipse cx="65" cy="60" rx="5" ry="3" fill="#FFA6C1" opacity="0.8" />
          <ellipse cx="48" cy="59" rx="4.5" ry="3.2" fill="#FF7EA5" />
          <path d="M43 65Q48 70 53 65" stroke="#182421" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'lion':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <circle
              key={deg}
              cx={48 + Math.cos((deg * Math.PI) / 180) * 30}
              cy={50 + Math.sin((deg * Math.PI) / 180) * 30}
              r="11"
              fill="#D97706"
            />
          ))}
          <circle cx="30" cy="28" r="8" fill="#FBBF24" />
          <circle cx="66" cy="28" r="8" fill="#FBBF24" />
          <circle cx="48" cy="50" r="25" fill="#FCD34D" />
          <circle cx="39" cy="46" r="4.4" fill="#182421" />
          <circle cx="37.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          <circle cx="57" cy="46" r="4.4" fill="#182421" />
          <circle cx="55.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          <polygon points="43,53 53,53 48,59" fill="#9A3412" />
          <path d="M48 59V63M42 64Q48 69 54 64" stroke="#182421" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'sheep':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <circle cx="48" cy="26" r="15" fill="#FFFFFF" stroke="#B7C9D6" strokeWidth="2.5" />
          <circle cx="30" cy="36" r="14" fill="#FFFFFF" stroke="#B7C9D6" strokeWidth="2.5" />
          <circle cx="66" cy="36" r="14" fill="#FFFFFF" stroke="#B7C9D6" strokeWidth="2.5" />
          <circle cx="28" cy="56" r="14" fill="#FFFFFF" stroke="#B7C9D6" strokeWidth="2.5" />
          <circle cx="68" cy="56" r="14" fill="#FFFFFF" stroke="#B7C9D6" strokeWidth="2.5" />
          <circle cx="48" cy="68" r="16" fill="#FFFFFF" stroke="#B7C9D6" strokeWidth="2.5" />
          <ellipse cx="22" cy="46" rx="8" ry="5" fill="#F4C7A8" />
          <ellipse cx="74" cy="46" rx="8" ry="5" fill="#F4C7A8" />
          <ellipse cx="48" cy="52" rx="20" ry="22" fill="#FDE2CF" />
          <circle cx="48" cy="32" r="12" fill="#FFFFFF" />
          <circle cx="40" cy="50" r="4" fill="#182421" />
          <circle cx="56" cy="50" r="4" fill="#182421" />
          <ellipse cx="34" cy="57" rx="4.5" ry="2.6" fill="#F59E9E" opacity="0.8" />
          <ellipse cx="62" cy="57" rx="4.5" ry="2.6" fill="#F59E9E" opacity="0.8" />
          <path d="M43 60Q48 65 53 60" stroke="#182421" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'chick':
      return (
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden="true">
          <path d="M46 18C44 10 52 10 50 18C54 12 60 15 54 22" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="22" cy="58" rx="10" ry="14" transform="rotate(-18 22 58)" fill="#FBBF24" />
          <ellipse cx="74" cy="58" rx="10" ry="14" transform="rotate(18 74 58)" fill="#FBBF24" />
          <circle cx="48" cy="52" r="28" fill="#FDE047" stroke="#F59E0B" strokeWidth="3" />
          <circle cx="38" cy="47" r="4.5" fill="#182421" />
          <circle cx="36.5" cy="45.5" r="1.5" fill="#FFFFFF" />
          <circle cx="58" cy="47" r="4.5" fill="#182421" />
          <circle cx="56.5" cy="45.5" r="1.5" fill="#FFFFFF" />
          <ellipse cx="30" cy="55" rx="5" ry="3" fill="#FB923C" opacity="0.7" />
          <ellipse cx="66" cy="55" rx="5" ry="3" fill="#FB923C" opacity="0.7" />
          <polygon points="42,54 54,54 48,64" fill="#EA580C" />
        </svg>
      );
  }
}

function renderAnimalArt(animal: PeekabooAnimal, size = 128): JSX.Element {
  if (animal.artId) return <AnimalIllustration id={animal.artId} size={size} />;
  return <ExtraAnimalSvg id={animal.extraId ?? 'bunny'} size={size} />;
}

/**
 * Silky 60-120fps continuous sine-wave harmonic sway (zero keyframe stops/kinks!).
 * Anchored firmly at center-bottom so the bush/barn/gift stays planted naturally on the grass.
 */
function SmoothHidingCover({
  spotId,
  isWiggling,
  isOpen
}: {
  spotId: SpotId;
  isWiggling: boolean;
  isOpen: boolean;
}): JSX.Element {
  const reducedMotion = useReducedMotion();
  const rotate = useMotionValue(0);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const ampRef = useRef(0);

  useAnimationFrame((time, delta) => {
    const dt = Math.min(0.05, delta / 1000);
    const targetAmp = isWiggling && !reducedMotion ? 1 : 0;
    // Smooth exponential blend so starting/stopping the sway never snaps!
    ampRef.current += (targetAmp - ampRef.current) * Math.min(1, dt * 6);
    const a = ampRef.current;

    if (a < 0.002) {
      if (rotate.get() !== 0) {
        rotate.set(0);
        scaleX.set(1);
        scaleY.set(1);
      }
      return;
    }

    const t = time / 1000;
    // Pure C-infinity continuous sine wave pendulum + volume-preserving squishy breath
    const sway = Math.sin(t * 2.4) * 4.2 * a;
    const breath = Math.cos(t * 4.8) * 0.026 * a;
    rotate.set(sway);
    scaleX.set(1 + breath);
    scaleY.set(1 - breath);
  });

  if (spotId === 'bush') {
    return (
      <motion.div
        className="spot-cover spot-bush"
        style={{ rotate, scaleX, scaleY, transformOrigin: 'center bottom' }}
        aria-hidden="true"
      >
        <motion.svg
          viewBox="0 0 120 84"
          className="spot-svg-half left-half"
          animate={isOpen ? { x: -30, rotate: -18, opacity: 0.42 } : { x: 0, rotate: 0, opacity: 1 }}
          transition={SPRING_SOFT}
        >
          <circle cx="42" cy="54" r="30" fill="#3DA57A" />
          <circle cx="76" cy="44" r="34" fill="#2B7A57" />
          <circle cx="34" cy="48" r="6" fill="#FF8FAB" />
          <circle cx="34" cy="48" r="2.5" fill="#FFE066" />
        </motion.svg>
        <motion.svg
          viewBox="0 0 120 84"
          className="spot-svg-half right-half"
          animate={isOpen ? { x: 30, rotate: 18, opacity: 0.42 } : { x: 0, rotate: 0, opacity: 1 }}
          transition={SPRING_SOFT}
        >
          <circle cx="44" cy="44" r="34" fill="#2B7A57" />
          <circle cx="78" cy="54" r="30" fill="#3DA57A" />
          <circle cx="84" cy="48" r="6" fill="#FFD166" />
          <circle cx="84" cy="48" r="2.5" fill="#FF6B6B" />
        </motion.svg>
      </motion.div>
    );
  }

  if (spotId === 'barn') {
    return (
      <motion.div
        className="spot-cover spot-barn"
        style={{ rotate, scaleX, scaleY, transformOrigin: 'center bottom' }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 140 108" className="barn-frame-svg">
          <polygon points="70,6 132,42 8,42" fill="#D94848" stroke="#8C2626" strokeWidth="4" strokeLinejoin="round" />
          <rect x="18" y="42" width="104" height="62" rx="8" fill="#4A2511" />
        </svg>
        <motion.div
          className="barn-door left-door"
          animate={isOpen ? { rotateY: -115 } : { rotateY: 0 }}
          transition={SPRING_SOFT}
          style={{ transformPerspective: 200 }}
        />
        <motion.div
          className="barn-door right-door"
          animate={isOpen ? { rotateY: 115 } : { rotateY: 0 }}
          transition={SPRING_SOFT}
          style={{ transformPerspective: 200 }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="spot-cover spot-gift"
      style={{ rotate, scaleX, scaleY, transformOrigin: 'center bottom' }}
      aria-hidden="true"
    >
      <motion.div
        className="gift-lid"
        animate={isOpen ? { y: -38, rotate: 20, opacity: 0.35 } : { y: 0, rotate: 0, opacity: 1 }}
        transition={SPRING_SOFT}
      >
        <span className="gift-bow">🎀</span>
      </motion.div>
      <div className="gift-box">
        <div className="gift-ribbon-v" />
      </div>
    </motion.div>
  );
}

export function PeekabooAnimals({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [mode, setMode] = useState<'peekaboo' | 'guess'>('peekaboo');
  const [animalIndex, setAnimalIndex] = useState(0);
  const [activeSpot, setActiveSpot] = useState<SpotId>('bush');
  const [stage, setStage] = useState<PeekStage>('hidden');
  const [pokeTick, setPokeTick] = useState(0);
  const [sunAngle, setSunAngle] = useState(0);
  const [cloudPop, setCloudPop] = useState(false);
  const [decoyBurst, setDecoyBurst] = useState<{ id: number; spot: SpotId; emoji: string; label: string } | null>(null);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [guessTargetIdx, setGuessTargetIdx] = useState(0);
  const [guessScore, setGuessScore] = useState(0);
  const [guessSolved, setGuessSolved] = useState(false);
  const [guessMsg, setGuessMsg] = useState('Ketuk kotak suara, lalu pilih hewannya!');
  const [rewarded, setRewarded] = useState(false);
  const decoyTimerRef = useRef<number | null>(null);

  const currentAnimal = PEEKABOO_ANIMALS[animalIndex];
  const guessTarget = PEEKABOO_ANIMALS[guessTargetIdx];

  useEffect(() => {
    preloadVoices(
      PEEKABOO_ANIMALS.map((a) => a.voiceId).filter((v): v is VoiceClipId => Boolean(v))
    );
    return () => {
      stopVoice();
      if (decoyTimerRef.current !== null) window.clearTimeout(decoyTimerRef.current);
    };
  }, []);

  function playAnimalSound(animal: PeekabooAnimal, sayCilukba = false): void {
    if (animal.artId) playAnimalMotif(animal.artId);
    else playBoingSound();

    if (animal.voiceId) {
      playVoice(animal.voiceId, 240);
    } else {
      const prefix = sayCilukba ? 'Cilukbaa! ' : '';
      speakPhrase(`${prefix}${animal.soundWord} Ini ${animal.name}!`);
    }
  }

  function startNewHideRound(): void {
    stopVoice();
    playRustleSound();
    triggerHaptic('tap');
    setStage('hidden');
    setDecoyBurst(null);
    setPokeTick(0);
    const nextAnimal = (animalIndex + 1 + Math.floor(Math.random() * 3)) % PEEKABOO_ANIMALS.length;
    const otherSpots = SPOTS.filter((s) => s.id !== activeSpot);
    const nextSpot = otherSpots[Math.floor(Math.random() * otherSpots.length)].id;
    setAnimalIndex(nextAnimal);
    setActiveSpot(nextSpot);
  }

  function handleSpotTap(spotId: SpotId): void {
    if (stage === 'popped') {
      if (spotId === activeSpot) {
        handlePokeAnimal();
      } else {
        startNewHideRound();
      }
      return;
    }

    if (spotId !== activeSpot) {
      const spotMeta = SPOTS.find((s) => s.id === spotId)!;
      triggerHaptic('tap');
      playGiggleFlutter();
      setDecoyBurst({ id: Date.now(), spot: spotId, emoji: spotMeta.decoyEmoji, label: spotMeta.decoyName });
      if (decoyTimerRef.current !== null) window.clearTimeout(decoyTimerRef.current);
      decoyTimerRef.current = window.setTimeout(() => setDecoyBurst(null), 1600);
      return;
    }

    if (stage === 'hidden') {
      triggerHaptic('tap');
      playRustleSound();
      playPeekAnticipation();
      speakPhrase('Ciluuuk...');
      setStage('peeking');
    } else if (stage === 'peeking') {
      triggerHaptic('success');
      playBoingSound();
      fireConfetti({ count: 36 });
      setStage('popped');
      setDecoyBurst(null);
      playAnimalSound(currentAnimal, true);

      setDiscoveredCount((prev) => {
        const next = prev + 1;
        if (next >= 5 && !rewarded) {
          setRewarded(true);
          window.setTimeout(() => {
            playSuccessChime();
            onComplete('sticker-peekaboo');
          }, 800);
        }
        return next;
      });
    }
  }

  function handlePokeAnimal(): void {
    triggerHaptic('tap');
    playBoingSound();
    playAnimalSound(currentAnimal, false);
    setPokeTick((n) => n + 1);
  }

  function handleSunTap(): void {
    triggerHaptic('tap');
    playGiggleFlutter();
    setSunAngle((deg) => deg + 180);
  }

  function handleCloudTap(): void {
    triggerHaptic('tap');
    playBubblePop(560);
    setCloudPop(true);
    window.setTimeout(() => setCloudPop(false), 650);
  }

  function setupNextGuess(): void {
    const nextIdx = (guessTargetIdx + 1 + Math.floor(Math.random() * 4)) % PEEKABOO_ANIMALS.length;
    setGuessTargetIdx(nextIdx);
    setGuessSolved(false);
    const target = PEEKABOO_ANIMALS[nextIdx];
    setGuessMsg(`Siapa yang bunyi "${target.soundWord}"?`);
    playAnimalSound(target, false);
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
    if (guessSolved) return;
    if (choice.id === guessTarget.id) {
      setGuessSolved(true);
      triggerHaptic('success');
      playBoingSound();
      playSuccessChime();
      fireConfetti({ count: 32 });
      setGuessMsg(`BAAA! Betul, itu ${choice.name} (${choice.soundWord})!`);
      const next = guessScore + 1;
      setGuessScore(next);
      if (next >= 3 && !rewarded) {
        setRewarded(true);
        onComplete('sticker-peekaboo');
      }
      window.setTimeout(setupNextGuess, 1550);
    } else {
      playBubblePop(250);
      setGuessMsg(`Itu ${choice.name}. Yuk dengar lagi!`);
      playAnimalSound(guessTarget, false);
    }
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
            🙈 Cilukba
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
            🔊 Tebak ({guessScore})
          </button>
        </div>

        <div className="game-top-tools">
          <VisualStarMeter count={Math.min(5, mode === 'peekaboo' ? discoveredCount : guessScore)} total={5} />
          {mode === 'guess' && (
            <button
              type="button"
              className="icon-tool-btn touch-safe"
              onClick={() => playAnimalSound(guessTarget, false)}
              aria-label="Putar suara hewan"
            >
              <IconSpeaker size={18} />
            </button>
          )}
        </div>
      </div>

      {mode === 'peekaboo' ? (
        <div className={`peekaboo-world is-${stage}`}>
          {/* Living Sky: Spring-Spinning Sun & Smoothly Gliding Cloud */}
          <motion.button
            type="button"
            className="peek-sun-btn"
            onClick={handleSunTap}
            animate={{ rotate: sunAngle }}
            whileTap={{ scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            aria-label="Matahari tersenyum"
          >
            <svg viewBox="0 0 64 64" width="54" height="54" aria-hidden="true">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <line
                  key={a}
                  x1="32"
                  y1="32"
                  x2={32 + Math.cos((a * Math.PI) / 180) * 28}
                  y2={32 + Math.sin((a * Math.PI) / 180) * 28}
                  stroke="#F59E0B"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              ))}
              <circle cx="32" cy="32" r="18" fill="#FDE047" stroke="#F59E0B" strokeWidth="2.5" />
              <circle cx="26" cy="29" r="2.2" fill="#182421" />
              <circle cx="38" cy="29" r="2.2" fill="#182421" />
              <path d="M26 36Q32 41 38 36" stroke="#182421" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </motion.button>

          <motion.button
            type="button"
            className="peek-cloud-btn"
            onClick={handleCloudTap}
            animate={{ x: [0, 24, 0], scale: cloudPop ? 1.25 : 1 }}
            transition={{
              x: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
              scale: SPRING_BOUNCY
            }}
            aria-label="Awan ceria"
          >
            ☁️ {cloudPop ? '✨' : ''}
          </motion.button>

          {/* Dynamic Playful Prompt Banner */}
          <motion.div
            key={`${stage}-${decoyBurst?.id ?? 'none'}`}
            className="peek-banner-bubble"
            style={{ borderColor: stage === 'popped' ? currentAnimal.accent : undefined }}
            initial={{ scale: 0.94, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING_SOFT}
          >
            {stage === 'popped' ? (
              <strong style={{ color: currentAnimal.accent }}>
                BAAA! {currentAnimal.soundWord} Ini {currentAnimal.name}!
              </strong>
            ) : stage === 'peeking' ? (
              <strong>Ciluuuk... Ketuk lagi! 👀</strong>
            ) : decoyBurst ? (
              <strong>{decoyBurst.emoji} {decoyBurst.label} Cari yang goyang!</strong>
            ) : (
              <strong>Ada siapa yang goyang-goyang? 👆</strong>
            )}
          </motion.div>

          {/* Center Popped-Out Hero with Real Spring Physics */}
          <AnimatePresence>
            {stage === 'popped' && (
              <motion.button
                key={`hero-${currentAnimal.id}-${pokeTick}`}
                type="button"
                className="peek-hero-pop"
                onClick={handlePokeAnimal}
                initial={
                  pokeTick === 0
                    ? { y: 80, scale: 0.45, opacity: 0 }
                    : { y: -18, scaleX: 0.92, scaleY: 1.1, opacity: 1 }
                }
                animate={{ y: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1 }}
                exit={{ y: 50, scale: 0.5, opacity: 0 }}
                whileTap={{ scaleX: 1.08, scaleY: 0.9 }}
                transition={SPRING_BOUNCY}
                aria-label={`Ketuk ${currentAnimal.name} untuk bersuara lagi`}
              >
                <span className="peek-speech-tag" style={{ backgroundColor: currentAnimal.accent }}>
                  {currentAnimal.soundWord}
                </span>
                {renderAnimalArt(currentAnimal, 152)}
                <span className="peek-poke-hint">Ketuk {currentAnimal.name} lagi! 👆</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Meadow Hill + 3 Interactive Hiding Spots */}
          <div className="peek-meadow-hill" aria-hidden="true" />

          <div className="peek-spots-row">
            {SPOTS.map((spot) => {
              const isTarget = spot.id === activeSpot;
              const isWiggling = isTarget && stage === 'hidden';
              const isPeeking = isTarget && stage === 'peeking';
              const isOpen = isTarget && stage === 'popped';
              const hasDecoy = decoyBurst?.spot === spot.id;

              return (
                <motion.button
                  key={spot.id}
                  type="button"
                  className={`peek-spot-btn ${isWiggling ? 'is-wiggling' : ''} ${isPeeking ? 'is-peeking' : ''} ${isOpen ? 'is-popped' : ''}`}
                  onClick={() => handleSpotTap(spot.id)}
                  whileTap={{ scaleX: 1.06, scaleY: 0.93 }}
                  transition={SPRING_SOFT}
                  style={{ transformOrigin: 'center bottom' }}
                  aria-label={spot.label}
                >
                  {/* Smooth floating '?' clue */}
                  <AnimatePresence>
                    {isWiggling && (
                      <motion.span
                        className="peek-clue-badge"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: [0, -5, 0] }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{
                          y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
                          opacity: { duration: 0.25 }
                        }}
                        aria-hidden="true"
                      >
                        ✨ ?
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* First-time tap finger guide */}
                  {discoveredCount === 0 && isWiggling && (
                    <span className="peek-finger-hint" aria-hidden="true">
                      <TapHintFinger size={36} />
                    </span>
                  )}

                  {/* Smooth curved decoy butterfly / bee / flower */}
                  <AnimatePresence>
                    {hasDecoy && decoyBurst && (
                      <motion.span
                        key={decoyBurst.id}
                        className="peek-decoy-float"
                        initial={{ y: 20, x: 0, scale: 0.4, opacity: 0 }}
                        animate={{ y: -64, x: [0, 12, -8, 10], scale: [0.5, 1.2, 1.05, 0.9], opacity: [0, 1, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.45, ease: 'easeOut' }}
                        aria-hidden="true"
                      >
                        {decoyBurst.emoji}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Animal peeking smoothly out on a real spring! */}
                  <AnimatePresence>
                    {isTarget && isPeeking && (
                      <motion.div
                        key={`peek-${currentAnimal.id}`}
                        className="peek-spot-actor"
                        initial={{ y: 34, scale: 0.65, opacity: 0 }}
                        animate={{ y: -40, scale: 1, opacity: 1 }}
                        exit={{ y: -64, scale: 1.1, opacity: 0 }}
                        transition={SPRING_BOUNCY}
                      >
                        {renderAnimalArt(currentAnimal, 94)}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 60-120fps Continuous Harmonic Sway Cover */}
                  <SmoothHidingCover spotId={spot.id} isWiggling={isWiggling} isOpen={isOpen} />
                </motion.button>
              );
            })}
          </div>

          {/* Big Cheerful "Hide Again!" Button */}
          <AnimatePresence>
            {stage === 'popped' && (
              <motion.button
                type="button"
                className="peek-next-btn touch-safe"
                onClick={startNewHideRound}
                initial={{ y: 24, opacity: 0, scale: 0.88 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 16, opacity: 0 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING_SOFT}
              >
                🙈 Sembunyi Lagi!
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="habit-visual-stage">
          <motion.button
            type="button"
            className={`guess-mystery-box ${guessSolved ? 'is-solved' : ''}`}
            onClick={() => playAnimalSound(guessTarget, false)}
            animate={guessSolved ? { scale: [0.9, 1.06, 1], y: 0 } : { y: [0, -6, 0] }}
            whileTap={{ scale: 0.94 }}
            transition={
              guessSolved
                ? SPRING_BOUNCY
                : { y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } }
            }
            aria-label="Dengarkan suara hewan misteri"
          >
            {guessSolved ? (
              renderAnimalArt(guessTarget, 108)
            ) : (
              <>
                <span className="guess-q-mark">🎁</span>
                <strong>Ketuk Dengar Suara 🔊</strong>
              </>
            )}
          </motion.button>

          <h2 className="edu-prompt-title">{guessMsg}</h2>

          <div className="guess-options-row">
            {guessOptions.map((choice) => (
              <motion.button
                key={choice.id}
                type="button"
                className="edu-word-card touch-safe"
                style={{ backgroundColor: choice.cardTint }}
                whileTap={{ scale: 0.94 }}
                transition={SPRING_SOFT}
                onClick={() => answerGuess(choice)}
              >
                {renderAnimalArt(choice, 68)}
                <strong>{choice.name}</strong>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
