import type { StimulationPillar } from '../lib/development.ts';
import type { KpspStatus } from '../lib/journalStorage.ts';

export interface KpspQuestion {
  id: string;
  pillar: StimulationPillar;
  text: string;
}

export interface KpspCheckpoint {
  months: number;
  label: string;
  questions: KpspQuestion[];
}

function q(id: string, pillar: StimulationPillar, text: string): KpspQuestion {
  return { id, pillar, text };
}

export const KPSP_CHECKPOINTS: KpspCheckpoint[] = [
  {
    months: 3,
    label: '3 Bulan',
    questions: [
      q('k3-1', 'motor-kasar', 'Saat tengkurap, bayi dapat mengangkat kepala hingga ~45 derajat?'),
      q('k3-2', 'motor-kasar', 'Saat digendong tegak, kontrol kepala bayi mulai stabil sebentar?'),
      q('k3-3', 'motor-halus', 'Telapak tangan bayi sering terbuka (tidak mengepal terus-menerus)?'),
      q('k3-4', 'kognitif', 'Mata bayi mengikuti benda kontras atau mainan yang digerakkan ke kiri-kanan?'),
      q('k3-5', 'kognitif', 'Bayi terkejut atau berkedip saat mendengar bunyi keras mendadak?'),
      q('k3-6', 'bahasa', 'Bayi tersenyum balik saat Ayah/Bunda tersenyum dan menyapanya?'),
      q('k3-7', 'bahasa', 'Bayi mengeluarkan suara lembut ("ooo", "aaa") saat diajak bicara?'),
      q('k3-8', 'motor-halus', 'Bayi dapat menggenggam sebentar jari atau mainan ringan di tangannya?'),
      q('k3-9', 'motor-kasar', 'Gerakan kaki dan tangan bayi tampak aktif seimbang kanan dan kiri?'),
      q('k3-10', 'bahasa', 'Bayi menoleh ke arah sumber suara yang familiar di dekatnya?')
    ]
  },
  {
    months: 6,
    label: '6 Bulan',
    questions: [
      q('k6-1', 'motor-kasar', 'Bayi sudah bisa berguling bolak-balik dari telentang ke tengkurap?'),
      q('k6-2', 'motor-kasar', 'Saat tengkurap, bayi bertumpu pada kedua telapak tangan dengan dada terangkat?'),
      q('k6-3', 'motor-kasar', 'Bayi mulai bisa duduk sebentar jika ditopang atau bersandar bantal?'),
      q('k6-4', 'motor-halus', 'Bayi sengaja meraih dan menggenggam mainan di jangkauannya?'),
      q('k6-5', 'motor-halus', 'Bayi memindahkan benda dari satu tangan ke tangan lain?'),
      q('k6-6', 'kognitif', 'Bayi menoleh dan mencari mainan yang jatuh di dekatnya?'),
      q('k6-7', 'bahasa', 'Bayi tertawa keras atau menjerit senang saat diajak bercanda cilukba?'),
      q('k6-8', 'bahasa', 'Bayi mengoceh berulang seperti "ba-ba", "ma-ma", atau "da-da" tanpa arti spesifik?'),
      q('k6-9', 'kognitif', 'Bayi memasukkan benda atau tangan ke mulut untuk eksplorasi tekstur?'),
      q('k6-10', 'bahasa', 'Bayi mulai mengenali wajah pengasuh utama dibanding orang asing?')
    ]
  },
  {
    months: 9,
    label: '9 Bulan',
    questions: [
      q('k9-1', 'motor-kasar', 'Bayi duduk tegak stabil di lantai tanpa ditopang selama ≥ 1 menit?'),
      q('k9-2', 'motor-kasar', 'Bayi bergerak maju (merangkak atau menggeser perut) menuju mainan?'),
      q('k9-3', 'motor-kasar', 'Bayi berusaha berdiri sambil berpegangan pada pinggir sofa atau tangan orang tua?'),
      q('k9-4', 'motor-halus', 'Bayi mengambil potongan makanan kecil memakai ibu jari dan telunjuk (pincer grasp)?'),
      q('k9-5', 'motor-halus', 'Bayi membenturkan dua balok atau mainan bersama-sama?'),
      q('k9-6', 'kognitif', 'Bayi mencari mainan yang ditutup kain saat bermain cilukba?'),
      q('k9-7', 'bahasa', 'Bayi menoleh konsisten saat dipanggil namanya?'),
      q('k9-8', 'bahasa', 'Bayi merespons larangan lembut ("jangan/tidak") atau melambaikan tangan (dadah)?'),
      q('k9-9', 'bahasa', 'Bayi mengoceh kombinasi suku kata bervariasi?'),
      q('k9-10', 'kognitif', 'Bayi tertarik meniru tepuk tangan atau gestur sederhana?')
    ]
  },
  {
    months: 12,
    label: '12 Bulan',
    questions: [
      q('k12-1', 'motor-kasar', 'Anak dapat berdiri berpegangan atau mulai berjalan sambil merambat?'),
      q('k12-2', 'motor-kasar', 'Anak bisa berdiri mandiri beberapa detik tanpa berpegangan?'),
      q('k12-3', 'motor-halus', 'Anak dapat memasukkan benda kecil ke dalam gelas atau wadah?'),
      q('k12-4', 'motor-halus', 'Anak dapat memegang cangkir minum atau mencoret bebas dengan krayon tebal?'),
      q('k12-5', 'bahasa', 'Anak menunjuk benda yang diinginkan sambil menatap orang tua?'),
      q('k12-6', 'bahasa', 'Anak mengucap 1–3 kata bermakna (misal "mama", "papa", "mimik")?'),
      q('k12-7', 'bahasa', 'Anak paham instruksi sederhana dengan gestur ("Berikan bolanya ke Ayah")?'),
      q('k12-8', 'kognitif', 'Anak mencoba menumpuk 2 balok atau menekan tombol mainan berulang?'),
      q('k12-9', 'kognitif', 'Anak membuka tutup kotak atau mencari benda tersembunyi?'),
      q('k12-10', 'bahasa', 'Anak kooperatif saat dipakaikan baju (menjulurkan lengan/kaki)?')
    ]
  },
  {
    months: 18,
    label: '18 Bulan',
    questions: [
      q('k18-1', 'motor-kasar', 'Anak berjalan sendiri lancar tanpa sering terjatuh?'),
      q('k18-2', 'motor-kasar', 'Anak dapat membungkuk mengambil mainan lalu berdiri lagi atau mulai menaiki tangga?'),
      q('k18-3', 'motor-halus', 'Anak menyusun menara 2–4 balok secara mandiri?'),
      q('k18-4', 'motor-halus', 'Anak minum dari gelas terbuka dan mulai menyendok makan sendiri?'),
      q('k18-5', 'bahasa', 'Anak mengucap minimal 5–15 kata tunggal bermakna dengan jelas?'),
      q('k18-6', 'bahasa', 'Anak dapat menunjuk minimal 1–2 bagian tubuhnya saat ditanya?'),
      q('k18-7', 'kognitif', 'Anak bermain pura-pura sederhana (suapi boneka, telepon)?'),
      q('k18-8', 'kognitif', 'Anak mengikuti 1 langkah instruksi tanpa perlu dibantu gestur?'),
      q('k18-9', 'motor-halus', 'Anak mencoret spontan memakai krayon di atas kertas?'),
      q('k18-10', 'bahasa', 'Anak menunjukkan benda menarik ke orang tua untuk berbagi perhatian?')
    ]
  },
  {
    months: 24,
    label: '24 Bulan',
    questions: [
      q('k24-1', 'motor-kasar', 'Anak bisa berlari kecil dan menendang bola ke depan tanpa kehilangan keseimbangan?'),
      q('k24-2', 'motor-kasar', 'Anak naik-turun anak tangga sambil berpegangan satu tangan?'),
      q('k24-3', 'motor-halus', 'Anak menyusun 4–6 balok atau membuka halaman buku satu per satu?'),
      q('k24-4', 'motor-halus', 'Anak meniru membuat garis lurus atau memutar tutup botol/wadah?'),
      q('k24-5', 'bahasa', 'Anak menggabungkan 2 kata bermakna ("mau minum", "bola besar")?'),
      q('k24-6', 'bahasa', 'Anak mengenali gambar benda atau hewan umum saat disebutkan?'),
      q('k24-7', 'kognitif', 'Anak mengikuti 2 instruksi berurutan ("Ambil bola lalu taruh di kotak")?'),
      q('k24-8', 'kognitif', 'Anak mulai memilah benda berdasarkan warna atau bentuk dasar?'),
      q('k24-9', 'bahasa', 'Anak tertarik bermain di dekat teman sebaya dan meniru aktivitas rumah?'),
      q('k24-10', 'motor-halus', 'Anak melepas pakaian sederhana (celana longgar/kaos kaki) dibantu minimal?')
    ]
  },
  {
    months: 36,
    label: '36 Bulan',
    questions: [
      q('k36-1', 'motor-kasar', 'Anak bisa melompat dengan dua kaki terangkat bersamaan dan mengayuh sepeda roda tiga?'),
      q('k36-2', 'motor-kasar', 'Anak berdiri 1 kaki selama 1–2 detik dan melempar bola ke atas?'),
      q('k36-3', 'motor-halus', 'Anak meniru gambar lingkaran dan menyusun puzzle sederhana 4 keping?'),
      q('k36-4', 'motor-halus', 'Anak makan sendiri rapi memakai sendok dan mencuci tangan dengan arahan?'),
      q('k36-5', 'bahasa', 'Anak bicara kalimat 3–4 kata dan sebagian besar dimengerti orang asing?'),
      q('k36-6', 'bahasa', 'Anak menyebutkan nama depan, usia, serta menjawab "apa/siapa"?'),
      q('k36-7', 'kognitif', 'Anak mengenal konsep "besar vs kecil" atau menghitung 1–3 benda?'),
      q('k36-8', 'kognitif', 'Anak mengenal minimal 2–3 warna dasar saat ditunjuk?'),
      q('k36-9', 'bahasa', 'Anak mau bergantian menunggu giliran singkat saat bermain?'),
      q('k36-10', 'motor-halus', 'Anak memakai baju kaos atau celana sendiri dengan sedikit bantuan?')
    ]
  },
  {
    months: 48,
    label: '48 Bulan',
    questions: [
      q('k48-1', 'motor-kasar', 'Anak melompat 1 kaki (engklek) dan berdiri 1 kaki minimal 3–5 detik?'),
      q('k48-2', 'motor-kasar', 'Anak menangkap bola memantul dengan kedua tangan?'),
      q('k48-3', 'motor-halus', 'Anak meniru gambar tanda tambah (+), persegi, dan memegang pensil dengan nyaman?'),
      q('k48-4', 'motor-halus', 'Anak mengancingkan kancing besar atau menggunting kertas mengikuti garis?'),
      q('k48-5', 'bahasa', 'Anak bercerita singkat tentang pengalamannya menggunakan kalimat runtut?'),
      q('k48-6', 'bahasa', 'Anak memahami konsep posisi ("di atas", "di bawah", "di belakang")?'),
      q('k48-7', 'kognitif', 'Anak berhitung 1–5 benda berurutan dengan tepat?'),
      q('k48-8', 'kognitif', 'Anak mengenal beberapa huruf awal namanya dan 4+ warna?'),
      q('k48-9', 'bahasa', 'Anak bermain peran bersama teman dan mengikuti aturan permainan sederhana?'),
      q('k48-10', 'motor-halus', 'Anak ke toilet dan mencuci tangan mandiri?')
    ]
  },
  {
    months: 60,
    label: '60 Bulan',
    questions: [
      q('k60-1', 'motor-kasar', 'Anak melompat engklek bergantian kaki dengan seimbang dan berlari lincah?'),
      q('k60-2', 'motor-kasar', 'Anak berjalan jinjit lurus sepanjang garis atau menangkap bola kecil?'),
      q('k60-3', 'motor-halus', 'Anak meniru gambar segitiga, orang lengkap, atau menulis nama panggilan pendek?'),
      q('k60-4', 'motor-halus', 'Anak memakai baju lengkap dan menyikat gigi sendiri dengan rapi?'),
      q('k60-5', 'bahasa', 'Anak menjawab pertanyaan "kenapa" atau menceritakan kembali isi cerita pendek?'),
      q('k60-6', 'bahasa', 'Anak memahami bunyi suku kata awal yang sama atau menyebutkan lawan kata sederhana?'),
      q('k60-7', 'kognitif', 'Anak menghitung hingga 10 benda dan mengenal penjumlahan kecil pakai jari/benda?'),
      q('k60-8', 'kognitif', 'Anak melengkapi pola urutan berulang (ABAB / ABC)?'),
      q('k60-9', 'bahasa', 'Anak sabar bergiliran dan mengungkapkan emosi dengan kata-kata?'),
      q('k60-10', 'kognitif', 'Anak menyelesaikan tugas mewarnai atau puzzle hingga tuntas?')
    ]
  }
];

