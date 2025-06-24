import { describe, it, expect } from '@jest/globals';
import { getCoverageSummary } from '../utils/outcomeCoverageSimple.mjs';

describe('Coverage Utilities', () => {
  describe('getCoverageSummary', () => {
    it('should return correct summary for empty array', () => {
      const result = getCoverageSummary([]);
      expect(result).toEqual({
        total: 0,
        covered: 0,
        partial: 0,
        uncovered: 0,
      });
    });

    it('should calculate coverage correctly for mixed statuses', () => {
      const coverages = [
        { outcomeId: '1', status: 'covered' as const, linked: 2, completed: 2 },
        { outcomeId: '2', status: 'partial' as const, linked: 3, completed: 1 },
        { outcomeId: '3', status: 'uncovered' as const, linked: 1, completed: 0 },
        { outcomeId: '4', status: 'covered' as const, linked: 2, completed: 2 },
      ];

      const result = getCoverageSummary(coverages);

      expect(result).toEqual({
        total: 4,
        covered: 2,
        partial: 1,
        uncovered: 1,
      });
    });
  });
});
