import type { ChildGender } from './storage.ts';

export type WhoIndicator = 'wfa' | 'hfa' | 'hcfa' | 'wfh';
export type WhoTone = 'ok' | 'info' | 'attention';

export interface LmsRow {
  x: number; // age in months OR length/height in cm
  L: number;
  M: number;
  S: number;
}

export interface WhoAssessment {
  indicator: WhoIndicator;
  label: string;
  zScore: number;
  status: string;
  tone: WhoTone;
}

export interface WhoCurvePoint {
  x: number;
  sdMinus2: number;
  median: number;
  sdPlus2: number;
}

export interface WhoKmsBandPoint {
  x: number;
  sdMinus3: number;
  sdMinus2: number;
  sdMinus1: number;
  median: number;
  sdPlus1: number;
  sdPlus2: number;
  sdPlus3: number;
}

export interface WhoChildEvaluation {
  wfa?: WhoAssessment;
  hfa?: WhoAssessment;
  hcfa?: WhoAssessment;
  wfh?: WhoAssessment;
}

// WHO Child Growth Standards LMS anchors (0–60 months)
const WFA_BOY: LmsRow[] = [
  { x: 0, L: 0.3487, M: 3.3464, S: 0.14602 },
  { x: 3, L: 0.1738, M: 6.3762, S: 0.11727 },
  { x: 6, L: 0.1165, M: 7.934, S: 0.11218 },
  { x: 9, L: 0.0684, M: 8.9022, S: 0.11044 },
  { x: 12, L: 0.0258, M: 9.6479, S: 0.10953 },
  { x: 18, L: -0.0419, M: 10.9412, S: 0.10982 },
  { x: 24, L: -0.0956, M: 12.1515, S: 0.11126 },
  { x: 36, L: -0.1763, M: 14.3429, S: 0.11572 },
  { x: 48, L: -0.2336, M: 16.3489, S: 0.12131 },
  { x: 60, L: -0.2738, M: 18.3366, S: 0.12776 }
];

const WFA_GIRL: LmsRow[] = [
  { x: 0, L: 0.3809, M: 3.2322, S: 0.14171 },
  { x: 3, L: 0.1261, M: 5.8458, S: 0.12352 },
  { x: 6, L: 0.0447, M: 7.297, S: 0.12055 },
  { x: 9, L: -0.0119, M: 8.2254, S: 0.11932 },
  { x: 12, L: -0.0566, M: 8.9481, S: 0.11874 },
  { x: 18, L: -0.1236, M: 10.226, S: 0.1192 },
  { x: 24, L: -0.1731, M: 11.4775, S: 0.12066 },
  { x: 36, L: -0.2405, M: 13.8503, S: 0.12576 },
  { x: 48, L: -0.2817, M: 16.0697, S: 0.13227 },
  { x: 60, L: -0.3036, M: 18.2193, S: 0.13949 }
];

const HFA_BOY: LmsRow[] = [
  { x: 0, L: 1, M: 49.8842, S: 0.03795 },
  { x: 3, L: 1, M: 61.4292, S: 0.03299 },
  { x: 6, L: 1, M: 67.6236, S: 0.03165 },
  { x: 9, L: 1, M: 71.9687, S: 0.03152 },
  { x: 12, L: 1, M: 75.7488, S: 0.03179 },
  { x: 18, L: 1, M: 82.2587, S: 0.03326 },
  { x: 24, L: 1, M: 87.8161, S: 0.03479 },
  { x: 36, L: 1, M: 96.0835, S: 0.03813 },
  { x: 48, L: 1, M: 103.3273, S: 0.04088 },
  { x: 60, L: 1, M: 110.0029, S: 0.04318 }
];

