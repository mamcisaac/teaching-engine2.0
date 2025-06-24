import { describe, it, expect } from '@jest/globals';
import {
  getCoverageSummary,
  type OutcomeCoverage,
  type CoverageStatus,
} from '../utils/outcomeCoverageSimple.mjs';

describe('getCoverageSummary', () => {
  it('should return zero counts for empty array', () => {
    const result = getCoverageSummary([]);
    expect(result).toEqual({
      total: 0,
      covered: 0,
      partial: 0,
      uncovered: 0,
    });
  });

  it('should correctly count different status types', () => {
    const coverage: OutcomeCoverage[] = [
      { outcomeId: '1', status: 'covered' as CoverageStatus, linked: 1, completed: 1 },
      { outcomeId: '2', status: 'partial' as CoverageStatus, linked: 1, completed: 0 },
      { outcomeId: '3', status: 'uncovered' as CoverageStatus, linked: 0, completed: 0 },
      { outcomeId: '4', status: 'covered' as CoverageStatus, linked: 1, completed: 1 },
    ];

    const result = getCoverageSummary(coverage);
    expect(result).toEqual({
      total: 4,
      covered: 2,
      partial: 1,
      uncovered: 1,
    });
  });

  it('should handle invalid items gracefully', () => {
    // @ts-expect-error - Testing invalid input
    const result = getCoverageSummary([null, undefined, {}, { status: 'invalid' }]);
    expect(result).toEqual({
      total: 4,
      covered: 0,
      partial: 0,
      uncovered: 4,
    });
  });
});
