import test from 'node:test';
import assert from 'node:assert/strict';

import { AGE_BANDS } from '../lib/development.ts';
import { IMMUNIZATION_SCHEDULE } from './immunizationData.ts';
import { DAILY_ROUTINES, HOME_PLAY_IDEAS } from './routineData.ts';
import { STICKER_META } from '../lib/stickersMeta.ts';

test('immunizationData covers 0-5y schedule with unique IDs and valid ageBands', () => {
  assert.ok(IMMUNIZATION_SCHEDULE.length >= 10);
  const ids = new Set(IMMUNIZATION_SCHEDULE.map((item) => item.id));
  assert.equal(ids.size, IMMUNIZATION_SCHEDULE.length);
  for (const item of IMMUNIZATION_SCHEDULE) {
    assert.ok(AGE_BANDS.includes(item.ageBand));
  }
});

test('routineData provides daily slots across morning/noon/evening/night and home play ideas', () => {
  for (const band of AGE_BANDS) {
    const routines = DAILY_ROUTINES.filter((r) => r.ageBands.includes(band));
    assert.ok(routines.length >= 4, `Expected >=4 routines for ${band}`);

    const homeIdeas = HOME_PLAY_IDEAS.filter((h) => h.ageBands.includes(band));
    assert.ok(homeIdeas.length >= 2, `Expected >=2 home play ideas for ${band}`);
  }
});

test('stickersMeta includes 14 distinct stickers including newborn, peekaboo, bubblepopper, streak', () => {
  assert.equal(STICKER_META.length, 14);
  const ids = new Set(STICKER_META.map((s) => s.id));
  assert.equal(ids.size, 14);
  for (const required of [
    'sticker-peekaboo',
    'sticker-bubblepopper',
    'sticker-newborn',
    'sticker-streak'
  ]) {
    assert.ok(ids.has(required), `Missing ${required}`);
  }
});
