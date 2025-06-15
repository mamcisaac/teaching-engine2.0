import { getCoverageSummary, getOutcomeCoverage } from '../utils/outcomeCoverage';

// Mock the prisma client
const mockQueryRaw = jest.fn();

jest.mock('../prisma', () => ({
  prisma: {
    $queryRaw: mockQueryRaw,
  },
}));

// Remove unused import
// import { prisma } from '../prisma';

describe('Outcome Coverage', () => {
  describe('getCoverageSummary', () => {
    it('should return correct summary for coverage data', () => {
      console.log('Running getCoverageSummary test');

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
      console.log('Running getOutcomeCoverage test');

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
