import { Router } from 'express';
import { prisma } from '../prisma';
import { validate, timetableEntrySchema } from '../validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const slots = await prisma.timetableSlot.findMany({
      include: { subject: true },
      orderBy: [{ day: 'asc' }, { startMin: 'asc' }],
    });
    res.json(slots);
  } catch (err) {
    next(err);
  }
});

router.put('/', validate(timetableEntrySchema.array()), async (req, res, next) => {
  try {
    await prisma.timetableSlot.deleteMany();
    await prisma.timetableSlot.createMany({ data: req.body });
    const slots = await prisma.timetableSlot.findMany({
      include: { subject: true },
      orderBy: [{ day: 'asc' }, { startMin: 'asc' }],
    });
    res.json(slots);
  } catch (err) {
    next(err);
  }
});

export default router;
