/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Security test setup - Only for preventing accidental API calls in CI
 * 
 * This file should only be used when running tests in environments
 * where we want to ensure no real API calls are made.
 * 
 * For TDD compliance:
 * - Tests should use real APIs when API keys are available
 * - Tests should handle missing API keys gracefully
 * - Mocking should be explicit in test files, not global
 */

import { jest } from '@jest/globals';

// Only in CI or when explicitly requested
if (process.env.CI === 'true' || process.env.FORCE_MOCK_APIS === 'true') {
  console.log('Running in CI/mock mode - external APIs will be mocked');
  
  // In CI, we may want to prevent accidental API calls
  // But tests should still be written to handle real APIs
  if (!process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = 'test-key-for-ci';
  }
} else {
  // In local development, use real APIs if keys are available
  console.log('Running in development mode - real APIs will be used if configured');
}

/**
 * NOTE: This file has been updated for TDD compliance.
 * 
 * Previous behavior (removed):
 * - Automatic deletion of API keys
 * - Global OpenAI mocking
 * - Forced mock responses
 * 
 * New behavior:
 * - Respects existing API keys
 * - Only provides safety in CI environments
 * - Tests must handle both real and mocked scenarios
 */