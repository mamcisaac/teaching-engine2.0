import { Router } from 'express';
import { nanoid } from 'nanoid';
import { prisma } from '../prisma';

const router = Router();

router.post('/year-plan', async (req, res, next) => {
  try {
    const { teacherId, year } = req.body as { teacherId: number; year: number };
    if (!teacherId || !year) return res.status(400).json({ error: 'teacherId and year required' });
    const token = nanoid(16);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await prisma.shareLink.create({
      data: { token, teacherId, year, type: 'YEAR_PLAN', expiresAt },
    });
    res.status(201).json({ shareToken: token, expiresAt });
  } catch (err) {
    next(err);
  }
});

export default router;
