import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { PromptGeneratorService } from '../services/promptGeneratorService';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();
const promptGeneratorService = new PromptGeneratorService();

// Validation schemas
const generatePromptsSchema = z.object({
  outcomeId: z.string().min(1),
  language: z.enum(['en', 'fr']),
  grade: z.number().int().min(1).max(12).optional(),
  subject: z.string().optional(),
});

// A4 Enhancement: Generate pedagogical prompts for an outcome
router.post('/generate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = generatePromptsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const { outcomeId, language, grade, subject } = validation.data;

    // Verify the outcome is accessible to the user
    const outcome = await prisma.outcome.findFirst({
      where: {
        id: outcomeId,
        OR: [
          // Outcome is linked to user's milestones
          {
            milestones: {
              some: {
                milestone: {
                  subject: {
                    userId: parseInt(userId),
                  },
                },
              },
            },
          },
          // Or outcome is part of user's activities
          {
            activities: {
              some: {
                activity: {
                  userId: parseInt(userId),
                },
              },
            },
          },
          // Or outcome is part of user's smart goals
          {
            smartGoals: {
              some: {
                userId: parseInt(userId),
              },
            },
          },
        ],
      },
    });

    if (!outcome) {
      return res.status(404).json({ error: 'Outcome not found or not accessible' });
    }

    // Generate prompts
    const result = await promptGeneratorService.generatePrompts({
      outcomeId,
      language,
      grade,
      subject,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get prompts for a specific outcome
router.get('/outcome/:outcomeId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const { outcomeId } = req.params;
    const language = (req.query.language as string) || 'en';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify outcome accessibility (same logic as above)
    const outcome = await prisma.outcome.findFirst({
      where: {
        id: outcomeId,
        OR: [
          {
            milestones: {
              some: {
                milestone: {
                  subject: {
                    userId: parseInt(userId),
                  },
                },
              },
            },
          },
          {
            activities: {
              some: {
                activity: {
                  userId: parseInt(userId),
                },
              },
            },
          },
          {
            smartGoals: {
              some: {
                userId: parseInt(userId),
              },
            },
          },
        ],
      },
      include: {
        prompts: {
          where: {
            language,
          },
          orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!outcome) {
      return res.status(404).json({ error: 'Outcome not found or not accessible' });
    }

    res.json({
      outcomeId,
      outcome: {
        id: outcome.id,
        code: outcome.code,
        description: outcome.description,
        subject: outcome.subject,
        grade: outcome.grade,
      },
      prompts: outcome.prompts.map((prompt) => ({
        id: prompt.id,
        type: prompt.type,
        text: prompt.text,
        isSystem: prompt.isSystem,
        createdAt: prompt.createdAt,
      })),
      language,
    });
  } catch (err) {
    next(err);
  }
});

// Get prompt statistics for the authenticated user
router.get('/stats', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await promptGeneratorService.getPromptStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Get prompts by type and language
router.get('/search', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      type,
      language = 'en',
      subject,
      grade,
      limit = '20',
    } = req.query as {
      type?: string;
      language?: string;
      subject?: string;
      grade?: string;
      limit?: string;
    };

    const filters: Record<string, string> = {
      language,
    };

    if (type) {
      filters.type = type;
    }

    // Find prompts from outcomes accessible to the user
    const prompts = await prisma.outcomePrompt.findMany({
      where: {
        ...filters,
        outcome: {
          OR: [
            {
              milestones: {
                some: {
                  milestone: {
                    subject: {
                      userId: parseInt(userId),
                    },
                  },
                },
              },
            },
            {
              activities: {
                some: {
                  activity: {
                    userId: parseInt(userId),
                  },
                },
              },
            },
            {
              smartGoals: {
                some: {
                  userId: parseInt(userId),
                },
              },
            },
          ],
          ...(subject && { subject }),
          ...(grade && { grade: parseInt(grade) }),
        },
      },
      include: {
        outcome: {
          select: {
            id: true,
            code: true,
            description: true,
            subject: true,
            grade: true,
          },
        },
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
      take: parseInt(limit),
    });

    res.json({
      prompts: prompts.map((prompt) => ({
        id: prompt.id,
        outcomeId: prompt.outcomeId,
        type: prompt.type,
        text: prompt.text,
        language: prompt.language,
        isSystem: prompt.isSystem,
        outcome: prompt.outcome,
        createdAt: prompt.createdAt,
      })),
      filters: {
        type,
        language,
        subject,
        grade,
      },
      total: prompts.length,
    });
  } catch (err) {
    next(err);
  }
});

// Delete prompts for an outcome (admin only or for user-generated prompts)
router.delete('/outcome/:outcomeId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const { outcomeId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only allow deletion of user-accessible outcomes
    const outcome = await prisma.outcome.findFirst({
      where: {
        id: outcomeId,
        OR: [
          {
            milestones: {
              some: {
                milestone: {
                  subject: {
                    userId: parseInt(userId),
                  },
                },
              },
            },
          },
          {
            activities: {
              some: {
                activity: {
                  userId: parseInt(userId),
                },
              },
            },
          },
          {
            smartGoals: {
              some: {
                userId: parseInt(userId),
              },
            },
          },
        ],
      },
    });

    if (!outcome) {
      return res.status(404).json({ error: 'Outcome not found or not accessible' });
    }

    // Delete only non-system prompts (user-generated ones)
    const deleteResult = await prisma.outcomePrompt.deleteMany({
      where: {
        outcomeId,
        isSystem: false, // Only delete user-generated prompts
      },
    });

    res.json({
      message: 'User-generated prompts deleted successfully',
      deletedCount: deleteResult.count,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
