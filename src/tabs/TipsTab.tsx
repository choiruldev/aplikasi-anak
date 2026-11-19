import { useState, type JSX } from 'react';
import {
  EmptyStateIllustration,
  HomePlayIcon,
  PillarIcon,
  TipCategoryIcon
} from '../components/ModuleIcons.tsx';
import { MPASI_FOODS, MPASI_STAGES, type MpasiCategory } from '../data/mpasiData.ts';
import { HOME_PLAY_IDEAS } from '../data/routineData.ts';
import { AGE_PHASES, PILLAR_LABELS } from '../data/stimulationData.ts';
import { TIP_CATEGORIES, TIPS_DATA, type TipCategory } from '../data/tipsData.ts';
import type { AgeBand } from '../lib/development.ts';
import type { MpasiFoodStatus } from '../lib/journalStorage.ts';
import { buildWhatsAppShareUrl } from '../lib/shareCard.ts';

interface Props {
  activeBand: AgeBand;
  savedTipIds: string[];
  triedMpasiFoods: Record<string, MpasiFoodStatus>;
  onToggleSaveTip: (tipId: string) => void;
  onToggleMpasiFood: (foodId: string) => void;
}

type FilterOption = 'Semua' | 'Sesuai Usia' | 'MPASI' | 'Bahan Rumah' | 'Disimpan' | TipCategory;

const RED_FLAG_CHECKS = [
  'Belum tersenyum balik atau menoleh ke sumber suara di usia 3–4 bulan',
  'Tubuh sangat kaku/lemas atau kepala belum tegak di usia 5–6 bulan',
  'Belum menoleh saat dipanggil nama atau mengoceh di usia 9–12 bulan',
  'Belum mengucap 1 kata bermakna atau menunjuk di usia 15–18 bulan',
  'Kehilangan kemampuan bicara atau motorik yang sebelumnya sudah bisa'
];

const MPASI_CATS: Array<'Semua' | MpasiCategory> = [
  'Semua',
  'Karbohidrat',
  'Protein Hewani',
  'Protein Nabati',
  'Sayur',
  'Buah',
  'Lemak & Bumbu'
];

