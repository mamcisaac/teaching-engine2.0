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

  // Module resolution - Fixed paths and mappings
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
    // Mock external dependencies by default
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
    '^canvas$': '<rootDir>/tests/mocks/canvas.mock.ts',
    '^pdfkit$': '<rootDir>/tests/mocks/pdfkit.mock.ts',
    '^pdf-parse$': '<rootDir>/src/__mocks__/pdf-parse.ts',
    '^mammoth$': '<rootDir>/src/__mocks__/mammoth.ts',
    // Mock UUID to fix test issues
    '^uuid$': '<rootDir>/tests/mocks/uuid.mock.ts',
    // Fix prisma path resolution
    '^@teaching-engine/database$': '<rootDir>/tests/mocks/database.mock.ts',
    // Add src/ path resolution for relative imports (more specific patterns)
    '^\\.\\.\/\\.\\.\/src\/(.*)$': '<rootDir>/src/$1',
    '^\\.\\.\/src\/(.*)$': '<rootDir>/src/$1',
    // Add specific patterns for common relative imports
    '^\\.\\.\/\\.\\.\/prisma$': '<rootDir>/tests/mocks/database.mock.ts',
    '^\\.\\.\/prisma$': '<rootDir>/tests/mocks/database.mock.ts',
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
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
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
    '<rootDir>/tests/jest.setup.ts', // Real database setup
  ],

  // Minimal mocking for security tests - real database needed
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
    // Still mock expensive external APIs
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
    '^canvas$': '<rootDir>/tests/mocks/canvas.mock.ts',
    '^pdfkit$': '<rootDir>/tests/mocks/pdfkit.mock.ts',
  },
};

// Unit test project configuration
const unitTestProject = {
  ...baseConfig,
  displayName: 'Unit Tests',
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/src/**/*.unit.test.ts',
    // Removed security tests from unit test matches
  ],
  testTimeout: 8000, // Reduced to 8 seconds for unit tests
  maxWorkers: getOptimalWorkerCount(), // Use optimized worker count

  // Unit test specific setup - Load jest.setup.js FIRST for proper env var configuration
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js', // Must be FIRST - sets up environment variables
    '<rootDir>/tests/setup/00-security-mocks.ts', // Load security mocks SECOND
    '<rootDir>/tests/setup/file-parsing-mocks.ts', // Load file parsing mocks
    '<rootDir>/tests/setup-all-mocks.ts',
  ],

  // Aggressive mocking for unit tests
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    // Mock database for unit tests
    '^@teaching-engine/database$': '<rootDir>/tests/mocks/database.mock.ts',
    // Don't mock all services - only specific ones as needed
    // '^@/services/(.*)$': '<rootDir>/tests/mocks/services.mock.ts',
    // Ensure relative paths to src are resolved correctly
    '^\\.\\.\/\\.\\.\/src\/prisma$': '<rootDir>/tests/mocks/database.mock.ts',
    '^\\.\\.\/src\/prisma$': '<rootDir>/tests/mocks/database.mock.ts',
    '^src/prisma$': '<rootDir>/tests/mocks/database.mock.ts',
    // Add more specific prisma resolution patterns
    '^@/prisma$': '<rootDir>/tests/mocks/database.mock.ts',
    '^\\.\\.\/\\.\\.\/prisma$': '<rootDir>/tests/mocks/database.mock.ts',
  },

  // No database setup for unit tests
  globalSetup: undefined,
  globalTeardown: undefined,
};

// Integration test project configuration
const integrationTestProject = {
  ...baseConfig,
  displayName: 'Integration Tests',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  testTimeout: 30000, // 30 seconds for integration tests
  maxWorkers: 2, // Limited parallelism for database access

  // Integration test setup with unified database setup (no per-test transactions)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/integration-test-setup.ts'],

  // Minimal mocking for integration tests
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
    // Still mock expensive external APIs
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
    '^canvas$': '<rootDir>/tests/mocks/canvas.mock.ts',
    '^pdfkit$': '<rootDir>/tests/mocks/pdfkit.mock.ts',
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

  // AI tests need database but mock external AI services by default
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
    // Mock OpenAI by default unless OPENAI_API_KEY is set for real testing
    '^openai$':
      process.env.OPENAI_API_KEY && process.env.USE_REAL_OPENAI
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
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
  },

  // No database setup for performance tests
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
    case 'all':
      // Run all test types as projects
      return {
        ...baseConfig,
        projects: [
          unitTestProject,
          securityTestProject,
          integrationTestProject,
          aiSnapshotTestProject,
        ],
        testMatch: undefined, // Let projects handle matching
        testTimeout: 60000, // Longest timeout for multi-project runs
      };
    default:
      // Check if running specific security test file
      const testPathPattern = process.argv.find((arg) => arg.includes('security'));
      if (testPathPattern) {
        return securityTestProject;
      }
      // Default to unit tests only for fast feedback
      return unitTestProject;
  }
};

export default getConfig();
