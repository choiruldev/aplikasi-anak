import { useEffect, useRef, useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import {
  playBubblePop,
  playGentlePop,
  playNote,
  playRustleSound,
  playSuccessChime,
  playVoice,
  playWoodClick,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

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
  { id: 'sol', noteLabel: 'Sol', solfegeNum: '5', voiceId: 'note-sol', freq: 392.0, fill: '#00ACC1', lip: '#00838F', heightPct: 72 },
  { id: 'la', noteLabel: 'La', solfegeNum: '6', voiceId: 'note-la', freq: 440.0, fill: '#1E88E5', lip: '#1565C0', heightPct: 65 },
  { id: 'si', noteLabel: 'Si', solfegeNum: '7', voiceId: 'note-si', freq: 493.88, fill: '#8E24AA', lip: '#6A1B9A', heightPct: 58 },
  { id: 'do-high', noteLabel: "Do'", solfegeNum: '1̇', voiceId: 'note-do-high', freq: 523.25, fill: '#E91E63', lip: '#AD1457', heightPct: 51 }
];

interface NurserySong {
  id: string;
  title: string;
  notes: { barId: string; freq: number; duration: number }[];
}

const NURSERY_SONGS: NurserySong[] = [
  {
    id: 'balonku',
    title: 'Balonku',
    notes: [
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 'fa', freq: 349.23, duration: 300 },
      { barId: 'sol', freq: 392.0, duration: 480 },
      { barId: 'do-high', freq: 523.25, duration: 480 },
      { barId: 'sol', freq: 392.0, duration: 320 },
      { barId: 'mi', freq: 329.63, duration: 520 }
    ]
  },
  {
    id: 'cicak',
    title: 'Cicak',
    notes: [
      { barId: 'sol', freq: 392.0, duration: 300 },
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 'sol', freq: 392.0, duration: 300 },
      { barId: 'mi', freq: 329.63, duration: 300 },
      { barId: 'fa', freq: 349.23, duration: 300 },
      { barId: 'sol', freq: 392.0, duration: 520 }
    ]
  },
  {
    id: 'bintang',
    title: 'Bintang',
    notes: [
      { barId: 'do', freq: 261.63, duration: 300 },
      { barId: 'do', freq: 261.63, duration: 300 },
      { barId: 'sol', freq: 392.0, duration: 300 },
      { barId: 'sol', freq: 392.0, duration: 300 },
      { barId: 'la', freq: 440.0, duration: 300 },
      { barId: 'la', freq: 440.0, duration: 300 },
      { barId: 'sol', freq: 392.0, duration: 520 }
    ]
  },
  {
    id: 'pelangi',
    title: 'Pelangi',
    notes: [
      { barId: 'mi', freq: 329.63, duration: 320 },
      { barId: 'do', freq: 261.63, duration: 320 },
      { barId: 'mi', freq: 329.63, duration: 320 },
      { barId: 'sol', freq: 392.0, duration: 460 },
      { barId: 'la', freq: 440.0, duration: 320 },
      { barId: 'sol', freq: 392.0, duration: 480 }
    ]
  },
  {
    id: 'delman',
    title: 'Delman',
    notes: [
      { barId: 'sol', freq: 392.0, duration: 300 },
      { barId: 'do-high', freq: 523.25, duration: 300 },
      { barId: 'do-high', freq: 523.25, duration: 300 },
      { barId: 'si', freq: 493.88, duration: 300 },
      { barId: 'la', freq: 440.0, duration: 300 },
      { barId: 'sol', freq: 392.0, duration: 480 }
    ]
  }
];

