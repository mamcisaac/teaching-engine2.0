import { Router } from 'express';
import { prisma, Prisma } from '../prisma';

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

    // Basic required field validation
    if (!teacherId || !resourceName || !neededBy) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    // Type validation
    const parsedTeacherId = Number(teacherId);
    if (!Number.isInteger(parsedTeacherId) || parsedTeacherId <= 0) {
      return res.status(400).json({ error: 'Invalid teacherId' });
    }

    // Resource name validation
    if (
      typeof resourceName !== 'string' ||
      resourceName.trim().length === 0 ||
      resourceName.length > 255
    ) {
      return res.status(400).json({ error: 'Invalid resourceName' });
    }

    // Date validation
    if (!neededBy || typeof neededBy !== 'string') {
      return res.status(400).json({ error: 'Invalid date' });
    }

    // Check if date includes time component (expecting full ISO format)
    if (!neededBy.includes('T') || !neededBy.includes(':')) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const parsedDate = new Date(neededBy);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    // Check if the date string matches what was parsed (to catch dates like Feb 30)
    const originalDate = neededBy.substring(0, 10); // Get YYYY-MM-DD part
    const parsedDateString = parsedDate.toISOString().substring(0, 10);
    if (originalDate !== parsedDateString) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    // Only reject dates that are clearly invalid (e.g., before 2020)
    const minimumDate = new Date('2020-01-02');
    if (parsedDate < minimumDate) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    // Lead time validation
    const parsedLeadTime = leadTimeDays ?? 14;
    if (!Number.isInteger(parsedLeadTime) || parsedLeadTime < 0 || parsedLeadTime > 365) {
      return res.status(400).json({ error: 'Invalid leadTimeDays' });
    }

    // Check if teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: parsedTeacherId },
    });
    if (!teacher) {
      return res.status(400).json({ error: 'Teacher not found' });
    }

    const booking = await prisma.equipmentBooking.create({
      data: {
        teacherId: parsedTeacherId,
        resourceName: resourceName.trim(),
        neededBy: parsedDate,
        leadTimeDays: parsedLeadTime,
      },
    });
    res.status(201).json(booking);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid teacher reference' });
      }
    }
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
