import { Router } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    const { date } = req.body as { date: string };
    
    // Validate date input
    if (!date || typeof date !== 'string') {
      return res.status(400).json({ error: 'Valid date string required' });
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }
    
    const dayDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(dayDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date provided' });
    }
    const weekStart = new Date(dayDate);
    weekStart.setUTCDate(dayDate.getUTCDate() - ((dayDate.getUTCDay() + 6) % 7));
    const lessonPlan = await prisma.lessonPlan.findFirst({
      where: { weekStart },
      include: { schedule: { include: { slot: true } } },
    });
    if (!lessonPlan) return res.status(404).json({ error: 'No lesson plan for week' });
    const day = (dayDate.getUTCDay() + 6) % 7;
    const items = lessonPlan.schedule
      .filter((s) => s.day === day)
      .map((s) => ({
        startMin: s.slot?.startMin ?? 0,
        endMin: s.slot?.endMin ?? 0,
        slotId: s.slotId ?? undefined,
        activityId: s.activityId,
      }));
    const plan = await prisma.dailyPlan.create({
      data: {
        date: dayDate,
        lessonPlanId: lessonPlan.id,
        items: { create: items },
      },
      include: { items: { include: { activity: true, slot: true } } },
    });
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
});

router.get('/:date', async (req, res, next) => {
  try {
    const plan = await prisma.dailyPlan.findFirst({
      where: { date: new Date(req.params.date) },
      include: { items: { include: { activity: true, slot: true } } },
    });
    if (!plan) return res.status(404).json({ error: 'Not Found' });
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { items } = req.body as {
      items: {
        startMin: number;
        endMin: number;
        slotId?: number;
        activityId?: number;
        notes?: string;
      }[];
    };
    const plan = await prisma.dailyPlan.update({
      where: { id: Number(req.params.id) },
      data: {
        items: {
          deleteMany: {},
          create: items,
        },
      },
      include: { items: { include: { activity: true, slot: true } } },
    });
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

export default router;