export function SensoryPlay({ onComplete }: { onComplete: (stickerId: string) => void }): JSX.Element {
  const [studioMode, setStudioMode] = useState<'free' | 'follow'>('free');
  const [selectedSongIdx, setSelectedSongIdx] = useState(0);
  const [followStep, setFollowStep] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tapsCount, setTapsCount] = useState(0);
  const [rewarded, setRewarded] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [status, setStatus] = useState('Ketuk bilah nada atau drum ritmis!');

  const songTimersRef = useRef<number[]>([]);
  const activeSong = NURSERY_SONGS[selectedSongIdx];
  const expectedBarId =
    studioMode === 'follow' ? activeSong.notes[followStep % activeSong.notes.length]?.barId : null;

  useEffect(() => {
    preloadVoices(['sensory-xylo-tab', ...BARS.map((b) => b.voiceId)]);
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

  function registerProgress(): void {
    setTapsCount((prev) => {
      const next = prev + 1;
      if (next >= 6 && !rewarded) {
        setRewarded(true);
        triggerHaptic('success');
        fireConfetti();
        window.setTimeout(() => {
          playSuccessChime();
          onComplete('sticker-sensory');
        }, 450);
      }
      return next;
    });
  }

  function handleBarTap(bar: XylophoneBar): void {
    stopSong();
    triggerHaptic('tap');
    setActiveId(bar.id);
    playNote(bar.freq, 0.55, 0.32);

    if (studioMode === 'follow' && expectedBarId) {
      if (bar.id === expectedBarId) {
        const nextStep = followStep + 1;
        if (nextStep >= activeSong.notes.length) {
          setFollowStep(0);
          setStatus(`Hore! Lagu ${activeSong.title} selesai!`);
          fireConfetti({ count: 30 });
          playSuccessChime();
          registerProgress();
        } else {
          setFollowStep(nextStep);
          setStatus(`Bagus! Ikuti bilah menyala (${nextStep}/${activeSong.notes.length})`);
        }
      } else {
        setStatus(`Ketuk bilah yang berkilau ya!`);
      }
      return;
    }

    setStatus(`Nada ${bar.noteLabel} (${bar.solfegeNum})`);
    playVoice(bar.voiceId, 180);
    registerProgress();
  }

  function playNurseryMelody(song: NurserySong): void {
    if (playingSongId === song.id) {
      stopSong();
      return;
    }
    stopSong();
    setPlayingSongId(song.id);
    setStatus(`Memutar ${song.title}...`);

    let delay = 80;
    const timers: number[] = [];
    song.notes.forEach((n, idx) => {
      const isLast = idx === song.notes.length - 1;
      timers.push(
        window.setTimeout(() => {
          playNote(n.freq, 0.45, 0.28);
          setActiveId(n.barId);
        }, delay)
      );
      timers.push(
        window.setTimeout(() => {
          setActiveId((prev) => (prev === n.barId ? null : prev));
          if (isLast) {
            setPlayingSongId(null);
            setStatus(`Lagu ${song.title} selesai!`);
            playSuccessChime();
            registerProgress();
          }
        }, delay + n.duration - 40)
      );
      delay += n.duration;
    });
    songTimersRef.current = timers;
  }

  return (
    <section className="game-clean-stage" aria-label="Studio Musik Anak">
      <div className="game-top-bar">
        <div className="chip-row" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={studioMode === 'free'}
            className={`pill-btn touch-safe ${studioMode === 'free' ? 'is-active' : ''}`}
            onClick={() => {
              stopSong();
              setStudioMode('free');
              setStatus('Ketuk bilah nada atau drum!');
            }}
          >
            Main Bebas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={studioMode === 'follow'}
            className={`pill-btn touch-safe ${studioMode === 'follow' ? 'is-active' : ''}`}
            onClick={() => {
              stopSong();
              setStudioMode('follow');
              setFollowStep(0);
              setStatus(`Ikuti bilah menyala: ${activeSong.title}`);
            }}
          >
            Ikuti Lampu
          </button>
        </div>
        <VisualStarMeter count={Math.min(5, tapsCount)} total={5} />
      </div>

      {/* 5 Indonesian nursery melodies */}
      <div className="game-chip-scroll" aria-label="Pilih lagu anak">
        {NURSERY_SONGS.map((song, idx) => (
          <button
            key={song.id}
            type="button"
            className={`pill-btn touch-safe ${
              (studioMode === 'follow' && idx === selectedSongIdx) || playingSongId === song.id
                ? 'is-active'
                : ''
            }`}
            onClick={() => {
              setSelectedSongIdx(idx);
              setFollowStep(0);
              if (studioMode === 'free') {
                playNurseryMelody(song);
              } else {
                setStatus(`Ikuti bilah menyala: ${song.title}`);
              }
            }}
          >
            {playingSongId === song.id ? '⏹' : '▶'} {song.title}
          </button>
        ))}
      </div>

      <p className="game-mini-status">{status}</p>

      {/* 8-bar colorful xylophone */}
      <div className="xylo-rack-clean">
        {BARS.map((bar) => {
          const isStruck = activeId === bar.id;
          const isTarget = expectedBarId === bar.id;
          return (
            <button
              key={bar.id}
              type="button"
              className={`xylo-bar-clean ${isStruck ? 'is-struck' : ''} ${isTarget ? 'is-guided' : ''}`}
              style={{
                height: `${Math.round(bar.heightPct * 1.95)}px`,
                backgroundColor: bar.fill,
                borderBottomColor: bar.lip
              }}
              onClick={() => handleBarTap(bar)}
              onAnimationEnd={() => setActiveId(null)}
            >
              <span className="xylo-num">{bar.solfegeNum}</span>
              <strong>{bar.noteLabel}</strong>
            </button>
          );
        })}
      </div>

      {/* Drum & Marakas percussion strip */}
      <div className="percussion-row">
        <button
          type="button"
          className="percussion-pad"
          onClick={() => {
            triggerHaptic('tap');
            playWoodClick();
            setStatus('Tok! Ketukan Kayu');
            registerProgress();
          }}
        >
          <strong>Drum Kayu</strong>
          <span>Tok-tok!</span>
        </button>
        <button
          type="button"
          className="percussion-pad"
          onClick={() => {
            triggerHaptic('tap');
            playRustleSound();
            setStatus('Cik-cik! Marakas');
            registerProgress();
          }}
        >
          <strong>Marakas</strong>
          <span>Cik-cik!</span>
        </button>
        <button
          type="button"
          className="percussion-pad"
          onClick={() => {
            triggerHaptic('tap');
            playGentlePop();
            playBubblePop(540);
            setStatus('Ting! Lonceng');
            registerProgress();
          }}
        >
          <strong>Lonceng</strong>
          <span>Ting-ting!</span>
        </button>
      </div>
    </section>
  );
}
