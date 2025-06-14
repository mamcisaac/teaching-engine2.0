// Minimal test runner to bypass Jest configuration issues

console.log('Starting minimal test runner...');

// Simple test function
function test(name: string, fn: () => void) {
  console.log(`\nRunning test: ${name}`);
  try {
    fn();
    console.log('✅ Test passed');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Assertion function
function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
      }
    },
    toContain(expected: unknown) {
      if (Array.isArray(actual) || typeof actual === 'string') {
        if (!actual.includes(expected as string)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
        }
      } else {
        throw new Error('toContain can only be used with arrays or strings');
      }
    },
  };
}

// Run tests
console.log('Running minimal tests...');

test('1 + 1 should equal 2', () => {
  const result = 1 + 1;
  expect(result).toBe(2);
});

test('Array should contain item', () => {
  const arr = [1, 2, 3];
  expect(arr).toContain(2);
});

console.log('\nAll tests passed! 🎉');
process.exit(0);
