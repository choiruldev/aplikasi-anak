export interface Point {
  x: number;
  y: number;
}

export interface SnapSlot extends Point {
  id: string;
  kind: string;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Finds the closest unoccupied slot matching `kind` within `snapRadius`.
 * Calibrated generously so toddler fingers do not fail by a few pixels.
 */
export function findSnapTarget(
  point: Point,
  slots: readonly SnapSlot[],
  kind: string,
  occupiedSlotIds: ReadonlySet<string>,
  snapRadius: number
): SnapSlot | null {
  let best: SnapSlot | null = null;
  let bestDist = snapRadius;

  for (const slot of slots) {
    if (slot.kind !== kind || occupiedSlotIds.has(slot.id)) continue;
    const d = distance(point, slot);
    if (d <= bestDist) {
      bestDist = d;
      best = slot;
    }
  }
  return best;
}

/**
 * Samples evenly spaced checkpoints along one or more strokes.
 * Multi-stroke glyphs (like 'A' or 'B') concatenate their stroke checkpoints in order.
 */
export function sampleStrokes(strokes: readonly (readonly Point[])[], step = 28): Point[] {
  const result: Point[] = [];

  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    result.push(stroke[0]);

    for (let i = 1; i < stroke.length; i++) {
      const start = stroke[i - 1];
      const end = stroke[i];
      const segLen = distance(start, end);
      const count = Math.max(1, Math.round(segLen / step));
      for (let s = 1; s <= count; s++) {
        const t = s / count;
        result.push({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t
        });
      }
    }
  }

  return result;
}

/**
 * Advances `currentIndex` along `checkpoints` if `point` is within `hitRadius`
 * of the next checkpoint (or +1 lookahead for fast finger sweeps).
 * Never jumps to arbitrary distant checkpoints so random scribbling won't pass.
 */
export function advanceCheckpoint(
  point: Point,
  checkpoints: readonly Point[],
  currentIndex: number,
  hitRadius: number
): number {
  let idx = currentIndex;
  while (idx < checkpoints.length) {
    if (distance(point, checkpoints[idx]) <= hitRadius) {
      idx++;
      continue;
    }
    if (idx + 1 < checkpoints.length && distance(point, checkpoints[idx + 1]) <= hitRadius * 0.85) {
      idx += 2;
      continue;
    }
    break;
  }
  return idx;
}

export function formatRemainingSeconds(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
