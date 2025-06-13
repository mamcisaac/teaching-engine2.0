import { Router, Request, Response, NextFunction } from 'express';
import { prisma, Prisma } from '../prisma';
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

    // Validate and normalize weekStart
    if (!weekStart || weekStart === '0' || isNaN(Date.parse(weekStart))) {
      return res.status(400).json({ error: 'Invalid weekStart date' });
    }
    // Always use Date object at midnight UTC
    const weekStartDate = new Date(weekStart);
    weekStartDate.setUTCHours(0, 0, 0, 0);

    const startDate = new Date(weekStartDate);
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
    const holidays = await prisma.holiday.findMany({
      where: { date: { gte: startDate, lte: endDate } },
    });
    const availableBlocks = filterAvailableBlocksByCalendar(slots, events, unavail, holidays);
    const urg = await getMilestoneUrgency();
    const priorityMap = new Map(urg.map((u) => [u.id, u.urgency]));
    const scheduleData = await generateWeeklySchedule({
      availableBlocks,
      milestonePriorities: priorityMap,
      pacingStrategy,
      preserveBuffer,
    });
    // Only consider real activities (exclude buffers/preps)
    const validActivityIds = scheduleData
      .map((s) => s.activityId)
      .filter((id): id is number => id !== null);
    const activities = await prisma.activity.findMany({
      where: { id: { in: validActivityIds } },
      include: { milestone: { include: { deadline: true } } },
    });
    for (const item of scheduleData) {
      if (item.activityId === null) continue; // skip buffer/prep slots
      const act = activities.find((a) => a.id === item.activityId);
      if (act && act.activityType === 'ASSESSMENT' && act.milestone && act.milestone.deadline) {
        const date = new Date(weekStart);
        date.setUTCDate(date.getUTCDate() + item.day);
        if (date > act.milestone.deadline.date) {
          return res.status(400).json({
            error: `Assessment ${act.title} is after the deadline ${act.milestone.deadline.name}`,
          });
        }
      }
    }
    // Only count real activities for empty check
    if (scheduleData.filter((s) => s.activityId !== null).length === 0) {
      return res.status(400).json({ error: 'No activities available' });
    }

    // Validate that all slotIds and activityIds exist
    try {
      // Get all unique slot and activity IDs from the schedule data
      const slotIds = [...new Set(scheduleData.map((item) => item.slotId).filter(Boolean))];
      const activityIds = [
        ...new Set(
          scheduleData.map((item) => item.activityId).filter((id): id is number => id !== null),
        ),
      ];

      // Check if all slots exist
      if (slotIds.length > 0) {
        const existingSlots = await prisma.timetableSlot.findMany({
          where: { id: { in: slotIds as number[] } },
          select: { id: true },
        });

        const missingSlotIds = slotIds.filter(
          (id: number) => !existingSlots.some((slot: { id: number }) => slot.id === id),
        );

        if (missingSlotIds.length > 0) {
          console.error('Missing slot IDs:', missingSlotIds);
          return res.status(400).json({
            error: 'Invalid schedule data',
            details: `The following slot IDs do not exist: ${missingSlotIds.join(', ')}`,
          });
        }
      }

      // Check if all activities exist
      const existingActivities = await prisma.activity.findMany({
        where: { id: { in: activityIds } },
        select: { id: true },
      });

      const missingActivityIds = activityIds.filter(
        (id: number) => !existingActivities.some((activity: { id: number }) => activity.id === id),
      );
      if (missingActivityIds.length > 0) {
        console.warn('Missing activity IDs:', missingActivityIds);
        return res.status(400).json({
          error: 'Invalid schedule data',
          details: `The following activity IDs do not exist: ${missingActivityIds.join(', ')}`,
        });
      }
    } catch (error) {
      console.error('Error validating schedule data:', error);
      return res.status(500).json({
        error: 'Failed to validate schedule data',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // If we get here, all validations passed
    try {
      // Save lesson plan and schedule in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Upsert lesson plan
        const plan = await tx.lessonPlan.upsert({
          where: { weekStart: weekStartDate },
          update: {},
          create: { weekStart: weekStartDate },
        });

        // Delete old schedule and create new one
        await tx.weeklySchedule.deleteMany({ where: { lessonPlanId: plan.id } });
        // Only create entries for real activities
        await tx.weeklySchedule.createMany({
          data: scheduleData
            .filter((item) => item.activityId !== null)
            .map((item) => ({
              lessonPlanId: plan.id,
              day: item.day,
              slotId: item.slotId,
              activityId: item.activityId as number, // guaranteed not null
            })),
        });
        return plan;
      });
      await updateMaterialList(weekStart);
      const scheduleEntries = await prisma.weeklySchedule.findMany({
        where: { lessonPlanId: result.id },
        include: { slot: true, activity: true },
      });
      return res.status(201).json({ id: result.id, schedule: scheduleEntries });
    } catch (err) {
      console.error('Error creating/updating lesson plan:', err);
      next(err);
    }
  } catch (err) {
    __next(err);
  }
});

