/**
 * Jest E2E Test Setup
 * Configuration for Puppeteer-based end-to-end testing
 */

// Increase timeout for E2E tests
jest.setTimeout(60000);

// Global test configuration
global.testConfig = {
  baseURL: process.env.CLIENT_URL || 'http://localhost:5173',
  apiURL: process.env.API_URL || 'http://localhost:3000',
  headless: process.env.HEADLESS !== 'false', // Default to headless, set HEADLESS=false to see browser
  slowMo: parseInt(process.env.SLOW_MO) || 0, // Milliseconds to slow down operations
  timeout: {
    navigation: 30000,
    waitForSelector: 10000,
    test: 60000
  },
  viewport: {
    width: parseInt(process.env.VIEWPORT_WIDTH) || 1920,
    height: parseInt(process.env.VIEWPORT_HEIGHT) || 1080
  }
};

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

console.log('🚀 E2E Test Environment Setup Complete');
console.log(`📊 Base URL: ${global.testConfig.baseURL}`);
console.log(`🔗 API URL: ${global.testConfig.apiURL}`);
console.log(`👁️ Headless Mode: ${global.testConfig.headless}`);