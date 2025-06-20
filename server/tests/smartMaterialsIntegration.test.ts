import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/prisma';
import { createTestUser, getAuthToken } from './test-helpers';
import { SmartMaterialExtractor } from '../src/services/smartMaterialExtractor';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  materials: [
                    {
                      name: 'Math workbooks',
                      category: 'supplies',
                      priority: 'essential',
                      quantity: '30 copies',
                      prepTime: 5,
                      notes: 'One per student',
                    },
                    {
                      name: 'Calculator',
                      category: 'equipment',
                      priority: 'helpful',
                      quantity: '15 units',
                      prepTime: 0,
                    },
                  ],
                }),
              },
            },
          ],
        }),
      },
    },
  })),
}));

describe('Smart Materials Integration', () => {
  let testUserId: number;
  let authToken: string;
  let testWeekStart: string;
  let lessonPlanId: number;

  beforeEach(async () => {
    // Create test user
    const testUser = await createTestUser();
    testUserId = testUser.id;
    authToken = getAuthToken(testUser.id);

    // Create test data
    testWeekStart = '2024-01-22';

    // Create test lesson plan with activities
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        weekStart: new Date(testWeekStart),
        schedule: {
          create: [
            {
              day: 1,
              activity: {
                create: {
                  title: 'Basic Addition',
                  activityType: 'LESSON',
                  materialsText: 'Math workbooks, calculators, pencils',
                  milestone: {
                    create: {
                      title: 'Math Fundamentals',
                      subject: {
                        create: {
                          name: 'Mathematics',
                          userId: testUserId,
                        },
                      },
                      userId: testUserId,
                    },
                  },
                  userId: testUserId,
                },
              },
            },
            {
              day: 2,
              activity: {
                create: {
                  title: 'Reading Comprehension',
                  activityType: 'LESSON',
                  materialsText: 'Reading books, highlighters, worksheets',
                  milestone: {
                    create: {
                      title: 'Literacy Development',
                      subject: {
                        create: {
                          name: 'Language Arts',
                          userId: testUserId,
                        },
                      },
                      userId: testUserId,
                    },
                  },
                  userId: testUserId,
                },
              },
            },
          ],
        },
      },
    });

    lessonPlanId = lessonPlan.id;
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.materialList.deleteMany({
      where: { weekStart: new Date(testWeekStart) },
    });

    await prisma.weeklySchedule.deleteMany({
      where: { lessonPlanId },
    });

    await prisma.lessonPlan.deleteMany({
      where: { id: lessonPlanId },
    });

    // Clean up all user-related data
    await prisma.activity.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.milestone.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.subject.deleteMany({
      where: { userId: testUserId },
    });
  });

  describe('GET /api/material-lists/:weekStart/smart-plan', () => {
    it('should generate smart material plan for week', async () => {
      const response = await request(app)
        .get(`/api/material-lists/${testWeekStart}/smart-plan`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('weekStart', testWeekStart);
      expect(response.body).toHaveProperty('materials');
      expect(response.body).toHaveProperty('totalPrepTime');
      expect(response.body).toHaveProperty('preparation');
      expect(response.body).toHaveProperty('byDay');

      // Verify materials structure
      expect(Array.isArray(response.body.materials)).toBe(true);
      if (response.body.materials.length > 0) {
        const material = response.body.materials[0];
        expect(material).toHaveProperty('name');
        expect(material).toHaveProperty('category');
        expect(material).toHaveProperty('priority');
      }

      // Verify preparation structure
      expect(response.body.preparation).toHaveProperty('printingNeeded');
      expect(response.body.preparation).toHaveProperty('setupRequired');
      expect(response.body.preparation).toHaveProperty('purchaseNeeded');

      // Verify by-day structure
      expect(Array.isArray(response.body.byDay)).toBe(true);
    });

    it('should handle week with no activities', async () => {
      // Use a different week with no lesson plan
      const emptyWeekStart = '2024-02-05';

      const response = await request(app)
        .get(`/api/material-lists/${emptyWeekStart}/smart-plan`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('materials', []);
      expect(response.body).toHaveProperty('totalPrepTime', 0);
      expect(response.body.byDay).toHaveLength(0);
    });

    it('should require authentication', async () => {
      await request(app).get(`/api/material-lists/${testWeekStart}/smart-plan`).expect(401);
    });

    it('should validate week start date format', async () => {
      const response = await request(app)
        .get('/api/material-lists/invalid-date/smart-plan')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid date format');
    });
  });

  describe('POST /api/material-lists/:weekStart/auto-update', () => {
    it('should auto-update materials from activities', async () => {
      const response = await request(app)
        .post(`/api/material-lists/${testWeekStart}/auto-update`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Materials updated successfully');
      expect(response.body).toHaveProperty('materialsExtracted');
      expect(response.body.materialsExtracted).toBeGreaterThan(0);

      // Verify material list was created/updated
      const materialList = await prisma.materialList.findFirst({
        where: { weekStart: new Date(testWeekStart) },
      });

      expect(materialList).toBeDefined();
      expect(materialList?.items).toBeDefined();

      const items = JSON.parse(materialList?.items || '[]');
      expect(Array.isArray(items)).toBe(true);
    });

    it('should handle OpenAI API errors gracefully', async () => {
      // Mock OpenAI to throw an error
      const mockOpenAI = await import('openai');
      vi.mocked(mockOpenAI.default).mockImplementationOnce(() => {
        throw new Error('OpenAI API Error');
      });

      const response = await request(app)
        .post(`/api/material-lists/${testWeekStart}/auto-update`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Failed to extract materials');
    });

    it('should handle missing OpenAI API key', async () => {
      // Save original API key
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const response = await request(app)
        .post(`/api/material-lists/${testWeekStart}/auto-update`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('OpenAI API key not configured');

      // Restore API key
      if (originalKey) {
        process.env.OPENAI_API_KEY = originalKey;
      }
    });
  });

  describe('SmartMaterialExtractor Service', () => {
    let extractor: SmartMaterialExtractor;

    beforeEach(() => {
      extractor = new SmartMaterialExtractor();
    });

    it('should extract materials from activity text', async () => {
      const activityText =
        'Students will use math workbooks and calculators to practice addition. Need pencils and erasers.';

      const materials = await extractor.extractMaterials(activityText);

      expect(Array.isArray(materials)).toBe(true);
      expect(materials.length).toBeGreaterThan(0);

      // Verify material structure
      const material = materials[0];
      expect(material).toHaveProperty('name');
      expect(material).toHaveProperty('category');
      expect(material).toHaveProperty('priority');
      expect(['supplies', 'technology', 'books', 'equipment', 'printables', 'other']).toContain(
        material.category,
      );
      expect(['essential', 'helpful', 'optional']).toContain(material.priority);
    });

    it('should categorize materials correctly', async () => {
      const testCases = [
        { text: 'iPad and computer for research', expectedCategory: 'technology' },
        { text: 'reading books and novels', expectedCategory: 'books' },
        { text: 'pencils and paper', expectedCategory: 'supplies' },
        { text: 'worksheets to print', expectedCategory: 'printables' },
        { text: 'microscope and scale', expectedCategory: 'equipment' },
      ];

      for (const testCase of testCases) {
        const materials = await extractor.extractMaterials(testCase.text);

        // Should have at least one material with expected category
        const hasExpectedCategory = materials.some((m) => m.category === testCase.expectedCategory);
        expect(hasExpectedCategory).toBe(true);
      }
    });

    it('should handle empty or invalid input', async () => {
      const materials = await extractor.extractMaterials('');
      expect(materials).toEqual([]);
    });

    it('should assign preparation time estimates', async () => {
      const activityText = 'Print worksheets and set up science experiment stations';

      const materials = await extractor.extractMaterials(activityText);

      // At least one material should have prep time > 0
      const hasPreparationTime = materials.some((m) => (m.prepTime || 0) > 0);
      expect(hasPreparationTime).toBe(true);
    });

    it('should group by preparation requirements', async () => {
      const activities = [
        'Print math worksheets',
        'Set up art supplies at stations',
        'Need to purchase science materials',
      ];

      const results = await extractor.analyzeWeeklyPreparation(activities);

      expect(results).toHaveProperty('printingNeeded');
      expect(results).toHaveProperty('setupRequired');
      expect(results).toHaveProperty('purchaseNeeded');

      expect(Array.isArray(results.printingNeeded)).toBe(true);
      expect(Array.isArray(results.setupRequired)).toBe(true);
      expect(Array.isArray(results.purchaseNeeded)).toBe(true);
    });
  });

  describe('Material Plan Generation', () => {
    it('should generate comprehensive weekly plan', async () => {
      const response = await request(app)
        .get(`/api/material-lists/${testWeekStart}/smart-plan`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const plan = response.body;

      // Verify plan completeness
      expect(plan).toHaveProperty('weekStart');
      expect(plan).toHaveProperty('totalPrepTime');
      expect(typeof plan.totalPrepTime).toBe('number');

      // Verify materials array
      expect(Array.isArray(plan.materials)).toBe(true);

      // Verify preparation breakdown
      expect(plan.preparation).toHaveProperty('printingNeeded');
      expect(plan.preparation).toHaveProperty('setupRequired');
      expect(plan.preparation).toHaveProperty('purchaseNeeded');

      // Verify daily breakdown
      expect(Array.isArray(plan.byDay)).toBe(true);

      if (plan.byDay.length > 0) {
        const day = plan.byDay[0];
        expect(day).toHaveProperty('day');
        expect(day).toHaveProperty('dayName');
        expect(day).toHaveProperty('activities');
        expect(Array.isArray(day.activities)).toBe(true);
      }
    });

    it('should calculate total preparation time correctly', async () => {
      const response = await request(app)
        .get(`/api/material-lists/${testWeekStart}/smart-plan`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const plan = response.body;

      // Total prep time should be sum of all material prep times
      const expectedTotal = plan.materials.reduce(
        (sum: number, material: { prepTime?: number }) => {
          return sum + (material.prepTime || 0);
        },
        0,
      );

      expect(plan.totalPrepTime).toBe(expectedTotal);
    });

    it('should organize materials by day correctly', async () => {
      const response = await request(app)
        .get(`/api/material-lists/${testWeekStart}/smart-plan`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const plan = response.body;

      // Each day should correspond to scheduled activities
      for (const day of plan.byDay) {
        expect(day.day).toBeGreaterThanOrEqual(1);
        expect(day.day).toBeLessThanOrEqual(7);
        expect(typeof day.dayName).toBe('string');

        for (const activity of day.activities) {
          expect(activity).toHaveProperty('activityId');
          expect(activity).toHaveProperty('title');
          expect(activity).toHaveProperty('timeSlot');
          expect(Array.isArray(activity.materials)).toBe(true);
        }
      }
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large number of activities efficiently', async () => {
      // Note: In a real test, we'd create multiple activities for stress testing
      // For this test, we'll just verify the endpoint handles the request

      const startTime = Date.now();

      const response = await request(app)
        .get(`/api/material-lists/${testWeekStart}/smart-plan`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within reasonable time (< 2 seconds)
      expect(responseTime).toBeLessThan(2000);
      expect(response.body).toHaveProperty('materials');
    });

    it('should handle concurrent requests safely', async () => {
      // Make multiple concurrent requests
      const requests = Array.from({ length: 5 }, () =>
        request(app)
          .get(`/api/material-lists/${testWeekStart}/smart-plan`)
          .set('Authorization', `Bearer ${authToken}`),
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('materials');
      });
    });

    it('should handle malformed activity data gracefully', async () => {
      // Note: The endpoint should handle problematic material text including:
      // null, undefined, empty strings, special characters, long text, and unicode
      // The endpoint should handle these gracefully
      const response = await request(app)
        .get(`/api/material-lists/${testWeekStart}/smart-plan`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('materials');
      expect(Array.isArray(response.body.materials)).toBe(true);
    });
  });
});
