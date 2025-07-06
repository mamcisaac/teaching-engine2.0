/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Jest setup for security tests
 */

// Ensure we use real database for security tests
jest.unmock('@teaching-engine/database');

// Add custom matchers
expect.extend({
  toBeOneOf(received, array) {
    const pass = array.includes(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${array.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${array.join(', ')}`,
        pass: false,
      };
    }
  },
});

// TypeScript declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(array: any[]): R;
    }
  }
}
