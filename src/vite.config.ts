import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      srcDir: './',
      filename: './app/sw.js',
      strategies: 'injectManifest',
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'Webプリ',
        short_name: 'Webプリ',
        author: 'pw56',
        description: 'このアプリは、AIや画像処理などの最新技術を使ったWebアプリケーションです。',
        start_url: './index.html',
        scope: './',
        display: 'standalone',
        background_color: '#ff87c5',
        theme_color: '#ff87c5',
        icons: [
          {
            src: '/assets/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/assets/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  root: './',
  base: '/web-puri-project/',
  build: {
    outDir: mode === 'production' ? '../app' : '../dist',
    emptyOutDir: true,
    minify: mode === 'production',
  },
  resolve: {
    alias: {
      '@components': './components',
      '@utils': './utils',
      '@features': './features',
      '@debug': '../tests'
    },
  },
}));