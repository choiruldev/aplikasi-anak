import { useMemo, useState, type JSX } from 'react';
import { IconCheck, IconDownload, IconShare, IconStar } from '../components/Art.tsx';
import { KmsWhoChart } from '../components/KmsWhoChart.tsx';
import { KpspRadarChart, type PillarScore } from '../components/KpspRadarChart.tsx';
import {
  CareIcon,
  EmptyStateIllustration,
  MoodIcon,
  PillarIcon,
  SyringeIcon
} from '../components/ModuleIcons.tsx';
import { ShareCardModal } from '../components/ShareCardModal.tsx';
import { IMMUNIZATION_SCHEDULE } from '../data/immunizationData.ts';
import { evaluateKpspAnswers, getNearestKpspCheckpoint, KPSP_CHECKPOINTS } from '../data/kpspData.ts';
import {
  AGE_PHASES,
  MILESTONES,
  PILLAR_LABELS,
  SIMULATION_MODULES,
  type SimulationKey
} from '../data/stimulationData.ts';
import {
  type BabyCareData,
  type BabyCareType,
  formatElapsedShort,
  getTodayCareSummary
} from '../lib/babyCareStorage.ts';
import { buildCalendarIcs, computeTargetDateFromBirth } from '../lib/calendarIcs.ts';
import { shouldSuggestBackup } from '../lib/backup.ts';
import type { AgeBand, AgeInfo, StimulationPillar } from '../lib/development.ts';
import { buildDoctorReportPdfBytes } from '../lib/doctorReport.ts';
import { getDefaultMonthsForBand } from '../lib/growthReference.ts';
import {
  formatJournalSummary,
  type JournalData,
  type KpspStatus,
  type NoteMood
} from '../lib/journalStorage.ts';
import { computePillarBalance } from '../lib/stats.ts';
import { todayKey, type ChildGender, type DailyProgress } from '../lib/storage.ts';
import { evaluateChildGrowthWho } from '../lib/whoGrowth.ts';

interface Props {
  childName: string;
  gender: ChildGender;
  birthDate?: string;
  ageLabel: string;
  ageInfo: AgeInfo | null;
  activeBand: AgeBand;
  progress: DailyProgress;
  stickersCount: number;
  streakDays: number;
  journal: JournalData;
  babyCare: BabyCareData;
  onToggleMilestone: (milestoneId: string) => void;
  onToggleImmunization: (vaccineId: string) => void;
  onAddGrowth: (input: {
    date: string;
    weightKg?: number;
    heightCm?: number;
    headCircumferenceCm?: number;
    note?: string;
  }) => void;
  onDeleteGrowth: (id: string) => void;
  onAddKpspResult: (input: {
    date: string;
    checkpointMonths: number;
    yesCount: number;
    totalCount: number;
    status: KpspStatus;
    weakPillars: StimulationPillar[];
  }) => void;
  onAddNote: (input: { date: string; mood: NoteMood; text: string; tags?: string[] }) => void;
  onDeleteNote: (id: string) => void;
  onAddBabyCare: (type: BabyCareType) => void;
  onDeleteBabyCare: (id: string) => void;
  onOpenSimulation: (key: SimulationKey) => void;
  lastBackupDate: string | null;
  onExportBackup: () => void;
}

type SectionView = 'growth' | 'kpsp' | 'milestone' | 'immunization' | 'notes';
type MilestoneFilter = 'all' | 'pending' | 'done';

const MOOD_OPTIONS: Array<{ id: NoteMood; label: string }> = [
  { id: 'happy', label: 'Ceria' },
  { id: 'calm', label: 'Tenang' },
  { id: 'fussy', label: 'Rewel' }
];

const QUICK_TAGS = ['Motorik', 'Bicara', 'Makan', 'Tidur', 'Sosial'];

