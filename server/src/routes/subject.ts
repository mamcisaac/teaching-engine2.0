import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { validate, subjectSchema } from '../validation';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const subjects = await prisma.subject.findMany({
      where: {
        OR: [
          { userId: userId },
          { userId: null }, // Include subjects without a user (shared/system subjects)
        ],
      },
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

router.post('/', validate(subjectSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const subject = await prisma.subject.create({
      data: {
        name: req.body.name,
        userId,
      },
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
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
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
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Not Found' });
      }
      if (err.code === 'P2003') {
        return res
          .status(400)
          .json({ error: 'Cannot delete subject with existing milestones or activities' });
      }
    }
    next(err);
  }
});

export default router;
