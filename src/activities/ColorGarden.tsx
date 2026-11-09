import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { TapHintFinger, VisualStarMeter } from '../components/Art';
import {
  playNote,
  playSuccessChime,
  playVoice,
  preloadVoices,
  stopVoice,
  type VoiceClipId
} from '../lib/audio';
import { fireConfetti, triggerHaptic } from '../lib/confetti';
import { isColorDiscoveryComplete } from '../lib/toddler';

interface ToddlerColorItem {
  id: string;
  name: string;
  hex: string;
  borderHex: string;
  lightHex: string;
  emoji: string;
  itemTitle: string;
  voiceId: VoiceClipId;
  noteFreq: number;
}

const TODDLER_COLORS: ToddlerColorItem[] = [
  {
    id: 'merah',
    name: 'MERAH',
    hex: '#FF3B30',
    borderHex: '#D32F2F',
    lightHex: '#FFEBEA',
    emoji: '🍎',
    itemTitle: 'Apel Merah',
    voiceId: 'color-toddler-merah',
    noteFreq: 261.63 // Do
  },
  {
    id: 'kuning',
    name: 'KUNING',
    hex: '#FFCC00',
    borderHex: '#F57F17',
    lightHex: '#FFFBEA',
    emoji: '🍌',
    itemTitle: 'Pisang Kuning',
    voiceId: 'color-toddler-kuning',
    noteFreq: 329.63 // Mi
  },
  {
    id: 'hijau',
    name: 'HIJAU',
    hex: '#34C759',
    borderHex: '#2E7D32',
    lightHex: '#EAF8EE',
    emoji: '🐸',
    itemTitle: 'Katak Hijau',
    voiceId: 'color-toddler-hijau',
    noteFreq: 392.0 // Sol
  },
  {
    id: 'biru',
    name: 'BIRU',
    hex: '#007AFF',
    borderHex: '#1565C0',
    lightHex: '#EBF4FE',
    emoji: '🐳',
    itemTitle: 'Paus Biru',
    voiceId: 'color-toddler-biru',
    noteFreq: 440.0 // La
  },
  {
    id: 'jingga',
    name: 'JINGGA',
    hex: '#FF9500',
    borderHex: '#E65100',
    lightHex: '#FFF4E5',
    emoji: '🍊',
    itemTitle: 'Jeruk Jingga',
    voiceId: 'color-toddler-jingga',
    noteFreq: 293.66 // Re
  },
  {
    id: 'ungu',
    name: 'UNGU',
    hex: '#AF52DE',
    borderHex: '#7B1FA2',
    lightHex: '#F6EBFB',
    emoji: '🍇',
    itemTitle: 'Anggur Ungu',
    voiceId: 'color-toddler-ungu',
    noteFreq: 523.25 // Do tinggi
  }
];

interface SplashDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface PaintSplash {
  id: number;
  x: number;
  y: number;
  color: string;
  radius: number;
  droplets: SplashDroplet[];
  life: number;
}

