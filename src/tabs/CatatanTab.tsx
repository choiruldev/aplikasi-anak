import { useState, type JSX } from 'react';
import { IconCheck, IconShare } from '../components/Art.tsx';
import { AGE_PHASES, MILESTONES, PILLAR_LABELS } from '../data/stimulationData.ts';
import type { AgeBand } from '../lib/development.ts';
import {
  formatJournalSummary,
  type JournalData,
  type NoteMood
} from '../lib/journalStorage.ts';
import { todayKey } from '../lib/storage.ts';

interface Props {
  childName: string;
  ageLabel: string;
  activeBand: AgeBand;
  journal: JournalData;
  onToggleMilestone: (milestoneId: string) => void;
  onAddGrowth: (input: { date: string; weightKg?: number; heightCm?: number; note?: string }) => void;
  onDeleteGrowth: (id: string) => void;
  onAddNote: (input: { date: string; mood: NoteMood; text: string }) => void;
  onDeleteNote: (id: string) => void;
}

type SectionView = 'milestone' | 'growth' | 'notes';

const MOOD_OPTIONS: Array<{ id: NoteMood; label: string }> = [
  { id: 'happy', label: 'Senang / Aktif' },
  { id: 'calm', label: 'Tenang' },
  { id: 'fussy', label: 'Agak Rewel' }
];

