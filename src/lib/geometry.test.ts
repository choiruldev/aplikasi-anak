import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceCheckpoint,
  findSnapTarget,
  formatRemainingSeconds,
  sampleStrokes,
  type SnapSlot
} from './geometry.ts';

describe('findSnapTarget', () => {
  const slots: SnapSlot[] = [
    { id: 's1', kind: 'circle', x: 100, y: 100 },
    { id: 's2', kind: 'square', x: 220, y: 100 },
    { id: 's3', kind: 'circle', x: 340, y: 100 }
  ];

  it('snaps to matching unoccupied slot within radius', () => {
    const hit = findSnapTarget({ x: 130, y: 120 }, slots, 'circle', new Set(), 50);
    assert.equal(hit?.id, 's1');
  });

  it('ignores occupied slots and wrong shapes', () => {
    const occupied = new Set(['s1']);
    const miss = findSnapTarget({ x: 105, y: 105 }, slots, 'circle', occupied, 50);
    assert.equal(miss, null);

    const wrongKind = findSnapTarget({ x: 220, y: 100 }, slots, 'triangle', new Set(), 50);
    assert.equal(wrongKind, null);
  });
});

describe('sampleStrokes & advanceCheckpoint', () => {
  it('progresses sequentially along stroke and rejects jumping to end', () => {
    const pts = sampleStrokes([[{ x: 0, y: 0 }, { x: 0, y: 120 }]], 30);
    assert.equal(pts.length, 5);

    // Touching the end first must NOT advance from index 0
    assert.equal(advanceCheckpoint({ x: 0, y: 120 }, pts, 0, 24), 0);

    // Tracing sequentially from start to end advances all checkpoints
    let idx = 0;
    for (const p of pts) {
      idx = advanceCheckpoint(p, pts, idx, 24);
    }
    assert.equal(idx, pts.length);
  });
});

describe('formatRemainingSeconds', () => {
  it('formats countdown safely', () => {
    assert.equal(formatRemainingSeconds(905), '15:05');
    assert.equal(formatRemainingSeconds(-4), '00:00');
  });
});
