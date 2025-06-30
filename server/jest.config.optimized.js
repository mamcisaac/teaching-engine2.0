/**
 * Optimized Jest Configuration for Maximum Performance
 * Final configuration implementing all Phase 1-3 optimizations
 */

import path from 'path';
import { cpus } from 'os';

// Optimized worker calculation based on test type and system capabilities
const getOptimalWorkerCount = (testType = 'unit') => {
  const coreCount = cpus().length;
  const maxMemoryMB = 4096; // Estimate available memory
  
  if (process.env.CI) {
    return Math.min(2, coreCount); // Conservative for CI
  }
  
  switch (testType) {
    case 'fast':
      // Fast tests can run with maximum parallelization
      return Math.min(8, coreCount);
    case 'unit':
      // Regular unit tests with good parallelization
      return Math.min(6, Math.floor(coreCount * 0.8));
    case 'integration':
      // Integration tests need database access - limited parallelization
      return Math.min(2, Math.floor(coreCount * 0.25));
    default:
      return Math.max(1, Math.floor(coreCount * 0.5));
  }
};

// Base performance-optimized configuration
const baseConfig = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Aggressive performance optimizations
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  workerIdleMemoryLimit: '256MB', // Reduced memory limit per worker
  maxConcurrency: 4, // Reduced concurrent tests per worker
  
  // Fast-fail strategy
  bail: 3, // Stop after 3 failures
  testTimeout: 5000, // Aggressive 5-second timeout
  
  // Minimal detection for performance
  detectOpenHandles: false,
  detectLeaks: false,
  
  // Module resolution optimizations
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    '^@/utils/logger$': '<rootDir>/src/logger',
    // Aggressive mocking for performance
    '^@teaching-engine/database$': '<rootDir>/tests/mocks/database.mock.ts',
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
    '^canvas$': '<rootDir>/tests/mocks/canvas.mock.ts',
    '^pdfkit$': '<rootDir>/tests/mocks/pdfkit.mock.ts',
  },
  
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Optimized TypeScript transformation
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          target: 'ES2020', // Modern target for speed
          module: 'ESNext',
          strict: false, // Disable strict mode for faster compilation
          skipLibCheck: true, // Skip lib checks for speed
        },
      },
    ],
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs|@prisma/client|@teaching-engine/database)/)'
  ],
  
  // Focused test patterns
  testPathIgnorePatterns: [
    '/node_modules/', 
    '/dist/', 
    '/__mocks__/',
    '/coverage/',
    '/.jest-cache/',
    '\\.disabled\\.',
  ],
  
  // Minimal cleanup for speed
  clearMocks: true,
  resetMocks: false, // Don't reset - faster
  restoreMocks: false, // Don't restore - faster
  forceExit: true,
  
  // Minimal coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/**/*.test.{ts,js}',
    '!src/index.ts',
    '!src/types/**',
    '!src/logger.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text'], // Text only for speed
  
  // Silent mode for performance
  silent: true,
  verbose: false,
  errorOnDeprecated: false,
};

// Fast test configuration (< 3 seconds target)
const fastTestConfig = {
  ...baseConfig,
  displayName: 'Fast Tests',
  testMatch: [
    '<rootDir>/tests/unit/**/*.fast.test.ts',
    '<rootDir>/tests/unit/**/auth*.test.ts',
    '<rootDir>/tests/unit/**/validation*.test.ts',
    '<rootDir>/tests/unit/**/utils*.test.ts',
    '<rootDir>/tests/unit/**/helpers*.test.ts',
    '<rootDir>/tests/unit/connectors/*.test.ts',
  ],
  testTimeout: 3000, // 3 seconds max for fast tests
  maxWorkers: getOptimalWorkerCount('fast'),
  
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup-all-mocks.ts',
  ],
};

// Medium test configuration (3-8 seconds target)
const mediumTestConfig = {
  ...baseConfig,
  displayName: 'Medium Tests',
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
  ],
  testPathIgnorePatterns: [
    ...baseConfig.testPathIgnorePatterns,
    '.*\\.fast\\.test\\.',
    '.*\\.slow\\.test\\.',
    '.*/auth.*\\.test\\.',
    '.*/validation.*\\.test\\.',
    '.*/utils.*\\.test\\.',
    '.*/helpers.*\\.test\\.',
    '.*/connectors/.*\\.test\\.',
  ],
  testTimeout: 8000, // 8 seconds max for medium tests
  maxWorkers: getOptimalWorkerCount('unit'),
  
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup-all-mocks.ts',
  ],
};

// Get configuration based on environment
const getConfig = () => {
  const testType = process.env.TEST_TYPE || process.env.npm_config_test_type;
  
  switch (testType) {
    case 'fast':
      return fastTestConfig;
    case 'medium':
      return mediumTestConfig;
    case 'optimized':
      // Run both fast and medium as projects
      return {
        ...baseConfig,
        projects: [fastTestConfig, mediumTestConfig],
        testMatch: undefined,
        testTimeout: 8000,
        maxWorkers: getOptimalWorkerCount('unit'),
      };
    default:
      // Default to fast tests for quickest feedback
      return fastTestConfig;
  }
};

export default getConfig();