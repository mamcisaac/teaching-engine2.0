import { describe, it, expect } from '@jest/globals';

describe('Simple Test', () => {
  it('should pass', () => {
    console.log('Running simple test...');
    expect(1 + 1).toBe(2);
  });
});
