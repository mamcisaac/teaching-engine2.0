import { Router } from 'express';
import { Prisma } from '@teaching-engine/database';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const teacherId = req.query.teacherId as string | undefined;
    const deadlines = await prisma.reportDeadline.findMany({
      where: teacherId ? { teacherId: Number(teacherId) } : undefined,
      orderBy: { date: 'asc' },
    });
    res.json(deadlines);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { teacherId, name, date, remindDaysBefore } = req.body as {
      teacherId: number;
      name: string;
      date: string;
      remindDaysBefore?: number;
    };
    if (!teacherId || !name || !date) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    const dl = await prisma.reportDeadline.create({
      data: {
        teacherId,
        name,
        date: new Date(date),
        remindDaysBefore: remindDaysBefore ?? 14,
      },
    });
    res.status(201).json(dl);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, date, remindDaysBefore } = req.body as {
      name?: string;
      date?: string;
      remindDaysBefore?: number;
    };
    const dl = await prisma.reportDeadline.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        date: date ? new Date(date) : undefined,
        remindDaysBefore,
      },
    });
    res.json(dl);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.reportDeadline.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

export default router;