const HFA_GIRL: LmsRow[] = [
  { x: 0, L: 1, M: 49.1477, S: 0.0379 },
  { x: 3, L: 1, M: 59.8029, S: 0.03457 },
  { x: 6, L: 1, M: 65.7311, S: 0.03376 },
  { x: 9, L: 1, M: 70.1435, S: 0.0339 },
  { x: 12, L: 1, M: 74.015, S: 0.03425 },
  { x: 18, L: 1, M: 80.7079, S: 0.03527 },
  { x: 24, L: 1, M: 86.4153, S: 0.0365 },
  { x: 36, L: 1, M: 95.0515, S: 0.03942 },
  { x: 48, L: 1, M: 102.7075, S: 0.04215 },
  { x: 60, L: 1, M: 109.4239, S: 0.0441 }
];

const HCFA_BOY: LmsRow[] = [
  { x: 0, L: 1, M: 34.4618, S: 0.03686 },
  { x: 3, L: 1, M: 40.5135, S: 0.02942 },
  { x: 6, L: 1, M: 43.3306, S: 0.02819 },
  { x: 9, L: 1, M: 44.9936, S: 0.02777 },
  { x: 12, L: 1, M: 46.0793, S: 0.02759 },
  { x: 18, L: 1, M: 47.4258, S: 0.02749 },
  { x: 24, L: 1, M: 48.2943, S: 0.02753 },
  { x: 36, L: 1, M: 49.4932, S: 0.02777 },
  { x: 48, L: 1, M: 50.2414, S: 0.02805 },
  { x: 60, L: 1, M: 50.7429, S: 0.02833 }
];

const HCFA_GIRL: LmsRow[] = [
  { x: 0, L: 1, M: 33.8787, S: 0.03496 },
  { x: 3, L: 1, M: 39.5328, S: 0.03018 },
  { x: 6, L: 1, M: 42.1999, S: 0.02909 },
  { x: 9, L: 1, M: 43.844, S: 0.02855 },
  { x: 12, L: 1, M: 44.899, S: 0.02821 },
  { x: 18, L: 1, M: 46.2355, S: 0.02784 },
  { x: 24, L: 1, M: 47.1636, S: 0.0277 },
  { x: 36, L: 1, M: 48.4647, S: 0.02776 },
  { x: 48, L: 1, M: 49.2618, S: 0.02798 },
  { x: 60, L: 1, M: 49.8551, S: 0.02824 }
];

// Weight-for-length/height (x in cm 50..115)
const WFH_BOY: LmsRow[] = [
  { x: 50, L: -0.3521, M: 3.3207, S: 0.0887 },
  { x: 60, L: -0.3521, M: 5.9519, S: 0.0823 },
  { x: 70, L: -0.3521, M: 8.4384, S: 0.0802 },
  { x: 80, L: -0.3521, M: 10.6331, S: 0.0793 },
  { x: 90, L: -0.3521, M: 12.9098, S: 0.0804 },
  { x: 100, L: -0.3521, M: 15.4241, S: 0.0835 },
  { x: 115, L: -0.3521, M: 20.5315, S: 0.0906 }
];

const WFH_GIRL: LmsRow[] = [
  { x: 50, L: -0.3833, M: 3.3518, S: 0.0881 },
  { x: 60, L: -0.3833, M: 5.7929, S: 0.0837 },
  { x: 70, L: -0.3833, M: 8.1516, S: 0.0825 },
  { x: 80, L: -0.3833, M: 10.2266, S: 0.0821 },
  { x: 90, L: -0.3833, M: 12.5679, S: 0.084 },
  { x: 100, L: -0.3833, M: 15.1616, S: 0.0884 },
  { x: 115, L: -0.3833, M: 20.4712, S: 0.0968 }
];

function getTable(gender: ChildGender, indicator: WhoIndicator): LmsRow[] {
  switch (indicator) {
    case 'wfa':
      return gender === 'girl' ? WFA_GIRL : WFA_BOY;
    case 'hfa':
      return gender === 'girl' ? HFA_GIRL : HFA_BOY;
    case 'hcfa':
      return gender === 'girl' ? HCFA_GIRL : HCFA_BOY;
    case 'wfh':
      return gender === 'girl' ? WFH_GIRL : WFH_BOY;
  }
}

