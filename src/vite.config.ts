import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  root: './src',
  build: {
    outDir: mode === 'production' ? '../app' : '../dist',
    emptyOutDir: true,
    minify: mode === 'production',
  },
  resolve: {
    alias: {
      '@components': './components',
      '@features': './features',
      '@debug': '../tests',
      '@release': '../assets/release'
    },
  },
}));