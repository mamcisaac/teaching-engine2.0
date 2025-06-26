/**
 * Unified Jest Configuration for Teaching Engine 2.0
 * 
 * This configuration consolidates all test configurations and provides
 * optimized settings for different test types (unit, integration, e2e).
 */

import path from 'path';

/** @type {import('jest').Config} */
const baseConfig = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Module resolution
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
    // Mock external dependencies
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
  },
  
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  
  // TypeScript transformation
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true,
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs|@prisma/client)/)'],
  
  // Test file patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/__mocks__/'],
  
  // Performance optimizations
  maxWorkers: process.env.CI ? 2 : '50%',
  testTimeout: 10000, // 10 seconds default
  
  // Cleanup and error handling
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Coverage settings (when enabled)
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/**/*.test.{ts,js}',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Error handling
  errorOnDeprecated: false,
  verbose: process.env.DEBUG_TESTS === 'true',
};

/**
 * Unit test configuration - fast, isolated tests with mocks
 */
const unitConfig = {
  ...baseConfig,
  displayName: 'Unit Tests',
  testMatch: ['**/tests/unit/**/*.test.ts', '**/__tests__/**/*.unit.test.ts'],
  testTimeout: 5000, // Shorter timeout for unit tests
  maxWorkers: '75%', // More workers for fast unit tests
  
  // Unit tests use extensive mocking
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/utils/setup-unit-mocks.ts',
  ],
  
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    // Mock database for unit tests
    '^@teaching-engine/database$': '<rootDir>/src/__mocks__/@teaching-engine/database.ts',
  },
  
  // No database setup for unit tests
  globalSetup: undefined,
  globalTeardown: undefined,
};

/**
 * Integration test configuration - real database, mocked external services
 */
const integrationConfig = {
  ...baseConfig,
  displayName: 'Integration Tests',
  testMatch: ['**/tests/integration/**/*.test.ts'],
  testTimeout: 30000, // Longer timeout for integration tests
  maxWorkers: 1, // Sequential execution for database consistency
  
  // Integration tests need database setup
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/utils/setup-integration-mocks.ts',
    '<rootDir>/tests/jest.integration.setup.ts',
  ],
  
  // Don't mock database for integration tests
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
    // Still mock external APIs
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
  },
};

/**
 * E2E test configuration - minimal mocking, full system testing
 */
const e2eConfig = {
  ...baseConfig,
  displayName: 'E2E Tests',
  testMatch: ['**/tests/e2e/**/*.test.ts'],
  testTimeout: 60000, // Longest timeout for E2E tests
  maxWorkers: 1, // Sequential execution
  
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/utils/setup-e2e-mocks.ts',
  ],
  
  globalSetup: '<rootDir>/tests/global-setup-e2e.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
  
  // Minimal mocking for E2E tests
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
  },
};

/**
 * AI Snapshot test configuration - specialized for AI regression testing
 */
const aiSnapshotConfig = {
  ...baseConfig,
  displayName: 'AI Snapshot Tests',
  testMatch: ['**/tests/ai-snapshots/**/*.test.ts'],
  testTimeout: 30000, // 30 seconds for AI operations
  maxWorkers: 1, // Sequential execution for consistent snapshots
  
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/utils/setup-integration-mocks.ts',
  ],
  
  // AI tests need database but mock external AI services by default
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
  
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
    // Mock OpenAI by default, unless real API key is provided
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
  },
  
  // AI snapshot testing environment variables
  testEnvironmentOptions: {
    AI_TESTING_MODE: 'snapshot',
    NODE_ENV: 'test',
  },
};

/**
 * Performance test configuration - specialized for performance testing
 */
const performanceConfig = {
  ...baseConfig,
  displayName: 'Performance Tests',
  testMatch: ['**/tests/performance/**/*.test.ts'],
  testTimeout: 120000, // 2 minutes for performance tests
  maxWorkers: 1, // Single worker for consistent performance measurements
  
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/utils/setup-performance-mocks.ts',
  ],
  
  // Performance tests might need real implementations
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
  },
};

// Export the appropriate configuration based on environment
const getConfig = () => {
  const testType = process.env.TEST_TYPE;
  
  switch (testType) {
    case 'unit':
      return unitConfig;
    case 'integration':
      return integrationConfig;
    case 'e2e':
      return e2eConfig;
    case 'performance':
      return performanceConfig;
    case 'ai-snapshots':
      return aiSnapshotConfig;
    default:
      // Default to all configurations for comprehensive testing
      return {
        ...baseConfig,
        projects: [unitConfig, integrationConfig, aiSnapshotConfig],
        testMatch: undefined, // Let projects handle test matching
      };
  }
};

export default getConfig();