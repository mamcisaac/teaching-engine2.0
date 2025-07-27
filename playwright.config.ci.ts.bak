import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,

  // Override test directory to run only essential tests
  testDir: './tests/e2e',
  testMatch: ['ci-quick-smoke.spec.ts', 'smoke-simple.spec.ts'],

  // Reasonable timeout for CI smoke tests
  timeout: 30 * 1000, // 30 seconds per test

  // CI-specific settings
  workers: 1,
  retries: 1,

  // Faster settings for CI
  use: {
    ...baseConfig.use,
    trace: 'on-first-retry',
    video: 'off',
    screenshot: 'only-on-failure',
  },
});
