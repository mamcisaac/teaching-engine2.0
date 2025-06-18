import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./tests/global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    timeout: 120 * 1000,
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      // Use development mode so the Express server actually starts
      NODE_ENV: 'development',
      // Run the API server on its default port
      PORT: '3001',
      DATABASE_URL: 'file:./test.db',
    },
  },

  use: {
    baseURL: 'http://localhost:5173',
    storageState: 'tests/storage/auth.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30010,
  },
  expect: {
    timeout: 10000,
  },
  timeout: 60000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
});
