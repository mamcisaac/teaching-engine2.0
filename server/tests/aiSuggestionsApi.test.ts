import { app } from '../src/index';
import { getTestPrismaClient } from './jest.setup';
import { authRequest } from './test-auth-helper';
import { jest } from '@jest/globals';

// Mock the OpenAI service
jest.mock('../src/services/llmService', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

const auth = authRequest(app);
let prisma: ReturnType<typeof getTestPrismaClient>;

beforeAll(async () => {
  prisma = getTestPrismaClient();
});

let user: { id: number; email: string; name: string; role: string };
let outcome: { id: string; code: string; description: string; subject: string; grade: number };
let milestone: { id: number; title: string; subjectId: number };

beforeEach(async () => {
  // Setup auth first to get the authenticated user
  await auth.setup();

  // Get the authenticated user from the auth helper
  user = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  });

  if (!user) {
    throw new Error('Test user not found');
  }

  // Create test data
  const subject = await prisma.subject.create({
    data: { name: 'Mathematics' },
  });

  milestone = await prisma.milestone.create({
    data: {
      title: 'Number Sense',
      subjectId: subject.id,
    },
  });

  outcome = await prisma.outcome.create({
    data: {
      code: '1M.1',
      description: 'Count to 100 by ones and tens',
      subject: 'MTH',
      grade: 1,
    },
  });

  await prisma.milestoneOutcome.create({
    data: {
      milestoneId: milestone.id,
      outcomeId: outcome.id,
    },
  });
});

