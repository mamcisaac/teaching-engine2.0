import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import {
  validate,
  studentCreateSchema,
  studentGoalCreateSchema,
  studentGoalUpdateSchema,
  studentReflectionCreateSchema,
} from '../validation';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Student routes
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const students = await prisma.student.findMany({
      where: { userId },
      include: {
        goals: { include: { outcome: true, theme: true } },
        reflections: { include: { outcome: true, theme: true } },
      },
    });
    res.json(students);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const student = await prisma.student.findFirst({
      where: {
        id: Number(req.params.id),
        userId,
      },
      include: {
        goals: { include: { outcome: true, theme: true } },
        reflections: { include: { outcome: true, theme: true } },
      },
    });
    if (!student) return res.status(404).json({ error: 'Not Found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
});

router.post('/', validate(studentCreateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const student = await prisma.student.create({
      data: {
        name: req.body.name,
        userId,
      },
      include: {
        goals: { include: { outcome: true, theme: true } },
        reflections: { include: { outcome: true, theme: true } },
      },
    });
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validate(studentCreateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const student = await prisma.student.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
      },
      include: {
        goals: { include: { outcome: true, theme: true } },
        reflections: { include: { outcome: true, theme: true } },
      },
    });
    res.json(student);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await prisma.student.delete({
      where: {
        id: Number(req.params.id),
        userId,
      },
    });
    res.status(204).end();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
    next(err);
  }
});

// Student goals routes
router.get('/:id/goals', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const student = await prisma.student.findFirst({
      where: {
        id: Number(req.params.id),
        userId,
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const goals = await prisma.studentGoal.findMany({
      where: { studentId: Number(req.params.id) },
      include: { outcome: true, theme: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/:id/goals',
  validate(studentGoalCreateSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = parseInt(req.user?.userId || '0', 10);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const student = await prisma.student.findFirst({
        where: {
          id: Number(req.params.id),
          userId,
        },
      });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      const goal = await prisma.studentGoal.create({
        data: {
          studentId: Number(req.params.id),
          text: req.body.text,
          outcomeId: req.body.outcomeId || null,
          themeId: req.body.themeId || null,
          status: req.body.status || 'active',
        },
        include: { outcome: true, theme: true },
      });
      res.status(201).json(goal);
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  '/:id/goals/:goalId',
  validate(studentGoalUpdateSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = parseInt(req.user?.userId || '0', 10);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const student = await prisma.student.findFirst({
        where: {
          id: Number(req.params.id),
          userId,
        },
      });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      const goal = await prisma.studentGoal.update({
        where: {
          id: Number(req.params.goalId),
          studentId: Number(req.params.id),
        },
        data: {
          text: req.body.text,
          status: req.body.status,
          outcomeId: req.body.outcomeId,
          themeId: req.body.themeId,
        },
        include: { outcome: true, theme: true },
      });
      res.json(goal);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return res.status(404).json({ error: 'Goal not found' });
      }
      next(err);
    }
  },
);

router.delete('/:id/goals/:goalId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const student = await prisma.student.findFirst({
      where: {
        id: Number(req.params.id),
        userId,
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    await prisma.studentGoal.delete({
      where: {
        id: Number(req.params.goalId),
        studentId: Number(req.params.id),
      },
    });
    res.status(204).end();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Goal not found' });
    }
    next(err);
  }
});

// Student reflections routes
router.get('/:id/reflections', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const student = await prisma.student.findFirst({
      where: {
        id: Number(req.params.id),
        userId,
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const reflections = await prisma.studentReflection.findMany({
      where: { studentId: Number(req.params.id) },
      include: { outcome: true, theme: true },
      orderBy: { date: 'desc' },
    });
    res.json(reflections);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/:id/reflections',
  validate(studentReflectionCreateSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = parseInt(req.user?.userId || '0', 10);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const student = await prisma.student.findFirst({
        where: {
          id: Number(req.params.id),
          userId,
        },
      });
      if (!student) return res.status(404).json({ error: 'Student not found' });

      const reflection = await prisma.studentReflection.create({
        data: {
          studentId: Number(req.params.id),
          date: req.body.date ? new Date(req.body.date) : new Date(),
          text: req.body.text || null,
          emoji: req.body.emoji || null,
          voicePath: req.body.voicePath || null,
          outcomeId: req.body.outcomeId || null,
          themeId: req.body.themeId || null,
        },
        include: { outcome: true, theme: true },
      });
      res.status(201).json(reflection);
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/:id/reflections/:reflectionId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const student = await prisma.student.findFirst({
      where: {
        id: Number(req.params.id),
        userId,
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    await prisma.studentReflection.delete({
      where: {
        id: Number(req.params.reflectionId),
        studentId: Number(req.params.id),
      },
    });
    res.status(204).end();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ error: 'Reflection not found' });
    }
    next(err);
  }
});

export default router;
