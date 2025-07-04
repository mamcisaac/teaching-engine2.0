/**
 * Property-Based Testing Configuration
 * Provides centralized configuration for fast-check property tests
 */

import { Parameters } from 'fast-check';

/**
 * Default configuration for property tests
 */
export const defaultPropertyTestConfig: Parameters = {
  // Test execution
  numRuns: 100,
  seed: 42,
  path: '',

  // Error handling
  verbose: process.env.NODE_ENV === 'test' ? false : true,
  markInterruptAsFailure: false,

  // Performance
  timeout: 5000,

  // Shrinking
  interruptAfterTimeLimit: 30000,
  skipAllAfterTimeLimit: 10000,

  // Randomization
  unbiased: false,

  // Reporting
  reporter: undefined,
  asyncReporter: undefined,

  // Examples
  examples: [],
  endOnFailure: false,

  // Bias configuration
  biasedArbitraries: true,
  biasedSize: 2,
};

/**
 * Configuration for fast property tests (unit tests)
 */
export const fastPropertyTestConfig: Parameters = {
  ...defaultPropertyTestConfig,
  numRuns: 50,
  timeout: 2000,
  interruptAfterTimeLimit: 10000,
  skipAllAfterTimeLimit: 5000,
};

/**
 * Configuration for thorough property tests (integration tests)
 */
export const thoroughPropertyTestConfig: Parameters = {
  ...defaultPropertyTestConfig,
  numRuns: 500,
  timeout: 10000,
  interruptAfterTimeLimit: 60000,
  skipAllAfterTimeLimit: 30000,
};

/**
 * Configuration for smoke tests (quick verification)
 */
export const smokeTestConfig: Parameters = {
  ...defaultPropertyTestConfig,
  numRuns: 10,
  timeout: 1000,
  interruptAfterTimeLimit: 5000,
  skipAllAfterTimeLimit: 2000,
};

/**
 * Configuration for stress tests (edge case discovery)
 */
export const stressTestConfig: Parameters = {
  ...defaultPropertyTestConfig,
  numRuns: 1000,
  timeout: 30000,
  interruptAfterTimeLimit: 300000,
  skipAllAfterTimeLimit: 120000,
  unbiased: true,
};

/**
 * Get appropriate configuration based on test type
 */
export function getPropertyTestConfig(
  testType: 'fast' | 'thorough' | 'smoke' | 'stress' = 'fast',
): Parameters {
  switch (testType) {
    case 'fast':
      return fastPropertyTestConfig;
    case 'thorough':
      return thoroughPropertyTestConfig;
    case 'smoke':
      return smokeTestConfig;
    case 'stress':
      return stressTestConfig;
    default:
      return defaultPropertyTestConfig;
  }
}
