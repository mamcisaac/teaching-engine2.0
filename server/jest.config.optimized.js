/**
 * Optimized Jest Configuration for Teaching Engine 2.0
 * Performance-focused configuration with parallel execution and smart caching
 */

import path from 'path';
import { cpus } from 'os';

// Calculate optimal worker count based on CPU cores
const getOptimalWorkerCount = () => {
  const coreCount = cpus().length;
  if (process.env.CI) return 2; // Conservative for CI
  return Math.max(1, Math.floor(coreCount * 0.75)); // Use 75% of cores
};

/** @type {import('jest').Config} */
const baseConfig = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Performance optimizations
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  maxWorkers: getOptimalWorkerCount(),
  testTimeout: 30000,
  bail: process.env.CI ? 1 : 0, // Stop on first failure in CI
  
  // Module resolution
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
    // Always mock OpenAI for tests
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
  },
  
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  
  // Optimized TypeScript transformation
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          // Inline minimal tsconfig for tests
          target: 'ES2022',
          module: 'ES2022',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: false, // Disable strict mode for faster compilation
          skipLibCheck: true,
          forceConsistentCasingInFileNames: false,
          resolveJsonModule: true,
          isolatedModules: true, // Much faster compilation
        }
      },
    ],
  },
  
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs|@prisma/client)/)'],
  
  // Test file patterns
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/dist/', 
    '/__mocks__/',
    '/tests/integration/', // Ignore slow integration tests by default
    '/tests/e2e/', // Ignore E2E tests by default
  ],
  
  // Cleanup and error handling
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  forceExit: true,
  detectOpenHandles: false, // Disable for speed
  
  // Coverage settings (only when explicitly requested)
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/**/*.test.{ts,js}',
    '!src/index.ts', // Skip entry point
  ],
  coverageDirectory: 'coverage',
  coverageReporters: process.env.CI ? ['text', 'lcov'] : ['text'], // Minimal reporters
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
  verbose: false,
};

/**
 * Unit test project - Maximum speed with full mocking
 */
const unitTestProject = {
  ...baseConfig,
  displayName: 'unit',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  testEnvironment: 'node',
  testTimeout: 5000, // 5 second timeout for unit tests
  
  // Unit-specific setup
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/unit.setup.ts',
  ],
  
  // Aggressive mocking for unit tests
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    // Mock heavy dependencies
    '^@teaching-engine/database$': '<rootDir>/tests/mocks/database.mock.ts',
    '^@/services/(.*)$': '<rootDir>/tests/mocks/services.mock.ts',
    '^canvas$': '<rootDir>/tests/mocks/canvas.mock.ts',
    '^pdfkit$': '<rootDir>/tests/mocks/pdfkit.mock.ts',
  },
  
  // No global setup/teardown for unit tests
  globalSetup: undefined,
  globalTeardown: undefined,
};

/**
 * Integration test project - Balance speed and realism
 */
const integrationTestProject = {
  ...baseConfig,
  displayName: 'integration',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  testTimeout: 15000, // 15 seconds for integration tests
  maxWorkers: 2, // Limited parallelism for database access
  
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/integration.setup.ts',
  ],
  
  // Minimal mocking for integration tests
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^openai$': '<rootDir>/src/__mocks__/openai.js', // Still mock expensive external APIs
  },
  
  // Database setup for integration tests
  globalSetup: '<rootDir>/tests/setup/global-db-setup.ts',
  globalTeardown: '<rootDir>/tests/setup/global-db-teardown.ts',
};

/**
 * Performance test project - Specialized configuration
 */
const performanceTestProject = {
  ...baseConfig,
  displayName: 'performance',
  testMatch: ['<rootDir>/tests/performance/**/*.test.ts'],
  testTimeout: 60000, // 1 minute for performance tests
  maxWorkers: 1, // Single worker for accurate measurements
  
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/performance.setup.ts',
  ],
  
  // No mocking for performance tests
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
  },
};

// Export configuration based on test type
const getConfig = () => {
  const testType = process.env.TEST_TYPE;
  
  switch (testType) {
    case 'unit':
      return unitTestProject;
    case 'integration':
      return integrationTestProject;
    case 'performance':
      return performanceTestProject;
    case 'all':
      // Run all test types in parallel projects
      return {
        ...baseConfig,
        projects: [unitTestProject, integrationTestProject],
        testMatch: undefined, // Let projects handle matching
      };
    default:
      // Default to fast unit tests only
      return unitTestProject;
  }
};

export default getConfig();