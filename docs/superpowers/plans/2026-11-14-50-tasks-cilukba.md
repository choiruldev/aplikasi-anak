# Cilukba — 50-Task Icon-First Simplification & Feature Roadmap

**Goal:** Menyederhanakan UI **Cilukba** agar terasa ringan, bersih, dan dominan ikon/visual (minim teks panjang yang bikin penuh), sekaligus menambahkan 50 fitur & peningkatan bertema tumbuh kembang anak 0–5 tahun secara nyata, teruji, dan offline-first.

---

## Batch 1 — Desain Sederhana & Sistem Ikon Visual (Tasks 1–10)

- [x] **Task 1 — `ModuleIcons.tsx`: 15 Ikon Modul Simulasi Kustom** — SVG ilustrasi datar berwarna untuk setiap modul (`sensory`, `shapes`, `trace`, `motor`, `coloring`, `puzzle`, `balloon`, `numbers`, `alphabet`, `colors`, `bubble-popper`, `peekaboo-animals`, `high-contrast`, `tummy-time`, `baby-soother`).
- [x] **Task 2 — `ModuleIcons.tsx`: Ikon Pilar, Mood, Kategori Tips, Imunisasi & Bayi** — Ikon SVG bersih untuk 4 pilar stimulasi, 3 mood catatan, 5 kategori tips, status imunisasi, serta quick-log ASI/Tidur/Popok.
- [x] **Task 3 — Header & Tab Bar Minimalis** — Pangkas teks panjang di header (`Cilukba` + pill usia ringkas) dan rapikan tab navigasi agar lega di mobile 390px maupun desktop 1280px.
- [x] **Task 4 — `StimulasiTab` Ringkas & Visual** — Hapus paragraf pembuka panjang; tampilkan hero ringkas (ikon fase + usia + badge streak + ring progress misi) dan kartu misi dengan ikon pilar + tombol ceklist 1-tap.
- [x] **Task 5 — `SimulasiTab` Grid Kartu Ikon** — Ubah kartu teks panjang menjadi kartu tile visual berikon SVG besar, tag durasi/usia singkat (`2–4 kata`), badge jumlah main (`×N`), dan tombol favorit hati.
- [x] **Task 6 — `CatatanTab` Metric Strip Visual** — Ganti subtitle panjang dengan 3 metric pill berikon (`Milestone`, `Stiker`, `Imunisasi`) + sub-tab switcher.
- [x] **Task 7 — `TipsTab` Kartu Tips Visual** — Ringkas tampilan kartu tips memakai badge ikon kategori, hook singkat 1 kalimat, badge `"Bahan Rumah"`, tombol bookmark & bagikan.
- [x] **Task 8 — `ParentDrawer` Ringkas Berikon** — Hilangkan deskripsi panjang di tiap kontrol; pakai baris toggle berikon, stepper durasi ringkas, dan pemilih mode terang/malam.
- [x] **Task 9 — Mode Tenang / Malam (`night`)** — Tambah token warna `data-theme="night"` redup ramah mata untuk sesi malam & modul bayi, lengkap dengan toggle di topbar & `ParentDrawer`.
- [x] **Task 10 — Penyederhanaan Bahasa UI Global** — Konsistensikan seluruh label tombol, chip filter, dan modal menjadi 1–3 kata yang jelas tanpa tembok teks.

## Batch 2 — Core Engine: Multi-Anak, Bayi 0–12 Bln, Kurva, Imunisasi, Rutinitas, Statistik & Backup (Tasks 11–20)

