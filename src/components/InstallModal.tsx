import type { JSX } from 'react';
import { BrandMark, IconCheck, IconDownload, IconShare } from './Art';
import type { BeforeInstallPromptEvent } from './ParentDrawer';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  installEvent: BeforeInstallPromptEvent | null;
  onTriggerInstall: () => void;
  isIos: boolean;
}

export function InstallModal({
  isOpen,
  onClose,
  installEvent,
  onTriggerInstall,
  isIos
}: InstallModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      onClick={onClose}
    >
      <div className="modal-sheet install-guide-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div className="install-modal-header-cluster">
            <BrandMark size={36} />
            <div>
              <h2 id="install-modal-title" className="modal-title">
                Pasang KecilMain di HP
              </h2>
              <span className="install-modal-badge">PWA Siap Offline</span>
            </div>
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
            aria-label="Tutup panduan"
          >
            ✕
          </button>
        </div>

        <div className="install-benefits-row">
          <div className="benefit-item">
            <span className="benefit-icon">📶</span>
            <div>
              <strong>Bisa Offline</strong>
              <p>Main di mobil atau tanpa sinyal.</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">📱</span>
            <div>
              <strong>Layar Penuh</strong>
              <p>Bebas gangguan bilah browser.</p>
            </div>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">⚡</span>
            <div>
              <strong>Buka Cepat</strong>
              <p>Ikon di beranda layar utama.</p>
            </div>
          </div>
        </div>

        {installEvent ? (
          <div className="install-one-click-box">
            <p className="install-one-click-text">
              Perangkat Anda siap memasang KecilMain langsung dalam satu ketukan!
            </p>
            <button
              type="button"
              className="primary-action-btn install-cta-large"
              onClick={() => {
                onTriggerInstall();
                onClose();
              }}
            >
              <IconDownload size={22} />
              <span>Pasang Sekarang ke Layar Utama</span>
            </button>
          </div>
        ) : isIos ? (
          <div className="install-steps-container">
            <p className="steps-intro">
              Di iPhone atau iPad (Safari), pasang dalam 3 langkah mudah:
            </p>
            <ol className="install-steps-list">
              <li className="step-item">
                <div className="step-num">1</div>
                <div className="step-content">
                  <p>
                    Ketuk tombol <strong>Bagikan (Share)</strong> di bilah bawah Safari.
                  </p>
                  <div className="step-pill-hint">
                    <IconShare size={18} />
                    <span>Ikon kotak dengan panah ke atas</span>
                  </div>
                </div>
              </li>
              <li className="step-item">
                <div className="step-num">2</div>
                <div className="step-content">
                  <p>
                    Gulir ke bawah menu, lalu pilih <strong>&quot;Tambah ke Layar Utama&quot;</strong> (<i>Add to Home Screen</i>).
                  </p>
                </div>
              </li>
              <li className="step-item">
                <div className="step-num">3</div>
                <div className="step-content">
                  <p>
                    Ketuk <strong>&quot;Tambah&quot;</strong> di sudut kanan atas. Selesai!
                  </p>
                </div>
              </li>
            </ol>
          </div>
        ) : (
          <div className="install-steps-container">
            <p className="steps-intro">
              Untuk memasang melalui browser Chrome / Edge di HP atau Komputer:
            </p>
            <ol className="install-steps-list">
              <li className="step-item">
                <div className="step-num">1</div>
                <div className="step-content">
                  <p>
                    Ketuk menu titik tiga <strong>(⋮)</strong> di sudut kanan atas browser.
                  </p>
                </div>
              </li>
              <li className="step-item">
                <div className="step-num">2</div>
                <div className="step-content">
                  <p>
                    Pilih menu <strong>&quot;Pasang Aplikasi&quot;</strong> atau <strong>&quot;Tambahkan ke Layar Utama&quot;</strong>.
                  </p>
                </div>
              </li>
              <li className="step-item">
                <div className="step-num">3</div>
                <div className="step-content">
                  <p>
                    Konfirmasi pemasangan. Aplikasi akan langsung tersimpan di beranda perangkat Anda.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        <div className="install-modal-footer">
          <button type="button" className="secondary-btn w-full-btn" onClick={onClose}>
            <IconCheck size={18} />
            <span>Saya Mengerti</span>
          </button>
        </div>
      </div>
    </div>
  );
}