export function TipsTab({
  activeBand,
  savedTipIds,
  triedMpasiFoods,
  onToggleSaveTip,
  onToggleMpasiFood
}: Props): JSX.Element {
  const [filter, setFilter] = useState<FilterOption>('Semua');
  const [query, setQuery] = useState('');
  const [mpasiCat, setMpasiCat] = useState<'Semua' | MpasiCategory>('Semua');
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);
  const [redFlagOpen, setRedFlagOpen] = useState(false);

  const phaseShort = (id: string) => AGE_PHASES.find((p) => p.id === id)?.shortLabel ?? id;
  const qLower = query.trim().toLowerCase();

  const visibleTips = TIPS_DATA.filter((tip) => {
    if (filter === 'MPASI' || filter === 'Bahan Rumah') return false;
    if (filter === 'Sesuai Usia' && !tip.ageBands.includes(activeBand)) return false;
    if (filter === 'Disimpan' && !savedTipIds.includes(tip.id)) return false;
    if (TIP_CATEGORIES.includes(filter as TipCategory) && tip.category !== filter) return false;
    if (qLower) {
      const hay = `${tip.title} ${tip.hook} ${tip.category} ${tip.actionPoints.join(' ')}`.toLowerCase();
      if (!hay.includes(qLower)) return false;
    }
    return true;
  });

  const visibleHomeIdeas = HOME_PLAY_IDEAS.filter(
    (idea) => idea.ageBands.includes(activeBand) || filter === 'Bahan Rumah'
  );

  const visibleMpasi = MPASI_FOODS.filter((f) => {
    if (mpasiCat !== 'Semua' && f.category !== mpasiCat) return false;
    if (qLower && !f.name.toLowerCase().includes(qLower)) return false;
    return true;
  });

  const triedCount = Object.keys(triedMpasiFoods).length;

  const filterPills: FilterOption[] = [
    'Semua',
    'Sesuai Usia',
    'MPASI',
    'Bahan Rumah',
    'Disimpan',
    ...TIP_CATEGORIES
  ];

  return (
    <div className="tab-stack">
      <section className="ed-card">
        <div className="tips-head-row">
          <div>
            <h1>Tips & MPASI</h1>
            <span className="muted-mini">{phaseShort(activeBand)} · Rujukan KIA / IDAI / WHO</span>
          </div>
          <button type="button" className="btn-outline small" onClick={() => setRedFlagOpen(true)}>
            Cek Siaga (5)
          </button>
        </div>

        <input
          type="search"
          className="tips-search-input"
          placeholder="Cari topik: GTM, tidur, alergi, layar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Cari tips parenting atau bahan MPASI"
        />

        <div className="chip-row tips-filters" role="tablist" aria-label="Filter tips">
          {filterPills.map((opt) => (
            <button
              key={opt}
              type="button"
              role="tab"
              aria-selected={filter === opt}
              className={`pill-btn small ${filter === opt ? 'is-active' : ''}`}
              onClick={() => setFilter(opt)}
            >
              {opt === 'Bahan Rumah' && <HomePlayIcon size={13} />}
              {TIP_CATEGORIES.includes(opt as TipCategory) && (
                <TipCategoryIcon category={opt as TipCategory} size={13} />
              )}
              {opt === 'Disimpan' ? `Simpan (${savedTipIds.length})` : opt}
            </button>
          ))}
        </div>
      </section>

      {filter === 'MPASI' ? (
        <>
          <section className="ed-card">
            <div className="section-head-compact">
              <h2>Panduan Tekstur MPASI</h2>
              <span className="pill-badge tabular">{triedCount}/{MPASI_FOODS.length} dicoba</span>
            </div>
            <div className="mpasi-stage-grid">
              {MPASI_STAGES.map((st) => (
                <div key={st.id} className="mpasi-stage-card">
                  <strong>{st.ageLabel}</strong>
                  <span>{st.texture}</span>
                  <small>{st.freq}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="ed-card">
            <div className="section-head-compact">
              <h2>Tracker Bahan Pertama</h2>
              <span className="muted-mini">Ketuk 1x Cocok ✓ · 2x Reaksi ⚠</span>
            </div>
            <div className="chip-row" style={{ marginBottom: '10px' }}>
              {MPASI_CATS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`pill-btn small ${mpasiCat === cat ? 'is-active' : ''}`}
                  onClick={() => setMpasiCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="mpasi-foods-grid">
              {visibleMpasi.map((food) => {
                const st = triedMpasiFoods[food.id];
                return (
                  <button
                    key={food.id}
                    type="button"
                    className={`mpasi-food-chip ${st === 'ok' ? 'is-ok' : st === 'reaction' ? 'is-reaction' : ''}`}
                    onClick={() => onToggleMpasiFood(food.id)}
                  >
                    <span>{food.name}</span>
                    <strong>{st === 'ok' ? '✓' : st === 'reaction' ? '⚠' : food.isAllergen ? '•' : ''}</strong>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      ) : filter === 'Bahan Rumah' ? (
        <div className="tips-grid">
          {visibleHomeIdeas.map((idea) => (
            <article key={idea.id} className="ed-card tip-card">
              <div className="tip-card-top">
                <span className="pill-badge"><HomePlayIcon size={13} /> Tanpa Layar</span>
                <span className="pill-badge">
                  <PillarIcon pillar={idea.pillar} size={13} /> {PILLAR_LABELS[idea.pillar].split(' ')[0]}
                </span>
              </div>
              <h2>{idea.title}</h2>
              <p className="tip-hook">Bahan: {idea.materials}</p>
              <div className="tip-footer-row">
                <span className="muted-mini">Usia {idea.ageBands.map(phaseShort).join(', ')}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="tips-grid">
          {visibleTips.map((tip) => {
            const saved = savedTipIds.includes(tip.id);
            const isOpen = expandedTipId === tip.id;
            const shareText = `${tip.title}\n${tip.hook}\n\n- ${tip.actionPoints.join('\n- ')}\n(${tip.reminder})`;
            return (
              <article key={tip.id} className="ed-card tip-card">
                <div className="tip-card-top">
                  <span className="pill-badge">
                    <TipCategoryIcon category={tip.category} size={13} /> {tip.category}
                  </span>
                  <div className="tip-top-actions">
                    <a className="text-action-btn" href={buildWhatsAppShareUrl(shareText)} target="_blank" rel="noopener noreferrer">
                      WA
                    </a>
                    <button
                      type="button"
                      className={`save-tip-btn ${saved ? 'is-saved' : ''}`}
                      onClick={() => onToggleSaveTip(tip.id)}
                      aria-pressed={saved}
                    >
                      {saved ? 'Tersimpan ★' : 'Simpan ☆'}
                    </button>
                  </div>
                </div>

                <h2>{tip.title}</h2>
                <p className="tip-hook">{tip.hook}</p>

                <button
                  type="button"
                  className="text-action-btn"
                  onClick={() => setExpandedTipId(isOpen ? null : tip.id)}
                >
                  {isOpen ? 'Tutup langkah ▲' : 'Lihat 3 langkah ▼'}
                </button>

                {isOpen && (
                  <>
                    <ul className="tip-points">
                      {tip.actionPoints.map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                    <div className="tip-reminder">{tip.reminder}</div>
                  </>
                )}

                <div className="tip-footer-row">
                  <span className="muted-mini">{tip.ageBands.map(phaseShort).join(' · ')}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {filter !== 'MPASI' && filter !== 'Bahan Rumah' && visibleTips.length === 0 && (
        <section className="ed-card empty-state-card">
          <EmptyStateIllustration size={52} />
          <p className="muted-copy">Tidak ada tip yang cocok.</p>
        </section>
      )}

      {redFlagOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Cek Siaga Tumbuh Kembang"
          onClick={(e) => {
            if (e.target === e.currentTarget) setRedFlagOpen(false);
          }}
        >
          <div className="drawer-sheet">
            <div className="drawer-head">
              <div>
                <span className="eyebrow">Skrining Cepat</span>
                <h2>5 Tanda Perlu Konsultasi Dokter</h2>
              </div>
              <button type="button" className="btn-outline small" onClick={() => setRedFlagOpen(false)}>
                Tutup
              </button>
            </div>
            <div className="drawer-body">
              <p className="muted-copy">
                Bukan alat diagnosis. Jika menemui salah satu tanda berikut, konsultasikan ke bidan atau dokter anak:
              </p>
              <ul className="tip-points">
                {RED_FLAG_CHECKS.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
