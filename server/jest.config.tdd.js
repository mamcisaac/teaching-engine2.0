/**
 * TDD-Compliant Jest Configuration
 * Uses real databases and implementations for all tests
 * 
 * This configuration enforces strict TDD principles:
 * - No mock databases (uses real SQLite/PostgreSQL)
 * - No mock services (uses real implementations)
 * - Only mocks external paid APIs (OpenAI, etc.)
 * - Tests must verify actual behavior
 */

import path from 'path';
import { cpus } from 'os';

// Base configuration for all TDD tests
const baseTDDConfig = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  
  // Performance settings
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  testTimeout: 30000, // 30 seconds for real database operations
  
  // Module resolution
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^tests/(.*)$': '<rootDir>/tests/$1',
    
    // Only mock expensive external APIs
    '^openai$': '<rootDir>/src/__mocks__/openai.js',
    '^@sendgrid/mail$': '<rootDir>/src/__mocks__/@sendgrid/mail.js',
    '^stripe$': '<rootDir>/src/__mocks__/stripe.js',
    
    // DO NOT mock database - use real implementation
    '^@teaching-engine/database$': '@teaching-engine/database',
  },
  
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  
  // TypeScript transformation
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  
  // Test patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__mocks__/',
    '/coverage/',
    '/.jest-cache/',
  ],
  
  // Cleanup
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Coverage with high standards
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/**/*.test.{ts,js}',
    '!src/index.ts',
    '!src/types/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },
};

// Unit test configuration with real SQLite database
const unitTestConfig = {
  ...baseTDDConfig,
  displayName: 'Unit Tests (TDD)',
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/src/**/*.unit.test.ts',
  ],
  
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup/tdd-unit-setup.ts',
  ],
  
  maxWorkers: Math.min(cpus().length, 4), // Parallel tests with real DBs
  
  globals: {
    'ts-jest': {
      isolatedModules: true, // Faster compilation
    },
  },
  
  testEnvironmentOptions: {
    TEST_TYPE: 'unit',
    TEST_DATABASE: 'sqlite-memory',
  },
};

// Integration test configuration with real database
const integrationTestConfig = {
  ...baseTDDConfig,
  displayName: 'Integration Tests (TDD)',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  testTimeout: 60000, // 60 seconds for integration tests
  
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup/tdd-integration-setup.ts',
  ],
  
  maxWorkers: 2, // Limited parallelism for database access
  
  testEnvironmentOptions: {
    TEST_TYPE: 'integration',
    TEST_DATABASE: process.env.CI ? 'postgresql' : 'sqlite-file',
  },
};

// E2E test configuration with PostgreSQL
const e2eTestConfig = {
  ...baseTDDConfig,
  displayName: 'E2E Tests (TDD)',
  testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
  testTimeout: 120000, // 2 minutes for E2E tests
  
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup/tdd-e2e-setup.ts',
  ],
  
  maxWorkers: 1, // Sequential for E2E tests
  
  testEnvironmentOptions: {
    TEST_TYPE: 'e2e',
    TEST_DATABASE: 'postgresql',
  },
};

// Security test configuration with real security scenarios
const securityTestConfig = {
  ...baseTDDConfig,
  displayName: 'Security Tests (TDD)',
  testMatch: ['<rootDir>/tests/security/**/*.test.ts'],
  testTimeout: 45000, // 45 seconds for security tests
  
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup/tdd-security-setup.ts',
  ],
  
  maxWorkers: 2,
  
  testEnvironmentOptions: {
    TEST_TYPE: 'security',
    TEST_DATABASE: 'postgresql',
  },
};

// Performance test configuration with real load
const performanceTestConfig = {
  ...baseTDDConfig,
  displayName: 'Performance Tests (TDD)',
  testMatch: ['<rootDir>/tests/performance/**/*.test.ts'],
  testTimeout: 300000, // 5 minutes for performance tests
  
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup/tdd-performance-setup.ts',
  ],
  
  maxWorkers: 1, // Sequential for accurate measurements
  
  testEnvironmentOptions: {
    TEST_TYPE: 'performance',
    TEST_DATABASE: 'postgresql',
  },
};

// Export configuration based on test type
const getConfig = () => {
  const testType = process.env.TEST_TYPE || 'unit';
  
  switch (testType) {
    case 'unit':
      return unitTestConfig;
    case 'integration':
      return integrationTestConfig;
    case 'e2e':
      return e2eTestConfig;
    case 'security':
      return securityTestConfig;
    case 'performance':
      return performanceTestConfig;
    case 'all':
      return {
        ...baseTDDConfig,
        projects: [
          unitTestConfig,
          integrationTestConfig,
          e2eTestConfig,
          securityTestConfig,
        ],
      };
    default:
      return unitTestConfig;
  }
};

export default getConfig();