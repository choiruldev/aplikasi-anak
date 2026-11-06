import { type JSX } from 'react';
import { fireConfetti, triggerHaptic } from '../lib/confetti';
import { playGentlePop, playSuccessChime } from '../lib/audio';

interface StickerItem {
  id: string;
  name: string;
  skill: string;
  hint: string;
  bgColor: string;
  borderColor: string;
  iconSvg: JSX.Element;
}

const STICKER_LIST: StickerItem[] = [
  {
    id: 'sticker-sensory',
    name: 'Sapi & Burung Ceria',
    skill: 'Pendengaran & Sensori',
    hint: 'Sentuh 5 suara hewan atau bilah xilofon',
    bgColor: '#FFF0E6',
    borderColor: '#FF9F68',
    iconSvg: (
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        <circle cx="34" cy="34" r="30" fill="#FFE8DC" stroke="#FF9F68" strokeWidth="3" />
        <circle cx="34" cy="36" r="18" fill="#F08A4B" />
        <ellipse cx="28" cy="35" rx="2.5" ry="3.5" fill="#182421" />
        <ellipse cx="40" cy="35" rx="2.5" ry="3.5" fill="#182421" />
        <ellipse cx="34" cy="43" rx="8" ry="5" fill="#FFE8DC" />
        <circle cx="31" cy="43" r="1.5" fill="#182421" />
        <circle cx="37" cy="43" r="1.5" fill="#182421" />
        <polygon points="20,24 28,29 23,34" fill="#E06B34" />
        <polygon points="48,24 40,29 45,34" fill="#E06B34" />
        <circle cx="34" cy="14" r="5" fill="#FFD166" stroke="#E89F1C" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'sticker-shapes',
    name: 'Bintang Kayu Pintar',
    skill: 'Motorik Halus & Bentuk',
    hint: 'Pasang 4 keping bentuk kayu ke lubangnya',
    bgColor: '#EBF4EF',
    borderColor: '#3DA57A',
    iconSvg: (
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        <circle cx="34" cy="34" r="30" fill="#E2F2E9" stroke="#3DA57A" strokeWidth="3" />
        <polygon
          points="34,16 39,27 51,28 42,36 45,48 34,42 23,48 26,36 17,28 29,27"
          fill="#FFD166"
          stroke="#E89F1C"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="30" cy="33" r="2.2" fill="#182421" />
        <circle cx="38" cy="33" r="2.2" fill="#182421" />
        <path d="M31 38C32.5 40 35.5 40 37 38" stroke="#182421" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'sticker-trace',
    name: 'Pensil Garis Ajaib',
    skill: 'Pra-Tulis & Presisi',
    hint: 'Tebalkan satu garis atau huruf sampai selesai',
    bgColor: '#FFF8E7',
    borderColor: '#E89F1C',
    iconSvg: (
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        <circle cx="34" cy="34" r="30" fill="#FFF2D6" stroke="#E89F1C" strokeWidth="3" />
        <g transform="rotate(35 34 34)">
          <rect x="29" y="16" width="10" height="28" rx="2" fill="#E89F1C" />
          <polygon points="29,44 39,44 34,54" fill="#FFE0B2" />
          <polygon points="32,50 36,50 34,54" fill="#182421" />
          <rect x="29" y="16" width="10" height="6" fill="#FF8A80" />
        </g>
        <path d="M16 48C24 45 32 52 48 46" stroke="#2978B5" strokeWidth="3" strokeDasharray="3 3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'sticker-motor',
    name: 'Kelinci Juara Gerak',
    skill: 'Motorik Kasar & Kebugaran',
    hint: 'Selesaikan 1 tantangan lompat atau patung musik',
    bgColor: '#EAF1F8',
    borderColor: '#2978B5',
    iconSvg: (
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        <circle cx="34" cy="34" r="30" fill="#E0EDF8" stroke="#2978B5" strokeWidth="3" />
        <rect x="28" y="14" width="4.5" height="15" rx="2.5" fill="#E06B34" />
        <rect x="35.5" y="14" width="4.5" height="15" rx="2.5" fill="#E06B34" />
        <circle cx="34" cy="32" r="10" fill="#F08A4B" />
        <circle cx="31" cy="31" r="1.5" fill="#182421" />
        <circle cx="37" cy="31" r="1.5" fill="#182421" />
        <circle cx="34" cy="35" r="1.2" fill="#D94848" />
        <rect x="27" y="40" width="14" height="12" rx="6" fill="#1F7A5C" />
        <circle cx="48" cy="22" r="6" fill="#FFD166" stroke="#E89F1C" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    id: 'sticker-coloring',
    name: 'Kupu-kupu Seniman',
    skill: 'Kreativitas & Nada',
    hint: 'Warnai gambar apel atau goreskan lukisan bunyi',
    bgColor: '#FDF0E4',
    borderColor: '#E06B34',
    iconSvg: (
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        <circle cx="34" cy="34" r="30" fill="#FBE6D6" stroke="#E06B34" strokeWidth="3" />
        {/* Butterfly wings */}
        <ellipse cx="24" cy="28" rx="10" ry="12" fill="#FF5E7E" transform="rotate(-20 24 28)" />
        <ellipse cx="44" cy="28" rx="10" ry="12" fill="#00CFE8" transform="rotate(20 44 28)" />
        <ellipse cx="26" cy="42" rx="7" ry="8" fill="#FFD166" transform="rotate(-15 26 42)" />
        <ellipse cx="42" cy="42" rx="7" ry="8" fill="#28C76F" transform="rotate(15 42 42)" />
        {/* Body */}
        <rect x="32" y="22" width="4" height="24" rx="2" fill="#182421" />
        <circle cx="34" cy="20" r="3" fill="#182421" />
        <path d="M33 18C30 14 26 15 25 17M35 18C38 14 42 15 43 17" stroke="#182421" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'sticker-puzzle',
    name: 'Gajah Pemecah Teka-Teki',
    skill: 'Visual & Spasial',
    hint: 'Selesaikan puzzle 4 keping gambar gajah atau kucing',
    bgColor: '#EAF4EE',
    borderColor: '#2F855A',
    iconSvg: (
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        <circle cx="34" cy="34" r="30" fill="#DFF0E6" stroke="#2F855A" strokeWidth="3" />
        <circle cx="24" cy="32" r="10" fill="#5D8AA8" />
        <circle cx="44" cy="32" r="10" fill="#5D8AA8" />
        <circle cx="34" cy="35" r="14" fill="#76A5C4" />
        <circle cx="29" cy="32" r="2" fill="#182421" />
        <circle cx="39" cy="32" r="2" fill="#182421" />
        <path d="M34 37V48C34 51 38 51 39 48" stroke="#5D8AA8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      </svg>
    )
  },
  {
    id: 'sticker-balloon',
    name: 'Balon Pelangi Ceria',
    skill: 'Refleks & Motorik Kasar',
    hint: 'Pecahkan 10 balon lewat sentuhan atau lambaian kamera',
    bgColor: '#F0EAF8',
    borderColor: '#7367F0',
    iconSvg: (
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        <circle cx="34" cy="34" r="30" fill="#E6DCF8" stroke="#7367F0" strokeWidth="3" />
        <ellipse cx="34" cy="30" rx="14" ry="18" fill="#FF5E7E" />
        <ellipse cx="30" cy="24" rx="4" ry="7" fill="#FFA5BA" opacity="0.6" />
        <polygon points="32,47 36,47 34,49" fill="#D94848" />
        <path d="M34 49C36 53 32 56 35 60" stroke="#182421" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'sticker-numbers',
    name: 'Bintang Angka Pintar',
    skill: 'Konsep Angka & Berhitung',
    hint: 'Hitung benda pada 4 angka di Taman Angka',
    bgColor: '#FFF9E6',
    borderColor: '#E89F1C',
    iconSvg: (
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        <circle cx="34" cy="34" r="30" fill="#FFF2D6" stroke="#E89F1C" strokeWidth="3" />
        <circle cx="34" cy="34" r="24" fill="#FFE8A3" />
        <text
          x="34"
          y="42"
          textAnchor="middle"
          fontSize="24"
          fontWeight="900"
          fill="#B87B0E"
          fontFamily="system-ui, sans-serif"
        >
          123
        </text>
        <polygon
          points="50,14 52,19 57,20 53,24 54,29 50,26 46,29 47,24 43,20 48,19"
          fill="#FF5E7E"
        />
      </svg>
    )
  },
  {
    id: 'sticker-alphabet',
    name: 'Piala Huruf Juara',
    skill: 'Literasi Huruf & Fonik',
    hint: 'Pelajari 8 huruf atau mainkan kuis di Taman Huruf',
    bgColor: '#F2EAFD',
    borderColor: '#8E24AA',
    iconSvg: (
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        <circle cx="34" cy="34" r="30" fill="#EAD5FC" stroke="#8E24AA" strokeWidth="3" />
        <text
          x="34"
          y="43"
          textAnchor="middle"
          fontSize="22"
          fontWeight="900"
          fill="#6A1B9A"
          fontFamily="system-ui, sans-serif"
        >
          Abc
        </text>
        <polygon
          points="20,18 24,12 28,18 34,16 32,22 36,26 30,27 28,32 24,28 18,30 20,24 16,20"
          fill="#FFD166"
        />
      </svg>
    )
  }
];

export function StickerAlbumModal({
  unlockedStickers,
  onClose
}: {
  unlockedStickers: string[];
  onClose: () => void;
}): JSX.Element {
  const earnedCount = STICKER_LIST.filter((s) => unlockedStickers.includes(s.id)).length;
  const totalCount = STICKER_LIST.length;
  const progressPct = Math.round((earnedCount / totalCount) * 100);

  function handleStickerClick(_sticker: StickerItem, isUnlocked: boolean): void {
    if (isUnlocked) {
      triggerHaptic('success');
      playSuccessChime();
      fireConfetti({ count: 35 });
    } else {
      triggerHaptic('tap');
      playGentlePop();
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="sticker-modal-title">
      <div className="modal-sheet sticker-album-sheet">
        <div className="modal-top">
          <div>
            <h2 id="sticker-modal-title" className="modal-title">
              Buku Album Stikerku 🌟
            </h2>
            <p className="sticker-album-sub">
              Koleksi stiker prestasimu saat bermain dan belajar!
            </p>
          </div>
          <button type="button" className="secondary-btn" onClick={onClose}>
            Tutup
          </button>
        </div>

        {/* Progress Bar */}
        <div className="sticker-progress-box">
          <div className="sticker-progress-header">
            <span className="sticker-progress-label">
              ⭐ Terkumpul: <strong>{earnedCount}</strong> dari {totalCount} Stiker
            </span>
            <span className="sticker-progress-pct">{progressPct}%</span>
          </div>
          <div className="sticker-progress-track">
            <div className="sticker-progress-bar" style={{ width: `${progressPct}%` }} />
          </div>
          {earnedCount === totalCount ? (
            <p className="sticker-album-praise">🎉 WOW! Semua stiker sudah kamu kumpulkan! Kamu anak pintar & hebat!</p>
          ) : (
            <p className="sticker-album-hint-general">Ketuk stiker yang terkumpul untuk melihat efek bintang!</p>
          )}
        </div>

        {/* Sticker Badges Grid */}
        <div className="sticker-grid" role="list">
          {STICKER_LIST.map((sticker) => {
            const isUnlocked = unlockedStickers.includes(sticker.id);
            return (
              <button
                key={sticker.id}
                type="button"
                role="listitem"
                className={`sticker-card ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}
                style={{
                  backgroundColor: isUnlocked ? sticker.bgColor : '#F4F5F6',
                  borderColor: isUnlocked ? sticker.borderColor : '#D1D5DB'
                }}
                onClick={() => handleStickerClick(sticker, isUnlocked)}
              >
                <div className="sticker-icon-wrap">
                  {isUnlocked ? (
                    sticker.iconSvg
                  ) : (
                    <div className="sticker-locked-icon">
                      <span className="sticker-lock-symbol">🔒</span>
                      <div className="sticker-silhouette-circle" />
                    </div>
                  )}
                </div>

                <div className="sticker-info">
                  <span className="sticker-name">{sticker.name}</span>
                  <span className="sticker-skill">{sticker.skill}</span>
                  <p className="sticker-status">
                    {isUnlocked ? (
                      <span className="unlocked-tag">✓ Sudah Didapat!</span>
                    ) : (
                      <span className="locked-hint">{sticker.hint}</span>
                    )}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
