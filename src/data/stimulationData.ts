import type { AgeBand, StimulationPillar } from '../lib/development.ts';

export type SimulationKey =
  | 'high-contrast'
  | 'tummy-time'
  | 'baby-soother'
  | 'peekaboo'
  | 'bubblepopper'
  | 'colors'
  | 'sensory'
  | 'numbers'
  | 'alphabet'
  | 'shapes'
  | 'trace'
  | 'motor'
  | 'coloring'
  | 'puzzle'
  | 'balloon';

export interface AgePhaseMeta {
  id: AgeBand;
  shortLabel: string;
  label: string;
  rangeLabel: string;
  focusSummary: string;
}

export interface StimulationMission {
  id: string;
  ageBand: AgeBand;
  pillar: StimulationPillar;
  title: string;
  durationLabel: string;
  summary: string;
  steps: string[];
  linkedSimulation?: SimulationKey;
}

export interface MilestoneItem {
  id: string;
  ageBand: AgeBand;
  pillar: StimulationPillar;
  text: string;
}

export interface SimulationModuleMeta {
  key: SimulationKey;
  title: string;
  subtitle: string;
  goalLabel: string;
  pillar: StimulationPillar;
  ageBands: AgeBand[];
  ageTag: string;
  isBabyTool: boolean;
  stickerId?: string;
  surfaceTint: string;
}

export const PILLAR_LABELS: Record<StimulationPillar, string> = {
  'motor-kasar': 'Motorik Kasar',
  'motor-halus': 'Motorik Halus',
  bahasa: 'Bahasa & Sosial',
  kognitif: 'Kognitif & Sensori'
};

export const AGE_PHASES: AgePhaseMeta[] = [
  {
    id: '0-3m',
    shortLabel: '0–3 Bln',
    label: 'Newborn (0–3 Bulan)',
    rangeLabel: '0–3 bulan',
    focusSummary: 'Fokus visual jarak dekat, suara tenang, dan tummy time singkat di permukaan aman.'
  },
  {
    id: '3-6m',
    shortLabel: '3–6 Bln',
    label: 'Bayi Awal (3–6 Bulan)',
    rangeLabel: '3–6 bulan',
    focusSummary: 'Penguatan leher & bahu, meraih mainan, serta balasan senyum & ocehan dua arah.'
  },
  {
    id: '6-12m',
    shortLabel: '6–12 Bln',
    label: 'Bayi Eksplorasi (6–12 Bulan)',
    rangeLabel: '6–12 bulan',
    focusSummary: 'Duduk seimbang, merangkak, penjepit jari (pincer grasp), dan pemahaman sebab-akibat.'
  },
  {
    id: '1-2y',
    shortLabel: '1–2 Thn',
    label: 'Toddler Awal (1–2 Tahun)',
    rangeLabel: '1–2 tahun',
    focusSummary: 'Kosakata benda sekitar, mengenali warna, serta koordinasi sentuh & tunjuk.'
  },
  {
    id: '2-3y',
    shortLabel: '2–3 Thn',
    label: 'Toddler Aktif (2–3 Tahun)',
    rangeLabel: '2–3 tahun',
    focusSummary: 'Mencocokkan bentuk, berhitung benda nyata, serta menyalurkan energi gerak terarah.'
  },
  {
    id: '3-5y',
    shortLabel: '3–5 Thn',
    label: 'Prasekolah (3–5 Tahun)',
    rangeLabel: '3–5 tahun',
    focusSummary: 'Pra-menulis huruf & garis, mewarnai terarah, puzzle logika, dan regulasi diri.'
  }
];

