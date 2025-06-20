/**
 * Test Environment Setup
 *
 * Configures the test environment for analytics components including
 * canvas mocking and other browser API polyfills.
 */

// Set environment variables
process.env.NODE_ENV = 'test';

// Import testing library matchers for Vitest
import { expect } from 'vitest';
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
HTMLCanvasElement.prototype.getContext = () => mockCanvas.getContext();
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
      args[0].includes('Consider using the "jsdom" test environment'))
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
      args[0].includes('not wrapped in act('))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

export {};
