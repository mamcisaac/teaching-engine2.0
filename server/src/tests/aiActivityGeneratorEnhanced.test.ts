import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { aiActivityGeneratorEnhanced } from '../services/aiActivityGeneratorEnhanced';
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
                title: 'Test Activity',
                descriptionFr: 'Description en français',
                descriptionEn: 'English description',
                materials: ['papier', 'crayons'],
                duration: 30,
                qualityScore: 0.85
              })
            }
          }]
        })
      }
    }
  }
}));

describe('AIActivityGeneratorEnhanced', () => {
  beforeAll(async () => {
    // Create test data
    await prisma.user.create({
      data: {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test Teacher'
      }
    });

    await prisma.subject.create({
      data: {
        id: 1,
        name: 'Mathematics',
        userId: 1
      }
    });

    await prisma.milestone.create({
      data: {
        id: 1,
        title: 'Numbers 1-10',
        subjectId: 1,
        userId: 1
      }
    });

    await prisma.outcome.create({
      data: {
        id: 'math-1-1',
        code: 'M1.1',
        description: 'Count to 10',
        grade: 1,
        subject: 'Mathematics'
      }
    });

    await prisma.milestoneOutcome.create({
      data: {
        milestoneId: 1,
        outcomeId: 'math-1-1'
      }
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.milestoneOutcome.deleteMany();
    await prisma.aISuggestedActivity.deleteMany();
    await prisma.outcome.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateActivities', () => {
    it('should generate individual activities for given outcomes', async () => {
      const result = await aiActivityGeneratorEnhanced.generateActivities({
        outcomeIds: ['math-1-1'],
        userId: 1,
        theme: 'Animals',
        complexity: 'simple'
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Check that activity was saved to database
      const savedActivity = await prisma.aISuggestedActivity.findFirst({
        where: { userId: 1, outcomeId: 'math-1-1' }
      });
      
      expect(savedActivity).toBeDefined();
      expect(savedActivity?.title).toBe('Test Activity');
      expect(savedActivity?.theme).toBe('Animals');
    });

    it('should generate activity series when requested', async () => {
      const result = await aiActivityGeneratorEnhanced.generateActivities({
        outcomeIds: ['math-1-1'],
        userId: 1,
        generateSeries: true,
        seriesSize: 3
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Should create activity series record
      const series = await prisma.activitySeries.findFirst({
        where: { userId: 1 }
      });
      expect(series).toBeDefined();
    });

    it('should handle empty outcome arrays', async () => {
      await expect(
        aiActivityGeneratorEnhanced.generateActivities({
          outcomeIds: [],
          userId: 1
        })
      ).rejects.toThrow('No outcomes found');
    });
  });

  describe('analyzeCurriculumGaps', () => {
    it('should analyze curriculum coverage and return gaps', async () => {
      const analysis = await aiActivityGeneratorEnhanced.analyzeCurriculumGaps(1);

      expect(analysis).toBeDefined();
      expect(analysis).toHaveProperty('totalOutcomes');
      expect(analysis).toHaveProperty('coveredOutcomes');
      expect(analysis).toHaveProperty('coveragePercentage');
      expect(analysis).toHaveProperty('priorityGaps');
      
      expect(typeof analysis.coveragePercentage).toBe('number');
      expect(Array.isArray(analysis.priorityGaps)).toBe(true);
    });

    it('should filter by subject when provided', async () => {
      const analysis = await aiActivityGeneratorEnhanced.analyzeCurriculumGaps(1, 1);

      expect(analysis).toBeDefined();
      expect(analysis.priorityGaps.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('updateQualityScore', () => {
    it('should update quality score when activity is accepted', async () => {
      // Create a test activity first
      const activity = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId: 'math-1-1',
          userId: 1,
          title: 'Test Activity',
          descriptionFr: 'Test',
          materials: '[]',
          duration: 30,
          acceptanceRate: 0.5
        }
      });

      await aiActivityGeneratorEnhanced.updateQualityScore(activity.id, true);

      const updated = await prisma.aISuggestedActivity.findUnique({
        where: { id: activity.id }
      });

      expect(updated?.acceptanceRate).toBeGreaterThan(0.5);
    });

    it('should decrease quality score when activity is rejected', async () => {
      const activity = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId: 'math-1-1',
          userId: 1,
          title: 'Test Activity',
          descriptionFr: 'Test',
          materials: '[]',
          duration: 30,
          acceptanceRate: 0.5
        }
      });

      await aiActivityGeneratorEnhanced.updateQualityScore(activity.id, false);

      const updated = await prisma.aISuggestedActivity.findUnique({
        where: { id: activity.id }
      });

      expect(updated?.acceptanceRate).toBeLessThan(0.5);
    });
  });
});