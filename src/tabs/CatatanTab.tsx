import { useState, type JSX } from 'react';
import { IconCheck, IconDownload, IconShare, IconStar } from '../components/Art.tsx';
import {
  CareIcon,
  MoodIcon,
  PillarIcon,
  SyringeIcon
} from '../components/ModuleIcons.tsx';
import { IMMUNIZATION_SCHEDULE } from '../data/immunizationData.ts';
import { AGE_PHASES, MILESTONES, PILLAR_LABELS } from '../data/stimulationData.ts';
import {
  type BabyCareData,
  type BabyCareType,
  formatElapsedShort,
  getTodayCareSummary
} from '../lib/babyCareStorage.ts';
import type { AgeBand, AgeInfo } from '../lib/development.ts';
import {
  buildSparklinePoints,
  getDefaultMonthsForBand,
  getGrowthReferenceForMonths
} from '../lib/growthReference.ts';
import {
  formatJournalSummary,
  type JournalData,
  type NoteMood
} from '../lib/journalStorage.ts';
import { buildWhatsAppShareUrl, generateMilestoneCardPng } from '../lib/shareCard.ts';
import { todayKey } from '../lib/storage.ts';

interface Props {
  childName: string;
  ageLabel: string;
  ageInfo: AgeInfo | null;
  activeBand: AgeBand;
  stickersCount: number;
  streakDays: number;
  journal: JournalData;
  babyCare: BabyCareData;
  onToggleMilestone: (milestoneId: string) => void;
  onToggleImmunization: (vaccineId: string) => void;
  onAddGrowth: (input: { date: string; weightKg?: number; heightCm?: number; note?: string }) => void;
  onDeleteGrowth: (id: string) => void;
  onAddNote: (input: { date: string; mood: NoteMood; text: string; tags?: string[] }) => void;
  onDeleteNote: (id: string) => void;
  onAddBabyCare: (type: BabyCareType) => void;
  onDeleteBabyCare: (id: string) => void;
}

type SectionView = 'milestone' | 'growth' | 'immunization' | 'notes';
type MilestoneFilter = 'all' | 'pending' | 'done';

const MOOD_OPTIONS: Array<{ id: NoteMood; label: string }> = [
  { id: 'happy', label: 'Ceria' },
  { id: 'calm', label: 'Tenang' },
  { id: 'fussy', label: 'Rewel' }
];

const QUICK_TAGS = ['Motorik', 'Bicara', 'Makan', 'Tidur', 'Sosial'];

