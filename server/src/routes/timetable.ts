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
    // We need to transact this so we don't have a moment with no timetable
    const timetableData = req.body;
    await prisma.$transaction([
      prisma.timetableSlot.deleteMany(),
      prisma.timetableSlot.createMany({ data: timetableData }),
    ]);
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