export function interpolateLms(table: LmsRow[], xVal: number): LmsRow {
  const clamped = Math.max(table[0].x, Math.min(table[table.length - 1].x, xVal));
  const exact = table.find((r) => r.x === clamped);
  if (exact) return exact;
  let upperIdx = table.findIndex((r) => r.x > clamped);
  if (upperIdx <= 0) upperIdx = table.length - 1;
  const low = table[upperIdx - 1];
  const high = table[upperIdx];
  const t = (clamped - low.x) / Math.max(0.0001, high.x - low.x);
  return {
    x: clamped,
    L: low.L + (high.L - low.L) * t,
    M: low.M + (high.M - low.M) * t,
    S: low.S + (high.S - low.S) * t
  };
}

export function lmsZScore(value: number, L: number, M: number, S: number): number {
  if (!(value > 0) || !(M > 0) || !(S > 0)) return 0;
  const rawZ =
    Math.abs(L) < 1e-6
      ? Math.log(value / M) / S
      : (Math.pow(value / M, L) - 1) / (L * S);
  return Math.round(rawZ * 100) / 100;
}

export function valueFromZScore(z: number, L: number, M: number, S: number): number {
  const val =
    Math.abs(L) < 1e-6
      ? M * Math.exp(S * z)
      : M * Math.pow(Math.max(0.01, 1 + L * S * z), 1 / L);
  return Math.round(val * 10) / 10;
}

function classifyIndicator(indicator: WhoIndicator, z: number): { status: string; tone: WhoTone } {
  if (indicator === 'hfa') {
    if (z < -3) return { status: 'Sangat Pendek (Cek Dokter)', tone: 'attention' };
    if (z < -2) return { status: 'Pendek (Pantau Rutin)', tone: 'attention' };
    if (z > 3) return { status: 'Tinggi di Atas Rata-rata', tone: 'info' };
    return { status: 'Normal', tone: 'ok' };
  }
  if (indicator === 'hcfa') {
    if (z < -2) return { status: 'Lingkar Kepala Kecil (Cek)', tone: 'attention' };
    if (z > 2) return { status: 'Lingkar Kepala Besar (Cek)', tone: 'attention' };
    return { status: 'Normal', tone: 'ok' };
  }
  // wfa & wfh
  if (z < -3) return { status: 'Sangat Kurang (Cek Dokter)', tone: 'attention' };
  if (z < -2) return { status: 'Kurang / Kurus (Pantau)', tone: 'attention' };
  if (z > 2) return { status: 'Risiko Berat Lebih', tone: 'info' };
  return { status: 'Normal', tone: 'ok' };
}

export function evaluateChildGrowthWho(input: {
  gender: ChildGender;
  months: number;
  weightKg?: number;
  heightCm?: number;
  headCircumferenceCm?: number;
}): WhoChildEvaluation {
  const safeMonths = Math.max(0, Math.min(60, input.months));
  const out: WhoChildEvaluation = {};

  if (input.weightKg && input.weightKg > 0) {
    const row = interpolateLms(getTable(input.gender, 'wfa'), safeMonths);
    const z = lmsZScore(input.weightKg, row.L, row.M, row.S);
    out.wfa = { indicator: 'wfa', label: 'BB/U (Berat vs Usia)', zScore: z, ...classifyIndicator('wfa', z) };
  }
  if (input.heightCm && input.heightCm > 0) {
    const row = interpolateLms(getTable(input.gender, 'hfa'), safeMonths);
    const z = lmsZScore(input.heightCm, row.L, row.M, row.S);
    out.hfa = { indicator: 'hfa', label: 'TB/U (Tinggi vs Usia)', zScore: z, ...classifyIndicator('hfa', z) };
  }
  if (input.weightKg && input.weightKg > 0 && input.heightCm && input.heightCm >= 45 && input.heightCm <= 120) {
    const row = interpolateLms(getTable(input.gender, 'wfh'), input.heightCm);
    const z = lmsZScore(input.weightKg, row.L, row.M, row.S);
    out.wfh = { indicator: 'wfh', label: 'BB/TB (Proporsi Berat)', zScore: z, ...classifyIndicator('wfh', z) };
  }
  if (input.headCircumferenceCm && input.headCircumferenceCm > 0) {
    const row = interpolateLms(getTable(input.gender, 'hcfa'), safeMonths);
    const z = lmsZScore(input.headCircumferenceCm, row.L, row.M, row.S);
    out.hcfa = { indicator: 'hcfa', label: 'LK/U (Lingkar Kepala)', zScore: z, ...classifyIndicator('hcfa', z) };
  }

  return out;
}

