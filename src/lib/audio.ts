// Smooth Web Audio engine:
// 1. Pre-rendered Neural Indonesian voice clips (/voices/*.mp3) decoded into AudioBuffers
//    with 35ms click-free fade-out on interruption and request-token cancellation.
// 2. Warm acoustic marimba & filtered sound motifs routed through a master DynamicsCompressorNode
//    so rapid multi-touch tapping never clips or crackles.

export type VoiceClipId =
  | 'sensory-intro'
  | 'sensory-animals-tab'
  | 'sensory-xylo-tab'
  | 'animal-cat'
  | 'animal-cow'
  | 'animal-duck'
  | 'animal-elephant'
  | 'animal-frog'
  | 'animal-bird'
  | 'note-do'
  | 'note-re'
  | 'note-mi'
  | 'note-fa'
  | 'note-sol'
  | 'note-la'
  | 'note-si'
  | 'note-do-high'
  | 'color-do'
  | 'color-re'
  | 'color-mi'
  | 'color-fa'
  | 'color-sol'
  | 'color-la'
  | 'shapes-intro'
  | 'shapes-new-board'
  | 'shapes-done'
  | 'shape-ok-circle'
  | 'shape-ok-square'
  | 'shape-ok-triangle'
  | 'shape-ok-star'
  | 'shape-ok-diamond'
  | 'shape-ok-heart'
  | 'shape-hint-circle'
  | 'shape-hint-square'
  | 'shape-hint-triangle'
  | 'shape-hint-star'
  | 'shape-hint-diamond'
  | 'shape-hint-heart'
  | 'trace-clear'
  | 'trace-done'
  | 'trace-line'
  | 'trace-zigzag'
  | 'trace-circle'
  | 'trace-A'
  | 'trace-I'
  | 'trace-U'
  | 'trace-1'
  | 'trace-2'
  | 'trace-3'
  | 'motor-bunny'
  | 'motor-plane'
  | 'motor-stomp'
  | 'motor-reach'
  | 'motor-freeze'
  | 'count-1'
  | 'count-2'
  | 'count-3'
  | 'count-4'
  | 'count-5'
  | 'count-6'
  | 'count-7'
  | 'count-8'
  | 'count-9'
  | 'count-10'
  | 'numbers-intro'
  | 'numbers-done'
  | 'number-1'
  | 'number-2'
  | 'number-3'
  | 'number-4'
  | 'number-5'
  | 'number-6'
  | 'number-7'
  | 'number-8'
  | 'number-9'
  | 'number-10'
  | 'alphabet-intro'
  | 'alphabet-done'
  | 'letter-a'
  | 'letter-b'
  | 'letter-c'
  | 'letter-d'
  | 'letter-e'
  | 'letter-f'
  | 'letter-g'
  | 'letter-h'
  | 'letter-i'
  | 'letter-j'
  | 'letter-k'
  | 'letter-l'
  | 'letter-m'
  | 'letter-n'
  | 'letter-o'
  | 'letter-p'
  | 'letter-q'
  | 'letter-r'
  | 'letter-s'
  | 'letter-t'
  | 'letter-u'
  | 'letter-v'
  | 'letter-w'
  | 'letter-x'
  | 'letter-y'
  | 'letter-z'
  | 'motor-start-balance'
  | 'motor-start-dance'
  | 'motor-freeze-now'
  | 'motor-dance-again'
  | 'motor-done'
  | 'coloring-intro'
  | 'coloring-tab-book'
  | 'coloring-tab-music'
  | 'coloring-done'
  | 'color-palette-merah'
  | 'color-palette-kuning'
  | 'color-palette-hijau'
  | 'color-palette-biru'
  | 'color-palette-jingga'
  | 'color-palette-ungu'
  | 'color-palette-pink'
  | 'color-palette-cokelat'
  | 'puzzle-intro'
  | 'puzzle-snap'
  | 'puzzle-done'
  | 'puzzle-new'
  | 'balloon-intro'
  | 'balloon-camera-on'
  | 'balloon-touch-mode'
  | 'balloon-pop-great'
  | 'balloon-done';

let ctx: AudioContext | null = null;
let masterBus: DynamicsCompressorNode | null = null;

let soundOn = true;
let voiceOn = true;

const bufferCache = new Map<VoiceClipId, AudioBuffer>();
const pendingLoads = new Map<VoiceClipId, Promise<AudioBuffer | null>>();

let activeVoiceSource: AudioBufferSourceNode | null = null;
let activeVoiceGain: GainNode | null = null;
let pendingVoiceTimer: number | null = null;
let voiceToken = 0;
let lastStepNoteMs = 0;

