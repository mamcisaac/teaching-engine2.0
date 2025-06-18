import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { validate, milestoneCreateSchema, milestoneUpdateSchema } from '../validation';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const milestones = await prisma.milestone.findMany({
      include: {
        activities: {
          include: {
            outcomes: { include: { outcome: true } },
          },
        },
        outcomes: { include: { outcome: true } },
      },
      orderBy: { startDate: 'asc' },
    });
    res.json(milestones);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        activities: {
          orderBy: { orderIndex: 'asc' },
          include: {
            outcomes: { include: { outcome: true } },
          },
        },
        outcomes: {
          include: { outcome: true },
          orderBy: { outcome: { code: 'asc' } },
        },
      },
    });
    if (!milestone) return res.status(404).json({ error: 'Not Found' });
    res.json(milestone);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(milestoneCreateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const milestone = await prisma.milestone.create({
      data: {
        title: req.body.title,
        subjectId: req.body.subjectId,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : undefined,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        estHours: req.body.estHours,
        description: req.body.description,
        userId,
      },
    });

    const codes: string[] = req.body.outcomes ?? [];
    for (const code of codes) {
      const outcome = await prisma.outcome.upsert({
        where: { code },
        update: {},
        create: {
          subject: 'General',
          grade: 1,
          code,
          description: `Outcome ${code}`,
          domain: 'General',
        },
      });
      await prisma.milestoneOutcome.create({
        data: { milestoneId: milestone.id, outcomeId: outcome.id },
      });
    }

    const refreshed = await prisma.milestone.findUnique({
      where: { id: milestone.id },
      include: {
        activities: {
          include: {
            outcomes: { include: { outcome: true } },
          },
        },
        outcomes: { include: { outcome: true } },
      },
    });
    res.status(201).json(refreshed);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(milestoneUpdateSchema), async (req, res, next) => {
  try {
    const milestone = await prisma.milestone.update({
      where: { id: Number(req.params.id) },
      data: {
        title: req.body.title,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : undefined,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        estHours: req.body.estHours,
        description: req.body.description,
      },
    });

    await prisma.milestoneOutcome.deleteMany({ where: { milestoneId: milestone.id } });
    const codes: string[] = req.body.outcomes ?? [];
    for (const code of codes) {
      const outcome = await prisma.outcome.upsert({
        where: { code },
        update: {},
        create: {
          subject: 'General',
          grade: 1,
          code,
          description: `Outcome ${code}`,
          domain: 'General',
        },
      });
      await prisma.milestoneOutcome.create({
        data: { milestoneId: milestone.id, outcomeId: outcome.id },
      });
    }

    const refreshed = await prisma.milestone.findUnique({
      where: { id: milestone.id },
      include: {
        activities: {
          include: {
            outcomes: { include: { outcome: true } },
          },
        },
        outcomes: { include: { outcome: true } },
      },
    });
    res.json(refreshed);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.milestone.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

export default router;
