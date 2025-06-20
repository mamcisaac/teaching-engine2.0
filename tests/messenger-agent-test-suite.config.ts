/**
 * Comprehensive Test Suite Configuration for Messenger Agent
 * 
 * This configuration ensures all messenger agent tests run together
 * and validates that integration, E2E, and contract tests are consistent.
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  
  // Test files specific to messenger agent
  testMatch: [
    '**/messenger-agent.spec.ts',
    '**/mock-validation.spec.ts',
    '**/parent-communication.spec.ts' // Existing parent communication tests
  ],

  // Global configuration
  fullyParallel: false, // Run sequentially to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/messenger-agent-html' }],
    ['json', { outputFile: 'test-results/messenger-agent-results.json' }],
    ['list'],
    ['junit', { outputFile: 'test-results/messenger-agent-junit.xml' }]
  ],

  // Global test settings
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Extended timeouts for API operations
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Test environment setup
  projects: [
    {
      name: 'messenger-agent-chrome',
      use: { 
        // @ts-ignore
        ...require('@playwright/test').devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'messenger-agent-firefox',
      use: { 
        // @ts-ignore
        ...require('@playwright/test').devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    }
  ],

  // Development server (if needed)
  webServer: process.env.CI ? undefined : {
    command: 'pnpm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global setup and teardown
  globalSetup: require.resolve('./global-setup-e2e.ts'),
  globalTeardown: require.resolve('./global-teardown-e2e.ts'),
});

// Export test configuration for Jest integration tests
export const jestConfig = {
  displayName: 'Messenger Agent Integration Tests',
  testMatch: [
    '<rootDir>/server/tests/integration/messenger-agent.integration.test.ts',
    '<rootDir>/server/tests/contract/messenger-agent.contract.test.ts'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/server/tests/jest.setup.ts'
  ],
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: [
    'server/src/routes/emailTemplates.ts',
    'server/src/routes/reports.ts',
    'server/src/routes/communication.ts',
    'server/src/services/reportGeneratorService.ts',
    'server/src/services/emailService.ts',
    'server/src/services/notificationService.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};