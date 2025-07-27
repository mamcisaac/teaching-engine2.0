import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Don't use global setup for now
  globalSetup: undefined,

  webServer: {
    command: 'NODE_ENV=test pnpm dev',
    url: 'http://localhost:5173',
    timeout: 120 * 1000,
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NODE_ENV: 'test',
      PORT: '3000',
      DATABASE_URL: 'file:./packages/database/prisma/test.db',
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
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  
  expect: {
    timeout: 15000,
  },
  
  timeout: 120000,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
});