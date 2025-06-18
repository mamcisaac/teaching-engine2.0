import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: process.env.CI ? undefined : require.resolve('./tests/global-setup'),

  webServer: process.env.CI
    ? undefined // In CI, we manage servers manually
    : {
        command: 'pnpm dev',
        url: 'http://localhost:5173',
        timeout: 120 * 1000,
        reuseExistingServer: true,
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
          NODE_ENV: 'test',
          PORT: '3000',
          DATABASE_URL: process.env.DATABASE_URL || 'file:./packages/database/prisma/test.db',
          JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key',
          JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
        },
      },

  use: {
    baseURL: 'http://localhost:5173',
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: process.env.CI ? 'on' : 'only-on-failure',
    actionTimeout: process.env.CI ? 45000 : 30000,
    navigationTimeout: process.env.CI ? 90000 : 60000,
    storageState: process.env.CI ? undefined : 'tests/storage/auth.json',
    headless: true,
    video: process.env.CI ? 'retain-on-failure' : 'off',
    // CI-specific: Ignore HTTPS errors which can occur in CI environments
    ignoreHTTPSErrors: process.env.CI ? true : false,
    // CI-specific: Add viewport consistency
    viewport: { width: 1280, height: 720 },
    // CI-specific: Disable animations for more stable tests
    launchOptions: {
      args: process.env.CI ? ['--disable-blink-features=AutomationControlled'] : [],
      slowMo: process.env.CI ? 100 : 0, // Slow down actions in CI for stability
    },
    // Capture console logs in CI for debugging
    contextOptions: {
      recordVideo: process.env.CI ? { dir: 'test-results/videos' } : undefined,
    },
  },
  expect: {
    timeout: process.env.CI ? 30000 : 15000,
    // CI-specific: Add polling interval for better stability
    toHaveScreenshot: {
      maxDiffPixels: process.env.CI ? 200 : 100,
      animations: 'disabled',
    },
  },
  timeout: process.env.CI ? 180000 : 120000, // 3 minutes in CI vs 2 minutes locally
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['github'],
      ]
    : [['list'], ['html', { outputFolder: 'playwright-report' }]],

  // CI-specific: Global timeout for entire test run
  globalTimeout: process.env.CI ? 30 * 60 * 1000 : undefined, // 30 minutes in CI

  // CI-specific: Forbid test.only in CI
  forbidOnly: !!process.env.CI,

  // CI-specific: Shard tests if needed
  shard:
    process.env.CI && process.env.SHARD
      ? {
          current: parseInt(process.env.SHARD_INDEX || '1'),
          total: parseInt(process.env.TOTAL_SHARDS || '1'),
        }
      : undefined,
});