export function computeWhoCurveBand(
  gender: ChildGender,
  indicator: 'wfa' | 'hfa' | 'hcfa',
  minMonth = 0,
  maxMonth = 60
): WhoCurvePoint[] {
  const table = getTable(gender, indicator);
  return table
    .filter((r) => r.x >= minMonth && r.x <= maxMonth)
    .map((r) => ({
      x: r.x,
      sdMinus2: valueFromZScore(-2, r.L, r.M, r.S),
      median: Math.round(r.M * 10) / 10,
      sdPlus2: valueFromZScore(2, r.L, r.M, r.S)
    }));
}

export function computeWhoKmsBands(
  gender: ChildGender,
  indicator: 'wfa' | 'hfa' | 'hcfa',
  minMonth = 0,
  maxMonth = 24
): WhoKmsBandPoint[] {
  const table = getTable(gender, indicator);
  const clampedMin = Math.max(0, Math.min(54, Math.floor(minMonth)));
  const clampedMax = Math.max(clampedMin + 6, Math.min(60, Math.ceil(maxMonth)));
  const step = clampedMax - clampedMin <= 24 ? 2 : 3;
  const points: WhoKmsBandPoint[] = [];

  for (let m = clampedMin; m <= clampedMax; m += step) {
    const row = interpolateLms(table, m);
    points.push({
      x: m,
      sdMinus3: valueFromZScore(-3, row.L, row.M, row.S),
      sdMinus2: valueFromZScore(-2, row.L, row.M, row.S),
      sdMinus1: valueFromZScore(-1, row.L, row.M, row.S),
      median: Math.round(row.M * 10) / 10,
      sdPlus1: valueFromZScore(1, row.L, row.M, row.S),
      sdPlus2: valueFromZScore(2, row.L, row.M, row.S),
      sdPlus3: valueFromZScore(3, row.L, row.M, row.S)
    });
  }
  if (points[points.length - 1]?.x !== clampedMax) {
    const row = interpolateLms(table, clampedMax);
    points.push({
      x: clampedMax,
      sdMinus3: valueFromZScore(-3, row.L, row.M, row.S),
      sdMinus2: valueFromZScore(-2, row.L, row.M, row.S),
      sdMinus1: valueFromZScore(-1, row.L, row.M, row.S),
      median: Math.round(row.M * 10) / 10,
      sdPlus1: valueFromZScore(1, row.L, row.M, row.S),
      sdPlus2: valueFromZScore(2, row.L, row.M, row.S),
      sdPlus3: valueFromZScore(3, row.L, row.M, row.S)
    });
  }
  return points;
}

export function computeAgeMonthsAtDate(birthDateIso: string | undefined, targetDateIso: string): number | null {
  if (!birthDateIso) return null;
  const b = new Date(`${birthDateIso}T00:00:00`);
  const t = new Date(`${targetDateIso}T00:00:00`);
  if (Number.isNaN(b.getTime()) || Number.isNaN(t.getTime())) return null;
  const diffDays = (t.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < -7) return null;
  return Math.max(0, Math.min(60, Math.round((diffDays / 30.4375) * 10) / 10));
}
