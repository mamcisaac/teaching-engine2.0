/**
 * Property-Based Testing Helpers
 * Utility functions for property tests
 */

import fc, { Arbitrary } from 'fast-check';

/**
 * Helper to create a property test with custom configuration
 */
export function createProperty<T>(
  name: string,
  arbitraries: Arbitrary<T>,
  predicate: (value: T) => boolean | Promise<boolean>,
  options?: { numRuns?: number; timeout?: number },
) {
  return fc.assert(fc.property(arbitraries, predicate), {
    numRuns: options?.numRuns ?? 100,
    timeout: options?.timeout ?? 5000,
    verbose: false,
  });
}

/**
 * Helper to create a property test with multiple arbitraries
 */
export function createMultiProperty<T extends readonly unknown[]>(
  name: string,
  arbitraries: { [K in keyof T]: Arbitrary<T[K]> },
  predicate: (...values: T) => boolean | Promise<boolean>,
  options?: { numRuns?: number; timeout?: number },
) {
  return fc.assert(fc.property(...arbitraries, predicate), {
    numRuns: options?.numRuns ?? 100,
    timeout: options?.timeout ?? 5000,
    verbose: false,
  });
}

/**
 * Helper to validate invariants for a given type
 */
export function validateInvariant<T>(
  name: string,
  arbitrary: Arbitrary<T>,
  invariantCheck: (value: T) => boolean,
  options?: { numRuns?: number },
) {
  return createProperty(`Invariant: ${name}`, arbitrary, invariantCheck, options);
}

/**
 * Helper to test roundtrip properties (serialization/deserialization)
 */
export function testRoundtrip<T>(
  name: string,
  arbitrary: Arbitrary<T>,
  serialize: (value: T) => unknown,
  deserialize: (serialized: unknown) => T,
  equality: (a: T, b: T) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b),
  options?: { numRuns?: number },
) {
  return createProperty(
    `Roundtrip: ${name}`,
    arbitrary,
    (value) => {
      try {
        const serialized = serialize(value);
        const deserialized = deserialize(serialized);
        return equality(value, deserialized);
      } catch (_error) {
        return false;
      }
    },
    options,
  );
}

/**
 * Helper to test monotonicity (order preservation)
 */
export function testMonotonicity<T>(
  name: string,
  arbitrary: Arbitrary<T>,
  compare: (a: T, b: T) => number,
  transform: (value: T) => unknown,
  options?: { numRuns?: number },
) {
  return createProperty(
    `Monotonicity: ${name}`,
    fc.array(arbitrary, { minLength: 2, maxLength: 10 }),
    (values) => {
      const sorted = [...values].sort(compare);
      const transformed = sorted.map(transform);

      for (let i = 1; i < transformed.length; i++) {
        if (transformed[i] < transformed[i - 1]) {
          return false;
        }
      }
      return true;
    },
    options,
  );
}

/**
 * Helper to test commutative properties
 */
export function testCommutativity<T>(
  name: string,
  arbitrary: Arbitrary<T>,
  operation: (a: T, b: T) => T,
  equality: (a: T, b: T) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b),
  options?: { numRuns?: number },
) {
  return createProperty(
    `Commutativity: ${name}`,
    fc.tuple(arbitrary, arbitrary),
    ([a, b]) => {
      try {
        const ab = operation(a, b);
        const ba = operation(b, a);
        return equality(ab, ba);
      } catch (_error) {
        return false;
      }
    },
    options,
  );
}

/**
 * Helper to test associativity
 */
export function testAssociativity<T>(
  name: string,
  arbitrary: Arbitrary<T>,
  operation: (a: T, b: T) => T,
  equality: (a: T, b: T) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b),
  options?: { numRuns?: number },
) {
  return createProperty(
    `Associativity: ${name}`,
    fc.tuple(arbitrary, arbitrary, arbitrary),
    ([a, b, c]) => {
      try {
        const ab_c = operation(operation(a, b), c);
        const a_bc = operation(a, operation(b, c));
        return equality(ab_c, a_bc);
      } catch (_error) {
        return false;
      }
    },
    options,
  );
}

/**
 * Helper to test idempotency
 */
