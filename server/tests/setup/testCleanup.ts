/**
 * Test cleanup utilities to prevent hanging handles and timeouts
 */

import { jest } from '@jest/globals';

// Global timeout for all async operations
const GLOBAL_TIMEOUT = 8000;

// Track open handles for cleanup
const openHandles = new Set<any>();

// Setup global cleanup
beforeEach(() => {
  // Clear all timers
  jest.clearAllTimers();

  // Setup global timeout
  jest.setTimeout(GLOBAL_TIMEOUT);
});

afterEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear all timers
  jest.clearAllTimers();

  // Force cleanup of fetch and network operations
  if (global.fetch && typeof global.fetch === 'function') {
    (global.fetch as any).mockClear?.();
  }

  // Clear any pending promises
  await new Promise((resolve) => setImmediate(resolve));
});

afterAll(async () => {
  // Final cleanup
  jest.restoreAllMocks();

  // Force cleanup of any remaining handles
  openHandles.forEach((handle) => {
    try {
      if (handle && typeof handle.close === 'function') {
        handle.close();
      }
      if (handle && typeof handle.destroy === 'function') {
        handle.destroy();
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });
  openHandles.clear();

  // Final promise resolution
  await new Promise((resolve) => setImmediate(resolve));
});

// Export utilities for manual cleanup
export const registerHandle = (handle: any) => {
  openHandles.add(handle);
};

export const unregisterHandle = (handle: any) => {
  openHandles.delete(handle);
};

export const forceCleanup = async () => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  await new Promise((resolve) => setImmediate(resolve));
};
