/**
 * Test Environment Setup
 *
 * Configures the test environment for analytics components including
 * canvas mocking and other browser API polyfills.
 */

// Set environment variables
process.env.NODE_ENV = 'test';

// Import testing library matchers for Vitest
import { expect, vi, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

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
HTMLCanvasElement.prototype.getContext = (() => mockCanvas.getContext()) as any;
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
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
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

// Mock global fetch for API calls in tests
global.fetch = vi.fn((url, options) => {
  // Convert relative URLs to absolute URLs for testing
  const absoluteUrl = typeof url === 'string' && url.startsWith('/') 
    ? `http://localhost:3000${url}` 
    : url;
  
  // Default mock responses for common endpoints
  if (absoluteUrl === 'http://localhost:3000/api/auth/me') {
    return Promise.resolve({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Not authenticated' }),
    } as Response);
  }
  
  // Generic mock response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({}),
  } as Response);
});

// Mock the api module
vi.mock('./api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

// AuthContext is mocked per test file when needed

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

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
  vi.clearAllTimers();
});

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
