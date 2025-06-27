import { describe, test, expect, beforeEach, jest } from '@jest/globals';

import { ReportGeneratorService } from '../../src/services/reportGeneratorService';

// Create a mock prisma client for this test
const mockPrismaClient = {
  curriculumExpectation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  longRangePlan: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  unitPlan: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  eTFOLessonPlan: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  daybookEntry: {
    findMany: jest.fn(),
  },
};

// Create a new instance for testing
let reportGeneratorService: ReportGeneratorService;

describe('Report Generator Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Create service instance with mock prisma
    reportGeneratorService = new ReportGeneratorService(mockPrismaClient as any);

    // Reset all mocks to return empty arrays by default
    mockPrismaClient.curriculumExpectation.findMany.mockResolvedValue([]);
    mockPrismaClient.longRangePlan.findMany.mockResolvedValue([]);
    mockPrismaClient.unitPlan.findMany.mockResolvedValue([]);
    mockPrismaClient.eTFOLessonPlan.findMany.mockResolvedValue([]);
    mockPrismaClient.daybookEntry.findMany.mockResolvedValue([]);

    mockPrismaClient.curriculumExpectation.findUnique.mockResolvedValue(null);
    mockPrismaClient.longRangePlan.findUnique.mockResolvedValue(null);
    mockPrismaClient.unitPlan.findUnique.mockResolvedValue(null);
    mockPrismaClient.eTFOLessonPlan.findUnique.mockResolvedValue(null);
  });

  describe('generateCurriculumCoverageReport', () => {
    test('should generate coverage report for user', async () => {
      const userId = 1;
      const mockExpectations = [
        {
          id: 'exp1',
          code: 'A1.1',
          description: 'Test expectation 1',
          strand: 'Number Sense',
          subject: 'Mathematics',
          grade: 1,
          userId,
        },
        {
          id: 'exp2',
          code: 'A1.2',
          description: 'Test expectation 2',
          strand: 'Number Sense',
          subject: 'Mathematics',
          grade: 1,
          userId,
        },
      ];

      const mockLongRangePlans = [
        {
          id: 'lrp1',
          title: 'Math Year Plan',
          subject: 'Mathematics',
          grade: 1,
          userId,
          expectations: [], // Include expectations array
        },
      ];

      const mockUnitPlans = [
        {
          id: 'unit1',
          title: 'Numbers Unit',
          longRangePlanId: 'lrp1',
          userId,
          expectations: [], // Include expectations array
        },
      ];

      const mockLessonPlans = [
        {
          id: 'lesson1',
          title: 'Counting Lesson',
          unitPlanId: 'unit1',
          userId,
          expectations: [{ expectationId: 'exp1' }], // This already has the correct structure
        },
      ];

      mockPrismaClient.curriculumExpectation.findMany.mockResolvedValue(mockExpectations);
      mockPrismaClient.longRangePlan.findMany.mockResolvedValue(mockLongRangePlans);
      mockPrismaClient.unitPlan.findMany.mockResolvedValue(mockUnitPlans);
      mockPrismaClient.eTFOLessonPlan.findMany.mockResolvedValue(mockLessonPlans);

      const report = await reportGeneratorService.generateCurriculumCoverageReport(userId);

      expect(report).toBeDefined();
      expect(report.totalExpectations).toBe(2);
      expect(report.coveredExpectations).toBe(1);
      expect(report.coveragePercentage).toBe(50);
      expect(report.uncoveredExpectations).toHaveLength(1);
      expect(report.uncoveredExpectations[0].code).toBe('A1.2');
    });
  });

  describe('generatePlanningProgressReport', () => {
    test('should generate progress report across all ETFO levels', async () => {
      const userId = 1;
      const mockLongRangePlans = [
        {
          id: 'lrp1',
          title: 'Math Year Plan',
          subject: 'Mathematics',
          grade: 1,
          userId,
          goals: 'Learn numbers',
        },
        {
          id: 'lrp2',
          title: 'Science Year Plan',
          subject: 'Science',
          grade: 1,
          userId,
          goals: null,
        },
      ];

      const mockUnitPlans = [
        {
          id: 'unit1',
          title: 'Numbers Unit',
          longRangePlanId: 'lrp1',
          userId,
          bigIdeas: 'Numbers are important',
        },
        {
          id: 'unit2',
          title: 'Plants Unit',
          longRangePlanId: 'lrp2',
          userId,
          bigIdeas: null,
        },
      ];

      const mockLessonPlans = [
        {
          id: 'lesson1',
          title: 'Counting Lesson',
          unitPlanId: 'unit1',
          userId,
        },
      ];

      const mockDaybookEntries = [
        {
          id: 'daybook1',
          date: '2024-01-15',
          userId,
          reflections: 'Good lesson',
        },
      ];

      mockPrismaClient.longRangePlan.findMany.mockResolvedValue(mockLongRangePlans);
      mockPrismaClient.unitPlan.findMany.mockResolvedValue(mockUnitPlans);
      mockPrismaClient.eTFOLessonPlan.findMany.mockResolvedValue(mockLessonPlans);
      mockPrismaClient.daybookEntry.findMany.mockResolvedValue(mockDaybookEntries);

      const report = await reportGeneratorService.generatePlanningProgressReport(userId);

      expect(report).toBeDefined();
      expect(report.longRangePlans.total).toBe(2);
      expect(report.longRangePlans.completed).toBe(1);
      expect(report.longRangePlans.completionRate).toBe(50);
    });
  });

  describe('generateLessonPlanReport', () => {
    test('should generate detailed lesson plan report', async () => {
      const lessonId = 'lesson1';
      const mockLesson = {
        id: lessonId,
        title: 'Counting Lesson',
        date: '2024-01-15',
        duration: 60,
        mindsOn: 'Hook activity',
        action: 'Main learning',
        consolidation: 'Summary',
        materials: ['counters', 'whiteboard'],
        unitPlan: {
          id: 'unit1',
          title: 'Numbers Unit',
          longRangePlan: {
            id: 'lrp1',
            title: 'Math Year Plan',
            subject: 'Mathematics',
            grade: 1,
          },
        },
        expectations: [
          {
            expectation: {
              id: 'exp1',
              code: 'A1.1',
              description: 'Count to 10',
            },
          },
        ],
        resources: [],
      };

      mockPrismaClient.eTFOLessonPlan.findUnique.mockResolvedValue(mockLesson);

      const report = await reportGeneratorService.generateLessonPlanReport(lessonId);

      expect(report).toBeDefined();
      expect(report.lesson.title).toBe('Counting Lesson');
      expect(report.lesson.duration).toBe(60);
      expect(report.curriculumAlignment).toHaveLength(1);
    });
  });

  describe('generateSubstitutePlanReport', () => {
    test('should generate substitute-friendly lesson report', async () => {
      const lessonId = 'lesson1';
      const mockLesson = {
        id: lessonId,
        title: 'Counting Lesson',
        isSubFriendly: true,
        subNotes: 'All materials in cabinet',
        date: '2024-01-15',
        duration: 60,
        mindsOn: 'Hook activity',
        action: 'Main learning',
        consolidation: 'Summary',
        materials: ['counters', 'whiteboard'],
        grouping: 'pairs',
        unitPlan: {
          id: 'unit1',
          title: 'Numbers Unit',
          longRangePlan: {
            id: 'lrp1',
            title: 'Math Year Plan',
            subject: 'Mathematics',
            grade: 1,
          },
        },
        resources: [],
      };

      mockPrismaClient.eTFOLessonPlan.findUnique.mockResolvedValue(mockLesson);

      const report = await reportGeneratorService.generateSubstitutePlanReport(lessonId);

      expect(report).toBeDefined();
      expect(report.title).toBe('Counting Lesson');
      expect(report.specialNotes).toBe('All materials in cabinet');
    });

    test('should handle non-sub-friendly lesson', async () => {
      const lessonId = 'lesson1';
      const mockLesson = {
        id: lessonId,
        title: 'Complex Lesson',
        isSubFriendly: false,
        resources: [],
      };

      mockPrismaClient.eTFOLessonPlan.findUnique.mockResolvedValue(mockLesson);

      await expect(reportGeneratorService.generateSubstitutePlanReport(lessonId)).rejects.toThrow(
        'Lesson plan is not marked as substitute-friendly',
      );
    });
  });

  describe('generateUnitOverviewReport', () => {
    test('should generate comprehensive unit overview', async () => {
      const unitId = 'unit1';
      const mockUnit = {
        id: unitId,
        title: 'Numbers Unit',
        description: 'Learning about numbers',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        estimatedHours: 10,
        bigIdeas: 'Understanding numbers',
        lessonPlans: [
          {
            id: 'lesson1',
            title: 'Counting',
            duration: 60,
          },
          {
            id: 'lesson2',
            title: 'Addition',
            duration: 45,
          },
        ],
        longRangePlan: {
          id: 'lrp1',
          title: 'Math Year Plan',
          subject: 'Mathematics',
          grade: 1,
        },
        expectations: [
          {
            expectation: {
              id: 'exp1',
              code: 'A1.1',
              description: 'Count to 10',
              strand: 'Number Sense',
            },
          },
        ],
        resources: [], // Add resources field
      };

      mockPrismaClient.unitPlan.findUnique.mockResolvedValue(mockUnit);

      const report = await reportGeneratorService.generateUnitOverviewReport(unitId);

      expect(report).toBeDefined();
      expect(report.unit.title).toBe('Numbers Unit');
      expect(report.lessonSummary.totalLessons).toBe(2);
      expect(report.lessonSummary.totalDuration).toBe(105);
    });
  });

  describe('error handling', () => {
    test('should handle database errors gracefully', async () => {
      const userId = 1;

      // Clear the mock to ensure our rejection takes effect
      mockPrismaClient.curriculumExpectation.findMany.mockClear();
      mockPrismaClient.curriculumExpectation.findMany.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(reportGeneratorService.generateCurriculumCoverageReport(userId)).rejects.toThrow(
        'Database connection failed',
      );
    });

    test('should handle missing lesson plan', async () => {
      const lessonId = 'nonexistent';

      mockPrismaClient.eTFOLessonPlan.findUnique.mockResolvedValue(null);

      await expect(reportGeneratorService.generateLessonPlanReport(lessonId)).rejects.toThrow(
        'Lesson plan not found',
      );
    });

    test('should handle missing unit plan', async () => {
      const unitId = 'nonexistent';

      mockPrismaClient.unitPlan.findUnique.mockResolvedValue(null);

      await expect(reportGeneratorService.generateUnitOverviewReport(unitId)).rejects.toThrow(
        'Unit plan not found',
      );
    });
  });
});
