# Desain Platform Pendamping Stimulasi Tumbuh Kembang Anak (0–5 Tahun)

**Tanggal:** 13 November 2026
**Status:** Final Draft — Siap Persetujuan untuk Implementasi

## 1. Tujuan & Arah Produk (Intent & Why)
Mengubah **KecilMain** dari sekadar koleksi game anak (1–5 tahun) menjadi **platform pendamping stimulasi tumbuh kembang anak usia 0–5 tahun** (mulai dari bayi baru lahir) yang ditujukan untuk **orang tua generasi Gen Z**.

Prinsip utamanya:
- **Bukan sekadar situs main game.** Fokus utamanya adalah **stimulasi tumbuh kembang anak** dan **simulasi interaktif pendukungnya**.
- **Simpel, visual, ala tren saat ini.** Tampilan bersih bergaya *editorial/bento* (*warm off-white canvas* `#FAFAF8`, kartu putih datar `#FFFFFF` dengan batas halus `1px solid #EAE6DD`, tipografi jelas dengan angka tabular, bebas tumpukan gradien mencolok atau animasi idle yang membuat mata lelah).
- **Zero-friction (langsung pakai tanpa login).** Seluruh profil anak, progres stimulasi harian, checklist milestone, dan log berat/tinggi tersimpan offline-first di perangkat pengguna (`localStorage`) dan tetap siap menjadi PWA tanpa koneksi internet.

### Non-Goals & Anti-Goals
- **Bukan pengganti dokter anak / rekam medis klinis.** Checklist milestone memakai acuan edukatif umum dan menyertakan pengingat wajar bahwa evaluasi resmi dilakukan bersama dokter anak / bidan / posyandu.
- **Tidak ada backend/login akun pada tahap ini.** Tidak menambah server, database eksternal, atau form registrasi yang menghambat penggunaan instan.
- **Tidak ada animasi idle CSS yang bergerak terus-menerus.** Seluruh dashboard orang tua maupun modul 0–12 bulan tetap tenang saat diam (*calm by default*, hanya merespons sentuhan). Untuk 12 game interaktif 1–5 tahun, mekanik gameplay intinya (seperti fisika gelembung di *Pesta Gelembung* dan balon naik di *Tangkap Balon*) dipertahankan utuh sesuai perbaikan performa 60fps sebelumnya.

## 2. Arsitektur & Pendekatan Terpilih
**Pendekatan yang Dipilih: Companion App 4-Tab Ala Gen Z (Parent-First + Child Focus Mode).**

Mengapa pendekatan ini dipilih dibanding mempertahankan beranda lama (hanya grid game):
Orang tua dengan bayi 0–12 bulan tidak mencari game sentuh-sentuh balita saat membuka aplikasi; mereka mencari panduan cepat apa yang bisa distimulasi hari ini sesuai umur bayinya, tempat mencatat milestone, dan tips ringkas. Dengan menjadikan beranda berorientasi pada **usia anak & misi stimulasi hari ini**, sementara 12 game yang sudah ada ditempatkan rapi sebagai **Simulasi Latihan** di tab Simulasi (dengan *Child Focus Mode* layar penuh saat dimainkan), kedua kebutuhan terpenuhi tanpa bentrok.

### Navigasi Utama (4 Tab + Chip Profil)
- **Header Atas Minimalis:** Logo KecilMain di kiri + **Chip Profil Anak** di kanan (misal `"Adik · 4 bln"` atau `"Pilih Usia"`). Mengetuk Chip Profil langsung membuka panel pengaturan profil (tanpa kunci matematika agar orang tua bisa akses cepat).
- **4 Menu Navigasi Bawah (Mobile) / Top Bar (Desktop):**
  1. **Stimulasi (Beranda):** Ringkasan usia anak + pemilih fase cepat (saat tanggal lahir belum diisi), progress bar misi harian (`X/3 selesai`), 3–4 misi stimulasi hari ini yang **bisa dicentang selesai setiap hari** (kombinasi aktivitas nyata ortu-anak + simulasi layar relevan), serta ringkasan singkat pencapaian milestone fase saat ini.
  2. **Simulasi (Topik Utama Interaktif):** Katalog lengkap alat bantu & game stimulasi 0–5 tahun — mencakup **3 modul baru khusus 0–12 bulan** dan **12 game simulasi 1–5 tahun** yang sudah ada, dikelompokkan berdasarkan fase usia atau pilar perkembangan (Motorik Kasar, Motorik Halus, Sensori & Musik, Bahasa, Kognitif). Tombol **Koleksi Stiker Anak** (`StickerAlbumModal`) tetap tersedia di header tab ini agar reward dari 12 game tetap berfungsi.
  3. **Catatan:** Checklist milestone per rentang usia, log berat & tinggi badan (riwayat + nilai terakhir), jurnal momen harian singkat, dan tombol **"Salin Ringkasan"** untuk dibawa ke posyandu/dokter anak.
  4. **Tips:** Kartu informasi & parenting tips ringkas bergaya *bite-sized* (bisa difilter per topik: *Newborn*, *MPASI & Nutrisi*, *Screen Time*, *Emosi & Tantrum*, *Tanda Waspada* + fitur simpan/bookmark favorit).

