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
process.env.VITE_USE_REAL_API = process.env.VITE_USE_REAL_API ?? 'true';
process.env.VITE_API_BASE_URL = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

// Import testing library matchers for Vitest
import * as matchers from '@testing-library/jest-dom/matchers';

import { expect, vi, beforeEach } from 'vitest';

// Extend Vitest's expect with jest-dom matchers
interface ExpectStatic {
  extend: (matchers: Record<string, unknown>) => void;
}
(expect as ExpectStatic).extend(matchers);

interface MockCanvasRenderingContext2D {
  clearRect: () => void;
  fillRect: () => void;
  drawImage: () => void;
  getImageData: () => { data: Uint8ClampedArray };
  putImageData: () => void;
  createImageData: () => { data: Uint8ClampedArray };
  setTransform: () => void;
  save: () => void;
  fillText: () => void;
  restore: () => void;
  beginPath: () => void;
  moveTo: () => void;
  lineTo: () => void;
  closePath: () => void;
  stroke: () => void;
  translate: () => void;
  scale: () => void;
  rotate: () => void;
  arc: () => void;
  fill: () => void;
  measureText: () => { width: number };
  transform: () => void;
  rect: () => void;
  clip: () => void;
  createLinearGradient: () => { addColorStop: () => void };
  createRadialGradient: () => { addColorStop: () => void };
  createPattern: () => Record<string, unknown>;
}

// Mock HTMLCanvasElement before any imports
const mockCanvas = {
  getContext: (): MockCanvasRenderingContext2D => ({
    clearRect: (): void => {},
    fillRect: (): void => {},
    drawImage: (): void => {},
    getImageData: (): { data: Uint8ClampedArray } => ({ data: new Uint8ClampedArray(4) }),
    putImageData: (): void => {},
    createImageData: (): { data: Uint8ClampedArray } => ({ data: new Uint8ClampedArray(4) }),
    setTransform: (): void => {},
    save: (): void => {},
    fillText: (): void => {},
    restore: (): void => {},
    beginPath: (): void => {},
    moveTo: (): void => {},
    lineTo: (): void => {},
    closePath: (): void => {},
    stroke: (): void => {},
    translate: (): void => {},
    scale: (): void => {},
    rotate: (): void => {},
    arc: (): void => {},
    fill: (): void => {},
    measureText: (): TextMetrics => ({ width: 0 } as TextMetrics),
    transform: (): void => {},
    rect: (): void => {},
    clip: (): void => {},
    createLinearGradient: (): { addColorStop: () => void } => ({
      addColorStop: (): void => {},
    }),
    createRadialGradient: (): { addColorStop: () => void } => ({
      addColorStop: (): void => {},
    }),
    createPattern: (): Record<string, unknown> => ({}),
  }),
  toDataURL: (): string => 'data:image/png;base64,mock-data',
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
    getContext(): MockCanvasRenderingContext2D {
      return mockCanvas.getContext();
    }
    toDataURL(): string {
      return mockCanvas.toDataURL();
    }
    get width(): number {
      return mockCanvas.width;
    }
    get height(): number {
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
HTMLCanvasElement.prototype.getContext = ((): MockCanvasRenderingContext2D => mockCanvas.getContext()) as unknown as HTMLCanvasElement['getContext'];
HTMLCanvasElement.prototype.toDataURL = (): string => mockCanvas.toDataURL();

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: (): void => {}, // deprecated
    removeListener: (): void => {}, // deprecated
    addEventListener: (): void => {},
    removeEventListener: (): void => {},
    dispatchEvent: (): boolean => true,
  }),
});

// Mock pointer capture methods for Radix UI
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = (): boolean => false;
}
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = (_pointerId: number): void => {};
}
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = (_pointerId: number): void => {};
}

// Mock IntersectionObserver for lazy loading components
class MockIntersectionObserver {
  constructor() {}
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
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
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
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
const localStorageMock = ((): Storage => {
  let store: Record<string, string> = {};
  
  const getItem = (key: string): string | null => store[key] ?? null;
  
  const setItem = (key: string, value: string): void => {
    store[key] = value;
  };
  
  const removeItem = (key: string): void => {
    delete store[key];
  };
  
  const clear = (): void => {
    store = {};
  };
  
  const key = (index: number): string | null => Object.keys(store)[index] ?? null;
  
  return {
    getItem,
    setItem,
    removeItem,
    clear,
    get length(): number {
      return Object.keys(store).length;
    },
    key,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Enhanced test cleanup for real implementations
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
beforeEach((): void => {
  // Clear localStorage but preserve real implementation state if needed
  if (process.env.VITE_PRESERVE_TEST_STATE !== 'true') {
    localStorageMock.clear();
  }

  // Clear mocks but be selective to avoid breaking real implementations
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  vi.clearAllMocks();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  vi.clearAllTimers();

  // Clear any test-specific global state
  if (typeof window !== 'undefined') {
    // Clear any test-specific window properties
    const windowAny = window as unknown as Record<string, unknown>;
    delete windowAny.testAuthState;
    delete windowAny.testQueryClient;
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
  isRealMode: (): boolean => process.env.VITE_TEST_MODE === 'real',
  isUsingRealAPI: (): boolean => process.env.VITE_USE_REAL_API === 'true',
  getAPIBaseURL: (): string | undefined => process.env.VITE_API_BASE_URL,
};

// Suppress specific console errors and warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: unknown[]): void => {
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

console.warn = (...args: unknown[]): void => {
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
