import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schemas
const createReflectionSchema = z.object({
  content: z.string().min(1).max(5000),
  outcomeId: z.string(),
});

const updateReflectionSchema = z.object({
  content: z.string().min(1).max(5000),
});

// Get all reflections for the authenticated user
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reflections = await prisma.teacherReflection.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      include: {
        outcome: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    res.json(reflections);
  } catch (err) {
    next(err);
  }
});

// Get reflections for a specific outcome
router.get('/outcome/:outcomeId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const { outcomeId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reflections = await prisma.teacherReflection.findMany({
      where: {
        userId: parseInt(userId),
        outcomeId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        outcome: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    res.json(reflections);
  } catch (err) {
    next(err);
  }
});

// Create a new reflection
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = createReflectionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const { content, outcomeId } = validation.data;

    // Verify that the outcome exists and is accessible to the user
    const outcome = await prisma.outcome.findFirst({
      where: {
        id: outcomeId,
        milestones: {
          some: {
            subject: {
              userId: parseInt(userId),
            },
          },
        },
      },
    });

    if (!outcome) {
      return res.status(404).json({ error: 'Outcome not found or not accessible' });
    }

    const reflection = await prisma.teacherReflection.create({
      data: {
        content,
        outcomeId,
        userId: parseInt(userId),
      },
      include: {
        outcome: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    res.status(201).json(reflection);
  } catch (err) {
    next(err);
  }
});

// Update a reflection
router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const reflectionId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = updateReflectionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const { content } = validation.data;

    // Verify the reflection belongs to the user
    const existingReflection = await prisma.teacherReflection.findFirst({
      where: {
        id: reflectionId,
        userId: parseInt(userId),
      },
    });

    if (!existingReflection) {
      return res.status(404).json({ error: 'Reflection not found' });
    }

    const reflection = await prisma.teacherReflection.update({
      where: { id: reflectionId },
      data: { content },
      include: {
        outcome: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    res.json(reflection);
  } catch (err) {
    next(err);
  }
});

// Delete a reflection
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const reflectionId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the reflection belongs to the user
    const existingReflection = await prisma.teacherReflection.findFirst({
      where: {
        id: reflectionId,
        userId: parseInt(userId),
      },
    });

    if (!existingReflection) {
      return res.status(404).json({ error: 'Reflection not found' });
    }

    await prisma.teacherReflection.delete({
      where: { id: reflectionId },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Get reflection statistics
router.get('/stats', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const totalReflections = await prisma.teacherReflection.count({
      where: { userId: parseInt(userId) },
    });

    const reflectionsThisMonth = await prisma.teacherReflection.count({
      where: {
        userId: parseInt(userId),
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const outcomesWithReflections = await prisma.teacherReflection.groupBy({
      by: ['outcomeId'],
      where: { userId: parseInt(userId) },
      _count: { outcomeId: true },
    });

    const mostReflectedOutcome =
      outcomesWithReflections.length > 0
        ? await prisma.outcome.findFirst({
            where: {
              id: outcomesWithReflections.reduce((prev, current) =>
                prev._count.outcomeId > current._count.outcomeId ? prev : current,
              ).outcomeId,
            },
            select: {
              id: true,
              title: true,
              description: true,
            },
          })
        : null;

    const recentReflections = await prisma.teacherReflection.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        outcome: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      totalReflections,
      reflectionsThisMonth,
      uniqueOutcomesReflected: outcomesWithReflections.length,
      mostReflectedOutcome,
      recentReflections,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
