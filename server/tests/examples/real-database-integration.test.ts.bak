/**
 * Example: Integration Tests with Real Database
 * 
 * Shows how to write integration tests that test complete workflows
 * using real database operations and test scenarios.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { getTestContext, testScenarios, getTestPrismaClient } from '../setup/enhanced-jest-setup';
import request from 'supertest';
import { app } from '../../src/app'; // Assuming Express app export

describe('Teacher Planning Workflow - Integration Tests', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  let authToken: string;

  beforeEach(async () => {
    prisma = getTestPrismaClient();
  });

  describe('Complete Planning Workflow', () => {
    it('should support full ETFO planning hierarchy', async () => {
      // Create complete teacher scenario
      const scenario = await testScenarios.teacherWithPlans({
        grade: 4,
        subject: 'Mathematics',
        includeSubPlans: true,
      });

      // Verify all components created
      expect(scenario.teacher).toBeDefined();
      expect(scenario.expectations).toHaveLength(20);
      expect(scenario.longRangePlan).toBeDefined();
      expect(scenario.unitPlans).toHaveLength(3);
      expect(scenario.lessonPlans).toHaveLength(5);
      expect(scenario.daybookEntries).toHaveLength(3);
      expect(scenario.substitutePlan).toBeDefined();

      // Test API endpoint for retrieving plans
      const response = await request(app)
        .get(`/api/long-range-plans/${scenario.longRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.title).toBe(scenario.longRangePlan.title);
      expect(response.body.unitPlans).toHaveLength(3);
    });

    it('should handle curriculum expectation coverage tracking', async () => {
      // Create scenario
      const scenario = await testScenarios.teacherWithPlans();

      // Query expectation coverage
      const coverage = await prisma.curriculumExpectation.findMany({
        where: {
          id: { in: scenario.expectations.map(e => e.id) },
        },
        include: {
          longRangePlans: true,
          unitPlans: true,
          lessonPlans: true,
          daybookEntries: {
            include: {
              daybookEntry: true,
            },
          },
        },
      });

      // Verify coverage tracking
      const coveredExpectations = coverage.filter(e => 
        e.daybookEntries.length > 0
      );

      expect(coveredExpectations.length).toBeGreaterThan(0);
      
      // Check coverage percentages
      const coveragePercentage = (coveredExpectations.length / coverage.length) * 100;
      expect(coveragePercentage).toBeGreaterThan(0);
    });
  });

  describe('Newsletter Generation', () => {
    it('should generate newsletter from lesson plans', async () => {
      // Create teacher with lessons
      const scenario = await testScenarios.teacherWithPlans();

      // Create newsletter through API
      const response = await request(app)
        .post('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: scenario.teacher.id,
          dateFrom: new Date().toISOString(),
          dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          tone: 'friendly',
          templateType: 'weekly',
          includeUpcomingEvents: true,
          lessonPlanIds: scenario.lessonPlans.map(lp => lp.id),
        })
        .expect(201);

      // Verify newsletter created
      const newsletter = await prisma.newsletter.findUnique({
        where: { id: response.body.id },
      });

      expect(newsletter).toBeDefined();
      expect(newsletter.sections).toBeDefined();
      expect(JSON.parse(newsletter.sections as string)).toHaveLength(5); // Assuming 5 sections
    });
  });

  describe('Substitute Planning', () => {
    it('should generate substitute plan from unit plan', async () => {
      // Create scenario
      const scenario = await testScenarios.teacherWithPlans({
        includeSubPlans: true,
      });

      // Verify substitute plan contains necessary information
      const subPlan = await prisma.substitutePlan.findUnique({
        where: { id: scenario.substitutePlan.id },
      });

      const schedule = JSON.parse(subPlan.schedule as string);
      const routines = JSON.parse(subPlan.classroomRoutines as string);
      
      expect(schedule).toBeInstanceOf(Array);
      expect(routines).toHaveProperty('morning');
      expect(routines).toHaveProperty('transition');
      expect(routines).toHaveProperty('dismissal');
    });

    it('should link substitute plans to source materials', async () => {
      const scenario = await testScenarios.teacherWithPlans({
        includeSubPlans: true,
      });

      const subPlan = await prisma.substitutePlan.findUnique({
        where: { id: scenario.substitutePlan.id },
      });

      // Verify source links
      expect(subPlan.sourceUnitPlanId).toBeDefined();
      
      const sourceLessonIds = JSON.parse(subPlan.sourceLessonPlanIds as string);
      expect(sourceLessonIds).toBeInstanceOf(Array);
      expect(sourceLessonIds.length).toBeGreaterThan(0);
    });
  });

  describe('Bilingual Support', () => {
    it('should support bilingual content creation', async () => {
      // Create bilingual scenario
      const { english, french } = await testScenarios.bilingual();

      // Verify English content
      expect(english.teacher.preferredLanguage).toBe('en');
      expect(english.expectations[0].description).toBeTruthy();
      
      // Verify French content
      expect(french.teacher.preferredLanguage).toBe('fr');
      expect(french.expectations[0].descriptionFr).toBeTruthy();

      // Test bilingual lesson plan
      const context = getTestContext();
      const bilingualLesson = await context.factory.lessonPlanFactory.create({
        userId: english.teacher.id,
        title: 'Bilingual Math Lesson',
        titleFr: 'Leçon de mathématiques bilingue',
        mindsOn: 'English introduction',
        mindsOnFr: 'Introduction en français',
      });

      expect(bilingualLesson.titleFr).toBe('Leçon de mathématiques bilingue');
    });
  });

  describe('Performance at Scale', () => {
    it('should handle realistic data volumes efficiently', async () => {
      const startTime = Date.now();

      // Create performance test data
      const context = getTestContext();
      const data = await context.factory.createPerformanceTestData('small');

      const creationTime = Date.now() - startTime;
      expect(creationTime).toBeLessThan(10000); // Should complete in under 10 seconds

      // Test query performance
      const queryStart = Date.now();
      
      const results = await prisma.longRangePlan.findMany({
        where: {
          userId: { in: data.users.slice(0, 5).map(u => u.id) },
        },
        include: {
          expectations: {
            include: {
              expectation: true,
            },
          },
        },
      });

      const queryTime = Date.now() - queryStart;
      expect(queryTime).toBeLessThan(1000); // Query should complete in under 1 second
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      const scenario = await testScenarios.teacherWithPlans();

      // Attempt to delete user with cascade
      await prisma.user.delete({
        where: { id: scenario.teacher.id },
      });

      // Verify cascade deletion
      const orphanedPlans = await prisma.longRangePlan.findMany({
        where: { userId: scenario.teacher.id },
      });

      expect(orphanedPlans).toHaveLength(0);

      // Verify expectations still exist (not cascade deleted)
      const expectations = await prisma.curriculumExpectation.findMany({
        where: {
          id: { in: scenario.expectations.map(e => e.id) },
        },
      });

      expect(expectations).toHaveLength(scenario.expectations.length);
    });

    it('should enforce business rules through database constraints', async () => {
      const user = await testScenarios.minimal();

      // Test date range constraint
      await expect(
        prisma.unitPlan.create({
          data: {
            userId: user.user.id,
            longRangePlanId: 'invalid-id',
            title: 'Invalid Unit',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-05-01'), // End before start
          },
        })
      ).rejects.toThrow();
    });
  });
});