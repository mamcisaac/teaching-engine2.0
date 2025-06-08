import { Router } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const notes = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body as { message: string };
    if (!message) return res.status(400).json({ error: 'Invalid data' });
    const note = await prisma.notification.create({ data: { message } });
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const note = await prisma.notification.update({
      where: { id: Number(req.params.id) },
      data: { read: true },
    });
    res.json(note);
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

export default router;
