/**
 * Skip Real API Tests
 * This setup file ensures that tests designed for real API calls are skipped
 * unless explicitly enabled with REAL_API_TESTS=true
 */

import { jest } from '@jest/globals';

// Check if real API tests are explicitly enabled
const REAL_API_TESTS_ENABLED = process.env.REAL_API_TESTS === 'true';

if (!REAL_API_TESTS_ENABLED) {
  // Override describe for real API test files
  const originalDescribe = global.describe;

  global.describe = ((name: string, fn: () => void) => {
    // Skip test suites that mention "Real API" or "Production"
    if (name.includes('Real API') || name.includes('Production')) {
      console.log(`⚠️  SKIPPING: ${name} - Set REAL_API_TESTS=true to run these tests`);
      return originalDescribe.skip(name, fn);
    }
    return originalDescribe(name, fn);
  }) as any;

  // Preserve other describe properties
  Object.setPrototypeOf(global.describe, originalDescribe);
  Object.getOwnPropertyNames(originalDescribe).forEach((prop) => {
    if (prop !== 'length' && prop !== 'name' && prop !== 'prototype') {
      (global.describe as any)[prop] = (originalDescribe as any)[prop];
    }
  });
}

// Log configuration
console.log(
  '[TEST CONFIG] Real API tests:',
  REAL_API_TESTS_ENABLED ? 'ENABLED' : 'DISABLED (default)',
);

export {};
