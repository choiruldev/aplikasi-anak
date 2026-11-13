import type { AgeBand } from '../lib/development.ts';

export type TipCategory =
  | 'Newborn'
  | 'Nutrisi & MPASI'
  | 'Screen Time'
  | 'Emosi & Tantrum'
  | 'Tanda Waspada';

export interface ParentingTip {
  id: string;
  category: TipCategory;
  ageBands: AgeBand[];
  title: string;
  hook: string;
  actionPoints: [string, string, string];
  reminder: string;
}

export const TIP_CATEGORIES: TipCategory[] = [
  'Newborn',
  'Nutrisi & MPASI',
  'Screen Time',
  'Emosi & Tantrum',
  'Tanda Waspada'
];

export const TIPS_DATA: ParentingTip[] = [
  // Newborn
  {
    id: 'tip-nb-1',
    category: 'Newborn',
    ageBands: ['0-3m'],
    title: 'Tummy Time Itu Nyicil, Bukan Maraton',
    hook: 'Cukup mulai 1–2 menit per sesi tapi sering, daripada sekali lama lalu bayi menangis.',
    actionPoints: [
      'Mulai di atas dada orang tua (skin-to-skin miring) supaya bayi merasa aman.',
      'Gunakan timer 1 menit di awal lalu tambah pelan tiap minggu.',
      'Lakukan setelah ganti popok saat bayi segar, bukan tepat setelah menyusu.'
    ],
    reminder: 'Total 15–30 menit kumulatif dalam sehari sudah bagus di bulan-bulan pertama.'
  },
  {
    id: 'tip-nb-2',
    category: 'Newborn',
    ageBands: ['0-3m', '3-6m'],
    title: 'Kenapa Newborn Suka Kartu Hitam-Putih?',
    hook: 'Penglihatan bayi 0–3 bulan baru fokus jelas di jarak 20–30 cm dengan kontras tinggi.',
    actionPoints: [
      'Posisikan kartu kontras sekitar sejengkal orang dewasa dari mata bayi.',
      'Biarkan bayi menatap 1 pola selama 10–15 detik sebelum digeser.',
      'Hentikan jika bayi membuang muka atau mengucek mata (tanda lelah sensori).'
    ],
    reminder: 'Wajah orang tua yang tersenyum tetap stimulus visual terbaik bagi bayi.'
  },
  {
    id: 'tip-nb-3',
    category: 'Newborn',
    ageBands: ['0-3m', '3-6m'],
    title: 'Cara Tidur Aman Tanpa Bantal Tebal',
    hook: 'Kasur datar, bebas bantal longgar dan boneka, membuat napas bayi tetap lega.',
    actionPoints: [
      'Tidurkan bayi dalam posisi telentang di atas permukaan rata dan padat.',
      'Lepas selimut tebal longgar atau ganti dengan sleep sack yang pas di leher.',
      'Jaga suhu kamar nyaman (sekitar 24–26°C) dan tidak terlalu pengap.'
    ],
    reminder: 'Jika bayi mulai berguling mandiri di usia 4+ bulan, hentikan bedong ketat.'
  },
  {
    id: 'tip-nb-4',
    category: 'Newborn',
    ageBands: ['0-3m', '3-6m'],
    title: 'Bedakan Tangis Lelah vs Overstimulasi',
    hook: 'Tidak semua rewel berarti kurang mainan; kadang bayi justru butuh jeda sunyi.',
    actionPoints: [
      'Perhatikan tanda awal lelah: tatapan kosong, alis merah, menguap, menoleh menjauh.',
      'Kurangi cahaya terang, hentikan ajakan bermain, lalu gendong dekat dada.',
      'Putar white noise lembut atau bersenandung pelan berulang.'
    ],
    reminder: 'Orang tua yang tetap tenang membantu sistem saraf bayi ikut regulasi.'
  },

  // Nutrisi & MPASI
  {
    id: 'tip-mpasi-1',
    category: 'Nutrisi & MPASI',
    ageBands: ['3-6m', '6-12m'],
    title: 'Sinyal Siap MPASI Bukan Cuma Usia 6 Bulan',
    hook: 'Pastikan kesiapan fisik leher dan minat makan sebelum suapan pertama dimulai.',
    actionPoints: [
      'Kepala tegak stabil dan mampu duduk dengan sedikit topangan.',
      'Refleks menjulurkan lidah (extrusion reflex) mulai berkurang.',
      'Tertarik meraih makanan dan membuka mulut saat sendok mendekat.'
    ],
    reminder: 'Konsultasikan jadwal awal MPASI bila bayi lahir prematur.'
  },
  {
    id: 'tip-mpasi-2',
    category: 'Nutrisi & MPASI',
    ageBands: ['6-12m'],
    title: 'Menu Lengkap Sejak Hari Pertama MPASI',
    hook: 'Buah saja kurang padat energi dan zat besi; bayi butuh karbohidrat, prohe, dan lemak.',
    actionPoints: [
      'Masukkan protein hewani tiap hari (telur, daging, ayam, hati ayam, atau ikan).',
      'Tambahkan lemak tambahan (minyak zaitun/kelapa, santan, atau mentega tawar).',
      'Sesuaikan tekstur bertahap: lumat 6 bln, cincang halus 9 bln, makanan keluarga 12 bln.'
    ],
    reminder: 'Terapkan feeding rules: durasi makan maksimal 30 menit tanpa paksaan.'
  },
  {
    id: 'tip-mpasi-3',
    category: 'Nutrisi & MPASI',
    ageBands: ['1-2y', '2-3y'],
    title: 'Hadapi Fase GTM Tanpa Drama Layar',
    hook: 'Mengalihkan makan dengan video sering membuat anak tidak sadar rasa kenyang.',
    actionPoints: [
      'Buat jadwal makan & camilan teratur berjarak 2,5–3 jam agar rasa lapar terbentuk.',
      'Libatkan toddler memilih 1 dari 2 menu sehat atau menyendok sendiri.',
      'Bila menolak setelah 15–20 menit, akhiri sesi dengan netral tanpa marah.'
    ],
    reminder: 'Tumbuh lambat nafsu makan di usia 1–2 tahun wajar karena laju tumbuh lebih landai dibanding bayi.'
  },
  {
    id: 'tip-mpasi-4',
    category: 'Nutrisi & MPASI',
    ageBands: ['6-12m', '1-2y', '2-3y', '3-5y'],
    title: 'Pantau Berat & Tinggi Secara Tren, Bukan Sekali Timbang',
    hook: 'Satu angka statis kurang bermakna dibanding arah kurva pertumbuhan antar bulan.',
    actionPoints: [
      'Catat berat dan tinggi setiap bulan setelah ke Posyandu atau DSA.',
      'Amati apakah garis berat naik sejajar pita kurva KIA, bukan stagnan 2 bulan berturut.',
      'Gunakan tab Catatan di aplikasi ini untuk menyimpan riwayat singkat.'
    ],
    reminder: 'Bawa catatan tren pertumbuhan saat pemeriksaan rutin.'
  },

  // Screen Time
  {
    id: 'tip-screen-1',
    category: 'Screen Time',
    ageBands: ['0-3m', '3-6m', '6-12m'],
    title: 'Aturan Layar di Bawah 18–24 Bulan',
    hook: 'Otak bayi belajar paling cepat dari interaksi tatap muka 3D dan benda nyata.',
    actionPoints: [
      'Hindari video pasif untuk anak di bawah 18 bulan (kecuali video call keluarga).',
      'Gunakan fitur Pengantar Tidur hanya sebagai audio dengan layar diletakkan menjauh.',
      'Pakai Kartu Kontras seperlunya 2–5 menit sambil tetap berinteraksi langsung.'
    ],
    reminder: 'Mainan sederhana + suara Anda jauh mengalahkan tontonan otomatis.'
  },
  {
    id: 'tip-screen-2',
    category: 'Screen Time',
    ageBands: ['1-2y', '2-3y', '3-5y'],
    title: 'Co-Play: Main Bersama Lebih Bernilai daripada Solo Screen',
    hook: 'Simulasi di layar berubah jadi stimulasi bahasa saat orang tua ikut memberi narasi.',
    actionPoints: [
      'Dampingi dan tanyakan "Mana yang warna kuning?" alih-alih meninggalkan gawai.',
      'Hubungkan hasil permainan dengan benda asli di kamar ("Ayo cari 3 bantal!").',
      'Pasang batas harian 15–30 menit di Pengaturan Anak sebelum sesi dimulai.'
    ],
    reminder: 'Sepakati durasi sebelum bermain supaya transisi berhenti tidak mengejutkan.'
  },
  {
    id: 'tip-screen-3',
    category: 'Screen Time',
    ageBands: ['1-2y', '2-3y', '3-5y'],
    title: 'Trik Berhenti Layar Tanpa Meledak',
    hook: 'Anak kecil sulit pindah aktivitas mendadak karena belum punya konsep waktu.',
    actionPoints: [
      'Beri hitungan mundur hangat: "Dua kali main lagi lalu kita simpan tablet ya."',
      'Biarkan anak sendiri yang menekan tombol keluar sebagai kontrol kecil.',
      'Siapkan aktivitas transisi menarik (minum air, pelukan, main balok).'
    ],
    reminder: 'Konsisten lebih penting daripada durasi panjang yang penuh negosiasi.'
  },

  // Emosi & Tantrum
  {
    id: 'tip-emo-1',
    category: 'Emosi & Tantrum',
    ageBands: ['1-2y', '2-3y'],
    title: 'Validasi Dulu, Baru Koreksi Setelah Tenang',
    hook: 'Saat anak tantrum, bagian otak logisnya sedang "mati"; ceramah panjang tidak akan masuk.',
    actionPoints: [
      'Pastikan lingkungan sekitar aman dari benda keras, lalu turunkan posisi sejajar anak.',
      'Ucapkan kalimat pendek: "Adik kesal ya mainannya jatuh. Ibu temani di sini."',
      'Tunggu tangis mereda baru ajari cara meminta atau merapikan bersama.'
    ],
    reminder: 'Validasi emosi tidak sama dengan menuruti semua keinginan.'
  },
  {
    id: 'tip-emo-2',
    category: 'Emosi & Tantrum',
    ageBands: ['1-2y', '2-3y', '3-5y'],
    title: 'Beri Dua Pilihan Terbatas',
    hook: 'Toddler ingin merasa punya kendali; pilihan tertutup mencegah perang kekuasaan.',
    actionPoints: [
      'Alih-alih bertanya "Mau mandi sekarang?", tawarkan "Mau bawa bebek kuning atau perahu saat mandi?"',
      'Kedua pilihan harus sama-sama bisa Anda terima hasilnya.',
      'Jika anak masih ragu, hitung lembut sampai lima lalu bantu arahkan.'
    ],
    reminder: 'Dua pilihan cukup; terlalu banyak opsi malah membuat balita kewalahan.'
  },
  {
    id: 'tip-emo-3',
    category: 'Emosi & Tantrum',
    ageBands: ['2-3y', '3-5y'],
    title: 'Ajarkan Kata Emosi di Saat Santai',
    hook: 'Anak yang punya kosakata "kecewa, kaget, bangga" lebih jarang meluapkannya lewat pukulan.',
    actionPoints: [
      'Namai perasaan tokoh di buku cerita atau saat bermain peran boneka.',
      'Ceritakan juga perasaan Anda secara sehat ("Ayah capek, Ayah mau tarik napas dulu").',
      'Latih "tiup lilin" (tarik napas hidung, tiup pelan) saat kondisi ceria.'
    ],
    reminder: 'Anak meniru cara orang tua merespons stres harian.'
  },
  {
    id: 'tip-emo-4',
    category: 'Emosi & Tantrum',
    ageBands: ['0-3m', '3-6m', '6-12m', '1-2y', '2-3y', '3-5y'],
    title: 'Parent Check-In: Cukup Baik Itu Sudah Hebat',
    hook: 'Stimulasi terbaik lahir dari orang tua yang waras dan cukup istirahat, bukan jadwal sempurna.',
    actionPoints: [
      'Tidak semua misi harian harus dicentang setiap hari; jadikan panduan fleksibel.',
      'Tukar giliran menjaga 15–20 menit dengan pasangan atau keluarga bila penat.',
      'Rayakan hal kecil: 10 menit bermain fokus tanpa HP sudah sangat berarti.'
    ],
    reminder: 'Anda mengenal ritme anak Anda lebih baik daripada standar media sosial mana pun.'
  },

  // Tanda Waspada
  {
    id: 'tip-red-1',
    category: 'Tanda Waspada',
    ageBands: ['0-3m', '3-6m'],
    title: 'Kapan Perlu Cek Bayi 0–6 Bulan ke Dokter',
    hook: 'Deteksi dini selalu lebih ringan ditangani daripada menunggu "nanti juga bisa sendiri".',
    actionPoints: [
      'Belum ada kontak mata atau tidak merespons senyum/suara keras di usia 3–4 bulan.',
      'Tubuh terasa sangat lemas seperti boneka kain atau sangat kaku terus-menerus.',
      'Tampak hanya menggerakkan satu sisi lengan/tungkai jauh lebih dominan.'
    ],
    reminder: 'Konten ini edukasi umum, bukan diagnosis. Konsultasikan ke Puskesmas/DSA bila ragu.'
  },
  {
    id: 'tip-red-2',
    category: 'Tanda Waspada',
    ageBands: ['6-12m'],
    title: 'Tanda Perlu Konsultasi di Usia 6–12 Bulan',
    hook: 'Perhatikan ketertarikan komunikasi dua arah, bukan sekadar berat badan.',
    actionPoints: [
      'Belum mampu duduk sendiri dengan tegak saat mendekati usia 9–10 bulan.',
      'Jarang menoleh ketika namanya dipanggil dari jarak dekat dalam kondisi tenang.',
      'Tidak berceloteh suku kata ("ba/ma") atau tidak menunjuk/melambai di usia 12 bulan.'
    ],
    reminder: 'Bawa ringkasan Catatan & grafik KMS saat kontrol bulanan.'
  },
  {
    id: 'tip-red-3',
    category: 'Tanda Waspada',
    ageBands: ['1-2y', '2-3y', '3-5y'],
    title: 'Red Flag Bicara & Sosial Balita (1–5 Tahun)',
    hook: 'Setiap anak punya tempo sendiri, namun kehilangan kemampuan yang sudah dimiliki wajib dicek.',
    actionPoints: [
      'Kehilangan kata atau keterampilan sosial yang sebelumnya sudah bisa dilakukan (regresi).',
      'Usia 18 bulan belum ada kata bermakna, atau usia 2 tahun belum merangkai 2 kata spontan.',
      'Menghindari kontak mata terus-menerus atau sangat sulit ditenangkan berulang kali.'
    ],
    reminder: 'Jika ada kekhawatiran, segera kunjungi dokter anak / klinik tumbuh kembang tepercaya.'
  }
];
