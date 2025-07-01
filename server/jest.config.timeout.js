/** @type {import('jest').Config} */
module.exports = {
  // Inherit from main config
  ...require('./jest.config.js'),

  // Timeout configuration
  testTimeout: 10000, // 10 seconds per test

  // Force exit to prevent hanging
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Prevent memory leaks
  clearMocks: true,
  restoreMocks: true,

  // Setup files for cleanup
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testCleanup.ts'],

  // Error handling
  errorOnDeprecated: false,

  // Performance
  maxWorkers: 1, // Single worker to prevent resource conflicts

  // Coverage
  collectCoverage: false, // Disable during timeout fixes
};
