import { useState, type JSX } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onDeleteAllData: () => void;
}

export function LegalPrivacyModal({ open, onClose, onDeleteAllData }: Props): JSX.Element | null {
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Privasi & Referensi Cilukba"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-sheet">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Transparansi Publik</span>
            <h2>Privasi, Referensi & Data</h2>
          </div>
          <button type="button" className="btn-outline small" onClick={onClose}>
            Tutup
          </button>
        </div>

        <div className="drawer-body">
          <section className="drawer-section">
            <h3>Privasi & Keamanan Anak</h3>
            <ul className="tip-points">
              <li>Seluruh data anak disimpan 100% di perangkat Anda (offline-first).</li>
              <li>Tidak ada iklan pihak ketiga, tidak ada tautan keluar di Mode Main Anak, dan tidak ada pengumpulan data pribadi anak ke server luar.</li>
              <li>Anda memegang kendali penuh lewat tombol Ekspor JSON, Impor JSON, dan Hapus Semua Data.</li>
            </ul>
          </section>

          <section className="drawer-section">
            <h3>Rujukan & Disclaimer</h3>
            <ul className="tip-points">
              <li>Kurva Z-Score mengikuti parameter referensi WHO Child Growth Standards (0–60 bulan).</li>
              <li>Pertanyaan skrining disusun merujuk panduan KPSP & Buku KIA Kemenkes RI / IDAI.</li>
              <li>Aplikasi ini adalah pendamping edukatif keluarga dan <strong>bukan alat diagnosis medis</strong>. Segera konsultasikan ke dokter anak atau bidan jika ragu.</li>
            </ul>
          </section>

          <section className="drawer-section">
            <h3>Hapus Semua Data Lokal</h3>
            {!confirmDelete ? (
              <button
                type="button"
                className="btn-outline small"
                onClick={() => setConfirmDelete(true)}
              >
                Reset & Hapus Semua Data...
              </button>
            ) : (
              <div className="inline-gate">
                <p className="muted-copy">Semua profil, kurva, skrining, dan stiker akan dihapus permanen.</p>
                <div className="gate-actions">
                  <button type="button" className="btn-outline small" onClick={() => setConfirmDelete(false)}>
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn-primary-calm small"
                    onClick={() => {
                      setConfirmDelete(false);
                      onDeleteAllData();
                    }}
                  >
                    Ya, Hapus Semua
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
