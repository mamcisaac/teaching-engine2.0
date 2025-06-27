import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../validation';
import { generateSubPlan } from '../services/subPlanService';
import { prisma } from '../prisma';

// Use global Express Request type with user: { id: number; email: string }

const router = Router();

// Sub-plan generation schema
const subPlanGenerateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  days: z.number().int().min(1).max(5).default(1),
  includeGoals: z.boolean().default(true),
  includeRoutines: z.boolean().default(true),
  includePlans: z.boolean().default(true),
  anonymize: z.boolean().default(false),
  userId: z.number().int().optional(),
  saveRecord: z.boolean().default(false),
  emailTo: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * Generate substitute plan PDF
 * POST /api/sub-plan/generate
 */
router.post(
  '/generate',
  validate(subPlanGenerateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || 0;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        date,
        days,
        includeGoals,
        includeRoutines,
        includePlans,
        anonymize,
        saveRecord,
        emailTo,
        notes,
      } = req.body;

      // Use the authenticated user's ID if userId not provided in request
      const targetUserId = req.body.userId || userId;

      const options = {
        includeGoals,
        includeRoutines,
        includePlans,
        anonymize,
        userId: targetUserId,
      };

      const pdfBuffer = await generateSubPlan(date, days, options);

      // Save record if requested
      if (saveRecord) {
        await prisma.subPlanRecord.create({
          data: {
            userId: targetUserId,
            date: new Date(date),
            daysCount: days,
            content: { emailedTo: emailTo, options: JSON.stringify(options) },
            includeGoals,
            includeRoutines,
            includePlans,
            anonymized: anonymize,
            notes: notes,
          },
        });
      }

      // Set PDF headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="sub-plan-${date}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Get class routines for user
 * GET /api/sub-plan/routines
 */
router.get('/routines', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const targetUserId = req.query.userId ? parseInt(req.query.userId as string, 10) : userId;

    const routines = await prisma.classRoutine.findMany({
      where: { userId: targetUserId },
      orderBy: { priority: 'desc' }, // Higher priority first
    });

    res.json(routines);
  } catch (error) {
    next(error);
  }
});

/**
 * Create or update class routine
 * POST /api/sub-plan/routines
 */
router.post('/routines', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, title, description, category, timeOfDay, priority, isActive } = req.body;

    if (id) {
      // Update existing routine
      const routine = await prisma.classRoutine.update({
        where: { id: parseInt(id, 10) },
        data: {
          title,
          description,
          category,
          timeOfDay,
          priority,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
      res.json(routine);
    } else {
      // Create new routine
      const routine = await prisma.classRoutine.create({
        data: {
          userId,
          title,
          description,
          category,
          timeOfDay,
          priority: priority || 5,
          isActive: isActive !== undefined ? isActive : true,
        },
      });
      res.json(routine);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Delete class routine
 * DELETE /api/sub-plan/routines/:id
 */
router.delete('/routines/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const routineId = parseInt(req.params.id, 10);

    await prisma.classRoutine.delete({
      where: { id: routineId },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Get sub plan records
 * GET /api/sub-plan/records
 */
router.get('/records', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 0;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const targetUserId = req.query.userId ? parseInt(req.query.userId as string, 10) : userId;

    const records = await prisma.subPlanRecord.findMany({
      where: { userId: targetUserId },
      orderBy: { date: 'desc' },
    });

    res.json(records);
  } catch (error) {
    next(error);
  }
});

export default router;
