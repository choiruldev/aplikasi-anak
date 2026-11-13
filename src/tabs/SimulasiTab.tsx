import { useState, type JSX } from 'react';
import { IconLock, IconStar } from '../components/Art.tsx';
import {
  AGE_PHASES,
  PILLAR_LABELS,
  SIMULATION_MODULES,
  type SimulationKey
} from '../data/stimulationData.ts';
import {
  isModuleLockedByLimit,
  type AgeBand,
  type StimulationPillar
} from '../lib/development.ts';

interface Props {
  activeBand: AgeBand;
  isGameTimeUp: boolean;
  stickersCount: number;
  onOpenStickerAlbum: () => void;
  onLaunchSimulation: (key: SimulationKey) => void;
  onOpenTimeLimitReset: () => void;
}

const PILLAR_FILTERS: Array<{ id: 'all' | StimulationPillar; label: string }> = [
  { id: 'all', label: 'Semua Aspek' },
  { id: 'kognitif', label: 'Kognitif' },
  { id: 'motor-halus', label: 'Motorik Halus' },
  { id: 'motor-kasar', label: 'Motorik Kasar' },
  { id: 'bahasa', label: 'Bahasa' }
];

export function SimulasiTab({
  activeBand,
  isGameTimeUp,
  stickersCount,
  onOpenStickerAlbum,
  onLaunchSimulation,
  onOpenTimeLimitReset
}: Props): JSX.Element {
  const [onlyAgeMatch, setOnlyAgeMatch] = useState(false);
  const [pillarFilter, setPillarFilter] = useState<'all' | StimulationPillar>('all');

  const phaseMeta = AGE_PHASES.find((p) => p.id === activeBand);

  const matchesFilters = (ageBands: AgeBand[], pillar: StimulationPillar): boolean => {
    if (onlyAgeMatch && !ageBands.includes(activeBand)) return false;
    if (pillarFilter !== 'all' && pillar !== pillarFilter) return false;
    return true;
  };

  const babyTools = SIMULATION_MODULES.filter(
    (m) => m.isBabyTool && matchesFilters(m.ageBands, m.pillar)
  );
  const toddlerSims = SIMULATION_MODULES.filter(
    (m) => !m.isBabyTool && matchesFilters(m.ageBands, m.pillar)
  );

  return (
    <div className="tab-stack">
      <section className="ed-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Topik Utama · Simulasi Terarah</span>
            <h1>Simulasi & Alat Stimulasi</h1>
            <p className="muted-copy">
              Setiap modul dirancang sebagai alat bantu stimulasi didampingi orang tua — bukan sekadar layar pasif.
            </p>
          </div>
          <button type="button" className="sticker-pill" onClick={onOpenStickerAlbum}>
            <IconStar size={16} filled />
            <span className="tabular">{stickersCount}/10 Stiker</span>
          </button>
        </div>

        <div className="filter-bar">
          <div className="chip-row">
            <button
              type="button"
              className={`pill-btn ${!onlyAgeMatch ? 'is-active' : ''}`}
              onClick={() => setOnlyAgeMatch(false)}
            >
              Semua Usia (15)
            </button>
            <button
              type="button"
              className={`pill-btn ${onlyAgeMatch ? 'is-active' : ''}`}
              onClick={() => setOnlyAgeMatch(true)}
            >
              Cocok untuk {phaseMeta?.shortLabel ?? activeBand}
            </button>
          </div>

          <div className="chip-row">
            {PILLAR_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`pill-btn subtle ${pillarFilter === f.id ? 'is-active' : ''}`}
                onClick={() => setPillarFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="sim-section">
        <div className="sim-section-head">
          <div>
            <h2>Alat Bantu Bayi (0–12 Bulan)</h2>
            <p className="muted-copy">
              Bebas batas timer anak — alat bantu visual kontras, stopwatch tummy time, dan pengantar tidur.
            </p>
          </div>
        </div>

        {babyTools.length === 0 ? (
          <div className="ed-card empty-inline">
            Tidak ada modul 0–12 bulan yang cocok dengan filter saat ini.{' '}
            <button
              type="button"
              className="text-action-btn"
              onClick={() => {
                setOnlyAgeMatch(false);
                setPillarFilter('all');
              }}
            >
              Tampilkan semua
            </button>
          </div>
        ) : (
          <div className="sim-grid">
            {babyTools.map((mod) => (
              <article
                key={mod.key}
                className="sim-card"
                style={{ '--sim-tint': mod.surfaceTint } as React.CSSProperties}
              >
                <div className="sim-card-top">
                  <span className="pillar-chip">{PILLAR_LABELS[mod.pillar]}</span>
                  <span className="age-chip">{mod.ageTag}</span>
                </div>
                <h3>{mod.title}</h3>
                <p className="sim-subtitle">{mod.subtitle}</p>
                <div className="sim-card-foot">
                  <span className="goal-tag">Tujuan: {mod.goalLabel}</span>
                  <button
                    type="button"
                    className="btn-primary-calm small"
                    onClick={() => onLaunchSimulation(mod.key)}
                  >
                    Buka Alat →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="sim-section">
        <div className="sim-section-head">
          <div>
            <h2>Simulasi & Game Tumbuh Kembang (1–5 Tahun)</h2>
            <p className="muted-copy">
              12 simulasi interaktif terukur dengan batas waktu harian untuk menjaga porsi layar balita.
            </p>
          </div>
        </div>

        {isGameTimeUp && (
          <div className="ed-card limit-notice" role="status">
            <div>
              <strong>Batas main layar hari ini selesai</strong>
              <p>
                Tab Orang Tua, Catatan, Tips, dan Alat Bantu Bayi tetap aktif. Anda bisa memberi waktu tambahan bila perlu.
              </p>
            </div>
            <button type="button" className="btn-outline" onClick={onOpenTimeLimitReset}>
              Atur / Reset Timer
            </button>
          </div>
        )}

        {toddlerSims.length === 0 ? (
          <div className="ed-card empty-inline">
            Tidak ada simulasi 1–5 tahun yang cocok dengan filter saat ini.{' '}
            <button
              type="button"
              className="text-action-btn"
              onClick={() => {
                setOnlyAgeMatch(false);
                setPillarFilter('all');
              }}
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="sim-grid">
            {toddlerSims.map((mod) => {
              const locked = isModuleLockedByLimit(mod.isBabyTool, isGameTimeUp);
              return (
                <article
                  key={mod.key}
                  className={`sim-card ${locked ? 'is-locked' : ''}`}
                  style={{ '--sim-tint': mod.surfaceTint } as React.CSSProperties}
                >
                  <div className="sim-card-top">
                    <span className="pillar-chip">{PILLAR_LABELS[mod.pillar]}</span>
                    <span className="age-chip">{mod.ageTag}</span>
                  </div>
                  <h3>{mod.title}</h3>
                  <p className="sim-subtitle">{mod.subtitle}</p>
                  <div className="sim-card-foot">
                    <span className="goal-tag">Tujuan: {mod.goalLabel}</span>
                    {locked ? (
                      <button type="button" className="btn-outline small" onClick={onOpenTimeLimitReset}>
                        <IconLock size={14} /> Terkunci
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary-calm small"
                        onClick={() => onLaunchSimulation(mod.key)}
                      >
                        Mulai Simulasi →
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
