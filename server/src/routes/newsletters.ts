/**
 * Simplified Newsletter Routes
 * API endpoints for generating newsletter drafts
 */

import debug from 'debug';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { prisma } from '../prisma';
import { renderNewsletter } from '../services';

const log = debug('server:newsletter:routes');
const router = Router();

// Validation schema
const generateNewsletterSchema = z.object({
  sinceDate: z.string().datetime().optional(),
});

/**
 * Generate newsletter draft
 * POST /api/newsletters/generate
 */
router.post('/generate', (req: Request, res: Response): void => {
  void (async () => {
    try {
    const userId = req.user.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const validation = generateNewsletterSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid input',
        details: validation.error.errors,
      });
      return;
    }

    const { sinceDate } = validation.data;

    log(`Generating newsletter for user ${userId}`, { sinceDate });

    // Generate newsletter using the new template system
    const startDate = sinceDate
      ? new Date(sinceDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to 1 week ago
    const endDate = new Date(); // Current date
    const newsletter = await renderNewsletter(userId, startDate, endDate, 'standard');

    // Record generation in audit log
    log(`Newsletter generated for user ${userId}`);

    res.json({
      success: true,
      data: newsletter,
    });
    return;
  } catch (_error) {
    log('Error generating newsletter:', _error);
    res.status(500).json({
      error: 'Failed to generate newsletter',
      message: _error instanceof Error ? _error.message : 'Unknown error',
    });
    return;
  }
  })();
});

/**
 * Get newsletter generation status/info
 * GET /api/newsletters/status
 */
router.get('/status', (req: Request, res: Response): void => {
  void (async () => {
    try {
    const userId = req.user.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get count of recent lesson plans and reflections for preview
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [lessonCount, reflectionCount] = await Promise.all([
      prisma.eTFOLessonPlan.count({
        where: {
          userId,
          date: { gte: twoWeeksAgo, lte: now },
        },
      }),
      prisma.daybookEntry.count({
        where: {
          userId,
          date: { gte: twoWeeksAgo, lte: now },
          OR: [
            { notableAchievements: { not: null } },
            { whatWorked: { not: null } },
            { classEngagement: { not: null } },
          ],
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        availableContent: {
          recentLessons: lessonCount,
          teacherReflections: reflectionCount,
          periodCovered: `${twoWeeksAgo.toLocaleDateString()} to ${now.toLocaleDateString()}`,
        },
        canGenerate: lessonCount > 0 || reflectionCount > 0,
      },
    });
  } catch (_error) {
    log('Error getting newsletter status:', _error);
    res.status(500).json({
      error: 'Failed to get newsletter status',
      message: _error instanceof Error ? _error.message : 'Unknown error',
    });
    return;
  }
  })();
});

export { router };
