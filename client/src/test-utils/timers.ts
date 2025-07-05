/**
 * Test utilities for time-dependent functionality
 * Provides helpers for fake timers, date mocking, and time-based assertions
 */

import { vi } from 'vitest';

export interface TimerTestContext {
  advanceTime: (ms: number) => Promise<void>;
  setSystemTime: (date: Date | string) => void;
  restoreTime: () => void;
  runAllTimers: () => Promise<void>;
}

/**
 * Sets up fake timers for testing time-dependent code
 * Returns utilities for controlling time in tests
 */
export function setupFakeTimers(): TimerTestContext {
  // Use fake timers
  vi.useFakeTimers();
  
  return {
    /**
     * Advance time by specified milliseconds
     */
    async advanceTime(ms: number): Promise<void> {
      await vi.advanceTimersByTimeAsync(ms);
    },
    
    /**
     * Set the current system time for Date.now(), new Date(), etc.
     */
    setSystemTime(date: Date | string): void {
      const targetDate = typeof date === 'string' ? new Date(date) : date;
      vi.setSystemTime(targetDate);
    },
    
    /**
     * Restore real timers
     */
    restoreTime(): void {
      vi.useRealTimers();
    },
    
    /**
     * Run all pending timers to completion
     */
    async runAllTimers(): Promise<void> {
      await vi.runAllTimersAsync();
    },
  };
}

/**
 * Test helper to wrap a test with fake timers
 * Automatically sets up and tears down fake timers
 */
export function withFakeTimers<T>(
  testFn: (timers: TimerTestContext) => Promise<T> | T
): () => Promise<void> {
  return async () => {
    const timers = setupFakeTimers();
    try {
      await testFn(timers);
    } finally {
      timers.restoreTime();
    }
  };
}

/**
 * Mock current time to a specific date
 * Useful for testing date-sensitive logic
 */
export function mockCurrentTime(date: Date | string): () => void {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const originalNow = Date.now;
  const originalDateConstructor = global.Date;
  
  // Mock Date.now()
  Date.now = vi.fn(() => targetDate.getTime());
  
  // Mock new Date() when called without arguments
  global.Date = class extends Date {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(targetDate);
      } else {
        super(...args);
      }
    }
    
    static now() {
      return targetDate.getTime();
    }
  } as any;
  
  // Return cleanup function
  return () => {
    Date.now = originalNow;
    global.Date = originalDateConstructor;
  };
}

/**
 * Wait for all pending promises and timers
 * Useful when testing async code with timers
 */
export async function flushPromisesAndTimers(): Promise<void> {
  await new Promise(resolve => setImmediate(resolve));
  await vi.runAllTimersAsync();
  await new Promise(resolve => setImmediate(resolve));
}

/**
 * Test helper for interval-based functionality
 */
export class IntervalTester {
  private intervals: NodeJS.Timeout[] = [];
  
  /**
   * Start monitoring intervals created during test
   */
  startMonitoring(): void {
    const originalSetInterval = global.setInterval;
    global.setInterval = ((fn: Function, delay: number, ...args: any[]) => {
      const interval = originalSetInterval(fn, delay, ...args);
      this.intervals.push(interval);
      return interval;
    }) as any;
  }
  
  /**
   * Clear all monitored intervals
   */
  clearAll(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }
  
  /**
   * Get count of active intervals
   */
  getActiveCount(): number {
    return this.intervals.length;
  }
}

/**
 * Test helper for timeout-based functionality
 */
export class TimeoutTester {
  private timeouts: NodeJS.Timeout[] = [];
  
  /**
   * Start monitoring timeouts created during test
   */
  startMonitoring(): void {
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = ((fn: Function, delay: number, ...args: any[]) => {
      const timeout = originalSetTimeout(fn, delay, ...args);
      this.timeouts.push(timeout);
      return timeout;
    }) as any;
  }
  
  /**
   * Clear all monitored timeouts
   */
  clearAll(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
  }
  
  /**
   * Get count of active timeouts
   */
  getActiveCount(): number {
    return this.timeouts.length;
  }
}