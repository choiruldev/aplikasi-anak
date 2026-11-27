import { useState, type JSX } from 'react';
import {
  Check,
  ChevronRight,
  Flame,
  Play,
  Share2,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Moon
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CilukbaMascot2D } from '../components/CilukbaMascot2D.tsx';
import { LottieSparkleBadge } from '../components/LottieSparkleBadge.tsx';
import {
  AvatarIcon,
  PillarIcon,
  SimulationIcon
} from '../components/ModuleIcons.tsx';
import { ShareCardModal } from '../components/ShareCardModal.tsx';
import { DAILY_ROUTINES, ROUTINE_SLOT_LABELS } from '../data/routineData.ts';
import {
  AGE_PHASES,
  MILESTONES,
  PILLAR_LABELS,
  SIMULATION_MODULES,
  STIMULATION_MISSIONS,
  type SimulationKey
} from '../data/stimulationData.ts';
import { generateChildInsights } from '../lib/analytics.ts';
import type { BabyCareData } from '../lib/babyCareStorage.ts';
import { fireCelebrationBurst, triggerHaptic } from '../lib/confetti.ts';
import type { AgeBand, AgeInfo } from '../lib/development.ts';
import { getDefaultMonthsForBand } from '../lib/growthReference.ts';
import type { JournalData } from '../lib/journalStorage.ts';
import type { ProfileAvatarId } from '../lib/profilesStorage.ts';
import { computePillarBalance } from '../lib/stats.ts';
import { todayKey, type ChildGender, type DailyProgress } from '../lib/storage.ts';

interface Props {
  childName: string;
  gender: ChildGender;
  avatarId: ProfileAvatarId;
  ageInfo: AgeInfo | null;
  activeBand: AgeBand;
  streakDays: number;
  nightMode?: boolean;
  onSelectBand: (band: AgeBand) => void;
  progress: DailyProgress;
  babyCare: BabyCareData;
  onToggleMission: (missionId: string) => void;
  onToggleRoutine: (routineId: string) => void;
  journal: JournalData;
  onOpenSimulation: (key: SimulationKey) => void;
  onOpenProfile: () => void;
  onOpenTabCatatan: () => void;
}

function getGreetingInfo(): { label: string; period: 'morning' | 'day' | 'evening' | 'night' } {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return { label: 'Selamat Pagi', period: 'morning' };
  if (hour >= 11 && hour < 15) return { label: 'Selamat Siang', period: 'day' };
  if (hour >= 15 && hour < 19) return { label: 'Selamat Sore', period: 'evening' };
  return { label: 'Selamat Malam', period: 'night' };
}

const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 360, damping: 28 };

