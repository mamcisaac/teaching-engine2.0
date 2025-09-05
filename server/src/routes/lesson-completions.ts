import { logger } from '../logger';
/**
 * Lesson Completion API Routes
 * Tracks teacher lesson completion status for progress monitoring
 */

import { PrismaClient } from '@teaching-engine/database';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';

import { LessonCompletionTracker } from '../services/lessonCompletionTracker';

const router = Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: any) => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

/**
 * GET /api/lesson-completions
 * Get all lesson completions for the current user
 */
router.get('/',
  requireAuth,
  [
    query('lessonIds').optional().isArray(),
    query('lessonIds.*').optional().isString()
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const tracker = new LessonCompletionTracker(userId);
      const lessonIds = req.query.lessonIds as string[] | undefined;

      let completions;
      if (lessonIds && lessonIds.length > 0) {
        // Filter by specific lesson IDs
        completions = await prisma.lessonCompletion.findMany({
          where: {
            userId: userId,
            lessonId: {
              in: lessonIds
            }
          },
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                date: true,
                subject: true,
                unitPlanId: true
              }
            }
          },
          orderBy: {
            completedAt: 'desc'
          }
        });
      } else {
        // Get all completions
        completions = await tracker.getAllCompletions();
      }

      res.json({
        completions,
        total: completions.length
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to fetch lesson completions:');
      res.status(500).json({ error: 'Failed to fetch lesson completions' });
    }
  }
);

/**
 * GET /api/lesson-completions/by-date/:date
 * Get lesson completions for a specific date
 */
router.get('/by-date/:date',
  requireAuth,
  param('date').isISO8601().toDate(),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const dateParam = req.params.date;
      
      if (!dateParam) {
        res.status(400).json({ error: 'Date parameter is required' });
        return;
      }
      
      const date = new Date(dateParam);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const completions = await prisma.lessonCompletion.findMany({
        where: {
          userId: userId,
          lesson: {
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        },
        include: {
          lesson: true
        }
      });

      res.json({
        completions,
        date: req.params.date
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to fetch lesson completions by date:');
      res.status(500).json({ error: 'Failed to fetch lesson completions' });
    }
  }
);

/**
 * GET /api/lesson-completions/progress
 * Get overall completion progress for the user's lessons
 */
router.get('/progress',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const tracker = new LessonCompletionTracker(userId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      let progress;
      if (startDate && endDate) {
        progress = await tracker.getProgressByDateRange(startDate, endDate);
      } else {
        // Get all lessons for overall progress
        const lessons = await prisma.eTFOLessonPlan.findMany({
          where: { userId: userId },
          select: { id: true }
        });
        const lessonIds = lessons.map(l => l.id);
        progress = await tracker.getProgress(lessonIds);
      }

      res.json(progress);
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to fetch lesson progress:');
      res.status(500).json({ error: 'Failed to fetch lesson progress' });
    }
  }
);

/**
 * POST /api/lesson-completions
 * Mark a lesson as completed
 */
router.post('/',
  requireAuth,
  [
    body('lessonId').isString().notEmpty(),
    body('notes').optional().isString(),
    body('actualDuration').optional().isInt({ min: 1 }),
    body('wentWell').optional().isBoolean(),
    body('needsFollowUp').optional().isBoolean()
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { lessonId, notes, actualDuration } = req.body;

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      // Verify the lesson exists and belongs to the user
      const lesson = await prisma.eTFOLessonPlan.findFirst({
        where: {
          id: lessonId,
          userId: userId
        }
      });

      if (!lesson) {
        res.status(404).json({ error: 'Lesson not found' });
        return;
      }

      // Check if completion already exists
      const existingCompletion = await prisma.lessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId: userId,
            lessonId
          }
        }
      });

      if (existingCompletion) {
        res.status(409).json({ error: 'Lesson already marked as completed' });
        return;
      }

      // Create the completion using the service
      const tracker = new LessonCompletionTracker(userId);
      await tracker.markComplete(lessonId, notes, actualDuration);
      
      // Fetch the created completion with lesson data
      const completion = await prisma.lessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId: userId,
            lessonId
          }
        },
        include: {
          lesson: true
        }
      });

      res.status(201).json(completion);
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to create lesson completion:');
      res.status(500).json({ error: 'Failed to mark lesson as completed' });
    }
  }
);

/**
 * PUT /api/lesson-completions/:lessonId
 * Update a lesson completion
 */
router.put('/:lessonId',
  requireAuth,
  [
    param('lessonId').isString().notEmpty(),
    body('notes').optional().isString(),
    body('actualDuration').optional().isInt({ min: 1 }),
    body('wentWell').optional().isBoolean(),
    body('needsFollowUp').optional().isBoolean()
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { lessonId } = req.params;
      const { notes, actualDuration, wentWell, needsFollowUp } = req.body;

      if (!lessonId) {
        res.status(400).json({ error: 'Lesson ID is required' });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      // Check if completion exists
      const existingCompletion = await prisma.lessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId: userId,
            lessonId
          }
        }
      });

      if (!existingCompletion) {
        res.status(404).json({ error: 'Lesson completion not found' });
        return;
      }

      // Update the completion
      const updatedCompletion = await prisma.lessonCompletion.update({
        where: {
          userId_lessonId: {
            userId: userId,
            lessonId
          }
        },
        data: {
          notes,
          actualDuration,
          wentWell,
          needsFollowUp
        },
        include: {
          lesson: true
        }
      });

      res.json(updatedCompletion);
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to update lesson completion:');
      res.status(500).json({ error: 'Failed to update lesson completion' });
    }
  }
);

/**
 * DELETE /api/lesson-completions/:lessonId
 * Mark a lesson as incomplete (delete completion)
 */
router.delete('/:lessonId',
  requireAuth,
  param('lessonId').isString().notEmpty(),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { lessonId } = req.params;

      if (!lessonId) {
        res.status(400).json({ error: 'Lesson ID is required' });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      // Check if completion exists
      const existingCompletion = await prisma.lessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId: userId,
            lessonId
          }
        }
      });

      if (!existingCompletion) {
        res.status(404).json({ error: 'Lesson completion not found' });
        return;
      }

      // Delete the completion using the service
      const tracker = new LessonCompletionTracker(userId);
      await tracker.markIncomplete(lessonId);

      res.status(204).send();
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to delete lesson completion:');
      res.status(500).json({ error: 'Failed to mark lesson as incomplete' });
    }
  }
);

export { router };