export const STIMULATION_MISSIONS: StimulationMission[] = [
  // 0-3m
  {
    id: 'mis-03m-1',
    ageBand: '0-3m',
    pillar: 'kognitif',
    title: 'Tatap Kartu Kontras Hitam-Putih',
    durationLabel: '3 mnt',
    summary: 'Bantu mata newborn melatih fokus penglihatan jarak dekat 20–30 cm.',
    steps: [
      'Pastikan bayi dalam kondisi tenang dan terjaga (quiet alert).',
      'Tampilkan kartu kontras 20–30 cm di depan wajahnya.',
      'Geser perlahan ke kiri-kanan 15° jika mata bayi sudah mengunci pola.'
    ],
    linkedSimulation: 'high-contrast'
  },
  {
    id: 'mis-03m-2',
    ageBand: '0-3m',
    pillar: 'motor-kasar',
    title: 'Tummy Time Singkat di Dada/Matras',
    durationLabel: '2–3 mnt',
    summary: 'Latih otot leher awal dan cegah kepala peyang tanpa memaksa.',
    steps: [
      'Lakukan saat bayi tidak mengantuk dan minimal 20 menit setelah menyusu.',
      'Gunakan timer 1–3 menit sambil sejajarkan wajah orang tua dengan bayi.',
      'Hentikan jika bayi mulai rewel lalu peluk menenangkan.'
    ],
    linkedSimulation: 'tummy-time'
  },
  {
    id: 'mis-03m-3',
    ageBand: '0-3m',
    pillar: 'bahasa',
    title: 'Ngobrol Pelan & Respons Ocehan',
    durationLabel: '5 mnt',
    summary: 'Bangun kelekatan dan kenalkan irama suara orang tua sejak hari pertama.',
    steps: [
      'Tatap mata bayi dengan ekspresi hangat dari jarak dekat.',
      'Ucapkan kalimat singkat atau tirukan bunyi "ooh/aah" yang ia keluarkan.',
      'Beri jeda 3 detik agar bayi belajar bergantian merespons.'
    ]
  },
  {
    id: 'mis-03m-4',
    ageBand: '0-3m',
    pillar: 'kognitif',
    title: 'Lacak Bunyi Lembut Kanan & Kiri',
    durationLabel: '3 mnt',
    summary: 'Latih orientasi pendengaran bayi secara lembut tanpa suara kaget.',
    steps: [
      'Gunakan suara kerincingan lembut atau bisikan nama bayi dari samping kepala.',
      'Beri waktu beberapa detik sampai kepala atau matanya menoleh ke arah sumber suara.',
      'Bisa memakai tombol Kerincingan di Pengantar Tidur.'
    ],
    linkedSimulation: 'baby-soother'
  },

  // 3-6m
  {
    id: 'mis-36m-1',
    ageBand: '3-6m',
    pillar: 'motor-kasar',
    title: 'Tummy Time dengan Mainan di Depan',
    durationLabel: '3–5 mnt',
    summary: 'Dorong bayi menumpu siku dan mengangkat dada lebih tinggi.',
    steps: [
      'Pasang timer Tummy Time selama 3 menit.',
      'Letakkan kartu kontras atau mainan aman sejajar pandangan matanya.',
      'Ajak berguling miring perlahan di akhir sesi.'
    ],
    linkedSimulation: 'tummy-time'
  },
  {
    id: 'mis-36m-2',
    ageBand: '3-6m',
    pillar: 'motor-halus',
    title: 'Raih & Genggam Kain Bertekstur',
    durationLabel: '5 mnt',
    summary: 'Aktifkan koordinasi mata dan tangan sebelum mulai MPASI.',
    steps: [
      'Pegang kain katun lembut atau kerincingan ringan di depan dada bayi.',
      'Biarkan jari-jarinya menyentuh, meremas, dan memindahkan pegangan.',
      'Dampingi selalu agar benda kecil tidak tertelan.'
    ]
  },
  {
    id: 'mis-36m-3',
    ageBand: '3-6m',
    pillar: 'bahasa',
    title: 'Balas Cooing & Tertawa Bersama',
    durationLabel: '5 mnt',
    summary: 'Perkaya komunikasi dua arah lewat mimik wajah dan intonasi ceria.',
    steps: [
      'Tirukan bunyi konsonan awal yang keluar dari bayi ("ba", "ma", "gu").',
      'Variasikan ekspresi senyum dan alis naik agar bayi tertarik menatap wajah.',
      'Sebutkan nama benda yang sedang disentuh bayi.'
    ]
  },
  {
    id: 'mis-36m-4',
    ageBand: '3-6m',
    pillar: 'kognitif',
    title: 'Latih Fokus Gerak Kartu Visual',
    durationLabel: '3 mnt',
    summary: 'Tantang pelacakan visual 180 derajat saat bayi telentang atau tengkurap.',
    steps: [
      'Pilih pola spiral atau wajah senyum di Kartu Kontras.',
      'Gerakkan layar perlahan membentuk busur dari kiri ke kanan.',
      'Jaga jarak nyaman 25–35 cm agar mata tetap rileks.'
    ],
    linkedSimulation: 'high-contrast'
  },

  // 6-12m
  {
    id: 'mis-612m-1',
    ageBand: '6-12m',
    pillar: 'motor-halus',
    title: 'Ambil Potongan Finger Food / Balok',
    durationLabel: '5 mnt',
    summary: 'Latih pincer grasp (menjepit dengan ibu jari dan telunjuk).',
    steps: [
      'Sajikan potongan buah kukus lembut atau benda aman seukuran ujung jari.',
      'Biarkan bayi mencoba mengambil sendiri tanpa langsung disuapi.',
      'Dampingi penuh untuk keamanan saat duduk.'
    ]
  },
  {
    id: 'mis-612m-2',
    ageBand: '6-12m',
    pillar: 'motor-kasar',
    title: 'Duduk & Raih Mainan di Samping',
    durationLabel: '5 mnt',
    summary: 'Kuatkan keseimbangan inti tubuh sebagai persiapan merangkak.',
    steps: [
      'Duduk di matras lantai dengan bantal pengaman di belakang jika belum kokoh.',
      'Letakkan mainan agak menyerong sehingga bayi belajar menoleh dan bertumpu tangan.',
      'Berikan apresiasi suara hangat saat berhasil meraihnya.'
    ]
  },
  {
    id: 'mis-612m-3',
    ageBand: '6-12m',
    pillar: 'kognitif',
    title: 'Main Cilukba Langsung (Object Permanence)',
    durationLabel: '4 mnt',
    summary: 'Ajarkan bahwa orang/benda tetap ada meski tertutup sementara.',
    steps: [
      'Tutup wajah dengan kedua telapak tangan atau selendang tipis.',
      'Buka sambil tersenyum dan ucapkan "Cilukba!" dengan nada lembut.',
      'Ulangi dengan menyembunyikan boneka kecil di bawah kain.'
    ]
  },
  {
    id: 'mis-612m-4',
    ageBand: '6-12m',
    pillar: 'bahasa',
    title: 'Rutinitas Tenang Sebelum Tidur',
    durationLabel: '10 mnt',
    summary: 'Bantu bayi mengenali sinyal istirahat lewat suara putih/lullaby konsisten.',
    steps: [
      'Redupkan lampu kamar dan hindari layar terang langsung ke mata bayi.',
      'Putar White Noise atau Lullaby dengan timer 10–20 menit di mode audio.',
      'Usap punggung perlahan sampai napas bayi melambat.'
    ],
    linkedSimulation: 'baby-soother'
  },

  // 1-2y
  {
    id: 'mis-12y-1',
    ageBand: '1-2y',
    pillar: 'kognitif',
    title: 'Simulasi Cilukba Hewan & Nama Suara',
    durationLabel: '5 mnt',
    summary: 'Kenalkan konsep sembunyi-muncul sambil melatih kosakata hewan.',
    steps: [
      'Dampingi anak mengetuk semak di layar untuk menebak hewan.',
      'Ucapkan bersama suara dan nama hewannya ("Ini sapi — moo!").',
      'Setelah selesai, ajak anak mencari boneka asli yang Anda sembunyikan.'
    ],
    linkedSimulation: 'peekaboo'
  },
  {
    id: 'mis-12y-2',
    ageBand: '1-2y',
    pillar: 'motor-halus',
    title: 'Pecahkan Gelembung Pelan',
    durationLabel: '5 mnt',
    summary: 'Latih koordinasi mata-telunjuk lewat target besar yang mudah disentuh.',
    steps: [
      'Buka Simulasi Gelembung dan biarkan anak menunjuk gelembung warna pilihannya.',
      'Dengarkan nada xilofon yang muncul di tiap sentuhan.',
      'Lanjutkan di dunia nyata dengan meniup gelembung sabun di teras.'
    ],
    linkedSimulation: 'bubblepopper'
  },
  {
    id: 'mis-12y-3',
    ageBand: '1-2y',
    pillar: 'bahasa',
    title: 'Sebutkan Warna Benda di Rumah',
    durationLabel: '5 mnt',
    summary: 'Hubungkan warna di layar dengan objek konkret di sekitar anak.',
    steps: [
      'Buka Taman Warna bersama anak untuk mendengarkan nama warna.',
      'Tantang anak mengambil 1 benda berwarna sama di ruangan (misal bantal biru).',
      'Puji usahanya alih-alih mengoreksi keras jika masih tertukar.'
    ],
    linkedSimulation: 'colors'
  },
  {
    id: 'mis-12y-4',
    ageBand: '1-2y',
    pillar: 'motor-kasar',
    title: 'Jalan Kaki Bertumpu & Lempar Bola Lunak',
    durationLabel: '10 mnt',
    summary: 'Salurkan energi berjalan dan keseimbangan berdiri toddler.',
    steps: [
      'Gelindingkan bola kain/plastik ringan ke arah anak dari jarak 1,5 meter.',
      'Ajak anak jongkok mengambil lalu mendorong bola kembali ke Anda.',
      'Ulangi sambil menghitung 1-2-3 dengan riang.'
    ]
  },

  // 2-3y
  {
    id: 'mis-23y-1',
    ageBand: '2-3y',
    pillar: 'kognitif',
    title: 'Cocokkan 4 Bentuk Dasar',
    durationLabel: '5 mnt',
    summary: 'Latih persepsi ruang dan pengelompokan bentuk sederhana.',
    steps: [
      'Mainkan Simulasi Bentuk & Warna bersama sebagai pendamping.',
      'Beri petunjuk verbal ("Coba lihat sudut segitiganya") tanpa mengambil alih layar.',
      'Cocokkan tutup toples/kotak makan di dapur sebagai lanjutan nyata.'
    ],
    linkedSimulation: 'shapes'
  },
  {
    id: 'mis-23y-2',
    ageBand: '2-3y',
    pillar: 'kognitif',
    title: 'Hitung Benda Nyata 1 sampai 5',
    durationLabel: '5 mnt',
    summary: 'Pahami makna jumlah (one-to-one correspondence), bukan sekadar hafalan.',
    steps: [
      'Buka Kebun Angka untuk melihat visual jumlah buah/bintang.',
      'Setelah itu, susun 3–5 sendok atau balok di meja dan hitung satu per satu sambil menunjuk.',
      'Tanyakan "Ada berapa balok di tangan Adik?"'
    ],
    linkedSimulation: 'numbers'
  },
  {
    id: 'mis-23y-3',
    ageBand: '2-3y',
    pillar: 'motor-kasar',
    title: 'Ikuti Gerakan Aktif Bergantian',
    durationLabel: '6 mnt',
    summary: 'Latih keseimbangan tubuh dan mengikuti instruksi 1–2 langkah.',
    steps: [
      'Buka Gerak Ceria dan pilih gerakan bersama anak.',
      'Ikut bergerak langsung bersama anak agar menjadi momen bonding aktif.',
      'Sediakan ruang lantai bebas barang tajam.'
    ],
    linkedSimulation: 'motor'
  },
  {
    id: 'mis-23y-4',
    ageBand: '2-3y',
    pillar: 'bahasa',
    title: 'Eksplorasi Bunyi Hewan & Instrumen',
    durationLabel: '5 mnt',
    summary: 'Asah diskriminasi bunyi dan nyanyian sederhana.',
    steps: [
      'Buka Musik & Hewan lalu minta anak menebak suara apa yang muncul.',
      'Ciptakan irama pelan-cepat di papan xilofon bersama.',
      'Ajak anak bercerita tentang hewan favoritnya.'
    ],
    linkedSimulation: 'sensory'
  },

  // 3-5y
  {
    id: 'mis-35y-1',
    ageBand: '3-5y',
    pillar: 'motor-halus',
    title: 'Menebalkan Garis & Huruf Awal',
    durationLabel: '6 mnt',
    summary: 'Perkuat kontrol jari dan arah goresan sebelum memegang pensil lama.',
    steps: [
      'Buka Tebalkan Garis & Huruf dan minta anak mengikuti panah arah.',
      'Setelah 1 sesi, beri krayon pendek/kapur di kertas besar untuk meniru garis serupa.',
      'Fokus pada keluwesan gerak jari, bukan kesempurnaan garis.'
    ],
    linkedSimulation: 'trace'
  },
  {
    id: 'mis-35y-2',
    ageBand: '3-5y',
    pillar: 'kognitif',
    title: 'Kenali Huruf Awal Namanya',
    durationLabel: '5 mnt',
    summary: 'Bangun kesadaran fonemik lewat huruf yang paling bermakna bagi anak.',
    steps: [
      'Buka Taman Huruf dan cari huruf pertama nama panggilan anak.',
      'Ucapkan bunyi hurufnya dan cari 2 benda di rumah yang berawalan sama.',
      'Biarkan anak memilih sendiri huruf berikutnya.'
    ],
    linkedSimulation: 'alphabet'
  },
  {
    id: 'mis-35y-3',
    ageBand: '3-5y',
    pillar: 'motor-halus',
    title: 'Selesaikan Puzzle & Mewarnai Bebas',
    durationLabel: '8 mnt',
    summary: 'Latih ketekunan menyelesaikan tugas dan ekspresi warna.',
    steps: [
      'Minta anak menyelesaikan 1 papan Puzzle Sederhana atau 1 gambar Mewarnai.',
      'Tanyakan alasan pemilihan warna ("Kenapa atapnya hijau?").',
      'Hargai proses dan fokusnya sampai selesai.'
    ],
    linkedSimulation: 'puzzle'
  },
  {
    id: 'mis-35y-4',
    ageBand: '3-5y',
    pillar: 'bahasa',
    title: 'Cerita Balik Aktivitas Hari Ini',
    durationLabel: '5 mnt',
    summary: 'Latih struktur cerita (awal–tengah–akhir) dan penamaan emosi.',
    steps: [
      'Tanyakan "Tadi pas main paling seru bagian mana?" sebelum tidur.',
      'Bantu anak menamai perasaannya (senang, kesal, bangga).',
      'Catat momen lucunya di tab Catatan!'
    ]
  }
];

