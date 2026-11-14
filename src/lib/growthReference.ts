import type { AgeBand } from './development.ts';
import type { GrowthEntry } from './journalStorage.ts';

export interface GrowthReferenceBand {
  label: string;
  weightMinKg: number;
  weightMaxKg: number;
  heightMinCm: number;
  heightMaxCm: number;
}

const REFERENCE_ANCHORS: {
  months: number;
  weightMinKg: number;
  weightMaxKg: number;
  heightMinCm: number;
  heightMaxCm: number;
}[] = [
  { months: 0, weightMinKg: 2.5, weightMaxKg: 4.3, heightMinCm: 46, heightMaxCm: 54 },
  { months: 3, weightMinKg: 4.6, weightMaxKg: 7.5, heightMinCm: 56, heightMaxCm: 65 },
  { months: 6, weightMinKg: 6.0, weightMaxKg: 9.6, heightMinCm: 62, heightMaxCm: 71 },
  { months: 9, weightMinKg: 7.0, weightMaxKg: 10.8, heightMinCm: 66, heightMaxCm: 76 },
  { months: 12, weightMinKg: 7.6, weightMaxKg: 11.7, heightMinCm: 69, heightMaxCm: 80 },
  { months: 18, weightMinKg: 8.6, weightMaxKg: 13.4, heightMinCm: 75, heightMaxCm: 87 },
  { months: 24, weightMinKg: 9.5, weightMaxKg: 15.0, heightMinCm: 80, heightMaxCm: 93 },
  { months: 36, weightMinKg: 11.0, weightMaxKg: 17.8, heightMinCm: 88, heightMaxCm: 102 },
  { months: 48, weightMinKg: 12.5, weightMaxKg: 20.5, heightMinCm: 94, heightMaxCm: 110 },
  { months: 60, weightMinKg: 14.0, weightMaxKg: 23.0, heightMinCm: 100, heightMaxCm: 117 }
];

const BAND_DEFAULT_MONTHS: Record<AgeBand, number> = {
  '0-3m': 1,
  '3-6m': 4,
  '6-12m': 9,
  '1-2y': 18,
  '2-3y': 30,
  '3-5y': 48
};

export function getDefaultMonthsForBand(band: AgeBand): number {
  return BAND_DEFAULT_MONTHS[band];
}

export function getGrowthReferenceForMonths(months: number): GrowthReferenceBand {
  const clamped = Math.max(0, Math.min(60, Math.round(months)));
  let upperIdx = REFERENCE_ANCHORS.findIndex((a) => a.months >= clamped);
  if (upperIdx === -1) upperIdx = REFERENCE_ANCHORS.length - 1;
  if (upperIdx === 0) {
    const a = REFERENCE_ANCHORS[0];
    return { label: `${a.months} bln`, ...a };
  }
  const low = REFERENCE_ANCHORS[upperIdx - 1];
  const high = REFERENCE_ANCHORS[upperIdx];
  const ratio = (clamped - low.months) / Math.max(1, high.months - low.months);
  const lerp = (x: number, y: number) => Math.round((x + (y - x) * ratio) * 10) / 10;
  return {
    label: `${clamped} bln`,
    weightMinKg: lerp(low.weightMinKg, high.weightMinKg),
    weightMaxKg: lerp(low.weightMaxKg, high.weightMaxKg),
    heightMinCm: lerp(low.heightMinCm, high.heightMinCm),
    heightMaxCm: lerp(low.heightMaxCm, high.heightMaxCm)
  };
}

export interface SparklinePoint {
  x: number;
  y: number;
  value: number;
  date: string;
}

export interface SparklineSeries {
  points: SparklinePoint[];
  minValue: number;
  maxValue: number;
  polyline: string;
  bandTopY?: number;
  bandBottomY?: number;
}

export function buildSparklinePoints(
  entries: GrowthEntry[],
  metric: 'weightKg' | 'heightCm',
  width: number,
  height: number,
  referenceRange?: { min: number; max: number }
): SparklineSeries {
  const padX = 16;
  const padY = 14;
  const filtered = [...entries]
    .filter((e) => typeof e[metric] === 'number' && Number.isFinite(e[metric]))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filtered.length === 0) {
    return { points: [], minValue: 0, maxValue: 0, polyline: '' };
  }

  const values = filtered.map((e) => e[metric] as number);
  let minValue = Math.min(...values, ...(referenceRange ? [referenceRange.min] : []));
  let maxValue = Math.max(...values, ...(referenceRange ? [referenceRange.max] : []));
  if (maxValue - minValue < 1) {
    minValue = Math.max(0, minValue - 0.5);
    maxValue = maxValue + 0.5;
  }

  const innerW = Math.max(20, width - padX * 2);
  const innerH = Math.max(20, height - padY * 2);
  const toY = (val: number) =>
    Math.round((padY + innerH - ((val - minValue) / (maxValue - minValue)) * innerH) * 10) / 10;

  const points: SparklinePoint[] = filtered.map((entry, idx) => {
    const x =
      filtered.length === 1
        ? width / 2
        : Math.round((padX + (idx / (filtered.length - 1)) * innerW) * 10) / 10;
    const value = entry[metric] as number;
    return { x, y: toY(value), value, date: entry.date };
  });

  return {
    points,
    minValue: Math.round(minValue * 10) / 10,
    maxValue: Math.round(maxValue * 10) / 10,
    polyline: points.map((p) => `${p.x},${p.y}`).join(' '),
    ...(referenceRange
      ? { bandTopY: toY(referenceRange.max), bandBottomY: toY(referenceRange.min) }
      : {})
  };
}
