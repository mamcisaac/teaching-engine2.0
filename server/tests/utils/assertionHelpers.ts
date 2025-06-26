/**
 * Custom assertion helpers for testing
 */

/**
 * Asserts that a value is defined (not null or undefined)
 */
export const assertDefined = <T>(value: T | null | undefined, message?: string): asserts value is T => {
  if (value == null) {
    throw new Error(message || `Expected value to be defined, but got ${value}`);
  }
};

/**
 * Asserts that an array contains specific items
 */
export const assertArrayContains = <T>(array: T[], expectedItems: T[], message?: string): void => {
  for (const item of expectedItems) {
    if (!array.includes(item)) {
      throw new Error(message || `Expected array to contain ${JSON.stringify(item)}`);
    }
  }
};

/**
 * Asserts that an object has specific properties
 */
export const assertObjectHasProperties = (obj: any, properties: string[], message?: string): void => {
  for (const prop of properties) {
    if (!(prop in obj)) {
      throw new Error(message || `Expected object to have property '${prop}'`);
    }
  }
};

/**
 * Asserts that a function throws a specific error
 */
export const assertThrows = async (
  fn: () => any | Promise<any>,
  expectedError?: string | RegExp | Error,
  message?: string
): Promise<void> => {
  let thrownError: Error | undefined;

  try {
    await fn();
  } catch (error) {
    thrownError = error as Error;
  }

  if (!thrownError) {
    throw new Error(message || 'Expected function to throw an error, but it did not');
  }

  if (expectedError) {
    if (typeof expectedError === 'string') {
      if (!thrownError.message.includes(expectedError)) {
        throw new Error(
          message ||
            `Expected error message to include '${expectedError}', but got '${thrownError.message}'`
        );
      }
    } else if (expectedError instanceof RegExp) {
      if (!expectedError.test(thrownError.message)) {
        throw new Error(
          message ||
            `Expected error message to match ${expectedError}, but got '${thrownError.message}'`
        );
      }
    } else if (expectedError instanceof Error) {
      if (thrownError.constructor !== expectedError.constructor) {
        throw new Error(
          message ||
            `Expected error type ${expectedError.constructor.name}, but got ${thrownError.constructor.name}`
        );
      }
    }
  }
};

/**
 * Asserts that a value is within a numeric range
 */
export const assertInRange = (value: number, min: number, max: number, message?: string): void => {
  if (value < min || value > max) {
    throw new Error(message || `Expected ${value} to be between ${min} and ${max}`);
  }
};

/**
 * Asserts that two dates are close to each other within a tolerance
 */
export const assertDatesClose = (
  date1: Date,
  date2: Date,
  toleranceMs: number = 1000,
  message?: string
): void => {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  if (diff > toleranceMs) {
    throw new Error(
      message ||
        `Expected dates to be within ${toleranceMs}ms of each other, but difference was ${diff}ms`
    );
  }
};

/**
 * Asserts that an async operation completes within a time limit
 */
export const assertTimely = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  message?: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(message || `Operation did not complete within ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
};

/**
 * Asserts that a mock function was called with specific arguments
 */
export const assertMockCalledWith = (
  mockFn: jest.Mock,
  expectedArgs: any[],
  message?: string
): void => {
  const calls = mockFn.mock.calls;
  const found = calls.some(call => 
    call.length === expectedArgs.length &&
    call.every((arg, index) => JSON.stringify(arg) === JSON.stringify(expectedArgs[index]))
  );

  if (!found) {
    throw new Error(
      message ||
        `Expected mock to be called with ${JSON.stringify(expectedArgs)}, but got calls: ${JSON.stringify(calls)}`
    );
  }
};

/**
 * Asserts that an API response has the expected structure
 */
export const assertApiResponse = (
  response: any,
  expectedStatus?: number,
  expectedProperties?: string[],
  message?: string
): void => {
  if (expectedStatus && response.status !== expectedStatus) {
    throw new Error(
      message || `Expected status ${expectedStatus}, but got ${response.status}`
    );
  }

  if (expectedProperties) {
    assertObjectHasProperties(response.body || response.data, expectedProperties, message);
  }
};

/**
 * Asserts that an array is sorted according to a comparison function
 */
export const assertArraySorted = <T>(
  array: T[],
  compareFn: (a: T, b: T) => number,
  message?: string
): void => {
  for (let i = 1; i < array.length; i++) {
    if (compareFn(array[i - 1], array[i]) > 0) {
      throw new Error(message || `Array is not sorted at index ${i}`);
    }
  }
};