export const MILESTONES: MilestoneItem[] = [
  // 0-3m
  { id: 'ms-03m-1', ageBand: '0-3m', pillar: 'motor-kasar', text: 'Mengangkat kepala sebentar (45°) saat tengkurap (tummy time)' },
  { id: 'ms-03m-2', ageBand: '0-3m', pillar: 'kognitif', text: 'Menatap wajah orang tua dan mengikuti gerak benda jarak dekat' },
  { id: 'ms-03m-3', ageBand: '0-3m', pillar: 'bahasa', text: 'Tersenyum sosial saat diajak bicara atau disapa hangat' },
  { id: 'ms-03m-4', ageBand: '0-3m', pillar: 'bahasa', text: 'Mengeluarkan suara vokal lembut (cooing seperti "ooh/aah")' },
  { id: 'ms-03m-5', ageBand: '0-3m', pillar: 'motor-halus', text: 'Mulai membuka kepalan tangan dan menggerakkan lengan simetris' },

  // 3-6m
  { id: 'ms-36m-1', ageBand: '3-6m', pillar: 'motor-kasar', text: 'Menahan kepala tegak stabil saat digendong duduk & bertumpu siku' },
  { id: 'ms-36m-2', ageBand: '3-6m', pillar: 'motor-kasar', text: 'Mulai berguling dari telungkup ke telentang (atau sebaliknya)' },
  { id: 'ms-36m-3', ageBand: '3-6m', pillar: 'motor-halus', text: 'Meraih dan menggenggam mainan di depan jangkauan tangan' },
  { id: 'ms-36m-4', ageBand: '3-6m', pillar: 'bahasa', text: 'Tertawa lepas dan menoleh ke arah sumber suara lembut' },
  { id: 'ms-36m-5', ageBand: '3-6m', pillar: 'kognitif', text: 'Memasukkan tangan atau mainan bersih ke mulut untuk eksplorasi' },

  // 6-12m
  { id: 'ms-612m-1', ageBand: '6-12m', pillar: 'motor-kasar', text: 'Duduk sendiri tanpa topangan dan mulai merangkak / merayap' },
  { id: 'ms-612m-2', ageBand: '6-12m', pillar: 'motor-halus', text: 'Memindahkan benda antar-tangan dan menjepit benda kecil (pincer grasp)' },
  { id: 'ms-612m-3', ageBand: '6-12m', pillar: 'bahasa', text: 'Menoleh saat namanya dipanggil dan berceloteh suku kata ("mama/baba")' },
  { id: 'ms-612m-4', ageBand: '6-12m', pillar: 'kognitif', text: 'Mencari mainan yang disembunyikan di balik kain (object permanence)' },
  { id: 'ms-612m-5', ageBand: '6-12m', pillar: 'bahasa', text: 'Melambaikan tangan (dadah) atau meniru gestur sederhana' },

  // 1-2y
  { id: 'ms-12y-1', ageBand: '1-2y', pillar: 'motor-kasar', text: 'Berjalan mandiri lancar dan mulai mencoba menaiki anak tangga rendah' },
  { id: 'ms-12y-2', ageBand: '1-2y', pillar: 'motor-halus', text: 'Menumpuk 2–4 balok dan mencoret bebas dengan krayon besar' },
  { id: 'ms-12y-3', ageBand: '1-2y', pillar: 'bahasa', text: 'Mengucapkan minimal 5–20 kata bermakna dan menunjuk benda yang diinginkan' },
  { id: 'ms-12y-4', ageBand: '1-2y', pillar: 'kognitif', text: 'Memahami instruksi 1 langkah sederhana ("Ambil bolanya")' },
  { id: 'ms-12y-5', ageBand: '1-2y', pillar: 'bahasa', text: 'Menunjukkan minat bermain pura-pura sederhana (suap boneka, telepon)' },

  // 2-3y
  { id: 'ms-23y-1', ageBand: '2-3y', pillar: 'motor-kasar', text: 'Berlari stabil, melompat dengan kedua kaki, dan menendang bola ke depan' },
  { id: 'ms-23y-2', ageBand: '2-3y', pillar: 'motor-halus', text: 'Membuka halaman buku satu per satu & memutar pegangan/tutup wadah' },
  { id: 'ms-23y-3', ageBand: '2-3y', pillar: 'bahasa', text: 'Merangkai kalimat 2–3 kata ("Mau minum susu") dengan jelas untuk keluarga' },
  { id: 'ms-23y-4', ageBand: '2-3y', pillar: 'kognitif', text: 'Mengelompokkan benda menurut warna atau bentuk dasar yang sama' },
  { id: 'ms-23y-5', ageBand: '2-3y', pillar: 'bahasa', text: 'Meniru dan mulai bermain di dekat anak sebaya (parallel play)' },

  // 3-5y
  { id: 'ms-35y-1', ageBand: '3-5y', pillar: 'motor-kasar', text: 'Berdiri satu kaki 3–5 detik, melompat ke depan, atau mengayuh sepeda roda tiga' },
  { id: 'ms-35y-2', ageBand: '3-5y', pillar: 'motor-halus', text: 'Meniru gambar garis lurus, lingkaran, atau memegang alat tulis dengan nyaman' },
  { id: 'ms-35y-3', ageBand: '3-5y', pillar: 'bahasa', text: 'Bercerita singkat menggunakan kalimat lengkap & sering bertanya "kenapa?"' },
  { id: 'ms-35y-4', ageBand: '3-5y', pillar: 'kognitif', text: 'Menghitung 5–10 benda berurutan & mengenal beberapa huruf/warna utama' },
  { id: 'ms-35y-5', ageBand: '3-5y', pillar: 'bahasa', text: 'Mau bergantian saat bermain dan memakai baju/sepatu sederhana dibantu minimal' }
];

