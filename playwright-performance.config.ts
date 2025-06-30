/**
 * Playwright Performance Testing Configuration
 * Specialized configuration for performance, load, and visual regression testing
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/performance',

  // Performance tests need longer timeouts
  timeout: 300000, // 5 minutes per test
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },

  // Run tests in sequence for consistent performance measurements
  fullyParallel: false,
  workers: 1,

  // Retry configuration for flaky performance tests
  retries: process.env.CI ? 2 : 1,

  // Reporter configuration for performance tests
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'test-results/performance-report',
        open: process.env.CI ? 'never' : 'on-failure',
      },
    ],
    [
      'json',
      {
        outputFile: 'test-results/performance-results.json',
      },
    ],
  ],

  // Global setup for performance testing
  globalSetup: process.env.CI ? undefined : require.resolve('./tests/performance/global-setup.ts'),
  globalTeardown: process.env.CI
    ? undefined
    : require.resolve('./tests/performance/global-teardown.ts'),

  use: {
    // Base URL for testing
    baseURL: 'http://localhost:5173',

    // Trace configuration for performance debugging
    trace: 'retain-on-failure',

    // Screenshot configuration for visual tests
    screenshot: 'only-on-failure',

    // Video recording for complex performance scenarios
    video: 'retain-on-failure',

    // Disable animations for consistent visual testing
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process', // For consistent memory measurements
      ],
    },

    // Consistent viewport for performance measurements
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors in test environment
    ignoreHTTPSErrors: true,

    // Extended timeout for slow operations
    navigationTimeout: 60000,
    actionTimeout: 30000,
  },

  // Performance test projects
  projects: [
    // Benchmark testing
    {
      name: 'benchmark',
      testMatch: '**/benchmark.suite.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Enable memory measurement in Chrome
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--js-flags="--expose-gc"',
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
    },

    // Load testing
    {
      name: 'load-testing',
      testMatch: '**/load-testing.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        // Headless for load testing
        headless: true,
      },
      timeout: 600000, // 10 minutes for load tests
    },

    // Visual regression testing - Desktop
    {
      name: 'visual-desktop',
      testMatch: '**/visual-regression.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Ensure consistent rendering
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--font-render-hinting=none',
            '--disable-font-subpixel-positioning',
          ],
        },
      },
    },

    // Visual regression testing - Tablet
    {
      name: 'visual-tablet',
      testMatch: '**/visual-regression.spec.ts',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 },
      },
    },

    // Visual regression testing - Mobile
    {
      name: 'visual-mobile',
      testMatch: '**/visual-regression.spec.ts',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 375, height: 667 },
      },
    },

    // Response time monitoring
    {
      name: 'response-monitoring',
      testMatch: '**/response-time-monitor.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
      timeout: 600000, // 10 minutes for monitoring
    },

    // Memory tracking
    {
      name: 'memory-tracking',
      testMatch: '**/memory-tracking.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--js-flags="--expose-gc"',
            '--max-old-space-size=4096',
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
      timeout: 600000, // 10 minutes for memory tracking
    },

    // Cross-browser performance testing
    {
      name: 'performance-firefox',
      testMatch: '**/benchmark.suite.ts',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'performance-safari',
      testMatch: '**/benchmark.suite.ts',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],

  // Development server configuration
  webServer: process.env.CI
    ? undefined
    : {
        command: 'NODE_ENV=test pnpm dev',
        url: 'http://localhost:5173',
        timeout: 120 * 1000,
        reuseExistingServer: true,
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
          NODE_ENV: 'test',
          PORT: '3000',
          DATABASE_URL:
            process.env.DATABASE_URL || `file:${process.cwd()}/packages/database/prisma/test.db`,
          JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key',
          JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
        },
      },

  // Output directories
  outputDir: 'test-results/performance-artifacts',

  // Test metadata
  metadata: {
    testType: 'performance',
    environment: process.env.NODE_ENV || 'test',
    timestamp: new Date().toISOString(),
  },
});
