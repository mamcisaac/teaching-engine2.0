import { describe, it, expect } from '@jest/globals';
import { getTestPrismaClient } from '../../tests/jest.setup';
import { factories, createTestScenario } from '../../tests/factories';
import { createTestUtils, assertions } from '../../tests/test-utils';

describe('Database Transaction Isolation', () => {
  const prisma = getTestPrismaClient();
  const utils = createTestUtils(prisma);

  describe('Basic CRUD Operations', () => {
    it('should create and read a subject', async () => {
      const subject = await factories.subject.create({
        name: 'Mathematics',
        nameEn: 'Mathematics',
        nameFr: 'Mathématiques',
      });

      expect(subject.id).toBeDefined();
      expect(subject.name).toBe('Mathematics');
      expect(subject.nameEn).toBe('Mathematics');
      expect(subject.nameFr).toBe('Mathématiques');

      // Verify it was saved to database
      const savedSubject = await prisma.subject.findUnique({
        where: { id: subject.id },
      });
      expect(savedSubject).toBeTruthy();
      expect(savedSubject!.name).toBe('Mathematics');
    });

    it('should create related entities', async () => {
      const subject = await factories.subject.create();
      const milestone = await factories.milestone.create({ subjectId: subject.id });
      const activity = await factories.activity.create({ milestoneId: milestone.id });

      // Verify relationships
      const milestoneWithSubject = await prisma.milestone.findUnique({
        where: { id: milestone.id },
        include: { subject: true },
      });
      expect(milestoneWithSubject!.subject.id).toBe(subject.id);

      const activityWithMilestone = await prisma.activity.findUnique({
        where: { id: activity.id },
        include: { milestone: true },
      });
      expect(activityWithMilestone!.milestone.id).toBe(milestone.id);
    });

    it('should handle bulk creation', async () => {
      const subjects = await factories.subject.createMany(3);
      expect(subjects).toHaveLength(3);

      const allSubjects = await prisma.subject.findMany();
      expect(allSubjects.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Transaction Isolation', () => {
    it('should isolate changes between tests', async () => {
      // This test creates data
      const subject = await factories.subject.create({ name: 'Isolated Subject' });
      expect(subject.id).toBeDefined();

      // Data should exist in this test
      const count = await utils.getTableCount('Subject');
      expect(count).toBeGreaterThan(0);
    });

    it('should not see data from previous test', async () => {
      // This test should not see the subject created in the previous test
      // due to transaction isolation
      const subjects = await prisma.subject.findMany({
        where: { name: 'Isolated Subject' },
      });
      expect(subjects).toHaveLength(0);
    });

    it('should handle concurrent operations', async () => {
      await utils.testTransactionIsolation();
    });
  });

  describe('Data Factories', () => {
    it('should create complete test scenarios', async () => {
      const scenario = await createTestScenario({
        subjectCount: 2,
        milestonesPerSubject: 2,
        activitiesPerMilestone: 3,
        outcomesPerActivity: 2,
      });

      expect(scenario.subjects).toHaveLength(2);
      expect(scenario.milestones).toHaveLength(4); // 2 subjects * 2 milestones
      expect(scenario.activities).toHaveLength(12); // 4 milestones * 3 activities
      expect(scenario.outcomes).toHaveLength(24); // 12 activities * 2 outcomes

      // Verify database state
      const subjectCount = await utils.getTableCount('Subject');
      const milestoneCount = await utils.getTableCount('Milestone');
      const activityCount = await utils.getTableCount('Activity');

      expect(subjectCount).toBeGreaterThanOrEqual(2);
      expect(milestoneCount).toBeGreaterThanOrEqual(4);
      expect(activityCount).toBeGreaterThanOrEqual(12);
    });

    it('should create related data correctly', async () => {
      const activity = await factories.activity.create();
      const note = await factories.note.create({ activityId: activity.id });

      // Verify the relationship exists
      const noteWithActivity = await prisma.note.findUnique({
        where: { id: note.id },
        include: { activity: true },
      });
      expect(noteWithActivity!.activity.id).toBe(activity.id);
    });
  });

  describe('Database Constraints', () => {
    it('should enforce foreign key constraints', async () => {
      await utils.testForeignKeyConstraints();
    });

    it('should enforce unique constraints', async () => {
      await utils.testUniqueConstraints();
    });

    it('should handle foreign key constraints properly', async () => {
      const subject = await factories.subject.create();
      const milestone = await factories.milestone.create({ subjectId: subject.id });
      const activity = await factories.activity.create({ milestoneId: milestone.id });

      // Should not be able to delete subject with dependent milestone
      await expect(prisma.subject.delete({ where: { id: subject.id } })).rejects.toThrow();

      // Delete in correct order (children first)
      await prisma.activity.delete({ where: { id: activity.id } });
      await prisma.milestone.delete({ where: { id: milestone.id } });
      await prisma.subject.delete({ where: { id: subject.id } });

      // Verify all are deleted
      const remainingSubject = await prisma.subject.findUnique({
        where: { id: subject.id },
      });
      expect(remainingSubject).toBeNull();
    });
  });

  describe('Test Utilities', () => {
    it('should validate table counts', async () => {
      await factories.subject.createMany(3);
      await utils.expectTableCount('Subject', 3);
    });

    it('should validate object matching', () => {
      const obj1 = { id: 1, name: 'Test', createdAt: new Date() };
      const obj2 = { id: 2, name: 'Test', createdAt: new Date() };

      // Should match when ignoring id and createdAt
      assertions.objectMatches(obj1, obj2);
    });

    it('should validate promise rejection', async () => {
      const promise = Promise.reject(new Error('Test error message'));
      await assertions.rejectsWithMessage(promise, 'Test error');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large datasets efficiently', async () => {
      const startTime = Date.now();

      // Create a moderately large dataset
      await createTestScenario({
        subjectCount: 5,
        milestonesPerSubject: 10,
        activitiesPerMilestone: 5,
        outcomesPerActivity: 3,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(10000); // 10 seconds

      // Verify data was created
      const subjectCount = await utils.getTableCount('Subject');
      expect(subjectCount).toBeGreaterThanOrEqual(5);
    });

    it('should maintain performance with concurrent operations', async () => {
      const operations = [];

      // Run multiple operations concurrently
      for (let i = 0; i < 10; i++) {
        operations.push(factories.subject.create({ name: `Concurrent Subject ${i}` }));
      }

      const results = await Promise.all(operations);
      expect(results).toHaveLength(10);

      // Verify all subjects were created
      const subjects = await prisma.subject.findMany({
        where: { name: { startsWith: 'Concurrent Subject' } },
      });
      expect(subjects).toHaveLength(10);
    });
  });
});
