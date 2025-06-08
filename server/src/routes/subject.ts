import { Router } from 'express';
import { PrismaClientKnownRequestError } from '@teaching-engine/database/runtime/library';
import { prisma } from '../prisma';
import { validate, subjectSchema } from '../validation';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        milestones: {
          include: { activities: true },
        },
      },
    });
    res.json(subjects);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        milestones: {
          include: { activities: true },
        },
      },
    });
    if (!subject) return res.status(404).json({ error: 'Not Found' });
    res.json(subject);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(subjectSchema), async (req, res, next) => {
  try {
    const subject = await prisma.subject.create({
      data: { name: req.body.name },
    });
    res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(subjectSchema), async (req, res, next) => {
  try {
    const subject = await prisma.subject.update({
      where: { id: Number(req.params.id) },
      data: { name: req.body.name },
    });
    res.json(subject);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.subject.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

export default router;
