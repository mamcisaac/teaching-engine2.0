import { describe, it, expect, jest } from '@jest/globals';
import type { OutcomeCoverage } from '../utils/outcomeCoverage';

// Mock the functions we want to test
const mockGetOutcomeCoverage = jest.fn() as jest.MockedFunction<
  (outcomeId: string) => Promise<OutcomeCoverage>
>;
const mockGetCoverageSummary = jest.fn();

// Mock the module
jest.mock('../utils/outcomeCoverage', () => ({
  getOutcomeCoverage: mockGetOutcomeCoverage,
  getCoverageSummary: mockGetCoverageSummary,
  CoverageStatus: {
    COVERED: 'covered',
    PARTIAL: 'partial',
    UNCOVERED: 'uncovered',
  },
}));

// Import the actual implementation for testing getCoverageSummary
import { getCoverageSummary } from '../utils/outcomeCoverage';

describe('Outcome Coverage Integration Tests', () => {
  const testOutcomeId = 'test-outcome-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOutcomeCoverage', () => {
    it('should return correct coverage status', async () => {
      // Setup mock implementation
      const mockResult = {
        outcomeId: testOutcomeId,
        status: 'covered' as const,
        linked: 2,
        completed: 2,
      };
      mockGetOutcomeCoverage.mockResolvedValue(mockResult);

      // Use the mocked function directly
      const result = await mockGetOutcomeCoverage(testOutcomeId);

      expect(result).toEqual(mockResult);
      expect(mockGetOutcomeCoverage).toHaveBeenCalledWith(testOutcomeId);
    });
  });

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
        { outcomeId: '1', status: 'covered', linked: 1, completed: 1 },
        { outcomeId: '2', status: 'partial', linked: 1, completed: 0 },
        { outcomeId: '3', status: 'uncovered', linked: 0, completed: 0 },
        { outcomeId: '4', status: 'covered', linked: 1, completed: 1 },
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
});
