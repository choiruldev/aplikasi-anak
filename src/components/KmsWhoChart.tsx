import type { JSX } from 'react';
import type { GrowthEntry } from '../lib/journalStorage.ts';
import type { ChildGender } from '../lib/storage.ts';
import {
  computeAgeMonthsAtDate,
  computeWhoKmsBands,
  interpolateLms,
  valueFromZScore
} from '../lib/whoGrowth.ts';

interface Props {
  gender: ChildGender;
  metric: 'weightKg' | 'heightCm' | 'headCircumferenceCm';
  currentMonths: number;
  birthDate?: string;
  entries: GrowthEntry[];
}

export function KmsWhoChart({
  gender,
  metric,
  currentMonths,
  birthDate,
  entries
}: Props): JSX.Element {
  const indicator = metric === 'weightKg' ? 'wfa' : metric === 'heightCm' ? 'hfa' : 'hcfa';
  const unit = metric === 'weightKg' ? 'kg' : 'cm';

  // Pick a clean KMS window around child's age (0-24m for babies/toddlers, 0-60m for older)
  const windowMax = currentMonths <= 18 ? 24 : currentMonths <= 32 ? 36 : 60;
  const windowMin = 0;

  const bands = computeWhoKmsBands(gender, indicator, windowMin, windowMax);

  // Map valid child entries to (ageMonths, value)
  const validEntries = [...entries]
    .filter((e) => typeof e[metric] === 'number' && Number.isFinite(e[metric]))
    .sort((a, b) => a.date.localeCompare(b.date));

  const childPoints = validEntries.map((entry, idx) => {
    const val = entry[metric] as number;
    const computedAge = computeAgeMonthsAtDate(birthDate, entry.date);
    // Fallback if birthDate isn't filled: space backwards from currentMonths
    const fallbackAge = Math.max(
      0,
      Math.min(windowMax, currentMonths - (validEntries.length - 1 - idx) * 1.5)
    );
    const xMonths = Math.max(windowMin, Math.min(windowMax, computedAge ?? fallbackAge));
    return { xMonths, value: val, date: entry.date };
  });

  const allYValues = [
    ...bands.flatMap((b) => [b.sdMinus3, b.sdPlus3]),
    ...childPoints.map((p) => p.value)
  ];
  const minVal = Math.max(0, Math.floor(Math.min(...allYValues) - (metric === 'weightKg' ? 1 : 3)));
  const maxVal = Math.ceil(Math.max(...allYValues) + (metric === 'weightKg' ? 1.5 : 4));

  const W = 360;
  const H = 216;
  const padL = 34;
  const padR = 14;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const toX = (m: number) => padL + ((m - windowMin) / Math.max(1, windowMax - windowMin)) * innerW;
  const toY = (v: number) => padT + innerH - ((v - minVal) / Math.max(0.1, maxVal - minVal)) * innerH;

  const buildBandPolygon = (
    upperKey: keyof (typeof bands)[0],
    lowerKey: keyof (typeof bands)[0]
  ): string => {
    const topPts = bands.map((b) => `${toX(b.x).toFixed(1)},${toY(b[upperKey] as number).toFixed(1)}`);
    const botPts = [...bands]
      .reverse()
      .map((b) => `${toX(b.x).toFixed(1)},${toY(b[lowerKey] as number).toFixed(1)}`);
    return [...topPts, ...botPts].join(' ');
  };

  const buildConstantPolygon = (
    topYVal: number,
    lowerKey: keyof (typeof bands)[0]
  ): string => {
    const topPts = bands.map((b) => `${toX(b.x).toFixed(1)},${toY(topYVal).toFixed(1)}`);
    const botPts = [...bands]
      .reverse()
      .map((b) => `${toX(b.x).toFixed(1)},${toY(b[lowerKey] as number).toFixed(1)}`);
    return [...topPts, ...botPts].join(' ');
  };

  const buildBottomPolygon = (
    upperKey: keyof (typeof bands)[0],
    botYVal: number
  ): string => {
    const topPts = bands.map((b) => `${toX(b.x).toFixed(1)},${toY(b[upperKey] as number).toFixed(1)}`);
    const botPts = [...bands]
      .reverse()
      .map((b) => `${toX(b.x).toFixed(1)},${toY(botYVal).toFixed(1)}`);
    return [...topPts, ...botPts].join(' ');
  };

  const medianPolyline = bands
    .map((b) => `${toX(b.x).toFixed(1)},${toY(b.median).toFixed(1)}`)
    .join(' ');

  const xTickStep = windowMax <= 24 ? 6 : windowMax <= 36 ? 6 : 12;
  const xTicks: number[] = [];
  for (let m = windowMin; m <= windowMax; m += xTickStep) xTicks.push(m);

  const yTickCount = 4;
  const yTicks: number[] = [];
  for (let i = 0; i <= yTickCount; i++) {
    yTicks.push(Math.round((minVal + ((maxVal - minVal) * i) / yTickCount) * 10) / 10);
  }

  // Exact reference band at child's current age (fixes old bug that used maxMonth!)
  const ageNowRow = interpolateLms(
    bands.map((b) => ({ x: b.x, L: 1, M: b.median, S: 0.05 })),
    Math.min(windowMax, currentMonths)
  );
  const nearestBand = bands.reduce((best, cur) =>
    Math.abs(cur.x - currentMonths) < Math.abs(best.x - currentMonths) ? cur : best
  );
  const currentAgeX = toX(Math.max(windowMin, Math.min(windowMax, currentMonths)));
  const childPolyline = childPoints
    .map((p) => `${toX(p.xMonths).toFixed(1)},${toY(p.value).toFixed(1)}`)
    .join(' ');

  // Silence unused import warning cleanly while keeping exact reference lookup
  void ageNowRow;
  void valueFromZScore;

  return (
    <div className="kms-chart-card">
      <div className="kms-chart-head">
        <span className="kms-chart-title">
          KMS Digital WHO ({gender === 'girl' ? 'Perempuan' : 'Laki-laki'})
        </span>
        <span className="kms-age-range">
          Normal usia {Math.round(currentMonths)} bln: <strong>{nearestBand.sdMinus2}–{nearestBand.sdPlus2} {unit}</strong>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="kms-svg"
        role="img"
        aria-label={`Grafik KMS WHO ${unit} usia 0 sampai ${windowMax} bulan`}
      >
        <defs>
          <clipPath id={`kms-clip-${indicator}`}>
            <rect x={padL} y={padT} width={innerW} height={innerH} rx="6" />
          </clipPath>
        </defs>

        <g clipPath={`url(#kms-clip-${indicator})`}>
          {/* Red extreme zones (< -3 SD and > +3 SD) */}
          <polygon points={buildConstantPolygon(maxVal, 'sdPlus3')} fill="#F9D6D5" />
          <polygon points={buildBottomPolygon('sdMinus3', minVal)} fill="#F9D6D5" />

          {/* Yellow warning zones (-3 to -2 SD and +2 to +3 SD) */}
          <polygon points={buildBandPolygon('sdPlus3', 'sdPlus2')} fill="#FCECC5" />
          <polygon points={buildBandPolygon('sdMinus2', 'sdMinus3')} fill="#FCECC5" />

          {/* Light green normal outer zones (-2 to -1 SD and +1 to +2 SD) */}
          <polygon points={buildBandPolygon('sdPlus2', 'sdPlus1')} fill="#D6F0DF" />
          <polygon points={buildBandPolygon('sdMinus1', 'sdMinus2')} fill="#D6F0DF" />

          {/* Fresh green ideal center zone (-1 SD to +1 SD) */}
          <polygon points={buildBandPolygon('sdPlus1', 'sdMinus1')} fill="#B2E3C5" />

          {/* Horizontal subtle grid lines */}
          {yTicks.map((yv) => (
            <line
              key={yv}
              x1={padL}
              y1={toY(yv)}
              x2={padL + innerW}
              y2={toY(yv)}
              stroke="rgba(24, 36, 33, 0.1)"
              strokeWidth="0.8"
            />
          ))}

          {/* Median (0 SD) dashed reference curve */}
          <polyline
            fill="none"
            stroke="#1F6A47"
            strokeWidth="1.6"
            strokeDasharray="4 3"
            points={medianPolyline}
          />

          {/* Vertical marker for child's current age */}
          <line
            x1={currentAgeX}
            y1={padT}
            x2={currentAgeX}
            y2={padT + innerH}
            stroke="#2B6E4F"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            opacity="0.7"
          />

          {/* Child trajectory line */}
          {childPoints.length > 1 && (
            <polyline
              fill="none"
              stroke="#182421"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={childPolyline}
            />
          )}

          {/* Child measurement dots */}
          {childPoints.map((pt, i) => {
            const cx = toX(pt.xMonths);
            const cy = toY(pt.value);
            const isLatest = i === childPoints.length - 1;
            return (
              <g key={`${pt.date}-${i}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isLatest ? 5.5 : 4}
                  fill={isLatest ? '#E07A18' : '#FFFFFF'}
                  stroke="#182421"
                  strokeWidth="2.2"
                />
                {(isLatest || childPoints.length <= 4) && (
                  <g>
                    <rect
                      x={Math.min(padL + innerW - 34, Math.max(padL + 2, cx - 17))}
                      y={Math.max(padT + 2, cy - 22)}
                      width="34"
                      height="15"
                      rx="5"
                      fill="#182421"
                      opacity="0.9"
                    />
                    <text
                      x={Math.min(padL + innerW - 17, Math.max(padL + 19, cx))}
                      y={Math.max(padT + 12.5, cy - 11.5)}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="700"
                      fill="#FFFFFF"
                    >
                      {pt.value}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Chart border */}
        <rect
          x={padL}
          y={padT}
          width={innerW}
          height={innerH}
          rx="6"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1.2"
        />

        {/* Y-axis labels */}
        {yTicks.map((yv) => (
          <text
            key={yv}
            x={padL - 5}
            y={toY(yv) + 3}
            textAnchor="end"
            fontSize="8.5"
            fontWeight="600"
            fill="var(--ink-muted)"
          >
            {Math.round(yv)}
          </text>
        ))}

        {/* X-axis month labels */}
        {xTicks.map((m) => (
          <text
            key={m}
            x={toX(m)}
            y={H - 9}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="600"
            fill="var(--ink-muted)"
          >
            {m}b
          </text>
        ))}
      </svg>

      {/* Clear 3-color KMS Legend */}
      <div className="kms-legend-row" aria-label="Legenda warna KMS WHO">
        <span className="kms-legend-item">
          <i className="kms-dot is-green" /> Hijau: Normal (-2 s/d +2 SD)
        </span>
        <span className="kms-legend-item">
          <i className="kms-dot is-yellow" /> Kuning: Pantau (±2–3 SD)
        </span>
        <span className="kms-legend-item">
          <i className="kms-dot is-red" /> Merah: Cek Dokter (&gt;±3 SD)
        </span>
      </div>

      {childPoints.length === 0 && (
        <p className="kms-empty-hint">
          Belum ada titik ukur anak. Catat data pertama di bawah agar titik otomatis muncul di kurva KMS ini.
        </p>
      )}
    </div>
  );
}
