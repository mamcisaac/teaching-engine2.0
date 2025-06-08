import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/:weekStart', async (req, res, next) => {
  try {
    const list = await prisma.materialList.findFirst({
      where: { weekStart: new Date(req.params.weekStart) },
    });
    if (!list) return res.status(404).json({ error: 'Not Found' });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { weekStart, items } = req.body as { weekStart: string; items: string[] };
    const list = await prisma.materialList.create({
      data: { weekStart: new Date(weekStart), items: JSON.stringify(items) },
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
});

export default router;