export function StimulasiTab({
  childName,
  gender,
  avatarId,
  ageInfo,
  activeBand,
  streakDays,
  nightMode = false,
  onSelectBand,
  progress,
  babyCare,
  onToggleMission,
  onToggleRoutine,
  journal,
  onOpenSimulation,
  onOpenProfile,
  onOpenTabCatatan
}: Props): JSX.Element {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAllMissions, setShowAllMissions] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const today = todayKey();
  const greeting = getGreetingInfo();
  const activePhase = AGE_PHASES.find((p) => p.id === activeBand) ?? AGE_PHASES[3];
  const missions = STIMULATION_MISSIONS.filter((m) => m.ageBand === activeBand);
  const doneCount = missions.filter((m) => progress.completedMissions.includes(m.id)).length;
  const missionPct = missions.length > 0 ? Math.round((doneCount / missions.length) * 100) : 0;

  const phaseMilestones = MILESTONES.filter((m) => m.ageBand === activeBand);
  const milestoneDone = phaseMilestones.filter((m) => journal.milestoneStatus[m.id]?.checked).length;

  const routines = DAILY_ROUTINES.filter((r) => r.ageBands.includes(activeBand));
  const doneRoutines = journal.completedRoutineIds[today] ?? [];
  const pillarBalance = computePillarBalance(progress, journal, activeBand);

  const months = ageInfo?.months ?? getDefaultMonthsForBand(activeBand);
  const insights = generateChildInsights({
    childName,
    gender,
    months,
    ageBand: activeBand,
    journal,
    progress,
    babyCare
  });

  const visibleMissions = showAllMissions ? missions : missions.slice(0, 3);

  const ringRadius = 22;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - missionPct / 100);

  const handleMissionCheck = (missionId: string) => {
    const alreadyDone = progress.completedMissions.includes(missionId);
    triggerHaptic(alreadyDone ? 'tap' : 'success');
    if (!alreadyDone && doneCount + 1 >= missions.length && missions.length > 0) {
      fireCelebrationBurst();
    }
    onToggleMission(missionId);
  };

  const GreetingIcon =
    greeting.period === 'morning'
      ? Sunrise
      : greeting.period === 'day'
        ? Sun
        : greeting.period === 'evening'
          ? Sunset
          : Moon;

  return (
    <div className="tab-stack home-modern-stack">
      {/* 1. Living Hero Banner with 2D Interactive Mascot */}
      <motion.section
        className="ed-card hero-card home-hero-premium"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="home-hero-top">
          <div className="home-hero-left">
            <CilukbaMascot2D
              childName={childName}
              isNight={nightMode || greeting.period === 'night'}
              size={84}
            />
            <div className="home-hero-copy">
              <span className="home-greeting-pill">
                <GreetingIcon size={13} strokeWidth={2.3} />
                {greeting.label}
              </span>
              <h1>Halo, {childName}!</h1>
              <button type="button" className="home-profile-subbtn" onClick={onOpenProfile}>
                <AvatarIcon avatarId={avatarId} size={18} />
                <span>
                  {ageInfo ? `${ageInfo.label} · ` : ''}
                  {gender === 'girl' ? 'Perempuan' : 'Laki-laki'} · {activePhase.shortLabel}
                </span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="home-hero-stats">
            <span className={`streak-pill ${streakDays > 0 ? 'is-lit' : ''}`} title="Streak aktif harian">
              <Flame size={15} strokeWidth={2.4} /> {streakDays}h
            </span>

            <div className="hero-ring-pill" aria-label={`${doneCount} dari ${missions.length} misi`}>
              <svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
                <circle cx="27" cy="27" r={ringRadius} fill="none" stroke="var(--line)" strokeWidth="5" />
                <motion.circle
                  cx="27"
                  cy="27"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--sage)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={ringCirc}
                  initial={false}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  transform="rotate(-90 27 27)"
                />
              </svg>
              <strong className="tabular">{doneCount}/{missions.length}</strong>
            </div>

            {missionPct === 100 && missions.length > 0 && (
              <LottieSparkleBadge size={44} className="hero-lottie-reward" />
            )}
          </div>
        </div>

        {/* Phase selector with smooth sliding Motion layoutId indicator */}
        <div className="phase-pills-scroll home-phase-bar" role="tablist" aria-label="Pilih rentang usia">
          {AGE_PHASES.map((phase) => {
            const active = phase.id === activeBand;
            return (
              <button
                key={phase.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`pill-btn home-phase-pill ${active ? 'is-active' : ''}`}
                onClick={() => onSelectBand(phase.id)}
              >
                {active && (
                  <motion.span
                    layoutId="home-active-phase-bg"
                    className="home-phase-pill-bg"
                    transition={SPRING_SNAPPY}
                    aria-hidden="true"
                  />
                )}
                <span className="home-phase-pill-text">{phase.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* 2. Featured Spotlight: Ruang Main Anak */}
      <motion.section
        className="ed-card launch-child-card home-spotlight-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
      >
        <div className="launch-child-left">
          <motion.div
            className="home-spotlight-icon-box"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SimulationIcon moduleKey={insights.recommendedSim.key} size={50} />
          </motion.div>
          <div>
            <span className="eyebrow home-spotlight-eyebrow">
              <Sparkles size={12} strokeWidth={2.4} />
              {insights.priorityPillar ? `Fokus ${PILLAR_LABELS[insights.priorityPillar]}` : 'Rekomendasi Hari Ini'}
            </span>
            <h2>{insights.recommendedSim.title}</h2>
            <span className="muted-mini">
              {insights.recommendedSim.goalLabel} · {insights.recommendedSim.ageTag}
            </span>
          </div>
        </div>

        <motion.button
          type="button"
          className="btn-primary-calm home-play-cta"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={SPRING_SNAPPY}
          onClick={() => onOpenSimulation(insights.recommendedSim.key)}
        >
          <Play size={16} fill="currentColor" strokeWidth={2} />
          <span>Ruang Main Anak</span>
          <ChevronRight size={16} />
        </motion.button>
      </motion.section>

      {/* 3. Responsive 2-Column Bento Dashboard (Desktop) / 1-Column Airy Stack (Mobile) */}
      <div className="home-bento-grid">
        {/* Left Column: Daily Missions */}
        <motion.section
          className="ed-card home-bento-col"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.1, ease: 'easeOut' }}
        >
          <div className="section-head-compact">
            <div className="home-section-title-group">
              <h2>Misi Hari Ini</h2>
              {doneCount > 0 && doneCount < missions.length && (
                <LottieSparkleBadge size={26} />
              )}
            </div>
            <div className="hero-badges-row">
              <span className="pill-badge tabular">{doneCount}/{missions.length}</span>
              {missions.length > 3 && (
                <button
                  type="button"
                  className="text-action-btn"
                  onClick={() => setShowAllMissions((v) => !v)}
                >
                  {showAllMissions ? 'Ringkas' : 'Semua'}
                </button>
              )}
            </div>
          </div>

          <div className="mission-list">
            {visibleMissions.map((mission) => {
              const done = progress.completedMissions.includes(mission.id);
              const isOpen = expandedId === mission.id;
              const linkedMod = mission.linkedSimulation
                ? SIMULATION_MODULES.find((s) => s.key === mission.linkedSimulation)
                : undefined;

              return (
                <motion.article
                  key={mission.id}
                  layout="position"
                  className={`mission-row-card ${done ? 'is-done' : ''}`}
                >
                  <div className="mission-row-main">
                    <motion.button
                      type="button"
                      className={`mission-check-circle ${done ? 'is-done' : ''}`}
                      onClick={() => handleMissionCheck(mission.id)}
                      whileTap={{ scale: 0.84 }}
                      transition={SPRING_SNAPPY}
                      aria-pressed={done}
                      aria-label={`Tandai ${mission.title} selesai`}
                    >
                      <Check size={16} strokeWidth={3} />
                    </motion.button>

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
                      <motion.button
                        type="button"
                        className="mission-sim-icon-btn"
                        whileTap={{ scale: 0.92 }}
                        onClick={() => onOpenSimulation(linkedMod.key)}
                        aria-label={`Buka ${linkedMod.title}`}
                        title={linkedMod.title}
                      >
                        <SimulationIcon moduleKey={linkedMod.key} size={32} />
                      </motion.button>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="mission-expanded-body"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="muted-copy">{mission.summary}</p>
                        <ol className="mission-steps-list">
                          {mission.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>
        </motion.section>

        {/* Right Column: Smart Insights + Routine & 4-Pillar Balance */}
        <motion.div
          className="home-bento-right-stack"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.14, ease: 'easeOut' }}
        >
          <section className="ed-card home-insight-card">
            <div className="insight-headline-row">
              <strong>{insights.headline}</strong>
              <button type="button" className="text-action-btn" onClick={onOpenTabCatatan}>
                Analisa &amp; KPSP →
              </button>
            </div>
            <div className="insight-pills-row">
              {insights.cards.slice(0, 2).map((card) => (
                <motion.button
                  key={card.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  className={`insight-chip tone-${card.tone}`}
                  onClick={onOpenTabCatatan}
                >
                  <span>{card.title}</span>
                </motion.button>
              ))}
            </div>
          </section>

          <section className="ed-card">
            <div className="section-head-compact">
              <h2>Rutinitas &amp; Keseimbangan</h2>
              <div className="hero-badges-row">
                <motion.button
                  type="button"
                  className="btn-outline small"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShareOpen(true)}
                >
                  <Share2 size={13} /> Kartu WA
                </motion.button>
                <button type="button" className="text-action-btn" onClick={onOpenTabCatatan}>
                  Milestone {milestoneDone}/{phaseMilestones.length} →
                </button>
              </div>
            </div>

            <div className="routine-grid">
              {routines.map((item) => {
                const done = doneRoutines.includes(item.id);
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    className={`routine-chip-card ${done ? 'is-done' : ''}`}
                    onClick={() => {
                      triggerHaptic('tap');
                      onToggleRoutine(item.id);
                    }}
                    aria-pressed={done}
                  >
                    <span className="routine-slot">{ROUTINE_SLOT_LABELS[item.slot]}</span>
                    <strong>{item.title}</strong>
                    <span className="routine-check">{done ? '✓' : '○'}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="pillar-balance-grid" style={{ marginTop: '12px' }}>
              {pillarBalance.map((item) => (
                <div key={item.pillar} className="pillar-mini-tile">
                  <div className="pillar-mini-top">
                    <PillarIcon pillar={item.pillar} size={15} />
                    <span>{PILLAR_LABELS[item.pillar].split(' ')[0]}</span>
                    <strong className="tabular">{item.percent}%</strong>
                  </div>
                  <div className="linear-track thin" aria-hidden="true">
                    <motion.div
                      className="linear-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>

      <ShareCardModal
        open={shareOpen}
        cardParams={{
          childName,
          ageLabel: ageInfo?.label ?? activePhase.rangeLabel,
          phaseLabel: activePhase.shortLabel,
          achievedCount: milestoneDone,
          totalMilestones: phaseMilestones.length,
          stickersCount: progress.stickers.length,
          streakDays,
          whoSummary: insights.cards.find((c) => c.id === 'who-wfa')?.title.split('·')[1]?.trim(),
          pillarPercents: pillarBalance.map((p) => ({
            label: PILLAR_LABELS[p.pillar],
            percent: p.percent
          })),
          dateLabel: today
        }}
        shareText={`Pencapaian ${childName} (${ageInfo?.label ?? activePhase.shortLabel}) di Cilukba: Milestone ${milestoneDone}/${phaseMilestones.length}, Stiker ${progress.stickers.length}/14, Streak ${streakDays} hari!`}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
