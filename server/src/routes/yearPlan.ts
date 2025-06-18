import { Router } from 'express';
import { prisma, Prisma, YearPlanEntryType } from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const teacherId = Number(req.query.teacherId);
    const year = Number(req.query.year);
    if (!teacherId || !year) return res.status(400).json({ error: 'teacherId and year required' });
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    const entries = await prisma.yearPlanEntry.findMany({
      where: {
        teacherId,
        start: { lte: end },
        end: { gte: start },
      },
      orderBy: { start: 'asc' },
    });
    res.json(entries);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { teacherId, entryType, title, start, end } = req.body as {
      teacherId: number;
      entryType: string;
      title: string;
      start: string;
      end: string;
    };

    if (!teacherId || !entryType || !title || !start || !end) {
      return res
        .status(400)
        .json({ error: 'teacherId, entryType, title, start, and end are required' });
    }

    const entry = await prisma.yearPlanEntry.create({
      data: {
        teacherId,
        entryType: entryType as YearPlanEntryType,
        title,
        start: new Date(start),
        end: new Date(end),
      },
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { entryType, title, start, end } = req.body as {
      entryType?: string;
      title?: string;
      start?: string;
      end?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (entryType !== undefined) updateData.entryType = entryType as YearPlanEntryType;
    if (title !== undefined) updateData.title = title;
    if (start !== undefined) updateData.start = new Date(start);
    if (end !== undefined) updateData.end = new Date(end);

    const entry = await prisma.yearPlanEntry.update({
      where: { id },
      data: updateData,
    });
    res.json(entry);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Year plan entry not found' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.yearPlanEntry.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Year plan entry not found' });
    }
    next(err);
  }
});

export default router;
