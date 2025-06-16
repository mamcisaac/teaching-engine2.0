import { Router } from 'express';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { z } from 'zod';

const router = Router();

const cognateCreateSchema = z.object({
  wordFr: z.string().min(1),
  wordEn: z.string().min(1),
  notes: z.string().optional(),
  linkedOutcomes: z.array(z.string()).optional(),
  linkedActivities: z.array(z.number()).optional(),
  userId: z.number(),
});

const cognateUpdateSchema = z.object({
  wordFr: z.string().min(1).optional(),
  wordEn: z.string().min(1).optional(),
  notes: z.string().optional(),
  linkedOutcomes: z.array(z.string()).optional(),
  linkedActivities: z.array(z.number()).optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;

    const cognates = await prisma.cognatePair.findMany({
      where: userId ? { userId } : {},
      include: {
        linkedOutcomes: {
          include: {
            outcome: true,
          },
        },
        linkedActivities: {
          include: {
            activity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(cognates);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cognate = await prisma.cognatePair.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        linkedOutcomes: {
          include: {
            outcome: true,
          },
        },
        linkedActivities: {
          include: {
            activity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!cognate) {
      return res.status(404).json({ error: 'Cognate pair not found' });
    }

    res.json(cognate);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(cognateCreateSchema), async (req, res, next) => {
  try {
    const { linkedOutcomes = [], linkedActivities = [], ...cognateData } = req.body;

    const cognate = await prisma.cognatePair.create({
      data: {
        ...cognateData,
        linkedOutcomes: {
          create: linkedOutcomes.map((outcomeId: string) => ({
            outcome: { connect: { id: outcomeId } },
          })),
        },
        linkedActivities: {
          create: linkedActivities.map((activityId: number) => ({
            activity: { connect: { id: activityId } },
          })),
        },
      },
      include: {
        linkedOutcomes: {
          include: {
            outcome: true,
          },
        },
        linkedActivities: {
          include: {
            activity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(cognate);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'This cognate pair already exists for this user' });
    }
    next(err);
  }
});

router.put('/:id', validate(cognateUpdateSchema), async (req, res, next) => {
  try {
    const { linkedOutcomes, linkedActivities, ...updateData } = req.body;

    const cognate = await prisma.cognatePair.update({
      where: { id: Number(req.params.id) },
      data: {
        ...updateData,
        ...(linkedOutcomes && {
          linkedOutcomes: {
            deleteMany: {},
            create: linkedOutcomes.map((outcomeId: string) => ({
              outcome: { connect: { id: outcomeId } },
            })),
          },
        }),
        ...(linkedActivities && {
          linkedActivities: {
            deleteMany: {},
            create: linkedActivities.map((activityId: number) => ({
              activity: { connect: { id: activityId } },
            })),
          },
        }),
      },
      include: {
        linkedOutcomes: {
          include: {
            outcome: true,
          },
        },
        linkedActivities: {
          include: {
            activity: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(cognate);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Cognate pair not found' });
    }
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'This cognate pair already exists for this user' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.cognatePair.delete({
      where: { id: Number(req.params.id) },
    });

    res.status(204).send();
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Cognate pair not found' });
    }
    next(err);
  }
});

export default router;
