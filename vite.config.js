import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Sourcemaps expose your source code publicly — only enable in development
    sourcemap: mode === 'development'
  }
}));
