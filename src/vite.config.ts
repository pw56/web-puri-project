import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  root: './src',
  build: {
    outDir: mode === 'release' ? '../app' : '../dist',
    emptyOutDir: true,
    minify: mode === 'release',
  },
  resolve: {
    alias: {
      '@components': './components',
      '@features': './features',
    },
  },
}));