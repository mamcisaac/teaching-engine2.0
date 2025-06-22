import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration specifically for Assessment E2E tests
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/assessment-workflows.spec.ts',
  fullyParallel: false, // Run assessment tests sequentially for data consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2, // Limit workers for assessment tests

  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'playwright-report/assessment' }],
    ['json', { outputFile: 'test-results/assessment-e2e-results.json' }],
    ['list'],
  ],

  /* Shared settings for all assessment tests */
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  /* Test timeout configuration */
  timeout: 60000, // 1 minute per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup-e2e.ts'),
  globalTeardown: require.resolve('./tests/global-teardown-e2e.ts'),

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'npm run dev',
      port: 5173,
      cwd: './client',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'npx tsx src/index.ts',
      port: 3000,
      cwd: './server',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        NODE_ENV: 'test',
        E2E_TEST: 'true',
        DATABASE_URL: process.env.DATABASE_URL || 'file:./test.db',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'test-api-key',
        NODE_OPTIONS: '--experimental-specifier-resolution=node',
      },
    },
  ],

  /* Test output directories */
  outputDir: 'test-results/assessment-e2e',
});
