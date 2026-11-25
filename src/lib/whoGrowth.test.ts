import assert from 'node:assert/strict';
import test from 'node:test';
import { computeAgeMonthsAtDate, computeWhoKmsBands } from './whoGrowth.ts';

test('computeWhoKmsBands produces strictly ordered KMS bands (-3 SD to +3 SD) for boys and girls', () => {
  for (const gender of ['boy', 'girl'] as const) {
    for (const indicator of ['wfa', 'hfa', 'hcfa'] as const) {
      const bands = computeWhoKmsBands(gender, indicator, 0, 24);
      assert.ok(bands.length >= 10, `expected >=10 band points for ${gender}/${indicator}`);
      for (const b of bands) {
        assert.ok(b.sdMinus3 < b.sdMinus2, 'sdMinus3 < sdMinus2');
        assert.ok(b.sdMinus2 < b.sdMinus1, 'sdMinus2 < sdMinus1');
        assert.ok(b.sdMinus1 < b.median, 'sdMinus1 < median');
        assert.ok(b.median < b.sdPlus1, 'median < sdPlus1');
        assert.ok(b.sdPlus1 < b.sdPlus2, 'sdPlus1 < sdPlus2');
        assert.ok(b.sdPlus2 < b.sdPlus3, 'sdPlus2 < sdPlus3');
      }
      // Curve rises with age
      assert.ok(bands[bands.length - 1].median > bands[0].median);
    }
  }
});

test('computeAgeMonthsAtDate calculates accurate age in months and rejects invalid dates', () => {
  const m12 = computeAgeMonthsAtDate('2025-01-01', '2026-01-01');
  assert.ok(m12 !== null && Math.abs(m12 - 12) < 0.2);

  const m0 = computeAgeMonthsAtDate('2026-01-01', '2026-01-01');
  assert.equal(m0, 0);

  assert.equal(computeAgeMonthsAtDate(undefined, '2026-01-01'), null);
  assert.equal(computeAgeMonthsAtDate('2026-06-01', '2025-01-01'), null);
});
