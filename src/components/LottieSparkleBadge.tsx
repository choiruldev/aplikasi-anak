import type { JSX } from 'react';
import { LottieLight } from 'lottie-react';
import { useReducedMotion } from 'motion/react';
import { LOTTIE_STAR_CELEBRATION } from '../data/lottieStarCelebration.ts';

interface Props {
  size?: number;
  className?: string;
}

export function LottieSparkleBadge({ size = 44, className = '' }: Props): JSX.Element {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
        <polygon
          points="24,6 29,18 42,19 32,28 35,41 24,34 13,41 16,28 6,19 19,18"
          fill="#FDCD41"
          stroke="#E89714"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <div
      className={className}
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      aria-hidden="true"
    >
      <LottieLight
        src={LOTTIE_STAR_CELEBRATION}
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );
}
