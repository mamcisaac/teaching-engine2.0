/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TDD Integration Test Setup
 * Uses real file-based SQLite or PostgreSQL database
 * Tests full application stack with real implementations
 */

import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { RealTestDatabase } from '../database/real-test-database';
import { PrismaClient } from '@teaching-engine/database';
import { resetRateLimiterState } from '../../src/middleware/rateLimiter';

// Create test database instance
const testDb = new RealTestDatabase({
  type: process.env.CI ? 'postgresql' : 'sqlite-file',
});

let testClient: PrismaClient;
const workerId = process.env.JEST_WORKER_ID || 'integration-test';

beforeAll(async () => {
  console.log(`[TDD Integration Setup] Initializing database for worker ${workerId}`);
  
  try {
    // Initialize real database
    testClient = await testDb.initialize(workerId);
    
    // Set global test client
    const globalForPrisma = globalThis as unknown as {
      testPrismaClient: PrismaClient | undefined;
    };
    globalForPrisma.testPrismaClient = testClient;
    
    // Seed initial data for integration tests
    await seedIntegrationData();
    
    console.log(`[TDD Integration Setup] Database ready with test data`);
  } catch (_error) {
    console.error('[TDD Integration Setup] Failed to initialize:', error);
    throw error;
  }
});

beforeEach(async () => {
  // Reset rate limiter state
  resetRateLimiterState();
  
  // Note: We don't clean data between tests in integration suite
  // This allows testing data persistence and relationships
});

afterAll(async () => {
  console.log(`[TDD Integration Setup] Cleaning up integration test database`);
  
  try {
    await testDb.cleanup(workerId);
    
    const globalForPrisma = globalThis as unknown as {
      testPrismaClient: PrismaClient | undefined;
    };
    globalForPrisma.testPrismaClient = undefined;
  } catch (_error) {
    console.error('[TDD Integration Setup] Cleanup error:', error);
  }
});

/**
 * Seed comprehensive test data for integration tests
 */
async function seedIntegrationData() {
  // Create multiple users with different roles
  const teacher = await testClient.user.create({
    data: {
      email: 'teacher@school.com',
      password: '$2b$10$K8KpV4kPL5M6RjJmSWHPe.qVUkjAGkGpVwMfKjWpRGsRkMm8TmDZm',
      name: 'Ms. Johnson',
      role: 'USER',
    },
  });

  const admin = await testClient.user.create({
    data: {
      email: 'admin@school.com',
      password: '$2b$10$K8KpV4kPL5M6RjJmSWHPe.qVUkjAGkGpVwMfKjWpRGsRkMm8TmDZm',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  // Create subjects
  const subjects = await Promise.all([
    testClient.subject.create({
      data: { name: 'Mathematics', code: 'MATH', userId: teacher.id },
    }),
    testClient.subject.create({
      data: { name: 'Science', code: 'SCI', userId: teacher.id },
    }),
    testClient.subject.create({
      data: { name: 'Language Arts', code: 'LA', userId: teacher.id },
    }),
  ]);

  // Create students
  const students = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      testClient.student.create({
        data: {
          firstName: `Student${i + 1}`,
          lastName: 'Test',
          grade: 5 + (i % 3),
          userId: teacher.id,
        },
      })
    )
  );

  // Create curriculum expectations
  const expectations = await Promise.all(
    subjects.flatMap((subject, sIdx) =>
      Array.from({ length: 10 }, (_, i) =>
        testClient.curriculumExpectation.create({
          data: {
            code: `${subject.code}.${i + 1}`,
            description: `${subject.name} expectation ${i + 1}`,
            subject: subject.name,
            grade: 5 + (i % 3),
            strand: `Strand ${(i % 3) + 1}`,
          },
        })
      )
    )
  );

  // Create planning hierarchy
  const longRangePlan = await testClient.longRangePlan.create({
    data: {
      title: 'Fall Semester Math Plan',
      subject: 'Mathematics',
      grade: 5,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-20'),
      userId: teacher.id,
    },
  });

  const unitPlan = await testClient.unitPlan.create({
    data: {
      title: 'Number Sense and Numeration',
      subject: 'Mathematics',
      grade: 5,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-10-15'),
      userId: teacher.id,
      longRangePlanId: longRangePlan.id,
    },
  });

  const lessonPlan = await testClient.eTFOLessonPlan.create({
    data: {
      title: 'Introduction to Fractions',
      subject: 'Mathematics',
      grade: 5,
      date: new Date('2024-09-15'),
      duration: 60,
      threePartLesson: {
        minds_on: 'Pizza fraction activity',
        action: 'Fraction manipulation with tiles',
        consolidation: 'Exit ticket - identify fractions',
      },
      learningGoals: [
        'Understand fractions as parts of a whole',
        'Identify and create simple fractions',
      ],
      successCriteria: [
        'I can explain what a fraction represents',
        'I can create fractions using manipulatives',
      ],
      materials: ['Fraction tiles', 'Pizza models', 'Whiteboards'],
      accommodations: 'Visual supports, peer helpers',
      assessmentStrategies: 'Observation, exit tickets',
      evaluationTools: 'Anecdotal notes, checklist',
      teachingStrategies: 'Direct instruction, guided practice',
      userId: teacher.id,
      unitPlanId: unitPlan.id,
    },
  });

  console.log('[TDD Integration Setup] Seeded test data:', {
    users: 2,
    subjects: subjects.length,
    students: students.length,
    expectations: expectations.length,
    plans: { longRange: 1, unit: 1, lesson: 1 },
  });

  return {
    teacher,
    admin,
    subjects,
    students,
    expectations,
    longRangePlan,
    unitPlan,
    lessonPlan,
  };
}

// Export utilities
export function getIntegrationTestClient(): PrismaClient {
  if (!testClient) {
    throw new Error('Integration test client not initialized');
  }
  return testClient;
}

export { testDb as integrationTestDb };