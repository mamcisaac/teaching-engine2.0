import { defineConfig, devices } from '@playwright/test';

/**
 * Production-ready Playwright configuration
 * Optimized for Teaching Engine 2.0 E2E tests
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Keep workers=1 to avoid DB conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid DB conflicts
  globalSetup: './tests/e2e/config/auth.global.setup.ts',
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list']
  ],
  
  use: {
    baseURL: process.env.UI_BASE_URL ?? (process.env.CI 
      ? 'http://localhost:3001' // Prod build port
      : 'http://localhost:5173'), // Dev server
    storageState: 'tests/e2e/auth.json',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 8000,
    navigationTimeout: 15000,
    testIdAttribute: 'data-testid', // Lock in testid convention
  },
  
  expect: {
    timeout: 8000
  },
  
  projects: [
    { 
      name: 'smoke',
      testMatch: '**/smoke/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        tier: 'smoke' 
      }
    },
    { 
      name: 'full',
      testMatch: '**/features/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        tier: 'full' 
      }
    },
    { 
      name: 'prod',
      testMatch: '**/prod/*.spec.ts',
      use: { 
        ...devices['Desktop Chrome'],
        tier: 'prod',
        timezoneId: 'America/Halifax'
      }
    }
  ],
  
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  
  // Web server configuration for CI
  webServer: process.env.CI ? [
    {
      command: 'cd ../server && npm run build && NODE_ENV=production node dist/index.js',
      port: 3000,
      reuseExistingServer: false,
      timeout: 120000,
    },
    {
      command: 'npm run build && npm run preview',
      port: 3001,
      reuseExistingServer: false,
      timeout: 120000,
    }
  ] : undefined,
});