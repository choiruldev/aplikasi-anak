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

interface BurstEffect {
  id: number;
  x: number;
  y: number;
  item: string;
  color: string;
}

interface TouchRipple {
  id: number;
  x: number;
  y: number;
}

const SURPRISE_ITEMS = ['⭐️', '🌸', '🍓', '🎵', '🎈', '🐥', '🍬', '🚗', '🐱', '🍎'];

export function BubblePopper({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubblesRef = useRef<LiveBubble[]>([]);
  const nextBubbleId = useRef(1);
  const popCountRef = useRef(0);
  const rewardedRef = useRef(false);

  const [popDisplay, setPopDisplay] = useState(0);
  const [bursts, setBursts] = useState<BurstEffect[]>([]);
  const [ripples, setRipples] = useState<TouchRipple[]>([]);
  const [bubblesRender, setBubblesRender] = useState<LiveBubble[]>([]);

  // Spawn initial bubbles
  useEffect(() => {
    const container = containerRef.current;
    const width = container?.clientWidth || window.innerWidth || 360;
    const height = container?.clientHeight || window.innerHeight || 600;

    const initialBubbles: LiveBubble[] = [];
    const count = Math.min(14, Math.max(8, Math.floor(width / 38)));

    for (let i = 0; i < count; i++) {
      initialBubbles.push(createRandomBubble(width, height, Math.random() * height));
    }
    bubblesRef.current = initialBubbles;
    setBubblesRender([...initialBubbles]);

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(60, now - lastTime) / 1000;
      lastTime = now;

      const currentWidth = containerRef.current?.clientWidth || window.innerWidth;
      const currentHeight = containerRef.current?.clientHeight || window.innerHeight;

      // Update positions
      bubblesRef.current.forEach((b) => {
        b.y -= b.vy * dt * 60;
        b.wobbleOffset += b.wobbleSpeed * dt;
        // Float reset to bottom when reaching above screen
        if (b.y < -b.radius * 2) {
          b.y = currentHeight + b.radius + Math.random() * 80;
          b.x = b.radius + Math.random() * (currentWidth - b.radius * 2);
          b.item = SURPRISE_ITEMS[Math.floor(Math.random() * SURPRISE_ITEMS.length)];
        }
      });

      // Synchronize state for rendering every 2 frames for smooth battery-friendly React render
      setBubblesRender([...bubblesRef.current]);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  function createRandomBubble(width: number, height: number, customY?: number): LiveBubble {
    const radius = 32 + Math.random() * 24; // 32px to 56px
    const hues = [340, 45, 140, 195, 270, 310]; // Pastel palette hues
    return {
      id: nextBubbleId.current++,
      x: radius + Math.random() * Math.max(10, width - radius * 2),
      y: customY !== undefined ? customY : height + radius + Math.random() * 50,
      radius,
      vy: 0.8 + Math.random() * 1.2,
      wobbleSpeed: 2 + Math.random() * 3,
      wobbleOffset: Math.random() * Math.PI * 2,
      hue: hues[Math.floor(Math.random() * hues.length)],
      item: SURPRISE_ITEMS[Math.floor(Math.random() * SURPRISE_ITEMS.length)]
    };
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>): void {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check hit against current bubbles
    const hitIndex = bubblesRef.current.findIndex((b) =>
      isPointerInsideBubble(px, py, b.x, b.y, b.radius, 20)
    );

    if (hitIndex >= 0) {
      // POP BUBBLE!
      const popped = bubblesRef.current[hitIndex];
      popBubble(popped, hitIndex);
    } else {
      // Spawn new bubble right at touch point + water ripple effect!
      spawnBubbleAt(px, py);
      spawnRippleAt(px, py);
    }
  }

  function spawnRippleAt(x: number, y: number): void {
    const ripId = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id: ripId, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripId));
    }, 600);
  }

  function popBubble(bubble: LiveBubble, index: number): void {
    triggerHaptic('tap');

    // Melodic pop sound based on pop counter
    const freq = getBubblePopFrequency(popCountRef.current);
    playBubblePop(freq);

    popCountRef.current += 1;
    const newCount = popCountRef.current;
    setPopDisplay(newCount);

    // Burst visual effect
    const burstId = Date.now() + Math.random();
    setBursts((prev) => [
      ...prev,
      {
        id: burstId,
        x: bubble.x,
        y: bubble.y,
        item: bubble.item,
        color: `hsl(${bubble.hue}, 90%, 65%)`
      }
    ]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 700);

    // Replace popped bubble with a new one at bottom
    const container = containerRef.current;
    const width = container?.clientWidth || window.innerWidth;
    const height = container?.clientHeight || window.innerHeight;
    bubblesRef.current[index] = createRandomBubble(width, height);

    // Reward milestones (15 pops)
    if (newCount >= 15 && !rewardedRef.current) {
      rewardedRef.current = true;
      triggerHaptic('success');
      fireConfetti();
      playSuccessChime();
      onComplete('sticker-balloon');
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

      {/* Floating Bubbles */}
      <div className="bubbles-stage">
        {bubblesRender.map((b, idx) => {
          const wobbleX = Math.sin(b.wobbleOffset) * 12;
          return (
            <div
              key={b.id}
              className="soap-bubble"
              style={{
                width: `${b.radius * 2}px`,
                height: `${b.radius * 2}px`,
                transform: `translate3d(${b.x - b.radius + wobbleX}px, ${b.y - b.radius}px, 0)`,
                background: `radial-gradient(circle at 35% 30%, hsla(${b.hue}, 100%, 96%, 0.9), hsla(${b.hue}, 85%, 68%, 0.45) 55%, hsla(${b.hue + 40}, 90%, 55%, 0.6) 85%, hsla(${b.hue}, 95%, 75%, 0.9) 100%)`,
                boxShadow: `inset 0 0 14px hsla(${b.hue}, 100%, 90%, 0.8), 0 4px 14px hsla(${b.hue}, 60%, 40%, 0.15)`
              }}
            >
              {/* Highlight Glint */}
              <div className="bubble-glint" />
              {/* Surprise Item Floating Inside */}
              <div className="bubble-item">{b.item}</div>

              {/* Gentle visual guide on first bubble if toddler hasn't popped any */}
              {popDisplay === 0 && idx === 0 && (
                <div className="bubble-tap-finger">
                  <TapHintFinger size={38} />
                </div>
              )}
            </div>
          );
        })}

        {/* Burst Particles */}
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="bubble-burst-wrapper"
            style={{
              left: `${burst.x}px`,
              top: `${burst.y}px`
            }}
          >
            <div className="burst-ring" style={{ borderColor: burst.color }} />
            <div className="burst-item">{burst.item}</div>
            <div className="burst-sparkle sparkle-1">✨</div>
            <div className="burst-sparkle sparkle-2">✨</div>
          </div>
        ))}

        {/* Empty Screen Touch Ripples */}
        {ripples.map((rip) => (
          <div
            key={rip.id}
            className="water-touch-ripple"
            style={{ left: `${rip.x}px`, top: `${rip.y}px` }}
          />
        ))}
      </div>
    </div>
  );
}
