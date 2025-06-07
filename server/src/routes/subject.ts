import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: { milestones: true },
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
      include: { milestones: true },
    });
    if (!subject) return res.status(404).json({ error: 'Not Found' });
    res.json(subject);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const subject = await prisma.subject.create({
      data: { name: req.body.name },
    });
    res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const subject = await prisma.subject.update({
      where: { id: Number(req.params.id) },
      data: { name: req.body.name },
    });
    res.json(subject);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.subject.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
