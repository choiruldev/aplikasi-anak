import { useEffect, useRef, useState, type JSX } from 'react';
import { AnimalIllustration, IconSpeaker, TapHintFinger, VisualStarMeter, type AnimalId } from '../components/Art';
import {
  playAnimalMotif,
  playNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio';
import { fireConfetti, triggerHaptic } from '../lib/confetti';

interface AnimalCard {
  id: AnimalId;
  voiceId: VoiceClipId;
  name: string;
  soundWord: string;
  fact: string;
  tint: string;
}

const ANIMALS: AnimalCard[] = [
  { id: 'cat', voiceId: 'animal-cat', name: 'Kucing', soundWord: 'Meong!', fact: 'Kucing punya kumis halus.', tint: '#FCE9DF' },
  { id: 'cow', voiceId: 'animal-cow', name: 'Sapi', soundWord: 'Mooo!', fact: 'Sapi suka makan rumput hijau.', tint: '#EBF1EE' },
  { id: 'duck', voiceId: 'animal-duck', name: 'Bebek', soundWord: 'Kwek kwek!', fact: 'Bebek pandai berenang di air.', tint: '#FBF1D6' },
  { id: 'elephant', voiceId: 'animal-elephant', name: 'Gajah', soundWord: 'Tuut!', fact: 'Gajah punya belalai panjang.', tint: '#E2EEF6' },
  { id: 'frog', voiceId: 'animal-frog', name: 'Katak', soundWord: 'Krok krok!', fact: 'Katak melompat tinggi sekali.', tint: '#E1F2E8' },
  { id: 'bird', voiceId: 'animal-bird', name: 'Burung', soundWord: 'Cuit cuit!', fact: 'Burung terbang di langit biru.', tint: '#DFECF7' }
];

interface XylophoneBar {
  id: string;
  noteLabel: string;
  solfegeNum: string;
  voiceId: VoiceClipId;
  freq: number;
  fill: string;
  lip: string;
  heightPct: number;
}

const BARS: XylophoneBar[] = [
  { id: 'do', noteLabel: 'Do', solfegeNum: '1', voiceId: 'note-do', freq: 261.63, fill: '#E53935', lip: '#B71C1C', heightPct: 100 },
  { id: 're', noteLabel: 'Re', solfegeNum: '2', voiceId: 'note-re', freq: 293.66, fill: '#FB8C00', lip: '#C66900', heightPct: 93 },
  { id: 'mi', noteLabel: 'Mi', solfegeNum: '3', voiceId: 'note-mi', freq: 329.63, fill: '#FDD835', lip: '#C49B00', heightPct: 86 },
  { id: 'fa', noteLabel: 'Fa', solfegeNum: '4', voiceId: 'note-fa', freq: 349.23, fill: '#43A047', lip: '#2E7D32', heightPct: 79 },
  { id: 'sol', noteLabel: 'Sol', solfegeNum: '5', voiceId: 'note-sol', freq: 392.00, fill: '#00ACC1', lip: '#00838F', heightPct: 72 },
  { id: 'la', noteLabel: 'La', solfegeNum: '6', voiceId: 'note-la', freq: 440.00, fill: '#1E88E5', lip: '#1565C0', heightPct: 65 },
  { id: 'si', noteLabel: 'Si', solfegeNum: '7', voiceId: 'note-si', freq: 493.88, fill: '#8E24AA', lip: '#6A1B9A', heightPct: 58 },
  { id: 'do-high', noteLabel: "Do'", solfegeNum: '1̇', voiceId: 'note-do-high', freq: 523.25, fill: '#E91E63', lip: '#AD1457', heightPct: 51 }
];

interface NurserySong {
  id: string;
  title: string;
  emoji: string;
  notes: { barId: string; freq: number; duration: number }[];
}

const NURSERY_SONGS: NurserySong[] = [
  {
    id: 'balonku',
    title: 'Balonku',
    emoji: '🎈',
    notes: [
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 'fa', freq: 349.23, duration: 300 },
      { barId: 'sol', freq: 392.00, duration: 480 },
      { barId: 'do-high', freq: 523.25, duration: 480 },
      { barId: 'sol', freq: 392.00, duration: 320 },
      { barId: 'mi', freq: 329.63, duration: 520 },
      { barId: 'fa', freq: 349.23, duration: 300 },
      { barId: 'sol', freq: 392.00, duration: 300 },
      { barId: 'fa', freq: 349.23, duration: 300 },
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 're', freq: 293.66, duration: 300 },
      { barId: 'do', freq: 261.63, duration: 600 }
    ]
  },
  {
    id: 'cicak',
    title: 'Cicak',
    emoji: '🦎',
    notes: [
      { barId: 'sol', freq: 392.00, duration: 300 },
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 'sol', freq: 392.00, duration: 300 },
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 'fa', freq: 349.23, duration: 300 },
      { barId: 'sol', freq: 392.00, duration: 520 },
      { barId: 'fa', freq: 349.23, duration: 300 },
      { barId: 're', freq: 293.66, duration: 300 },
      { barId: 'fa', freq: 349.23, duration: 300 },
      { barId: 're', freq: 293.66, duration: 300 },
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 'fa', freq: 349.23, duration: 520 }
    ]
  },
  {
    id: 'bintang',
    title: 'Bintang',
    emoji: '⭐',
    notes: [
      { barId: 'do', freq: 261.63, duration: 300 },
      { barId: 'do', freq: 261.63, duration: 300 },
      { barId: 'sol', freq: 392.00, duration: 300 },
      { barId: 'sol', freq: 392.00, duration: 300 },
      { barId: 'la', freq: 440.00, duration: 300 },
      { barId: 'la', freq: 440.00, duration: 300 },
      { barId: 'sol', freq: 392.00, duration: 520 },
      { barId: 'fa', freq: 349.23, duration: 300 },
      { barId: 'fa', freq: 349.23, duration: 300 },
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 're', freq: 293.66, duration: 300 },
      { barId: 're', freq: 293.66, duration: 300 },
      { barId: 'do', freq: 261.63, duration: 600 }
    ]
  }
];

