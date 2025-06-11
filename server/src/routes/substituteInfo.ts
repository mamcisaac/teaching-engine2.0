import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const info = await prisma.substituteInfo.findFirst({ where: { id: 1 } });
    res.json(info);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { procedures, allergies } = req.body as {
      procedures?: string;
      allergies?: string;
    };
    const info = await prisma.substituteInfo.upsert({
      where: { id: 1 },
      create: { id: 1, teacherId: 1, procedures, allergies },
      update: { procedures, allergies },
    });
    res.status(201).json(info);
  } catch (err) {
    next(err);
  }
});

export default router;