export function CatatanTab({
  childName,
  ageLabel,
  activeBand,
  journal,
  onToggleMilestone,
  onAddGrowth,
  onDeleteGrowth,
  onAddNote,
  onDeleteNote
}: Props): JSX.Element {
  const [section, setSection] = useState<SectionView>('milestone');
  const [milestoneBand, setMilestoneBand] = useState<AgeBand>(activeBand);
  const [copied, setCopied] = useState(false);

  // Growth form state
  const [growthDate, setGrowthDate] = useState(todayKey);
  const [weightStr, setWeightStr] = useState('');
  const [heightStr, setHeightStr] = useState('');
  const [growthNote, setGrowthNote] = useState('');
  const [growthError, setGrowthError] = useState<string | null>(null);

  // Daily note state
  const [noteDate, setNoteDate] = useState(todayKey);
  const [noteMood, setNoteMood] = useState<NoteMood>('happy');
  const [noteText, setNoteText] = useState('');

  const phaseMeta = AGE_PHASES.find((p) => p.id === milestoneBand) ?? AGE_PHASES[3];
  const phaseMilestones = MILESTONES.filter((m) => m.ageBand === milestoneBand);
  const achievedCount = phaseMilestones.filter(
    (m) => journal.milestoneStatus[m.id]?.checked
  ).length;

  const handleCopySummary = async () => {
    const summary = formatJournalSummary({
      childName,
      ageLabel,
      phaseLabel: phaseMeta.label,
      achievedCount,
      totalPhaseMilestones: phaseMilestones.length,
      latestGrowth: journal.growthLogs[0],
      recentNotes: journal.dailyNotes
    });

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback copy via temporary textarea
      const area = document.createElement('textarea');
      area.value = summary;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleGrowthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = weightStr.trim() ? Number(weightStr.replace(',', '.')) : undefined;
    const h = heightStr.trim() ? Number(heightStr.replace(',', '.')) : undefined;

    if (w === undefined && h === undefined) {
      setGrowthError('Isi minimal berat badan (kg) atau tinggi badan (cm).');
      return;
    }
    if ((w !== undefined && (!Number.isFinite(w) || w <= 0)) || (h !== undefined && (!Number.isFinite(h) || h <= 0))) {
      setGrowthError('Masukkan angka lebih besar dari 0.');
      return;
    }

    onAddGrowth({
      date: growthDate,
      weightKg: w,
      heightCm: h,
      note: growthNote.trim() || undefined
    });
    setWeightStr('');
    setHeightStr('');
    setGrowthNote('');
    setGrowthError(null);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    onAddNote({
      date: noteDate,
      mood: noteMood,
      text: noteText
    });
    setNoteText('');
  };

  return (
    <div className="tab-stack">
      <section className="ed-card">
        <div className="section-head">
          <div>
            <span className="eyebrow">Jurnal Offline-First · {childName}</span>
            <h1>Catatan Perkembangan</h1>
            <p className="muted-copy">
              Pantau milestone tiap fase, ukur berat/tinggi, dan simpan momen harian langsung di perangkat Anda.
            </p>
          </div>
          <button type="button" className="btn-outline" onClick={handleCopySummary}>
            <IconShare size={16} />
            <span>{copied ? 'Tersalin!' : 'Salin Ringkasan'}</span>
          </button>
        </div>

        <div className="segment-bar" role="tablist" aria-label="Bagian catatan">
          <button
            type="button"
            role="tab"
            aria-selected={section === 'milestone'}
            className={`segment-btn ${section === 'milestone' ? 'is-active' : ''}`}
            onClick={() => setSection('milestone')}
          >
            Milestone ({achievedCount}/{phaseMilestones.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={section === 'growth'}
            className={`segment-btn ${section === 'growth' ? 'is-active' : ''}`}
            onClick={() => setSection('growth')}
          >
            Berat & Tinggi ({journal.growthLogs.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={section === 'notes'}
            className={`segment-btn ${section === 'notes' ? 'is-active' : ''}`}
            onClick={() => setSection('notes')}
          >
            Catatan Harian ({journal.dailyNotes.length})
          </button>
        </div>
      </section>

      {section === 'milestone' && (
        <section className="ed-card">
          <div className="phase-strip" role="tablist" aria-label="Fase milestone">
            {AGE_PHASES.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={p.id === milestoneBand}
                className={`pill-btn ${p.id === milestoneBand ? 'is-active' : ''}`}
                onClick={() => setMilestoneBand(p.id)}
              >
                {p.shortLabel}
              </button>
            ))}
          </div>

          <div className="milestone-list">
            {phaseMilestones.map((item) => {
              const rec = journal.milestoneStatus[item.id];
              const checked = rec?.checked ?? false;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`milestone-row ${checked ? 'is-checked' : ''}`}
                  onClick={() => onToggleMilestone(item.id)}
                  aria-pressed={checked}
                >
                  <span className={`check-circle ${checked ? 'is-checked' : ''}`}>
                    {checked && <IconCheck size={16} />}
                  </span>
                  <div className="milestone-text">
                    <span className="pillar-chip">{PILLAR_LABELS[item.pillar]}</span>
                    <p>{item.text}</p>
                    {checked && rec?.achievedAt && (
                      <span className="achieved-badge tabular">Tercapai · {rec.achievedAt}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {section === 'growth' && (
        <section className="ed-card">
          <h2>Catat Berat & Tinggi Badan</h2>
          <form className="compact-form" onSubmit={handleGrowthSubmit}>
            <div className="form-grid-3">
              <label className="field-label">
                Tanggal
                <input
                  type="date"
                  value={growthDate}
                  onChange={(e) => setGrowthDate(e.target.value)}
                  required
                />
              </label>
              <label className="field-label">
                Berat (kg)
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="40"
                  placeholder="misal 7.4"
                  value={weightStr}
                  onChange={(e) => setWeightStr(e.target.value)}
                />
              </label>
              <label className="field-label">
                Tinggi / Panjang (cm)
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="140"
                  placeholder="misal 66.5"
                  value={heightStr}
                  onChange={(e) => setHeightStr(e.target.value)}
                />
              </label>
            </div>
            <label className="field-label">
              Catatan singkat (opsional)
              <input
                type="text"
                maxLength={100}
                placeholder="misal Kontrol Posyandu / imunisasi"
                value={growthNote}
                onChange={(e) => setGrowthNote(e.target.value)}
              />
            </label>
            {growthError && <p className="gate-error">{growthError}</p>}
            <button type="submit" className="btn-primary-calm">
              Simpan Data Pertumbuhan
            </button>
          </form>

          <div className="history-list">
            {journal.growthLogs.length === 0 ? (
              <p className="muted-copy empty-box">
                Belum ada catatan berat atau tinggi. Mulai catat hasil timbang bulanan di atas.
              </p>
            ) : (
              journal.growthLogs.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div>
                    <strong className="tabular">{entry.date}</strong>
                    <div className="history-metrics tabular">
                      {entry.weightKg !== undefined && <span>Berat: {entry.weightKg} kg</span>}
                      {entry.heightCm !== undefined && <span>Tinggi: {entry.heightCm} cm</span>}
                    </div>
                    {entry.note && <p className="muted-copy">{entry.note}</p>}
                  </div>
                  <button
                    type="button"
                    className="delete-link"
                    onClick={() => onDeleteGrowth(entry.id)}
                  >
                    Hapus
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {section === 'notes' && (
        <section className="ed-card">
          <h2>Catatan Momen & Mood Harian</h2>
          <form className="compact-form" onSubmit={handleNoteSubmit}>
            <div className="form-row-split">
              <label className="field-label">
                Tanggal
                <input
                  type="date"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  required
                />
              </label>
              <div className="field-label">
                <span>Suasana hati</span>
                <div className="chip-row">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`pill-btn small ${noteMood === m.id ? 'is-active' : ''}`}
                      onClick={() => setNoteMood(m.id)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label className="field-label">
              Momen atau perkembangan hari ini
              <textarea
                rows={3}
                maxLength={280}
                placeholder="Contoh: Pertama kali tengkurap lama sambil tertawa..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary-calm">
              Simpan Catatan
            </button>
          </form>

          <div className="history-list">
            {journal.dailyNotes.length === 0 ? (
              <p className="muted-copy empty-box">
                Belum ada catatan harian. Simpan kosakata baru, makanan favorit, atau momen pertama anak.
              </p>
            ) : (
              journal.dailyNotes.map((note) => (
                <div key={note.id} className="history-item">
                  <div>
                    <div className="chip-row">
                      <span className="age-chip tabular">{note.date}</span>
                      <span className="pillar-chip">
                        {MOOD_OPTIONS.find((m) => m.id === note.mood)?.label ?? note.mood}
                      </span>
                    </div>
                    <p className="note-body">{note.text}</p>
                  </div>
                  <button
                    type="button"
                    className="delete-link"
                    onClick={() => onDeleteNote(note.id)}
                  >
                    Hapus
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <p className="disclaimer-note" role="note">
        Informasi milestone bersifat edukasi pendamping orang tua dan tidak menggantikan evaluasi tenaga medis / Posyandu / dokter spesialis anak.
      </p>
    </div>
  );
}
