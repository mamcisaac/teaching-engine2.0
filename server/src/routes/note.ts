import { Router } from 'express';
import { Prisma } from '@teaching-engine/database';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const notes = await prisma.note.findMany();
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
      public: isPublic,
      activityId,
      dailyPlanId,
    } = req.body as {
      content: string;
      public?: boolean;
      activityId?: number;
      dailyPlanId?: number;
    };
    const note = await prisma.note.create({
      data: {
        content,
        public: isPublic ?? false,
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
