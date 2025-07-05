/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Property-based testing utilities for Teaching Engine 2.0
 * Provides helper functions and common patterns for property tests
 */

import { fc } from 'fast-check';
import { expect } from '@jest/globals';

/**
 * Property test result interface
 */
export interface PropertyTestResult {
  success: boolean;
  error?: string;
  counterexample?: any;
  shrunk?: any;
  numRuns?: number;
  seed?: number;
}

/**
 * Enhanced property test runner with detailed reporting
 */
export class PropertyTestRunner {
  private static defaultConfig = {
    numRuns: 100,
    verbose: false,
    seed: undefined,
    maxSkipsPerRun: 100,
    timeout: 30000,
    examples: [],
  };

  /**
   * Run a property test with enhanced error reporting
   */
  static async runProperty<T>(
    arbitrary: fc.Arbitrary<T>,
    predicate: (value: T) => boolean | Promise<boolean>,
    config: Partial<typeof PropertyTestRunner.defaultConfig> = {}
  ): Promise<PropertyTestResult> {
    const finalConfig = { ...PropertyTestRunner.defaultConfig, ...config };
    
    try {
      const result = await fc.assert(
        fc.asyncProperty(arbitrary, predicate),
        finalConfig
      );
      
      return {
        success: true,
        numRuns: finalConfig.numRuns,
        seed: finalConfig.seed,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        counterexample: error.counterexample,
        shrunk: error.shrunk,
        numRuns: error.numRuns,
        seed: error.seed,
      };
    }
  }

  /**
   * Run a property test and expect it to pass
   */
  static async expectProperty<T>(
    arbitrary: fc.Arbitrary<T>,
    predicate: (value: T) => boolean | Promise<boolean>,
    config: Partial<typeof PropertyTestRunner.defaultConfig> = {}
  ): Promise<void> {
    const result = await PropertyTestRunner.runProperty(arbitrary, predicate, config);
    
    if (!result.success) {
      throw new Error(
        `Property test failed: ${result.error}\n` +
        `Counterexample: ${JSON.stringify(result.counterexample, null, 2)}\n` +
        `Shrunk: ${JSON.stringify(result.shrunk, null, 2)}\n` +
        `Runs: ${result.numRuns}, Seed: ${result.seed}`
      );
    }
  }

  /**
   * Run a property test expecting it to fail (negative testing)
   */
  static async expectPropertyToFail<T>(
    arbitrary: fc.Arbitrary<T>,
    predicate: (value: T) => boolean | Promise<boolean>,
    config: Partial<typeof PropertyTestRunner.defaultConfig> = {}
  ): Promise<void> {
    const result = await PropertyTestRunner.runProperty(arbitrary, predicate, config);
    
    if (result.success) {
      throw new Error('Expected property test to fail, but it passed');
    }
  }
}

/**
 * Property test matchers for Jest
 */
export const propertyMatchers = {
  /**
   * Expect a property to hold for all generated values
   */
  toSatisfyProperty: async function<T>(
    this: any,
    arbitrary: fc.Arbitrary<T>,
    predicate: (value: T) => boolean | Promise<boolean>,
    config?: any
  ) {
    const result = await PropertyTestRunner.runProperty(arbitrary, predicate, config);
    
    if (result.success) {
      return {
        message: () => `Expected property to fail but it passed`,
        pass: true,
      };
    } else {
      return {
        message: () => 
          `Property test failed: ${result.error}\n` +
          `Counterexample: ${JSON.stringify(result.counterexample, null, 2)}\n` +
          `Shrunk: ${JSON.stringify(result.shrunk, null, 2)}`,
        pass: false,
      };
    }
  },

  /**
   * Expect a property to fail (negative testing)
   */
  toViolateProperty: async function<T>(
    this: any,
    arbitrary: fc.Arbitrary<T>,
    predicate: (value: T) => boolean | Promise<boolean>,
    config?: any
  ) {
    const result = await PropertyTestRunner.runProperty(arbitrary, predicate, config);
    
    if (!result.success) {
      return {
        message: () => `Expected property to pass but it failed`,
        pass: true,
      };
    } else {
      return {
        message: () => `Property test passed when it should have failed`,
        pass: false,
      };
    }
  },
};

/**
 * Common property test patterns
 */
