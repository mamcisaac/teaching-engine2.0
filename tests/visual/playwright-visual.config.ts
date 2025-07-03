/**
 * Playwright Visual Regression Testing Configuration
 * Teaching Engine 2.0 - Comprehensive UI consistency testing
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: '.',

  // Global test configuration
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : '50%',

  // Reporter configuration for visual testing
  reporter: [
    [
      'html',
      {
        outputDir: 'visual-test-results',
        open: process.env.CI ? 'never' : 'on-failure',
      },
    ],
    [
      'json',
      {
        outputFile: 'visual-test-results/visual-report.json',
      },
    ],
    [
      'junit',
      {
        outputFile: 'visual-test-results/visual-results.xml',
      },
    ],
  ],

  // Test output directories
  outputDir: 'visual-test-results/artifacts',

  use: {
    // Global test settings for visual consistency
    baseURL: process.env.VISUAL_TEST_BASE_URL || 'http://localhost:5173',

    // Screenshot settings for visual regression
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Ensure consistent rendering for visual tests
    locale: 'en-CA',
    timezoneId: 'America/Toronto',

    // Visual testing specific settings
    colorScheme: 'light',

    // Wait for stable network state before screenshots
    waitForTimeout: 5000,
    navigationTimeout: 30000,
    actionTimeout: 15000,
  },

  // Visual regression testing projects for different contexts
  projects: [
    // Desktop browsers - primary teacher workstation
    {
      name: 'Desktop Chrome - Light Theme',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'light',
        extraHTTPHeaders: {
          'X-Visual-Test-Context': 'desktop-chrome-light',
        },
      },
    },

    {
      name: 'Desktop Firefox - Light Theme',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'light',
        extraHTTPHeaders: {
          'X-Visual-Test-Context': 'desktop-firefox-light',
        },
      },
    },

    {
      name: 'Desktop Safari - Light Theme',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'light',
        extraHTTPHeaders: {
          'X-Visual-Test-Context': 'desktop-safari-light',
        },
      },
    },

    // Tablet devices - teachers planning on iPads
    {
      name: 'iPad Pro - Portrait',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
        extraHTTPHeaders: {
          'X-Visual-Test-Context': 'ipad-portrait',
        },
      },
    },

    {
      name: 'iPad Pro - Landscape',
      use: {
        ...devices['iPad Pro landscape'],
        viewport: { width: 1366, height: 1024 },
        extraHTTPHeaders: {
          'X-Visual-Test-Context': 'ipad-landscape',
        },
      },
    },

    // Mobile devices - teachers checking plans on phones
    {
      name: 'Mobile iPhone - Portrait',
      use: {
        ...devices['iPhone 14 Pro'],
        viewport: { width: 393, height: 852 },
        extraHTTPHeaders: {
          'X-Visual-Test-Context': 'mobile-iphone-portrait',
        },
      },
    },

    {
      name: 'Mobile Android - Portrait',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
        extraHTTPHeaders: {
          'X-Visual-Test-Context': 'mobile-android-portrait',
        },
      },
    },

    // Print layouts - teachers printing lesson plans
    {
      name: 'Print Layout - Letter Size',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 816, height: 1056 }, // 8.5" x 11" @ 96 DPI
        extraHTTPHeaders: {
          'X-Visual-Test-Context': 'print-letter',
        },
      },
    },

    // Accessibility testing with high contrast
    {
      name: 'High Contrast Mode',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        colorScheme: 'dark',
        forcedColors: 'active',
        extraHTTPHeaders: {
          'X-Visual-Test-Context': 'high-contrast',
        },
      },
    },

    // Large text accessibility testing
    {
      name: 'Large Text (200% Zoom)',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 960, height: 540 }, // Simulates 200% zoom
        deviceScaleFactor: 2,
        extraHTTPHeaders: {
          'X-Visual-Test-Context': 'large-text-zoom',
        },
      },
    },
  ],

  // Test setup and teardown
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',

  // Web server configuration for visual testing
  webServer: {
    command: process.env.CI ? 'pnpm build && pnpm preview --port 5173' : 'pnpm dev --port 5173',
    port: 5173,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    env: {
      // Ensure consistent data for visual tests
      NODE_ENV: 'test',
      VISUAL_TESTING: 'true',
      // Disable animations for consistent screenshots
      DISABLE_ANIMATIONS: 'true',
    },
  },

  // Visual testing specific expect configuration
  expect: {
    // Visual comparison thresholds
    threshold: 0.2, // Allow 0.2% pixel difference
    toHaveScreenshot: {
      threshold: 0.2,
      maxDiffPixels: 1000,
      animations: 'disabled',
      caret: 'hide',
    },
    toMatchSnapshot: {
      threshold: 0.3,
      maxDiffPixels: 2000,
    },
  },
});
