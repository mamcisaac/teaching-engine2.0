import { describe, it, expect, jest, beforeEach, beforeAll } from '@jest/globals';

// Mock the prisma client first
const mockActivityFindMany = jest.fn();
const mockOutcomeFindMany = jest.fn();
const mockMilestoneOutcomeFindMany = jest.fn();

// Mock the module before any imports
jest.unstable_mockModule('../prisma', () => ({
  prisma: {
    activity: {
      findMany: mockActivityFindMany,
    },
    outcome: {
      findMany: mockOutcomeFindMany,
    },
    milestoneOutcome: {
      findMany: mockMilestoneOutcomeFindMany,
    },
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
  let getOutcomeCoverage: (outcomeId: string) => Promise<{
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
      mockActivityFindMany.mockResolvedValue([]);

      const coverage = await getOutcomeCoverage('TEST-1');

      expect(coverage).toEqual({
        outcomeId: 'TEST-1',
        status: 'uncovered',
        linked: 0,
        completed: 0,
      });

      // Verify the query was called with correct parameters
      expect(mockActivityFindMany).toHaveBeenCalledWith({
        where: {
          outcomes: {
            some: {
              outcomeId: 'TEST-1',
            },
          },
        },
        select: {
          id: true,
          completedAt: true,
        },
      });
    });

    it('should return covered status for outcome with all activities completed', async () => {
      // Mock activities with all completed
      mockActivityFindMany.mockResolvedValue([
        { id: 1, completedAt: new Date('2024-01-01') },
        { id: 2, completedAt: new Date('2024-01-02') },
      ]);

      const coverage = await getOutcomeCoverage('TEST-2');

      expect(coverage).toEqual({
        outcomeId: 'TEST-2',
        status: 'covered',
        linked: 2,
        completed: 2,
      });
    });

    it('should return partial status for outcome with some activities completed', async () => {
      // Mock activities with some completed
      mockActivityFindMany.mockResolvedValue([
        { id: 1, completedAt: new Date('2024-01-01') },
        { id: 2, completedAt: null },
        { id: 3, completedAt: null },
      ]);

      const coverage = await getOutcomeCoverage('TEST-3');

      expect(coverage).toEqual({
        outcomeId: 'TEST-3',
        status: 'partial',
        linked: 3,
        completed: 1,
      });
    });
  });

  describe('getOutcomesCoverage', () => {
    let getOutcomesCoverage: (options?: {
      subject?: string;
      grade?: number;
      milestoneId?: number;
    }) => Promise<
      Array<{
        outcomeId: string;
        status: 'covered' | 'partial' | 'uncovered';
        linked: number;
        completed: number;
      }>
    >;

    beforeAll(async () => {
      const module = await import('../utils/outcomeCoverage');
      getOutcomesCoverage = module.getOutcomesCoverage;
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should get coverage for outcomes filtered by subject and grade', async () => {
      // Mock outcomes
      mockOutcomeFindMany.mockResolvedValue([{ id: 'MATH-1' }, { id: 'MATH-2' }]);

      // Mock activities for each outcome
      mockActivityFindMany
        .mockResolvedValueOnce([{ id: 1, completedAt: new Date() }]) // MATH-1: covered
        .mockResolvedValueOnce([]); // MATH-2: uncovered

      const coverage = await getOutcomesCoverage({ subject: 'Math', grade: 5 });

      expect(mockOutcomeFindMany).toHaveBeenCalledWith({
        where: {
          subject: 'Math',
          grade: 5,
        },
        select: { id: true },
      });

      expect(coverage).toHaveLength(2);
      expect(coverage[0]).toEqual({
        outcomeId: 'MATH-1',
        status: 'covered',
        linked: 1,
        completed: 1,
      });
      expect(coverage[1]).toEqual({
        outcomeId: 'MATH-2',
        status: 'uncovered',
        linked: 0,
        completed: 0,
      });
    });

    it('should get coverage for outcomes filtered by milestone', async () => {
      // Mock milestone outcomes
      mockMilestoneOutcomeFindMany.mockResolvedValue([
        { outcomeId: 'OUTCOME-1' },
        { outcomeId: 'OUTCOME-2' },
      ]);

      // Mock outcomes
      mockOutcomeFindMany.mockResolvedValue([{ id: 'OUTCOME-1' }, { id: 'OUTCOME-2' }]);

      // Mock activities
      mockActivityFindMany
        .mockResolvedValueOnce([{ id: 1, completedAt: null }]) // OUTCOME-1: uncovered
        .mockResolvedValueOnce([
          { id: 2, completedAt: new Date() },
          { id: 3, completedAt: null },
        ]); // OUTCOME-2: partial

      const coverage = await getOutcomesCoverage({ milestoneId: 1 });

      expect(mockMilestoneOutcomeFindMany).toHaveBeenCalledWith({
        where: { milestoneId: 1 },
        select: { outcomeId: true },
      });

      expect(mockOutcomeFindMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['OUTCOME-1', 'OUTCOME-2'],
          },
        },
        select: { id: true },
      });

      expect(coverage).toHaveLength(2);
    });
  });
});
