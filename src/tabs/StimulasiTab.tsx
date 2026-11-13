import { useState, type JSX } from 'react';
import { IconCheck } from '../components/Art.tsx';
import {
  AGE_PHASES,
  MILESTONES,
  PILLAR_LABELS,
  SIMULATION_MODULES,
  STIMULATION_MISSIONS,
  type SimulationKey
} from '../data/stimulationData.ts';
import type { AgeBand, AgeInfo } from '../lib/development.ts';
import type { JournalData } from '../lib/journalStorage.ts';

interface Props {
  childName: string;
  ageInfo: AgeInfo | null;
  activeBand: AgeBand;
  onSelectBand: (band: AgeBand) => void;
  completedMissions: string[];
  onToggleMission: (missionId: string) => void;
  journal: JournalData;
  onOpenSimulation: (key: SimulationKey) => void;
  onOpenProfile: () => void;
  onOpenTabCatatan: () => void;
}

export function StimulasiTab({
  childName,
  ageInfo,
  activeBand,
  onSelectBand,
  completedMissions,
  onToggleMission,
  journal,
  onOpenSimulation,
  onOpenProfile,
  onOpenTabCatatan
}: Props): JSX.Element {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activePhase = AGE_PHASES.find((p) => p.id === activeBand) ?? AGE_PHASES[3];
  const missions = STIMULATION_MISSIONS.filter((m) => m.ageBand === activeBand);
  const doneCount = missions.filter((m) => completedMissions.includes(m.id)).length;
  const missionPct = missions.length > 0 ? Math.round((doneCount / missions.length) * 100) : 0;

  const phaseMilestones = MILESTONES.filter((m) => m.ageBand === activeBand);
  const achievedMilestones = phaseMilestones.filter(
    (m) => journal.milestoneStatus[m.id]?.checked
  ).length;

  return (
    <div className="tab-stack">
      <section className="ed-card hero-card">
        <div className="hero-top">
          <div>
            <span className="eyebrow">Pendamping Tumbuh Kembang 0–5 Tahun</span>
            <h1 className="hero-title">Halo, Orang Tua {childName}</h1>
          </div>
          <button type="button" className="age-link-chip" onClick={onOpenProfile}>
            {ageInfo ? `Usia ${ageInfo.label}` : 'Atur tanggal lahir'}
          </button>
        </div>

        <p className="hero-focus">
          <strong>Fokus {activePhase.label}:</strong> {activePhase.focusSummary}
        </p>

        <div className="phase-strip" role="tablist" aria-label="Pilih fase usia">
          {AGE_PHASES.map((phase) => (
            <button
              key={phase.id}
              type="button"
              role="tab"
              aria-selected={phase.id === activeBand}
              className={`pill-btn ${phase.id === activeBand ? 'is-active' : ''}`}
              onClick={() => onSelectBand(phase.id)}
            >
              {phase.shortLabel}
            </button>
          ))}
        </div>
      </section>

      <section className="ed-card">
        <div className="section-head">
          <div>
            <h2>Misi Stimulasi Hari Ini</h2>
            <p className="muted-copy">Panduan praktis harian — centang yang sempat dilakukan hari ini.</p>
          </div>
          <span className="progress-counter tabular">
            {doneCount}/{missions.length} selesai
          </span>
        </div>

        <div className="linear-track" aria-hidden="true">
          <div className="linear-fill" style={{ width: `${missionPct}%` }} />
        </div>

        <div className="mission-list">
          {missions.map((mission) => {
            const checked = completedMissions.includes(mission.id);
            const isExpanded = expandedId === mission.id;
            const linkedModule = mission.linkedSimulation
              ? SIMULATION_MODULES.find((s) => s.key === mission.linkedSimulation)
              : undefined;

            return (
              <article key={mission.id} className={`mission-row ${checked ? 'is-done' : ''}`}>
                <div className="mission-main">
                  <button
                    type="button"
                    className={`check-circle ${checked ? 'is-checked' : ''}`}
                    onClick={() => onToggleMission(mission.id)}
                    aria-pressed={checked}
                    aria-label={checked ? `Batalkan ${mission.title}` : `Tandai selesai ${mission.title}`}
                  >
                    {checked && <IconCheck size={16} />}
                  </button>

                  <div className="mission-body">
                    <div className="chip-row">
                      <span className="pillar-chip">{PILLAR_LABELS[mission.pillar]}</span>
                      <span className="duration-chip">{mission.durationLabel}</span>
                    </div>
                    <h3>{mission.title}</h3>
                    <p>{mission.summary}</p>

                    <div className="mission-actions">
                      <button
                        type="button"
                        className="text-action-btn"
                        onClick={() => setExpandedId(isExpanded ? null : mission.id)}
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? 'Tutup panduan' : 'Lihat langkah'}
                      </button>

                      {linkedModule && (
                        <button
                          type="button"
                          className="btn-inline-accent"
                          onClick={() => onOpenSimulation(linkedModule.key)}
                        >
                          Buka {linkedModule.isBabyTool ? 'Alat' : 'Simulasi'} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <ol className="mission-steps">
                    {mission.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="ed-card snapshot-card">
        <div className="snapshot-row">
          <div>
            <span className="eyebrow">Progres Fase Ini</span>
            <h3>
              {achievedMilestones} dari {phaseMilestones.length} milestone tercapai
            </h3>
            <p className="muted-copy">
              Catat pencapaian baru, berat badan, dan momen harian untuk dokumentasi keluarga.
            </p>
          </div>
          <button type="button" className="btn-outline" onClick={onOpenTabCatatan}>
            Buka Catatan →
          </button>
        </div>
      </section>
    </div>
  );
}