export class PropertyTestPatterns {
  /**
   * Test idempotency: f(f(x)) = f(x)
   */
  static idempotent<T>(
    arbitrary: fc.Arbitrary<T>,
    operation: (value: T) => T | Promise<T>
  ) {
    return fc.asyncProperty(arbitrary, async (value) => {
      const result1 = await operation(value);
      const result2 = await operation(result1);
      return JSON.stringify(result1) === JSON.stringify(result2);
    });
  }

  /**
   * Test commutativity: f(x, y) = f(y, x)
   */
  static commutative<T, U>(
    arbitrary1: fc.Arbitrary<T>,
    arbitrary2: fc.Arbitrary<U>,
    operation: (a: T, b: U) => any | Promise<any>
  ) {
    return fc.asyncProperty(arbitrary1, arbitrary2, async (a, b) => {
      const result1 = await operation(a, b);
      const result2 = await operation(b, a);
      return JSON.stringify(result1) === JSON.stringify(result2);
    });
  }

  /**
   * Test associativity: f(f(x, y), z) = f(x, f(y, z))
   */
  static associative<T>(
    arbitrary: fc.Arbitrary<T>,
    operation: (a: T, b: T) => T | Promise<T>
  ) {
    return fc.asyncProperty(arbitrary, arbitrary, arbitrary, async (a, b, c) => {
      const result1 = await operation(await operation(a, b), c);
      const result2 = await operation(a, await operation(b, c));
      return JSON.stringify(result1) === JSON.stringify(result2);
    });
  }

  /**
   * Test identity: f(x, identity) = x
   */
  static identity<T>(
    arbitrary: fc.Arbitrary<T>,
    identity: T,
    operation: (a: T, b: T) => T | Promise<T>
  ) {
    return fc.asyncProperty(arbitrary, async (value) => {
      const result = await operation(value, identity);
      return JSON.stringify(result) === JSON.stringify(value);
    });
  }

  /**
   * Test inverse: f(g(x)) = x
   */
  static inverse<T>(
    arbitrary: fc.Arbitrary<T>,
    operation: (value: T) => T | Promise<T>,
    inverse: (value: T) => T | Promise<T>
  ) {
    return fc.asyncProperty(arbitrary, async (value) => {
      const result = await operation(value);
      const inverted = await inverse(result);
      return JSON.stringify(inverted) === JSON.stringify(value);
    });
  }

  /**
   * Test round-trip: parse(stringify(x)) = x
   */
  static roundTrip<T>(
    arbitrary: fc.Arbitrary<T>,
    serialize: (value: T) => string | Promise<string>,
    deserialize: (value: string) => T | Promise<T>
  ) {
    return fc.asyncProperty(arbitrary, async (value) => {
      const serialized = await serialize(value);
      const deserialized = await deserialize(serialized);
      return JSON.stringify(deserialized) === JSON.stringify(value);
    });
  }

  /**
   * Test monotonicity: x <= y implies f(x) <= f(y)
   */
  static monotonic<T>(
    arbitrary: fc.Arbitrary<T>,
    operation: (value: T) => number | Promise<number>,
    compare: (a: T, b: T) => boolean
  ) {
    return fc.asyncProperty(arbitrary, arbitrary, async (a, b) => {
      if (compare(a, b)) {
        const resultA = await operation(a);
        const resultB = await operation(b);
        return resultA <= resultB;
      }
      return true; // Skip if precondition not met
    });
  }

  /**
   * Test invariant: property that should always hold
   */
  static invariant<T>(
    arbitrary: fc.Arbitrary<T>,
    operation: (value: T) => any | Promise<any>,
    invariant: (input: T, output: any) => boolean
  ) {
    return fc.asyncProperty(arbitrary, async (input) => {
      const output = await operation(input);
      return invariant(input, output);
    });
  }
}

/**
 * Statistical property test utilities
 */
export class StatisticalPropertyTests {
  /**
   * Test that a property holds for at least a certain percentage of cases
   */
  static async expectMinimumSuccess<T>(
    arbitrary: fc.Arbitrary<T>,
    predicate: (value: T) => boolean | Promise<boolean>,
    minimumSuccessRate: number = 0.95,
    numRuns: number = 1000
  ): Promise<void> {
    let successes = 0;
    
    for (let i = 0; i < numRuns; i++) {
      const value = fc.sample(arbitrary, 1)[0];
      const result = await predicate(value);
      if (result) successes++;
    }
    
    const successRate = successes / numRuns;
    expect(successRate).toBeGreaterThanOrEqual(minimumSuccessRate);
  }

