/**
 * Jest Configuration for Real File Operations Testing
 * 
 * This configuration enables testing with actual file system operations
 * instead of mocks, providing more realistic test coverage.
 * 
 * Usage:
 *   npm test -- --config=jest.real-files.config.js
 *   USE_REAL_FILE_OPERATIONS=true npm test
 */

const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  
  // Display name for this test suite
  displayName: 'Real File Operations',
  
  // Environment variables for real file testing
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv,
    '<rootDir>/tests/setup/real-file-operations.setup.ts'
  ],
  
  // Test patterns - include real file operation tests
  testMatch: [
    ...baseConfig.testMatch,
    '<rootDir>/tests/**/*.real.test.{ts,tsx,js}',
    '<rootDir>/tests/integration/file-*.test.{ts,tsx,js}',
    '<rootDir>/tests/integration/template-*.test.{ts,tsx,js}',
    '<rootDir>/tests/integration/curriculum-*.test.{ts,tsx,js}'
  ],
  
  // Longer timeouts for file operations
  testTimeout: 30000,
  
  // Environment variables
  setupFiles: [
    ...baseConfig.setupFiles || [],
    '<rootDir>/tests/setup/real-file-env.js'
  ],
  
  // Don't mock these modules when testing real file operations
  unmockedModulePathPatterns: [
    'fs',
    'fs/promises', 
    'path',
    'os',
    'crypto',
    'csv-parse',
    'pdf-parse',
    'mammoth'
  ],
  
  // Coverage configuration for real file tests
  coveragePathIgnorePatterns: [
    ...baseConfig.coveragePathIgnorePatterns,
    '/tests/mocks/',
    '/tests/setup/.*mock.*'
  ],
  
  // Module name mapping for real operations
  moduleNameMapping: {
    ...baseConfig.moduleNameMapping,
    // Remove any file system mocks
  },
  
  // Global setup and teardown
  globalSetup: '<rootDir>/tests/setup/global-real-files-setup.js',
  globalTeardown: '<rootDir>/tests/setup/global-real-files-teardown.js',
  
  // Error handling
  errorOnDeprecated: false,
  
  // Verbose output for debugging file operations
  verbose: process.env.VERBOSE_FILE_TESTS === 'true',
  
  // Bail on first failure for file system issues
  bail: process.env.BAIL_ON_FILE_ERROR === 'true',
  
  // Memory management for large file tests
  maxWorkers: process.env.CI ? 1 : '50%',
  
  // Detect open handles (important for file operations)
  detectOpenHandles: true,
  forceExit: true,
  
  // Cache directory for real file tests
  cacheDirectory: '<rootDir>/node_modules/.cache/jest-real-files'
};