import { jest } from '@jest/globals';
import { getPlannerSuggestions } from '../services/plannerSuggestions';

// Mock dependencies
jest.mock('../prisma', () => ({
  prisma: {
    milestone: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('./outcomeCoverage', () => ({
  getOutcomesCoverage: jest.fn(),
}));

jest.mock('date-fns', () => ({
  addDays: jest.fn((date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }),
}));

const mockPrisma = jest.mocked(await import('../prisma')).prisma;
const mockGetOutcomesCoverage = jest.mocked(await import('./outcomeCoverage')).getOutcomesCoverage;

describe('PlannerSuggestions', () => {
  const weekStart = new Date('2024-01-01'); // Monday
  const weekEnd = new Date('2024-01-07'); // Sunday
  const userId = 1;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console.error to prevent test noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getPlannerSuggestions', () => {
    const mockMilestones = [
      {
        id: 1,
        title: 'Math Milestone 1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-15'),
        subject: { name: 'Mathematics' },
        activities: [
          {
            id: 1,
            title: 'Addition Practice',
            completedAt: null,
            dailyPlanItems: [],
            outcomes: [
              {
                outcome: { id: 'outcome-1' },
              },
              {
                outcome: { id: 'outcome-2' },
              },
            ],
          },
          {
            id: 2,
            title: 'Subtraction Practice',
            completedAt: null,
            dailyPlanItems: [],
            outcomes: [
              {
                outcome: { id: 'outcome-3' },
              },
            ],
          },
        ],
      },
      {
        id: 2,
        title: 'Science Milestone 1',
        startDate: new Date('2024-01-03'),
        endDate: new Date('2024-01-10'),
        subject: { name: 'Science' },
        activities: [
          {
            id: 3,
            title: 'Plant Growth Experiment',
            completedAt: null,
            dailyPlanItems: [],
            outcomes: [],
          },
        ],
      },
      {
        id: 3,
        title: 'Reading Milestone',
        startDate: new Date('2024-01-05'),
        endDate: new Date('2024-01-12'),
        subject: null,
        activities: [
          {
            id: 4,
            title: 'Reading Comprehension',
            completedAt: null,
            dailyPlanItems: [],
            outcomes: [
              {
                outcome: { id: 'outcome-4' },
              },
            ],
          },
        ],
      },
    ];

    const mockOutcomesCoverage = [
      { outcomeId: 'outcome-1', status: 'uncovered' },
      { outcomeId: 'outcome-2', status: 'partial' },
      { outcomeId: 'outcome-3', status: 'covered' },
      { outcomeId: 'outcome-4', status: 'covered' },
    ];

    beforeEach(() => {
      mockPrisma.milestone.findMany.mockResolvedValue(mockMilestones as unknown);
      mockGetOutcomesCoverage.mockResolvedValue(mockOutcomesCoverage as unknown);
    });

    it('should return suggestions sorted by coverage status', async () => {
      const suggestions = await getPlannerSuggestions(weekStart, userId);

      expect(suggestions).toHaveLength(4);

      // First suggestion should cover uncovered outcomes
      expect(suggestions[0]).toEqual({
        activityId: 1,
        title: 'Addition Practice',
        milestoneTitle: 'Math Milestone 1',
        subject: 'Mathematics',
        linkedOutcomes: ['outcome-1', 'outcome-2'],
        coverageStatus: 'covers_uncovered',
      });

      // Suggestions covering uncovered outcomes should come first
      const uncoveredSuggestions = suggestions.filter(
        (s) => s.coverageStatus === 'covers_uncovered',
      );
      expect(uncoveredSuggestions).toHaveLength(1);
    });

    it('should handle activities with no outcomes', async () => {
      const suggestions = await getPlannerSuggestions(weekStart, userId);

      const generalSuggestion = suggestions.find((s) => s.activityId === 3);
      expect(generalSuggestion).toEqual({
        activityId: 3,
        title: 'Plant Growth Experiment',
        milestoneTitle: 'Science Milestone 1',
        subject: 'Science',
        linkedOutcomes: [],
        coverageStatus: 'general',
      });
    });

    it('should handle activities with already covered outcomes', async () => {
      const suggestions = await getPlannerSuggestions(weekStart, userId);

      const alreadyCoveredSuggestion = suggestions.find((s) => s.activityId === 4);
      expect(alreadyCoveredSuggestion).toEqual({
        activityId: 4,
        title: 'Reading Comprehension',
        milestoneTitle: 'Reading Milestone',
        subject: 'Uncategorized',
        linkedOutcomes: ['outcome-4'],
        coverageStatus: 'already_covered',
      });
    });

    it('should handle milestones without subjects', async () => {
      const suggestions = await getPlannerSuggestions(weekStart, userId);

      const uncategorizedSuggestion = suggestions.find((s) => s.subject === 'Uncategorized');
      expect(uncategorizedSuggestion).toBeTruthy();
      expect(uncategorizedSuggestion?.subject).toBe('Uncategorized');
    });

    it('should query milestones with correct date range', async () => {
      await getPlannerSuggestions(weekStart, userId);

      expect(mockPrisma.milestone.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          OR: [
            {
              startDate: { lte: weekEnd },
              endDate: { gte: weekStart },
            },
            {
              startDate: {
                gte: weekStart,
                lte: weekEnd,
              },
            },
          ],
        },
        include: {
          subject: true,
          activities: {
            where: {
              completedAt: null,
              dailyPlanItems: { none: {} },
            },
            include: {
              outcomes: {
                include: {
                  outcome: true,
                },
              },
            },
          },
        },
      });
    });

    it('should work without userId', async () => {
      await getPlannerSuggestions(weekStart);

      expect(mockPrisma.milestone.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: undefined,
          }),
        }),
      );
    });

    it('should sort suggestions by number of outcomes when coverage status is equal', async () => {
      // Mock data where multiple activities have same coverage status
      const equalCoverageMilestones = [
        {
          id: 1,
          title: 'Test Milestone',
          startDate: weekStart,
          endDate: weekEnd,
          subject: { name: 'Test' },
          activities: [
            {
              id: 1,
              title: 'Activity with 3 outcomes',
              completedAt: null,
              dailyPlanItems: [],
              outcomes: [
                { outcome: { id: 'covered-1' } },
                { outcome: { id: 'covered-2' } },
                { outcome: { id: 'covered-3' } },
              ],
            },
            {
              id: 2,
              title: 'Activity with 1 outcome',
              completedAt: null,
              dailyPlanItems: [],
              outcomes: [{ outcome: { id: 'covered-4' } }],
            },
          ],
        },
      ];

      const allCoveredOutcomes = [
        { outcomeId: 'covered-1', status: 'covered' },
        { outcomeId: 'covered-2', status: 'covered' },
        { outcomeId: 'covered-3', status: 'covered' },
        { outcomeId: 'covered-4', status: 'covered' },
      ];

      mockPrisma.milestone.findMany.mockResolvedValue(equalCoverageMilestones as unknown);
      mockGetOutcomesCoverage.mockResolvedValue(allCoveredOutcomes as unknown);

      const suggestions = await getPlannerSuggestions(weekStart, userId);

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].linkedOutcomes).toHaveLength(3);
      expect(suggestions[1].linkedOutcomes).toHaveLength(1);
    });

    it('should handle empty milestones', async () => {
      mockPrisma.milestone.findMany.mockResolvedValue([]);

      const suggestions = await getPlannerSuggestions(weekStart, userId);

      expect(suggestions).toEqual([]);
    });

    it('should handle milestones with no activities', async () => {
      const milestonesWithNoActivities = [
        {
          id: 1,
          title: 'Empty Milestone',
          startDate: weekStart,
          endDate: weekEnd,
          subject: { name: 'Test' },
          activities: [],
        },
      ];

      mockPrisma.milestone.findMany.mockResolvedValue(milestonesWithNoActivities as unknown);

      const suggestions = await getPlannerSuggestions(weekStart, userId);

      expect(suggestions).toEqual([]);
    });

    it('should handle error in getOutcomesCoverage', async () => {
      mockGetOutcomesCoverage.mockRejectedValue(new Error('Coverage error'));

      await expect(getPlannerSuggestions(weekStart, userId)).rejects.toThrow(
        'Failed to generate planner suggestions',
      );

      expect(console.error).toHaveBeenCalledWith(
        'Error generating planner suggestions:',
        expect.any(Error),
      );
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.milestone.findMany.mockRejectedValue(new Error('Database error'));

      await expect(getPlannerSuggestions(weekStart, userId)).rejects.toThrow(
        'Failed to generate planner suggestions',
      );

      expect(console.error).toHaveBeenCalledWith(
        'Error generating planner suggestions:',
        expect.any(Error),
      );
    });

    it('should handle malformed outcome coverage data', async () => {
      const malformedCoverage = [
        { outcomeId: 'outcome-1' }, // missing status
        { status: 'uncovered' }, // missing outcomeId
        null,
        undefined,
      ];

      mockGetOutcomesCoverage.mockResolvedValue(malformedCoverage as unknown);

      const suggestions = await getPlannerSuggestions(weekStart, userId);

      // Should still work, just won't identify uncovered outcomes correctly
      expect(suggestions).toHaveLength(4);
    });

    it('should correctly identify mixed coverage scenarios', async () => {
      // Activity with both covered and uncovered outcomes
      const mixedMilestone = [
        {
          id: 1,
          title: 'Mixed Milestone',
          startDate: weekStart,
          endDate: weekEnd,
          subject: { name: 'Mixed' },
          activities: [
            {
              id: 1,
              title: 'Mixed Activity',
              completedAt: null,
              dailyPlanItems: [],
              outcomes: [
                { outcome: { id: 'uncovered-outcome' } },
                { outcome: { id: 'covered-outcome' } },
              ],
            },
          ],
        },
      ];

      const mixedCoverage = [
        { outcomeId: 'uncovered-outcome', status: 'uncovered' },
        { outcomeId: 'covered-outcome', status: 'covered' },
      ];

      mockPrisma.milestone.findMany.mockResolvedValue(mixedMilestone as unknown);
      mockGetOutcomesCoverage.mockResolvedValue(mixedCoverage as unknown);

      const suggestions = await getPlannerSuggestions(weekStart, userId);

      expect(suggestions[0].coverageStatus).toBe('covers_uncovered');
    });
  });

  describe('edge cases', () => {
    it('should handle week boundary dates correctly', async () => {
      const weekStartBoundary = new Date('2024-01-01T00:00:00.000Z');

      await getPlannerSuggestions(weekStartBoundary, userId);

      // Verify that addDays was called to calculate week end
      const mockAddDays = jest.mocked(await import('date-fns')).addDays;
      expect(mockAddDays).toHaveBeenCalledWith(weekStartBoundary, 6);
    });

    it('should handle timezone considerations', async () => {
      const weekStartWithTimezone = new Date('2024-01-01T23:59:59.999Z');

      await getPlannerSuggestions(weekStartWithTimezone, userId);

      expect(mockPrisma.milestone.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                startDate: { lte: expect.any(Date) },
                endDate: { gte: weekStartWithTimezone },
              }),
            ]),
          }),
        }),
      );
    });
  });
});
