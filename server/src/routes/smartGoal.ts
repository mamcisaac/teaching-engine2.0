import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { smartGoalCreateSchema, smartGoalUpdateSchema } from '../validation';

const router = Router();

// GET /api/smart-goals - Get SMART goals with optional filters
router.get('/', async (req, res, next) => {
  const { outcomeId, milestoneId, userId } = req.query as {
    outcomeId?: string;
    milestoneId?: string;
    userId?: string;
  };

  try {
    const smartGoals = await prisma.smartGoal.findMany({
      where: {
        ...(outcomeId ? { outcomeId } : {}),
        ...(milestoneId ? { milestoneId: Number(milestoneId) } : {}),
        ...(userId ? { userId: Number(userId) } : {}),
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
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { targetDate: 'asc' },
    });

    res.json(smartGoals);
  } catch (err) {
    next(err);
  }
});

// POST /api/smart-goals - Create a new SMART goal
router.post('/', validate(smartGoalCreateSchema), async (req, res, next) => {
  const { outcomeId, milestoneId, description, targetDate, targetValue } = req.body;
  const userId = parseInt((req as AuthRequest).user!.userId, 10);

  try {
    // Verify outcome exists
    const outcome = await prisma.outcome.findUnique({
      where: { id: outcomeId },
    });

    if (!outcome) {
      return res.status(404).json({ error: 'Outcome not found' });
    }

    // Verify milestone exists if provided
    if (milestoneId) {
      const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
      });

      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }
    }

    const smartGoal = await prisma.smartGoal.create({
      data: {
        outcomeId,
        milestoneId,
        description,
        targetDate: new Date(targetDate),
        targetValue,
        userId,
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
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json(smartGoal);
  } catch (err) {
    next(err);
  }
});

// PUT /api/smart-goals/:id - Update a SMART goal
router.put('/:id', validate(smartGoalUpdateSchema), async (req, res, next) => {
  const { id } = req.params;
  const { description, targetDate, targetValue, observedValue } = req.body;

  try {
    const existingGoal = await prisma.smartGoal.findUnique({
      where: { id: Number(id) },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'SMART goal not found' });
    }

    const smartGoal = await prisma.smartGoal.update({
      where: { id: Number(id) },
      data: {
        ...(description !== undefined ? { description } : {}),
        ...(targetDate !== undefined ? { targetDate: new Date(targetDate) } : {}),
        ...(targetValue !== undefined ? { targetValue } : {}),
        ...(observedValue !== undefined ? { observedValue } : {}),
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
        milestone: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json(smartGoal);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/smart-goals/:id - Delete a SMART goal
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const existingGoal = await prisma.smartGoal.findUnique({
      where: { id: Number(id) },
    });

    if (!existingGoal) {
      return res.status(404).json({ error: 'SMART goal not found' });
    }

    await prisma.smartGoal.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
