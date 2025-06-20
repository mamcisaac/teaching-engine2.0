import { describe, it, expect, beforeEach } from '@jest/globals';
import { prisma } from '../../../prisma';
import { 
  calculateWeeklyPlanDiagnostics, 
  getPlanningQualityTrend 
} from '../weeklyPlanDiagnostics';

// Mock Prisma
jest.mock('../../../prisma', () => ({
  prisma: {
    lessonPlan: {
      findFirst: jest.fn(),
    },
    outcome: {
      findMany: jest.fn(),
    },
    subject: {
      findMany: jest.fn(),
    },
  },
}));

describe('weeklyPlanDiagnostics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateWeeklyPlanDiagnostics', () => {
    it('returns zero scores for empty weekly plan', async () => {
      (prisma.lessonPlan.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        weekStart: new Date('2024-01-22'),
        schedule: [],
      });

      (prisma.outcome.findMany as jest.Mock).mockResolvedValue([
        { id: 'OUT1', code: 'LA.1.1' },
        { id: 'OUT2', code: 'MA.1.1' },
      ]);

      (prisma.subject.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Language Arts' },
        { id: 2, name: 'Mathematics' },
      ]);

      const result = await calculateWeeklyPlanDiagnostics({
        weekStart: new Date('2024-01-22'),
        userId: 1,
      });

      expect(result.metrics.overallScore).toBe(0);
      expect(result.warnings).toContain('Empty weekly plan detected');
      expect(result.suggestions).toContain(
        'No activities scheduled for this week. Start by adding activities to your weekly plan.'
      );
    });

    it('calculates metrics for a well-balanced plan', async () => {
      const mockLessonPlan = {
        id: 1,
        weekStart: new Date('2024-01-22'),
        schedule: [
          {
            id: 1,
            day: 1,
            activity: {
              id: 1,
              title: 'Reading Comprehension',
              activityType: 'LESSON',
              durationMins: 45,
              tags: ['interactive', 'group-work'],
              privateNote: 'Differentiated groups',
              milestone: {
                id: 1,
                subject: { id: 1, name: 'Language Arts' },
                outcomes: [{ outcomeId: 'OUT1', outcome: { id: 'OUT1', code: 'LA.1.1' } }],
              },
              outcomes: [{ outcomeId: 'OUT1', outcome: { id: 'OUT1', code: 'LA.1.1' } }],
              thematicUnits: [{ thematicUnitId: 1 }],
              cognatePairs: [{ id: 1 }],
            },
          },
          {
            id: 2,
            day: 2,
            activity: {
              id: 2,
              title: 'Math Assessment',
              activityType: 'ASSESSMENT',
              durationMins: 30,
              tags: ['assessment'],
              milestone: {
                id: 2,
                subject: { id: 2, name: 'Mathematics' },
                outcomes: [{ outcomeId: 'OUT2', outcome: { id: 'OUT2', code: 'MA.1.1' } }],
              },
              outcomes: [{ outcomeId: 'OUT2', outcome: { id: 'OUT2', code: 'MA.1.1' } }],
              thematicUnits: [{ thematicUnitId: 1 }],
              cognatePairs: [],
            },
          },
          {
            id: 3,
            day: 3,
            activity: {
              id: 3,
              title: 'Science Experiment',
              activityType: 'LESSON',
              durationMins: 60,
              tags: ['hands-on', 'collaborative'],
              privateNote: 'Individual observations',
              milestone: {
                id: 3,
                subject: { id: 3, name: 'Science' },
                outcomes: [{ outcomeId: 'OUT3', outcome: { id: 'OUT3', code: 'SC.1.1' } }],
              },
              outcomes: [],
              thematicUnits: [],
              cognatePairs: [],
            },
          },
        ],
      };

      (prisma.lessonPlan.findFirst as any).mockResolvedValue(mockLessonPlan);

      (prisma.outcome.findMany as any).mockResolvedValue([
        { id: 'OUT1', code: 'LA.1.1' },
        { id: 'OUT2', code: 'MA.1.1' },
        { id: 'OUT3', code: 'SC.1.1' },
        { id: 'OUT4', code: 'SS.1.1' },
      ]);

      (prisma.subject.findMany as any).mockResolvedValue([
        { id: 1, name: 'Language Arts' },
        { id: 2, name: 'Mathematics' },
        { id: 3, name: 'Science' },
        { id: 4, name: 'Social Studies' },
      ]);

      const result = await calculateWeeklyPlanDiagnostics({
        weekStart: new Date('2024-01-22'),
        userId: 1,
      });

      // Check metrics are calculated
      expect(result.metrics.outcomesCoverage).toBe(75); // 3 out of 4 outcomes covered
      expect(result.metrics.assessmentBalance).toBeGreaterThan(0); // Has assessment
      expect(result.metrics.engagementVariety).toBeGreaterThan(0); // Has variety in tags
      expect(result.metrics.differentiationScore).toBe(100); // Has both individual and group
      expect(result.metrics.vocabularyIntegration).toBeGreaterThan(0); // Has cognate pairs

      // Check feedback
      expect(result.strengths.length).toBeGreaterThan(0);
      expect(result.missingDomains).toContain('Social Studies');
      expect(result.uncoveredOutcomes).toContain('SS.1.1');
    });

    it('identifies overused domains', async () => {
      const mockLessonPlan = {
        id: 1,
        weekStart: new Date('2024-01-22'),
        schedule: [
          {
            id: 1,
            day: 1,
            activity: {
              id: 1,
              title: 'Math Activity 1',
              activityType: 'LESSON',
              durationMins: 45,
              milestone: {
                id: 1,
                subject: { id: 1, name: 'Mathematics' },
                outcomes: [],
              },
              outcomes: [],
              thematicUnits: [],
              cognatePairs: [],
            },
          },
          {
            id: 2,
            day: 2,
            activity: {
              id: 2,
              title: 'Math Activity 2',
              activityType: 'LESSON',
              durationMins: 45,
              milestone: {
                id: 1,
                subject: { id: 1, name: 'Mathematics' },
                outcomes: [],
              },
              outcomes: [],
              thematicUnits: [],
              cognatePairs: [],
            },
          },
          {
            id: 3,
            day: 3,
            activity: {
              id: 3,
              title: 'Math Activity 3',
              activityType: 'LESSON',
              durationMins: 45,
              milestone: {
                id: 1,
                subject: { id: 1, name: 'Mathematics' },
                outcomes: [],
              },
              outcomes: [],
              thematicUnits: [],
              cognatePairs: [],
            },
          },
          {
            id: 4,
            day: 4,
            activity: {
              id: 4,
              title: 'Language Arts',
              activityType: 'LESSON',
              durationMins: 30,
              milestone: {
                id: 2,
                subject: { id: 2, name: 'Language Arts' },
                outcomes: [],
              },
              outcomes: [],
              thematicUnits: [],
              cognatePairs: [],
            },
          },
        ],
      };

      (prisma.lessonPlan.findFirst as any).mockResolvedValue(mockLessonPlan);
      (prisma.outcome.findMany as any).mockResolvedValue([]);
      (prisma.subject.findMany as any).mockResolvedValue([
        { id: 1, name: 'Mathematics' },
        { id: 2, name: 'Language Arts' },
      ]);

      const result = await calculateWeeklyPlanDiagnostics({
        weekStart: new Date('2024-01-22'),
        userId: 1,
      });

      expect(result.overusedDomains).toContain('Mathematics');
      expect(result.warnings).toContain('Overemphasis on: Mathematics');
    });

    it('handles no lesson plan gracefully', async () => {
      (prisma.lessonPlan.findFirst as any).mockResolvedValue(null);

      const result = await calculateWeeklyPlanDiagnostics({
        weekStart: new Date('2024-01-22'),
        userId: 1,
      });

      expect(result.metrics.overallScore).toBe(0);
      expect(result.suggestions).toContain(
        'No activities scheduled for this week. Start by adding activities to your weekly plan.'
      );
    });
  });

  describe('getPlanningQualityTrend', () => {
    it('returns trend data for specified weeks', async () => {
      // Mock diagnostics for each week
      const mockDiagnostics = {
        metrics: {
          outcomesCoverage: 75,
          assessmentBalance: 80,
          engagementVariety: 70,
          differentiationScore: 85,
          timeEfficiency: 90,
          domainBalance: 75,
          themeConsistency: 80,
          vocabularyIntegration: 65,
          overallScore: 77.5,
        },
        suggestions: [],
        warnings: [],
        strengths: [],
        missingDomains: [],
        overusedDomains: [],
        uncoveredOutcomes: [],
      };

      // Mock the lesson plan for each week
      (prisma.lessonPlan.findFirst as any).mockResolvedValue({
        id: 1,
        weekStart: new Date(),
        schedule: [{
          id: 1,
          day: 1,
          activity: {
            id: 1,
            title: 'Test Activity',
            activityType: 'LESSON',
            milestone: { subject: { name: 'Math' }, outcomes: [] },
            outcomes: [],
            thematicUnits: [],
            cognatePairs: [],
          },
        }],
      });

      (prisma.outcome.findMany as any).mockResolvedValue([]);
      (prisma.subject.findMany as any).mockResolvedValue([]);

      const trend = await getPlanningQualityTrend(1, 4);

      expect(trend).toHaveLength(4);
      expect(trend[0]).toHaveProperty('week');
      expect(trend[0]).toHaveProperty('score');
      expect(trend[0].score).toBe(78); // Rounded from 77.5
    });

    it('handles calculation errors gracefully', async () => {
      // Make one week fail
      (prisma.lessonPlan.findFirst as any)
        .mockRejectedValueOnce(new Error('DB Error'))
        .mockResolvedValue({ id: 1, weekStart: new Date(), schedule: [] });

      (prisma.outcome.findMany as any).mockResolvedValue([]);
      (prisma.subject.findMany as any).mockResolvedValue([]);

      const trend = await getPlanningQualityTrend(1, 2);

      expect(trend).toHaveLength(2);
      expect(trend[0].score).toBe(0); // Failed week gets 0
      expect(trend[1].score).toBe(0); // Empty plan also gets 0
    });
  });
});