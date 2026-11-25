export type MathQuestionMode = 'add' | 'sub' | 'pattern';

export type PatternToken = 'circle' | 'square' | 'triangle' | 'star';

export interface MathQuestion {
  id: string;
  mode: MathQuestionMode;
  a: number;
  b: number;
  itemKind: 'apple' | 'star' | 'duck' | 'berry';
  answer: string;
  options: string[];
  patternTokens?: PatternToken[];
}

const ITEM_KINDS: MathQuestion['itemKind'][] = ['apple', 'star', 'duck', 'berry'];
const TOKENS: PatternToken[] = ['circle', 'square', 'triangle', 'star'];

function uniqueSortedOptions(answerNum: number, maxVal = 10): string[] {
  const set = new Set<number>([answerNum]);
  const candidates = [answerNum - 1, answerNum + 1, answerNum + 2, answerNum - 2, 1, 2, 3, 4];
  for (const c of candidates) {
    if (set.size >= 3) break;
    if (c >= 1 && c <= maxVal) set.add(c);
  }
  return Array.from(set)
    .sort((x, y) => x - y)
    .map(String);
}

export function generateMathQuestion(
  mode: MathQuestionMode,
  seed: number = Math.floor(Math.random() * 10000)
): MathQuestion {
  const s = Math.abs(Math.floor(seed));
  const itemKind = ITEM_KINDS[s % ITEM_KINDS.length];

  if (mode === 'add') {
    const a = 1 + (s % 5);
    const b = 1 + ((s >> 2) % (10 - a));
    const sum = a + b;
    return {
      id: `add-${a}-${b}-${s}`,
      mode: 'add',
      a,
      b,
      itemKind,
      answer: String(sum),
      options: uniqueSortedOptions(sum, 10)
    };
  }

  if (mode === 'sub') {
    const a = 2 + (s % 5); // 2..6
    const b = 1 + ((s >> 2) % (a - 1)); // 1..a-1
    const diff = a - b;
    return {
      id: `sub-${a}-${b}-${s}`,
      mode: 'sub',
      a,
      b,
      itemKind,
      answer: String(diff),
      options: uniqueSortedOptions(diff, 6)
    };
  }

  // Pattern ABAB or AABB
  const first = TOKENS[s % TOKENS.length];
  const second = TOKENS[(s + 1 + ((s >> 3) % 3)) % TOKENS.length];
  const third = TOKENS[(s + 2) % TOKENS.length];
  const isAABB = s % 2 === 1;
  const patternTokens: PatternToken[] = isAABB
    ? [first, first, second, second, first]
    : [first, second, first, second];
  const answer = first;
  const opts = Array.from(new Set([first, second, third])).slice(0, 3);
  while (opts.length < 3) {
    const extra = TOKENS.find((t) => !opts.includes(t));
    if (extra) opts.push(extra);
    else break;
  }

  return {
    id: `pat-${s}`,
    mode: 'pattern',
    a: 0,
    b: 0,
    itemKind,
    answer,
    options: opts,
    patternTokens
  };
}
