/**
 * Unified Jest Configuration for Teaching Engine 2.0 Server
 * Optimized for performance, proper module resolution, and comprehensive testing
 */

import path from 'path';
import { cpus } from 'os';

// Calculate optimal worker count based on CPU cores and environment
const getOptimalWorkerCount = () => {
  const coreCount = cpus().length;
  if (process.env.CI) return 2; // Conservative for CI environments

  // For unit tests, use more workers since they're independent
  // For integration tests, use fewer to avoid database conflicts
  const testType = process.env.TEST_TYPE;
  if (testType === 'unit') {
    return Math.min(coreCount, 8); // Cap at 8 workers max
  } else if (testType === 'integration') {
    return 2; // Limited for database access
  }

  return Math.max(1, Math.floor(coreCount * 0.75)); // Default 75% of cores
};

// Base configuration shared across all test types
const baseConfig = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],

  // Performance optimizations
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  maxWorkers: getOptimalWorkerCount(),
  testTimeout: 15000, // Reduced to 15 seconds default
  bail: process.env.CI ? 1 : 0, // Stop on first failure in CI

  // Additional performance optimizations
  workerIdleMemoryLimit: '512MB', // Limit worker memory
  maxConcurrency: 8, // Limit concurrent tests per worker
  detectOpenHandles: false, // Disable for performance (enable in debug mode)
  detectLeaks: false, // Disable memory leak detection for speed

  // Test execution optimization
  errorOnDeprecated: false,
  testLocationInResults: true,
  logHeapUsage: process.env.DEBUG_TESTS === 'true', // Only log heap in debug mode

  // Module resolution - Only necessary path mappings and asset mocks
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    // Only mock truly external dependencies that cannot be used in tests
    '^canvas$': '<rootDir>/tests/mocks/canvas.mock.ts', // Canvas rendering not available in Node
    '^pdfkit$': '<rootDir>/tests/mocks/pdfkit.mock.ts', // PDF generation not needed in tests
    '^puppeteer$': '<rootDir>/tests/mocks/puppeteer.mock.ts', // Puppeteer browser automation not available in Node
    // Path resolution for imports
    '^\\.\\.\/\\.\\.\/src\/(.*)$': '<rootDir>/src/$1',
    '^\\.\\.\/src\/(.*)$': '<rootDir>/src/$1',
  },

  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Optimized TypeScript transformation
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },

  // Transform patterns
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs|@prisma/client|@teaching-engine/database)/)',
  ],

  // Test file patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__mocks__/',
    '/coverage/',
    '/.jest-cache/',
  ],

  // Cleanup and error handling
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  forceExit: true,
  detectOpenHandles: process.env.DEBUG_TESTS === 'true', // Only enable in debug mode

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/**/*.test.{ts,js}',
    '!src/index.ts',
    '!src/types/**',
    '!src/logger.ts', // Skip logger to avoid circular dependencies
  ],
  coverageDirectory: 'coverage',
  coverageReporters: process.env.CI ? ['text', 'lcov', 'json'] : ['text', 'html'],
  coverageThreshold: {
    global: {
      branches: 85, // Target: 85%
      functions: 85, // Target: 85%
      lines: 90, // Target: 90%
      statements: 90, // Target: 90%
    },
  },

  // Reduce console noise
  silent: process.env.DEBUG_TESTS !== 'true',
  verbose: process.env.DEBUG_TESTS === 'true',
  errorOnDeprecated: false,

  // Global setup and teardown
  globalSetup: '<rootDir>/tests/global-setup.ts',
  globalTeardown: '<rootDir>/tests/global-teardown.ts',
};

// Security test project configuration - uses real database
const securityTestProject = {
  ...baseConfig,
  displayName: 'Security Tests',
  testMatch: ['<rootDir>/tests/security/**/*.test.ts'],
  testTimeout: 15000, // 15 seconds for security tests
  maxWorkers: 2, // Limited parallelism for database access

  // Security test setup with real database
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/security/jest-setup.ts', // Security-specific setup
    '<rootDir>/tests/jest.setup.ts', // Real database setup
  ],

  // Security tests use real implementations
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    // Only mock rendering libraries not available in Node
    '^canvas$': '<rootDir>/tests/mocks/canvas.mock.ts',
    '^pdfkit$': '<rootDir>/tests/mocks/pdfkit.mock.ts',
    '^puppeteer$': '<rootDir>/tests/mocks/puppeteer.mock.ts',
  },
};

// Unit test project configuration
const unitTestProject = {
  ...baseConfig,
  displayName: 'Unit Tests',
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/src/**/*.unit.test.ts',
    '<rootDir>/src/**/*.test.ts',
    // Removed security tests from unit test matches
  ],
  testTimeout: 8000, // Reduced to 8 seconds for unit tests
  maxWorkers: getOptimalWorkerCount(), // Use optimized worker count

  // Unit test specific setup - Minimal setup for TDD compliance
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js', // Environment variables only
    // Remove global mocks - tests should mock dependencies explicitly as needed
  ],

  // Unit tests should use real implementations or explicit mocks
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    // Unit tests must explicitly mock dependencies in test files
    // No automatic database mocking - violates TDD principles
  },

  // No database setup for unit tests
  globalSetup: undefined,
  globalTeardown: undefined,
};

