import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';
import { validate } from '../validation';
import {
  oralRoutineTemplateCreateSchema,
  oralRoutineTemplateUpdateSchema,
  dailyOralRoutineCreateSchema,
  dailyOralRoutineUpdateSchema,
} from '../validation';

const router = Router();

// GET /api/oral-routines/templates - Get oral routine templates
router.get('/templates', async (req, res, next) => {
  const { userId } = req.query as { userId?: string };

  try {
    const templates = await prisma.oralRoutineTemplate.findMany({
      where: {
        ...(userId ? { userId: Number(userId) } : {}),
      },
      include: {
        outcomes: {
          include: {
            outcome: {
              select: {
                id: true,
                code: true,
                description: true,
                subject: true,
                grade: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            dailyRoutines: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(templates);
  } catch (err) {
    next(err);
  }
});

// POST /api/oral-routines/templates - Create a new oral routine template
router.post('/templates', validate(oralRoutineTemplateCreateSchema), async (req, res, next) => {
  const {
    title,
    titleEn,
    titleFr,
    description,
    descriptionEn,
    descriptionFr,
    outcomes = [],
  } = req.body;
  const userId = (req as AuthRequest).userId!;

  try {
    const template = await prisma.oralRoutineTemplate.create({
      data: {
        title,
        titleEn,
        titleFr,
        description,
        descriptionEn,
        descriptionFr,
        userId,
        outcomes: {
          create: outcomes.map((outcomeId: string) => ({
            outcome: {
              connect: { id: outcomeId },
            },
          })),
        },
      },
      include: {
        outcomes: {
          include: {
            outcome: {
              select: {
                id: true,
                code: true,
                description: true,
                subject: true,
                grade: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(template);
  } catch (err) {
    next(err);
  }
});

// PUT /api/oral-routines/templates/:id - Update an oral routine template
router.put('/templates/:id', validate(oralRoutineTemplateUpdateSchema), async (req, res, next) => {
  const { id } = req.params;
  const { title, titleEn, titleFr, description, descriptionEn, descriptionFr, outcomes } = req.body;

  try {
    const existingTemplate = await prisma.oralRoutineTemplate.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Oral routine template not found' });
    }

    // If outcomes are provided, update the relationships
    const updateData: {
      title?: string;
      titleEn?: string;
      titleFr?: string;
      description?: string;
      descriptionEn?: string;
      descriptionFr?: string;
      outcomes?: {
        deleteMany: Record<string, never>;
        create: Array<{ outcome: { connect: { id: string } } }>;
      };
    } = {
      ...(title !== undefined ? { title } : {}),
      ...(titleEn !== undefined ? { titleEn } : {}),
      ...(titleFr !== undefined ? { titleFr } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(descriptionEn !== undefined ? { descriptionEn } : {}),
      ...(descriptionFr !== undefined ? { descriptionFr } : {}),
    };

    if (outcomes !== undefined) {
      updateData.outcomes = {
        deleteMany: {},
        create: outcomes.map((outcomeId: string) => ({
          outcome: {
            connect: { id: outcomeId },
          },
        })),
      };
    }

    const template = await prisma.oralRoutineTemplate.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        outcomes: {
          include: {
            outcome: {
              select: {
                id: true,
                code: true,
                description: true,
                subject: true,
                grade: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(template);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/oral-routines/templates/:id - Delete an oral routine template
router.delete('/templates/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const existingTemplate = await prisma.oralRoutineTemplate.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Oral routine template not found' });
    }

    await prisma.oralRoutineTemplate.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/oral-routines/daily - Get daily oral routines
router.get('/daily', async (req, res, next) => {
  const { date, userId, startDate, endDate } = req.query as {
    date?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  };

  try {
    const where: {
      userId?: number;
      date?: {
        gte: Date;
        lte: Date;
      };
    } = {
      ...(userId ? { userId: Number(userId) } : {}),
    };

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const dailyRoutines = await prisma.dailyOralRoutine.findMany({
      where,
      include: {
        template: {
          include: {
            outcomes: {
              include: {
                outcome: {
                  select: {
                    id: true,
                    code: true,
                    description: true,
                    subject: true,
                    grade: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json(dailyRoutines);
  } catch (err) {
    next(err);
  }
});

// POST /api/oral-routines/daily - Create a new daily oral routine
router.post('/daily', validate(dailyOralRoutineCreateSchema), async (req, res, next) => {
  const { date, templateId, completed = false, notes, participation } = req.body;
  const userId = (req as AuthRequest).userId!;

  try {
    // Verify template exists
    const template = await prisma.oralRoutineTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({ error: 'Oral routine template not found' });
    }

    const dailyRoutine = await prisma.dailyOralRoutine.create({
      data: {
        date: new Date(date),
        templateId,
        completed,
        notes,
        participation,
        userId,
      },
      include: {
        template: {
          include: {
            outcomes: {
              include: {
                outcome: {
                  select: {
                    id: true,
                    code: true,
                    description: true,
                    subject: true,
                    grade: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(dailyRoutine);
  } catch (err) {
    next(err);
  }
});

// PUT /api/oral-routines/daily/:id - Update a daily oral routine
router.put('/daily/:id', validate(dailyOralRoutineUpdateSchema), async (req, res, next) => {
  const { id } = req.params;
  const { completed, notes, participation } = req.body;

  try {
    const existingRoutine = await prisma.dailyOralRoutine.findUnique({
      where: { id: Number(id) },
    });

    if (!existingRoutine) {
      return res.status(404).json({ error: 'Daily oral routine not found' });
    }

    const dailyRoutine = await prisma.dailyOralRoutine.update({
      where: { id: Number(id) },
      data: {
        ...(completed !== undefined ? { completed } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(participation !== undefined ? { participation } : {}),
      },
      include: {
        template: {
          include: {
            outcomes: {
              include: {
                outcome: {
                  select: {
                    id: true,
                    code: true,
                    description: true,
                    subject: true,
                    grade: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(dailyRoutine);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/oral-routines/daily/:id - Delete a daily oral routine
router.delete('/daily/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const existingRoutine = await prisma.dailyOralRoutine.findUnique({
      where: { id: Number(id) },
    });

    if (!existingRoutine) {
      return res.status(404).json({ error: 'Daily oral routine not found' });
    }

    await prisma.dailyOralRoutine.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/oral-routines/stats - Get routine completion statistics
router.get('/stats', async (req, res, next) => {
  const { userId, startDate, endDate } = req.query as {
    userId?: string;
    startDate?: string;
    endDate?: string;
  };

  try {
    const where: {
      userId?: number;
      date?: {
        gte: Date;
        lte: Date;
      };
    } = {
      ...(userId ? { userId: Number(userId) } : {}),
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [totalRoutines, completedRoutines, avgParticipation] = await Promise.all([
      prisma.dailyOralRoutine.count({ where }),
      prisma.dailyOralRoutine.count({ where: { ...where, completed: true } }),
      prisma.dailyOralRoutine.aggregate({
        where: {
          ...where,
          participation: { not: null },
        },
        _avg: {
          participation: true,
        },
      }),
    ]);

    const completionRate = totalRoutines > 0 ? (completedRoutines / totalRoutines) * 100 : 0;

    res.json({
      totalRoutines,
      completedRoutines,
      completionRate: Math.round(completionRate),
      averageParticipation: avgParticipation._avg.participation
        ? Math.round(avgParticipation._avg.participation)
        : null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
