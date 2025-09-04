/**
 * TDD Test Suite for In-Lesson Quick Assessment Grid API
 * Issue #312: In-Lesson Quick Assessment Grid (4-Level NOT_YET/APPROACHING/MEETING/EXCEEDING)
 * 
 * Core Workflow: Assess → Group → Plan
 * Uses existing Assessment model with evidenceType: 'OBSERVATION'
 */

import request from 'supertest';
import { app } from '../../app';
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

const prisma = new PrismaClient();

describe('Quick Assessment Grid API - TDD RED Phase', () => {
  let authToken: string;
  let teacherId: number;
  let lessonId: string;
  let studentIds: number[] = [];
  let expectationId: string;

  beforeAll(async () => {
    // Setup test teacher
    const teacher = await prisma.user.create({
      data: {
        email: 'emily.mcisaac@test.com',
        name: 'Emily McIsaac',
        passwordHash: 'hashed_password',
        role: 'TEACHER'
      }
    });
    teacherId = teacher.id;
    authToken = sign({ userId: teacher.id }, process.env.JWT_SECRET || 'test-secret');

    // Create test students (25 students for Grade 1 class)
    const studentPromises = Array.from({ length: 25 }, (_, i) => 
      prisma.user.create({
        data: {
          email: `student${i + 1}@test.com`,
          name: `Student ${i + 1}`,
          passwordHash: 'hashed',
          role: 'STUDENT'
        }
      })
    );
    const students = await Promise.all(studentPromises);
    studentIds = students.map(s => s.id);

    // Create test curriculum expectation
    const expectation = await prisma.curriculumExpectation.create({
      data: {
        code: 'MATH.1.NS.2',
        description: 'Count by 2s to 20',
        subject: 'Mathématiques',
        grade: '1',
        strand: 'Number Sense',
        subStrand: 'Counting'
      }
    });
    expectationId = expectation.id;

    // Create test lesson
    const lesson = await prisma.eTFOLessonPlan.create({
      data: {
        title: 'Counting by 2s',
        subject: 'Mathématiques',
        gradeLevel: '1',
        duration: 45,
        objectives: ['Students will count by 2s up to 20'],
        materials: ['Number line', 'Counting blocks'],
        activities: ['Introduction', 'Guided practice', 'Independent work'],
        assessment: 'Quick check observation',
        reflection: '',
        isAIGenerated: false,
        isApproved: true,
        status: 'APPROVED',
        userId: teacherId,
        expectations: {
          connect: [{ id: expectationId }]
        }
      }
    });
    lessonId = lesson.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up assessments before each test
    await prisma.assessment.deleteMany({});
  });

  describe('POST /api/quick-assessments/batch - Quick Assess All Students', () => {
    it('should create assessments for all 25 students in ≤90 seconds', async () => {
      const assessments = studentIds.map((studentId, index) => {
        // Simulate realistic distribution
        let level = 'MEETING';
        if (index < 5) level = 'NOT_YET';
        else if (index < 13) level = 'APPROACHING';
        else if (index < 23) level = 'MEETING';
        else level = 'EXCEEDING';

        return {
          studentId,
          level,
          lessonId,
          expectationId
        };
      });

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/quick-assessments/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assessments,
          evidenceType: 'OBSERVATION',
          notes: 'Quick check during guided practice'
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(201);
      expect(response.body.created).toBe(25);
      expect(responseTime).toBeLessThan(90000); // Must complete in < 90 seconds

      // Verify all assessments created
      const createdAssessments = await prisma.assessment.findMany({
        where: { lessonId }
      });
      expect(createdAssessments).toHaveLength(25);
    });

    it('should use 4-level marking system', async () => {
      const validLevels = ['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING'];
      
      const assessments = validLevels.map((level, index) => ({
        studentId: studentIds[index],
        level,
        lessonId,
        expectationId
      }));

      const response = await request(app)
        .post('/api/quick-assessments/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ assessments });

      expect(response.status).toBe(201);

      // Verify levels are stored correctly
      for (const assessment of assessments) {
        const saved = await prisma.assessment.findFirst({
          where: {
            studentId: assessment.studentId,
            lessonId: assessment.lessonId
          }
        });
        expect(saved?.achievementLevel).toBe(assessment.level);
      }
    });

    it('should reject invalid achievement levels', async () => {
      const response = await request(app)
        .post('/api/quick-assessments/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assessments: [{
            studentId: studentIds[0],
            level: 'INVALID_LEVEL',
            lessonId,
            expectationId
          }]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid achievement level');
    });

    it('should support keyboard shortcuts mapping', async () => {
      // Test that API accepts numeric shortcuts that map to levels
      const assessments = [
        { studentId: studentIds[0], level: 1, lessonId, expectationId }, // NOT_YET
        { studentId: studentIds[1], level: 2, lessonId, expectationId }, // APPROACHING
        { studentId: studentIds[2], level: 3, lessonId, expectationId }, // MEETING
        { studentId: studentIds[3], level: 4, lessonId, expectationId }, // EXCEEDING
      ];

      const response = await request(app)
        .post('/api/quick-assessments/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          assessments,
          mapNumericLevels: true 
        });

      expect(response.status).toBe(201);

      // Verify mapping
      const saved = await prisma.assessment.findMany({
        where: { lessonId },
        orderBy: { studentId: 'asc' }
      });

      expect(saved[0].achievementLevel).toBe('NOT_YET');
      expect(saved[1].achievementLevel).toBe('APPROACHING');
      expect(saved[2].achievementLevel).toBe('MEETING');
      expect(saved[3].achievementLevel).toBe('EXCEEDING');
    });
  });

  describe('POST /api/quick-assessments/groups - Auto-Generate Differentiation Groups', () => {
    beforeEach(async () => {
      // Create assessments with distribution
      const assessments = studentIds.map((studentId, index) => {
        let level = 'MEETING';
        if (index < 5) level = 'NOT_YET';
        else if (index < 13) level = 'APPROACHING';
        else if (index < 23) level = 'MEETING';
        else level = 'EXCEEDING';

        return prisma.assessment.create({
          data: {
            studentId,
            achievementLevel: level,
            evidenceType: 'OBSERVATION',
            lessonId,
            expectationId,
            date: new Date(),
            notes: 'Quick check'
          }
        });
      });
      await Promise.all(assessments);
    });

    it('should generate differentiation groups based on assessment results', async () => {
      const response = await request(app)
        .post('/api/quick-assessments/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lessonId,
          expectationId
        });

      expect(response.status).toBe(200);
      expect(response.body.groups).toBeDefined();
      
      const { groups } = response.body;
      
      // Should have 4 groups
      expect(groups.reteaching).toBeDefined();
      expect(groups.support).toBeDefined();
      expect(groups.independent).toBeDefined();
      expect(groups.extension).toBeDefined();

      // Verify group sizes match our distribution
      expect(groups.reteaching.students).toHaveLength(5); // NOT_YET
      expect(groups.support.students).toHaveLength(8); // APPROACHING
      expect(groups.independent.students).toHaveLength(10); // MEETING
      expect(groups.extension.students).toHaveLength(2); // EXCEEDING

      // Each group should have suggested activities
      expect(groups.reteaching.suggestedActivities).toBeDefined();
      expect(groups.support.suggestedActivities).toBeDefined();
      expect(groups.independent.suggestedActivities).toBeDefined();
      expect(groups.extension.suggestedActivities).toBeDefined();
    });

    it('should save groups for tomorrow\'s planning', async () => {
      const response = await request(app)
        .post('/api/quick-assessments/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lessonId,
          expectationId,
          saveForTomorrow: true
        });

      expect(response.status).toBe(200);
      expect(response.body.savedGroupId).toBeDefined();

      // Verify groups are saved and linked to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const savedGroups = await prisma.differentiationGroups.findUnique({
        where: { id: response.body.savedGroupId }
      });

      expect(savedGroups).toBeDefined();
      expect(savedGroups?.targetDate.toDateString()).toBe(tomorrow.toDateString());
    });

    it('should integrate with existing Daybook reflection', async () => {
      // Create today's daybook entry
      const today = new Date();
      const daybookEntry = await prisma.daybookEntry.create({
        data: {
          date: today,
          userId: teacherId,
          quickNotes: 'Morning went well.',
          reflections: {}
        }
      });

      const response = await request(app)
        .post('/api/quick-assessments/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lessonId,
          expectationId,
          addToDaybook: true
        });

      expect(response.status).toBe(200);

      // Verify daybook was updated
      const updatedDaybook = await prisma.daybookEntry.findUnique({
        where: { id: daybookEntry.id }
      });

      expect(updatedDaybook?.quickNotes).toContain('Math: 5 need reteaching skip counting');
      expect(updatedDaybook?.quickNotes).toContain('12 meeting expectations');
    });
  });

  describe('GET /api/quick-assessments/grid/:lessonId - Get Assessment Grid Data', () => {
    beforeEach(async () => {
      // Create some assessments
      const assessments = studentIds.slice(0, 5).map((studentId, index) => 
        prisma.assessment.create({
          data: {
            studentId,
            achievementLevel: ['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING', 'MEETING'][index],
            evidenceType: 'OBSERVATION',
            lessonId,
            expectationId,
            date: new Date(),
            notes: `Student ${index + 1} assessment`
          }
        })
      );
      await Promise.all(assessments);
    });

    it('should return grid data in 5x5 format for 25 students', async () => {
      const response = await request(app)
        .get(`/api/quick-assessments/grid/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.grid).toBeDefined();
      expect(response.body.grid).toHaveLength(5); // 5 rows
      expect(response.body.grid[0]).toHaveLength(5); // 5 columns

      // Each cell should have student info and assessment status
      const firstCell = response.body.grid[0][0];
      expect(firstCell).toHaveProperty('studentId');
      expect(firstCell).toHaveProperty('studentName');
      expect(firstCell).toHaveProperty('assessmentLevel');
    });

    it('should include visual summary on lesson card', async () => {
      const response = await request(app)
        .get(`/api/quick-assessments/summary/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.distribution).toEqual({
        NOT_YET: expect.any(Number),
        APPROACHING: expect.any(Number),
        MEETING: expect.any(Number),
        EXCEEDING: expect.any(Number)
      });
      expect(response.body.visualIndicator).toBeDefined(); // For UI rendering
    });
  });

  describe('PUT /api/quick-assessments/:assessmentId - Update Individual Assessment', () => {
    let assessmentId: string;

    beforeEach(async () => {
      const assessment = await prisma.assessment.create({
        data: {
          studentId: studentIds[0],
          achievementLevel: 'APPROACHING',
          evidenceType: 'OBSERVATION',
          lessonId,
          expectationId,
          date: new Date(),
          notes: 'Initial assessment'
        }
      });
      assessmentId = assessment.id;
    });

    it('should update assessment level with optimistic UI support', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .put(`/api/quick-assessments/${assessmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          achievementLevel: 'MEETING'
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(100); // Fast for optimistic UI
      expect(response.body.achievementLevel).toBe('MEETING');

      // Verify persistence
      const updated = await prisma.assessment.findUnique({
        where: { id: assessmentId }
      });
      expect(updated?.achievementLevel).toBe('MEETING');
    });

    it('should support arrow key navigation updates', async () => {
      // Simulate arrow key navigation with batch updates
      const updates = [
        { assessmentId, direction: 'up' }, // Move up in grid
        { assessmentId, direction: 'right' }, // Move right
      ];

      for (const update of updates) {
        const response = await request(app)
          .put(`/api/quick-assessments/${update.assessmentId}/navigate`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ direction: update.direction });

        expect(response.status).toBe(200);
        expect(response.body.focusedStudentId).toBeDefined();
      }
    });
  });

  describe('Offline Support and Sync', () => {
    it('should accept offline queue sync when reconnected', async () => {
      const offlineAssessments = studentIds.slice(0, 5).map((studentId, index) => ({
        studentId,
        level: 'MEETING',
        lessonId,
        expectationId,
        clientTimestamp: new Date().toISOString(),
        clientId: `offline-${index}` // Client-generated ID for deduplication
      }));

      const response = await request(app)
        .post('/api/quick-assessments/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          offlineQueue: offlineAssessments
        });

      expect(response.status).toBe(200);
      expect(response.body.synced).toBe(5);
      expect(response.body.conflicts).toEqual([]);
    });

    it('should handle conflict resolution for offline changes', async () => {
      // Create an assessment
      const assessment = await prisma.assessment.create({
        data: {
          studentId: studentIds[0],
          achievementLevel: 'APPROACHING',
          evidenceType: 'OBSERVATION',
          lessonId,
          expectationId,
          date: new Date(),
          updatedAt: new Date(Date.now() - 10000) // 10 seconds ago
        }
      });

      // Simulate offline change that conflicts
      const response = await request(app)
        .post('/api/quick-assessments/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          offlineQueue: [{
            assessmentId: assessment.id,
            studentId: studentIds[0],
            level: 'MEETING',
            lessonId,
            expectationId,
            clientTimestamp: new Date(Date.now() - 5000).toISOString() // 5 seconds ago
          }],
          resolveConflicts: 'client' // or 'server' or 'newest'
        });

      expect(response.status).toBe(200);
      expect(response.body.conflicts).toHaveLength(1);
      expect(response.body.resolved).toHaveLength(1);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle 25 simultaneous updates efficiently', async () => {
      // Create assessments for all students
      const createPromises = studentIds.map(studentId =>
        prisma.assessment.create({
          data: {
            studentId,
            achievementLevel: 'NOT_YET',
            evidenceType: 'OBSERVATION',
            lessonId,
            expectationId,
            date: new Date()
          }
        })
      );
      const assessments = await Promise.all(createPromises);

      // Simulate all being updated at once
      const startTime = Date.now();
      
      const updatePromises = assessments.map(assessment =>
        request(app)
          .put(`/api/quick-assessments/${assessment.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ achievementLevel: 'MEETING' })
      );

      const responses = await Promise.all(updatePromises);
      const totalTime = Date.now() - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete reasonably quickly
      expect(totalTime).toBeLessThan(5000); // 5 seconds for 25 updates
    });

    it('should return assessment grid data within 2 seconds', async () => {
      // Create full class assessments
      await Promise.all(
        studentIds.map(studentId =>
          prisma.assessment.create({
            data: {
              studentId,
              achievementLevel: 'MEETING',
              evidenceType: 'OBSERVATION',
              lessonId,
              expectationId,
              date: new Date()
            }
          })
        )
      );

      const startTime = Date.now();
      
      const response = await request(app)
        .get(`/api/quick-assessments/grid/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000);
    });
  });

  describe('Integration with Existing Assessment Model', () => {
    it('should use evidenceType: OBSERVATION for all quick checks', async () => {
      const response = await request(app)
        .post('/api/quick-assessments/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assessments: [{
            studentId: studentIds[0],
            level: 'MEETING',
            lessonId,
            expectationId
          }]
        });

      expect(response.status).toBe(201);

      const assessment = await prisma.assessment.findFirst({
        where: { studentId: studentIds[0], lessonId }
      });

      expect(assessment?.evidenceType).toBe('OBSERVATION');
    });

    it('should be compatible with existing assessment queries', async () => {
      // Create quick assessment
      await request(app)
        .post('/api/quick-assessments/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assessments: [{
            studentId: studentIds[0],
            level: 'MEETING',
            lessonId,
            expectationId
          }]
        });

      // Should be accessible through regular assessment endpoint
      const response = await request(app)
        .get('/api/assessments')
        .query({
          studentId: studentIds[0],
          lessonId
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.assessments).toHaveLength(1);
      expect(response.body.assessments[0].evidenceType).toBe('OBSERVATION');
    });
  });

  describe('Visual Indicators and UI Support', () => {
    it('should provide emoji indicators for levels', async () => {
      const response = await request(app)
        .get('/api/quick-assessments/indicators')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        NOT_YET: '⭕',
        APPROACHING: '🟡',
        MEETING: '🟢',
        EXCEEDING: '⭐'
      });
    });

    it('should calculate distribution for visual summary', async () => {
      // Create assessments with known distribution
      await Promise.all([
        ...Array(5).fill(null).map((_, i) =>
          prisma.assessment.create({
            data: {
              studentId: studentIds[i],
              achievementLevel: 'NOT_YET',
              evidenceType: 'OBSERVATION',
              lessonId,
              expectationId,
              date: new Date()
            }
          })
        ),
        ...Array(8).fill(null).map((_, i) =>
          prisma.assessment.create({
            data: {
              studentId: studentIds[i + 5],
              achievementLevel: 'APPROACHING',
              evidenceType: 'OBSERVATION',
              lessonId,
              expectationId,
              date: new Date()
            }
          })
        ),
        ...Array(10).fill(null).map((_, i) =>
          prisma.assessment.create({
            data: {
              studentId: studentIds[i + 13],
              achievementLevel: 'MEETING',
              evidenceType: 'OBSERVATION',
              lessonId,
              expectationId,
              date: new Date()
            }
          })
        ),
        ...Array(2).fill(null).map((_, i) =>
          prisma.assessment.create({
            data: {
              studentId: studentIds[i + 23],
              achievementLevel: 'EXCEEDING',
              evidenceType: 'OBSERVATION',
              lessonId,
              expectationId,
              date: new Date()
            }
          })
        )
      ]);

      const response = await request(app)
        .get(`/api/quick-assessments/distribution/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        total: 25,
        distribution: {
          NOT_YET: { count: 5, percentage: 20 },
          APPROACHING: { count: 8, percentage: 32 },
          MEETING: { count: 10, percentage: 40 },
          EXCEEDING: { count: 2, percentage: 8 }
        },
        summary: 'Math: 5 need reteaching skip counting, 12 meeting expectations'
      });
    });
  });
});