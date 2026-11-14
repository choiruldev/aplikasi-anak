/**
 * Local 100%-offline Canvas Milestone Summary Card generator & Web/WhatsApp share helper.
 */
export async function generateMilestoneCardPng(params: {
  childName: string;
  ageLabel: string;
  phaseLabel: string;
  achievedCount: number;
  totalMilestones: number;
  stickersCount: number;
  streakDays: number;
}): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background cream card
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top sage banner
  ctx.fillStyle = '#2B6E4F';
  ctx.fillRect(0, 0, canvas.width, 132);

  // Decorative amber orb
  ctx.fillStyle = '#F7B731';
  ctx.beginPath();
  ctx.arc(845, 96, 46, 0, Math.PI * 2);
  ctx.fill();

  // Brand title
  ctx.fillStyle = '#FFFDF7';
  ctx.font = '700 40px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Cilukba', 48, 66);
  ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#D5EFE0';
  ctx.fillText('Kartu Pencapaian Tumbuh Kembang', 48, 102);

  // Child info
  ctx.fillStyle = '#18221D';
  ctx.font = '700 44px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${params.childName} · ${params.ageLabel}`, 48, 212);
  ctx.fillStyle = '#53645B';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(params.phaseLabel, 48, 250);

  // 3 clean metric boxes
  const boxes = [
    { label: 'Milestone', value: `${params.achievedCount}/${params.totalMilestones}`, bg: '#EAF5EE', accent: '#2B6E4F' },
    { label: 'Stiker', value: `${params.stickersCount}/14`, bg: '#FFF4DC', accent: '#B86E00' },
    { label: 'Streak Aktif', value: `${params.streakDays} hr`, bg: '#EAE6FF', accent: '#5A4FB8' }
  ];

  boxes.forEach((box, idx) => {
    const x = 48 + idx * 294;
    const y = 296;
    const w = 272;
    const h = 160;
    ctx.fillStyle = box.bg;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 24);
    ctx.fill();

    ctx.fillStyle = '#53645B';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(box.label, x + 28, y + 54);

    ctx.fillStyle = box.accent;
    ctx.font = '700 46px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(box.value, x + 28, y + 118);
  });

  // Footer
  ctx.fillStyle = '#73827A';
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Cilukba Offline PWA · 0–5 Tahun', 48, 504);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
