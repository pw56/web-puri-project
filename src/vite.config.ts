import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 設定
export default defineConfig({
  plugins: [react()],
  root: './src', // プロジェクトのエントリを src に設定
  build: {
    outDir: '../dist', // ビルド成果物を dist に出力
    emptyOutDir: true, // ビルド前に出力先を空にする
    minify: true, // ミニフィケーションを有効化
  },
  resolve: {
    alias: {
      '@components': './components',
      '@pages': './pages',
      '@functions': './functions',
    },
  },
});