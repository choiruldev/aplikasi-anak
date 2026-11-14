import { useEffect, useRef, useState, type JSX, type PointerEvent as ReactPointerEvent } from 'react';
import { TapHintFinger, VisualStarMeter } from '../components/Art';
import { playBubblePop, playSuccessChime } from '../lib/audio';
import { fireConfetti, triggerHaptic } from '../lib/confetti';
import { getBubblePopFrequency, isPointerInsideBubble } from '../lib/toddler';

interface LiveBubble {
  id: number;
  x: number; // px
  y: number; // px
  radius: number; // px
  vy: number; // float speed
  wobbleSpeed: number;
  wobbleOffset: number;
  hue: number;
  item: string;
}

interface BurstDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface BurstEffect {
  id: number;
  x: number;
  y: number;
  item: string;
  hue: number;
  ringRadius: number;
  ringAlpha: number;
  itemY: number;
  itemAlpha: number;
  droplets: BurstDroplet[];
}

interface TouchRipple {
  id: number;
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

const SURPRISE_ITEMS = ['⭐️', '🌸', '🍓', '🎵', '🎈', '🐥', '🍬', '🚗', '🐱', '🍎'];

export function BubblePopper({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const bubblesRef = useRef<LiveBubble[]>([]);
  const burstsRef = useRef<BurstEffect[]>([]);
  const ripplesRef = useRef<TouchRipple[]>([]);
  const nextBubbleId = useRef(1);
  const popCountRef = useRef(0);
  const rewardedRef = useRef(false);

  const [popDisplay, setPopDisplay] = useState(0);
  const [hintPos, setHintPos] = useState<{ x: number; y: number } | null>(null);

  function createRandomBubble(width: number, height: number, customY?: number): LiveBubble {
    const radius = 32 + Math.random() * 24; // 32px to 56px
    const hues = [340, 45, 140, 195, 270, 310]; // Pastel palette hues
    return {
      id: nextBubbleId.current++,
      x: radius + Math.random() * Math.max(10, width - radius * 2),
      y: customY !== undefined ? customY : height + radius + Math.random() * 50,
      radius,
      vy: 0.9 + Math.random() * 1.1,
      wobbleSpeed: 2 + Math.random() * 2.5,
      wobbleOffset: Math.random() * Math.PI * 2,
      hue: hues[Math.floor(Math.random() * hues.length)],
      item: SURPRISE_ITEMS[Math.floor(Math.random() * SURPRISE_ITEMS.length)]
    };
  }

  // Canvas render & physics loop running at 60 FPS with 0 React state churn
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 560;
    const dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      if (!container || !canvas) return;
      width = container.clientWidth || 360;
      height = container.clientHeight || 560;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial bubbles
    const bubbleCount = Math.min(14, Math.max(8, Math.floor(width / 36)));
    const initialBubbles: LiveBubble[] = [];
    for (let i = 0; i < bubbleCount; i++) {
      initialBubbles.push(createRandomBubble(width, height, Math.random() * height));
    }
    bubblesRef.current = initialBubbles;

    let animId: number;
    let lastTime = performance.now();
    let hintUpdateTimer = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.06, (now - lastTime) / 1000);
      lastTime = now;

      // 1. Update bubbles
      const bubbles = bubblesRef.current;
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.y -= b.vy * dt * 60;
        b.wobbleOffset += b.wobbleSpeed * dt;
        if (b.y < -b.radius * 2) {
          b.y = height + b.radius + Math.random() * 60;
          b.x = b.radius + Math.random() * Math.max(10, width - b.radius * 2);
          b.item = SURPRISE_ITEMS[Math.floor(Math.random() * SURPRISE_ITEMS.length)];
        }
      }

      // Update guide finger position if not popped yet
      hintUpdateTimer += dt;
      if (popCountRef.current === 0 && hintUpdateTimer > 0.2) {
        hintUpdateTimer = 0;
        const target = bubbles[0];
        if (target) {
          setHintPos({ x: target.x, y: target.y });
        }
      }

      // 2. Update bursts
      const bursts = burstsRef.current;
      for (let i = bursts.length - 1; i >= 0; i--) {
        const br = bursts[i];
        br.ringRadius += dt * 90;
        br.ringAlpha -= dt * 2.2;
        br.itemY -= dt * 70;
        br.itemAlpha -= dt * 1.8;

        for (let j = 0; j < br.droplets.length; j++) {
          const d = br.droplets[j];
          d.x += d.vx * dt * 60;
          d.y += d.vy * dt * 60;
          d.vy += dt * 40; // gravity
          d.alpha -= dt * 2.2;
        }

        if (br.ringAlpha <= 0 && br.itemAlpha <= 0) {
          bursts.splice(i, 1);
        }
      }

