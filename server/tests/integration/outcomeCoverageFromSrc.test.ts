import { describe, it, expect, beforeEach } from '@jest/globals';
import { getTestPrismaClient } from '../../tests/jest.setup';
import {
  getCoverageSummary,
  getOutcomeCoverage,
  CoverageStatus,
} from '../../src/utils/outcomeCoverage';
import type { OutcomeCoverage } from '../../src/utils/outcomeCoverage';

describe('Outcome Coverage', () => {
  const prisma = getTestPrismaClient();

  beforeEach(async () => {
    // Clean up test data
    await prisma.activityOutcome.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.outcome.deleteMany();
  });

  describe('getCoverageSummary', () => {
    it('should return correct summary for coverage data', () => {
      const coverage: OutcomeCoverage[] = [
        { outcomeId: '1', status: CoverageStatus.COVERED, linked: 1, completed: 1 },
        { outcomeId: '2', status: CoverageStatus.UNCOVERED, linked: 0, completed: 0 },
        { outcomeId: '3', status: CoverageStatus.PARTIAL, linked: 1, completed: 0 },
      ];

      const summary = getCoverageSummary(coverage);

      expect(summary).toEqual({
        total: 3,
        covered: 1,
        partial: 1,
        uncovered: 1,
      });
    });

    it('should handle empty array', () => {
      const summary = getCoverageSummary([]);

      expect(summary).toEqual({
        total: 0,
        covered: 0,
        partial: 0,
        uncovered: 0,
      });
    });

    it('should handle large datasets efficiently', () => {
      const largeCoverage: OutcomeCoverage[] = Array(1000)
        .fill(null)
        .map((_, i) => ({
          outcomeId: `outcome-${i}`,
          status:
            i % 3 === 0
              ? CoverageStatus.COVERED
              : i % 3 === 1
                ? CoverageStatus.PARTIAL
                : CoverageStatus.UNCOVERED,
          linked: i % 3 === 2 ? 0 : 1,
          completed: i % 3 === 0 ? 1 : 0,
        }));

      const summary = getCoverageSummary(largeCoverage);

      expect(summary.total).toBe(1000);
      expect(summary.covered).toBe(334); // 0, 3, 6, 9... = 334 items
      expect(summary.partial).toBe(333); // 1, 4, 7, 10... = 333 items
      expect(summary.uncovered).toBe(333); // 2, 5, 8, 11... = 333 items
    });
  });

  describe('getOutcomeCoverage', () => {
    it('should return uncovered status for outcome with no activities', async () => {
      // Create an outcome with no linked activities
      const outcome = await prisma.outcome.create({
        data: {
          code: 'TEST-1',
          description: 'Test outcome with no activities',
          subject: 'Math',
          grade: 1,
        },
      });

      const coverage = await getOutcomeCoverage(outcome.id);

      expect(coverage).toEqual({
        outcomeId: outcome.id,
        status: CoverageStatus.UNCOVERED,
        linked: 0,
        completed: 0,
      });
    });

    it('should return partial status for outcome with mixed activity completion', async () => {
      // Create test data structure
      const outcome = await prisma.outcome.create({
        data: {
          code: 'TEST-2',
          description: 'Test outcome with partial coverage',
          subject: 'Science',
          grade: 2,
        },
      });

      const subject = await prisma.subject.create({
        data: { name: 'Science' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Science Unit 1',
          subjectId: subject.id,
        },
      });

      // Create 3 activities: 2 completed, 1 incomplete
      const activity1 = await prisma.activity.create({
        data: {
          title: 'Completed Activity 1',
          milestoneId: milestone.id,
          completedAt: new Date(),
        },
      });

      const activity2 = await prisma.activity.create({
        data: {
          title: 'Completed Activity 2',
          milestoneId: milestone.id,
          completedAt: new Date(),
        },
      });

      const activity3 = await prisma.activity.create({
        data: {
          title: 'Incomplete Activity',
          milestoneId: milestone.id,
          completedAt: null,
        },
      });

      // Link all activities to the outcome
      await prisma.activityOutcome.createMany({
        data: [
          { activityId: activity1.id, outcomeId: outcome.id },
          { activityId: activity2.id, outcomeId: outcome.id },
          { activityId: activity3.id, outcomeId: outcome.id },
        ],
      });

      const coverage = await getOutcomeCoverage(outcome.id);

      expect(coverage).toEqual({
        outcomeId: outcome.id,
        status: CoverageStatus.PARTIAL,
        linked: 3,
        completed: 2,
      });
    });

    it('should return covered status when all linked activities are completed', async () => {
      // Create test data
      const outcome = await prisma.outcome.create({
        data: {
          code: 'TEST-3',
          description: 'Fully covered outcome',
          subject: 'English',
          grade: 3,
        },
      });

      const subject = await prisma.subject.create({
        data: { name: 'English' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'English Writing',
          subjectId: subject.id,
        },
      });

      // Create 2 completed activities
      const activities = await Promise.all([
        prisma.activity.create({
          data: {
            title: 'Writing Exercise 1',
            milestoneId: milestone.id,
            completedAt: new Date(),
          },
        }),
        prisma.activity.create({
          data: {
            title: 'Writing Exercise 2',
            milestoneId: milestone.id,
            completedAt: new Date(),
          },
        }),
      ]);

      // Link both to the outcome
      await prisma.activityOutcome.createMany({
        data: activities.map((activity) => ({
          activityId: activity.id,
          outcomeId: outcome.id,
        })),
      });

      const coverage = await getOutcomeCoverage(outcome.id);

      expect(coverage).toEqual({
        outcomeId: outcome.id,
        status: CoverageStatus.COVERED,
        linked: 2,
        completed: 2,
      });
    });

    it('should handle outcomes linked to activities across multiple subjects', async () => {
      // Create an interdisciplinary outcome
      const outcome = await prisma.outcome.create({
        data: {
          code: 'INTER-1',
          description: 'Interdisciplinary outcome',
          subject: 'Interdisciplinary',
          grade: 4,
        },
      });

      // Create multiple subjects and milestones
      const mathSubject = await prisma.subject.create({ data: { name: 'Math' } });
      const scienceSubject = await prisma.subject.create({ data: { name: 'Science' } });

      const mathMilestone = await prisma.milestone.create({
        data: { title: 'Math Applications', subjectId: mathSubject.id },
      });

      const scienceMilestone = await prisma.milestone.create({
        data: { title: 'Scientific Method', subjectId: scienceSubject.id },
      });

      // Create activities in different subjects
      const mathActivity = await prisma.activity.create({
        data: {
          title: 'Math Investigation',
          milestoneId: mathMilestone.id,
          completedAt: new Date(),
        },
      });

      const scienceActivity = await prisma.activity.create({
        data: {
          title: 'Science Experiment',
          milestoneId: scienceMilestone.id,
          completedAt: null, // Not completed
        },
      });

      // Link both to the outcome
      await prisma.activityOutcome.createMany({
        data: [
          { activityId: mathActivity.id, outcomeId: outcome.id },
          { activityId: scienceActivity.id, outcomeId: outcome.id },
        ],
      });

      const coverage = await getOutcomeCoverage(outcome.id);

      expect(coverage).toEqual({
        outcomeId: outcome.id,
        status: CoverageStatus.PARTIAL,
        linked: 2,
        completed: 1,
      });
    });

    it('should handle non-existent outcome codes gracefully', async () => {
      const coverage = await getOutcomeCoverage('NON-EXISTENT-CODE');

      expect(coverage).toEqual({
        outcomeId: 'NON-EXISTENT-CODE',
        status: CoverageStatus.UNCOVERED,
        linked: 0,
        completed: 0,
      });
    });
  });
});
