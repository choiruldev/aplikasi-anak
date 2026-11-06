// Soothing procedural nursery lullaby music box synthesizer (Web Audio API)
// Plays a soft, calming pentatonic melody in the background with zero external audio assets.
// Features click-free gentle envelope, harmonic warmth, and auto volume ducking.

let bgmCtx: AudioContext | null = null;
let bgmGain: GainNode | null = null;
let bgmInterval: number | null = null;
let isPlaying = false;
let step = 0;

// Pentatonic C major lullaby scale (C4, D4, E4, G4, A4, C5, D5, E5)
const PENTATONIC = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25  // E5
];

// Relaxing, repetitive bedtime lullaby motif
const MELODY_STEPS: (number | null)[] = [
  0, 2, 4, 2,  0, 2, 3, null,
  4, 5, 4, 3,  2, 0, 2, null,
  3, 4, 5, 4,  3, 2, 0, null,
  2, 3, 4, 2,  0, null, 0, null
];

function getBgmContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!bgmCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      bgmCtx = new AudioCtx();
    }
  }
  if (bgmCtx && bgmCtx.state === 'suspended') {
    bgmCtx.resume().catch(() => {});
  }
  return bgmCtx;
}

function playMusicBoxNote(freq: number, time: number): void {
  const ctx = getBgmContext();
  if (!ctx || !bgmGain) return;

  // Primary sweet bell tone (Sine)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, time);

  // Soft sparkle overtone (soft triangle octave higher)
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2, time);

  const noteGain = ctx.createGain();
  noteGain.gain.setValueAtTime(0.0001, time);
  // Soft gentle attack (12ms)
  noteGain.gain.exponentialRampToValueAtTime(0.12, time + 0.015);
  // Long warm chime decay (1.8s)
  noteGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);

  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(0.0001, time);
  overtoneGain.gain.exponentialRampToValueAtTime(0.025, time + 0.015);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.9);

  osc1.connect(noteGain);
  osc2.connect(overtoneGain);
  noteGain.connect(bgmGain);
  overtoneGain.connect(bgmGain);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 1.85);
  osc2.stop(time + 1.0);
}

export function startLullabyBgm(): void {
  if (isPlaying) return;
  const ctx = getBgmContext();
  if (!ctx) return;

  if (!bgmGain) {
    bgmGain = ctx.createGain();
    bgmGain.gain.value = 0.18; // Soft, comfortable ambient level
    bgmGain.connect(ctx.destination);
  }

  isPlaying = true;
  step = 0;

  // Gentle tempo: 1 note every 1200ms
  bgmInterval = window.setInterval(() => {
    if (!isPlaying || !bgmCtx) return;
    const noteIdx = MELODY_STEPS[step % MELODY_STEPS.length];
    step++;

    if (noteIdx !== null && noteIdx !== undefined) {
      const freq = PENTATONIC[noteIdx];
      if (freq) {
        playMusicBoxNote(freq, bgmCtx.currentTime + 0.05);
      }
    }
  }, 1100);
}

export function stopLullabyBgm(): void {
  isPlaying = false;
  if (bgmInterval !== null) {
    window.clearInterval(bgmInterval);
    bgmInterval = null;
  }
}

export function isLullabyPlaying(): boolean {
  return isPlaying;
}
