import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const note = await prisma.notification.findFirst({
      where: { type: 'NEWSLETTER_SUGGESTION', read: false },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ suggested: !!note, notification: note });
  } catch (err) {
    next(err);
  }
});

export default router;
