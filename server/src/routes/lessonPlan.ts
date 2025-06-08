import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { generateSchedule } from '../services/planningEngine';

const router = Router();


router.post('/generate', async (req, res, next) => {
  try {
    const { weekStart } = req.body as { weekStart: string };
    const scheduleData = await generateSchedule();
    const plan = await prisma.lessonPlan.create({
      data: {
        weekStart: new Date(weekStart),
        schedule: {
          create: scheduleData,
        },
      },
      include: { schedule: true },
    });
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
});

router.get('/:weekStart', async (req, res, next) => {
  try {
    const plan = await prisma.lessonPlan.findFirst({
      where: { weekStart: new Date(req.params.weekStart) },
      include: {
        schedule: true,
      },
    });
    if (!plan) return res.status(404).json({ error: 'Not Found' });
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { schedule } = req.body as {
      schedule: { id: number; day: number; activityId: number }[];
    };
    const plan = await prisma.lessonPlan.update({
      where: { id: Number(req.params.id) },
      data: {
        schedule: {
          deleteMany: {},
          create: schedule.map((s) => ({ day: s.day, activityId: s.activityId })),
        },
      },
      include: { schedule: true },
    });
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

export async function savePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const { teachingStyles, pacePreference, prepTime } = req.body as {
      teachingStyles: string[];
      pacePreference: string;
      prepTime: number;
    };
    const prefs = await prisma.teacherPreferences.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        teachingStyles: JSON.stringify(teachingStyles),
        pacePreference,
        prepTime,
      },
      update: {
        teachingStyles: JSON.stringify(teachingStyles),
        pacePreference,
        prepTime,
      },
    });
    res.status(201).json(prefs);
  } catch (err) {
    next(err);
  }
}

export default router;
