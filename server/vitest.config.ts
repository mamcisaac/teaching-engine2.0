import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: path.resolve(__dirname, '..'),
    include: ['test-driven-development/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'dist/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  }
});