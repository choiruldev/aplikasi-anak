// Multi-mood procedural Web Audio music engine (zero external files):
// - 'lullaby': Slow soothing pentatonic music box (baby tools & bedtime)
// - 'playful': Light cheerful marimba bounce (toddler & preschool games)
// - 'dance': Upbeat rhythmic drum + bass + melody (GrossMotorPlay / Patung Musik)

export type BgmMood = 'lullaby' | 'playful' | 'dance';

let bgmCtx: AudioContext | null = null;
let bgmGain: GainNode | null = null;
let bgmInterval: number | null = null;
let isPlaying = false;
let currentMood: BgmMood = 'lullaby';
let step = 0;

const PENTATONIC = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.0,  // G4
  440.0,  // A4
  523.25, // C5
  587.33, // D5
  659.25  // E5
];

const LULLABY_STEPS: (number | null)[] = [
  0, 2, 4, 2, 0, 2, 3, null,
  4, 5, 4, 3, 2, 0, 2, null,
  3, 4, 5, 4, 3, 2, 0, null,
  2, 3, 4, 2, 0, null, 0, null
];

const PLAYFUL_STEPS: (number | null)[] = [
  0, 2, 3, 5, 3, 2, 4, null,
  5, 4, 3, 2, 0, 2, 3, null,
  2, 4, 5, 7, 5, 4, 3, null,
  4, 3, 2, 0, 2, null, 0, null
];

const DANCE_STEPS: (number | null)[] = [
  0, null, 3, 5, 4, null, 3, 2,
  0, 2, 3, 5, 7, null, 5, 3
];

function getBgmContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!bgmCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      bgmCtx = new AudioCtx();
    }
  }
  if (bgmCtx && bgmCtx.state === 'suspended') {
    bgmCtx.resume().catch(() => {});
  }
  return bgmCtx;
}

function playTone(
  freq: number,
  time: number,
  duration: number,
  volume: number,
  wave: OscillatorType = 'sine'
): void {
  const ctx = getBgmContext();
  if (!ctx || !bgmGain) return;

  const osc1 = ctx.createOscillator();
  osc1.type = wave;
  osc1.frequency.setValueAtTime(freq, time);

  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2, time);

  const noteGain = ctx.createGain();
  noteGain.gain.setValueAtTime(0.0001, time);
  noteGain.gain.exponentialRampToValueAtTime(volume, time + 0.014);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(0.0001, time);
  overtoneGain.gain.exponentialRampToValueAtTime(volume * 0.22, time + 0.014);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.55);

  osc1.connect(noteGain);
  osc2.connect(overtoneGain);
  noteGain.connect(bgmGain);
  overtoneGain.connect(bgmGain);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + duration + 0.05);
  osc2.stop(time + duration * 0.6 + 0.05);
}

function playSoftKick(time: number, accent = false): void {
  const ctx = getBgmContext();
  if (!ctx || !bgmGain) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(accent ? 145 : 115, time);
  osc.frequency.exponentialRampToValueAtTime(48, time + 0.14);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(accent ? 0.26 : 0.16, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
  osc.connect(gain);
  gain.connect(bgmGain);
  osc.start(time);
  osc.stop(time + 0.18);
}

export function startBgm(mood: BgmMood = 'lullaby'): void {
  if (isPlaying && currentMood === mood) return;
  stopLullabyBgm();

  const ctx = getBgmContext();
  if (!ctx) return;

  if (!bgmGain) {
    bgmGain = ctx.createGain();
    bgmGain.gain.value = 0.18;
    bgmGain.connect(ctx.destination);
  } else {
    bgmGain.gain.setTargetAtTime(mood === 'dance' ? 0.24 : 0.16, ctx.currentTime, 0.05);
  }

  isPlaying = true;
  currentMood = mood;
  step = 0;

  const intervalMs = mood === 'dance' ? 320 : mood === 'playful' ? 540 : 1100;
  const pattern =
    mood === 'dance' ? DANCE_STEPS : mood === 'playful' ? PLAYFUL_STEPS : LULLABY_STEPS;

  const tick = () => {
    if (!isPlaying || !bgmCtx) return;
    const now = bgmCtx.currentTime + 0.04;
    const idx = step % pattern.length;
    const noteIdx = pattern[idx];

    if (mood === 'dance' && idx % 2 === 0) {
      playSoftKick(now, idx % 4 === 0);
    }

    if (noteIdx !== null && noteIdx !== undefined) {
      const freq = PENTATONIC[noteIdx];
      if (freq) {
        if (mood === 'dance') {
          playTone(freq, now, 0.26, 0.15, 'triangle');
        } else if (mood === 'playful') {
          playTone(freq, now, 0.45, 0.11, 'sine');
        } else {
          playTone(freq, now, 1.8, 0.12, 'sine');
        }
      }
    }
    step++;
  };

  tick();
  bgmInterval = window.setInterval(tick, intervalMs);
}

export function startLullabyBgm(): void {
  startBgm('lullaby');
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

export function getActiveBgmMood(): BgmMood {
  return currentMood;
}
