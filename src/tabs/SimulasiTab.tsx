import { useState, type JSX } from 'react';
import { IconLock, IconStar } from '../components/Art.tsx';
import { HeartIcon, PillarIcon, SimulationIcon } from '../components/ModuleIcons.tsx';
import {
  AGE_PHASES,
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
  favoriteModules: string[];
  playCounts: Record<string, number>;
  onToggleFavorite: (key: SimulationKey) => void;
  onOpenStickerAlbum: () => void;
  onLaunchSimulation: (key: SimulationKey) => void;
  onOpenTimeLimitReset: () => void;
}

const PILLAR_FILTERS: Array<{ id: 'all' | StimulationPillar; label: string }> = [
  { id: 'all', label: 'Semua' },
  { id: 'kognitif', label: 'Kognitif' },
  { id: 'motor-halus', label: 'Halus' },
  { id: 'motor-kasar', label: 'Kasar' },
  { id: 'bahasa', label: 'Bahasa' }
];

export function SimulasiTab({
  activeBand,
  isGameTimeUp,
  stickersCount,
  favoriteModules,
  playCounts,
  onToggleFavorite,
  onOpenStickerAlbum,
  onLaunchSimulation,
  onOpenTimeLimitReset
}: Props): JSX.Element {
  const [onlyAgeMatch, setOnlyAgeMatch] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [pillarFilter, setPillarFilter] = useState<'all' | StimulationPillar>('all');

  const phaseMeta = AGE_PHASES.find((p) => p.id === activeBand);
  const ageRecommended = SIMULATION_MODULES.filter((m) => m.ageBands.includes(activeBand)).slice(0, 3);

  const matchesFilters = (key: SimulationKey, ageBands: AgeBand[], pillar: StimulationPillar): boolean => {
    if (onlyAgeMatch && !ageBands.includes(activeBand)) return false;
    if (onlyFavorites && !favoriteModules.includes(key)) return false;
    if (pillarFilter !== 'all' && pillar !== pillarFilter) return false;
    return true;
  };

  const babyTools = SIMULATION_MODULES.filter(
    (m) => m.isBabyTool && matchesFilters(m.key, m.ageBands, m.pillar)
  );
  const toddlerGames = SIMULATION_MODULES.filter(
    (m) => !m.isBabyTool && matchesFilters(m.key, m.ageBands, m.pillar)
  );

  return (
    <div className="tab-stack">
      {/* Compact Header + Filter Controls */}
      <section className="ed-card">
        <div className="sim-head-row">
          <div>
            <h1>Simulasi & Alat</h1>
            <span className="muted-mini">{phaseMeta?.shortLabel ?? '0–5 Thn'}</span>
          </div>
          <button
            type="button"
            className="sticker-album-pill"
            onClick={onOpenStickerAlbum}
            aria-label={`Album Stiker ${stickersCount} dari 14`}
          >
            <IconStar size={16} />
            <span className="tabular">{stickersCount}/14</span>
          </button>
        </div>

        <div className="sim-filter-controls">
          <button
            type="button"
            className={`pill-btn small ${onlyAgeMatch ? 'is-active' : ''}`}
            onClick={() => setOnlyAgeMatch((v) => !v)}
          >
            Sesuai Usia
          </button>
          <button
            type="button"
            className={`pill-btn small ${onlyFavorites ? 'is-active' : ''}`}
            onClick={() => setOnlyFavorites((v) => !v)}
          >
            <HeartIcon size={13} filled={onlyFavorites} /> Favorit ({favoriteModules.length})
          </button>
        </div>

        <div className="chip-row" role="tablist" aria-label="Filter aspek">
          {PILLAR_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={pillarFilter === f.id}
              className={`pill-btn small ${pillarFilter === f.id ? 'is-active' : ''}`}
              onClick={() => setPillarFilter(f.id)}
            >
              {f.id !== 'all' && <PillarIcon pillar={f.id} size={13} />}
              {f.label}
            </button>
          ))}
        </div>

        {isGameTimeUp && (
          <div className="limit-warning-bar" role="status">
            <span>Timer 1–5 thn selesai</span>
            <button type="button" className="btn-outline small" onClick={onOpenTimeLimitReset}>
              Reset
            </button>
          </div>
        )}
      </section>

      {/* Recommended Today Strip */}
      {!onlyFavorites && pillarFilter === 'all' && !onlyAgeMatch && (
        <section className="ed-card">
          <div className="section-head-compact">
            <h2>Cocok Hari Ini</h2>
            <span className="pill-badge">{phaseMeta?.shortLabel}</span>
          </div>
          <div className="spotlight-row">
            {ageRecommended.map((mod) => {
              const locked = isModuleLockedByLimit(mod.isBabyTool, isGameTimeUp);
              return (
                <button
                  key={mod.key}
                  type="button"
                  className={`spotlight-tile ${locked ? 'is-locked' : ''}`}
                  style={{ background: mod.surfaceTint }}
                  onClick={() => onLaunchSimulation(mod.key)}
                >
                  <SimulationIcon moduleKey={mod.key} size={38} />
                  <strong>{mod.title}</strong>
                  <span>{mod.goalLabel}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Baby 0-12m Tools */}
      {babyTools.length > 0 && (
        <section className="sim-group">
          <div className="sim-group-head">
            <h2>Alat Bayi · 0–12 Bln</h2>
            <span className="pill-badge">Bebas Timer</span>
          </div>

          <div className="sim-icon-grid">
            {babyTools.map((mod) => {
              const isFav = favoriteModules.includes(mod.key);
              const count = playCounts[mod.key] ?? 0;
              return (
                <div
                  key={mod.key}
                  className="sim-tile-card"
                  style={{ background: mod.surfaceTint }}
                >
                  <div className="sim-tile-top">
                    <SimulationIcon moduleKey={mod.key} size={42} />
                    <button
                      type="button"
                      className={`fav-icon-btn ${isFav ? 'is-fav' : ''}`}
                      onClick={() => onToggleFavorite(mod.key)}
                      aria-label={isFav ? `Hapus ${mod.title} dari favorit` : `Favoritkan ${mod.title}`}
                    >
                      <HeartIcon size={16} filled={isFav} />
                    </button>
                  </div>

                  <h3>{mod.title}</h3>
                  <p className="sim-tile-sub">{mod.subtitle}</p>

                  <div className="sim-tile-bottom">
                    <span className="sim-age-tag">
                      {mod.ageTag}{count > 0 ? ` · ×${count}` : ''}
                    </span>
                    <button
                      type="button"
                      className="btn-primary-calm small"
                      onClick={() => onLaunchSimulation(mod.key)}
                    >
                      Buka
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Toddler 1-5y Simulations */}
      {toddlerGames.length > 0 && (
        <section className="sim-group">
          <div className="sim-group-head">
            <h2>Permainan · 1–5 Thn</h2>
            <span className="muted-mini">{toddlerGames.length} modul</span>
          </div>

          <div className="sim-icon-grid">
            {toddlerGames.map((mod) => {
              const locked = isModuleLockedByLimit(mod.isBabyTool, isGameTimeUp);
              const isFav = favoriteModules.includes(mod.key);
              const count = playCounts[mod.key] ?? 0;
              return (
                <div
                  key={mod.key}
                  className={`sim-tile-card ${locked ? 'is-locked' : ''}`}
                  style={{ background: mod.surfaceTint }}
                >
                  <div className="sim-tile-top">
                    <SimulationIcon moduleKey={mod.key} size={42} />
                    <button
                      type="button"
                      className={`fav-icon-btn ${isFav ? 'is-fav' : ''}`}
                      onClick={() => onToggleFavorite(mod.key)}
                      aria-label={isFav ? `Hapus ${mod.title} dari favorit` : `Favoritkan ${mod.title}`}
                    >
                      <HeartIcon size={16} filled={isFav} />
                    </button>
                  </div>

                  <h3>{mod.title}</h3>
                  <p className="sim-tile-sub">{mod.subtitle}</p>

                  <div className="sim-tile-bottom">
                    <span className="sim-age-tag">
                      {mod.ageTag}{count > 0 ? ` · ×${count}` : ''}
                    </span>
                    <button
                      type="button"
                      className={locked ? 'btn-outline small' : 'btn-primary-calm small'}
                      onClick={() => onLaunchSimulation(mod.key)}
                      disabled={locked}
                    >
                      {locked ? (
                        <>
                          <IconLock size={13} /> Batas
                        </>
                      ) : (
                        'Main'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {babyTools.length === 0 && toddlerGames.length === 0 && (
        <section className="ed-card empty-state-card">
          <p className="muted-copy">Tidak ada simulasi di filter ini.</p>
          <button
            type="button"
            className="btn-outline small"
            onClick={() => {
              setOnlyAgeMatch(false);
              setOnlyFavorites(false);
              setPillarFilter('all');
            }}
          >
            Reset Filter
          </button>
        </section>
      )}
    </div>
  );
}
