/**
 * Enhanced Test Environment Setup for Real Implementation Testing
 *
 * Configures the test environment to support both mock-based legacy tests
 * and new real implementation tests. Includes browser API polyfills while
 * avoiding global mocks that interfere with real testing.
 */

// Set environment variables for real implementation testing
process.env.NODE_ENV = 'test';
process.env.VITE_TEST_MODE = 'real';
process.env.VITE_USE_REAL_API = process.env.VITE_USE_REAL_API || 'true';
process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Import testing library matchers for Vitest
import * as matchers from '@testing-library/jest-dom/matchers';

import { expect, vi, beforeEach } from 'vitest';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock HTMLCanvasElement before any imports
const mockCanvas = {
  getContext: () => ({
    clearRect: () => {},
    fillRect: () => {},
    drawImage: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: () => {},
    createImageData: () => ({ data: new Uint8ClampedArray(4) }),
    setTransform: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {},
    }),
    createRadialGradient: () => ({
      addColorStop: () => {},
    }),
    createPattern: () => ({}),
  }),
  toDataURL: () => 'data:image/png;base64,mock-data',
  width: 800,
  height: 600,
};

// Mock HTMLCanvasElement globally
Object.defineProperty(window, 'HTMLCanvasElement', {
  writable: true,
  value: class MockHTMLCanvasElement {
    constructor() {
      return mockCanvas;
    }
    getContext() {
      return mockCanvas.getContext();
    }
    toDataURL() {
      return mockCanvas.toDataURL();
    }
    get width() {
      return mockCanvas.width;
    }
    get height() {
      return mockCanvas.height;
    }
    set width(value) {
      mockCanvas.width = value;
    }
    set height(value) {
      mockCanvas.height = value;
    }
  },
});

// Mock HTMLCanvasElement.prototype.getContext
// eslint-disable-next-line @typescript-eslint/no-explicit-any
HTMLCanvasElement.prototype.getContext = (() => mockCanvas.getContext) as any;
HTMLCanvasElement.prototype.toDataURL = () => mockCanvas.toDataURL();

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock pointer capture methods for Radix UI
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = (_pointerId: number) => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = (_pointerId: number) => {};
}

// Mock IntersectionObserver for lazy loading components
class MockIntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock ResizeObserver for responsive charts
class MockResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

Object.defineProperty(global, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// NOTE: Global fetch mocking removed for TDD compliance
// Tests should either:
// 1. Use MSW (Mock Service Worker) for API mocking
// 2. Mock fetch explicitly in individual test files
// 3. Use real API calls in integration tests
// This ensures tests are written with real implementations in mind

// NOTE: API module mocking removed for TDD compliance
// Tests must mock API calls explicitly when needed
// Consider using MSW for more realistic API mocking

// AuthContext should use real implementation or be mocked explicitly in tests
// No global auth mocking - violates TDD principles

// Setup localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Enhanced test cleanup for real implementations
beforeEach(() => {
  // Clear localStorage but preserve real implementation state if needed
  if (process.env.VITE_PRESERVE_TEST_STATE !== 'true') {
    localStorageMock.clear();
  }

  // Clear mocks but be selective to avoid breaking real implementations
  vi.clearAllMocks();
  vi.clearAllTimers();

  // Clear any test-specific global state
  if (typeof window !== 'undefined') {
    // Clear any test-specific window properties
    delete (window as unknown as Record<string, unknown>).testAuthState;
    delete (window as unknown as Record<string, unknown>).testQueryClient;
  }
});

// Define the interface for our test utilities
interface TestUtils {
  isRealMode: () => boolean;
  isUsingRealAPI: () => boolean;
  getAPIBaseURL: () => string | undefined;
}

// Global test utilities for real implementation testing
(global as unknown as { testUtils: TestUtils }).testUtils = {
  isRealMode: () => process.env.VITE_TEST_MODE === 'real',
  isUsingRealAPI: () => process.env.VITE_USE_REAL_API === 'true',
  getAPIBaseURL: () => process.env.VITE_API_BASE_URL,
};

// Suppress specific console errors and warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('inside a test was not wrapped in act') ||
      args[0].includes('not wrapped in act(') ||
      args[0].includes(
        'When testing, code that causes React state updates should be wrapped into act',
      ) ||
      args[0].includes('Consider using the "jsdom" test environment') ||
      args[0].includes('React Router Future Flag Warning'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: An update to') ||
      args[0].includes('inside a test was not wrapped in act') ||
      args[0].includes('not wrapped in act(') ||
      args[0].includes('React Router Future Flag Warning'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

export {};
