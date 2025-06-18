import { defineConfig } from '@playwright/test';

/**
 * E2E test configuration with integrated test server management
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Global setup and teardown */
  globalSetup: './tests/global-setup-e2e.js',
  globalTeardown: './tests/global-teardown-e2e.js',

  /* Maximum time one test can run for */
  timeout: 120 * 1000, // 2 minutes per test

  /* Global timeout for the entire test run */
  globalTimeout: 30 * 60 * 1000, // 30 minutes total

  expect: {
    /* Maximum time expect() should wait for the condition to be met */
    timeout: 15000,
  },

  /* Run tests in files in parallel */
  fullyParallel: false, // Set to false for more predictable test runs

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : 2,

  /* Reporter to use */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    process.env.CI ? ['github'] : null,
  ].filter(Boolean) as string[],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL - will be dynamically set from test server */
    baseURL: process.env.CLIENT_URL || 'http://localhost:5173',

    /* API base URL - will be dynamically set from test server */
    extraHTTPHeaders: {
      Accept: 'application/json',
    },

    /* Collect trace when retrying the failed test */
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: process.env.CI ? 'on' : 'only-on-failure',

    /* Video recording */
    video: process.env.CI ? 'retain-on-failure' : 'off',

    /* Use the saved auth state from global setup */
    storageState: 'tests/storage/auth.json',

    /* Viewport size */
    viewport: { width: 1280, height: 720 },

    /* Navigation timeout - longer in CI */
    navigationTimeout: process.env.CI ? 90000 : 60000,

    /* Action timeout - longer in CI */
    actionTimeout: process.env.CI ? 45000 : 30000,

    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,

    /* Accept downloads */
    acceptDownloads: true,

    /* CI-specific: Disable animations for more stable tests */
    launchOptions: {
      args: process.env.CI
        ? ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage']
        : [],
      slowMo: process.env.CI ? 100 : 0, // Slow down actions in CI for stability
    },

    /* CI-specific: Better error context */
    contextOptions: {
      recordVideo: process.env.CI ? { dir: 'test-results/videos' } : undefined,
      // Capture console logs
      acceptDownloads: true,
      // Reduce animations
      reducedMotion: process.env.CI ? 'reduce' : null,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        channel: 'chrome',
      },
    },
  ],

  /* Web server configuration */
  webServer: {
    /* Start the client dev server */
    command: 'pnpm --filter client dev',
    url: 'http://localhost:5173',
    timeout: 180 * 1000, // 3 minutes to start
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
