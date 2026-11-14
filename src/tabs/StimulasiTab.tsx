import { useState, type JSX } from 'react';
import { IconCheck } from '../components/Art.tsx';
import {
  AvatarIcon,
  FlameIcon,
  PillarIcon,
  SimulationIcon
} from '../components/ModuleIcons.tsx';
import {
  AGE_PHASES,
  MILESTONES,
  PILLAR_LABELS,
  SIMULATION_MODULES,
  STIMULATION_MISSIONS,
  type SimulationKey
} from '../data/stimulationData.ts';
import { DAILY_ROUTINES, ROUTINE_SLOT_LABELS } from '../data/routineData.ts';
import type { AgeBand, AgeInfo } from '../lib/development.ts';
import type { JournalData } from '../lib/journalStorage.ts';
import type { ProfileAvatarId } from '../lib/profilesStorage.ts';
import { computePillarBalance } from '../lib/stats.ts';
import type { DailyProgress } from '../lib/storage.ts';
import { todayKey } from '../lib/storage.ts';

interface Props {
  childName: string;
  avatarId: ProfileAvatarId;
  ageInfo: AgeInfo | null;
  activeBand: AgeBand;
  streakDays: number;
  onSelectBand: (band: AgeBand) => void;
  progress: DailyProgress;
  onToggleMission: (missionId: string) => void;
  onToggleRoutine: (routineId: string) => void;
  journal: JournalData;
  onOpenSimulation: (key: SimulationKey) => void;
  onOpenProfile: () => void;
  onOpenTabCatatan: () => void;
}

