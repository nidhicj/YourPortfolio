import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // sourcemap: true
    // Sourcemaps expose your source code publicly — only enable in development
    sourcemap: mode === 'development'
  }
});



