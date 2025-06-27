import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { z } from 'zod';
import { auditLoggers } from '../middleware/auditLog';

const router = Router();

// Validation schemas
const studentCreateSchema = z
  .object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    grade: z.number().int().min(1).max(12).optional(),
    // Legacy field for backward compatibility
    name: z.string().min(1).max(200).optional(),
  })
  .refine(
    (data) => {
      // Either use new fields (firstName, lastName, grade) or legacy name field
      return (data.firstName && data.lastName && typeof data.grade === 'number') || data.name;
    },
    {
      message: 'Either provide firstName, lastName, and grade, or provide name',
    },
  );

const studentUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  grade: z.number().int().min(1).max(12).optional(),
  name: z.string().min(1).max(200).optional(),
});

const studentGoalCreateSchema = z.object({
  text: z.string().min(1).max(500),
  // themeId removed - ThematicUnit model archived
  unitPlanId: z.number().int().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).default('active'),
});

const studentGoalUpdateSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  // themeId removed - ThematicUnit model archived
  unitPlanId: z.number().int().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).optional(),
});

const studentReflectionCreateSchema = z.object({
  date: z.string().datetime().optional(),
  text: z.string().max(1000).optional(),
  content: z.string().max(1000).optional(),
  emoji: z.string().max(10).optional(),
  voicePath: z.string().max(500).optional(),
  // themeId removed - ThematicUnit model archived
  unitPlanId: z.number().int().optional(),
});

// Get all students for the authenticated teacher
router.get('/', auditLoggers.studentView, async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const students = await prisma.student.findMany({
      where: { userId: userId },
      include: {
        goals: true,
        reflections: true,
        _count: {
          select: {
            artifacts: true,
            reflections: true,
            parentSummaries: true,
          },
        },
      },
      orderBy: [{ grade: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
    });

    // Add backward compatibility for name field and mask sensitive data
    const studentsWithLegacy = students.map((student) => ({
      ...student,
      name:
        student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : 'Unnamed Student',
      // Remove any accidentally included sensitive fields
      createdAt: undefined,
      updatedAt: undefined,
    }));

    res.json(studentsWithLegacy);
  } catch (err) {
    next(err);
  }
});

// Get a specific student
router.get('/:id', auditLoggers.studentView, async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    const studentId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: userId,
      },
      include: {
        goals: true,
        reflections: true,
        artifacts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        parentSummaries: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Add backward compatibility for name field and mask sensitive data
    const studentWithLegacy = {
      ...student,
      name:
        student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : 'Unnamed Student',
      // Remove any accidentally included sensitive fields
      createdAt: undefined,
      updatedAt: undefined,
    };

    res.json(studentWithLegacy);
  } catch (err) {
    next(err);
  }
});

// Create a new student
router.post(
  '/',
  validate(studentCreateSchema),
  auditLoggers.studentCreate,
  async (req: Request, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { firstName, lastName, grade, name } = req.body;

      // Handle both new and legacy formats
      let studentData;
      if (firstName && lastName && grade !== undefined) {
        // New parent communication format
        studentData = {
          firstName,
          lastName,
          grade,
          userId: userId,
        };
      } else if (name) {
        // Legacy format - extract first and last name from full name
        const nameParts = name.trim().split(' ');
        const firstNamePart = nameParts[0] || 'Unknown';
        const lastNamePart = nameParts.slice(1).join(' ') || 'Student';

        studentData = {
          firstName: firstNamePart,
          lastName: lastNamePart,
          grade: 1, // Default grade for legacy students
          userId: userId,
        };
      } else {
        return res.status(400).json({ error: 'Invalid student data' });
      }

      const student = await prisma.student.create({
        data: studentData,
        include: {
          goals: true,
          reflections: true,
        },
      });

      // Add backward compatibility for name field
      const studentWithLegacy = {
        ...student,
        name: `${student.firstName} ${student.lastName}`,
      };

      res.status(201).json(studentWithLegacy);
    } catch (err) {
      next(err);
    }
  },
);

