import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./tests/global-setup'),

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    timeout: 180 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      // Use test mode to enable test endpoints
      NODE_ENV: 'test',
      // Run the API server on its default port
      PORT: '3000',
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRES_IN: '1h',
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
