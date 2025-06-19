import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../src';
import { prisma } from '@teaching-engine/database';
import { createAuthToken } from './test-auth-helper';

describe('AI Suggestions API', () => {
  let authToken: string;
  let userId: number;
  let outcomeId: string;

  beforeEach(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: 'teacher',
      },
    });
    userId = user.id;
    authToken = createAuthToken(user.id);

    // Create test outcome
    const outcome = await prisma.outcome.create({
      data: {
        subject: 'Français',
        grade: 1,
        code: 'FR1.1',
        description: 'Comprendre des messages oraux simples',
      },
    });
    outcomeId = outcome.id;
  });

  afterEach(async () => {
    await prisma.aISuggestedActivity.deleteMany();
    await prisma.outcome.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/ai-suggestions/generate', () => {
    it('should generate an AI suggestion for an outcome', async () => {
      const response = await request(app)
        .post('/api/ai-suggestions/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          outcomeId,
          theme: 'Les saisons',
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        outcomeId,
        userId,
        title: expect.any(String),
        descriptionFr: expect.any(String),
        materials: expect.any(Array),
        duration: expect.any(Number),
        theme: 'Les saisons',
      });
    });

    it('should return 404 for non-existent outcome', async () => {
      const response = await request(app)
        .post('/api/ai-suggestions/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          outcomeId: 'non-existent-id',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Outcome not found');
    });

    it('should return 400 for invalid request data', async () => {
      const response = await request(app)
        .post('/api/ai-suggestions/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing outcomeId
          theme: 'Les saisons',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request data');
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/ai-suggestions/generate').send({
        outcomeId,
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/ai-suggestions/uncovered', () => {
    beforeEach(async () => {
      // Create some test activities linked to outcomes
      const subject = await prisma.subject.create({
        data: {
          name: 'Français',
          userId,
        },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Test Milestone',
          subjectId: subject.id,
          userId,
        },
      });

      const activity = await prisma.activity.create({
        data: {
          title: 'Test Activity',
          milestoneId: milestone.id,
          userId,
        },
      });

      // Link activity to an outcome (making it "covered")
      const coveredOutcome = await prisma.outcome.create({
        data: {
          subject: 'Français',
          grade: 1,
          code: 'FR1.2',
          description: 'Outcome that is covered',
        },
      });

      await prisma.activityOutcome.create({
        data: {
          activityId: activity.id,
          outcomeId: coveredOutcome.id,
        },
      });

      // Create more uncovered outcomes
      await prisma.outcome.createMany({
        data: [
          {
            subject: 'Français',
            grade: 1,
            code: 'FR1.3',
            description: 'Another uncovered outcome',
          },
          {
            subject: 'Mathématiques',
            grade: 1,
            code: 'MA1.1',
            description: 'Math outcome',
          },
        ],
      });
    });

    it('should return uncovered outcomes', async () => {
      const response = await request(app)
        .get('/api/ai-suggestions/uncovered')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);

      // Should include the original uncovered outcome and the two new ones
      // but not the covered outcome
      interface UncoveredItem {
        outcome: { code: string };
        suggestion: unknown;
      }
      const uncoveredCodes = response.body.map((item: UncoveredItem) => item.outcome.code);
      expect(uncoveredCodes).toContain('FR1.1');
      expect(uncoveredCodes).toContain('FR1.3');
      expect(uncoveredCodes).toContain('MA1.1');
      expect(uncoveredCodes).not.toContain('FR1.2'); // This one is covered
    });

    it('should filter by theme if provided', async () => {
      // Create an AI suggestion with a theme
      await prisma.aISuggestedActivity.create({
        data: {
          outcomeId,
          userId,
          title: 'Themed Activity',
          descriptionFr: 'Description',
          materials: JSON.stringify(['paper']),
          duration: 30,
          theme: 'Les animaux',
        },
      });

      const response = await request(app)
        .get('/api/ai-suggestions/uncovered')
        .query({ theme: 'Les animaux' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Find the outcome with the suggestion
      interface OutcomeItem {
        outcome: { id: string };
        suggestion: { theme: string } | null;
      }
      const outcomeWithSuggestion = response.body.find(
        (item: OutcomeItem) => item.outcome.id === outcomeId,
      );

      expect(outcomeWithSuggestion.suggestion).toBeTruthy();
      expect(outcomeWithSuggestion.suggestion.theme).toBe('Les animaux');
    });

    it('should limit results if limit parameter is provided', async () => {
      const response = await request(app)
        .get('/api/ai-suggestions/uncovered')
        .query({ limit: 2 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('POST /api/ai-suggestions/convert-to-activity', () => {
    let suggestionId: number;
    let milestoneId: number;

    beforeEach(async () => {
      // Create a suggestion
      const suggestion = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId,
          userId,
          title: 'Test Suggestion',
          descriptionFr: 'Description française',
          descriptionEn: 'English description',
          materials: JSON.stringify(['paper', 'crayons']),
          duration: 45,
          theme: 'Test Theme',
        },
      });
      suggestionId = suggestion.id;

      // Create a milestone to add the activity to
      const subject = await prisma.subject.create({
        data: {
          name: 'Test Subject',
          userId,
        },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Test Milestone',
          subjectId: subject.id,
          userId,
        },
      });
      milestoneId = milestone.id;
    });

    it('should convert suggestion to activity', async () => {
      const response = await request(app)
        .post('/api/ai-suggestions/convert-to-activity')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          suggestionId,
          milestoneId,
        });

      expect(response.status).toBe(200);
      expect(response.body.activityId).toBeDefined();

      // Verify the activity was created
      const activity = await prisma.activity.findUnique({
        where: { id: response.body.activityId },
        include: { outcomes: true },
      });

      expect(activity).toBeTruthy();
      expect(activity?.title).toBe('Test Suggestion');
      expect(activity?.milestoneId).toBe(milestoneId);
      expect(activity?.durationMins).toBe(45);

      // Verify outcome linkage
      expect(activity?.outcomes).toHaveLength(1);
      expect(activity?.outcomes[0].outcomeId).toBe(outcomeId);
    });

    it('should allow customizing activity details', async () => {
      const response = await request(app)
        .post('/api/ai-suggestions/convert-to-activity')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          suggestionId,
          milestoneId,
          title: 'Custom Title',
          durationMins: 60,
          publicNote: 'Custom note',
        });

      expect(response.status).toBe(200);

      const activity = await prisma.activity.findUnique({
        where: { id: response.body.activityId },
      });

      expect(activity?.title).toBe('Custom Title');
      expect(activity?.durationMins).toBe(60);
      expect(activity?.publicNote).toBe('Custom note');
    });

    it('should return 404 for non-existent suggestion', async () => {
      const response = await request(app)
        .post('/api/ai-suggestions/convert-to-activity')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          suggestionId: 99999,
          milestoneId,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Suggestion not found');
    });
  });

  describe('GET /api/ai-suggestions/suggestions/:id', () => {
    let suggestionId: number;

    beforeEach(async () => {
      const suggestion = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId,
          userId,
          title: 'Test Suggestion',
          descriptionFr: 'Description',
          materials: JSON.stringify(['paper']),
          duration: 30,
        },
      });
      suggestionId = suggestion.id;
    });

    it('should get a specific suggestion', async () => {
      const response = await request(app)
        .get(`/api/ai-suggestions/suggestions/${suggestionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: suggestionId,
        title: 'Test Suggestion',
        materials: ['paper'],
      });
    });

    it('should return 403 for suggestion owned by another user', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: 'hashedpassword',
          name: 'Other User',
        },
      });

      const otherSuggestion = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId,
          userId: otherUser.id,
          title: 'Other Suggestion',
          descriptionFr: 'Description',
          materials: JSON.stringify([]),
          duration: 30,
        },
      });

      const response = await request(app)
        .get(`/api/ai-suggestions/suggestions/${otherSuggestion.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/ai-suggestions/suggestions/:id', () => {
    let suggestionId: number;

    beforeEach(async () => {
      const suggestion = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId,
          userId,
          title: 'Test Suggestion',
          descriptionFr: 'Description',
          materials: JSON.stringify([]),
          duration: 30,
        },
      });
      suggestionId = suggestion.id;
    });

    it('should delete a suggestion', async () => {
      const response = await request(app)
        .delete(`/api/ai-suggestions/suggestions/${suggestionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Suggestion deleted successfully');

      // Verify deletion
      const deleted = await prisma.aISuggestedActivity.findUnique({
        where: { id: suggestionId },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent suggestion', async () => {
      const response = await request(app)
        .delete('/api/ai-suggestions/suggestions/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
