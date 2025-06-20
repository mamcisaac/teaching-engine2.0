/**
 * Test Setup for Contract Tests
 *
 * Configures the test environment for running contract tests
 */

import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config({ path: '.env.test' });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Configure test database if needed
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./test.db';
}

// Global test setup
beforeAll(async () => {
  // Any global setup needed for contract tests
});

afterAll(async () => {
  // Cleanup after contract tests
});
