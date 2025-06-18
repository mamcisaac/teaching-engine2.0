import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./tests/global-setup'),

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
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 60000,
    storageState: 'tests/storage/auth.json',
    headless: true,
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },
  expect: {
    timeout: 15000,
  },
  timeout: 120000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
});
