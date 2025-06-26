/**
 * Performance test setup
 * Configures environment for performance testing
 */

import { performance } from 'perf_hooks';

// Global performance tracking
global.performanceMarks = new Map();

// Add performance helpers to global scope
global.markStart = (name: string) => {
  performance.mark(`${name}-start`);
  global.performanceMarks.set(name, performance.now());
};

global.markEnd = (name: string) => {
  performance.mark(`${name}-end`);
  const startTime = global.performanceMarks.get(name);
  if (startTime) {
    const duration = performance.now() - startTime;
    performance.measure(name, `${name}-start`, `${name}-end`);
    return duration;
  }
  return 0;
};

global.getPerformanceEntries = () => {
  return performance.getEntriesByType('measure');
};

// Increase timeout for performance tests
jest.setTimeout(60000);

// Disable console logs during performance tests
if (process.env.SILENT_PERF_TESTS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
}

beforeEach(() => {
  // Clear performance marks before each test
  performance.clearMarks();
  performance.clearMeasures();
  global.performanceMarks.clear();
});

// Declare global types
declare global {
  var performanceMarks: Map<string, number>;
  var markStart: (name: string) => void;
  var markEnd: (name: string) => number;
  var getPerformanceEntries: () => PerformanceEntry[];
}