// Integration test project configuration
const integrationTestProject = {
  // Use base config but override specific settings for integration tests
  preset: baseConfig.preset,
  testEnvironment: baseConfig.testEnvironment,
  extensionsToTreatAsEsm: baseConfig.extensionsToTreatAsEsm,
  cache: baseConfig.cache,
  cacheDirectory: baseConfig.cacheDirectory,
  maxWorkers: 2, // Limited parallelism for database access
  bail: baseConfig.bail,
  workerIdleMemoryLimit: baseConfig.workerIdleMemoryLimit,
  maxConcurrency: baseConfig.maxConcurrency,
  detectOpenHandles: baseConfig.detectOpenHandles,
  detectLeaks: baseConfig.detectLeaks,
  errorOnDeprecated: baseConfig.errorOnDeprecated,
  testLocationInResults: baseConfig.testLocationInResults,
  logHeapUsage: baseConfig.logHeapUsage,
  moduleDirectories: baseConfig.moduleDirectories,
  moduleFileExtensions: baseConfig.moduleFileExtensions,
  transform: baseConfig.transform,
  transformIgnorePatterns: baseConfig.transformIgnorePatterns,
  testPathIgnorePatterns: baseConfig.testPathIgnorePatterns,
  clearMocks: baseConfig.clearMocks,
  resetMocks: baseConfig.resetMocks,
  restoreMocks: baseConfig.restoreMocks,
  forceExit: baseConfig.forceExit,
  collectCoverageFrom: baseConfig.collectCoverageFrom,
  coverageDirectory: baseConfig.coverageDirectory,
  coverageReporters: baseConfig.coverageReporters,
  coverageThreshold: baseConfig.coverageThreshold,
  silent: baseConfig.silent,
  verbose: baseConfig.verbose,
  globalSetup: baseConfig.globalSetup,
  globalTeardown: baseConfig.globalTeardown,
  displayName: 'Integration Tests',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  testTimeout: 30000, // 30 seconds for integration tests

  // Integration test setup with unified database setup (no per-test transactions)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/integration-test-setup.ts'],

  // Integration tests use real implementations
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    // Only mock rendering libraries not available in Node
    '^canvas$': '<rootDir>/tests/mocks/canvas.mock.ts',
    '^pdfkit$': '<rootDir>/tests/mocks/pdfkit.mock.ts',
    '^puppeteer$': '<rootDir>/tests/mocks/puppeteer.mock.ts',
  },
};

// AI Snapshot test project configuration
const aiSnapshotTestProject = {
  ...baseConfig,
  displayName: 'AI Snapshot Tests',
  testMatch: ['<rootDir>/tests/ai-snapshots/**/*.test.ts'],
  testTimeout: 60000, // 60 seconds for AI operations
  maxWorkers: 1, // Sequential execution for consistent snapshots

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/jest.setup.ts'],

  // AI snapshot tests should use real database and real AI services when possible
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    // Only mock if API key is not available - tests should handle this gracefully
    '^openai$':
      process.env.OPENAI_API_KEY
        ? 'openai'
        : '<rootDir>/src/__mocks__/openai.js',
  },
};

// Performance test project configuration
const performanceTestProject = {
  ...baseConfig,
  displayName: 'Performance Tests',
  testMatch: ['<rootDir>/tests/performance/**/*.test.ts'],
  testTimeout: 120000, // 2 minutes for performance tests
  maxWorkers: 1, // Single worker for accurate measurements

  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Minimal mocking for performance tests
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
  },

  // No database setup for performance tests
  globalSetup: undefined,
  globalTeardown: undefined,
};

// Property-based test project configuration
const propertyTestProject = {
  ...baseConfig,
  displayName: 'Property Tests',
  testMatch: ['<rootDir>/tests/property-based/**/*.property.test.ts'],
  testTimeout: 30000, // 30 seconds for property tests
  maxWorkers: getOptimalWorkerCount(), // Use optimized worker count

  // Property test specific setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/setup/property-test-setup.ts'],

  // Property tests should use real implementations where possible
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    // Property tests may need to mock database for speed, but should be explicit
  },

  // No database setup for property tests
  globalSetup: undefined,
  globalTeardown: undefined,
};

// Export configuration based on test type
const getConfig = () => {
  const testType = process.env.TEST_TYPE;

  switch (testType) {
    case 'unit':
      return unitTestProject;
    case 'security':
      return securityTestProject;
    case 'integration':
      return integrationTestProject;
    case 'ai-snapshots':
      return aiSnapshotTestProject;
    case 'performance':
      return performanceTestProject;
    case 'property':
      return propertyTestProject;
    case 'all':
      // Run all test types as projects
      return {
        ...baseConfig,
        projects: [
          unitTestProject,
          securityTestProject,
          integrationTestProject,
          aiSnapshotTestProject,
          propertyTestProject,
        ],
        testMatch: undefined, // Let projects handle matching
        testTimeout: 60000, // Longest timeout for multi-project runs
      };
    default:
      // Check if running specific test file
      const testPathPattern = process.argv.find(
        (arg) => arg.includes('security') || arg.includes('property-based'),
      );
      if (testPathPattern && testPathPattern.includes('security')) {
        return securityTestProject;
      }
      if (testPathPattern && testPathPattern.includes('property-based')) {
        return propertyTestProject;
      }
      // Default to unit tests only for fast feedback
      return unitTestProject;
  }
};

export default getConfig();
