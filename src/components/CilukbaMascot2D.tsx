import { useEffect, useState, type JSX } from 'react';
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'motion/react';
import { playBubblePop } from '../lib/audio.ts';
import { triggerHaptic } from '../lib/confetti.ts';

interface Props {
  childName: string;
  isNight?: boolean;
  size?: number;
}

/**
 * Interactive 2D animated Cilukba mascot:
 * - Continuous 60-120fps sine-wave breathing & gentle ear sway (zero keyframe jank)
 * - Natural periodic eyelid blinking
 * - Tap-to-hop + wave + cheerful sparkle pop for kids & parents
 */
export function CilukbaMascot2D({ childName, isNight = false, size = 86 }: Props): JSX.Element {
  const reducedMotion = useReducedMotion();
  const [blinking, setBlinking] = useState(false);
  const [joyBurst, setJoyBurst] = useState(0);

  const bodyY = useMotionValue(0);
  const bodyScaleX = useMotionValue(1);
  const bodyScaleY = useMotionValue(1);
  const earRotate = useMotionValue(0);
  const armWave = useMotionValue(0);

  useAnimationFrame((time) => {
    if (reducedMotion) return;
    const t = time / 1000;
    bodyY.set(Math.sin(t * 2.1) * 2.6);
    const breath = Math.cos(t * 2.1) * 0.022;
    bodyScaleX.set(1 + breath);
    bodyScaleY.set(1 - breath);
    earRotate.set(Math.sin(t * 1.7 + 0.4) * 5.5);
    armWave.set(Math.sin(t * 3.1) * 9);
  });

  // Natural blinking loop every 3.4 - 5.2 seconds
  useEffect(() => {
    if (reducedMotion) return;
    let alive = true;
    let t1: number | undefined;
    let t2: number | undefined;

    const scheduleBlink = () => {
      const delay = 3200 + Math.random() * 2200;
      t1 = window.setTimeout(() => {
        if (!alive) return;
        setBlinking(true);
        t2 = window.setTimeout(() => {
          if (!alive) return;
          setBlinking(false);
          scheduleBlink();
        }, 150);
      }, delay);
    };

    scheduleBlink();
    return () => {
      alive = false;
      if (t1) window.clearTimeout(t1);
      if (t2) window.clearTimeout(t2);
    };
  }, [reducedMotion]);

  const handleTapMascot = () => {
    triggerHaptic('tap');
    playBubblePop(540 + (joyBurst % 4) * 55);
    setJoyBurst((c) => c + 1);
  };

  return (
    <motion.button
      type="button"
      className="mascot-2d-btn"
      onClick={handleTapMascot}
      whileTap={reducedMotion ? undefined : { scale: 0.92 }}
      whileHover={reducedMotion ? undefined : { scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 360, damping: 20 }}
      aria-label={`Sapa maskot Cilukba untuk ${childName}`}
      title="Ketuk aku!"
      style={{ width: size, height: size }}
    >
      <AnimatePresence>
        {joyBurst > 0 && (
          <motion.span
            key={joyBurst}
            className="mascot-joy-sparkle"
            initial={{ opacity: 0, y: 6, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], y: -22, scale: [0.6, 1.2, 0.9] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.72, ease: 'easeOut' }}
            aria-hidden="true"
          >
            ✨
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        key={`hop-${joyBurst}`}
        initial={joyBurst > 0 && !reducedMotion ? { y: 0, scale: 1 } : false}
        animate={joyBurst > 0 && !reducedMotion ? { y: [0, -10, 0], scale: [1, 1.07, 1] } : undefined}
        transition={{ type: 'spring', stiffness: 380, damping: 14 }}
        style={{ width: '100%', height: '100%' }}
      >
        <motion.svg
          viewBox="0 0 112 112"
          width={size}
          height={size}
          fill="none"
          style={{
            y: bodyY,
            scaleX: bodyScaleX,
            scaleY: bodyScaleY,
            transformOrigin: '56px 96px',
            overflow: 'visible'
          }}
          aria-hidden="true"
        >
          {/* Soft ambient glow */}
          <circle
            cx="56"
            cy="60"
            r="44"
            fill={isNight ? 'rgba(130, 198, 165, 0.16)' : 'rgba(43, 147, 97, 0.12)'}
          />

          {/* Little sun or moon mood charm */}
          {isNight ? (
            <path d="M92 22A8 8 0 1 0 100 32A6 6 0 1 1 92 22Z" fill="#FFD166" />
          ) : (
            <circle cx="94" cy="24" r="6" fill="#FFD166" />
          )}

          {/* Left ear with gentle continuous sway */}
          <motion.g style={{ rotate: earRotate, transformOrigin: '32px 34px' }}>
            <circle cx="28" cy="30" r="14" fill="#3D9970" stroke="#1F5940" strokeWidth="3" />
            <circle cx="28" cy="30" r="7" fill="#FFE6C7" />
          </motion.g>

          {/* Right ear */}
          <motion.g style={{ rotate: earRotate, transformOrigin: '80px 34px' }}>
            <circle cx="84" cy="30" r="14" fill="#3D9970" stroke="#1F5940" strokeWidth="3" />
            <circle cx="84" cy="30" r="7" fill="#FFE6C7" />
          </motion.g>

          {/* Waving little paw */}
          <motion.g style={{ rotate: armWave, transformOrigin: '88px 74px' }}>
            <ellipse cx="94" cy="68" rx="10" ry="7" transform="rotate(-24 94 68)" fill="#FFE6C7" stroke="#1F5940" strokeWidth="3" />
          </motion.g>

          {/* Cute sprout leaf on top of head */}
          <path d="M56 26C56 16 64 10 70 12C68 20 62 24 56 26Z" fill="#6BCB77" stroke="#1F5940" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M56 26C54 18 46 14 42 18C46 24 52 25 56 26Z" fill="#4DB870" stroke="#1F5940" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Round bear hood & warm face */}
          <circle cx="56" cy="62" r="34" fill="#3D9970" stroke="#1F5940" strokeWidth="3.2" />
          <ellipse cx="56" cy="66" rx="26" ry="23" fill="#FFF4E3" />

          {/* Rosy cheeks */}
          <ellipse cx="38" cy="68" rx="5.5" ry="3.5" fill="#FF9EB5" opacity="0.78" />
          <ellipse cx="74" cy="68" rx="5.5" ry="3.5" fill="#FF9EB5" opacity="0.78" />

          {/* Blinking eyes */}
          {blinking ? (
            <>
              <path d="M40 60Q45 64 50 60" stroke="#182421" strokeWidth="3" strokeLinecap="round" />
              <path d="M62 60Q67 64 72 60" stroke="#182421" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="45" cy="59" r="4.5" fill="#182421" />
              <circle cx="43.5" cy="57.4" r="1.5" fill="#FFFFFF" />
              <circle cx="67" cy="59" r="4.5" fill="#182421" />
              <circle cx="65.5" cy="57.4" r="1.5" fill="#FFFFFF" />
            </>
          )}

          {/* Friendly nose & happy smile */}
          <ellipse cx="56" cy="65" rx="3.4" ry="2.4" fill="#1F5940" />
          <path
            d={joyBurst > 0 ? 'M48 71Q56 80 64 71' : 'M49 71Q56 77 63 71'}
            stroke="#182421"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Warm cozy scarf accent */}
          <path d="M35 88Q56 96 77 88" stroke="#FFAE34" strokeWidth="6" strokeLinecap="round" />
        </motion.svg>
      </motion.div>
    </motion.button>
  );
}
