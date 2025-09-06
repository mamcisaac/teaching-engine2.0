/**
 * Lesson Reflection API Routes
 * Quick teacher reflections with status (👍/👌/👎) and notes
 * Issue #308: Per-Lesson Quick Reflections & Informal Assessment
 */

import { PrismaClient, ReflectionStatus } from '@teaching-engine/database';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';

import { logger } from '../logger';

const router = Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

// Map emoji to enum values
const statusMap = {
  '👍': ReflectionStatus.SUCCESS,
  '👌': ReflectionStatus.MIXED,
  '👎': ReflectionStatus.RETEACH
};

const emojiMap = {
  [ReflectionStatus.SUCCESS]: '👍',
  [ReflectionStatus.MIXED]: '👌',
  [ReflectionStatus.RETEACH]: '👎'
};

/**
 * POST /api/lessons/:id/reflection
 * Create or update a reflection for a lesson
 */
router.post('/:id/reflection',
  requireAuth,
  [
    param('id').isString().notEmpty(),
    body('status').isIn(['👍', '👌', '👎', 'SUCCESS', 'MIXED', 'RETEACH']),
    body('note').optional().isString(),
    body('date').optional().isISO8601()
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const lessonId = req.params.id;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const { note } = req.body;

      if (!lessonId) {
        res.status(400).json({ error: 'Lesson ID is required' });
        return;
      }
      
      // Handle both emoji and enum status values
      let status: ReflectionStatus;
      if (req.body.status in statusMap) {
        status = statusMap[req.body.status as keyof typeof statusMap];
      } else {
        status = req.body.status as ReflectionStatus;
      }

      // Get lesson date or use provided date
      const date = req.body.date ? parseISO(req.body.date) : new Date();

      // Upsert the reflection
      const reflection = await prisma.lessonReflection.upsert({
        where: {
          userId_lessonId: {
            userId,
            lessonId
          }
        },
        create: {
          userId,
          lessonId,
          status,
          note,
          date
        },
        update: {
          status,
          note,
          date,
          updatedAt: new Date()
        }
      });

      // Return with emoji for UI
      res.json({
        ...reflection,
        statusEmoji: emojiMap[reflection.status]
      });
    } catch (error) {
      logger.error({ error }, 'Error saving reflection:');
      res.status(500).json({ error: 'Failed to save reflection' });
    }
  }
);

/**
 * GET /api/lessons/:id/reflection
 * Get reflection for a specific lesson
 */
router.get('/:id/reflection',
  requireAuth,
  [
    param('id').isString().notEmpty()
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const lessonId = req.params.id;
      
      if (!lessonId) {
        res.status(400).json({ error: 'Lesson ID is required' });
        return;
      }
      
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const reflection = await prisma.lessonReflection.findUnique({
        where: {
          userId_lessonId: {
            userId: userId,
            lessonId
          }
        }
      });

      if (!reflection) {
        res.json(null);
        return;
      }

      res.json({
        ...reflection,
        statusEmoji: emojiMap[reflection.status]
      });
    } catch (error) {
      logger.error({ error }, 'Error fetching reflection:');
      res.status(500).json({ error: 'Failed to fetch reflection' });
    }
  }
);

/**
 * GET /api/reflections/daily/:date
 * Get all reflections for a specific day
 */
router.get('/daily/:date',
  requireAuth,
  [
    param('date').isISO8601()
  ],
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
      
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const date = parseISO(dateParam);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const reflections = await prisma.lessonReflection.findMany({
        where: {
          userId: userId,
          date: {
            gte: dayStart,
            lte: dayEnd
          }
        },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              titleFr: true,
              subject: true,
              grade: true,
              unitPlan: {
                select: {
                  title: true,
                  titleFr: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Add emoji to each reflection
      const reflectionsWithEmoji = reflections.map(r => ({
        ...r,
        statusEmoji: emojiMap[r.status]
      }));

      res.json(reflectionsWithEmoji);
    } catch (error) {
      logger.error({ error }, 'Error fetching daily reflections:');
      res.status(500).json({ error: 'Failed to fetch daily reflections' });
    }
  }
);

/**
 * GET /api/reflections/summary/:date
 * Get summary statistics for a specific day
 */
router.get('/summary/:date',
  requireAuth,
  [
    param('date').isISO8601()
  ],
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
      
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const date = parseISO(dateParam);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const reflections = await prisma.lessonReflection.findMany({
        where: {
          userId: userId,
          date: {
            gte: dayStart,
            lte: dayEnd
          }
        },
        select: {
          status: true,
          note: true
        }
      });

      const summary = {
        date: req.params.date,
        total: reflections.length,
        successful: reflections.filter(r => r.status === ReflectionStatus.SUCCESS).length,
        mixed: reflections.filter(r => r.status === ReflectionStatus.MIXED).length,
        needsReteaching: reflections.filter(r => r.status === ReflectionStatus.RETEACH).length,
        withNotes: reflections.filter(r => r.note && r.note.trim().length > 0).length,
        percentSuccess: 0,
        percentMixed: 0,
        percentReteach: 0
      };

      // Calculate percentages
      if (summary.total > 0) {
        summary.percentSuccess = Math.round((summary.successful / summary.total) * 100);
        summary.percentMixed = Math.round((summary.mixed / summary.total) * 100);
        summary.percentReteach = Math.round((summary.needsReteaching / summary.total) * 100);
      }

      res.json(summary);
    } catch (error) {
      logger.error({ error }, 'Error fetching summary:');
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  }
);

/**
 * DELETE /api/lessons/:id/reflection
 * Delete a reflection
 */
router.delete('/:id/reflection',
  requireAuth,
  [
    param('id').isString().notEmpty()
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const lessonId = req.params.id;
      
      if (!lessonId) {
        res.status(400).json({ error: 'Lesson ID is required' });
        return;
      }
      
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      await prisma.lessonReflection.delete({
        where: {
          userId_lessonId: {
            userId: userId,
            lessonId
          }
        }
      });

      res.json({ success: true });
    } catch (error) {
      logger.error({ error }, 'Error deleting reflection:');
      res.status(500).json({ error: 'Failed to delete reflection' });
    }
  }
);

/**
 * GET /api/reflections
 * Get multiple reflections by lesson IDs
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
      const lessonIds = req.query.lessonIds as string[] | undefined;
      
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      const where = {
        userId: userId,
        ...(lessonIds && { lessonId: { in: lessonIds } })
      };

      const reflections = await prisma.lessonReflection.findMany({
        where,
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              titleFr: true
            }
          }
        }
      });

      // Add emoji to each reflection
      const reflectionsWithEmoji = reflections.map(r => ({
        ...r,
        statusEmoji: emojiMap[r.status]
      }));

      res.json(reflectionsWithEmoji);
    } catch (error) {
      logger.error({ error }, 'Error fetching reflections:');
      res.status(500).json({ error: 'Failed to fetch reflections' });
    }
  }
);

export { router };