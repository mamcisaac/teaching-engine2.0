/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Minimal mock setup for tests - TDD compliant
 * 
 * This file only sets up truly necessary environment configurations.
 * Tests should explicitly mock their dependencies as needed.
 */
import { jest } from '@jest/globals';

// Environment variables should be set by jest.setup.js
// Do not override them here
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

// Clear mock call history between test suites to prevent memory leaks
beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * NOTE: All global mocks have been removed to comply with TDD principles.
 * 
 * Tests must now:
 * 1. Write failing tests FIRST before implementation
 * 2. Use real implementations wherever possible
 * 3. Explicitly mock dependencies in individual test files as needed
 * 4. Use real databases, real API calls, and real services
 * 
 * Removed mocks:
 * - Database/Prisma mocking (use real test database)
 * - Service mocking (use real service implementations)
 * - UUID mocking (use real UUIDs)
 * - Logger mocking (use real logger or explicit mocks)
 * - OpenAI mocking (mock only when API key unavailable)
 * 
 * Only truly external dependencies that cannot run in Node.js
 * (like canvas rendering) should be mocked globally.
 */