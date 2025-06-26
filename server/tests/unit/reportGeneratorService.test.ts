import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { ReportGeneratorService } from '../../src/services/reportGeneratorService';
import { prisma } from '../../src/prisma';

// Cast prisma to mocked version
const mockPrisma = prisma as any;

// Create a new instance for testing
const reportGeneratorService = new ReportGeneratorService();

describe('Report Generator Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
          title: 'Grade 1 Math',
          userId,
          expectations: [{ expectationId: 'exp1' }],
        },
      ];

      const mockUnitPlans = [
        {
          id: 'unit1',
          title: 'Numbers Unit',
          userId,
          expectations: [{ expectationId: 'exp1' }],
        },
      ];

      const mockLessonPlans = [
        {
          id: 'lesson1',
          title: 'Counting Lesson',
          userId,
          expectations: [{ expectationId: 'exp1' }],
        },
      ];

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(mockExpectations);
      mockPrisma.longRangePlan.findMany.mockResolvedValue(mockLongRangePlans);
      mockPrisma.unitPlan.findMany.mockResolvedValue(mockUnitPlans);
      mockPrisma.eTFOLessonPlan.findMany.mockResolvedValue(mockLessonPlans);

      const report = await reportGeneratorService.generateCurriculumCoverageReport(userId);

      expect(report).toBeDefined();
      expect(report.totalExpectations).toBe(2);
      expect(report.coveredExpectations).toBe(1);
      expect(report.coveragePercentage).toBe(50);
      expect(report.uncoveredExpectations).toHaveLength(1);
      expect(report.uncoveredExpectations[0].code).toBe('A1.2');
      expect(report.coverageByStrand['Number Sense']).toEqual({
        total: 2,
        covered: 1,
        percentage: 50,
      });
    });

    test('should handle no expectations', async () => {
      const userId = 1;
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([]);
      mockPrisma.longRangePlan.findMany.mockResolvedValue([]);
      mockPrisma.unitPlan.findMany.mockResolvedValue([]);
      mockPrisma.eTFOLessonPlan.findMany.mockResolvedValue([]);

      const report = await reportGeneratorService.generateCurriculumCoverageReport(userId);

      expect(report.totalExpectations).toBe(0);
      expect(report.coveredExpectations).toBe(0);
      expect(report.coveragePercentage).toBe(0);
    });
  });

  describe('generatePlanningProgressReport', () => {
    test('should generate progress report across all ETFO levels', async () => {
      const userId = 1;

      const mockLongRangePlans = [
        {
          id: 'lrp1',
          title: 'Complete LRP',
          goals: 'Test goals',
          createdAt: new Date(),
          userId,
        },
        {
          id: 'lrp2',
          title: 'Incomplete LRP',
          goals: null,
          createdAt: new Date(),
          userId,
        },
      ];

      const mockUnitPlans = [
        {
          id: 'unit1',
          title: 'Complete Unit',
          bigIdeas: 'Test big ideas',
          createdAt: new Date(),
          userId,
        },
      ];

      const mockLessonPlans = [
        {
          id: 'lesson1',
          title: 'Complete Lesson',
          learningGoals: 'Test learning goals',
          date: new Date(),
          userId,
        },
      ];

      const mockDaybookEntries = [
        {
          id: 'daybook1',
          date: new Date(),
          whatWorked: 'Test reflection',
          userId,
        },
      ];

      (mockPrisma.longRangePlan.findMany).mockResolvedValue(mockLongRangePlans);
      (mockPrisma.unitPlan.findMany).mockResolvedValue(mockUnitPlans);
      (mockPrisma.eTFOLessonPlan.findMany).mockResolvedValue(mockLessonPlans);
      (mockPrisma.daybookEntry.findMany).mockResolvedValue(mockDaybookEntries);

      const report = await reportGeneratorService.generatePlanningProgressReport(userId);

      expect(report).toBeDefined();
      expect(report.longRangePlans.total).toBe(2);
      expect(report.longRangePlans.completed).toBe(1);
      expect(report.longRangePlans.completionRate).toBe(50);

      expect(report.unitPlans.total).toBe(1);
      expect(report.unitPlans.completed).toBe(1);
      expect(report.unitPlans.completionRate).toBe(100);

      expect(report.lessonPlans.total).toBe(1);
      expect(report.lessonPlans.completed).toBe(1);
      expect(report.lessonPlans.completionRate).toBe(100);

      expect(report.daybookEntries.total).toBe(1);
      expect(report.daybookEntries.completed).toBe(1);
      expect(report.daybookEntries.completionRate).toBe(100);
    });
  });

  describe('generateLessonPlanReport', () => {
    test('should generate detailed lesson plan report', async () => {
      const lessonId = 'lesson1';
      const mockLesson = {
        id: 'lesson1',
        title: 'Test Lesson',
        date: new Date('2024-09-15'),
        duration: 45,
        mindsOn: 'Test minds-on',
        action: 'Test action',
        consolidation: 'Test consolidation',
        learningGoals: 'Test learning goals',
        materials: ['material1', 'material2'],
        isSubFriendly: true,
        unitPlan: {
          id: 'unit1',
          title: 'Test Unit',
          longRangePlan: {
            id: 'lrp1',
            title: 'Test LRP',
            subject: 'Mathematics',
            grade: 1,
          },
        },
        expectations: [
          {
            expectation: {
              id: 'exp1',
              code: 'A1.1',
              description: 'Test expectation',
              strand: 'Number Sense',
            },
          },
        ],
        daybookEntry: {
          id: 'daybook1',
          whatWorked: 'Test reflection',
          overallRating: 4,
          wouldReuseLesson: true,
        },
        resources: [
          {
            id: 'res1',
            title: 'Test Resource',
            type: 'handout',
            url: 'https://example.com/resource.pdf',
          },
        ],
      };

      (mockPrisma.eTFOLessonPlan.findUnique).mockResolvedValue(mockLesson);

      const report = await reportGeneratorService.generateLessonPlanReport(lessonId);

      expect(report).toBeDefined();
      expect(report.lesson.title).toBe('Test Lesson');
      expect(report.lesson.duration).toBe(45);
      expect(report.hierarchy.longRangePlan.title).toBe('Test LRP');
      expect(report.hierarchy.unitPlan.title).toBe('Test Unit');
      expect(report.curriculumAlignment).toHaveLength(1);
      expect(report.curriculumAlignment[0].code).toBe('A1.1');
      expect(report.reflection?.whatWorked).toBe('Test reflection');
      expect(report.resources).toHaveLength(1);
      expect(report.resources[0].title).toBe('Test Resource');
    });

    test('should handle lesson not found', async () => {
      const lessonId = 'nonexistent';
      (mockPrisma.eTFOLessonPlan.findUnique).mockResolvedValue(null);

      await expect(
        reportGeneratorService.generateLessonPlanReport(lessonId)
      ).rejects.toThrow('Lesson plan not found');
    });
  });

  describe('generateSubstitutePlanReport', () => {
    test('should generate substitute-friendly lesson report', async () => {
      const lessonId = 'lesson1';
      const mockLesson = {
        id: 'lesson1',
        title: 'Sub-Friendly Lesson',
        date: new Date('2024-09-15'),
        duration: 45,
        mindsOn: 'Easy start activity',
        action: 'Main activity with clear instructions',
        consolidation: 'Simple wrap-up',
        materials: ['worksheets', 'pencils'],
        grouping: 'whole class',
        isSubFriendly: true,
        subNotes: 'Materials are in the cupboard',
        unitPlan: {
          longRangePlan: {
            subject: 'Mathematics',
            grade: 1,
          },
        },
        resources: [
          {
            id: 'res1',
            title: 'Student Worksheet',
            type: 'handout',
            content: 'Worksheet content',
          },
        ],
      };

      (mockPrisma.eTFOLessonPlan.findUnique).mockResolvedValue(mockLesson);

      const report = await reportGeneratorService.generateSubstitutePlanReport(lessonId);

      expect(report).toBeDefined();
      expect(report.title).toBe('Sub-Friendly Lesson');
      expect(report.basicInfo.subject).toBe('Mathematics');
      expect(report.basicInfo.grade).toBe(1);
      expect(report.basicInfo.duration).toBe(45);
      expect(report.materials).toEqual(['worksheets', 'pencils']);
      expect(report.activities.opening).toBe('Easy start activity');
      expect(report.activities.main).toBe('Main activity with clear instructions');
      expect(report.activities.closing).toBe('Simple wrap-up');
      expect(report.specialNotes).toBe('Materials are in the cupboard');
      expect(report.resources).toHaveLength(1);
    });

    test('should handle non-sub-friendly lesson', async () => {
      const lessonId = 'lesson1';
      const mockLesson = {
        id: 'lesson1',
        title: 'Complex Lesson',
        isSubFriendly: false,
        unitPlan: {
          longRangePlan: {
            subject: 'Mathematics',
            grade: 1,
          },
        },
      };

      (mockPrisma.eTFOLessonPlan.findUnique).mockResolvedValue(mockLesson);

      await expect(
        reportGeneratorService.generateSubstitutePlanReport(lessonId)
      ).rejects.toThrow('Lesson plan is not marked as substitute-friendly');
    });
  });

  describe('generateUnitOverviewReport', () => {
    test('should generate comprehensive unit overview', async () => {
      const unitId = 'unit1';
      const mockUnit = {
        id: 'unit1',
        title: 'Test Unit',
        description: 'Test description',
        bigIdeas: 'Test big ideas',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-30'),
        estimatedHours: 20,
        longRangePlan: {
          id: 'lrp1',
          title: 'Test LRP',
          subject: 'Mathematics',
          grade: 1,
        },
        expectations: [
          {
            expectation: {
              id: 'exp1',
              code: 'A1.1',
              description: 'Test expectation',
              strand: 'Number Sense',
            },
          },
        ],
        lessonPlans: [
          {
            id: 'lesson1',
            title: 'Lesson 1',
            date: new Date('2024-09-15'),
            duration: 45,
          },
          {
            id: 'lesson2',
            title: 'Lesson 2',
            date: new Date('2024-09-20'),
            duration: 30,
          },
        ],
        resources: [
          {
            id: 'res1',
            title: 'Unit Resource',
            type: 'document',
          },
        ],
      };

      (mockPrisma.unitPlan.findUnique).mockResolvedValue(mockUnit);

      const report = await reportGeneratorService.generateUnitOverviewReport(unitId);

      expect(report).toBeDefined();
      expect(report.unit.title).toBe('Test Unit');
      expect(report.unit.estimatedHours).toBe(20);
      expect(report.hierarchy.longRangePlan.title).toBe('Test LRP');
      expect(report.curriculumAlignment).toHaveLength(1);
      expect(report.lessonSummary.totalLessons).toBe(2);
      expect(report.lessonSummary.totalDuration).toBe(75);
      expect(report.lessonSummary.lessons).toHaveLength(2);
      expect(report.resources).toHaveLength(1);
    });
  });

  describe('error handling', () => {
    test('should handle database errors gracefully', async () => {
      const userId = 1;
      (mockPrisma.curriculumExpectation.findMany).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        reportGeneratorService.generateCurriculumCoverageReport(userId)
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle invalid user IDs', async () => {
      const userId = -1;
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([]);
      mockPrisma.longRangePlan.findMany.mockResolvedValue([]);
      mockPrisma.unitPlan.findMany.mockResolvedValue([]);
      mockPrisma.eTFOLessonPlan.findMany.mockResolvedValue([]);

      const report = await reportGeneratorService.generateCurriculumCoverageReport(userId);

      expect(report.totalExpectations).toBe(0);
    });
  });
});