import { Router } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { validate } from '../validation';

const router = Router();

const holidaySchema = z.object({
  date: z.string().datetime(),
  name: z.string().min(1),
});

router.get('/', async (_req, res, next) => {
  try {
    const holidays = await prisma.holiday.findMany({ orderBy: { date: 'asc' } });
    res.json(holidays);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(holidaySchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof holidaySchema>;
    const holiday = await prisma.holiday.create({
      data: { date: new Date(data.date), name: data.name },
    });
    res.status(201).json(holiday);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.holiday.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
