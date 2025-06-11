import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  const { subject, grade, search } = req.query as {
    subject?: string;
    grade?: string;
    search?: string;
  };
  try {
    const outcomes = await prisma.outcome.findMany({
      where: {
        ...(subject ? { subject } : {}),
        ...(grade ? { grade: Number(grade) } : {}),
        ...(search
          ? {
              OR: [{ code: { contains: search } }, { description: { contains: search } }],
            }
          : {}),
      },
      orderBy: { code: 'asc' },
    });
    res.json(outcomes);
  } catch (err) {
    next(err);
  }
});

export default router;
