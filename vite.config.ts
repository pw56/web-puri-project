import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = '/web-puri-project/';

export default defineConfig(({ mode }) => ({
  root: './',
  base: base,
  build: {
    outDir: mode === 'production' ? '../app' : '../dist',
    emptyOutDir: true,
    minify: mode === 'production',
  },
  resolve: {
    alias: {
      '@components': 'src/app/components',
      '@utils': 'src/app/utils',
      '@features': 'src/app/features',
      '@debug': 'src/tests'
    },
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      injectManifest: {
        swSrc: 'src/app/app/sw.ts',
      },
      srcDir: 'src/app/app',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'Webプリ',
        short_name: 'Webプリ',
        author: 'pw56',
        description: 'このアプリは、AIや画像処理などの最新技術を使ったWebアプリケーションです。',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#ff87c5',
        theme_color: '#ff87c5',
        icons: [
          {
            src: `${base}public/icons/icon-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: `${base}public/icons/icon-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
}));