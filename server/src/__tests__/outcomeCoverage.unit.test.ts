import { describe, it, expect } from '@jest/globals';
import { getCoverageSummary, type CoverageStatus } from '../utils/outcomeCoverageSimple.mjs';

// Helper to create typed test data
const createCoverage = (id: string, status: CoverageStatus, linked: number, completed: number) => ({
  outcomeId: id,
  status,
  linked,
  completed,
});

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
      createCoverage('1', 'covered', 2, 2),
      createCoverage('2', 'partial', 3, 1),
      createCoverage('3', 'uncovered', 1, 0),
      createCoverage('4', 'covered', 2, 2),
    ];

    const result = getCoverageSummary(coverages);

    expect(result).toEqual({
      total: 4,
      covered: 2,
      partial: 1,
      uncovered: 1,
    });
  });

  it('should handle all covered outcomes', () => {
    const coverages = [createCoverage('1', 'covered', 2, 2), createCoverage('2', 'covered', 3, 3)];

    const result = getCoverageSummary(coverages);

    expect(result).toEqual({
      total: 2,
      covered: 2,
      partial: 0,
      uncovered: 0,
    });
  });

  it('should handle all uncovered outcomes', () => {
    const coverages = [
      createCoverage('1', 'uncovered', 1, 0),
      createCoverage('2', 'uncovered', 2, 0),
    ];

    const result = getCoverageSummary(coverages);

    expect(result).toEqual({
      total: 2,
      covered: 0,
      partial: 0,
      uncovered: 2,
    });
  });

  it('should handle partial coverage correctly', () => {
    const coverages = [createCoverage('1', 'partial', 3, 1), createCoverage('2', 'partial', 4, 2)];

    const result = getCoverageSummary(coverages);

    expect(result).toEqual({
      total: 2,
      covered: 0,
      partial: 2,
      uncovered: 0,
    });
  });
});
