// E2E Test Setup
jest.setTimeout(120000); // 2 minutes default timeout

// Global test configuration
global.TEST_CONFIG = {
  CLIENT_URL: process.env.TEST_CLIENT_URL || 'http://localhost:5173',
  API_URL: process.env.TEST_API_URL || 'http://localhost:3000',
  HEADLESS: process.env.HEADLESS === 'true',
  PARALLEL: process.env.PARALLEL === 'true',
  TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '120000'),
  SCREENSHOTS_DIR: 'tests/e2e/screenshots'
};

// Clean up function
afterAll(async () => {
  // Close any open browser instances
  if (global.browser) {
    await global.browser.close();
  }
});

console.log('E2E Test Environment Initialized');