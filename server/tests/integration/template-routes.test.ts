import request from 'supertest';
import { describe, beforeAll, beforeEach, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';
import bcrypt from 'bcryptjs';

describe('Template Routes', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  let authToken: string;
  let testUserId: number;
  let testTemplateId: string;
  let systemTemplateId: string;
  let publicTemplateId: string;

  beforeAll(async () => {
    prisma = getTestPrismaClient();
  });

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: hashedPassword,
        name: 'Test Teacher',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });
    testUserId = testUser.id;

    // Create another user for public template testing
    const otherUser = await prisma.user.create({
      data: {
        email: `other-${Date.now()}@example.com`,
        password: hashedPassword,
        name: 'Other Teacher',
        role: 'teacher',
      },
    });

    // Create system template
    const systemTemplate = await prisma.planTemplate.create({
      data: {
        title: 'System Math Unit Template',
        titleFr: 'Modèle d\'unité de mathématiques système',
        description: 'A comprehensive math unit template',
        type: 'UNIT_PLAN',
        category: 'BY_SUBJECT',
        subject: 'Mathematics',
        gradeMin: 3,
        gradeMax: 5,
        isSystem: true,
        isPublic: false,
        createdByUserId: testUserId,
        tags: ['math', 'unit', 'system'],
        keywords: ['mathematics', 'numbers', 'operations'],
        content: {
          overview: 'Math unit overview',
          learningGoals: ['Goal 1', 'Goal 2'],
          bigIdeas: 'Understanding numbers',
        },
        estimatedWeeks: 4,
      },
    });
    systemTemplateId = systemTemplate.id;

    // Create public template by other user
    const publicTemplate = await prisma.planTemplate.create({
      data: {
        title: 'Public Science Lesson',
        description: 'A shareable science lesson template',
        type: 'LESSON_PLAN',
        category: 'BY_SUBJECT',
        subject: 'Science',
        gradeMin: 3,
        gradeMax: 4,
        isSystem: false,
        isPublic: true,
        createdByUserId: otherUser.id,
        tags: ['science', 'experiment'],
        content: {
          objectives: ['Objective 1'],
          materials: ['Materials list'],
          mindsOn: 'Science warm-up',
        },
        estimatedMinutes: 60,
      },
    });
    publicTemplateId = publicTemplate.id;

    // Create private template for test user
    const privateTemplate = await prisma.planTemplate.create({
      data: {
        title: 'My Private Template',
        description: 'Personal template',
        type: 'LESSON_PLAN',
        category: 'CUSTOM',
        isSystem: false,
        isPublic: false,
        createdByUserId: testUserId,
        content: {
          objectives: ['Private objective'],
        },
      },
    });
    testTemplateId = privateTemplate.id;

    // Login to get auth token
    const loginRes = await request(app).post('/api/login').send({
      email: testUser.email,
      password: 'test123',
    });
    authToken = loginRes.body.accessToken;
  });

  describe('GET /api/templates', () => {
    it('should get all accessible templates', async () => {
      const res = await request(app)
        .get('/api/templates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('templates');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.templates)).toBe(true);
      expect(res.body.templates.length).toBeGreaterThanOrEqual(3); // System, public, and user's own
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/templates?type=UNIT_PLAN')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.templates.every((t: any) => t.type === 'UNIT_PLAN')).toBe(true);
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/api/templates?category=BY_SUBJECT')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.templates.every((t: any) => t.category === 'BY_SUBJECT')).toBe(true);
    });

    it('should filter by subject', async () => {
      const res = await request(app)
        .get('/api/templates?subject=Mathematics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.templates.every((t: any) => t.subject === 'Mathematics')).toBe(true);
    });

    it('should filter by grade range', async () => {
      const res = await request(app)
        .get('/api/templates?gradeMin=3&gradeMax=4')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.templates.forEach((template: any) => {
        if (template.gradeMin) expect(template.gradeMin).toBeLessThanOrEqual(4);
        if (template.gradeMax) expect(template.gradeMax).toBeGreaterThanOrEqual(3);
      });
    });

    it('should search by text', async () => {
      const res = await request(app)
        .get('/api/templates?search=math')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.templates.some((t: any) => 
        t.title.toLowerCase().includes('math') || 
        t.description?.toLowerCase().includes('math')
      )).toBe(true);
    });

    it('should filter by tags', async () => {
      const res = await request(app)
        .get('/api/templates?tags=math&tags=unit')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.templates.some((t: any) => 
        t.tags?.includes('math') && t.tags?.includes('unit')
      )).toBe(true);
    });

    it('should handle pagination', async () => {
      const res = await request(app)
        .get('/api/templates?limit=2&offset=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.templates.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.offset).toBe(1);
    });

    it('should sort templates', async () => {
      const res = await request(app)
        .get('/api/templates?sortBy=title&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      const titles = res.body.templates.map((t: any) => t.title);
      const sortedTitles = [...titles].sort();
      expect(titles).toEqual(sortedTitles);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/templates');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should get specific template', async () => {
      const res = await request(app)
        .get(`/api/templates/${testTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testTemplateId);
      expect(res.body).toHaveProperty('title', 'My Private Template');
      expect(res.body).toHaveProperty('createdByUser');
      expect(res.body).toHaveProperty('_count');
    });

    it('should get system template', async () => {
      const res = await request(app)
        .get(`/api/templates/${systemTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('isSystem', true);
    });

    it('should get public template', async () => {
      const res = await request(app)
        .get(`/api/templates/${publicTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('isPublic', true);
    });

    it('should return 404 for inaccessible template', async () => {
      // Create private template by another user
      const otherPrivate = await prisma.planTemplate.create({
        data: {
          title: 'Other Private',
          type: 'LESSON_PLAN',
          category: 'CUSTOM',
          isSystem: false,
          isPublic: false,
          createdByUserId: 999999,
          content: {},
        },
      });

      const res = await request(app)
        .get(`/api/templates/${otherPrivate.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/templates', () => {
    it('should create new template', async () => {
      const templateData = {
        title: 'New Unit Template',
        titleFr: 'Nouveau modèle d\'unité',
        description: 'A new template for testing',
        descriptionFr: 'Un nouveau modèle pour les tests',
        type: 'UNIT_PLAN',
        category: 'BY_THEME',
        subject: 'Social Studies',
        gradeMin: 4,
        gradeMax: 6,
        tags: ['social', 'community'],
        keywords: ['society', 'culture'],
        isPublic: true,
        estimatedWeeks: 3,
        content: {
          overview: 'Unit overview',
          learningGoals: ['Understand community', 'Explore cultures'],
          bigIdeas: 'Communities shape our world',
          essentialQuestions: ['What makes a community?'],
        },
        unitStructure: {
          phases: [
            {
              name: 'Introduction',
              description: 'Getting started',
              estimatedDays: 3,
              learningGoals: ['Initial understanding'],
            },
          ],
        },
      };

      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', templateData.title);
      expect(res.body).toHaveProperty('type', templateData.type);
      expect(res.body).toHaveProperty('createdByUserId', testUserId);
      expect(res.body).toHaveProperty('tags');
      expect(res.body.tags).toEqual(templateData.tags);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Missing required title',
        });

      expect(res.status).toBe(400);
    });

    it('should validate grade range', async () => {
      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Grade Range',
          type: 'LESSON_PLAN',
          category: 'BY_GRADE',
          gradeMin: 6,
          gradeMax: 3, // Min > Max
          content: {},
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Minimum grade cannot be greater than maximum grade');
    });

    it('should prevent HTML in title', async () => {
      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '<script>alert("XSS")</script>',
          type: 'LESSON_PLAN',
          category: 'CUSTOM',
          content: {},
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update own template', async () => {
      const updateData = {
        title: 'Updated Template Title',
        description: 'Updated description',
        tags: ['updated', 'modified'],
        isPublic: true,
      };

      const res = await request(app)
        .put(`/api/templates/${testTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', updateData.title);
      expect(res.body).toHaveProperty('description', updateData.description);
      expect(res.body).toHaveProperty('isPublic', true);
    });

    it('should not update system template', async () => {
      const res = await request(app)
        .put(`/api/templates/${systemTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Try to update system',
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Template not found or not editable');
    });

    it('should not update another user\'s template', async () => {
      const res = await request(app)
        .put(`/api/templates/${publicTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Try to update others',
        });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/templates/:id', () => {
    it('should delete own template', async () => {
      const res = await request(app)
        .delete(`/api/templates/${testTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      // Verify deletion
      const deleted = await prisma.planTemplate.findUnique({
        where: { id: testTemplateId },
      });
      expect(deleted).toBeNull();
    });

    it('should not delete system template', async () => {
      const res = await request(app)
        .delete(`/api/templates/${systemTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Template not found or not deletable');
    });

    it('should not delete another user\'s template', async () => {
      const res = await request(app)
        .delete(`/api/templates/${publicTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/templates/:id/duplicate', () => {
    it('should duplicate accessible template', async () => {
      const res = await request(app)
        .post(`/api/templates/${systemTemplateId}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My Copy of System Template',
          isPublic: false,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.id).not.toBe(systemTemplateId);
      expect(res.body).toHaveProperty('title', 'My Copy of System Template');
      expect(res.body).toHaveProperty('isSystem', false);
      expect(res.body).toHaveProperty('createdByUserId', testUserId);
    });

    it('should duplicate with default title', async () => {
      const res = await request(app)
        .post(`/api/templates/${publicTemplateId}/duplicate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', 'Public Science Lesson (Copy)');
    });

    it('should return 404 for inaccessible template', async () => {
      const res = await request(app)
        .post('/api/templates/non-existent/duplicate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/templates/:id/apply', () => {
    it('should apply template and track usage', async () => {
      const customizations = {
        title: 'Customized Lesson',
        duration: 75,
      };

      const res = await request(app)
        .post(`/api/templates/${systemTemplateId}/apply`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ customizations });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('template');
      expect(res.body).toHaveProperty('appliedContent');
      expect(res.body.appliedContent).toMatchObject(customizations);

      // Verify usage count increased
      const updated = await prisma.planTemplate.findUnique({
        where: { id: systemTemplateId },
      });
      expect(updated?.usageCount).toBe(1);
      expect(updated?.lastUsedAt).toBeTruthy();
    });

    it('should merge customizations with template content', async () => {
      const res = await request(app)
        .post(`/api/templates/${systemTemplateId}/apply`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          customizations: {
            customField: 'Custom value',
            overview: 'Overridden overview',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.appliedContent).toHaveProperty('customField', 'Custom value');
      expect(res.body.appliedContent).toHaveProperty('overview', 'Overridden overview');
      expect(res.body.appliedContent).toHaveProperty('learningGoals'); // Original content preserved
    });
  });

  describe('POST /api/templates/:id/rate', () => {
    it('should rate a template', async () => {
      const res = await request(app)
        .post(`/api/templates/${publicTemplateId}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 5,
          comment: 'Excellent template!',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('rating', 5);
      expect(res.body).toHaveProperty('comment', 'Excellent template!');
      expect(res.body).toHaveProperty('userId', testUserId);

      // Verify average rating updated
      const updated = await prisma.planTemplate.findUnique({
        where: { id: publicTemplateId },
      });
      expect(updated?.averageRating).toBe(5);
    });

    it('should update existing rating', async () => {
      // First rating
      await request(app)
        .post(`/api/templates/${publicTemplateId}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 3 });

      // Update rating
      const res = await request(app)
        .post(`/api/templates/${publicTemplateId}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 4,
          comment: 'Updated rating',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('rating', 4);

      // Verify only one rating exists
      const ratings = await prisma.templateRating.findMany({
        where: { templateId: publicTemplateId },
      });
      expect(ratings.length).toBe(1);
    });

    it('should validate rating range', async () => {
      const res = await request(app)
        .post(`/api/templates/${publicTemplateId}/rate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ rating: 6 });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Rating must be between 1 and 5');
    });
  });

  describe('GET /api/templates/metadata/options', () => {
    it('should get filter options', async () => {
      const res = await request(app)
        .get('/api/templates/metadata/options')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('subjects');
      expect(res.body).toHaveProperty('grades');
      expect(res.body).toHaveProperty('categories');
      expect(res.body).toHaveProperty('tags');
      expect(Array.isArray(res.body.subjects)).toBe(true);
      expect(res.body.subjects).toContain('Mathematics');
      expect(res.body.subjects).toContain('Science');
      expect(Array.isArray(res.body.grades)).toBe(true);
      expect(Array.isArray(res.body.tags)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/templates/metadata/options');
      expect(res.status).toBe(401);
    });
  });
});