- [x] **Task 11 — `profilesStorage.ts`: Profil Multi-Anak & Migrasi Aman** — Dukungan beberapa profil anak (nama, tanggal lahir/fase, avatar ikon) dengan migrasi otomatis dari data lama `kecilmain.*` tanpa kehilangan progress.
- [x] **Task 12 — `babyCareStorage.ts`: Logger Cepat 0–12 Bulan** — Simpan log 1-tap ASI/Susu, Tidur, dan Popok per profil & tanggal lengkap dengan ringkasan jumlah harian & waktu terakhir.
- [x] **Task 13 — `growthReference.ts`: Kurva Referensi Pertumbuhan & Sparkline** — Hitung rentang referensi berat/tinggi usia 0–60 bulan (konteks non-diagnostik) dan koordinat SVG sparkline grafik tumbuh.
- [x] **Task 14 — `immunizationData.ts`: Checklist Jadwal Imunisasi & Vit A (0–5 Thn)** — Daftar standar imunisasi dasar & lanjutan IDAI/KIA beserta status centang tersimpan di jurnal.
- [x] **Task 15 — `routineData.ts`: Rutinitas Harian & Ide Main Bahan Rumah** — Paket rutinitas Pagi/Siang/Sore/Malam per rentang usia + filter ide main nol-layar berbahan rumah tangga.
- [x] **Task 16 — `stats.ts`: Streak Harian & Keseimbangan 4 Pilar** — Kalkulasi streak aktif (`streakDays`), ringkasan main, dan persentase keseimbangan 4 pilar stimulasi.
- [x] **Task 17 — `backup.ts`: Ekspor & Impor JSON Tervalidasi** — Ekspor backup lengkap (`profil + progress + jurnal + log bayi`) dan validasi ketat saat impor kembali.
- [x] **Task 18 — `storage.ts`: Favorit Simulasi, Play Counts, Tummy Time & Night Mode** — Tambah persistensi `favoriteModules`, `nightMode`, `tummyTimeSeconds`, dan `activeDates`.
- [x] **Task 19 — `journalStorage.ts`: Mood Harian, Tag Momen & Checklist Imunisasi** — Tambah `tags`, `completedRoutineIds`, dan `completedImmunizations` secara backward-compatible.
- [x] **Task 20 — Suite Unit Test TDD Baru** — Uji semua modul engine (`profilesStorage`, `babyCareStorage`, `growthReference`, `immunizationData`, `routineData`, `stats`, `backup`, `stickersMeta`) via `npm test`.

## Batch 3 — Pengayaan Modul Bayi 0–12 Bulan & Album Stiker (Tasks 21–30)

- [x] **Task 21 — `HighContrastCards`: +2 Kartu Baru (Total 8 Pola)** — Tambah pola *Bintang Kontras* dan *Ombak Lembut* kontras tinggi untuk stimulasi visual 0–6 bulan.
- [x] **Task 22 — `HighContrastCards`: Geser Sentuh & Auto-Slide Pelan** — Tambah dukungan swipe kiri/kanan di layar sentuh dan toggle auto-slide sangat pelan (15 detik/kartu).
- [x] **Task 23 — `TummyTimeGuide`: Target Harian 15 Menit & Progress Ring** — Simpan akumulasi durasi tummy time hari ini dan tampilkan ring progres visual menuju target 15 menit.
- [x] **Task 24 — `TummyTimeGuide`: Tombol Preset & Umpan Balik Lembut** — Tambah preset cepat `1/3/5 mnt`, tombol `+1 mnt`, dan chime lembut saat sesi selesai.
- [x] **Task 25 — `BabySoother`: Mode Detak Jantung 60 BPM** — Sintesis audio Web Audio ritme detak jantung lembut `60 BPM` (zero network) untuk menenangkan bayi 0–6 bulan.
- [x] **Task 26 — `BabySoother`: Mode Malam Tenang + Dimmer Layar** — Tambah mode suara malam lembut dan tombol peredup layar hangat langsung di modul penenang.
- [x] **Task 27 — `BabySoother`: Stereo Pan Kiri / Tengah / Kanan pada Kerincingan** — Gunakan `StereoPannerNode` pada pad kerincingan untuk melatih pelacakan pendengaran bayi.
- [x] **Task 28 — `BabySoother`: Lingkaran Napas Tenang 30 Detik (Opt-in)** — Panduan visual lingkaran napas tenang (hanya aktif saat tombol ditekan pengguna) untuk membantu orang tua menenangkan bayi.
- [x] **Task 29 — `StickerAlbumModal`: 14 Stiker Lengkap dengan SVG Kustom** — Tambah 4 stiker baru (`sticker-peekaboo`, `sticker-bubblepopper`, `sticker-newborn`, `sticker-streak`) sehingga semua modul & pencapaian punya stiker unik.
- [x] **Task 30 — Trigger Hadiah Stiker di Semua Simulasi** — Hubungkan penyelesaian `PeekabooAnimals`, `BubblePopper`, modul bayi, dan streak ke `StickerAlbumModal` & toast hadiah.

## Batch 4 — Peningkatan Tab Utama, Co-Play Mode & Kartu Bagikan (Tasks 31–40)

