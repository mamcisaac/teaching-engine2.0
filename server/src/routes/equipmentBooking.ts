import { Router } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const teacherId = req.query.teacherId as string | undefined;
    const bookings = await prisma.equipmentBooking.findMany({
      where: teacherId ? { teacherId: Number(teacherId) } : undefined,
      orderBy: { neededBy: 'asc' },
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { teacherId, resourceName, neededBy, leadTimeDays } = req.body as {
      teacherId: number;
      resourceName: string;
      neededBy: string;
      leadTimeDays?: number;
    };
    if (!teacherId || !resourceName || !neededBy) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    const booking = await prisma.equipmentBooking.create({
      data: {
        teacherId,
        resourceName,
        neededBy: new Date(neededBy),
        leadTimeDays: leadTimeDays ?? 14,
      },
    });
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { resourceName, neededBy, leadTimeDays, status } = req.body as {
      resourceName?: string;
      neededBy?: string;
      leadTimeDays?: number;
      status?: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED';
    };
    const booking = await prisma.equipmentBooking.update({
      where: { id: Number(req.params.id) },
      data: {
        resourceName,
        neededBy: neededBy ? new Date(neededBy) : undefined,
        leadTimeDays,
        status,
      },
    });
    res.json(booking);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

export default router;