export function getNearestKpspCheckpoint(months: number): KpspCheckpoint {
  let best = KPSP_CHECKPOINTS[0];
  let bestDiff = Math.abs(months - best.months);
  for (const cp of KPSP_CHECKPOINTS) {
    const diff = Math.abs(months - cp.months);
    if (diff < bestDiff) {
      best = cp;
      bestDiff = diff;
    }
  }
  return best;
}

export function evaluateKpspAnswers(
  checkpointMonths: number,
  answers: boolean[]
): {
  yesCount: number;
  totalCount: number;
  status: KpspStatus;
  weakPillars: StimulationPillar[];
} {
  const cp = KPSP_CHECKPOINTS.find((c) => c.months === checkpointMonths) ?? KPSP_CHECKPOINTS[0];
  const totalCount = cp.questions.length;
  let yesCount = 0;
  const weakSet = new Set<StimulationPillar>();

  cp.questions.forEach((question, idx) => {
    if (answers[idx]) {
      yesCount += 1;
    } else {
      weakSet.add(question.pillar);
    }
  });

  const status: KpspStatus =
    yesCount >= 9 ? 'sesuai' : yesCount >= 7 ? 'meragukan' : 'penyimpangan';

  return {
    yesCount,
    totalCount,
    status,
    weakPillars: Array.from(weakSet)
  };
}
