import { test, expect } from '@jest/globals';

test('simple test', () => {
  console.log('Running simple Jest test');
  expect(1 + 1).toBe(2);
});
