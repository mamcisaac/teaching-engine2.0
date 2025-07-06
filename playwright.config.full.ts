import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,

  // Run all E2E tests
  testDir: './tests/e2e',
  
  // Longer timeout for comprehensive tests
  timeout: 120 * 1000, // 2 minutes per test

  // Full test settings
  workers: 2,
  retries: 1,

  // More detailed reporting for full tests
  use: {
    ...baseConfig.use,
    trace: 'on',
    video: 'on',
    screenshot: 'on',
  },

  // Longer global timeout for full test suite
  globalTimeout: 60 * 60 * 1000, // 60 minutes
});