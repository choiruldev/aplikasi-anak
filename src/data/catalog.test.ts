import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AGE_PHASES,
  MILESTONES,
  SIMULATION_MODULES,
  STIMULATION_MISSIONS
} from './stimulationData.ts';
import { TIP_CATEGORIES, TIPS_DATA } from './tipsData.ts';

test('all 6 age phases have missions and milestones', () => {
  assert.equal(AGE_PHASES.length, 6);
  for (const phase of AGE_PHASES) {
    const missions = STIMULATION_MISSIONS.filter((m) => m.ageBand === phase.id);
    const milestones = MILESTONES.filter((m) => m.ageBand === phase.id);
    assert.ok(missions.length >= 3, `Phase ${phase.id} needs >= 3 missions`);
    assert.ok(milestones.length >= 5, `Phase ${phase.id} needs >= 5 milestones`);
  }
});

test('mission linkedSimulation keys exist in SIMULATION_MODULES and IDs are unique', () => {
  const moduleKeys = new Set(SIMULATION_MODULES.map((s) => s.key));
  assert.equal(moduleKeys.size, 15);
  assert.equal(SIMULATION_MODULES.filter((s) => s.isBabyTool).length, 3);
  assert.equal(SIMULATION_MODULES.filter((s) => !s.isBabyTool).length, 12);

  for (const m of STIMULATION_MISSIONS) {
    if (m.linkedSimulation) {
      assert.ok(moduleKeys.has(m.linkedSimulation), `Unknown sim ${m.linkedSimulation}`);
    }
  }

  const allIds = [
    ...STIMULATION_MISSIONS.map((m) => m.id),
    ...MILESTONES.map((m) => m.id),
    ...TIPS_DATA.map((t) => t.id)
  ];
  assert.equal(new Set(allIds).size, allIds.length);
  assert.equal(TIP_CATEGORIES.length, 5);
  assert.ok(TIPS_DATA.length >= 15);
});
