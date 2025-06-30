/**
 * UUID Mock for Jest Tests
 * Provides a mockable UUID v4 function for predictable test behavior
 */

import { jest } from '@jest/globals';

// Create a mock function that can be controlled in tests
export const v4 = jest.fn(() => 'default-uuid-' + Math.random().toString(36).substr(2, 9));

// Export other UUID functions as no-ops for compatibility
export const v1 = jest.fn(() => 'v1-uuid');
export const v3 = jest.fn(() => 'v3-uuid');
export const v5 = jest.fn(() => 'v5-uuid');
export const parse = jest.fn();
export const stringify = jest.fn();
export const validate = jest.fn(() => true);
export const version = jest.fn(() => 4);
export const NIL = '00000000-0000-0000-0000-000000000000';

// Default export for compatibility
export default {
  v1,
  v3,
  v4,
  v5,
  parse,
  stringify,
  validate,
  version,
  NIL,
};