import { useEffect, useState, type JSX } from 'react';
import { IconDownload, IconShare } from './Art.tsx';
import {
  buildWhatsAppShareUrl,
  generateMilestoneCardPng,
  type MilestoneCardParams
} from '../lib/shareCard.ts';

interface Props {
  open: boolean;
  cardParams: MilestoneCardParams;
  shareText: string;
  onClose: () => void;
}

export function ShareCardModal({ open, cardParams, shareText, onClose }: Props): JSX.Element | null {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    let objectUrl: string | null = null;
    setStatusMsg(null);

    void generateMilestoneCardPng(cardParams).then((generated) => {
      if (!active || !generated) return;
      setBlob(generated);
      objectUrl = URL.createObjectURL(generated);
      setPreviewUrl(objectUrl);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, cardParams]);

  if (!open) return null;

  const fileName = `cilukba-${cardParams.childName.toLowerCase().replace(/\s+/g, '-')}.png`;

  const handleDownload = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatusMsg('Kartu PNG berhasil disimpan!');
  };

  const handleNativeShare = async () => {
    if (!blob) return;
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
    };
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (nav.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
        await nav.share({
          title: `Pencapaian ${cardParams.childName} — Cilukba`,
          text: shareText,
          files: [file]
        });
        setStatusMsg('Berhasil dibagikan!');
        return;
      }
    } catch {
      // User cancelled or unsupported; fall through to download
    }
    handleDownload();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Kartu Pencapaian Anak"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-sheet share-card-sheet">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Siap Bagikan ke Keluarga</span>
            <h2>Kartu Pencapaian {cardParams.childName}</h2>
          </div>
          <button type="button" className="btn-outline small" onClick={onClose}>
            Tutup
          </button>
        </div>

        <div className="drawer-body">
          <div className="share-card-preview-box">
            {previewUrl ? (
              <img src={previewUrl} alt={`Pratinjau kartu pencapaian ${cardParams.childName}`} />
            ) : (
              <p className="muted-copy">Menyiapkan kartu...</p>
            )}
          </div>

          {statusMsg && <p className="share-card-status">{statusMsg}</p>}

          <div className="share-card-actions">
            <button type="button" className="btn-primary-calm" onClick={() => void handleNativeShare()}>
              <IconShare size={16} /> Bagikan Gambar
            </button>
            <button type="button" className="btn-outline" onClick={handleDownload}>
              <IconDownload size={16} /> Simpan PNG
            </button>
            <a
              className="btn-outline"
              href={buildWhatsAppShareUrl(shareText)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Kirim Teks WA
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
