import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/read', async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: Number(req.params.id) },
      data: { read: true },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
