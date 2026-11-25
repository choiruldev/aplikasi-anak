import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMathQuestion } from './mathGame.ts';

test('generateMathQuestion generates valid add, sub, and pattern problems with answer inside options', () => {
  for (let seed = 0; seed < 25; seed++) {
    const addQ = generateMathQuestion('add', seed);
    assert.equal(Number(addQ.answer), addQ.a + addQ.b);
    assert.ok(addQ.options.includes(addQ.answer));
    assert.equal(addQ.options.length, 3);
    assert.ok(Number(addQ.answer) <= 10);

    const subQ = generateMathQuestion('sub', seed);
    assert.equal(Number(subQ.answer), subQ.a - subQ.b);
    assert.ok(subQ.a > subQ.b);
    assert.ok(subQ.options.includes(subQ.answer));
    assert.equal(subQ.options.length, 3);

    const patQ = generateMathQuestion('pattern', seed);
    assert.ok(patQ.patternTokens && patQ.patternTokens.length >= 4);
    assert.ok(patQ.options.includes(patQ.answer));
    assert.equal(patQ.options.length, 3);
  }
});
