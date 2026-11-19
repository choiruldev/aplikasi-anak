import { useState, type JSX } from 'react';
import { VisualStarMeter } from '../components/Art.tsx';
import { playGentlePop, playSuccessChime, speakPhrase } from '../lib/audio.ts';
import { fireConfetti, triggerHaptic } from '../lib/confetti.ts';

interface HabitRoutine {
  id: string;
  title: string;
  steps: string[];
}

const HABITS: HabitRoutine[] = [
  {
    id: 'handwash',
    title: 'Cuci Tangan',
    steps: ['Basahi Air', 'Pakai Sabun', 'Bilas & Keringkan']
  },
  {
    id: 'brush',
    title: 'Sikat Gigi',
    steps: ['Oles Pasta', 'Sikat Bulat', 'Kumur Bersih']
  },
  {
    id: 'tidy',
    title: 'Rapikan Mainan',
    steps: ['Kumpulkan Balok', 'Taruh Kotak', 'Tepuk Hebat']
  }
];

export function GoodHabits({
  onComplete
}: {
  onComplete: (stickerId: string) => void;
}): JSX.Element {
  const [habitIdx, setHabitIdx] = useState(0);
  const [stepDone, setStepDone] = useState(0);
  const [stars, setStars] = useState(0);

  const habit = HABITS[habitIdx];

  const handleStepClick = (idx: number) => {
    if (idx !== stepDone) {
      playGentlePop();
      return;
    }
    triggerHaptic('tap');
    playGentlePop();
    speakPhrase(habit.steps[idx]);
    const nextStep = stepDone + 1;
    setStepDone(nextStep);

    if (nextStep >= habit.steps.length) {
      const nextStars = stars + 1;
      setStars(nextStars);
      triggerHaptic('success');
      playSuccessChime();
      fireConfetti();
      if (nextStars >= 3) {
        onComplete('sticker-motor');
      }
      window.setTimeout(() => {
        setStepDone(0);
        setHabitIdx((prev) => (prev + 1) % HABITS.length);
      }, 900);
    }
  };

  return (
    <div className="edu-stage">
      <div className="edu-stage-top">
        <VisualStarMeter count={Math.min(stars, 3)} total={3} />
        <div className="chip-row">
          {HABITS.map((h, i) => (
            <button
              key={h.id}
              type="button"
              className={`pill-btn small ${i === habitIdx ? 'is-active' : ''}`}
              onClick={() => {
                setHabitIdx(i);
                setStepDone(0);
              }}
            >
              {h.title}
            </button>
          ))}
        </div>
      </div>

      <h2 className="edu-prompt-title">Ketuk urutan {habit.title} 1 → 3</h2>

      <div className="habit-steps-col">
        {habit.steps.map((step, idx) => {
          const isDone = idx < stepDone;
          const isNext = idx === stepDone;
          return (
            <button
              key={step}
              type="button"
              className={`habit-step-btn ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`}
              onClick={() => handleStepClick(idx)}
            >
              <span className="habit-num">{isDone ? '✓' : idx + 1}</span>
              <strong>{step}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}
