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

// Mock email service to prevent sending real emails
jest.mock('@/services/emailService', () => ({
  sendEmail: jest.fn().mockImplementation(async (to, subject, body) => {
    console.log(`[E2E Mock] Email would be sent to ${to}: ${subject}`);
    return true;
  }),
  sendBulkEmails: jest.fn().mockImplementation(async (emails) => {
    console.log(`[E2E Mock] Bulk emails would be sent to ${emails.length} recipients`);
    return { sent: emails, failed: [] };
  }),
}));

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