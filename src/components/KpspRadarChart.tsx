import type { JSX } from 'react';
import { PILLAR_LABELS } from '../data/stimulationData.ts';
import type { StimulationPillar } from '../lib/development.ts';

export interface PillarScore {
  pillar: StimulationPillar;
  yes: number;
  total: number;
  percent: number;
}

interface Props {
  scores: PillarScore[];
  answeredCount: number;
  totalCount: number;
}

const PILLAR_ORDER: StimulationPillar[] = ['motor-kasar', 'motor-halus', 'bahasa', 'kognitif'];

export function KpspRadarChart({ scores, answeredCount, totalCount }: Props): JSX.Element {
  const map = new Map(scores.map((s) => [s.pillar, s]));
  const ordered = PILLAR_ORDER.map(
    (p) => map.get(p) ?? { pillar: p, yes: 0, total: 1, percent: 0 }
  );

  // 4-axis diamond radar centered at (110, 86), radius = 52 (generous horizontal room for 'Kognitif')
  const cx = 110;
  const cy = 86;
  const rMax = 50;
  const axes = [
    { dx: 0, dy: -1, label: 'Kasar', lx: cx, ly: cy - rMax - 12, anchor: 'middle' as const },
    { dx: 1, dy: 0, label: 'Halus', lx: cx + rMax + 8, ly: cy + 3, anchor: 'start' as const },
    { dx: 0, dy: 1, label: 'Bahasa', lx: cx, ly: cy + rMax + 16, anchor: 'middle' as const },
    { dx: -1, dy: 0, label: 'Kognitif', lx: cx - rMax - 8, ly: cy + 3, anchor: 'end' as const }
  ];

  const ringPoints = (scale: number) =>
    axes
      .map((a) => `${(cx + a.dx * rMax * scale).toFixed(1)},${(cy + a.dy * rMax * scale).toFixed(1)}`)
      .join(' ');

  const dataPoints = ordered
    .map((item, idx) => {
      const ratio = Math.max(0.14, item.percent / 100);
      const a = axes[idx];
      return `${(cx + a.dx * rMax * ratio).toFixed(1)},${(cy + a.dy * rMax * ratio).toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="kpsp-radar-box">
      <div className="kpsp-radar-svg-wrap">
        <svg viewBox="0 0 220 172" className="kpsp-radar-svg" role="img" aria-label="Grafik keseimbangan 4 domain KPSP">
          {[0.33, 0.66, 1].map((s) => (
            <polygon
              key={s}
              points={ringPoints(s)}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
            />
          ))}
          {axes.map((a) => (
            <line
              key={a.label}
              x1={cx}
              y1={cy}
              x2={cx + a.dx * rMax}
              y2={cy + a.dy * rMax}
              stroke="var(--border)"
              strokeWidth="1"
            />
          ))}
          <polygon
            points={dataPoints}
            fill="rgba(43, 110, 79, 0.28)"
            stroke="var(--sage)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          {ordered.map((item, idx) => {
            const ratio = Math.max(0.14, item.percent / 100);
            const a = axes[idx];
            return (
              <circle
                key={item.pillar}
                cx={cx + a.dx * rMax * ratio}
                cy={cy + a.dy * rMax * ratio}
                r="4"
                fill="var(--amber)"
                stroke="var(--sage)"
                strokeWidth="1.8"
              />
            );
          })}
          {axes.map((a) => (
            <text
              key={a.label}
              x={a.lx}
              y={a.ly}
              textAnchor={a.anchor}
              fontSize="10"
              fontWeight="700"
              fill="var(--ink)"
            >
              {a.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="kpsp-radar-bars">
        <div className="kpsp-radar-head">
          <strong>Peta 4 Domain</strong>
          <span className="muted-mini tabular">Terjawab {answeredCount}/{totalCount}</span>
        </div>
        {ordered.map((item) => (
          <div key={item.pillar} className="kpsp-domain-row">
            <div className="kpsp-domain-top">
              <span>{PILLAR_LABELS[item.pillar]}</span>
              <strong className="tabular">{item.yes}/{item.total}</strong>
            </div>
            <div className="linear-track thin" aria-hidden="true">
              <div className="linear-fill" style={{ width: `${item.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
