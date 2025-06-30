/**
 * Performance-Optimized Jest Configuration
 * Target: Reduce test execution from 42s to under 15s
 */

import path from 'path';
import { cpus } from 'os';

// Calculate optimal worker count based on CPU cores
const getOptimalWorkerCount = () => {
  const coreCount = cpus().length;
  if (process.env.CI) return 2;
  
  // For unit tests, use all available cores for maximum parallelization
  return coreCount;
};

// Performance-focused configuration
const performanceConfig = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Aggressive performance optimizations
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  maxWorkers: getOptimalWorkerCount(),
  testTimeout: 5000, // Reduced to 5 seconds for unit tests
  bail: 1, // Stop on first failure for faster feedback
  
  // Memory and concurrency optimizations
  workerIdleMemoryLimit: '256MB', // Reduced memory limit per worker
  maxConcurrency: 20, // Higher concurrency per worker
  detectOpenHandles: false, // Disabled for performance
  detectLeaks: false, // Disabled for performance
  
  // Faster transforms with minimal config
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: true, // Faster compilation
        tsconfig: {
          target: 'es2022',
          module: 'es2022',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true, // Skip type checking of dependencies
        },
      },
    ],
  },
  
  // Minimal module resolution
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    // Mock all external dependencies
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
    '^canvas$': '<rootDir>/tests/mocks/empty.mock.ts',
    '^pdfkit$': '<rootDir>/tests/mocks/empty.mock.ts',
    '^@teaching-engine/database$': '<rootDir>/tests/mocks/database.mock.ts',
  },
  
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js'],
  
  // Exclude slow patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__mocks__/',
    '/coverage/',
    '/.jest-cache/',
    // Exclude integration and slow tests
    '/tests/integration/',
    '/tests/ai-snapshots/',
    '/tests/performance/',
    '.*\\.slow\\.test\\.[jt]s$',
  ],
  
  // Test file patterns - only fast unit tests
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/src/**/*.unit.test.ts',
    // Include specific fast test patterns
    '<rootDir>/tests/**/*.fast.test.ts',
  ],
  
  // Minimal setup
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.performance.js',
  ],
  
  // No global setup/teardown for unit tests
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Cleanup settings
  clearMocks: true,
  resetMocks: false, // Disabled for performance
  restoreMocks: false, // Disabled for performance
  forceExit: true,
  
  // Minimal coverage collection
  collectCoverage: false, // Disable by default for speed
  
  // Reduce console noise
  silent: true,
  verbose: false,
  errorOnDeprecated: false,
  
  // Test sharding for parallel execution
  projects: undefined, // No projects for simpler setup
  
  // Experimental features for performance
  experimentalParallelism: true,
  runInBand: false,
};

export default performanceConfig;