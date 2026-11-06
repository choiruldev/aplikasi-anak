/**
 * Pure helper functions for Toddler Zone activities.
 * Kept free of DOM / React dependencies so they can be unit-tested directly in Node.
 */

export const BUBBLE_MELODY_NOTES = [
  261.63, // C4 (Do)
  293.66, // D4 (Re)
  329.63, // E4 (Mi)
  349.23, // F4 (Fa)
  392.0,  // G4 (Sol)
  440.0,  // A4 (La)
  493.88, // B4 (Si)
  523.25  // C5 (Do tinggi)
];

/**
 * Checks whether a touch/pointer coordinate (px, py) falls inside a circular bubble
 * centered at (bx, by) with given radius. Adds an extra 16px touch margin for clumsy toddler fingers.
 */
export function isPointerInsideBubble(
  px: number,
  py: number,
  bx: number,
  by: number,
  radius: number,
  touchSlop = 18
): boolean {
  const dx = px - bx;
  const dy = py - by;
  const effectiveRadius = radius + touchSlop;
  return dx * dx + dy * dy <= effectiveRadius * effectiveRadius;
}

/**
 * Returns musical frequency for sequential bubble pops to form melodic harmonies.
 */
export function getBubblePopFrequency(stepIndex: number): number {
  const safeIndex = Math.abs(Math.floor(stepIndex)) % BUBBLE_MELODY_NOTES.length;
  return BUBBLE_MELODY_NOTES[safeIndex];
}

/**
 * Cycles to the next animal index in a safe, non-repeating loop.
 */
export function getNextAnimalIndex(currentIndex: number, totalAnimals: number): number {
  if (totalAnimals <= 1) return 0;
  return (currentIndex + 1) % totalAnimals;
}
