import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'aplikasi-anak';
const base = process.env.BASE_URL || (process.env.GITHUB_ACTIONS ? `/${repoName}/` : '/');

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Also serve manifest + service worker on `npm run dev`, so the app is installable while developing
      devOptions: {
        enabled: true,
        type: 'module'
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: base,
        name: 'KecilMain — Stimulasi & Tumbuh Kembang 0–5 Thn',
        short_name: 'KecilMain',
        description:
          'Platform pendamping stimulasi perkembangan, alat bantu bayi, game simulasi terarah, catatan milestone, dan tips orang tua anak usia 0–5 tahun. Bebas iklan & bisa offline.',
        lang: 'id',
        dir: 'ltr',
        theme_color: '#F5F7F2',
        background_color: '#F5F7F2',
        display: 'standalone',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'any',
        start_url: base,
        scope: base,
        categories: ['education', 'kids', 'games'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,mp3}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
        cleanupOutdatedCaches: true,
        // Google Fonts are cross-origin, so cache them at runtime for offline play after the first visit
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  server: {
    // Lets a phone on the same Wi-Fi open the dev server (installing still needs HTTPS, see README)
    host: true
  }
});
