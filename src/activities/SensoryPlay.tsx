import { useEffect, useState, type JSX } from 'react';
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
  voiceId: VoiceClipId;
  colorName: string;
  noteLabel: string;
  freq: number;
  fill: string;
  lip: string;
  objectExample: string;
  heightPct: number;
}

const BARS: XylophoneBar[] = [
  { id: 'do', voiceId: 'color-do', colorName: 'Merah', noteLabel: 'Do', freq: 261.63, fill: '#D94848', lip: '#A93232', objectExample: 'Merah seperti apel', heightPct: 100 },
  { id: 're', voiceId: 'color-re', colorName: 'Jingga', noteLabel: 'Re', freq: 293.66, fill: '#E06B34', lip: '#B04E1F', objectExample: 'Jingga seperti jeruk', heightPct: 92 },
  { id: 'mi', voiceId: 'color-mi', colorName: 'Kuning', noteLabel: 'Mi', freq: 329.63, fill: '#E89F1C', lip: '#B87B0E', objectExample: 'Kuning seperti pisang', heightPct: 84 },
  { id: 'fa', voiceId: 'color-fa', colorName: 'Hijau', noteLabel: 'Fa', freq: 349.23, fill: '#2B9361', lip: '#1D6B45', objectExample: 'Hijau seperti daun', heightPct: 76 },
  { id: 'sol', voiceId: 'color-sol', colorName: 'Biru', noteLabel: 'Sol', freq: 392.0, fill: '#2978B5', lip: '#1B5685', objectExample: 'Biru seperti laut', heightPct: 68 },
  { id: 'la', voiceId: 'color-la', colorName: 'Toska', noteLabel: 'La', freq: 440.0, fill: '#1D9A9E', lip: '#136E71', objectExample: 'Toska seperti air kolam', heightPct: 60 }
];

export function SensoryPlay({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [tab, setTab] = useState<'animals' | 'xylophone'>('animals');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [caption, setCaption] = useState('Sentuh gambar hewan yuk! 🐾');
  const [currentClip, setCurrentClip] = useState<VoiceClipId>('sensory-intro');
  const [visited, setVisited] = useState<Set<string>>(() => new Set());
  const [rewarded, setRewarded] = useState(false);

  useEffect(() => {
    preloadVoices([
      'sensory-intro',
      'sensory-animals-tab',
      'sensory-xylo-tab',
      ...ANIMALS.map((a) => a.voiceId),
      ...BARS.map((b) => b.voiceId)
    ]);
    return () => stopVoice();
  }, []);

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
    triggerHaptic('tap');
    setActiveId(animal.id);
    setCaption(`${animal.soundWord} • ${animal.name}`);
    setCurrentClip(animal.voiceId);
    playAnimalMotif(animal.id);
    playVoice(animal.voiceId, 340);
    markVisited(`a:${animal.id}`);
  }

  function handleBarTap(bar: XylophoneBar): void {
    triggerHaptic('tap');
    setActiveId(bar.id);
    setCaption(`🎵 ${bar.noteLabel} • ${bar.colorName}`);
    setCurrentClip(bar.voiceId);
    playNote(bar.freq, 0.48, 0.26);
    playVoice(bar.voiceId, 260);
    markVisited(`b:${bar.id}`);
  }

  return (
    <section className="activity-stage" aria-labelledby="sensory-title">
      <div className="stage-header">
        <div>
          <div className="stage-title-row">
            <h1 id="sensory-title" className="stage-title">Suara &amp; Warna</h1>
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

      <div className="mode-switcher" role="tablist" aria-label="Pilih permainan sensori">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'animals'}
          className={`mode-tab ${tab === 'animals' ? 'is-active' : ''}`}
          onClick={() => {
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
            setTab('xylophone');
            setCaption('Sentuh bilah gambang! 🎶');
            setCurrentClip('sensory-xylo-tab');
            playVoice('sensory-xylo-tab');
          }}
        >
          🎹 Gambang Warna
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
        <div className="xylophone-frame" aria-label="Gambang enam warna">
          {BARS.map((bar) => {
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
              >
                {isStruck && (
                  <span className="xylo-sparkle-fx" aria-hidden="true">🎶</span>
                )}
                <span className="xylo-screw" aria-hidden="true" />
                <span className="xylo-note">{bar.noteLabel}</span>
                <span className="xylo-color">{bar.colorName}</span>
                <span className="xylo-screw" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