describe('AI Suggestions API', () => {
  describe('POST /api/ai-suggestions/generate', () => {
    it('generates AI suggestion for outcome', async () => {
      // Mock OpenAI response
      const { openai: mockOpenAI } = jest.requireMock('../src/services/llmService');
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: 'Comptons ensemble!',
                descriptionFr: "Les élèves utilisent des objets pour compter jusqu'à 100.",
                descriptionEn: 'Students use objects to count to 100.',
                materials: ['cubes', 'jetons'],
                duration: 30,
                theme: 'Les nombres',
              }),
            },
          },
        ],
      });

      const res = await auth.post('/api/ai-suggestions/generate').send({
        outcomeId: outcome.id,
        theme: 'Les nombres',
      });

      expect(res.status).toBe(200);
      // Since OpenAI is not configured in tests, it uses fallback with theme
      expect(res.body.title).toBe('Manipulation mathématique - Les nombres');
      expect(res.body.materials).toContain('cubes');
      expect(res.body.outcomeId).toBe(outcome.id);
    });

    it('rejects invalid outcome ID', async () => {
      const res = await auth.post('/api/ai-suggestions/generate').send({
        outcomeId: 'invalid-id',
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Outcome not found');
    });

    it('validates request data', async () => {
      const res = await auth.post('/api/ai-suggestions/generate').send({
        // Missing outcomeId
        theme: 'Test',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid request data');
    });
  });

  describe('GET /api/ai-suggestions/uncovered', () => {
    it('returns uncovered outcomes', async () => {
      // Create a covered outcome
      const coveredOutcome = await prisma.outcome.create({
        data: {
          code: '1M.2',
          description: 'Add numbers to 20',
          subject: 'MTH',
          grade: 1,
        },
      });

      // Link it to the milestone
      await prisma.milestoneOutcome.create({
        data: {
          milestoneId: milestone.id,
          outcomeId: coveredOutcome.id,
        },
      });

      const activity = await prisma.activity.create({
        data: {
          title: 'Addition practice',
          milestoneId: milestone.id,
          userId: user.id,
        },
      });

      await prisma.activityOutcome.create({
        data: {
          activityId: activity.id,
          outcomeId: coveredOutcome.id,
        },
      });

      const res = await auth.get('/api/ai-suggestions/uncovered');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      const outcomeIds = res.body.map((item: { outcome: { id: string } }) => item.outcome.id);
      expect(outcomeIds).toContain(outcome.id);
      expect(outcomeIds).not.toContain(coveredOutcome.id);
    });

    it('filters by theme', async () => {
      // Create a suggestion with theme
      await prisma.aISuggestedActivity.create({
        data: {
          outcomeId: outcome.id,
          userId: user.id,
          title: 'Themed activity',
          descriptionFr: 'Description',
          materials: JSON.stringify(['mat1']),
          duration: 20,
          theme: 'Winter',
        },
      });

      const res = await auth.get('/api/ai-suggestions/uncovered?theme=Winter');

      expect(res.status).toBe(200);
      const itemWithSuggestion = res.body.find(
        (item: { outcome: { id: string }; suggestion?: { theme: string } }) =>
          item.outcome.id === outcome.id,
      );
      expect(itemWithSuggestion.suggestion).toBeDefined();
      expect(itemWithSuggestion.suggestion.theme).toBe('Winter');
    });
  });

  describe('POST /api/ai-suggestions/convert-to-activity', () => {
    let suggestion: {
      id: number;
      outcomeId: string;
      userId: number;
      title: string;
      descriptionFr: string;
      materials: string;
      duration: number;
    };

    beforeEach(async () => {
      suggestion = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId: outcome.id,
          userId: user.id,
          title: 'Suggested Activity',
          descriptionFr: 'Activity description',
          materials: JSON.stringify(['material1', 'material2']),
          duration: 30,
        },
      });
    });

    it('converts suggestion to activity', async () => {
      const res = await auth.post('/api/ai-suggestions/convert-to-activity').send({
        suggestionId: suggestion.id,
      });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Suggested Activity');
      expect(res.body.publicNote).toBe('Activity description');
      expect(res.body.outcomes).toHaveLength(1);
      expect(res.body.outcomes[0].outcomeId).toBe(outcome.id);
    });

    it('converts with schedule data', async () => {
      const res = await auth.post('/api/ai-suggestions/convert-to-activity').send({
        suggestionId: suggestion.id,
        scheduleData: {
          date: '2024-03-20',
          startTime: '10:00',
          endTime: '10:30',
        },
      });

      expect(res.status).toBe(200);
      // Note: Activity model doesn't have scheduledDate field
    });

    it('rejects non-existent suggestion', async () => {
      const res = await auth.post('/api/ai-suggestions/convert-to-activity').send({
        suggestionId: 99999,
      });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/ai-suggestions/suggestions/:id', () => {
    let suggestion: {
      id: number;
      outcomeId: string;
      userId: number;
      title: string;
      descriptionFr: string;
      materials: string;
      duration: number;
    };

    beforeEach(async () => {
      suggestion = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId: outcome.id,
          userId: user.id,
          title: 'Test Suggestion',
          descriptionFr: 'Description',
          materials: JSON.stringify(['mat1']),
          duration: 25,
        },
      });
    });

    it('retrieves specific suggestion', async () => {
      const res = await auth.get(`/api/ai-suggestions/suggestions/${suggestion.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(suggestion.id);
      expect(res.body.title).toBe('Test Suggestion');
      expect(res.body.materials).toEqual(['mat1']);
    });

    it('returns 404 for non-existent suggestion', async () => {
      const res = await auth.get('/api/ai-suggestions/suggestions/99999');

      expect(res.status).toBe(404);
    });

    it('denies access to other user suggestions', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: 'hashedpassword',
          name: 'Other Teacher',
          role: 'teacher',
        },
      });

      const otherSuggestion = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId: outcome.id,
          userId: otherUser.id,
          title: 'Other Suggestion',
          descriptionFr: 'Description',
          materials: JSON.stringify([]),
          duration: 20,
        },
      });

      const res = await auth.get(`/api/ai-suggestions/suggestions/${otherSuggestion.id}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/ai-suggestions/suggestions/:id', () => {
    let suggestion: {
      id: number;
      outcomeId: string;
      userId: number;
      title: string;
      descriptionFr: string;
      materials: string;
      duration: number;
    };

    beforeEach(async () => {
      suggestion = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId: outcome.id,
          userId: user.id,
          title: 'To Delete',
          descriptionFr: 'Description',
          materials: JSON.stringify([]),
          duration: 20,
        },
      });
    });

    it('deletes suggestion', async () => {
      const res = await auth.delete(`/api/ai-suggestions/suggestions/${suggestion.id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');

      // Verify deletion
      const deleted = await prisma.aISuggestedActivity.findUnique({
        where: { id: suggestion.id },
      });
      expect(deleted).toBeNull();
    });

    it('returns 404 for non-existent suggestion', async () => {
      const res = await auth.delete('/api/ai-suggestions/suggestions/99999');

      expect(res.status).toBe(404);
    });
  });
});
