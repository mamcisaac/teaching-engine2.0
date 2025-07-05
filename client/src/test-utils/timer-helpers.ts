import { vi, afterEach } from 'vitest';

/**
 * Timer Helpers for Testing
 * 
 * Provides utilities for working with fake timers in tests,
 * ensuring proper cleanup and consistent behavior.
 */

export interface TimerOptions {
  /**
   * Whether to advance timers automatically
   * @default false
   */
  shouldAdvanceTimers?: boolean;
  
  /**
   * Initial system time to set
   * @default new Date()
   */
  now?: Date | number;
  
  /**
   * Whether to mock nextTick
   * @default true
   */
  shouldMockNextTick?: boolean;
}

/**
 * Setup fake timers with proper configuration
 * 
 * @param options Timer configuration options
 * @returns Cleanup function to restore real timers
 */
export function useFakeTimers(options: TimerOptions = {}) {
  const {
    shouldAdvanceTimers = false,
    now = new Date(),
    shouldMockNextTick = true,
  } = options;

  // Setup fake timers
  vi.useFakeTimers({
    shouldAdvanceTimers,
    now,
    toFake: [
      'Date',
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      ...(shouldMockNextTick ? ['nextTick'] : []),
    ],
  });

  // Return cleanup function
  return () => {
    vi.useRealTimers();
  };
}

/**
 * Helper to advance timers and flush promises
 * 
 * @param ms Time to advance in milliseconds
 */
export async function advanceTimersByTimeAsync(ms: number) {
  vi.advanceTimersByTime(ms);
  
  // Flush any pending promises
  await flushPromises();
}

/**
 * Flush all pending promises
 */
export async function flushPromises() {
  await new Promise((resolve) => process.nextTick(resolve));
}

/**
 * Run all pending timers and flush promises
 */
export async function runAllTimersAsync() {
  vi.runAllTimers();
  await flushPromises();
}

/**
 * Run only pending timers (not recurring) and flush promises
 */
export async function runOnlyPendingTimersAsync() {
  vi.runOnlyPendingTimers();
  await flushPromises();
}

/**
 * Advance timers to next timer and flush promises
 */
export async function advanceTimersToNextTimerAsync() {
  vi.advanceTimersToNextTimer();
  await flushPromises();
}

/**
 * Setup fake timers that automatically cleanup after each test
 * 
 * @param options Timer configuration options
 */
export function setupFakeTimers(options: TimerOptions = {}) {
  let cleanup: (() => void) | null = null;

  beforeEach(() => {
    cleanup = useFakeTimers(options);
  });

  afterEach(() => {
    cleanup?.();
  });
}

/**
 * Wait for a specific condition with timeout
 * 
 * @param condition Function that returns true when condition is met
 * @param timeout Maximum time to wait in milliseconds
 * @param interval Check interval in milliseconds
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) {
      return;
    }
    
    if (vi.isFakeTimers()) {
      vi.advanceTimersByTime(interval);
    } else {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Mock and control Date.now() for consistent testing
 * 
 * @param initialTime Initial timestamp
 * @returns Object with methods to control time
 */
export function mockDateNow(initialTime = Date.now()) {
  let currentTime = initialTime;
  
  const originalDateNow = Date.now;
  Date.now = vi.fn(() => currentTime);
  
  return {
    advance: (ms: number) => {
      currentTime += ms;
    },
    set: (time: number) => {
      currentTime = time;
    },
    restore: () => {
      Date.now = originalDateNow;
    },
  };
}

/**
 * Create a test scheduler for controlling async operations
 */
export class TestScheduler {
  private tasks: Array<{ time: number; callback: () => void }> = [];
  private currentTime = 0;

  schedule(callback: () => void, delay: number) {
    this.tasks.push({
      time: this.currentTime + delay,
      callback,
    });
    this.tasks.sort((a, b) => a.time - b.time);
  }

  async advance(ms: number) {
    const targetTime = this.currentTime + ms;
    
    while (this.tasks.length > 0 && this.tasks[0].time <= targetTime) {
      const task = this.tasks.shift()!;
      this.currentTime = task.time;
      task.callback();
      await flushPromises();
    }
    
    this.currentTime = targetTime;
  }

  async runAll() {
    while (this.tasks.length > 0) {
      const task = this.tasks.shift()!;
      this.currentTime = task.time;
      task.callback();
      await flushPromises();
    }
  }

  clear() {
    this.tasks = [];
    this.currentTime = 0;
  }
}

/**
 * Helper for testing debounced functions
 * 
 * @param fn Debounced function to test
 * @param delay Debounce delay
 */
export async function testDebounce(
  fn: (...args: any[]) => void,
  delay: number
) {
  const spy = vi.fn();
  const debounced = vi.fn(fn);
  
  // Call multiple times quickly
  debounced();
  debounced();
  debounced();
  
  // Should not have been called yet
  expect(spy).not.toHaveBeenCalled();
  
  // Advance time past debounce delay
  await advanceTimersByTimeAsync(delay + 1);
  
  // Should have been called once
  expect(spy).toHaveBeenCalledTimes(1);
}

/**
 * Helper for testing throttled functions
 * 
 * @param fn Throttled function to test
 * @param delay Throttle delay
 */
export async function testThrottle(
  fn: (...args: any[]) => void,
  delay: number
) {
  const spy = vi.fn();
  const throttled = vi.fn(fn);
  
  // First call should go through immediately
  throttled();
  expect(spy).toHaveBeenCalledTimes(1);
  
  // Subsequent calls within delay should be ignored
  throttled();
  throttled();
  expect(spy).toHaveBeenCalledTimes(1);
  
  // After delay, next call should go through
  await advanceTimersByTimeAsync(delay + 1);
  throttled();
  expect(spy).toHaveBeenCalledTimes(2);
}