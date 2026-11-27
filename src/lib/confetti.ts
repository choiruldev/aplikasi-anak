// High-framerate celebratory confetti powered by canvas-confetti + haptic helper.
// Respects prefers-reduced-motion automatically and remains 100% offline.
import confetti from 'canvas-confetti';

const COLORS = [
  '#FF5E7E', // Bright Pink
  '#FFA931', // Sunny Amber
  '#28C76F', // Fresh Mint
  '#00CFE8', // Sky Cyan
  '#7367F0', // Soft Violet
  '#FFD166', // Golden Star
  '#06D6A0'  // Emerald
];

export function fireConfetti(options?: { count?: number; originX?: number; originY?: number }): void {
  if (typeof window === 'undefined') return;
  try {
    const particleCount = options?.count ?? 48;
    const x = options?.originX !== undefined ? Math.max(0.05, Math.min(0.95, options.originX / Math.max(1, window.innerWidth))) : 0.5;
    const y = options?.originY !== undefined ? Math.max(0.05, Math.min(0.95, options.originY / Math.max(1, window.innerHeight))) : 0.42;

    void confetti({
      particleCount,
      spread: 76,
      startVelocity: 34,
      ticks: 130,
      gravity: 0.95,
      scalar: 0.95,
      colors: COLORS,
      origin: { x, y },
      disableForReducedMotion: true,
      zIndex: 9999
    });
  } catch {
    // Ignore environments without HTML5 canvas support
  }
}

export function fireCelebrationBurst(): void {
  if (typeof window === 'undefined') return;
  try {
    void confetti({
      particleCount: 36,
      angle: 62,
      spread: 60,
      origin: { x: 0.12, y: 0.65 },
      colors: COLORS,
      disableForReducedMotion: true,
      zIndex: 9999
    });
    void confetti({
      particleCount: 36,
      angle: 118,
      spread: 60,
      origin: { x: 0.88, y: 0.65 },
      colors: COLORS,
      disableForReducedMotion: true,
      zIndex: 9999
    });
  } catch {
    // Ignore environments without HTML5 canvas support
  }
}

// Gentle tactile vibration feedback on supported mobile devices
export function triggerHaptic(type: 'tap' | 'snap' | 'success' = 'tap'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
  try {
    if (type === 'tap') {
      navigator.vibrate(25);
    } else if (type === 'snap') {
      navigator.vibrate([35, 30, 35]);
    } else if (type === 'success') {
      navigator.vibrate([60, 50, 70, 50, 100]);
    }
  } catch {
    // Ignore unsupported browser security restrictions
  }
}
