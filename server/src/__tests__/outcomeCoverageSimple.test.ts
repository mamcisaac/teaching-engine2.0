import { describe, it, expect, beforeEach } from '@jest/globals';
import { getTestPrismaClient } from '../../tests/jest.setup';
import { getOutcomeCoverage, getCoverageSummary, CoverageStatus } from '../utils/outcomeCoverage';

describe('Simple Outcome Coverage', () => {
  const prisma = getTestPrismaClient();

  beforeEach(async () => {
    // Clean up test data
    await prisma.activityOutcome.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.outcome.deleteMany();
  });

  describe('getOutcomeCoverage - Simple Cases', () => {
    it('should return uncovered status for outcome with no activities', async () => {
      // Create a simple outcome
      const outcome = await prisma.outcome.create({
        data: {
          code: 'TEST-1',
          description: 'Simple test outcome',
          subject: 'Math',
          grade: 1,
        },
      });

      const result = await getOutcomeCoverage(outcome.id);

      expect(result).toEqual({
        outcomeId: outcome.id,
        status: CoverageStatus.UNCOVERED,
        linked: 0,
        completed: 0,
      });
    });

    it('should handle single activity linked to outcome', async () => {
      // Create outcome with one activity
      const outcome = await prisma.outcome.create({
        data: {
          code: 'TEST-2',
          description: 'Outcome with single activity',
          subject: 'Science',
          grade: 1,
        },
      });

      const subject = await prisma.subject.create({
        data: { name: 'Science' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Simple Milestone',
          subjectId: subject.id,
        },
      });

      const activity = await prisma.activity.create({
        data: {
          title: 'Single Activity',
          milestoneId: milestone.id,
          completedAt: new Date(), // Completed
        },
      });

      await prisma.activityOutcome.create({
        data: {
          activityId: activity.id,
          outcomeId: outcome.id,
        },
      });

      const result = await getOutcomeCoverage(outcome.id);

      expect(result).toEqual({
        outcomeId: outcome.id,
        status: CoverageStatus.COVERED,
        linked: 1,
        completed: 1,
      });
    });
  });

  describe('getCoverageSummary - Simple Cases', () => {
    it('should return correct summary for basic coverage data', () => {
      const coverageData = [
        { outcomeId: '1', status: CoverageStatus.COVERED, linked: 1, completed: 1 },
        { outcomeId: '2', status: CoverageStatus.UNCOVERED, linked: 0, completed: 0 },
        { outcomeId: '3', status: CoverageStatus.PARTIAL, linked: 1, completed: 0 },
      ];

      const summary = getCoverageSummary(coverageData);

      expect(summary).toEqual({
        total: 3,
        covered: 1,
        partial: 1,
        uncovered: 1,
      });
    });

    it('should handle single item correctly', () => {
      const singleCovered = [
        { outcomeId: '1', status: CoverageStatus.COVERED, linked: 5, completed: 5 },
      ];

      expect(getCoverageSummary(singleCovered)).toEqual({
        total: 1,
        covered: 1,
        partial: 0,
        uncovered: 0,
      });

      const singleUncovered = [
        { outcomeId: '2', status: CoverageStatus.UNCOVERED, linked: 0, completed: 0 },
      ];

      expect(getCoverageSummary(singleUncovered)).toEqual({
        total: 1,
        covered: 0,
        partial: 0,
        uncovered: 1,
      });
    });

    it('should handle all same status correctly', () => {
      const allCovered = Array(5)
        .fill(null)
        .map((_, i) => ({
          outcomeId: `covered-${i}`,
          status: CoverageStatus.COVERED,
          linked: 1,
          completed: 1,
        }));

      expect(getCoverageSummary(allCovered)).toEqual({
        total: 5,
        covered: 5,
        partial: 0,
        uncovered: 0,
      });
    });
  });

  describe('Integration - Simple Real-World Scenario', () => {
    it('should correctly calculate coverage for a simple teaching unit', async () => {
      // Create a simple unit with 3 outcomes
      const outcomes = await Promise.all([
        prisma.outcome.create({
          data: { code: 'MATH-001', description: 'Count to 10', subject: 'Math', grade: 1 },
        }),
        prisma.outcome.create({
          data: { code: 'MATH-002', description: 'Add single digits', subject: 'Math', grade: 1 },
        }),
        prisma.outcome.create({
          data: {
            code: 'MATH-003',
            description: 'Subtract single digits',
            subject: 'Math',
            grade: 1,
          },
        }),
      ]);

      const subject = await prisma.subject.create({
        data: { name: 'Math' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Basic Arithmetic',
          subjectId: subject.id,
        },
      });

      // Create activities for outcomes
      // Outcome 1: Fully covered (1 completed activity)
      const countingActivity = await prisma.activity.create({
        data: {
          title: 'Counting Practice',
          milestoneId: milestone.id,
          completedAt: new Date(),
        },
      });

      await prisma.activityOutcome.create({
        data: { activityId: countingActivity.id, outcomeId: outcomes[0].id },
      });

      // Outcome 2: Partially covered (1 incomplete activity)
      const additionActivity = await prisma.activity.create({
        data: {
          title: 'Addition Worksheets',
          milestoneId: milestone.id,
          completedAt: null,
        },
      });

      await prisma.activityOutcome.create({
        data: { activityId: additionActivity.id, outcomeId: outcomes[1].id },
      });

      // Outcome 3: Uncovered (no activities)

      // Get coverage for all outcomes
      const coverageResults = await Promise.all(
        outcomes.map((outcome) => getOutcomeCoverage(outcome.id)),
      );

      // Verify individual coverage
      expect(coverageResults[0].status).toBe(CoverageStatus.COVERED);
      expect(coverageResults[1].status).toBe(CoverageStatus.PARTIAL);
      expect(coverageResults[2].status).toBe(CoverageStatus.UNCOVERED);

      // Get summary
      const summary = getCoverageSummary(coverageResults);

      expect(summary).toEqual({
        total: 3,
        covered: 1,
        partial: 1,
        uncovered: 1,
      });
    });
  });
});
