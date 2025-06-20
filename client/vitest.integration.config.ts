import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    name: 'integration',
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: [
      'src/__tests__/integration/**/*.test.{ts,tsx}',
      'src/__tests__/contract/**/*.test.{ts,tsx}',
    ],
    timeout: 30000, // Longer timeout for integration tests
    testTimeout: 30000,
    hookTimeout: 30000,
    globals: true,
    silent: false,
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results/integration-results.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/integration',
      include: ['src/components/assessment/**/*', 'src/components/evidence/**/*', 'src/api.ts'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/__tests__/**/*', 'src/test-utils.tsx'],
    },
    env: {
      VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000',
      NODE_ENV: 'test',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
