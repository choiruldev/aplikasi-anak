import { useState, type JSX } from 'react';
import { AGE_PHASES } from '../data/stimulationData.ts';
import { TIP_CATEGORIES, TIPS_DATA, type TipCategory } from '../data/tipsData.ts';

interface Props {
  savedTipIds: string[];
  onToggleSaveTip: (tipId: string) => void;
}

type FilterOption = 'Semua' | 'Disimpan' | TipCategory;

export function TipsTab({ savedTipIds, onToggleSaveTip }: Props): JSX.Element {
  const [filter, setFilter] = useState<FilterOption>('Semua');

  const phaseShort = (id: string) => AGE_PHASES.find((p) => p.id === id)?.shortLabel ?? id;

  const visibleTips = TIPS_DATA.filter((tip) => {
    if (filter === 'Semua') return true;
    if (filter === 'Disimpan') return savedTipIds.includes(tip.id);
    return tip.category === filter;
  });

  const filterPills: FilterOption[] = ['Semua', 'Disimpan', ...TIP_CATEGORIES];

  return (
    <div className="tab-stack">
      <section className="ed-card">
        <span className="eyebrow">Info & Tips Orang Tua Gen Z</span>
        <h1>Panduan Singkat, Berbasis Kebutuhan Nyata</h1>
        <p className="muted-copy">
          Ringkas dibaca di sela mengasuh — simpan kartu yang paling relevan untuk dibaca ulang kapan saja secara offline.
        </p>

        <div className="chip-row tips-filters" role="tablist" aria-label="Filter kategori tips">
          {filterPills.map((opt) => (
            <button
              key={opt}
              type="button"
              role="tab"
              aria-selected={filter === opt}
              className={`pill-btn ${filter === opt ? 'is-active' : ''}`}
              onClick={() => setFilter(opt)}
            >
              {opt === 'Disimpan' ? `Disimpan (${savedTipIds.length})` : opt}
            </button>
          ))}
        </div>
      </section>

      {visibleTips.length === 0 ? (
        <div className="ed-card empty-inline">
          Belum ada tips tersimpan. Ketuk tombol Simpan pada kartu tips di bawah agar mudah diakses kembali.
        </div>
      ) : (
        <div className="tips-grid">
          {visibleTips.map((tip) => {
            const isSaved = savedTipIds.includes(tip.id);
            return (
              <article key={tip.id} className="ed-card tip-card">
                <div className="tip-card-top">
                  <div className="chip-row">
                    <span
                      className={`pillar-chip ${tip.category === 'Tanda Waspada' ? 'is-alert' : ''}`}
                    >
                      {tip.category}
                    </span>
                    <span className="age-chip">
                      {tip.ageBands.map(phaseShort).join(' · ')}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`bookmark-btn ${isSaved ? 'is-saved' : ''}`}
                    onClick={() => onToggleSaveTip(tip.id)}
                    aria-pressed={isSaved}
                  >
                    {isSaved ? 'Tersimpan' : 'Simpan'}
                  </button>
                </div>

                <h2>{tip.title}</h2>
                <p className="tip-hook">{tip.hook}</p>

                <div className="tip-steps-box">
                  <span className="eyebrow">Coba sekarang:</span>
                  <ul>
                    {tip.actionPoints.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <p className="tip-reminder">{tip.reminder}</p>
              </article>
            );
          })}
        </div>
      )}

      <p className="disclaimer-note" role="note">
        Tips disusun sebagai panduan edukatif sehari-hari. Untuk keluhan medis khusus atau keraguan tumbuh kembang, konsultasikan langsung dengan dokter anak / Posyandu.
      </p>
    </div>
  );
}
