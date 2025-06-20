import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { thematicUnitCreateSchema, thematicUnitUpdateSchema } from '../validation';

const router = Router();

// GET /api/thematic-units - Get thematic units
router.get('/', async (req, res, next) => {
  const { userId, startDate, endDate } = req.query as {
    userId?: string;
    startDate?: string;
    endDate?: string;
  };

  try {
    const where: {
      userId?: number;
      OR?: Array<{
        startDate?: { gte: Date; lte: Date };
        endDate?: { gte: Date; lte: Date };
      }>;
    } = {
      ...(userId ? { userId: Number(userId) } : {}),
    };

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      where.OR = [{ startDate: { gte: start, lte: end } }, { endDate: { gte: start, lte: end } }];
    }

    const thematicUnits = await prisma.thematicUnit.findMany({
      where,
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
                domain: true,
              },
            },
          },
        },
        activities: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                titleEn: true,
                titleFr: true,
                tags: true,
                milestone: {
                  select: {
                    id: true,
                    title: true,
                    subject: {
                      select: {
                        id: true,
                        name: true,
                        nameEn: true,
                        nameFr: true,
                      },
                    },
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
      orderBy: { startDate: 'desc' },
    });

    res.json(thematicUnits);
  } catch (err) {
    next(err);
  }
});

// POST /api/thematic-units - Create a new thematic unit
router.post('/', validate(thematicUnitCreateSchema), async (req, res, next) => {
  const {
    title,
    titleEn,
    titleFr,
    description,
    descriptionEn,
    descriptionFr,
    startDate,
    endDate,
    outcomes = [],
    activities = [],
  } = req.body;
  const userId = parseInt((req as AuthRequest).user!.userId, 10);

  try {
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    const thematicUnit = await prisma.thematicUnit.create({
      data: {
        title,
        titleEn,
        titleFr,
        description,
        descriptionEn,
        descriptionFr,
        startDate: start,
        endDate: end,
        userId,
        outcomes: {
          create: outcomes.map((outcomeId: string) => ({
            outcome: {
              connect: { id: outcomeId },
            },
          })),
        },
        activities: {
          create: activities.map((activityId: number) => ({
            activity: {
              connect: { id: activityId },
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
                domain: true,
              },
            },
          },
        },
        activities: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                titleEn: true,
                titleFr: true,
                tags: true,
                milestone: {
                  select: {
                    id: true,
                    title: true,
                    subject: {
                      select: {
                        id: true,
                        name: true,
                        nameEn: true,
                        nameFr: true,
                      },
                    },
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

    res.status(201).json(thematicUnit);
  } catch (err) {
    next(err);
  }
});

// PUT /api/thematic-units/:id - Update a thematic unit
router.put('/:id', validate(thematicUnitUpdateSchema), async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    titleEn,
    titleFr,
    description,
    descriptionEn,
    descriptionFr,
    startDate,
    endDate,
    outcomes,
    activities,
  } = req.body;

  try {
    const existingUnit = await prisma.thematicUnit.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUnit) {
      return res.status(404).json({ error: 'Thematic unit not found' });
    }

    // Validate date range if dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return res.status(400).json({ error: 'Start date must be before end date' });
      }
    }

    const updateData: {
      title?: string;
      titleEn?: string;
      titleFr?: string;
      description?: string;
      descriptionEn?: string;
      descriptionFr?: string;
      startDate?: Date;
      endDate?: Date;
      outcomes?: {
        deleteMany: Record<string, never>;
        create: Array<{ outcome: { connect: { id: string } } }>;
      };
      activities?: {
        deleteMany: Record<string, never>;
        create: Array<{ activity: { connect: { id: number } } }>;
      };
    } = {
      ...(title !== undefined ? { title } : {}),
      ...(titleEn !== undefined ? { titleEn } : {}),
      ...(titleFr !== undefined ? { titleFr } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(descriptionEn !== undefined ? { descriptionEn } : {}),
      ...(descriptionFr !== undefined ? { descriptionFr } : {}),
      ...(startDate !== undefined ? { startDate: new Date(startDate) } : {}),
      ...(endDate !== undefined ? { endDate: new Date(endDate) } : {}),
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

    if (activities !== undefined) {
      updateData.activities = {
        deleteMany: {},
        create: activities.map((activityId: number) => ({
          activity: {
            connect: { id: activityId },
          },
        })),
      };
    }

    const thematicUnit = await prisma.thematicUnit.update({
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
                domain: true,
              },
            },
          },
        },
        activities: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                titleEn: true,
                titleFr: true,
                tags: true,
                milestone: {
                  select: {
                    id: true,
                    title: true,
                    subject: {
                      select: {
                        id: true,
                        name: true,
                        nameEn: true,
                        nameFr: true,
                      },
                    },
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

    res.json(thematicUnit);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/thematic-units/:id - Delete a thematic unit
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const existingUnit = await prisma.thematicUnit.findUnique({
      where: { id: Number(id) },
    });

    if (!existingUnit) {
      return res.status(404).json({ error: 'Thematic unit not found' });
    }

    await prisma.thematicUnit.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/thematic-units/:id - Get a specific thematic unit
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    const thematicUnit = await prisma.thematicUnit.findUnique({
      where: { id: Number(id) },
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
                domain: true,
              },
            },
          },
        },
        activities: {
          include: {
            activity: {
              select: {
                id: true,
                title: true,
                titleEn: true,
                titleFr: true,
                tags: true,
                durationMins: true,
                milestone: {
                  select: {
                    id: true,
                    title: true,
                    subject: {
                      select: {
                        id: true,
                        name: true,
                        nameEn: true,
                        nameFr: true,
                      },
                    },
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

    if (!thematicUnit) {
      return res.status(404).json({ error: 'Thematic unit not found' });
    }

    res.json(thematicUnit);
  } catch (err) {
    next(err);
  }
});

export default router;
