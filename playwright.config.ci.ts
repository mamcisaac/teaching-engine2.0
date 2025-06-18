import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,

  // Override test directory to run only essential tests
  testDir: './tests/e2e',
  testMatch: ['quick-smoke-tests.spec.ts', 'subjects.spec.ts', 'milestones.spec.ts'],

  // Reduce timeout for CI
  timeout: 60 * 1000, // 1 minute per test

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
