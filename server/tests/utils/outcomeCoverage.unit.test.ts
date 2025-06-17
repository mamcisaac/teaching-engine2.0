import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  getOutcomeCoverage,
  type CoverageStatus
} from '../../src/utils/outcomeCoverage';
import { enhancedFactories } from '../enhanced-factories';
import { getTestPrismaClient } from '../setup-all-tests';

describe('OutcomeCoverage Utils Unit Tests', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(() => {
    prisma = getTestPrismaClient();
  });

  describe('getOutcomeCoverage', () => {
    it('should return uncovered status for outcome with no linked activities', async () => {
      const outcome = await enhancedFactories.outcome.create({ code: 'TEST-UNCOVERED' });

      const result = await getOutcomeCoverage(outcome.id, prisma);

      expect(result).toEqual({
        outcomeId: outcome.id,
        status: 'uncovered',
        linked: 0,
        completed: 0,
      });
    });

    it('should return covered status when all activities are completed', async () => {
      // Create test data
      const outcome = await enhancedFactories.outcome.create({ code: 'TEST-COVERED' });
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });
      
      const activities = await Promise.all([
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(),
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(),
        }),
      ]);

      // Link activities to outcome
      await Promise.all(
        activities.map(activity =>
          prisma.activityOutcome.create({
            data: {
              activityId: activity.id,
              outcomeId: outcome.id,
            },
          })
        )
      );

      const result = await getOutcomeCoverage(outcome.id, prisma);

      expect(result.outcomeId).toBe(outcome.id);
      expect(result.status).toBe('covered');
      expect(result.linked).toBe(2);
      expect(result.completed).toBe(2);
    });

    it('should return partial status when some activities are completed', async () => {
      const outcome = await enhancedFactories.outcome.create({ code: 'TEST-PARTIAL' });
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });
      
      const activities = await Promise.all([
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(), // Completed
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: null, // Not completed
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: new Date(), // Completed
        }),
      ]);

      // Link activities to outcome
      await Promise.all(
        activities.map(activity =>
          prisma.activityOutcome.create({
            data: {
              activityId: activity.id,
              outcomeId: outcome.id,
            },
          })
        )
      );

      const result = await getOutcomeCoverage(outcome.id, prisma);

      expect(result.outcomeId).toBe(outcome.id);
      expect(result.status).toBe('partial');
      expect(result.linked).toBe(3);
      expect(result.completed).toBe(2);
    });

    it('should return uncovered status when no activities are completed', async () => {
      const outcome = await enhancedFactories.outcome.create({ code: 'TEST-LINKED-UNCOVERED' });
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });
      
      const activities = await Promise.all([
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: null,
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: null,
        }),
      ]);

      // Link activities to outcome
      await Promise.all(
        activities.map(activity =>
          prisma.activityOutcome.create({
            data: {
              activityId: activity.id,
              outcomeId: outcome.id,
            },
          })
        )
      );

      const result = await getOutcomeCoverage(outcome.id, prisma);

      expect(result.outcomeId).toBe(outcome.id);
      expect(result.status).toBe('uncovered');
      expect(result.linked).toBe(2);
      expect(result.completed).toBe(0);
    });

    it('should handle single completed activity', async () => {
      const outcome = await enhancedFactories.outcome.create({ code: 'TEST-SINGLE' });
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });
      
      const activity = await enhancedFactories.activity.create({
        milestoneId: milestone.id,
        completedAt: new Date(),
      });

      await prisma.activityOutcome.create({
        data: {
          activityId: activity.id,
          outcomeId: outcome.id,
        },
      });

      const result = await getOutcomeCoverage(outcome.id, prisma);

      expect(result.outcomeId).toBe(outcome.id);
      expect(result.status).toBe('covered');
      expect(result.linked).toBe(1);
      expect(result.completed).toBe(1);
    });

    it('should handle activities with different completion dates', async () => {
      const outcome = await enhancedFactories.outcome.create({ code: 'TEST-DATES' });
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });
      
      const oldDate = new Date('2024-01-01');
      const recentDate = new Date('2024-06-01');
      
      const activities = await Promise.all([
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: oldDate,
        }),
        enhancedFactories.activity.create({
          milestoneId: milestone.id,
          completedAt: recentDate,
        }),
      ]);

      await Promise.all(
        activities.map(activity =>
          prisma.activityOutcome.create({
            data: {
              activityId: activity.id,
              outcomeId: outcome.id,
            },
          })
        )
      );

      const result = await getOutcomeCoverage(outcome.id, prisma);

      expect(result.status).toBe('covered');
      expect(result.completed).toBe(2);
    });

    it('should handle nonexistent outcome gracefully', async () => {
      const result = await getOutcomeCoverage('NONEXISTENT-OUTCOME', prisma);

      expect(result).toEqual({
        outcomeId: 'NONEXISTENT-OUTCOME',
        status: 'uncovered',
        linked: 0,
        completed: 0,
      });
    });

    it('should work with different outcome ID formats', async () => {
      const outcomeFormats = [
        'FRA-1-CO-1',
        'MAT-2-N-5',
        'SCI-3-EI-2',
        'test_outcome_123',
        'OUTCOME-WITH-DASHES',
      ];

      for (const format of outcomeFormats) {
        const outcome = await enhancedFactories.outcome.create({ code: format });
        const result = await getOutcomeCoverage(outcome.id, prisma);
        
        expect(result.outcomeId).toBe(outcome.id);
        expect(result.status).toBe('uncovered');
        expect(typeof result.linked).toBe('number');
        expect(typeof result.completed).toBe('number');
      }
    });

    it('should handle large numbers of activities efficiently', async () => {
      const outcome = await enhancedFactories.outcome.create({ code: 'TEST-PERFORMANCE' });
      const subject = await enhancedFactories.subject.create();
      const milestone = await enhancedFactories.milestone.create({ subjectId: subject.id });
      
      // Create 100 activities
      const activities = await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          enhancedFactories.activity.create({
            milestoneId: milestone.id,
            completedAt: i % 2 === 0 ? new Date() : null, // 50% completed
          })
        )
      );

      // Link all activities to outcome
      await Promise.all(
        activities.map(activity =>
          prisma.activityOutcome.create({
            data: {
              activityId: activity.id,
              outcomeId: outcome.id,
            },
          })
        )
      );

      const startTime = Date.now();
      const result = await getOutcomeCoverage(outcome.id, prisma);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(result.linked).toBe(100);
      expect(result.completed).toBe(50);
      expect(result.status).toBe('partial');
    });
  });

  describe('Coverage Status Logic', () => {
    const testCoverageStatus = (linked: number, completed: number): CoverageStatus => {
      if (linked === 0) return 'uncovered';
      if (completed === 0) return 'uncovered';
      if (completed === linked) return 'covered';
      return 'partial';
    };

    it('should correctly determine coverage status for various scenarios', () => {
      const testCases = [
        { linked: 0, completed: 0, expected: 'uncovered' as CoverageStatus },
        { linked: 1, completed: 0, expected: 'uncovered' as CoverageStatus },
        { linked: 1, completed: 1, expected: 'covered' as CoverageStatus },
        { linked: 3, completed: 0, expected: 'uncovered' as CoverageStatus },
        { linked: 3, completed: 1, expected: 'partial' as CoverageStatus },
        { linked: 3, completed: 2, expected: 'partial' as CoverageStatus },
        { linked: 3, completed: 3, expected: 'covered' as CoverageStatus },
        { linked: 10, completed: 5, expected: 'partial' as CoverageStatus },
      ];

      testCases.forEach(({ linked, completed, expected }) => {
        expect(testCoverageStatus(linked, completed)).toBe(expected);
      });
    });
  });
});