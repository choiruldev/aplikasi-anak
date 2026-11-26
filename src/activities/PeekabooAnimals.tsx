import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
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

type PeekStage = 'hidden' | 'peeking' | 'popped';

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

export function PeekabooAnimals({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [mode, setMode] = useState<'peekaboo' | 'guess'>('peekaboo');
  const [animalIndex, setAnimalIndex] = useState(0);
  const [activeSpot, setActiveSpot] = useState<SpotId>('bush');
  const [stage, setStage] = useState<PeekStage>('hidden');
  const [pokeJump, setPokeJump] = useState(false);
  const [sunSpin, setSunSpin] = useState(false);
  const [cloudPop, setCloudPop] = useState(false);
  const [decoyBurst, setDecoyBurst] = useState<{ spot: SpotId; emoji: string; label: string } | null>(null);
  const [discoveredCount, setDiscoveredCount] = useState(0);
  const [guessTargetIdx, setGuessTargetIdx] = useState(0);
  const [guessScore, setGuessScore] = useState(0);
  const [guessSolved, setGuessSolved] = useState(false);
  const [guessMsg, setGuessMsg] = useState('Ketuk kotak suara, lalu pilih hewannya!');
  const [rewarded, setRewarded] = useState(false);
  const decoyTimerRef = useRef<number | null>(null);
  const pokeTimerRef = useRef<number | null>(null);

  const currentAnimal = PEEKABOO_ANIMALS[animalIndex];
  const guessTarget = PEEKABOO_ANIMALS[guessTargetIdx];

  useEffect(() => {
    preloadVoices(
      PEEKABOO_ANIMALS.map((a) => a.voiceId).filter((v): v is VoiceClipId => Boolean(v))
    );
    return () => {
      stopVoice();
      if (decoyTimerRef.current !== null) window.clearTimeout(decoyTimerRef.current);
      if (pokeTimerRef.current !== null) window.clearTimeout(pokeTimerRef.current);
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
    setPokeJump(false);
    // Pick a different random animal & a different random hiding spot!
    const nextAnimal = (animalIndex + 1 + Math.floor(Math.random() * 3)) % PEEKABOO_ANIMALS.length;
    const otherSpots = SPOTS.filter((s) => s.id !== activeSpot);
    const nextSpot = otherSpots[Math.floor(Math.random() * otherSpots.length)].id;
    setAnimalIndex(nextAnimal);
    setActiveSpot(nextSpot);
  }

  function handleSpotTap(spotId: SpotId): void {
    // If animal is already out, tapping another spot starts a fresh hide round
    if (stage === 'popped') {
      if (spotId === activeSpot) {
        handlePokeAnimal();
      } else {
        startNewHideRound();
      }
      return;
    }

    // Decoy spot -> cute butterfly/bee/flower surprise!
    if (spotId !== activeSpot) {
      const spotMeta = SPOTS.find((s) => s.id === spotId)!;
      triggerHaptic('tap');
      playGiggleFlutter();
      setDecoyBurst({ spot: spotId, emoji: spotMeta.decoyEmoji, label: spotMeta.decoyName });
      if (decoyTimerRef.current !== null) window.clearTimeout(decoyTimerRef.current);
      decoyTimerRef.current = window.setTimeout(() => setDecoyBurst(null), 1600);
      return;
    }

    // Active wiggling spot!
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
    setPokeJump(false);
    window.requestAnimationFrame(() => setPokeJump(true));
    if (pokeTimerRef.current !== null) window.clearTimeout(pokeTimerRef.current);
    pokeTimerRef.current = window.setTimeout(() => setPokeJump(false), 500);
  }

  function handleSunTap(): void {
    triggerHaptic('tap');
    playGiggleFlutter();
    setSunSpin(true);
    window.setTimeout(() => setSunSpin(false), 750);
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

  function renderSpotCover(spotId: SpotId, spotStage: PeekStage): JSX.Element {
    const open = spotStage === 'popped';
    if (spotId === 'bush') {
      return (
        <div className={`spot-cover spot-bush ${open ? 'is-open' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 120 84" className="spot-svg-half left-half">
            <circle cx="42" cy="54" r="30" fill="#3DA57A" />
            <circle cx="76" cy="44" r="34" fill="#2B7A57" />
            <circle cx="34" cy="48" r="6" fill="#FF8FAB" />
            <circle cx="34" cy="48" r="2.5" fill="#FFE066" />
          </svg>
          <svg viewBox="0 0 120 84" className="spot-svg-half right-half">
            <circle cx="44" cy="44" r="34" fill="#2B7A57" />
            <circle cx="78" cy="54" r="30" fill="#3DA57A" />
            <circle cx="84" cy="48" r="6" fill="#FFD166" />
            <circle cx="84" cy="48" r="2.5" fill="#FF6B6B" />
          </svg>
        </div>
      );
    }

    if (spotId === 'barn') {
      return (
        <div className={`spot-cover spot-barn ${open ? 'is-open' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 140 108" className="barn-frame-svg">
            <polygon points="70,6 132,42 8,42" fill="#D94848" stroke="#8C2626" strokeWidth="4" strokeLinejoin="round" />
            <rect x="18" y="42" width="104" height="62" rx="8" fill="#4A2511" />
          </svg>
          <div className="barn-door left-door" />
          <div className="barn-door right-door" />
        </div>
      );
    }

    return (
      <div className={`spot-cover spot-gift ${open ? 'is-open' : ''}`} aria-hidden="true">
        <div className="gift-lid">
          <span className="gift-bow">🎀</span>
        </div>
        <div className="gift-box">
          <div className="gift-ribbon-v" />
        </div>
      </div>
    );
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
          {/* Living Sky: Clickable Sun & Drifting Clouds */}
          <button
            type="button"
            className={`peek-sun-btn ${sunSpin ? 'is-spinning' : ''}`}
            onClick={handleSunTap}
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
          </button>

          <button
            type="button"
            className={`peek-cloud-btn ${cloudPop ? 'is-popping' : ''}`}
            onClick={handleCloudTap}
            aria-label="Awan ceria"
          >
            ☁️ {cloudPop ? '✨' : ''}
          </button>

          {/* Dynamic Big Playful Prompt Banner */}
          <div className="peek-banner-bubble" style={{ borderColor: stage === 'popped' ? currentAnimal.accent : undefined }}>
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
          </div>

          {/* Center Big Popped-Out Hero Stage (Tap animal to giggle & jump!) */}
          {stage === 'popped' && (
            <button
              type="button"
              className={`peek-hero-pop ${pokeJump ? 'is-poked' : ''}`}
              onClick={handlePokeAnimal}
              aria-label={`Ketuk ${currentAnimal.name} untuk bersuara lagi`}
            >
              <span className="peek-speech-tag" style={{ backgroundColor: currentAnimal.accent }}>
                {currentAnimal.soundWord}
              </span>
              {renderAnimalArt(currentAnimal, 152)}
              <span className="peek-poke-hint">Ketuk {currentAnimal.name} lagi! 👆</span>
            </button>
          )}

          {/* Rolling Meadow Ground + 3 Interactive Hiding Spots */}
          <div className="peek-meadow-hill" aria-hidden="true" />

          <div className="peek-spots-row">
            {SPOTS.map((spot) => {
              const isTarget = spot.id === activeSpot;
              const spotStage: PeekStage = isTarget ? stage : 'hidden';
              const isWiggling = isTarget && stage === 'hidden';
              const isPeeking = isTarget && stage === 'peeking';
              const hasDecoy = decoyBurst?.spot === spot.id;

              return (
                <button
                  key={spot.id}
                  type="button"
                  className={`peek-spot-btn ${isWiggling ? 'is-wiggling' : ''} ${isPeeking ? 'is-peeking' : ''} ${isTarget && stage === 'popped' ? 'is-popped' : ''}`}
                  onClick={() => handleSpotTap(spot.id)}
                  aria-label={spot.label}
                >
                  {/* Floating '?' wiggle clue */}
                  {isWiggling && (
                    <span className="peek-clue-badge" aria-hidden="true">
                      ✨ ?
                    </span>
                  )}

                  {/* First-time tap finger guide */}
                  {discoveredCount === 0 && isWiggling && (
                    <span className="peek-finger-hint" aria-hidden="true">
                      <TapHintFinger size={36} />
                    </span>
                  )}

                  {/* Decoy butterfly / bee / flower float */}
                  {hasDecoy && (
                    <span className="peek-decoy-float" aria-hidden="true">
                      {decoyBurst.emoji}
                    </span>
                  )}

                  {/* Peeking animal head rising behind the hiding spot! */}
                  {isTarget && stage !== 'popped' && (
                    <div className={`peek-spot-actor stage-${spotStage}`}>
                      {renderAnimalArt(currentAnimal, 92)}
                    </div>
                  )}

                  {/* Animated Cover (Bush / Barn / Gift) */}
                  {renderSpotCover(spot.id, spotStage)}
                </button>
              );
            })}
          </div>

          {/* Big Cheerful "Hide Again!" Button once popped */}
          {stage === 'popped' && (
            <button
              type="button"
              className="peek-next-btn touch-safe"
              onClick={startNewHideRound}
            >
              🙈 Sembunyi Lagi!
            </button>
          )}
        </div>
      ) : (
        <div className="habit-visual-stage">
          <button
            type="button"
            className={`guess-mystery-box ${guessSolved ? 'is-solved' : ''}`}
            onClick={() => playAnimalSound(guessTarget, false)}
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
          </button>

          <h2 className="edu-prompt-title">{guessMsg}</h2>

          <div className="guess-options-row">
            {guessOptions.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className="edu-word-card touch-safe"
                style={{ backgroundColor: choice.cardTint }}
                onClick={() => answerGuess(choice)}
              >
                {renderAnimalArt(choice, 68)}
                <strong>{choice.name}</strong>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