### Child Focus Mode & Batas Waktu Layar (`dailyLimitMinutes`)
Saat membuka salah satu dari 12 game anak (1–5 tahun) atau 3 modul stimulasi bayi (0–12 bulan):
- Navigasi 4 tab dan menu orang tua otomatis disembunyikan agar anak fokus ke aktivitasnya.
- **Aturan Batas Waktu Layar (Keputusan Terkunci):**
  - Timer harian (`playedSeconds`) **hanya berjalan selama Game Simulasi Balita (1–5 tahun) terbuka** — tidak berjalan saat orang tua berada di Beranda, Catatan, Tips, maupun saat menggunakan 3 alat bantu bayi 0–12 bulan (*Kartu Kontras Tinggi*, *Tummy Time*, *Suara Tenang*).
  - Saat batas waktu harian habis, aplikasi **hanya mengunci akses ke Game Anak (1–5 tahun)** (menampilkan layar istirahat mata pada tab/mode game tersebut + tombol reset timer yang dijaga oleh *Parent Gate* matematika). Orang tua **tetap bebas** mengakses tab Beranda, Catatan, Tips, dan alat bantu 0–12 bulan.
- **Kunci Keluar Mode Anak (Opsional):** Di pengaturan profil tersedia toggle *"Kunci Keluar Game (Matematika)"*. Jika aktif, tombol keluar dari game 1–5 tahun meminta hitungan singkat sederhana (`a + b = ?`) agar balita tidak sengaja kembali ke catatan orang tua. Pengaturan & kontrol BGM global (`bgmEnabled`) tersedia di Pengaturan Profil dan tombol suara di Child Focus Mode.

## 3. Cakupan Fitur & Struktur Data

### A. 6 Fase Usia Tumbuh Kembang (0–5 Tahun) & Migrasi
Menggantikan `AgeFilter` lama (`'all' | '1-2.5' | '2.5-4' | '4-5'`) dengan struktur `AgeBand`:
- `0-3m` : Baru Lahir (0–3 Bulan)
- `3-6m` : Bayi Awal (3–6 Bulan)
- `6-12m`: Bayi Aktif (6–12 Bulan)
- `1-2y` : Batita (1–2 Tahun)
- `2-3y` : Balita Eksplorasi (2–3 Tahun)
- `3-5y` : Prasekolah (3–5 Tahun)

*Perhitungan Usia & Migrasi (`src/lib/storage.ts` & `src/lib/development.ts`):*
- Menambah field opsional `birthDate?: string` (`YYYY-MM-DD`), `ageBand: AgeBand`, dan `childLockExit: boolean` pada `AppSettings`.
- Jika `birthDate` diisi, `computeAgeInfo(birthDate, now)` menghitung usia persis dalam bulan/tahun (mis. `"4 bln"`, `"14 bln"`, `"2 thn 4 bln"`) dan otomatis memetakan ke `AgeBand` yang tepat.
- Jika `birthDate` belum diisi, chip profil menampilkan `"Pilih Usia"` dan Beranda menampilkan pemilih 6 fase usia interaktif langsung di bawah sapaan (plus tautan cepat *"Atur Tanggal Lahir Anak"*), dengan fallback fase awal `0-3m` / hasil migrasi.
- **Migrasi data pengguna lama (`kecilmain.settings.v1`):** `'1-2.5'` → `'1-2y'`, `'2.5-4'` → `'2-3y'`, `'4-5'` → `'3-5y'`, `'all'` → `'1-2y'`.

### B. 3 Modul Simulasi & Alat Bantu Baru (Khusus 0–12 Bulan)
Bebas aset gambar eksternal berat (SVG tajam + Web Audio API offline-first) dan dikecualikan dari lockout batas waktu game:
1. **Kartu Kontras Tinggi (`HighContrastCards.tsx` — 0–4 Bulan):**
   - Tampilan penuh warna hitam, putih, dan aksen merah berpola besar (lingkaran konsentris, papan catur, spiral tenang, garis vertikal/horizontal, wajah tersenyum sederhana).
   - Berganti kartu manual lewat ketuk/geser perlahan, disertai catatan kecil jarak pandang ideal (~20–30 cm dari mata bayi) dan pengingat durasi singkat (2–5 menit). Tanpa animasi bergerak sendiri.