function getMaster(): { audio: AudioContext; out: AudioNode } | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    masterBus = ctx.createDynamicsCompressor();
    masterBus.threshold.setValueAtTime(-12, ctx.currentTime);
    masterBus.knee.setValueAtTime(18, ctx.currentTime);
    masterBus.ratio.setValueAtTime(4, ctx.currentTime);
    masterBus.attack.setValueAtTime(0.003, ctx.currentTime);
    masterBus.release.setValueAtTime(0.18, ctx.currentTime);
    masterBus.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return { audio: ctx, out: masterBus ?? ctx.destination };
}

export function unlockAudio(): void {
  getMaster();
}

export function stopVoice(): void {
  voiceToken++;
  if (pendingVoiceTimer !== null) {
    window.clearTimeout(pendingVoiceTimer);
    pendingVoiceTimer = null;
  }
  if (activeVoiceSource && activeVoiceGain && ctx) {
    const now = ctx.currentTime;
    const oldSrc = activeVoiceSource;
    const oldGain = activeVoiceGain;
    activeVoiceSource = null;
    activeVoiceGain = null;
    try {
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.linearRampToValueAtTime(0.0001, now + 0.035);
      oldSrc.stop(now + 0.04);
    } catch {
      // Source already ended
    }
  }
}

export function setAudioPreferences(sound: boolean, voice: boolean): void {
  soundOn = sound;
  voiceOn = voice;
  if (!voice) {
    stopVoice();
  }
}

async function loadVoiceBuffer(audio: AudioContext, clipId: VoiceClipId): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(clipId);
  if (cached) return cached;

  const inflight = pendingLoads.get(clipId);
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const base = import.meta.env.BASE_URL || '/';
      const cleanBase = base.endsWith('/') ? base : `${base}/`;
      const res = await fetch(`${cleanBase}voices/${clipId}.mp3`);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const decoded = await audio.decodeAudioData(arr);
      bufferCache.set(clipId, decoded);
      return decoded;
    } catch {
      return null;
    } finally {
      pendingLoads.delete(clipId);
    }
  })();

  pendingLoads.set(clipId, promise);
  return promise;
}

export function preloadVoices(clipIds: readonly VoiceClipId[]): void {
  const m = getMaster();
  if (!m) return;
  for (const id of clipIds) {
    void loadVoiceBuffer(m.audio, id);
  }
}

export function playVoice(clipId: VoiceClipId, delayMs = 0): void {
  if (!voiceOn) return;
  stopVoice();
  const myToken = voiceToken;

  const run = async () => {
    const m = getMaster();
    if (!m || !voiceOn || myToken !== voiceToken) return;

    const buffer = await loadVoiceBuffer(m.audio, clipId);
    if (!buffer || !voiceOn || myToken !== voiceToken) return;

    if (m.audio.state === 'suspended') {
      try {
        await m.audio.resume();
      } catch {
        return;
      }
    }

    const now = m.audio.currentTime;
    const src = m.audio.createBufferSource();
    const gain = m.audio.createGain();

    src.buffer = buffer;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.95, now + 0.015);

    src.connect(gain);
    gain.connect(m.out);

    src.onended = () => {
      if (activeVoiceSource === src) {
        activeVoiceSource = null;
        activeVoiceGain = null;
      }
    };

    activeVoiceSource = src;
    activeVoiceGain = gain;
    src.start(now);
  };

  if (delayMs > 0) {
    pendingVoiceTimer = window.setTimeout(() => {
      pendingVoiceTimer = null;
      void run();
    }, delayMs);
  } else {
    void run();
  }
}

/**
 * Warm wooden marimba tone: pure sine fundamental + soft harmonic mallet tap.
 * Zero harsh square/sawtooth waves and zero discontinuous clicks.
 */
export function playNote(freq: number, duration = 0.38, volume = 0.24): void {
  if (!soundOn) return;
  const m = getMaster();
  if (!m) return;

  const { audio, out } = m;
  const now = audio.currentTime;

  const fundamental = audio.createOscillator();
  const overtone = audio.createOscillator();
  const mainGain = audio.createGain();
  const overtoneGain = audio.createGain();

  fundamental.type = 'sine';
  fundamental.frequency.setValueAtTime(freq, now);

  overtone.type = 'sine';
  overtone.frequency.setValueAtTime(freq * 3, now);

  mainGain.gain.setValueAtTime(0.0001, now);
  mainGain.gain.linearRampToValueAtTime(volume, now + 0.01);
  mainGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  overtoneGain.gain.setValueAtTime(0.0001, now);
  overtoneGain.gain.linearRampToValueAtTime(volume * 0.18, now + 0.006);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

  fundamental.connect(mainGain);
  overtone.connect(overtoneGain);
  mainGain.connect(out);
  overtoneGain.connect(out);

  fundamental.start(now);
  overtone.start(now);
  fundamental.stop(now + duration + 0.02);
  overtone.stop(now + 0.07);
}

