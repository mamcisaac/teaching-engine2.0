import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';

// Mock the prisma client first
const mockQueryRaw = jest.fn();

// Mock the module before any imports
jest.unstable_mockModule('../prisma', () => ({
  prisma: {
    $queryRaw: mockQueryRaw,
  },
}));

// Import functions from simple modules
import { getOutcomeCoverage as getOutcomeCoverageSimple } from '../utils/outcomeCoverageSimple.mjs';
import { getCoverageSummary } from '../utils/outcomeCoverageSimple.mjs';

describe('Simple Outcome Coverage', () => {
  let getOutcomeCoverage: (outcomeId: string) => Promise<{
    outcomeId: string;
    status: string;
    linked: number;
    completed: number;
  }>;

  beforeAll(async () => {
    // Import after mocking
    const module = await import('../utils/outcomeCoverage');
    getOutcomeCoverage = module.getOutcomeCoverage;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation
    mockQueryRaw.mockImplementation(() => Promise.resolve([]));
  });

  describe('getOutcomeCoverage', () => {
    it('should return uncovered status for outcome with no activities', async () => {
      console.log('Running simple getOutcomeCoverage test');

      // First test the simple implementation
      console.log('getOutcomeCoverage called with: TEST-1');
      const simpleResult = getOutcomeCoverageSimple('TEST-1');
      expect(simpleResult).toEqual({
        outcomeId: 'TEST-1',
        status: 'uncovered',
        linked: 0,
        completed: 0,
      });

      // Then test the actual implementation
      mockQueryRaw.mockImplementation(() => Promise.resolve([]));
      const result = await getOutcomeCoverage('TEST-1');

      expect(result).toEqual({
        outcomeId: 'TEST-1',
        status: 'uncovered',
        linked: 0,
        completed: 0,
      });
    });
  });

  describe('getCoverageSummary', () => {
    it('should return correct summary for coverage data', () => {
      console.log('Running simple getCoverageSummary test');

      const coverageData = [
        { outcomeId: '1', status: 'covered', linked: 1, completed: 1 },
        { outcomeId: '2', status: 'uncovered', linked: 0, completed: 0 },
        { outcomeId: '3', status: 'partial', linked: 1, completed: 0 },
      ];

      console.log(`getCoverageSummary called with: ${JSON.stringify(coverageData, null, 2)}`);
      const summary = getCoverageSummary(coverageData);

      expect(summary).toEqual({
        total: 3,
        covered: 1,
        partial: 1,
        uncovered: 1,
      });
    });
  });
});