2. **Pendamping Tummy Time (`TummyTimeGuide.tsx` — 0–6 Bulan):**
   - Timer visual tenang dengan pilihan durasi aman bayi (1, 3, 5 menit) dan bunyi lonceng lembut saat selesai.
   - Menampilkan 3 ide interaksi tatap muka/suara yang bisa langsung dipraktikkan orang tua saat bayi tengkurap.
3. **Suara Tenang & Kerincingan (`BabySoother.tsx` — 0–12 Bulan):**
   - Pemutar audio sintetis Web Audio (White Noise lembut terfilter *low-pass*, suara rintik hujan tenang, dan musik pengantar tidur pentatonik dari `src/lib/bgm.ts`) dengan timer auto-off mandiri (10 / 20 / 30 menit).
   - Panel **Ketuk Kerincingan (Rattle)** dengan suara gemerincing lembut untuk melatih bayi menoleh mencari arah bunyi.

### C. Misi Stimulasi Harian & Pemetaan 12 Game (1–5 Tahun)
- **Misi Stimulasi Harian (`src/data/stimulationData.ts`):** Setiap dari 6 fase memiliki 3–4 misi stimulasi harian mencakup aspek Motorik Kasar, Motorik Halus, Bahasa, dan Kognitif/Sensori.
- **Progress Harian (`DailyProgress` di `kecilmain.progress.v1`):** Menambah `completedMissions: string[]` (reset per hari kalender bersama `playedSeconds`). Orang tua dapat mencentang misi secara manual setelah mempraktikkannya, dan misi yang tertaut ke modul simulasi/game otomatis ikut tercentang saat sesi simulasi tersebut selesai (`onComplete`).
- **12 Game Simulasi (1–5 Tahun):** `peekaboo`, `bubblepopper`, `colors`, `sensory`, `numbers`, `alphabet`, `shapes`, `trace`, `motor`, `coloring`, `puzzle`, `balloon` dipertahankan utuh di tab **Simulasi** dengan label pilar perkembangan masing-masing. Area beranda lama (`toddler-zone-banner` dan `MascotGuide`) digantikan oleh tampilan Beranda Stimulasi 4-tab baru.

### D. Catatan Perkembangan Anak (`src/lib/journalStorage.ts`)
Disimpan persisten terpisah pada `localStorage` (`kecilmain.journal.v1`) agar tidak pernah ikut ter-reset harian:
- **Checklist Milestone (`milestoneStatus`):** 5–6 pencapaian kunci per fase usia (`0-3m` hingga `3-5y`) berbasis acuan umum perkembangan anak. Sekali ketuk untuk menandai "Sudah Bisa", otomatis mencatat tanggal (`YYYY-MM-DD`).
- **Log Pertumbuhan (`growthLogs`):** Input ringan berat badan (kg), tinggi/panjang badan (cm), dan tanggal ukur dengan tampilan nilai terbaru & daftar riwayat.
- **Jurnal Momen Singkat (`dailyNotes`):** Catatan harian 1–2 kalimat + tag mood sederhana (`Senang`, `Tenang`, `Rewel`).
- **Ekspor Ringkasan Teks:** Tombol satu ketuk menyalin ringkasan usia anak, berat/tinggi terakhir, jumlah milestone fase saat ini, dan catatan terbaru ke clipboard.

### E. Info & Tips Gen Z (`src/data/tipsData.ts`)
Koleksi ~20 kartu tips praktis 0–5 tahun berformat seragam:
- Tag kategori (`Newborn`, `Nutrisi & MPASI`, `Screen Time`, `Emosi & Tantrum`, `Tanda Waspada`) + fase usia relevan.
- Hook lugas 1 kalimat + 3 poin langkah nyata ("Coba sekarang:") + filter kategori & tombol simpan (`savedTipIds` di `journalStorage.ts`).

### F. Pembaruan Identitas Metadata
Memperbarui title dan deskripsi di `index.html`, `vite.config.ts` (manifest PWA), dan `package.json` dari fokus "1–5 tahun" menjadi "0–5 tahun · Stimulasi Tumbuh Kembang Anak".

## 4. Hal yang Diserahkan ke Implementer (Left to the Builder)
- Rincian ukuran padding, grid responsif CSS antar lebar 390px (HP) dan desktop (>768px), serta susunan ikon SVG.
- Isi kalimat spesifik untuk masing-masing misi stimulasi, milestone per fase, dan poin tips (akurat secara umum & bebas klaim diagnosis medis).
- Penentuan struktur file komponen React di `src/components/`, `src/tabs/`, dan `src/activities/`.
- Pengujian unit menggunakan `node --test` untuk utilitas baru (`computeAgeInfo`, migrasi settings/ageBand, daily mission reset, dan persistensi journal/milestone/growth logs) di samping 14 tes yang sudah ada.
