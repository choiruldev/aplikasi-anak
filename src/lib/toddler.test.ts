import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BUBBLE_MELODY_NOTES,
  getBubblePopFrequency,
  getNextAnimalIndex,
  isColorDiscoveryComplete,
  isPointerInsideBubble
} from './toddler.ts';

test('isPointerInsideBubble', async (t) => {
  await t.test('detects touch inside exact bubble radius', () => {
    assert.equal(isPointerInsideBubble(100, 100, 100, 100, 30), true);
    assert.equal(isPointerInsideBubble(120, 100, 100, 100, 30), true);
  });

  await t.test('detects touch within toddler touchSlop margin', () => {
    // Distance = 35. Radius = 30. With touchSlop 18, max distance is 48.
    assert.equal(isPointerInsideBubble(135, 100, 100, 100, 30, 18), true);
  });

  await t.test('rejects touch well outside bubble', () => {
    assert.equal(isPointerInsideBubble(200, 200, 100, 100, 30, 18), false);
  });
});

test('getBubblePopFrequency', async (t) => {
  await t.test('cycles through diatonic scale notes', () => {
    assert.equal(getBubblePopFrequency(0), BUBBLE_MELODY_NOTES[0]);
    assert.equal(getBubblePopFrequency(7), BUBBLE_MELODY_NOTES[7]);
    assert.equal(getBubblePopFrequency(8), BUBBLE_MELODY_NOTES[0]);
  });
});

test('getNextAnimalIndex', async (t) => {
  await t.test('increments and wraps around total count', () => {
    assert.equal(getNextAnimalIndex(0, 6), 1);
    assert.equal(getNextAnimalIndex(5, 6), 0);
    assert.equal(getNextAnimalIndex(0, 1), 0);
  });
});

test('isColorDiscoveryComplete', async (t) => {
  await t.test('verifies milestone threshold correctly', () => {
    assert.equal(isColorDiscoveryComplete(4, 5), false);
    assert.equal(isColorDiscoveryComplete(5, 5), true);
    assert.equal(isColorDiscoveryComplete(6, 5), true);
  });
});
