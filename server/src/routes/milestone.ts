import { Router } from 'express';
import { Prisma } from '@teaching-engine/database';
import { prisma } from '../prisma';
import { validate, milestoneCreateSchema, milestoneUpdateSchema } from '../validation';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const where: Prisma.MilestoneWhereInput = {};
    if (typeof req.query.standards === 'string') {
      where.standardCodes = { contains: req.query.standards };
    }
    const milestones = await prisma.milestone.findMany({
      where,
      include: { activities: true },
    });
    res.json(
      milestones.map((m) => ({
        ...m,
        standardCodes: JSON.parse(m.standardCodes),
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const milestone = await prisma.milestone.findUnique({
      where: { id: Number(req.params.id) },
      include: { activities: true },
    });
    if (!milestone) return res.status(404).json({ error: 'Not Found' });
    res.json({
      ...milestone,
      standardCodes: JSON.parse(milestone.standardCodes),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(milestoneCreateSchema), async (req, res, next) => {
  try {
    const milestone = await prisma.milestone.create({
      data: {
        title: req.body.title,
        subjectId: req.body.subjectId,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : undefined,
        estHours: req.body.estHours,
        description: req.body.description,
        standardCodes: JSON.stringify(req.body.standardCodes ?? []),
      },
    });
    res.status(201).json({
      ...milestone,
      standardCodes: JSON.parse(milestone.standardCodes),
    });
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
        estHours: req.body.estHours,
        description: req.body.description,
        standardCodes: JSON.stringify(req.body.standardCodes ?? []),
      },
    });
    res.json({
      ...milestone,
      standardCodes: JSON.parse(milestone.standardCodes),
    });
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