export const SIMULATION_MODULES: SimulationModuleMeta[] = [
  // 3 Baby Tools (0-12m) - Exempt from toddler screen-time lock
  {
    key: 'high-contrast',
    title: 'Kartu Kontras',
    subtitle: '8 pola tajam fokus mata bayi.',
    goalLabel: 'Fokus Visual',
    pillar: 'kognitif',
    ageBands: ['0-3m', '3-6m'],
    ageTag: '0–6 Bln',
    isBabyTool: true,
    stickerId: 'sticker-newborn',
    surfaceTint: '#F4F4F2'
  },
  {
    key: 'tummy-time',
    title: 'Tummy Time',
    subtitle: 'Timer + target harian 15 menit.',
    goalLabel: 'Kuat Leher',
    pillar: 'motor-kasar',
    ageBands: ['0-3m', '3-6m'],
    ageTag: '0–6 Bln',
    isBabyTool: true,
    stickerId: 'sticker-newborn',
    surfaceTint: '#EFF6F2'
  },
  {
    key: 'baby-soother',
    title: 'Penenang Bayi',
    subtitle: 'White noise, detak jantung, kerincingan.',
    goalLabel: 'Auditori',
    pillar: 'kognitif',
    ageBands: ['0-3m', '3-6m', '6-12m'],
    ageTag: '0–12 Bln',
    isBabyTool: true,
    stickerId: 'sticker-newborn',
    surfaceTint: '#F2F3F7'
  },

  // 12 Toddler & Preschool Simulation Games (1-5y)
  {
    key: 'peekaboo',
    title: 'Cilukba Hewan',
    subtitle: 'Ketuk semak & tebak suara.',
    goalLabel: 'Sebab-Akibat',
    pillar: 'kognitif',
    ageBands: ['6-12m', '1-2y'],
    ageTag: '1–2 Thn',
    isBabyTool: false,
    stickerId: 'sticker-peekaboo',
    surfaceTint: '#EFF7F1'
  },
  {
    key: 'bubblepopper',
    title: 'Gelembung Nada',
    subtitle: 'Pecahkan gelembung musik lembut.',
    goalLabel: 'Jari Lincah',
    pillar: 'motor-halus',
    ageBands: ['1-2y', '2-3y'],
    ageTag: '1–3 Thn',
    isBabyTool: false,
    stickerId: 'sticker-bubblepopper',
    surfaceTint: '#EEF6FB'
  },
  {
    key: 'colors',
    title: 'Taman Warna',
    subtitle: 'Kenali warna objek taman.',
    goalLabel: 'Warna',
    pillar: 'bahasa',
    ageBands: ['1-2y', '2-3y'],
    ageTag: '1–3 Thn',
    isBabyTool: false,
    stickerId: 'sticker-colors',
    surfaceTint: '#FFF6ED'
  },
  {
    key: 'sensory',
    title: 'Suara & Xilofon',
    subtitle: 'Hewan & bilah 8 nada.',
    goalLabel: 'Sensori',
    pillar: 'bahasa',
    ageBands: ['1-2y', '2-3y'],
    ageTag: '1–3 Thn',
    isBabyTool: false,
    stickerId: 'sticker-sensory',
    surfaceTint: '#FFF4EE'
  },
  {
    key: 'numbers',
    title: 'Kebun Angka',
    subtitle: 'Berhitung visual 1 sampai 10.',
    goalLabel: 'Angka',
    pillar: 'kognitif',
    ageBands: ['2-3y', '3-5y'],
    ageTag: '2–4 Thn',
    isBabyTool: false,
    stickerId: 'sticker-numbers',
    surfaceTint: '#EFF6F2'
  },
  {
    key: 'alphabet',
    title: 'Taman Huruf A–Z',
    subtitle: 'Huruf & bunyi kata awal.',
    goalLabel: 'Pra-Baca',
    pillar: 'bahasa',
    ageBands: ['2-3y', '3-5y'],
    ageTag: '2–5 Thn',
    isBabyTool: false,
    stickerId: 'sticker-alphabet',
    surfaceTint: '#F5F2FB'
  },
  {
    key: 'shapes',
    title: 'Kotak Bentuk',
    subtitle: 'Cocokkan keping ke lubangnya.',
    goalLabel: 'Logika',
    pillar: 'kognitif',
    ageBands: ['2-3y', '3-5y'],
    ageTag: '2–4 Thn',
    isBabyTool: false,
    stickerId: 'sticker-shapes',
    surfaceTint: '#EEF7F2'
  },
  {
    key: 'motor',
    title: 'Gerak Ceria',
    subtitle: 'Lompat & tepuk tangan bersama.',
    goalLabel: 'Seimbang',
    pillar: 'motor-kasar',
    ageBands: ['1-2y', '2-3y', '3-5y'],
    ageTag: '1–5 Thn',
    isBabyTool: false,
    stickerId: 'sticker-motor',
    surfaceTint: '#FFF5F0'
  },
  {
    key: 'trace',
    title: 'Tebalkan Garis',
    subtitle: 'Ikuti pola lengkung & huruf.',
    goalLabel: 'Pra-Tulis',
    pillar: 'motor-halus',
    ageBands: ['3-5y'],
    ageTag: '3–5 Thn',
    isBabyTool: false,
    stickerId: 'sticker-trace',
    surfaceTint: '#F0F5FA'
  },
  {
    key: 'coloring',
    title: 'Kanvas Warna',
    subtitle: 'Warnai gambar bebas tanpa salah.',
    goalLabel: 'Kreatif',
    pillar: 'motor-halus',
    ageBands: ['2-3y', '3-5y'],
    ageTag: '2–5 Thn',
    isBabyTool: false,
    stickerId: 'sticker-coloring',
    surfaceTint: '#FDF3F6'
  },
  {
    key: 'puzzle',
    title: 'Puzzle Gambar',
    subtitle: 'Susun potongan hewan & objek.',
    goalLabel: 'Problem Solving',
    pillar: 'kognitif',
    ageBands: ['3-5y'],
    ageTag: '3–5 Thn',
    isBabyTool: false,
    stickerId: 'sticker-puzzle',
    surfaceTint: '#F3F7EE'
  },
  {
    key: 'balloon',
    title: 'Tangkap Balon',
    subtitle: 'Ketuk balon gerak pelan.',
    goalLabel: 'Fokus',
    pillar: 'motor-halus',
    ageBands: ['2-3y', '3-5y'],
    ageTag: '2–5 Thn',
    isBabyTool: false,
    stickerId: 'sticker-balloon',
    surfaceTint: '#EFF6F9'
  }
];
