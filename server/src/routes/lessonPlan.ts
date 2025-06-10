import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import {
  generateWeeklySchedule,
  filterAvailableBlocksByCalendar,
} from '../services/planningEngine';
import { getMilestoneUrgency } from '../services/progressAnalytics';
import { updateMaterialList } from '../services/materialGenerator';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    const {
      weekStart,
      pacingStrategy = 'relaxed',
      preserveBuffer = false,
    } = req.body as {
      weekStart: string;
      pacingStrategy?: 'strict' | 'relaxed';
      preserveBuffer?: boolean;
    };

    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setUTCDate(startDate.getUTCDate() + 6);
    const slots = await prisma.timetableSlot.findMany({
      orderBy: [{ day: 'asc' }, { startMin: 'asc' }],
    });
    const events = await prisma.calendarEvent.findMany({
      where: {
        start: { lte: endDate },
        end: { gte: startDate },
      },
    });
    const unavail = await prisma.unavailableBlock.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
      },
    });
    const availableBlocks = filterAvailableBlocksByCalendar(slots, events, unavail);
    const urg = await getMilestoneUrgency();
    const priorityMap = new Map(urg.map((u) => [u.id, u.urgency]));
    const scheduleData = await generateWeeklySchedule({
      availableBlocks,
      milestonePriorities: priorityMap,
      pacingStrategy,
      preserveBuffer,
    });
    if (scheduleData.length === 0) {
      return res.status(400).json({ error: 'No activities available' });
    }
    const plan = await prisma.lessonPlan.create({
      data: {
        weekStart: new Date(weekStart),
        schedule: {
          create: scheduleData,
        },
      },
      include: { schedule: { include: { slot: true } } },
    });
    await updateMaterialList(weekStart);
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
        schedule: { include: { slot: true } },
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
      schedule: { id: number; day: number; slotId?: number; activityId: number }[];
    };
    const plan = await prisma.lessonPlan.update({
      where: { id: Number(req.params.id) },
      data: {
        schedule: {
          deleteMany: {},
          create: schedule.map((s) => ({ day: s.day, slotId: s.slotId, activityId: s.activityId })),
        },
      },
      include: { schedule: true },
    });
    await updateMaterialList(plan.weekStart.toISOString());
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
