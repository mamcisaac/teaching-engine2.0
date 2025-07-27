/**
 * Global test setup
 * This file is run before all test files
 */

import { jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';

// Mock timers globally
jest.useFakeTimers();

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Global cleanup
afterEach(() => {
  jest.clearAllMocks();

  // Reset environment variables
  delete process.env.OPENAI_API_KEY;
  delete process.env.DATABASE_URL;

  // Clear any timers
  jest.clearAllTimers();
});

afterAll(() => {
  // Restore console
  global.console = originalConsole;

  // Restore timers
  jest.useRealTimers();
});
