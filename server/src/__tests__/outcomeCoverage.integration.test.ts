import { describe, it, expect, beforeEach } from '@jest/globals';
import { getTestPrismaClient } from '../../tests/jest.setup';
import { getOutcomeCoverage, getCoverageSummary, CoverageStatus } from '../utils/outcomeCoverage';
import type { OutcomeCoverage } from '../utils/outcomeCoverage';

describe('Outcome Coverage Integration Tests', () => {
  const prisma = getTestPrismaClient();

  beforeEach(async () => {
    // Clean up test data
    await prisma.activity.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.outcome.deleteMany();
  });

  describe('getOutcomeCoverage', () => {
    it('should return uncovered status for outcome with no linked activities', async () => {
      // Create test outcome
      const outcome = await prisma.outcome.create({
        data: {
          code: 'TEST-001',
          description: 'Test outcome 1',
          subject: 'Math',
          grade: 1,
        },
      });

      const coverage = await getOutcomeCoverage(outcome.code);

      expect(coverage).toEqual({
        outcomeId: outcome.code,
        status: CoverageStatus.UNCOVERED,
        linked: 0,
        completed: 0,
      });
    });

    it('should return partial status for outcome with linked but incomplete activities', async () => {
      // Create test data
      const outcome = await prisma.outcome.create({
        data: {
          code: 'TEST-002',
          description: 'Test outcome 2',
          subject: 'Science',
          grade: 1,
        },
      });

      const subject = await prisma.subject.create({
        data: { name: 'Science' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Test Milestone',
          subjectId: subject.id,
        },
      });

      // Create activities linked to outcome
      await prisma.activity.create({
        data: {
          title: 'Activity 1',
          milestoneId: milestone.id,
          outcomes: {
            create: { outcomeId: outcome.id },
          },
        },
      });

      await prisma.activity.create({
        data: {
          title: 'Activity 2',
          milestoneId: milestone.id,
          completedAt: new Date(),
          outcomes: {
            create: { outcomeId: outcome.id },
          },
        },
      });

      const coverage = await getOutcomeCoverage(outcome.code);

      expect(coverage).toEqual({
        outcomeId: outcome.code,
        status: CoverageStatus.PARTIAL,
        linked: 2,
        completed: 1,
      });
    });

    it('should return covered status for outcome with all activities completed', async () => {
      // Create test data
      const outcome = await prisma.outcome.create({
        data: {
          code: 'TEST-003',
          description: 'Test outcome 3',
          subject: 'English',
          grade: 1,
        },
      });

      const subject = await prisma.subject.create({
        data: { name: 'English' },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Test Milestone',
          subjectId: subject.id,
        },
      });

      // Create completed activities linked to outcome
      await prisma.activity.create({
        data: {
          title: 'Activity 1',
          milestoneId: milestone.id,
          completedAt: new Date(),
          outcomes: {
            create: { outcomeId: outcome.id },
          },
        },
      });

      await prisma.activity.create({
        data: {
          title: 'Activity 2',
          milestoneId: milestone.id,
          completedAt: new Date(),
          outcomes: {
            create: { outcomeId: outcome.id },
          },
        },
      });

      const coverage = await getOutcomeCoverage(outcome.code);

      expect(coverage).toEqual({
        outcomeId: outcome.code,
        status: CoverageStatus.COVERED,
        linked: 2,
        completed: 2,
      });
    });

    it('should handle non-existent outcome gracefully', async () => {
      const coverage = await getOutcomeCoverage('NON-EXISTENT');

      expect(coverage).toEqual({
        outcomeId: 'NON-EXISTENT',
        status: CoverageStatus.UNCOVERED,
        linked: 0,
        completed: 0,
      });
    });
  });

  describe('getCoverageSummary', () => {
    it('should return zero counts for empty array', () => {
      const result = getCoverageSummary([]);
      expect(result).toEqual({
        total: 0,
        covered: 0,
        partial: 0,
        uncovered: 0,
      });
    });

    it('should correctly count different status types', () => {
      const coverage: OutcomeCoverage[] = [
        { outcomeId: '1', status: CoverageStatus.COVERED, linked: 1, completed: 1 },
        { outcomeId: '2', status: CoverageStatus.PARTIAL, linked: 1, completed: 0 },
        { outcomeId: '3', status: CoverageStatus.UNCOVERED, linked: 0, completed: 0 },
        { outcomeId: '4', status: CoverageStatus.COVERED, linked: 1, completed: 1 },
      ];

      const result = getCoverageSummary(coverage);
      expect(result).toEqual({
        total: 4,
        covered: 2,
        partial: 1,
        uncovered: 1,
      });
    });

    it('should integrate with real database data', async () => {
      // Create test outcomes with different coverage states
      const outcomes = await Promise.all([
        prisma.outcome.create({
          data: { code: 'INT-001', description: 'Outcome 1', subject: 'Math', grade: 1 },
        }),
        prisma.outcome.create({
          data: { code: 'INT-002', description: 'Outcome 2', subject: 'Math', grade: 1 },
        }),
        prisma.outcome.create({
          data: { code: 'INT-003', description: 'Outcome 3', subject: 'Math', grade: 1 },
        }),
      ]);

      const subject = await prisma.subject.create({
        data: { name: 'Math' },
      });

      const milestone = await prisma.milestone.create({
        data: { title: 'Integration Test Milestone', subjectId: subject.id },
      });

      // Link outcomes to activities with different completion states
      // Outcome 1: fully covered
      await prisma.activity.create({
        data: {
          title: 'Activity for Outcome 1',
          milestoneId: milestone.id,
          completedAt: new Date(),
          outcomes: {
            create: { outcomeId: outcomes[0].id },
          },
        },
      });

      // Outcome 2: partially covered
      await prisma.activity.create({
        data: {
          title: 'Incomplete Activity for Outcome 2',
          milestoneId: milestone.id,
          outcomes: {
            create: { outcomeId: outcomes[1].id },
          },
        },
      });

      // Outcome 3: uncovered (no activities)

      // Get coverage for all outcomes
      const coverageData = await Promise.all(
        outcomes.map((outcome) => getOutcomeCoverage(outcome.code)),
      );

      const summary = getCoverageSummary(coverageData);

      expect(summary).toEqual({
        total: 3,
        covered: 1,
        partial: 1,
        uncovered: 1,
      });
    });
  });
});
