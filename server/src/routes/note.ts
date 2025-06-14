import { Router } from 'express';
import { Prisma } from '@teaching-engine/database';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { type, subjectId, dateFrom, dateTo } = req.query as {
      type?: 'public' | 'private';
      subjectId?: string;
      dateFrom?: string;
      dateTo?: string;
    };

    const notes = await prisma.note.findMany({
      where: {
        ...(type && { public: type === 'public' }),
        ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
        ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
        ...(subjectId && {
          activity: {
            milestone: { subjectId: Number(subjectId) },
          },
        }),
      },
      include: {
        activity: { include: { milestone: { include: { subject: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notes);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: Number(req.params.id) } });
    if (!note) return res.status(404).json({ error: 'Not Found' });
    res.json(note);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      content,
      type,
      public: isPublic,
      activityId,
      dailyPlanId,
    } = req.body as {
      content: string;
      type?: 'private' | 'public';
      public?: boolean;
      activityId?: number;
      dailyPlanId?: number;
    };
    const note = await prisma.note.create({
      data: {
        content,
        public: type ? type === 'public' : (isPublic ?? false),
        activityId: activityId ?? undefined,
        dailyPlanId: dailyPlanId ?? undefined,
      },
    });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { content, public: isPublic } = req.body as {
      content: string;
      public?: boolean;
    };
    const note = await prisma.note.update({
      where: { id: Number(req.params.id) },
      data: { content, public: isPublic ?? false },
    });
    res.json(note);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.note.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

export default router;