router.get('/:weekStart', async (req, res, __next) => {
  try {
    // Normalize weekStart param
    const weekStart = req.params.weekStart;
    if (!weekStart || weekStart === '0' || isNaN(Date.parse(weekStart))) {
      return res.status(400).json({ error: 'Invalid weekStart date' });
    }
    const weekStartDate = new Date(weekStart);
    weekStartDate.setUTCHours(0, 0, 0, 0);
    const plan = await prisma.lessonPlan.findFirst({
      where: { weekStart: weekStartDate },
      include: {
        schedule: { include: { slot: true } },
      },
    });
    if (!plan) return res.status(404).json({ error: 'Not Found' });
    res.json(plan);
  } catch (err) {
    __next(err);
  }
});

router.put('/:id', async (req, res, __next) => {
  // Log incoming schedule for debugging
  console.log('PUT /api/lesson-plans/:id called with schedule:', req.body.schedule);

  try {
    console.log('Received update request:', {
      params: req.params,
      body: req.body,
      headers: req.headers,
    });

    const { schedule } = req.body as {
      schedule: { id?: number; day: number; slotId?: number | null; activityId: number }[];
    };

    if (!schedule || !Array.isArray(schedule)) {
      console.error('Invalid schedule data:', schedule);
      return res.status(400).json({
        error: 'Invalid schedule data',
        details: 'Schedule must be an array of schedule items',
      });
    }

    // Validate each schedule item
    for (const item of schedule) {
      if (typeof item.day !== 'number' || typeof item.activityId !== 'number') {
        console.error('Invalid schedule item:', item);
        return res.status(400).json({
          error: 'Invalid schedule item',
          details: 'Each item must have day (number) and activityId (number)',
        });
      }
    }

    console.log('Processing schedule update with items:', schedule.length);

    const plan = await prisma.$transaction(async (tx) => {
      // First, delete all existing schedule items
      await tx.weeklySchedule.deleteMany({
        where: { lessonPlanId: Number(req.params.id) },
      });

      // Then create new ones
      const createdSchedule = await tx.weeklySchedule.createMany({
        data: schedule.map((item) => ({
          day: item.day,
          slotId: item.slotId ?? null,
          activityId: item.activityId,
          lessonPlanId: Number(req.params.id),
        })),
      });

      console.log('Created schedule items:', createdSchedule.count);

      // Return the updated plan with its schedule
      return tx.lessonPlan.findUnique({
        where: { id: Number(req.params.id) },
        include: {
          schedule: {
            include: {
              activity: true,
              slot: true,
            },
          },
        },
      });
    });

    if (!plan) {
      throw new Error('Failed to update lesson plan');
    }

    // Update material list in the background
    updateMaterialList(plan.weekStart.toISOString()).catch((err) => {
      console.error('Failed to update material list:', err);
    });

    console.log('Successfully updated lesson plan:', plan.id);
    res.status(200).json({ id: plan.id, schedule: plan.schedule });
  } catch (err) {
    console.error('Error updating lesson plan:', {
      message: err instanceof Error ? err.message : err,
      stack: err instanceof Error ? err.stack : undefined,
      schedule: req.body.schedule,
    });
    __next(err);
  }
});

router.post('/preferences', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const { teachingStyles, pacePreference, prepTime, subPlanContacts, subPlanProcedures } =
      req.body as {
        teachingStyles: string[];
        pacePreference: string;
        prepTime: number;
        subPlanContacts?: Record<string, string>;
        subPlanProcedures?: string;
      };
    const prefs = await prisma.teacherPreferences.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        teachingStyles: JSON.stringify(teachingStyles),
        pacePreference,
        prepTime,
        subPlanContacts: subPlanContacts as Prisma.InputJsonValue | undefined,
        subPlanProcedures,
      },
      update: {
        teachingStyles: JSON.stringify(teachingStyles),
        pacePreference,
        prepTime,
        subPlanContacts: subPlanContacts as Prisma.InputJsonValue | undefined,
        subPlanProcedures,
      },
    });
    res.status(201).json(prefs);
  } catch (err) {
    _next(err);
  }
});

export default router;
