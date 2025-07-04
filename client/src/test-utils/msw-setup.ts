/**
 * Mock Service Worker (MSW) Setup for Client Tests
 * Provides real API mocking at the network level instead of module mocks
 */

import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { handlers } from './handlers';

// Setup MSW server
export const server = setupServer(...handlers);

// Enable API mocking before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn',
  });
});

// Reset any request handlers that may be added during tests
afterEach(() => {
  server.resetHandlers();
});

// Clean up after tests
afterAll(() => {
  server.close();
});

export { server, rest };