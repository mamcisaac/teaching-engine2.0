/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mock setup for E2E tests
 * E2E tests use minimal mocking - only external APIs that would be expensive/unreliable
 */

import { jest } from '@jest/globals';
import { setupTestEnvironment } from './testHelpers';
import { createMockOpenAI } from './mockFactories';

// Set up test environment
setupTestEnvironment();

// Create minimal mocks for external services that are expensive or unreliable
const mockOpenAI = createMockOpenAI();

// Only mock external APIs for E2E tests
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockOpenAI),
  OpenAI: jest.fn().mockImplementation(() => mockOpenAI),
}));

// Email service removed - app only creates newsletter drafts, doesn't send emails

// Use real implementations for everything else:
// - Database operations
// - File system operations
// - Internal services
// - Business logic

// Store mock instances globally for test access
const globalForTest = globalThis as unknown as {
  e2eMocks: {
    openai: typeof mockOpenAI;
  };
};

globalForTest.e2eMocks = {
  openai: mockOpenAI,
};

// Export for direct use in tests
export {
  mockOpenAI,
};