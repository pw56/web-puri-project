import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = '/';

export default defineConfig(({ mode }) => ({
  root: './',
  base: base,
  build: {
    outDir: '../landing/public/app',
    emptyOutDir: true,
    minify: mode === 'production',
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'app',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,wasm,yml,yaml,md}'],
      },
      manifest: {
        name: 'Webプリ',
        short_name: 'Webプリ',
        description: 'このアプリは、AIや画像処理などの最新技術を使ったWebアプリケーションです。',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#ff87c5',
        theme_color: '#ff87c5',
        icons: [
          {
            src: `${base}public/app-icons/icon-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: `${base}public/app-icons/icon-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
}));