export function ColorGarden({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [activeColorId, setActiveColorId] = useState<string | null>(null);
  const [visitedColors, setVisitedColors] = useState<Set<string>>(() => new Set());
  const [rewarded, setRewarded] = useState(false);
  const [featuredColor, setFeaturedColor] = useState<ToddlerColorItem>(TODDLER_COLORS[0]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const splashesRef = useRef<PaintSplash[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nextSplashId = useRef(1);

  useEffect(() => {
    preloadVoices([
      'color-toddler-intro',
      'color-toddler-done',
      ...TODDLER_COLORS.map((c) => c.voiceId)
    ]);
    playVoice('color-toddler-intro', 80);
    return () => stopVoice();
  }, []);

  // 60FPS High performance splash particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 560;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas || !container) return;
      width = container.clientWidth || 360;
      height = container.clientHeight || 560;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
    resize();
    window.addEventListener('resize', resize);

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.06, (now - lastTime) / 1000);
      lastTime = now;

      // Update splashes
      const splashes = splashesRef.current;
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.radius += dt * 80;
        s.life -= dt * 1.8;

        for (let j = 0; j < s.droplets.length; j++) {
          const d = s.droplets[j];
          d.x += d.vx * dt * 60;
          d.y += d.vy * dt * 60;
          d.vy += dt * 30; // soft gravity
          d.alpha -= dt * 1.8;
        }

        if (s.life <= 0) {
          splashes.splice(i, 1);
        }
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Render splashes
      for (let i = 0; i < splashes.length; i++) {
        const s = splashes[i];
        const alpha = Math.max(0, Math.min(1, s.life));

        // Expanding soft color ring
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha * 0.18;
        ctx.fill();

        // Droplets
        ctx.globalAlpha = 1;
        for (let j = 0; j < s.droplets.length; j++) {
          const d = s.droplets[j];
          if (d.alpha > 0) {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            ctx.fillStyle = d.color;
            ctx.globalAlpha = Math.max(0, d.alpha);
            ctx.fill();
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  function spawnSplashAt(x: number, y: number, color: string): void {
    const numDroplets = 12;
    const droplets: SplashDroplet[] = [];
    for (let i = 0; i < numDroplets; i++) {
      const angle = (i / numDroplets) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 2.5 + Math.random() * 4.5;
      droplets.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 4 + Math.random() * 5,
        color,
        alpha: 0.95
      });
    }

    splashesRef.current.push({
      id: nextSplashId.current++,
      x,
      y,
      color,
      radius: 18,
      droplets,
      life: 1.0
    });
  }

  function handleSelectColor(color: ToddlerColorItem, e?: ReactPointerEvent): void {
    triggerHaptic('tap');
    playNote(color.noteFreq, 0.5, 0.3);
    playVoice(color.voiceId, 180);

    setActiveColorId(color.id);
    setFeaturedColor(color);

    // Spawn splash at button or center
    if (e && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      spawnSplashAt(e.clientX - rect.left, e.clientY - rect.top, color.hex);
    } else if (containerRef.current) {
      const w = containerRef.current.clientWidth || 360;
      const h = containerRef.current.clientHeight || 560;
      spawnSplashAt(w / 2, h / 2, color.hex);
    }

    // Track discovery
    setVisitedColors((prev) => {
      const next = new Set(prev);
      next.add(color.id);
      if (isColorDiscoveryComplete(next.size, 5) && !rewarded) {
        setRewarded(true);
        triggerHaptic('success');
        fireConfetti();
        window.setTimeout(() => {
          playSuccessChime();
          playVoice('color-toddler-done', 200);
          onComplete('sticker-colors');
        }, 600);
      }
      return next;
    });
  }

  function handleBackdropTouch(e: ReactPointerEvent<HTMLDivElement>): void {
    if (e.target !== containerRef.current && (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    triggerHaptic('tap');
    playNote(featuredColor.noteFreq, 0.4, 0.25);
    spawnSplashAt(px, py, featuredColor.hex);
  }

  return (
    <div
      ref={containerRef}
      className="color-garden-stage"
      onPointerDown={handleBackdropTouch}
      style={{ backgroundColor: featuredColor.lightHex, touchAction: 'none' }}
      role="region"
      aria-label="Taman Warna Batita"
    >
      {/* 60FPS Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="color-garden-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Top HUD: Star Meter & Clean Giant Color Title */}
      <div className="color-garden-header" style={{ position: 'relative', zIndex: 3 }}>
        <div className="color-meter-wrap">
          <VisualStarMeter count={Math.min(5, visitedColors.size)} total={5} />
        </div>
        <div
          className="color-live-badge"
          style={{ backgroundColor: featuredColor.hex, color: '#ffffff' }}
        >
          <span className="color-live-emoji" aria-hidden="true">{featuredColor.emoji}</span>
          <span className="color-live-text">{featuredColor.name}</span>
        </div>
      </div>

      {/* Centerpiece: Cute Leaping Mascot Illustration */}
      <div className="color-featured-area" style={{ position: 'relative', zIndex: 2 }}>
        <div
          key={featuredColor.id}
          className="color-featured-balloon"
          style={{
            backgroundColor: featuredColor.hex,
            boxShadow: `0 12px 32px ${featuredColor.hex}55`
          }}
          onPointerDown={(e) => handleSelectColor(featuredColor, e)}
        >
          <span className="color-mascot-emoji" aria-hidden="true">
            {featuredColor.emoji}
          </span>
          <div className="color-balloon-shine" />
        </div>
        <span className="color-featured-label" style={{ color: featuredColor.borderHex }}>
          {featuredColor.itemTitle}
        </span>
      </div>

      {/* 6 Giant Bouncy Color Pots (Touch-first for Batita) */}
      <div className="color-pots-grid" style={{ position: 'relative', zIndex: 3 }}>
        {TODDLER_COLORS.map((color, idx) => {
          const isSelected = featuredColor.id === color.id;
          const isStruck = activeColorId === color.id;

          return (
            <button
              key={color.id}
              type="button"
              className={`color-pot-btn ${isSelected ? 'is-selected' : ''} ${
                isStruck ? 'is-struck' : ''
              }`}
              style={{
                backgroundColor: color.hex,
                borderColor: color.borderHex
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                handleSelectColor(color, e);
              }}
              onAnimationEnd={() => setActiveColorId(null)}
              aria-label={`Warna ${color.name}`}
            >
              {/* Tap Hint Finger for the very first unvisited color */}
              {visitedColors.size === 0 && idx === 0 && (
                <div className="color-pot-tap-guide">
                  <TapHintFinger size={38} />
                </div>
              )}

              {/* Gloss Highlight */}
              <div className="color-pot-glint" />

              <span className="color-pot-emoji" aria-hidden="true">
                {color.emoji}
              </span>
              <span className="color-pot-name">{color.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
