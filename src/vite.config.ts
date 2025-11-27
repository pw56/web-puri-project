import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  root: './src',
  build: {
    outDir: mode === 'production' ? '../dist_release' : '../dist_debug',
    emptyOutDir: true,
    minify: mode === 'production',
  },
  resolve: {
    alias: {
      '@components': './components',
      '@features': './features',
    },
  },
}));