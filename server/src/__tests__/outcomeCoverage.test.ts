import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';

// Mock the prisma client first
const mockQueryRaw = jest.fn();

// Mock the module before any imports
jest.unstable_mockModule('../prisma', () => ({
  prisma: {
    $queryRaw: mockQueryRaw,
  },
}));

describe('Outcome Coverage', () => {
  let getCoverageSummary: (
    coverage: Array<{
      outcomeId: string;
      status: 'covered' | 'partial' | 'uncovered';
      linked: number;
      completed: number;
    }>,
  ) => { total: number; covered: number; partial: number; uncovered: number };
  let getOutcomeCoverage: (
    outcomeId: string,
  ) => Promise<{
    outcomeId: string;
    status: 'covered' | 'partial' | 'uncovered';
    linked: number;
    completed: number;
  }>;

  beforeAll(async () => {
    // Import after mocking
    const module = await import('../utils/outcomeCoverage');
    getCoverageSummary = module.getCoverageSummary;
    getOutcomeCoverage = module.getOutcomeCoverage;
  });
  describe('getCoverageSummary', () => {
    it('should return correct summary for coverage data', () => {
      const coverage = [
        { outcomeId: '1', status: 'covered' as const, linked: 1, completed: 1 },
        { outcomeId: '2', status: 'uncovered' as const, linked: 0, completed: 0 },
        { outcomeId: '3', status: 'partial' as const, linked: 1, completed: 0 },
      ];

      const summary = getCoverageSummary(coverage);

      expect(summary).toEqual({
        total: 3,
        covered: 1,
        partial: 1,
        uncovered: 1,
      });
    });
  });

  describe('getOutcomeCoverage', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return uncovered status for outcome with no activities', async () => {
      // Mock the database query to return no activities
      mockQueryRaw.mockImplementation((strings, ...values) => {
        // Verify the SQL template string and parameters
        expect(strings[0]).toContain('SELECT a.id, a."completedAt"');
        expect(strings[0]).toContain('FROM "Activity" a');
        expect(strings[0]).toContain('JOIN "ActivityOutcome" ao ON a.id = ao."activityId"');
        expect(strings[0]).toContain('WHERE ao."outcomeId" = ');
        expect(values[0]).toBe('TEST-1');
        return Promise.resolve([]);
      });

      const coverage = await getOutcomeCoverage('TEST-1');

      expect(coverage).toEqual({
        outcomeId: 'TEST-1',
        status: 'uncovered',
        linked: 0,
        completed: 0,
      });

      // Verify the query was called
      expect(mockQueryRaw).toHaveBeenCalled();
    });
  });
});
