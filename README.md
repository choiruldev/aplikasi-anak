# KecilMain — PWA Edukasi & Motorik Balita (1–5 Tahun)

Aplikasi web progresif (**PWA Offline-First**) berbahasa Indonesia untuk stimulasi edukasi, motorik halus, dan motorik kasar anak usia balita (1–5 tahun). Bebas iklan, tanpa pelacakan, dan bisa langsung dipasang di layar utama HP/tablet.

## Fitur Utama

1. **Kenal Suara & Warna (1 – 2,5 Tahun · Bahasa & Sensori)**
   - Mengenal 6 hewan beserta bunyi & fakta pendeknya.
   - **Gambang Warna (Xylophone)** Do–Re–Mi–Fa–Sol–La untuk kepekaan nada, warna, dan koordinasi ketukan jari.
2. **Pasang Bentuk Kayu (2,5 – 4 Tahun · Motorik Halus & Kognitif)**
   - *Drag-and-drop* berbasis *Pointer Events* yang mulus di layar sentuh maupun mouse/keyboard dengan *magnetic snap* ramah jari balita.
3. **Jejak Jari: Garis, Huruf & Angka (3,5 – 5 Tahun · Pra-Tulis & Presisi)**
   - Menebalkan jalur garis tegak, zig-zag, lingkaran, huruf (`A`, `I`, `U`), dan angka (`1`, `2`, `3`) secara berurutan di atas `<canvas>` beresolusi tinggi.
4. **Ayo Gerak Aktif! (2 – 5 Tahun · Motorik Kasar)**
   - Tantangan gerak tubuh nyata di luar layar: *Lompat Kelinci*, *Pesawat Seimbang*, *Langkah Gajah*, *Petik Bintang*, dan *Patung Musik (Freeze Dance)*.
5. **Buku Warna & Gambar Musik (2 – 4,5 Tahun · Kreativitas & Nada)**
   - **Buku Mewarnai (*Tap-to-Fill*):** 4 template garis tegas ramah balita (*Apel Ceria*, *Ikan Berenang*, *Kupu-kupu*, *Bunga Matahari*) dengan 8 palet warna bersuara.
   - **Lukis Musik (Doodle Kandinsky):** Kanvas goresan jari di mana tinggi-rendahnya sentuhan jari menghasilkan alunan melodi harmonis.
6. **Puzzle Keping Bergambar (2,5 – 5 Tahun · Visual & Spasial)**
   - Jigsaw puzzle 2x2 (4 keping) dengan gambar kartun menarik (*Kucing Oren*, *Gajah Biru*, *Semangka Manis*).
   - Dilengkapi papan panduan kayu, bayangan bantuan tipis, dan *magnetic snap* klik kayu yang memuaskan.
7. **Tangkap Balon Ceria (1,5 – 5 Tahun · Motorik Kasar & Kamera Interaktif)**
   - Balon warna-warni melayang lembut ke atas.
   - **Mode Kamera Gerak:** Mendeteksi lambaian tangan/tubuh di depan kamera webcam secara *real-time* 100% lokal di browser tanpa server (privasi terjaga).
   - **Mode Sentuh:** Fallback otomatis untuk sentuhan jari jika kamera tidak aktif.
8. **Ruang Orang Tua & Batas Waktu Layar**
   - Dilindungi hitungan khusus orang tua (`Parental Gate`).
   - Pengatur batas waktu bermain harian (otomatis masuk layar tenang *Waktunya Istirahat Mata* saat durasi tercapai).
   - Ringkasan statistik aktivitas bermain anak.

## Panduan PWA & Pemasangan Offline

KecilMain dibangun dengan standar **Progressive Web App (PWA) Offline-First** menggunakan `vite-plugin-pwa` dan Workbox:
- **Ikon Lengkap:** Menyediakan ikon standar `192x192`, `512x512`, maskable `maskable-512x512.png` (aman tanpa pemotongan sudut di Android), serta `apple-touch-icon.png` (180x180).
- **Service Worker Precaching:** Seluruh bundel JS, CSS, HTML, SVG, serta berkas audio MP3 (total 95 aset) otomatis dicache di muka sehingga aplikasi dapat dibuka dan dimainkan secara penuh saat perangkat tidak memiliki koneksi internet (airplane mode / tanpa kuota).
- **Google Fonts Caching:** Font `Fredoka` dan `Plus Jakarta Sans` disimpan secara runtime cache (*CacheFirst*) agar tipografi tetap rapi saat offline.

### Cara Memasang di HP / Tablet:
1. **Android (Chrome / Edge):**
   - Buka aplikasi di Chrome.
   - Ketuk banner **"Pasang Sekarang"** yang muncul di layar, atau ketuk tombol **Pasang** di bagian atas kanan.
   - Aplikasi akan langsung terpasang di beranda HP Anda layaknya aplikasi Android bawaan (layar penuh tanpa bilah URL).
2. **iPhone / iPad (Safari):**
   - Buka aplikasi di Safari.
   - Ketuk tombol **Bagikan (Share)** (ikon kotak dengan panah ke atas) di bagian bawah layar Safari.
   - Gulir ke bawah lalu pilih menu **"Tambah ke Layar Utama"** (*Add to Home Screen*).
   - Ketuk **"Tambah"** di sudut kanan atas. Selesai!

## Menjalankan Proyek

```bash
# Jalankan server pengembangan lokal (Service Worker & Manifest aktif di dev mode)
npm install
npm run dev

# Jalankan unit test geometri & validasi jejak
npm test

# Build produksi PWA (termasuk Service Worker & Manifest Workbox)
npm run build
npm run preview
```

## Deploy ke GitHub & Hosting Gratis

Proyek ini murni statis (tanpa ketergantungan server backend) sehingga dapat langsung di-deploy gratis ke **Cloudflare Pages**, **Vercel**, atau **Netlify** dengan pengaturan:
- **Build command:** `npm run build`
- **Output directory:** `dist`

