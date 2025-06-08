import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

const router = Router();

// simple planning algorithm with basic subject rotation
async function generateSchedule() {
  const activities = await prisma.activity.findMany({
    where: { completedAt: null },
    include: { milestone: { select: { subjectId: true } } },
    orderBy: { id: 'asc' },
  });

  const bySubject: Record<number, (typeof activities)[number][]> = {};
  for (const act of activities) {
    const subjectId = act.milestone.subjectId;
    if (!bySubject[subjectId]) bySubject[subjectId] = [];
    bySubject[subjectId].push(act);
  }

  const subjects = Object.keys(bySubject).map(Number);
  const schedule: { day: number; activityId: number }[] = [];
  let day = 0;
  while (day < 5 && subjects.some((s) => bySubject[s].length > 0)) {
    for (const s of subjects) {
      const next = bySubject[s].shift();
      if (next) {
        schedule.push({ day, activityId: next.id });
        day++;
        if (day >= 5) break;
      }
    }
  }

  return schedule;
}

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