  /**
   * Test that generated values have expected statistical properties
   */
  static async expectStatisticalProperty<T>(
    arbitrary: fc.Arbitrary<T>,
    statisticalTest: (samples: T[]) => boolean,
    numSamples: number = 1000
  ): Promise<void> {
    const samples = fc.sample(arbitrary, numSamples);
    const result = statisticalTest(samples);
    expect(result).toBe(true);
  }
}

/**
 * Regression property test utilities
 */
export class RegressionPropertyTests {
  /**
   * Test that a new implementation matches an old implementation
   */
  static regression<T, U>(
    arbitrary: fc.Arbitrary<T>,
    oldImplementation: (value: T) => U | Promise<U>,
    newImplementation: (value: T) => U | Promise<U>
  ) {
    return fc.asyncProperty(arbitrary, async (value) => {
      const oldResult = await oldImplementation(value);
      const newResult = await newImplementation(value);
      return JSON.stringify(oldResult) === JSON.stringify(newResult);
    });
  }

  /**
   * Test that a refactored function behaves the same as the original
   */
  static refactoring<T, U>(
    arbitrary: fc.Arbitrary<T>,
    original: (value: T) => U | Promise<U>,
    refactored: (value: T) => U | Promise<U>
  ) {
    return RegressionPropertyTests.regression(arbitrary, original, refactored);
  }
}

/**
 * Performance property test utilities
 */
export class PerformancePropertyTests {
  /**
   * Test that an operation completes within a time limit
   */
  static async expectTimeLimit<T>(
    arbitrary: fc.Arbitrary<T>,
    operation: (value: T) => any | Promise<any>,
    timeLimitMs: number,
    numRuns: number = 100
  ): Promise<void> {
    await PropertyTestRunner.expectProperty(
      arbitrary,
      async (value) => {
        const startTime = Date.now();
        await operation(value);
        const endTime = Date.now();
        return (endTime - startTime) <= timeLimitMs;
      },
      { numRuns }
    );
  }

  /**
   * Test that an operation's time complexity is within bounds
   */
  static async expectTimeComplexity<T>(
    arbitrary: fc.Arbitrary<T>,
    operation: (value: T) => any | Promise<any>,
    sizeFunction: (value: T) => number,
    maxComplexityFactor: number,
    numRuns: number = 100
  ): Promise<void> {
    await PropertyTestRunner.expectProperty(
      arbitrary,
      async (value) => {
        const size = sizeFunction(value);
        const startTime = Date.now();
        await operation(value);
        const endTime = Date.now();
        const timeMs = endTime - startTime;
        
        // Allow for some overhead and variance
        const maxAllowedTime = size * maxComplexityFactor + 100;
        return timeMs <= maxAllowedTime;
      },
      { numRuns }
    );
  }
}

/**
 * Property test debugging utilities
 */
export class PropertyTestDebugger {
  /**
   * Generate specific examples for debugging
   */
  static generateExamples<T>(
    arbitrary: fc.Arbitrary<T>,
    count: number = 10
  ): T[] {
    return fc.sample(arbitrary, count);
  }

  /**
   * Find minimal counterexample
   */
  static async findMinimalCounterexample<T>(
    arbitrary: fc.Arbitrary<T>,
    predicate: (value: T) => boolean | Promise<boolean>
  ): Promise<T | null> {
    try {
      await fc.assert(fc.asyncProperty(arbitrary, predicate), {
        numRuns: 1000,
        verbose: true,
      });
      return null;
    } catch (error: any) {
      return error.shrunk || error.counterexample;
    }
  }

  /**
   * Profile property test performance
   */
  static async profileProperty<T>(
    arbitrary: fc.Arbitrary<T>,
    operation: (value: T) => any | Promise<any>,
    numRuns: number = 100
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
  }> {
    const times: number[] = [];
    
    for (let i = 0; i < numRuns; i++) {
      const value = fc.sample(arbitrary, 1)[0];
      const startTime = Date.now();
      await operation(value);
      const endTime = Date.now();
      times.push(endTime - startTime);
    }
    
    return {
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalTime: times.reduce((a, b) => a + b, 0),
    };
  }
}

// Export common fast-check functions for convenience
export { fc } from 'fast-check';
export const { property, assert, sample, statistics } = fc;