export const SCALE_NOTES = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];

export function playStepNote(stepIndex: number): void {
  const nowMs = performance.now();
  if (nowMs - lastStepNoteMs < 75) return;
  lastStepNoteMs = nowMs;
  const note = SCALE_NOTES[stepIndex % SCALE_NOTES.length];
  playNote(note, 0.3, 0.2);
}

export function playSuccessChime(): void {
  if (!soundOn) return;
  const notes = [392.0, 493.88, 587.33, 783.99];
  notes.forEach((n, i) => {
    window.setTimeout(() => playNote(n, 0.42, 0.22), i * 105);
  });
}

export function playGentlePop(): void {
  playNote(440, 0.14, 0.14);
}

export function playBubblePop(freq = 520): void {
  if (!soundOn) return;
  const m = getMaster();
  if (!m) return;
  const { audio, out } = m;
  const now = audio.currentTime;

  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.08);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.24, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  osc.connect(gain);
  gain.connect(out);

  osc.start(now);
  osc.stop(now + 0.13);
}

export function playWoodClick(): void {
  if (!soundOn) return;
  const m = getMaster();
  if (!m) return;
  const { audio, out } = m;
  const now = audio.currentTime;

  const osc = audio.createOscillator();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.06);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600, now);
  filter.Q.setValueAtTime(3, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(out);

  osc.start(now);
  osc.stop(now + 0.08);
}

export function playHarmonicGlide(normalizedY: number): void {
  if (!soundOn) return;
  const nowMs = performance.now();
  if (nowMs - lastStepNoteMs < 60) return;
  lastStepNoteMs = nowMs;

  // NormalizedY: 0 (top) to 1 (bottom). Invert so top is higher pitch
  const inverted = Math.max(0, Math.min(1, 1 - normalizedY));
  const pentatonicScale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
  const idx = Math.floor(inverted * (pentatonicScale.length - 1));
  const freq = pentatonicScale[idx];

  playNote(freq, 0.28, 0.18);
}

export function playAnimalMotif(animalId: string): void {
  if (!soundOn) return;
  const m = getMaster();
  if (!m) return;
  const { audio, out } = m;
  const now = audio.currentTime;

  const osc = audio.createOscillator();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1100, now);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(out);

  gain.gain.setValueAtTime(0.0001, now);

  switch (animalId) {
    case 'cat':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(410, now + 0.34);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
      osc.start(now);
      osc.stop(now + 0.38);
      break;
    case 'cow':
      osc.type = 'triangle';
      filter.frequency.setValueAtTime(460, now);
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(172, now + 0.18);
      osc.frequency.linearRampToValueAtTime(138, now + 0.45);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    case 'duck':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.linearRampToValueAtTime(395, now + 0.12);
      osc.frequency.linearRampToValueAtTime(345, now + 0.16);
      osc.frequency.linearRampToValueAtTime(405, now + 0.28);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.14);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.34);
      break;
    case 'bird':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(840, now);
      osc.frequency.exponentialRampToValueAtTime(1260, now + 0.11);
      osc.frequency.linearRampToValueAtTime(920, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(1380, now + 0.27);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.32);
      break;
    case 'frog':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(185, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.22);
      break;
    default:
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(470, now + 0.24);
      osc.frequency.exponentialRampToValueAtTime(390, now + 0.42);
      gain.gain.linearRampToValueAtTime(0.19, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.47);
      break;
  }
}

/**
 * Springy boing sound for peek-a-boo animal pop-ups.
 */
export function playBoingSound(): void {
  if (!soundOn) return;
  const m = getMaster();
  if (!m) return;
  const { audio, out } = m;
  const now = audio.currentTime;

  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(620, now + 0.12);
  osc.frequency.exponentialRampToValueAtTime(440, now + 0.28);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

  osc.connect(gain);
  gain.connect(out);

  osc.start(now);
  osc.stop(now + 0.34);
}

/**
 * Gentle rustling / shaking sound for bushes or hiding spot tap.
 */
export function playRustleSound(): void {
  if (!soundOn) return;
  const m = getMaster();
  if (!m) return;
  const { audio, out } = m;
  const now = audio.currentTime;

  // Gentle dual-tone organic rustle
  const osc1 = audio.createOscillator();
  const osc2 = audio.createOscillator();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();

  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(320, now);
  osc1.frequency.linearRampToValueAtTime(260, now + 0.12);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(480, now);
  osc2.frequency.linearRampToValueAtTime(360, now + 0.12);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(1.5, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(out);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.16);
  osc2.stop(now + 0.16);
}