export function CatatanTab({
  childName,
  ageLabel,
  ageInfo,
  activeBand,
  stickersCount,
  streakDays,
  journal,
  babyCare,
  onToggleMilestone,
  onToggleImmunization,
  onAddGrowth,
  onDeleteGrowth,
  onAddNote,
  onDeleteNote,
  onAddBabyCare,
  onDeleteBabyCare
}: Props): JSX.Element {
  const [section, setSection] = useState<SectionView>('milestone');
  const [milestoneBand, setMilestoneBand] = useState<AgeBand>(activeBand);
  const [milestoneFilter, setMilestoneFilter] = useState<MilestoneFilter>('all');
  const [chartMetric, setChartMetric] = useState<'weightKg' | 'heightCm'>('weightKg');
  const [copied, setCopied] = useState(false);

  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [growthDate, setGrowthDate] = useState(todayKey());
  const [growthNote, setGrowthNote] = useState('');

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

  const monthsForRef = ageInfo?.months ?? getDefaultMonthsForBand(activeBand);
  const refBand = getGrowthReferenceForMonths(monthsForRef);
  const chartSeries = buildSparklinePoints(
    journal.growthLogs,
    chartMetric,
    260,
    92,
    chartMetric === 'weightKg'
      ? { min: refBand.weightMinKg, max: refBand.weightMaxKg }
      : { min: refBand.heightMinCm, max: refBand.heightMaxCm }
  );

  const summaryText = formatJournalSummary({
    childName,
    ageLabel,
    phaseLabel: activePhase?.label ?? activeBand,
    achievedCount: achievedInActiveBand,
    totalPhaseMilestones: totalInActiveBand,
    latestGrowth: journal.growthLogs[0],
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

  const handleDownloadCard = async () => {
    const blob = await generateMilestoneCardPng({
      childName,
      ageLabel,
      phaseLabel: activePhase?.shortLabel ?? activeBand,
      achievedCount: achievedInActiveBand,
      totalMilestones: totalInActiveBand,
      stickersCount,
      streakDays
    });
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cilukba-${childName.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleGrowthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedW = weightInput.trim() ? Number(weightInput.replace(',', '.')) : undefined;
    const parsedH = heightInput.trim() ? Number(heightInput.replace(',', '.')) : undefined;
    if ((parsedW === undefined || !(parsedW > 0)) && (parsedH === undefined || !(parsedH > 0))) {
      return;
    }
    onAddGrowth({
      date: growthDate,
      weightKg: parsedW && parsedW > 0 ? parsedW : undefined,
      heightCm: parsedH && parsedH > 0 ? parsedH : undefined,
      note: growthNote.trim() || undefined
    });
    setWeightInput('');
    setHeightInput('');
    setGrowthNote('');
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

  return (
    <div className="tab-stack">
      {/* Compact Visual Metrics & Quick Share */}
      <section className="ed-card">
        <div className="cat-head-row">
          <div>
            <h1>Catatan {childName}</h1>
            <span className="muted-mini">{ageLabel} · {activePhase?.shortLabel}</span>
          </div>
          <div className="cat-export-actions">
            <button
              type="button"
              className="btn-outline small"
              onClick={handleCopySummary}
              aria-label="Salin ringkasan"
            >
              <IconShare size={14} /> {copied ? 'Tersalin' : 'Salin'}
            </button>
            <a
              className="btn-outline small"
              href={buildWhatsAppShareUrl(summaryText)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bagikan ke WhatsApp"
            >
              WA
            </a>
            <button
              type="button"
              className="btn-outline small"
              onClick={handleDownloadCard}
              aria-label="Unduh kartu PNG"
            >
              <IconDownload size={14} /> PNG
            </button>
          </div>
        </div>

        {/* 3 Visual Metric Pills */}
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
              <strong className="tabular">{stickersCount}/14</strong>
              <span>Stiker</span>
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

        {/* 0-12m Baby Care Quick Logger */}
        {(isBabyPhase || showBabyLogger) && (
          <div className="baby-care-bar">
            <div className="baby-care-head">
              <span className="eyebrow">Log Bayi Hari Ini</span>
              {!isBabyPhase && (
                <button
                  type="button"
                  className="text-action-btn"
                  onClick={() => setShowBabyLogger(false)}
                >
                  Sembunyikan
                </button>
              )}
            </div>
            <div className="baby-care-grid">
              <button
                type="button"
                className="baby-care-btn"
                onClick={() => onAddBabyCare('feed')}
              >
                <CareIcon type="feed" size={18} />
                <div>
                  <strong>+ ASI/Susu ({careSummary.feedCount})</strong>
                  <span>
                    {careSummary.lastFeed ? formatElapsedShort(careSummary.lastFeed.timestamp) : 'Belum'}
                  </span>
                </div>
              </button>
              <button
                type="button"
                className="baby-care-btn"
                onClick={() => onAddBabyCare('sleep')}
              >
                <CareIcon type="sleep" size={18} />
                <div>
                  <strong>+ Tidur ({careSummary.sleepCount})</strong>
                  <span>
                    {careSummary.lastSleep ? formatElapsedShort(careSummary.lastSleep.timestamp) : 'Belum'}
                  </span>
                </div>
              </button>
              <button
                type="button"
                className="baby-care-btn"
                onClick={() => onAddBabyCare('diaper')}
              >
                <CareIcon type="diaper" size={18} />
                <div>
                  <strong>+ Popok ({careSummary.diaperCount})</strong>
                  <span>
                    {careSummary.lastDiaper ? formatElapsedShort(careSummary.lastDiaper.timestamp) : 'Belum'}
                  </span>
                </div>
              </button>
            </div>
            {babyCare.entries.length > 0 && (
              <div className="care-recent-strip">
                {babyCare.entries.slice(0, 3).map((e) => (
                  <span key={e.id} className="care-chip">
                    {e.type === 'feed' ? 'ASI' : e.type === 'sleep' ? 'Tidur' : 'Popok'} · {formatElapsedShort(e.timestamp)}
                    <button
                      type="button"
                      onClick={() => onDeleteBabyCare(e.id)}
                      aria-label="Hapus log bayi"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {!isBabyPhase && !showBabyLogger && (
          <button
            type="button"
            className="text-action-btn"
            onClick={() => setShowBabyLogger(true)}
          >
            + Tampilkan Log Bayi 0–12m
          </button>
        )}

        {/* Section Switcher */}
        <div className="segmented-tabs" role="tablist" aria-label="Bagian catatan">
          <button
            type="button"
            role="tab"
            aria-selected={section === 'milestone'}
            className={`seg-tab ${section === 'milestone' ? 'is-active' : ''}`}
            onClick={() => setSection('milestone')}
          >
            Milestone
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={section === 'growth'}
            className={`seg-tab ${section === 'growth' ? 'is-active' : ''}`}
            onClick={() => setSection('growth')}
          >
            Tumbuh
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={section === 'immunization'}
            className={`seg-tab ${section === 'immunization' ? 'is-active' : ''}`}
            onClick={() => setSection('immunization')}
          >
            Imunisasi
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={section === 'notes'}
            className={`seg-tab ${section === 'notes' ? 'is-active' : ''}`}
            onClick={() => setSection('notes')}
          >
            Harian
          </button>
        </div>
      </section>

      {/* Section 1: Milestone */}
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
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleMilestone(ms.id)}
                  />
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

      {/* Section 2: Growth + SVG Chart */}
      {section === 'growth' && (
        <section className="ed-card">
          <div className="section-head-compact">
            <h2>Kurva Berat & Tinggi</h2>
            <div className="chip-row">
              <button
                type="button"
                className={`pill-btn small ${chartMetric === 'weightKg' ? 'is-active' : ''}`}
                onClick={() => setChartMetric('weightKg')}
              >
                Berat (kg)
              </button>
              <button
                type="button"
                className={`pill-btn small ${chartMetric === 'heightCm' ? 'is-active' : ''}`}
                onClick={() => setChartMetric('heightCm')}
              >
                Tinggi (cm)
              </button>
            </div>
          </div>

          <div className="growth-chart-box">
            {chartSeries.points.length > 0 ? (
              <svg viewBox="0 0 260 92" className="growth-svg" role="img" aria-label="Grafik pertumbuhan anak">
                {chartSeries.bandTopY !== undefined && chartSeries.bandBottomY !== undefined && (
                  <rect
                    x="12"
                    y={Math.min(chartSeries.bandTopY, chartSeries.bandBottomY)}
                    width="236"
                    height={Math.max(8, Math.abs(chartSeries.bandBottomY - chartSeries.bandTopY))}
                    fill="var(--sage-soft)"
                    rx="4"
                  />
                )}
                {chartSeries.points.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="var(--sage)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartSeries.polyline}
                  />
                )}
                {chartSeries.points.map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r="4.5" fill="var(--amber)" stroke="var(--sage)" strokeWidth="2" />
                    <text x={pt.x} y={Math.max(11, pt.y - 7)} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--ink)">
                      {pt.value}
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <p className="muted-mini">Isi data di bawah untuk melihat grafik.</p>
            )}
            <span className="growth-ref-note">
              Rentang umum usia {refBand.label}:{' '}
              {chartMetric === 'weightKg'
                ? `${refBand.weightMinKg}–${refBand.weightMaxKg} kg`
                : `${refBand.heightMinCm}–${refBand.heightMaxCm} cm`}{' '}
              (non-diagnostik)
            </span>
          </div>

          <form className="growth-form" onSubmit={handleGrowthSubmit}>
            <div className="form-grid-3">
              <label className="field-label">
                Tanggal
                <input
                  type="date"
                  max={todayKey()}
                  value={growthDate}
                  onChange={(e) => setGrowthDate(e.target.value)}
                  required
                />
              </label>
              <label className="field-label">
                Berat (kg)
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="40"
                  placeholder="9.4"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                />
              </label>
              <label className="field-label">
                Tinggi (cm)
                <input
                  type="number"
                  step="0.5"
                  min="35"
                  max="140"
                  placeholder="76"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                />
              </label>
            </div>
            <div className="form-row-submit">
              <input
                type="text"
                placeholder="Catatan singkat (opsional)"
                maxLength={120}
                value={growthNote}
                onChange={(e) => setGrowthNote(e.target.value)}
              />
              <button type="submit" className="btn-primary-calm small">
                Simpan
              </button>
            </div>
          </form>

          {journal.growthLogs.length > 0 && (
            <div className="history-list">
              {journal.growthLogs.map((g) => (
                <div key={g.id} className="history-row">
                  <div>
                    <strong className="tabular">
                      {g.weightKg !== undefined ? `${g.weightKg} kg` : ''}
                      {g.weightKg !== undefined && g.heightCm !== undefined ? ' · ' : ''}
                      {g.heightCm !== undefined ? `${g.heightCm} cm` : ''}
                    </strong>
                    <span className="muted-mini">
                      {g.date}{g.note ? ` — ${g.note}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="text-action-btn danger"
                    onClick={() => onDeleteGrowth(g.id)}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Section 3: Immunization Checklist */}
      {section === 'immunization' && (
        <section className="ed-card">
          <div className="section-head-compact">
            <h2>Imunisasi & Vit A</h2>
            <span className="pill-badge tabular">
              {immunizationsDone}/{IMMUNIZATION_SCHEDULE.length}
            </span>
          </div>
          <div className="milestone-list">
            {IMMUNIZATION_SCHEDULE.map((imm) => {
              const dateDone = journal.completedImmunizations[imm.id];
              const checked = Boolean(dateDone);
              return (
                <label key={imm.id} className={`milestone-row ${checked ? 'is-checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleImmunization(imm.id)}
                  />
                  <div className="milestone-content">
                    <strong>{imm.name}</strong>
                    <span className="milestone-meta">
                      {imm.ageLabel} · {imm.note}
                      {dateDone ? ` · ✓ ${dateDone}` : ''}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {/* Section 4: Daily Notes with Mood Icons & Tags */}
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
            <button type="submit" className="btn-primary-calm small">
              Simpan Momen
            </button>
          </form>

          {journal.dailyNotes.length > 0 && (
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
                      <button
                        type="button"
                        className="text-action-btn danger"
                        onClick={() => onDeleteNote(n.id)}
                      >
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
          )}
        </section>
      )}
    </div>
  );
}
