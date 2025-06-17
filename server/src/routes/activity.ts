import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import {
  validate,
  activityCreateSchema,
  activityUpdateSchema,
  activityReorderSchema,
  activityMaterialsSchema,
} from '../validation';
import { reorderActivities } from '../services/activityService';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        outcomes: { include: { outcome: true } },
        cognatePairs: { include: { cognatePair: true } },
      },
    });
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        outcomes: { include: { outcome: true } },
        cognatePairs: { include: { cognatePair: true } },
      },
    });
    if (!activity) return res.status(404).json({ error: 'Not Found' });
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(activityCreateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const activity = await prisma.activity.create({
      data: {
        title: req.body.title,
        milestoneId: req.body.milestoneId,
        activityType: req.body.activityType ?? 'LESSON',
        durationMins: req.body.durationMins,
        privateNote: req.body.privateNote,
        publicNote: req.body.publicNote,
        tags: req.body.tags,
        userId,
        completedAt: req.body.completedAt ? new Date(req.body.completedAt) : undefined,
        materialsText: req.body.materialsText,
      },
    });
    const codes: string[] = req.body.outcomes ?? [];
    for (const code of codes) {
      const outcome = await prisma.outcome.upsert({
        where: { code },
        update: {},
        create: { subject: 'FRA', grade: 1, code, description: '' },
      });
      await prisma.activityOutcome.create({
        data: { activityId: activity.id, outcomeId: outcome.id },
      });
    }

    // Handle cognate associations
    const cognateIds: number[] = req.body.cognates ?? [];
    for (const cognateId of cognateIds) {
      await prisma.cognateActivity.create({
        data: { activityId: activity.id, cognatePairId: cognateId },
      });
    }

    const refreshed = await prisma.activity.findUnique({
      where: { id: activity.id },
      include: {
        outcomes: { include: { outcome: true } },
        cognatePairs: { include: { cognatePair: true } },
      },
    });
    res.status(201).json(refreshed);
  } catch (err) {
    next(err);
  }
});

router.patch('/reorder', validate(activityReorderSchema), async (req, res, next) => {
  const { milestoneId, activityIds } = req.body as {
    milestoneId: number;
    activityIds: number[];
  };
  try {
    const activities = await reorderActivities(milestoneId, activityIds);
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', validate(activityMaterialsSchema), async (req, res, next) => {
  try {
    const activity = await prisma.activity.update({
      where: { id: Number(req.params.id) },
      data: { materialsText: req.body.materialsText ?? null },
    });
    res.json(activity);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

router.put('/:id', validate(activityUpdateSchema), async (req, res, next) => {
  try {
    const activity = await prisma.activity.update({
      where: { id: Number(req.params.id) },
      data: {
        title: req.body.title,
        activityType: req.body.activityType,
        durationMins: req.body.durationMins,
        privateNote: req.body.privateNote,
        publicNote: req.body.publicNote,
        tags: req.body.tags,
        completedAt: req.body.completedAt ? new Date(req.body.completedAt) : undefined,
      },
    });
    await prisma.activityOutcome.deleteMany({ where: { activityId: activity.id } });
    const codes: string[] = req.body.outcomes ?? [];
    for (const code of codes) {
      const outcome = await prisma.outcome.upsert({
        where: { code },
        update: {},
        create: { subject: 'FRA', grade: 1, code, description: '' },
      });
      await prisma.activityOutcome.create({
        data: { activityId: activity.id, outcomeId: outcome.id },
      });
    }

    const refreshed = await prisma.activity.findUnique({
      where: { id: activity.id },
      include: { outcomes: { include: { outcome: true } } },
    });
    res.json(refreshed);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

router.patch('/:id/complete', async (req, res, next) => {
  const { completed = true, interactive = false } = req.body as {
    completed?: boolean;
    interactive?: boolean;
  };
  try {
    const activity = await prisma.activity.update({
      where: { id: Number(req.params.id) },
      data: { completedAt: completed ? new Date() : null },
    });
    res.json({ activity, showNotePrompt: interactive });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.activity.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

export default router;