export function SensoryPlay({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [tab, setTab] = useState<'animals' | 'xylophone'>('animals');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [caption, setCaption] = useState('Sentuh gambar hewan yuk! 🐾');
  const [currentClip, setCurrentClip] = useState<VoiceClipId>('sensory-intro');
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [rewarded, setRewarded] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  const songTimersRef = useRef<number[]>([]);

  useEffect(() => {
    preloadVoices([
      'sensory-intro',
      'sensory-animals-tab',
      'sensory-xylo-tab',
      ...ANIMALS.map((a) => a.voiceId),
      ...BARS.map((b) => b.voiceId)
    ]);
    return () => {
      stopVoice();
      stopSong();
    };
  }, []);

  function stopSong(): void {
    songTimersRef.current.forEach((t) => window.clearTimeout(t));
    songTimersRef.current = [];
    setPlayingSongId(null);
  }

  function markVisited(key: string): void {
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(key);
      if (next.size >= 5 && !rewarded) {
        setRewarded(true);
        triggerHaptic('success');
        fireConfetti();
        setCaption('Hebat! Yeaaay! 🎉');
        window.setTimeout(() => {
          playSuccessChime();
          onComplete('sticker-sensory');
        }, 550);
      }
      return next;
    });
  }

  function handleAnimalTap(animal: AnimalCard): void {
    stopSong();
    triggerHaptic('tap');
    setActiveId(animal.id);
    setCaption(`${animal.soundWord} • ${animal.name}`);
    setCurrentClip(animal.voiceId);
    playAnimalMotif(animal.id);
    playVoice(animal.voiceId, 340);
    markVisited(`a:${animal.id}`);
  }

  function handleBarTap(bar: XylophoneBar): void {
    stopSong();
    triggerHaptic('tap');
    setActiveId(bar.id);
    setCaption(`🎵 Nada ${bar.noteLabel} (${bar.solfegeNum})`);
    setCurrentClip(bar.voiceId);
    playNote(bar.freq, 0.55, 0.32);
    playVoice(bar.voiceId, 200);
    markVisited(`b:${bar.id}`);
  }

  function playNurseryMelody(song: NurserySong): void {
    if (playingSongId === song.id) {
      stopSong();
      setCaption('Sentuh nada Do-Re-Mi! 🎶');
      return;
    }

    stopSong();
    setPlayingSongId(song.id);
    setCaption(`🎵 Memutar Lagu: ${song.title} ${song.emoji}`);
    markVisited(`song:${song.id}`);

    let accumulatedDelay = 80;
    const timers: number[] = [];

    song.notes.forEach((note, index) => {
      const isLast = index === song.notes.length - 1;

      // Note strike timer
      const strikeTimer = window.setTimeout(() => {
        triggerHaptic('tap');
        playNote(note.freq, 0.48, 0.28);
        setActiveId(note.barId);
      }, accumulatedDelay);
      timers.push(strikeTimer);

      // Note release timer
      const releaseTimer = window.setTimeout(() => {
        setActiveId((prev) => (prev === note.barId ? null : prev));
        if (isLast) {
          setPlayingSongId(null);
          setCaption(`Horeee! Lagu ${song.title} selesai! 🎉`);
          fireConfetti();
          playSuccessChime();
        }
      }, accumulatedDelay + note.duration - 50);
      timers.push(releaseTimer);

      accumulatedDelay += note.duration;
    });

    songTimersRef.current = timers;
  }

  return (
    <section className="activity-stage" aria-labelledby="sensory-title">
      <div className="stage-header">
        <div>
          <div className="stage-title-row">
            <h1 id="sensory-title" className="stage-title">Suara &amp; Nada</h1>
            <VisualStarMeter count={Math.min(visited.size, 5)} total={5} />
          </div>
          <p className="stage-subtitle">{caption}</p>
        </div>
        <button
          type="button"
          className="voice-btn"
          onClick={() => playVoice(currentClip)}
          aria-label="Dengarkan panduan suara"
        >
          <IconSpeaker size={24} />
          <span>Dengar</span>
        </button>
      </div>

      <div className="mode-switcher" role="tablist" aria-label="Pilih permainan suara dan nada">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'animals'}
          className={`mode-tab ${tab === 'animals' ? 'is-active' : ''}`}
          onClick={() => {
            stopSong();
            setTab('animals');
            setCaption('Sentuh hewan lucu! 🐾');
            setCurrentClip('sensory-animals-tab');
            playVoice('sensory-animals-tab');
          }}
        >
          🐾 Suara Hewan
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'xylophone'}
          className={`mode-tab ${tab === 'xylophone' ? 'is-active' : ''}`}
          onClick={() => {
            stopSong();
            setTab('xylophone');
            setCaption('Sentuh nada Do-Re-Mi! 🎶');
            setCurrentClip('sensory-xylo-tab');
            playVoice('sensory-xylo-tab');
          }}
        >
          🎹 Gambang Nada
        </button>
      </div>

      {tab === 'animals' ? (
        <div className="animal-grid">
          {ANIMALS.map((animal, idx) => {
            const isBouncing = activeId === animal.id;
            return (
              <button
                key={animal.id}
                type="button"
                className={`animal-tile ${isBouncing ? 'is-bouncing' : ''}`}
                style={{ backgroundColor: animal.tint }}
                onClick={() => handleAnimalTap(animal)}
                onAnimationEnd={() => setActiveId(null)}
              >
                {/* Sound wave ripple on active tap */}
                {isBouncing && (
                  <>
                    <span className="tile-sound-ripple" aria-hidden="true" />
                    <span className="tile-note-particle" aria-hidden="true">🎵</span>
                  </>
                )}

                {/* Initial guide finger for toddlers if no taps yet */}
                {visited.size === 0 && idx === 0 && (
                  <div className="tile-tap-guide">
                    <TapHintFinger size={38} />
                  </div>
                )}

                <AnimalIllustration id={animal.id} size={92} className="animal-svg-alive" />
                <span className="animal-name">{animal.name}</span>
                <span className="animal-sound">{animal.soundWord}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="xylophone-container">
          {/* Nursery Melodies Quick Player for Toddlers */}
          <div className="xylo-melodies-bar" aria-label="Pilihan melodi lagu anak">
            <span className="xylo-melodies-label">Melodi Ceria:</span>
            {NURSERY_SONGS.map((song) => {
              const isPlaying = playingSongId === song.id;
              return (
                <button
                  key={song.id}
                  type="button"
                  className={`melody-chip-btn ${isPlaying ? 'is-playing' : ''}`}
                  onClick={() => playNurseryMelody(song)}
                  aria-label={`${isPlaying ? 'Hentikan' : 'Mainkan'} lagu ${song.title}`}
                >
                  <span>{song.emoji}</span>
                  <span>{song.title}</span>
                  <span className="melody-chip-status">{isPlaying ? '⏹' : '▶'}</span>
                </button>
              );
            })}
          </div>

          {/* 8-Note Full Diatonic Glockenspiel / Xylophone */}
          <div className="xylophone-frame" aria-label="Gambang nada delapan bilah do re mi fa sol la si do">
            {BARS.map((bar, idx) => {
              const isStruck = activeId === bar.id;
              return (
                <button
                  key={bar.id}
                  type="button"
                  className={`xylo-bar ${isStruck ? 'is-struck' : ''}`}
                  style={{
                    backgroundColor: bar.fill,
                    borderBottomColor: bar.lip,
                    height: `${bar.heightPct}%`
                  }}
                  onPointerDown={() => handleBarTap(bar)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBarTap(bar);
                    }
                  }}
                  aria-label={`Nada ${bar.noteLabel} (${bar.solfegeNum})`}
                >
                  {isStruck && (
                    <span className="xylo-sparkle-fx" aria-hidden="true">🎶</span>
                  )}
                  {/* Subtle initial hint on note Do if toddler hasn't touched any yet */}
                  {visited.size === 0 && idx === 0 && (
                    <div className="xylo-tap-guide">
                      <TapHintFinger size={30} />
                    </div>
                  )}
                  <span className="xylo-screw" aria-hidden="true" />
                  <span className="xylo-number">{bar.solfegeNum}</span>
                  <span className="xylo-note">{bar.noteLabel}</span>
                  <span className="xylo-screw" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
