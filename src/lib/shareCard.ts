/**
 * Local 100%-offline Canvas Milestone Summary Card generator (1080×1080 WhatsApp-ready)
 * & Web/WhatsApp share helper.
 */
export interface MilestoneCardParams {
  childName: string;
  ageLabel: string;
  phaseLabel: string;
  achievedCount: number;
  totalMilestones: number;
  stickersCount: number;
  streakDays: number;
  whoSummary?: string;
  kpspSummary?: string;
  pillarPercents?: Array<{ label: string; percent: number }>;
  dateLabel?: string;
}

export async function generateMilestoneCardPng(params: MilestoneCardParams): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background warm cream canvas
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft decorative rings
  ctx.fillStyle = '#EAF5EE';
  ctx.beginPath();
  ctx.arc(980, 960, 180, 0, Math.PI * 2);
  ctx.fill();

  // Top sage curved banner
  ctx.fillStyle = '#2B6E4F';
  ctx.fillRect(0, 0, canvas.width, 224);

  // Decorative amber sun badge
  ctx.fillStyle = '#F7B731';
  ctx.beginPath();
  ctx.arc(940, 118, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(926, 108, 8, 0, Math.PI * 2);
  ctx.arc(954, 108, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFDF7';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(940, 118, 22, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Brand title
  ctx.fillStyle = '#FFFDF7';
  ctx.font = '800 56px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Cilukba', 64, 106);
  ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#D5EFE0';
  ctx.fillText('Kartu Pencapaian Tumbuh Kembang Anak', 64, 156);

  // Child Identity Card
  ctx.fillStyle = '#18221D';
  ctx.font = '800 58px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(params.childName, 64, 318);
  ctx.fillStyle = '#53645B';
  ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${params.ageLabel} · ${params.phaseLabel}`, 64, 368);

  // 4 Metric Tiles (2×2 grid)
  const tiles = [
    {
      label: 'Milestone Usia',
      value: `${params.achievedCount}/${params.totalMilestones}`,
      bg: '#EAF5EE',
      accent: '#2B6E4F'
    },
    {
      label: 'Koleksi Stiker',
      value: `${params.stickersCount}/14`,
      bg: '#FFF4DC',
      accent: '#B86E00'
    },
    {
      label: 'Streak Aktif',
      value: `${params.streakDays} hari`,
      bg: '#EFEAFF',
      accent: '#5A4FB8'
    },
    {
      label: params.whoSummary ? 'Status WHO' : 'Skrining KPSP',
      value: params.whoSummary ?? params.kpspSummary ?? 'Terpantau',
      bg: '#E8F4FA',
      accent: '#1F6391'
    }
  ];

  tiles.forEach((tile, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 64 + col * 488;
    const y = 414 + row * 190;
    const w = 464;
    const h = 166;

    ctx.fillStyle = tile.bg;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 28);
    ctx.fill();

    ctx.fillStyle = '#4F5F57';
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(tile.label, x + 32, y + 58);

    ctx.fillStyle = tile.accent;
    ctx.font = tile.value.length > 14 ? '800 34px "Plus Jakarta Sans", sans-serif' : '800 52px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(tile.value.slice(0, 22), x + 32, y + 128);
  });

  // 4-Pillar Balance Bars
  const pillars = params.pillarPercents ?? [
    { label: 'Motorik Kasar', percent: 70 },
    { label: 'Motorik Halus', percent: 65 },
    { label: 'Bahasa', percent: 75 },
    { label: 'Kognitif', percent: 80 }
  ];

  ctx.fillStyle = '#18221D';
  ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Keseimbangan 4 Pilar Stimulasi', 64, 836);

  pillars.slice(0, 4).forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 64 + col * 488;
    const y = 868 + row * 68;
    const barW = 464;

    ctx.fillStyle = '#4F5F57';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(p.label, x, y + 20);
    ctx.fillStyle = '#2B6E4F';
    ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${p.percent}%`, x + barW - 58, y + 20);

    ctx.fillStyle = '#E6ECE8';
    ctx.beginPath();
    ctx.roundRect(x, y + 32, barW, 18, 9);
    ctx.fill();

    ctx.fillStyle = '#2B6E4F';
    ctx.beginPath();
    ctx.roundRect(x, y + 32, Math.max(18, (barW * Math.min(100, p.percent)) / 100), 18, 9);
    ctx.fill();
  });

  // Footer
  ctx.fillStyle = '#73827A';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `Cilukba · Pantau Tumbuh Kembang & Belajar 0–5 Tahun${params.dateLabel ? ` · ${params.dateLabel}` : ''}`,
    64,
    1034
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
