import test from 'node:test';
import assert from 'node:assert/strict';

import { KPSP_CHECKPOINTS } from './kpspData.ts';
import { MPASI_FOODS, MPASI_STAGES } from './mpasiData.ts';
import { SIMULATION_MODULES, STIMULATION_MISSIONS } from './stimulationData.ts';

test('kpspData covers all 9 Indonesian milestone checkpoints (3 to 60 months)', () => {
  const expectedMonths = [3, 6, 9, 12, 18, 24, 36, 48, 60];
  assert.deepEqual(
    KPSP_CHECKPOINTS.map((c) => c.months),
    expectedMonths
  );
  for (const cp of KPSP_CHECKPOINTS) {
    assert.equal(cp.questions.length, 10, `Checkpoint ${cp.months}m must have 10 items`);
  }
});

test('mpasiData covers all 4 feeding stages and 60+ distinct MPASI foods', () => {
  assert.equal(MPASI_STAGES.length, 4);
  assert.ok(MPASI_FOODS.length >= 60);
  const ids = new Set(MPASI_FOODS.map((f) => f.id));
  assert.equal(ids.size, MPASI_FOODS.length);
});

test('stimulationData includes all 6 new public-release learning modules cleanly', () => {
  const keys = new Set(SIMULATION_MODULES.map((m) => m.key));
  for (const newKey of [
    'words',
    'body-emotions',
    'size-sort',
    'good-habits',
    'syllables',
    'math-patterns'
  ] as const) {
    assert.ok(keys.has(newKey), `Missing new learning module ${newKey}`);
  }
  // Ensure missions still resolve valid keys
  for (const m of STIMULATION_MISSIONS) {
    if (m.linkedSimulation) {
      assert.ok(keys.has(m.linkedSimulation));
    }
  }
});
