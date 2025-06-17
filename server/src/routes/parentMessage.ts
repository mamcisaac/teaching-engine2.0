import { Router } from 'express';
import { prisma } from '../prisma';
import { validate, parentMessageCreateSchema, parentMessageUpdateSchema } from '../validation';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const userId = req.userId || 0;
    const parentMessages = await prisma.parentMessage.findMany({
      where: { userId },
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
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(parentMessages);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(parentMessageCreateSchema), async (req, res, next) => {
  try {
    const {
      title,
      timeframe,
      contentFr,
      contentEn,
      linkedOutcomeIds = [],
      linkedActivityIds = [],
    } = req.body as {
      title: string;
      timeframe: string;
      contentFr: string;
      contentEn: string;
      linkedOutcomeIds?: string[];
      linkedActivityIds?: number[];
    };

    const userId = req.userId || 0;
    const parentMessage = await prisma.parentMessage.create({
      data: {
        userId,
        title,
        timeframe,
        contentFr,
        contentEn,
        linkedOutcomes: {
          create: linkedOutcomeIds.map((outcomeId) => ({
            outcomeId,
          })),
        },
        linkedActivities: {
          create: linkedActivityIds.map((activityId) => ({
            activityId,
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
      },
    });

    res.status(201).json(parentMessage);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.userId || 0;
    const parentMessage = await prisma.parentMessage.findFirst({
      where: {
        id: Number(req.params.id),
        userId,
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
      },
    });

    if (!parentMessage) {
      return res.status(404).json({ error: 'Parent message not found' });
    }

    res.json(parentMessage);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(parentMessageUpdateSchema), async (req, res, next) => {
  try {
    const { title, timeframe, contentFr, contentEn, linkedOutcomeIds, linkedActivityIds } =
      req.body as {
        title?: string;
        timeframe?: string;
        contentFr?: string;
        contentEn?: string;
        linkedOutcomeIds?: string[];
        linkedActivityIds?: number[];
      };

    const userId = req.userId || 0;
    // First verify the message exists and belongs to user
    const existingMessage = await prisma.parentMessage.findFirst({
      where: {
        id: Number(req.params.id),
        userId,
      },
    });

    if (!existingMessage) {
      return res.status(404).json({ error: 'Parent message not found' });
    }

    // Update the message and relations
    const parentMessage = await prisma.$transaction(async (tx) => {
      // Update basic fields
      const updated = await tx.parentMessage.update({
        where: { id: Number(req.params.id) },
        data: {
          ...(title && { title }),
          ...(timeframe && { timeframe }),
          ...(contentFr && { contentFr }),
          ...(contentEn && { contentEn }),
        },
      });

      // Update linked outcomes if provided
      if (linkedOutcomeIds !== undefined) {
        await tx.parentMessageOutcome.deleteMany({
          where: { parentMessageId: Number(req.params.id) },
        });
        await tx.parentMessageOutcome.createMany({
          data: linkedOutcomeIds.map((outcomeId) => ({
            parentMessageId: Number(req.params.id),
            outcomeId,
          })),
        });
      }

      // Update linked activities if provided
      if (linkedActivityIds !== undefined) {
        await tx.parentMessageActivity.deleteMany({
          where: { parentMessageId: Number(req.params.id) },
        });
        await tx.parentMessageActivity.createMany({
          data: linkedActivityIds.map((activityId) => ({
            parentMessageId: Number(req.params.id),
            activityId,
          })),
        });
      }

      return updated;
    });

    // Fetch the updated message with relations
    const updatedWithRelations = await prisma.parentMessage.findUnique({
      where: { id: parentMessage.id },
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
      },
    });

    res.json(updatedWithRelations);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId || 0;
    const parentMessage = await prisma.parentMessage.findFirst({
      where: {
        id: Number(req.params.id),
        userId,
      },
    });

    if (!parentMessage) {
      return res.status(404).json({ error: 'Parent message not found' });
    }

    await prisma.parentMessage.delete({
      where: { id: Number(req.params.id) },
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
