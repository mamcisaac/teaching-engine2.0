import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { aiWeeklyPlanGenerator } from '../services/aiWeeklyPlanGenerator';
import { prisma } from '../prisma';

// Mock OpenAI
vi.mock('../services/llmService', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                monday: [{
                  time: '09:00',
                  subject: 'Mathematics',
                  activityTitle: 'Counting Practice',
                  activityDescription: 'Practice counting to 10',
                  duration: 30,
                  outcomeIds: ['math-1-1'],
                  materials: ['cubes', 'cards']
                }],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                qualityMetrics: {
                  coverageScore: 0.8,
                  balanceScore: 0.9,
                  pacingScore: 0.85,
                  overallScore: 0.85
                },
                gapsCovered: ['math-1-1']
              })
            }
          }]
        })
      }
    }
  }
}));

// Mock AI activity generator
vi.mock('../services/aiActivityGeneratorEnhanced', () => ({
  aiActivityGeneratorEnhanced: {
    analyzeCurriculumGaps: vi.fn().mockResolvedValue({
      totalOutcomes: 10,
      coveredOutcomes: 5,
      coveragePercentage: 50,
      priorityGaps: [
        {
          outcome: { id: 'math-1-1', code: 'M1.1', description: 'Count to 10' },
          priority: 100
        }
      ]
    })
  }
}));

describe('AIWeeklyPlanGenerator', () => {
  beforeAll(async () => {
    // Create test data
    await prisma.user.create({
      data: {
        id: 2,
        email: 'test2@example.com', 
        password: 'hashedpassword',
        name: 'Test Teacher 2'
      }
    });

    await prisma.subject.create({
      data: {
        id: 2,
        name: 'Mathematics',
        userId: 2
      }
    });

    // Create timetable
    await prisma.timetableSlot.create({
      data: {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '10:00',
        subjectId: 2,
        userId: 2
      }
    });
  });

  afterAll(async () => {
    await prisma.aIGeneratedPlan.deleteMany();
    await prisma.timetableSlot.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateWeeklyPlan', () => {
    it('should generate a complete weekly plan', async () => {
      const weekStart = '2024-01-08'; // Monday
      
      const result = await aiWeeklyPlanGenerator.generateWeeklyPlan({
        userId: 2,
        weekStart,
        preferences: {
          preferredComplexity: 'moderate',
          includeAssessments: false,
          bufferTime: 5
        }
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('planId');
      expect(result).toHaveProperty('plan');
      expect(result).toHaveProperty('metrics');
      
      // Check plan structure
      expect(result.plan).toHaveProperty('monday');
      expect(result.plan).toHaveProperty('qualityMetrics');
      expect(result.plan.qualityMetrics.overallScore).toBeGreaterThan(0);
      
      // Verify plan was saved to database
      const savedPlan = await prisma.aIGeneratedPlan.findUnique({
        where: { id: result.planId }
      });
      expect(savedPlan).toBeDefined();
      expect(savedPlan?.userId).toBe(2);
    });

    it('should handle empty timetable gracefully', async () => {
      // Test with user that has no timetable
      await prisma.user.create({
        data: {
          id: 3,
          email: 'test3@example.com',
          password: 'hashedpassword', 
          name: 'Test Teacher 3'
        }
      });

      const result = await aiWeeklyPlanGenerator.generateWeeklyPlan({
        userId: 3,
        weekStart: '2024-01-08',
        preferences: {}
      });

      expect(result).toBeDefined();
      expect(result.availableSlots).toBe(0);
      
      // Cleanup
      await prisma.user.delete({ where: { id: 3 } });
    });
  });

  describe('applyPlanToCalendar', () => {
    it('should apply generated plan to calendar', async () => {
      // First generate a plan
      const planResult = await aiWeeklyPlanGenerator.generateWeeklyPlan({
        userId: 2,
        weekStart: '2024-01-08',
        preferences: {}
      });

      // Then apply it
      const applyResult = await aiWeeklyPlanGenerator.applyPlanToCalendar(
        planResult.planId,
        2
      );

      expect(applyResult).toBeDefined();
      expect(applyResult.success).toBe(true);
      expect(applyResult.activitiesCreated).toBeGreaterThanOrEqual(0);

      // Check that plan is marked as applied
      const updatedPlan = await prisma.aIGeneratedPlan.findUnique({
        where: { id: planResult.planId }
      });
      expect(updatedPlan?.accepted).toBe(true);
      expect(updatedPlan?.appliedAt).toBeDefined();
    });

    it('should reject unauthorized plan application', async () => {
      const planResult = await aiWeeklyPlanGenerator.generateWeeklyPlan({
        userId: 2,
        weekStart: '2024-01-08',
        preferences: {}
      });

      await expect(
        aiWeeklyPlanGenerator.applyPlanToCalendar(planResult.planId, 999)
      ).rejects.toThrow('Plan not found or unauthorized');
    });

    it('should reject applying already applied plan', async () => {
      const planResult = await aiWeeklyPlanGenerator.generateWeeklyPlan({
        userId: 2,
        weekStart: '2024-01-08',
        preferences: {}
      });

      // Apply once
      await aiWeeklyPlanGenerator.applyPlanToCalendar(planResult.planId, 2);

      // Try to apply again
      await expect(
        aiWeeklyPlanGenerator.applyPlanToCalendar(planResult.planId, 2)
      ).rejects.toThrow('Plan already applied');
    });
  });
});