// Update a student
router.put(
  '/:id',
  validate(studentUpdateSchema),
  auditLoggers.studentUpdate,
  async (req: Request, res, next) => {
    try {
      const userId = req.user?.id;
      const studentId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify the student belongs to this teacher
      const existingStudent = await prisma.student.findFirst({
        where: {
          id: studentId,
          userId: userId,
        },
      });

      if (!existingStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const { firstName, lastName, grade, name } = req.body;

      const updateData: Record<string, unknown> = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (grade !== undefined) updateData.grade = grade;

      // Handle legacy name field
      if (name !== undefined) {
        const nameParts = name.trim().split(' ');
        updateData.firstName = nameParts[0] || 'Unknown';
        updateData.lastName = nameParts.slice(1).join(' ') || 'Student';
      }

      const student = await prisma.student.update({
        where: { id: studentId },
        data: updateData,
        include: {
          goals: true,
          reflections: true,
        },
      });

      // Add backward compatibility for name field
      const studentWithLegacy = {
        ...student,
        name: `${student.firstName} ${student.lastName}`,
      };

      res.json(studentWithLegacy);
    } catch (err) {
      next(err);
    }
  },
);

// Delete a student
router.delete('/:id', auditLoggers.studentDelete, async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    const studentId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the student belongs to this teacher
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: userId,
      },
    });

    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete related data in a transaction for data integrity
    await prisma.$transaction(
      async (tx) => {
        // Delete in dependency order
        await tx.studentArtifact.deleteMany({ where: { studentId } });
        await tx.studentReflection.deleteMany({ where: { studentId } });
        await tx.studentGoal.deleteMany({ where: { studentId } });
        await tx.parentSummary.deleteMany({ where: { studentId } });

        // Finally delete the student
        await tx.student.delete({ where: { id: studentId } });
      },
      {
        // Set a timeout for the transaction
        timeout: 10000, // 10 seconds
      },
    );

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Student goals routes
router.get('/:id/goals', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id || 0;
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
      // theme removed - ThematicUnit model archived
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/goals', validate(studentGoalCreateSchema), async (req: Request, res, next) => {
  try {
    const userId = req.user?.id || 0;
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
        unitPlanId: req.body.unitPlanId || null,
        status: req.body.status || 'active',
      },
      // theme removed - ThematicUnit model archived
    });
    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/:id/goals/:goalId',
  validate(studentGoalUpdateSchema),
  async (req: Request, res, next) => {
    try {
      const userId = req.user?.id || 0;
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
          unitPlanId: req.body.unitPlanId,
        },
        // theme removed - ThematicUnit model archived
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

router.delete('/:id/goals/:goalId', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id || 0;
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
router.get('/:id/reflections', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id || 0;
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
      // theme removed - ThematicUnit model archived
      orderBy: { createdAt: 'desc' },
    });
    res.json(reflections);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/:id/reflections',
  validate(studentReflectionCreateSchema),
  async (req: Request, res, next) => {
    try {
      const userId = req.user?.id || 0;
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
          content: req.body.content || req.body.text || null,
          date: req.body.date ? new Date(req.body.date) : new Date(),
          unitPlanId: req.body.unitPlanId || null,
        },
        // theme removed - ThematicUnit model archived
      });
      res.status(201).json(reflection);
    } catch (err) {
      next(err);
    }
  },
);

router.delete('/:id/reflections/:reflectionId', async (req: Request, res, next) => {
  try {
    const userId = req.user?.id || 0;
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

// Get student progress summary
router.get('/:id/progress', auditLoggers.studentView, async (req: Request, res, next) => {
  try {
    const userId = req.user?.id;
    const studentId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: userId,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Assessment functionality removed

    res.json({
      student,
      progress: {
        totalAssessments: 0,
        averageScore: null,
        assessmentsByType: {},
        artifactCount: await prisma.studentArtifact.count({ where: { studentId } }),
        reflectionCount: await prisma.studentReflection.count({ where: { studentId } }),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