export function testIdempotency<T>(
  name: string,
  arbitrary: Arbitrary<T>,
  operation: (value: T) => T,
  equality: (a: T, b: T) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b),
  options?: { numRuns?: number },
) {
  return createProperty(
    `Idempotency: ${name}`,
    arbitrary,
    (value) => {
      try {
        const once = operation(value);
        const twice = operation(once);
        return equality(once, twice);
      } catch (_error) {
        return false;
      }
    },
    options,
  );
}

/**
 * Helper to test identity properties
 */
export function testIdentity<T>(
  name: string,
  arbitrary: Arbitrary<T>,
  operation: (a: T, identity: T) => T,
  identity: T,
  equality: (a: T, b: T) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b),
  options?: { numRuns?: number },
) {
  return createProperty(
    `Identity: ${name}`,
    arbitrary,
    (value) => {
      try {
        const result = operation(value, identity);
        return equality(value, result);
      } catch (_error) {
        return false;
      }
    },
    options,
  );
}

/**
 * Helper to test inverse properties
 */
export function testInverse<T>(
  name: string,
  arbitrary: Arbitrary<T>,
  operation: (value: T) => T,
  inverse: (value: T) => T,
  equality: (a: T, b: T) => boolean = (a, b) => JSON.stringify(a) === JSON.stringify(b),
  options?: { numRuns?: number },
) {
  return createProperty(
    `Inverse: ${name}`,
    arbitrary,
    (value) => {
      try {
        const transformed = operation(value);
        const restored = inverse(transformed);
        return equality(value, restored);
      } catch (_error) {
        return false;
      }
    },
    options,
  );
}

/**
 * Helper to test contract properties (preconditions/postconditions)
 */
export function testContract<T, R>(
  name: string,
  arbitrary: Arbitrary<T>,
  operation: (value: T) => R,
  precondition: (value: T) => boolean,
  postcondition: (input: T, output: R) => boolean,
  options?: { numRuns?: number },
) {
  return createProperty(
    `Contract: ${name}`,
    arbitrary,
    (value) => {
      if (!precondition(value)) {
        return true; // Skip if precondition not met
      }

      try {
        const result = operation(value);
        return postcondition(value, result);
      } catch (_error) {
        return false;
      }
    },
    options,
  );
}

/**
 * Helper to test metamorphic properties
 */
export function testMetamorphic<T, R>(
  name: string,
  arbitrary: Arbitrary<T>,
  operation: (value: T) => R,
  transform: (value: T) => T,
  relation: (original: R, transformed: R) => boolean,
  options?: { numRuns?: number },
) {
  return createProperty(
    `Metamorphic: ${name}`,
    arbitrary,
    (value) => {
      try {
        const originalResult = operation(value);
        const transformedValue = transform(value);
        const transformedResult = operation(transformedValue);
        return relation(originalResult, transformedResult);
      } catch (_error) {
        return false;
      }
    },
    options,
  );
}

/**
 * Helper to test statistical properties
 */
export function testStatistical<T>(
  name: string,
  arbitrary: Arbitrary<T>,
  extract: (value: T) => number,
  predicate: (values: number[]) => boolean,
  options?: { numRuns?: number; sampleSize?: number },
) {
  const sampleSize = options?.sampleSize ?? 1000;

  return createProperty(
    `Statistical: ${name}`,
    fc.array(arbitrary, { minLength: sampleSize, maxLength: sampleSize }),
    (values) => {
      try {
        const numbers = values.map(extract);
        return predicate(numbers);
      } catch (_error) {
        return false;
      }
    },
    { numRuns: options?.numRuns ?? 10 },
  );
}

/**
 * Helper to collect statistics about generated values
 */
export function collectStats<T>(
  name: string,
  arbitrary: Arbitrary<T>,
  classifier: (value: T) => string,
  options?: { numRuns?: number },
) {
  const stats = new Map<string, number>();

  return createProperty(
    `Stats: ${name}`,
    arbitrary,
    (value) => {
      const category = classifier(value);
      stats.set(category, (stats.get(category) || 0) + 1);
      return true;
    },
    options,
  ).then(() => {
    console.log(`Statistics for ${name}:`);
    for (const [category, count] of stats.entries()) {
      console.log(`  ${category}: ${count}`);
    }
  });
}