- [x] **Task 31 — `ChildFocusShell`: Tombol Tip Co-Play 1-Tap** — Tambah tombol ikon lampu di topbar mode anak untuk melihat panduan interaksi orang tua tanpa keluar dari permainan.
- [x] **Task 32 — `ChildFocusShell`: Toast Hadiah Stiker & Mode Istirahat** — Tambah notifikasi visual lembut saat stiker baru terbuka dan ikon visual tenang di layar kunci timer harian.
- [x] **Task 33 — `StimulasiTab`: Checklist Rutinitas Harian & Progress Ring** — Integrasikan widget ringkas Rutinitas Harian (Pagi/Siang/Sore/Malam) + ring keseimbangan 4 pilar + pintasan modul rekomendasi.
- [x] **Task 34 — `SimulasiTab`: Sorotan Rekomendasi Usia & Filter Favorit** — Tambah strip `"Cocok Hari Ini"` sesuai usia anak, filter chip `"Favorit ♥"`, serta pengurutan visual bersih.
- [x] **Task 35 — `CatatanTab`: Grafik SVG Kurva Berat & Tinggi Badan** — Render grafik garis SVG inline riwayat berat & tinggi + area pita referensi usia (non-diagnostik).
- [x] **Task 36 — `CatatanTab`: Panel 0–12 Bln & Checklist Imunisasi Visual** — Tambah panel 1-tap ASI/Tidur/Popok dan tab daftar imunisasi IDAI/KIA berikon ceklist.
- [x] **Task 37 — `CatatanTab`: Filter Status Milestone & Tag Mood Harian** — Tambah chip filter milestone (`Semua`/`Belum`/`Tercapai`) dan tag mood 1-tap (`Ceria`, `Tenang`, `Rewel`) di catatan harian.
- [x] **Task 38 — `CatatanTab`: Generator Kartu Milestone PNG & Bagikan WhatsApp** — Buat utilitas canvas 100% lokal untuk mengunduh/membagikan kartu pencapaian anak dengan ikon Cilukba.
- [x] **Task 39 — `TipsTab`: Filter "Sesuai Usia", "Bahan Rumah" & Cek Siaga 5 Poin** — Tambah toggle pintar usia aktif, filter ide main bahan rumah, tombol bagikan tips, dan modal cepat 5 poin Cek Siaga Perkembangan.
- [x] **Task 40 — `ParentDrawer`: Switcher Multi-Anak & Backup Ekspor/Impor** — Kelola tambah/ganti profil anak, avatar ikon, serta tombol ekspor/impor JSON langsung dari laci orang tua.

## Batch 5 — Integrasi App Shell, Styling Ringkas, Audit Visual & Verifikasi Final (Tasks 41–50)

- [x] **Task 41 — `App.tsx`: Orkestrasi State Profil Multi-Anak & Tema** — Hubungkan pergantian profil anak (`switchProfile`, `addProfile`, `deleteProfile`) ke settings, progress, journal, dan baby-care log secara sinkron.
- [x] **Task 42 — `App.tsx`: Hubungkan Co-Play Tip, Favorit, Tummy Progress & Backup** — Wiring penuh handler favorit simulasi, tummy-time daily goal, toast stiker baru, dan ekspor/impor JSON.
- [x] **Task 43 — `styles.css`: Sistem Layout Kartu Ikon & Density Sederhana** — Refactor CSS grid, spacing, card shadow lembut, icon tile badge, dan tipografi pendek di `Stimulasi`, `Simulasi`, `Catatan`, dan `Tips`.
- [x] **Task 44 — `styles.css`: Styling Grafik Kurva SVG, Mode Malam & Responsive 390px** — Pastikan chart SVG, chip filter, baby logger pills, dan dialog aman dari overflow pada viewport mobile `390x844`.
- [x] **Task 45 — Audit Aksesibilitas & Label Pendek** — Pastikan seluruh tombol ikon memiliki `aria-label` jelas, kontras teks/ikon aman di mode terang & malam, dan `prefers-reduced-motion` tetap terjaga.
- [x] **Task 46 — Jalankan Seluruh Unit & Katalog Test (`npm test`)** — Verifikasi 100% test lulus (`37/37` test) tanpa skip atau assertion yang dilonggarkan.
- [x] **Task 47 — TypeScript Check & Production Build (`npx tsc -b && npm run build`)** — Pastikan kompilasi ketat bebas error dan asset PWA precache ter-bundle bersih.
- [x] **Task 48 — Verifikasi Browser Headless Desktop & Mobile** — Jalankan `vite preview` + skrip Chrome CDP untuk memverifikasi 0 console error, 0 page exception, dan 0 horizontal overflow di semua tab & modul baru.
- [x] **Task 49 — Inspeksi Visual Screenshot Seluruh Tampilan** — Baca screenshot hasil render terbaru (`desktop 1280x800` & `mobile 390x844` + mode malam/kurva/baby tools) dan perbaiki temuan UI jika ada.
- [x] **Task 50 — Finalisasi Checklist Plan, Git Commit & Deploy** — Tandai seluruh 50 task selesai (`[x]`), commit rapi ke `main`, serta push/verifikasi live GitHub Pages bila aman.
