/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/setupTests.ts',
      './src/test-utils/real-backend-setup.ts',
    ],
    testTimeout: 30000, // Longer timeout for real API calls
    hookTimeout: 30000, // Longer timeout for setup/teardown
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test-utils/**/*',
        'src/setupTests.ts',
        'src/__tests__/**/*',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 90,
          statements: 90,
        },
      },
    },
    // Run real backend tests sequentially to avoid conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Global setup for real backend tests
    globalSetup: './src/test-utils/global-real-backend-setup.ts',
    // Filter for real backend tests
    include: [
      'src/**/*.real.test.{ts,tsx}',
      'src/**/**/workflows/*.test.{ts,tsx}',
    ],
    // Environment variables for real backend testing
    env: {
      NODE_ENV: 'test',
      VITE_API_BASE_URL: 'http://localhost:3001',
      TEST_DATABASE_URL: 'file:./test-real-backend.db',
      DISABLE_AUTH_RATE_LIMIT: 'true',
      LOG_LEVEL: 'error',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});