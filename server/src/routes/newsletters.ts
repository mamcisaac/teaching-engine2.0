/**
 * Simplified Newsletter Routes
 * API endpoints for generating newsletter drafts
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { renderNewsletter } from '../services';
import { prisma } from '../prisma';
import debug from 'debug';

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
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const validation = generateNewsletterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: validation.error.errors 
      });
    }

    const { sinceDate } = validation.data;
    
    log(`Generating newsletter for user ${userId}`, { sinceDate });

    // Generate newsletter using the new template system
    const newsletter = await renderNewsletter({
      userId,
      sinceDate: sinceDate ? new Date(sinceDate) : undefined,
    });

    // Record generation in audit log
    log(`Newsletter generated for user ${userId}`);

    res.json({
      success: true,
      data: newsletter,
    });

  } catch (_error) {
    log('Error generating newsletter:', _error);
    res.status(500).json({
      error: 'Failed to generate newsletter',
      message: _error instanceof Error ? _error.message : 'Unknown error',
    });
  }
});

/**
 * Get newsletter generation status/info
 * GET /api/newsletters/status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
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

    res.json({
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
  }
});

export default router;