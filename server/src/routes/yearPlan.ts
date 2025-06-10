import { Router } from 'express';
import { prisma } from '../prisma';

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

export default router;