      // 3. Update ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += dt * 120;
        rip.alpha -= dt * 2.5;
        if (rip.alpha <= 0) {
          ripples.splice(i, 1);
        }
      }

      // 4. DRAW FRAME to GPU
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Render ripples
      for (let i = 0; i < ripples.length; i++) {
        const rip = ripples[i];
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, Math.max(1, rip.radius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 181, 246, ${Math.max(0, rip.alpha)})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Render bubbles
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        const cx = b.x;
        const cy = b.y;
        const r = b.radius;

        // Iridescent radial gradient body
        const grad = ctx.createRadialGradient(
          cx - r * 0.32,
          cy - r * 0.35,
          r * 0.08,
          cx,
          cy,
          r
        );
        grad.addColorStop(0, `hsla(${b.hue}, 100%, 98%, 0.85)`);
        grad.addColorStop(0.5, `hsla(${b.hue}, 85%, 72%, 0.45)`);
        grad.addColorStop(0.85, `hsla(${b.hue + 35}, 90%, 60%, 0.65)`);
        grad.addColorStop(1, `hsla(${b.hue}, 100%, 80%, 0.9)`);

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Shimmering outline
        ctx.strokeStyle = `hsla(${b.hue}, 95%, 85%, 0.85)`;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Highlight Glint (curved white arc at top left)
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.36, cy - r * 0.38, r * 0.28, r * 0.14, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        // Tiny bottom glint
        ctx.beginPath();
        ctx.arc(cx + r * 0.32, cy + r * 0.35, r * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // Surprise item inside
        ctx.font = `${Math.floor(r * 0.82)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.item, cx, cy + 2);
      }

      // Render bursts
      for (let i = 0; i < bursts.length; i++) {
        const br = bursts[i];

        // Expanding shockwave ring
        if (br.ringAlpha > 0) {
          ctx.beginPath();
          ctx.arc(br.x, br.y, br.ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${br.hue}, 95%, 65%, ${Math.max(0, br.ringAlpha)})`;
          ctx.lineWidth = 3.5;
          ctx.stroke();
        }

        // Droplets
        for (let j = 0; j < br.droplets.length; j++) {
          const d = br.droplets[j];
          if (d.alpha > 0) {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${br.hue}, 90%, 75%, ${Math.max(0, d.alpha)})`;
            ctx.fill();
          }
        }

        // Floating surprise item
        if (br.itemAlpha > 0) {
          ctx.save();
          ctx.font = '36px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = Math.max(0, Math.min(1, br.itemAlpha));
          ctx.fillText(br.item, br.x, br.itemY);
          ctx.restore();
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>): void {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check hit against current bubbles in reverse order (topmost first)
    const bubbles = bubblesRef.current;
    let hitIndex = -1;

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (isPointerInsideBubble(px, py, b.x, b.y, b.radius, 22)) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex >= 0) {
      const popped = bubbles[hitIndex];
      popBubble(popped, hitIndex);
    } else {
      spawnRippleAt(px, py);
      spawnBubbleAt(px, py);
    }
  }

  function spawnRippleAt(x: number, y: number): void {
    triggerHaptic('tap');
    ripplesRef.current.push({
      id: nextBubbleId.current++,
      x,
      y,
      radius: 12,
      alpha: 0.8
    });
  }

  function popBubble(bubble: LiveBubble, index: number): void {
    triggerHaptic('tap');

    // Melodic pop sound based on pop counter
    const freq = getBubblePopFrequency(popCountRef.current);
    playBubblePop(freq);

    popCountRef.current += 1;
    const newCount = popCountRef.current;
    setPopDisplay(newCount);

    // Create 8 radial droplets
    const droplets: BurstDroplet[] = [];
    const numDroplets = 8;
    for (let i = 0; i < numDroplets; i++) {
      const angle = (i / numDroplets) * Math.PI * 2 + Math.random() * 0.2;
      const speed = 2.4 + Math.random() * 3.2;
      droplets.push({
        x: bubble.x,
        y: bubble.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color: `hsl(${bubble.hue}, 90%, 65%)`,
        alpha: 0.95
      });
    }

    burstsRef.current.push({
      id: nextBubbleId.current++,
      x: bubble.x,
      y: bubble.y,
      item: bubble.item,
      hue: bubble.hue,
      ringRadius: bubble.radius * 0.6,
      ringAlpha: 1.0,
      itemY: bubble.y,
      itemAlpha: 1.0,
      droplets
    });

    // Replace popped bubble with new one at bottom
    const container = containerRef.current;
    const width = container?.clientWidth || 360;
    const height = container?.clientHeight || 560;
    bubblesRef.current[index] = createRandomBubble(width, height);

    // Reward milestones (15 pops)
    if (newCount >= 15 && !rewardedRef.current) {
      rewardedRef.current = true;
      triggerHaptic('success');
      fireConfetti();
      playSuccessChime();
      onComplete('sticker-bubblepopper');
    }
  }

  function spawnBubbleAt(x: number, y: number): void {
    triggerHaptic('tap');
    playBubblePop(380);

    const radius = 34 + Math.random() * 20;
    const hues = [195, 270, 320, 140];
    const newBubble: LiveBubble = {
      id: nextBubbleId.current++,
      x,
      y,
      radius,
      vy: 1.1 + Math.random() * 1.0,
      wobbleSpeed: 2.5,
      wobbleOffset: 0,
      hue: hues[Math.floor(Math.random() * hues.length)],
      item: SURPRISE_ITEMS[Math.floor(Math.random() * SURPRISE_ITEMS.length)]
    };

    bubblesRef.current.push(newBubble);
  }

  return (
    <div
      ref={containerRef}
      className="bubble-popper-container"
      onPointerDown={handlePointerDown}
      role="region"
      aria-label="Pesta Gelembung Sabun"
      style={{ touchAction: 'none' }}
    >
      {/* Top HUD */}
      <div className="bubble-popper-header">
        <div className="bubble-hud-left">
          <VisualStarMeter count={Math.min(5, Math.floor(popDisplay / 3))} total={5} />
        </div>
        <div className="bubble-popper-counter">
          🫧 {popDisplay} {rewardedRef.current ? '🏆' : ''}
        </div>
      </div>

      {/* GPU Accelerated 60FPS Canvas */}
      <canvas
        ref={canvasRef}
        className="bubbles-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none'
        }}
      />

      {/* Visual tap hint on first bubble */}
      {popDisplay === 0 && hintPos && (
        <div
          className="bubble-tap-finger-canvas"
          style={{
            position: 'absolute',
            left: `${hintPos.x}px`,
            top: `${hintPos.y}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <TapHintFinger size={42} />
        </div>
      )}
    </div>
  );
}
