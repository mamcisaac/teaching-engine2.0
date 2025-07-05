/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Test setup utilities
 * Basic test configuration without MSW dependency
 */

import { vi } from 'vitest';

// Mock server for testing
export const server = {
  listen: vi.fn(),
  close: vi.fn(),
  use: vi.fn(),
  resetHandlers: vi.fn(),
};

// Enable API mocking before all tests
beforeAll(() => {
  server.listen();
});

// Reset any request handlers that may be added during tests
afterEach(() => {
  server.resetHandlers();
});

// Clean up after tests
afterAll(() => {
  server.close();
});

// Mock setup functions
export function setupTests() {
  console.log('Setting up tests...');
}

export function teardownTests() {
  console.log('Tearing down tests...');
}