// Lightweight, 60fps canvas confetti explosion & haptic sensory helper
// Zero external dependencies, pure HTML5 Canvas & Web Audio friendly.

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'star';
  alpha: number;
  decay: number;
}

const COLORS = [
  '#FF5E7E', // Bright Pink
  '#FFA931', // Sunny Amber
  '#28C76F', // Fresh Mint
  '#00CFE8', // Sky Cyan
  '#7367F0', // Soft Violet
  '#FFD166', // Golden Star
  '#06D6A0'  // Emerald
];

let canvas: HTMLCanvasElement | null = null;
let animId: number | null = null;
let particles: Particle[] = [];

function ensureCanvas(): HTMLCanvasElement {
  if (canvas && document.body.contains(canvas)) return canvas;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  return canvas;
}

export function fireConfetti(options?: { count?: number; originX?: number; originY?: number }): void {
  const c = ensureCanvas();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = window.innerWidth * dpr;
  c.height = window.innerHeight * dpr;

  const count = options?.count ?? 45;
  const originX = (options?.originX ?? window.innerWidth / 2) * dpr;
  const originY = (options?.originY ?? window.innerHeight / 2.5) * dpr;

  const newParticles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 * dpr + Math.random() * 8 * dpr;
    const shapeRand = Math.random();
    const shape: Particle['shape'] = shapeRand < 0.45 ? 'rect' : shapeRand < 0.8 ? 'circle' : 'star';

    newParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3 * dpr,
      size: (6 + Math.random() * 8) * dpr,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.25,
      shape,
      alpha: 1,
      decay: 0.012 + Math.random() * 0.015
    });
  }

  particles = [...particles, ...newParticles];

  if (!animId) {
    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;

      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.25 * dpr * dt; // Gravity
        p.vx *= 0.98; // Air resistance
        p.rotation += p.vRot * dt;
        p.alpha -= p.decay * dt;

        if (p.alpha <= 0 || p.y > c.height) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Star
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            ctx.lineTo(
              Math.cos(((18 + s * 72) * Math.PI) / 180) * (p.size / 2),
              -Math.sin(((18 + s * 72) * Math.PI) / 180) * (p.size / 2)
            );
            ctx.lineTo(
              Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size / 4),
              -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size / 4)
            );
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (particles.length > 0) {
        animId = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, c.width, c.height);
        animId = null;
      }
    };
    animId = requestAnimationFrame(loop);
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