export function CatatanTab({
  childName,
  gender,
  birthDate,
  ageLabel,
  ageInfo,
  activeBand,
  progress,
  stickersCount,
  streakDays,
  journal,
  babyCare,
  onToggleMilestone,
  onToggleImmunization,
  onAddGrowth,
  onDeleteGrowth,
  onAddKpspResult,
  onAddNote,
  onDeleteNote,
  onAddBabyCare,
  onDeleteBabyCare,
  onOpenSimulation,
  lastBackupDate,
  onExportBackup
}: Props): JSX.Element {
  const monthsForRef = ageInfo?.months ?? getDefaultMonthsForBand(activeBand);
  const defaultCheckpoint = getNearestKpspCheckpoint(monthsForRef);

  const [section, setSection] = useState<SectionView>('growth');
  const [milestoneBand, setMilestoneBand] = useState<AgeBand>(activeBand);
  const [milestoneFilter, setMilestoneFilter] = useState<MilestoneFilter>('all');
  const [chartMetric, setChartMetric] = useState<'weightKg' | 'heightCm' | 'headCircumferenceCm'>('weightKg');
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [kpspWarning, setKpspWarning] = useState<string | null>(null);

  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [headInput, setHeadInput] = useState('');
  const [growthDate, setGrowthDate] = useState(todayKey());
  const [growthNote, setGrowthNote] = useState('');

  const [kpspMonths, setKpspMonths] = useState<number>(defaultCheckpoint.months);
  const [kpspAnswers, setKpspAnswers] = useState<Record<string, boolean>>({});

  const [mood, setMood] = useState<NoteMood>('happy');
  const [noteDate, setNoteDate] = useState(todayKey());
  const [noteText, setNoteText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const activePhase = AGE_PHASES.find((p) => p.id === activeBand);
  const milestonePhaseList = MILESTONES.filter((m) => m.ageBand === milestoneBand);
  const achievedInActiveBand = MILESTONES.filter(
    (m) => m.ageBand === activeBand && journal.milestoneStatus[m.id]?.checked
  ).length;
  const totalInActiveBand = MILESTONES.filter((m) => m.ageBand === activeBand).length;

  const filteredMilestones = milestonePhaseList.filter((m) => {
    const checked = Boolean(journal.milestoneStatus[m.id]?.checked);
    if (milestoneFilter === 'done') return checked;
    if (milestoneFilter === 'pending') return !checked;
    return true;
  });

  const isBabyPhase = activeBand === '0-3m' || activeBand === '3-6m' || activeBand === '6-12m';
  const [showBabyLogger, setShowBabyLogger] = useState(isBabyPhase);
  const careSummary = getTodayCareSummary(babyCare, todayKey());

  const latestGrowth = journal.growthLogs[0];
  const whoEval = evaluateChildGrowthWho({
    gender,
    months: monthsForRef,
    weightKg: latestGrowth?.weightKg,
    heightCm: latestGrowth?.heightCm,
    headCircumferenceCm: latestGrowth?.headCircumferenceCm
  });

  const pillarBalance = computePillarBalance(progress, journal, activeBand);

  const summaryText = formatJournalSummary({
    childName,
    ageLabel,
    phaseLabel: activePhase?.label ?? activeBand,
    achievedCount: achievedInActiveBand,
    totalPhaseMilestones: totalInActiveBand,
    latestGrowth,
    recentNotes: journal.dailyNotes
  });

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadPdfReport = () => {
    const lines: string[] = [
      `Fase Usia: ${activePhase?.label ?? activeBand}`,
      `Milestone Tercapai: ${achievedInActiveBand}/${totalInActiveBand} | Stiker: ${stickersCount}/14`,
      `Imunisasi Selesai: ${Object.keys(journal.completedImmunizations).length}/${IMMUNIZATION_SCHEDULE.length}`
    ];
    if (latestGrowth) {
      lines.push(
        `Pengukuran Terakhir (${latestGrowth.date}): BB ${latestGrowth.weightKg ?? '-'} kg | TB ${latestGrowth.heightCm ?? '-'} cm | LK ${latestGrowth.headCircumferenceCm ?? '-'} cm`
      );
    }
    if (whoEval.wfa) lines.push(`Analisa WHO ${whoEval.wfa.label}: Z=${whoEval.wfa.zScore} SD (${whoEval.wfa.status})`);
    if (whoEval.hfa) lines.push(`Analisa WHO ${whoEval.hfa.label}: Z=${whoEval.hfa.zScore} SD (${whoEval.hfa.status})`);
    if (whoEval.wfh) lines.push(`Analisa WHO ${whoEval.wfh.label}: Z=${whoEval.wfh.zScore} SD (${whoEval.wfh.status})`);
    if (whoEval.hcfa) lines.push(`Analisa WHO ${whoEval.hcfa.label}: Z=${whoEval.hcfa.zScore} SD (${whoEval.hcfa.status})`);

    const latestKpsp = journal.kpspResults[0];
    if (latestKpsp) {
      lines.push(
        `Skrining KPSP ${latestKpsp.checkpointMonths} bln (${latestKpsp.date}): ${latestKpsp.status.toUpperCase()} (${latestKpsp.yesCount}/${latestKpsp.totalCount} Ya)`
      );
    }
    for (const g of journal.growthLogs.slice(0, 5)) {
      lines.push(`- [${g.date}] BB: ${g.weightKg ?? '-'} kg | TB: ${g.heightCm ?? '-'} cm | LK: ${g.headCircumferenceCm ?? '-'} cm`);
    }

    const bytes = buildDoctorReportPdfBytes({
      childName,
      ageLabel,
      genderLabel: gender === 'girl' ? 'Perempuan' : 'Laki-laki',
      generatedDate: todayKey(),
      summaryLines: lines
    });
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-cilukba-${childName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadIcsReminder = (title: string, dateIso: string, desc: string) => {
    const ics = buildCalendarIcs({ title, dateIso, description: desc });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pengingat-cilukba-${dateIso}.ics`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleGrowthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedW = weightInput.trim() ? Number(weightInput.replace(',', '.')) : undefined;
    const parsedH = heightInput.trim() ? Number(heightInput.replace(',', '.')) : undefined;
    const parsedHead = headInput.trim() ? Number(headInput.replace(',', '.')) : undefined;
    if (
      (parsedW === undefined || !(parsedW > 0)) &&
      (parsedH === undefined || !(parsedH > 0)) &&
      (parsedHead === undefined || !(parsedHead > 0))
    ) {
      return;
    }
    onAddGrowth({
      date: growthDate,
      weightKg: parsedW && parsedW > 0 ? parsedW : undefined,
      heightCm: parsedH && parsedH > 0 ? parsedH : undefined,
      headCircumferenceCm: parsedHead && parsedHead > 0 ? parsedHead : undefined,
      note: growthNote.trim() || undefined
    });
    setWeightInput('');
    setHeightInput('');
    setHeadInput('');
    setGrowthNote('');
  };

  const activeKpspCp =
    KPSP_CHECKPOINTS.find((c) => c.months === kpspMonths) ?? KPSP_CHECKPOINTS[0];

  const answeredKpspCount = activeKpspCp.questions.filter(
    (q) => typeof kpspAnswers[q.id] === 'boolean'
  ).length;

  const kpspPillarScores: PillarScore[] = useMemo(() => {
    const pillars: StimulationPillar[] = ['motor-kasar', 'motor-halus', 'bahasa', 'kognitif'];
    return pillars.map((pillar) => {
      const qs = activeKpspCp.questions.filter((q) => q.pillar === pillar);
      const yes = qs.filter((q) => kpspAnswers[q.id] === true).length;
      const total = Math.max(1, qs.length);
      return { pillar, yes, total: qs.length, percent: Math.round((yes / total) * 100) };
    });
  }, [activeKpspCp, kpspAnswers]);

  const handleSaveKpsp = () => {
    if (answeredKpspCount < activeKpspCp.questions.length) {
      setKpspWarning(
        `Masih ada ${activeKpspCp.questions.length - answeredKpspCount} pertanyaan belum dijawab. Lengkapi dulu ya agar analisa KPSP akurat.`
      );
      return;
    }
    setKpspWarning(null);
    const ansArray = activeKpspCp.questions.map((q) => Boolean(kpspAnswers[q.id]));
    const evaluated = evaluateKpspAnswers(activeKpspCp.months, ansArray);
    onAddKpspResult({
      date: todayKey(),
      checkpointMonths: activeKpspCp.months,
      yesCount: evaluated.yesCount,
      totalCount: evaluated.totalCount,
      status: evaluated.status,
      weakPillars: evaluated.weakPillars
    });
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddNote({ date: noteDate, mood, text: noteText, tags: selectedTags });
    setNoteText('');
    setSelectedTags([]);
  };

  const toggleNoteTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const immunizationsDone = IMMUNIZATION_SCHEDULE.filter((i) =>
    Boolean(journal.completedImmunizations[i.id])
  ).length;
  const latestKpsp = journal.kpspResults[0];
  const totalSavedRecords =
    journal.growthLogs.length + journal.dailyNotes.length + journal.kpspResults.length;
  const showBackupHint = shouldSuggestBackup(totalSavedRecords, lastBackupDate);

  return (
    <div className="tab-stack">
      {showBackupHint && (
        <div className="backup-reminder-bar" role="status">
          <span>Amankan catatan si kecil ke file cadangan lokal.</span>
          <button type="button" className="btn-outline small" onClick={onExportBackup}>
            Cadangkan JSON
          </button>
        </div>
      )}
      {/* Header Metrics & Actions */}
      <section className="ed-card">
        <div className="cat-head-row">
          <div>
            <h1>Tumbuh & Analisa · {childName}</h1>
            <span className="muted-mini">
              {ageLabel} · {gender === 'girl' ? 'Perempuan' : 'Laki-laki'}
            </span>
          </div>
          <div className="cat-export-actions">
            <button type="button" className="btn-primary-calm small" onClick={handleDownloadPdfReport}>
              <IconDownload size={14} /> PDF Dokter
            </button>
            <button type="button" className="btn-outline small" onClick={() => setShareModalOpen(true)}>
              <IconShare size={14} /> Kartu WA
            </button>
            <button type="button" className="btn-outline small" onClick={handleCopySummary}>
              {copied ? '✓ Tersalin' : 'Salin'}
            </button>
          </div>
        </div>

        <div className="cat-metric-strip">
          <div className="cat-metric-pill">
            <IconCheck size={16} />
            <div>
              <strong className="tabular">{achievedInActiveBand}/{totalInActiveBand}</strong>
              <span>Milestone</span>
            </div>
          </div>
          <div className="cat-metric-pill">
            <IconStar size={16} />
            <div>
              <strong className="tabular">
                {latestKpsp ? `${latestKpsp.yesCount}/${latestKpsp.totalCount}` : 'Belum'}
              </strong>
              <span>KPSP</span>
            </div>
          </div>
          <div className="cat-metric-pill">
            <SyringeIcon size={16} />
            <div>
              <strong className="tabular">{immunizationsDone}/{IMMUNIZATION_SCHEDULE.length}</strong>
              <span>Imunisasi</span>
            </div>
          </div>
        </div>

        {(isBabyPhase || showBabyLogger) && (
          <div className="baby-care-bar">
            <div className="baby-care-head">
              <span className="eyebrow">Log Bayi Hari Ini</span>
              {!isBabyPhase && (
                <button type="button" className="text-action-btn" onClick={() => setShowBabyLogger(false)}>
                  Tutup
                </button>
              )}
            </div>
            <div className="baby-care-grid">
              <button type="button" className="baby-care-btn" onClick={() => onAddBabyCare('feed')}>
                <CareIcon type="feed" size={18} />
                <div>
                  <strong>+ ASI/Susu ({careSummary.feedCount})</strong>
                  <span>{careSummary.lastFeed ? formatElapsedShort(careSummary.lastFeed.timestamp) : 'Belum'}</span>
                </div>
              </button>
              <button type="button" className="baby-care-btn" onClick={() => onAddBabyCare('sleep')}>
                <CareIcon type="sleep" size={18} />
                <div>
                  <strong>+ Tidur ({careSummary.sleepCount})</strong>
                  <span>{careSummary.lastSleep ? formatElapsedShort(careSummary.lastSleep.timestamp) : 'Belum'}</span>
                </div>
              </button>
              <button type="button" className="baby-care-btn" onClick={() => onAddBabyCare('diaper')}>
                <CareIcon type="diaper" size={18} />
                <div>
                  <strong>+ Popok ({careSummary.diaperCount})</strong>
                  <span>{careSummary.lastDiaper ? formatElapsedShort(careSummary.lastDiaper.timestamp) : 'Belum'}</span>
                </div>
              </button>
            </div>
            {babyCare.entries.length > 0 && (
              <div className="care-recent-strip">
                {babyCare.entries.slice(0, 3).map((e) => (
                  <span key={e.id} className="care-chip">
                    {e.type === 'feed' ? 'ASI' : e.type === 'sleep' ? 'Tidur' : 'Popok'} · {formatElapsedShort(e.timestamp)}
                    <button type="button" onClick={() => onDeleteBabyCare(e.id)} aria-label="Hapus log">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {!isBabyPhase && !showBabyLogger && (
          <button type="button" className="text-action-btn" onClick={() => setShowBabyLogger(true)}>
            + Log ASI/Tidur/Popok
          </button>
        )}

        <div className="segmented-tabs segmented-5" role="tablist" aria-label="Bagian analisa">
          {(
            [
              ['growth', 'Analisa'],
              ['kpsp', 'KPSP'],
              ['milestone', 'Milestone'],
              ['immunization', 'Imunisasi'],
              ['notes', 'Harian']
            ] as Array<[SectionView, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={section === id}
              className={`seg-tab ${section === id ? 'is-active' : ''}`}
              onClick={() => setSection(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Section 1: WHO Z-Score Growth Analysis + Curve + Head Circumference */}
      {section === 'growth' && (
        <section className="ed-card">
          <div className="section-head-compact">
            <h2>Analisa Kurva WHO</h2>
            <div className="chip-row">
              <button
                type="button"
                className={`pill-btn small ${chartMetric === 'weightKg' ? 'is-active' : ''}`}
                onClick={() => setChartMetric('weightKg')}
              >
                Berat
              </button>
              <button
                type="button"
                className={`pill-btn small ${chartMetric === 'heightCm' ? 'is-active' : ''}`}
                onClick={() => setChartMetric('heightCm')}
              >
                Tinggi
              </button>
              <button
                type="button"
                className={`pill-btn small ${chartMetric === 'headCircumferenceCm' ? 'is-active' : ''}`}
                onClick={() => setChartMetric('headCircumferenceCm')}
              >
                L. Kepala
              </button>
            </div>
          </div>

          {/* WHO Z-Score Summary Badges */}
          {(whoEval.wfa || whoEval.hfa || whoEval.wfh || whoEval.hcfa) && (
            <div className="who-eval-grid">
              {[whoEval.wfa, whoEval.hfa, whoEval.wfh, whoEval.hcfa]
                .filter((x): x is NonNullable<typeof x> => Boolean(x))
                .map((item) => (
                  <div key={item.indicator} className={`who-stat-card tone-${item.tone}`}>
                    <span className="who-stat-label">{item.label}</span>
                    <strong>{item.status}</strong>
                    <span className="tabular">Z: {item.zScore > 0 ? `+${item.zScore}` : item.zScore} SD</span>
                  </div>
                ))}
            </div>
          )}

          <KmsWhoChart
            gender={gender}
            metric={chartMetric}
            currentMonths={monthsForRef}
            birthDate={birthDate}
            entries={journal.growthLogs}
          />

          <form className="growth-form" onSubmit={handleGrowthSubmit}>
            <div className="form-grid-4">
              <label className="field-label">
                Tanggal
                <input type="date" max={todayKey()} value={growthDate} onChange={(e) => setGrowthDate(e.target.value)} required />
              </label>
              <label className="field-label">
                Berat (kg)
                <input type="number" step="0.1" min="1" max="40" placeholder="9.6" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} />
              </label>
              <label className="field-label">
                Tinggi (cm)
                <input type="number" step="0.5" min="35" max="140" placeholder="76" value={heightInput} onChange={(e) => setHeightInput(e.target.value)} />
              </label>
              <label className="field-label">
                L. Kepala (cm)
                <input type="number" step="0.1" min="25" max="65" placeholder="46" value={headInput} onChange={(e) => setHeadInput(e.target.value)} />
              </label>
            </div>
            <div className="form-row-submit">
              <input type="text" placeholder="Catatan ukur (opsional)" maxLength={120} value={growthNote} onChange={(e) => setGrowthNote(e.target.value)} />
              <button type="submit" className="btn-primary-calm small">Simpan</button>
            </div>
          </form>

          {journal.growthLogs.length > 0 && (
            <div className="history-list">
              {journal.growthLogs.map((g) => (
                <div key={g.id} className="history-row">
                  <div>
                    <strong className="tabular">
                      {[
                        g.weightKg !== undefined ? `${g.weightKg} kg` : '',
                        g.heightCm !== undefined ? `${g.heightCm} cm` : '',
                        g.headCircumferenceCm !== undefined ? `LK ${g.headCircumferenceCm} cm` : ''
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </strong>
                    <span className="muted-mini">{g.date}{g.note ? ` — ${g.note}` : ''}</span>
                  </div>
                  <button type="button" className="text-action-btn danger" onClick={() => onDeleteGrowth(g.id)}>
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Section 2: Periodic KPSP Developmental Screening */}
      {section === 'kpsp' && (
        <section className="ed-card">
          <div className="section-head-compact">
            <h2>Skrining KPSP Berkala</h2>
            <span className="pill-badge">{activeKpspCp.label}</span>
          </div>

          <div className="chip-row" style={{ marginBottom: '12px' }}>
            {KPSP_CHECKPOINTS.map((cp) => (
              <button
                key={cp.months}
                type="button"
                className={`pill-btn small ${kpspMonths === cp.months ? 'is-active' : ''}`}
                onClick={() => setKpspMonths(cp.months)}
              >
                {cp.months}m
              </button>
            ))}
          </div>

          {latestKpsp && (
            <div className={`kpsp-result-banner tone-${latestKpsp.status === 'sesuai' ? 'ok' : latestKpsp.status === 'meragukan' ? 'info' : 'attention'}`}>
              <div>
                <strong>
                  Hasil Terakhir ({latestKpsp.checkpointMonths} bln · {latestKpsp.yesCount}/{latestKpsp.totalCount} Ya):{' '}
                  {latestKpsp.status === 'sesuai'
                    ? 'Sesuai Tahap Usia'
                    : latestKpsp.status === 'meragukan'
                      ? 'Perlu Stimulasi Lanjutan 2 Minggu'
                      : 'Disarankan Konsultasi Dokter'}
                </strong>
                {latestKpsp.weakPillars.length > 0 && (
                  <span>Fokus latihan: {latestKpsp.weakPillars.map((p) => PILLAR_LABELS[p]).join(', ')}</span>
                )}
              </div>
              {latestKpsp.weakPillars.length > 0 && (
                <button
                  type="button"
                  className="btn-outline small"
                  onClick={() => {
                    const target = SIMULATION_MODULES.find((m) => m.pillar === latestKpsp.weakPillars[0]);
                    if (target) onOpenSimulation(target.key);
                  }}
                >
                  Latih Sekarang
                </button>
              )}
            </div>
          )}

          <KpspRadarChart
            scores={kpspPillarScores}
            answeredCount={answeredKpspCount}
            totalCount={activeKpspCp.questions.length}
          />

          <div className="kpsp-question-list">
            {activeKpspCp.questions.map((question, idx) => {
              const val = kpspAnswers[question.id];
              return (
                <div key={question.id} className="kpsp-q-card">
                  <div className="kpsp-q-text">
                    <span className="pill-badge">
                      <PillarIcon pillar={question.pillar} size={12} /> {idx + 1}/10
                    </span>
                    <p>{question.text}</p>
                  </div>
                  <div className="kpsp-yn-row">
                    <button
                      type="button"
                      className={`pill-btn small ${val === true ? 'is-active' : ''}`}
                      onClick={() => {
                        setKpspWarning(null);
                        setKpspAnswers((p) => ({ ...p, [question.id]: true }));
                      }}
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      className={`pill-btn small ${val === false ? 'is-danger-active' : ''}`}
                      onClick={() => {
                        setKpspWarning(null);
                        setKpspAnswers((p) => ({ ...p, [question.id]: false }));
                      }}
                    >
                      Belum
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {kpspWarning && (
            <p className="kpsp-warn-note" role="alert">
              {kpspWarning}
            </p>
          )}

          <button
            type="button"
            className="btn-primary-calm"
            style={{ marginTop: '12px', width: '100%' }}
            onClick={handleSaveKpsp}
          >
            Simpan & Analisa Skrining ({answeredKpspCount}/{activeKpspCp.questions.length})
          </button>
          <p className="muted-mini" style={{ marginTop: '8px' }}>
            Acuan edukatif KPSP/KIA Kemenkes. Bukan pengganti evaluasi medis langsung dokter anak.
          </p>
        </section>
      )}

      {/* Section 3: Milestone */}
      {section === 'milestone' && (
        <section className="ed-card">
          <div className="chip-row" role="group" aria-label="Filter fase milestone">
            {AGE_PHASES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`pill-btn small ${milestoneBand === p.id ? 'is-active' : ''}`}
                onClick={() => setMilestoneBand(p.id)}
              >
                {p.shortLabel}
              </button>
            ))}
          </div>

          <div className="chip-row" style={{ marginTop: '8px' }}>
            {(['all', 'pending', 'done'] as MilestoneFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                className={`pill-btn small ${milestoneFilter === f ? 'is-active' : ''}`}
                onClick={() => setMilestoneFilter(f)}
              >
                {f === 'all' ? 'Semua' : f === 'pending' ? 'Belum' : 'Tercapai'}
              </button>
            ))}
          </div>

          <div className="milestone-list">
            {filteredMilestones.map((ms) => {
              const rec = journal.milestoneStatus[ms.id];
              const checked = Boolean(rec?.checked);
              return (
                <label key={ms.id} className={`milestone-row ${checked ? 'is-checked' : ''}`}>
                  <input type="checkbox" checked={checked} onChange={() => onToggleMilestone(ms.id)} />
                  <div className="milestone-content">
                    <strong>{ms.text}</strong>
                    <span className="milestone-meta">
                      <PillarIcon pillar={ms.pillar} size={13} /> {PILLAR_LABELS[ms.pillar]}
                      {checked && rec?.achievedAt ? ` · ${rec.achievedAt}` : ''}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 4: Immunization + ICS Reminder */}
      {section === 'immunization' && (
        <section className="ed-card">
          <div className="section-head-compact">
            <h2>Imunisasi & Vit A</h2>
            <span className="pill-badge tabular">{immunizationsDone}/{IMMUNIZATION_SCHEDULE.length}</span>
          </div>
          <div className="milestone-list">
            {IMMUNIZATION_SCHEDULE.map((imm) => {
              const dateDone = journal.completedImmunizations[imm.id];
              const checked = Boolean(dateDone);
              return (
                <div key={imm.id} className={`milestone-row ${checked ? 'is-checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    aria-label={imm.name}
                    onChange={() => onToggleImmunization(imm.id)}
                  />
                  <div className="milestone-content" style={{ flex: 1 }}>
                    <strong>{imm.name}</strong>
                    <span className="milestone-meta">
                      {imm.ageLabel} · {imm.note}
                      {dateDone ? ` · ✓ ${dateDone}` : ''}
                    </span>
                  </div>
                  {!checked && (
                    <button
                      type="button"
                      className="btn-outline small"
                      onClick={() => {
                        const targetIso = computeTargetDateFromBirth(
                          birthDate,
                          imm.dueMonths,
                          todayKey()
                        );
                        handleDownloadIcsReminder(
                          `${imm.name} (${childName})`,
                          targetIso,
                          `Jadwal ${imm.name} (${imm.ageLabel}): ${imm.note}`
                        );
                      }}
                    >
                      + Kalender
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 5: Daily Notes */}
      {section === 'notes' && (
        <section className="ed-card">
          <form className="notes-form" onSubmit={handleNoteSubmit}>
            <div className="mood-row">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`pill-btn small ${mood === opt.id ? 'is-active' : ''}`}
                  onClick={() => setMood(opt.id)}
                >
                  <MoodIcon mood={opt.id} size={15} /> {opt.label}
                </button>
              ))}
              <input
                type="date"
                max={todayKey()}
                value={noteDate}
                onChange={(e) => setNoteDate(e.target.value)}
                aria-label="Tanggal catatan"
              />
            </div>

            <div className="chip-row">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`pill-btn small ${selectedTags.includes(tag) ? 'is-active' : ''}`}
                  onClick={() => toggleNoteTag(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              maxLength={280}
              placeholder="Tulis momen kecil hari ini..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button type="submit" className="btn-primary-calm small">Simpan Momen</button>
          </form>

          {journal.dailyNotes.length > 0 ? (
            <div className="history-list">
              {journal.dailyNotes.map((n) => (
                <article key={n.id} className="note-card">
                  <div className="note-card-head">
                    <span className="note-mood-badge">
                      <MoodIcon mood={n.mood} size={14} />{' '}
                      {MOOD_OPTIONS.find((m) => m.id === n.mood)?.label}
                    </span>
                    <div className="note-card-right">
                      <span className="muted-mini">{n.date}</span>
                      <button type="button" className="text-action-btn danger" onClick={() => onDeleteNote(n.id)}>
                        Hapus
                      </button>
                    </div>
                  </div>
                  <p>{n.text}</p>
                  {n.tags && n.tags.length > 0 && (
                    <div className="note-tags-row">
                      {n.tags.map((t) => (
                        <span key={t} className="pill-badge">#{t}</span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state-inline" style={{ marginTop: '14px' }}>
              <EmptyStateIllustration size={46} />
              <p className="muted-mini">Belum ada catatan harian tersimpan.</p>
            </div>
          )}
        </section>
      )}
      <ShareCardModal
        open={shareModalOpen}
        cardParams={{
          childName,
          ageLabel,
          phaseLabel: activePhase?.shortLabel ?? activeBand,
          achievedCount: achievedInActiveBand,
          totalMilestones: totalInActiveBand,
          stickersCount,
          streakDays,
          whoSummary: whoEval.wfa?.status,
          kpspSummary: latestKpsp ? `${latestKpsp.yesCount}/${latestKpsp.totalCount} Ya` : undefined,
          pillarPercents: pillarBalance.map((p) => ({
            label: PILLAR_LABELS[p.pillar],
            percent: p.percent
          })),
          dateLabel: todayKey()
        }}
        shareText={summaryText}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
