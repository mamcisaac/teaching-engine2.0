import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const weekStart = new Date(req.body.weekStart);
    const resources = await prisma.resource.findMany();
    const items = resources.map((r) => r.filename);
    const list = await prisma.materialList.create({
      data: {
        weekStart,
        items: JSON.stringify(items),
      },
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const list = await prisma.materialList.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!list) return res.status(404).json({ error: 'Not Found' });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

export default router;