export function StimulasiTab({
  childName,
  avatarId,
  ageInfo,
  activeBand,
  streakDays,
  onSelectBand,
  progress,
  onToggleMission,
  onToggleRoutine,
  journal,
  onOpenSimulation,
  onOpenProfile,
  onOpenTabCatatan
}: Props): JSX.Element {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const today = todayKey();
  const activePhase = AGE_PHASES.find((p) => p.id === activeBand) ?? AGE_PHASES[3];
  const missions = STIMULATION_MISSIONS.filter((m) => m.ageBand === activeBand);
  const doneCount = missions.filter((m) => progress.completedMissions.includes(m.id)).length;
  const missionPct = missions.length > 0 ? Math.round((doneCount / missions.length) * 100) : 0;

  const phaseMilestones = MILESTONES.filter((m) => m.ageBand === activeBand);
  const milestoneDone = phaseMilestones.filter((m) => journal.milestoneStatus[m.id]?.checked).length;

  const routines = DAILY_ROUTINES.filter((r) => r.ageBands.includes(activeBand));
  const doneRoutines = journal.completedRoutineIds[today] ?? [];
  const pillarBalance = computePillarBalance(progress, journal, activeBand);

  const ringRadius = 22;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - missionPct / 100);

  return (
    <div className="tab-stack">
      {/* Compact Visual Hero */}
      <section className="ed-card hero-card">
        <div className="hero-compact-row">
          <button type="button" className="hero-identity-btn" onClick={onOpenProfile}>
            <AvatarIcon avatarId={avatarId} size={42} />
            <div className="hero-identity-copy">
              <h1>Halo, {childName}</h1>
              <span>{ageInfo ? `${ageInfo.label} · ` : ''}{activePhase.shortLabel}</span>
            </div>
          </button>

          <div className="hero-badges-row">
            <span className={`streak-pill ${streakDays > 0 ? 'is-lit' : ''}`} title="Streak aktif">
              <FlameIcon size={15} /> {streakDays}h
            </span>
            <div className="hero-ring-pill" aria-label={`${doneCount} dari ${missions.length} misi`}>
              <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
                <circle cx="26" cy="26" r={ringRadius} fill="none" stroke="var(--line)" strokeWidth="5" />
                <circle
                  cx="26"
                  cy="26"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--sage)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={ringCirc}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 26 26)"
                />
              </svg>
              <strong className="tabular">{doneCount}/{missions.length}</strong>
            </div>
          </div>
        </div>

        {/* Phase Switcher */}
        <div className="phase-pills-scroll" role="tablist" aria-label="Pilih rentang usia">
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

      {/* Daily Missions */}
      <section className="ed-card">
        <div className="section-head-compact">
          <h2>Misi Hari Ini</h2>
          <span className="pill-badge tabular">{doneCount}/{missions.length}</span>
        </div>

        <div className="mission-list">
          {missions.map((mission) => {
            const done = progress.completedMissions.includes(mission.id);
            const isOpen = expandedId === mission.id;
            const linkedMod = mission.linkedSimulation
              ? SIMULATION_MODULES.find((s) => s.key === mission.linkedSimulation)
              : undefined;

            return (
              <article key={mission.id} className={`mission-row-card ${done ? 'is-done' : ''}`}>
                <div className="mission-row-main">
                  <button
                    type="button"
                    className={`mission-check-circle ${done ? 'is-done' : ''}`}
                    onClick={() => onToggleMission(mission.id)}
                    aria-pressed={done}
                    aria-label={`Tandai ${mission.title} selesai`}
                  >
                    <IconCheck size={16} />
                  </button>

                  <div className="mission-pillar-badge" aria-hidden="true">
                    <PillarIcon pillar={mission.pillar} size={18} />
                  </div>

                  <button
                    type="button"
                    className="mission-info-btn"
                    onClick={() => setExpandedId(isOpen ? null : mission.id)}
                    aria-expanded={isOpen}
                  >
                    <strong>{mission.title}</strong>
                    <span className="mission-mini-meta">
                      {PILLAR_LABELS[mission.pillar]} · {mission.durationLabel}
                    </span>
                  </button>

                  {linkedMod && (
                    <button
                      type="button"
                      className="mission-sim-icon-btn"
                      onClick={() => onOpenSimulation(linkedMod.key)}
                      aria-label={`Buka ${linkedMod.title}`}
                      title={linkedMod.title}
                    >
                      <SimulationIcon moduleKey={linkedMod.key} size={32} />
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="mission-expanded-body">
                    <p className="muted-copy">{mission.summary}</p>
                    <ol className="mission-steps-list">
                      {mission.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Daily Routine Pills */}
      <section className="ed-card">
        <div className="section-head-compact">
          <h2>Rutinitas Harian</h2>
          <span className="pill-badge tabular">
            {routines.filter((r) => doneRoutines.includes(r.id)).length}/{routines.length}
          </span>
        </div>
        <div className="routine-grid">
          {routines.map((item) => {
            const done = doneRoutines.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={`routine-chip-card ${done ? 'is-done' : ''}`}
                onClick={() => onToggleRoutine(item.id)}
                aria-pressed={done}
              >
                <span className="routine-slot">{ROUTINE_SLOT_LABELS[item.slot]}</span>
                <strong>{item.title}</strong>
                <span className="routine-check">{done ? '✓' : '○'}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4-Pillar Balance Strip + Milestone Link */}
      <section className="ed-card">
        <div className="section-head-compact">
          <h2>Keseimbangan Aspek</h2>
          <button type="button" className="text-action-btn" onClick={onOpenTabCatatan}>
            Milestone {milestoneDone}/{phaseMilestones.length} →
          </button>
        </div>

        <div className="pillar-balance-grid">
          {pillarBalance.map((item) => (
            <div key={item.pillar} className="pillar-mini-tile">
              <div className="pillar-mini-top">
                <PillarIcon pillar={item.pillar} size={15} />
                <span>{PILLAR_LABELS[item.pillar].split(' ')[0]}</span>
                <strong className="tabular">{item.percent}%</strong>
              </div>
              <div className="linear-track thin" aria-hidden="true">
                <div className="linear-fill" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
