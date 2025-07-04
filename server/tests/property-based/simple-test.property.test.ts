/**
 * Simple Property Test
 * Basic test to verify property testing is working
 */

import fc from 'fast-check';

describe('Simple Property Tests', () => {
  it('should test basic number properties', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        // Property: Adding zero to any number returns the same number
        return n + 0 === n;
      }),
      { numRuns: 100 },
    );
  });

  it('should test string properties', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        // Property: String length is non-negative
        return s.length >= 0;
      }),
      { numRuns: 50 },
    );
  });

  it('should test array properties', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        // Property: Array concat with empty array returns same array
        const result = arr.concat([]);
        return result.length === arr.length;
      }),
      { numRuns: 50 },
    );
  });
});
