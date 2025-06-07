import { Router } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const activities = await prisma.activity.findMany();
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!activity) return res.status(404).json({ error: 'Not Found' });
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const activity = await prisma.activity.create({
      data: {
        title: req.body.title,
        milestoneId: req.body.milestoneId,
        durationMins: req.body.durationMins,
        privateNote: req.body.privateNote,
        publicNote: req.body.publicNote,
        completedAt: req.body.completedAt ? new Date(req.body.completedAt) : undefined,
      },
    });
    res.status(201).json(activity);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const activity = await prisma.activity.update({
      where: { id: Number(req.params.id) },
      data: {
        title: req.body.title,
        durationMins: req.body.durationMins,
        privateNote: req.body.privateNote,
        publicNote: req.body.publicNote,
        completedAt: req.body.completedAt ? new Date(req.body.completedAt) : undefined,
      },
    });
    res.json(activity);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
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
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

export default router;
