import { Router, Request } from 'express';
import { Prisma } from '../prisma';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schemas
const studentCreateSchema = z
  .object({
    // New parent communication fields
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    grade: z.number().int().min(1).max(12).optional(),
    parentContacts: z
      .array(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
        }),
      )
      .optional(),
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

const parentContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const studentGoalCreateSchema = z.object({
  text: z.string().min(1).max(500),
  outcomeId: z.string().optional(),
  themeId: z.number().int().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).default('active'),
});

const studentGoalUpdateSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  outcomeId: z.string().optional(),
  themeId: z.number().int().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).optional(),
});

const studentReflectionCreateSchema = z.object({
  date: z.string().datetime().optional(),
  text: z.string().max(1000).optional(),
  content: z.string().max(1000).optional(), // New field for parent communication
  emoji: z.string().max(10).optional(),
  voicePath: z.string().max(500).optional(),
  outcomeId: z.string().optional(),
  themeId: z.number().int().optional(),
  activityId: z.number().int().optional(),
});

// Get all students for the authenticated teacher
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const students = await prisma.student.findMany({
      where: { userId: parseInt(userId) },
      include: {
        parentContacts: true,
        goals: { include: { outcome: true, theme: true } },
        reflections: { include: { outcome: true, theme: true, activity: true } },
        _count: {
          select: {
            assessmentResults: true,
            artifacts: true,
            reflections: true,
            parentSummaries: true,
          },
        },
      },
      orderBy: [{ grade: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
    });

    // Add backward compatibility for name field
    const studentsWithLegacy = students.map((student) => ({
      ...student,
      name:
        student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : `${student.firstName} ${student.lastName}` || 'Unnamed Student',
    }));

    res.json(studentsWithLegacy);
  } catch (err) {
    next(err);
  }
});

// Get a specific student
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const studentId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: parseInt(userId),
      },
      include: {
        parentContacts: true,
        goals: { include: { outcome: true, theme: true } },
        reflections: { include: { outcome: true, theme: true, activity: true } },
        assessmentResults: {
          include: {
            assessment: {
              include: {
                template: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
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

    // Add backward compatibility for name field
    const studentWithLegacy = {
      ...student,
      name:
        student.firstName && student.lastName
          ? `${student.firstName} ${student.lastName}`
          : `${student.firstName} ${student.lastName}` || 'Unnamed Student',
    };

    res.json(studentWithLegacy);
  } catch (err) {
    next(err);
  }
});

// Create a new student
router.post('/', validate(studentCreateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, grade, parentContacts, name } = req.body;

    // Handle both new and legacy formats
    let studentData;
    if (firstName && lastName && grade !== undefined) {
      // New parent communication format
      studentData = {
        firstName,
        lastName,
        grade,
        userId: parseInt(userId),
        parentContacts: {
          create: parentContacts || [],
        },
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
        userId: parseInt(userId),
        parentContacts: {
          create: [],
        },
      };
    } else {
      return res.status(400).json({ error: 'Invalid student data' });
    }

    const student = await prisma.student.create({
      data: studentData,
      include: {
        parentContacts: true,
        goals: { include: { outcome: true, theme: true } },
        reflections: { include: { outcome: true, theme: true, activity: true } },
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
});

// Update a student
router.put('/:id', validate(studentUpdateSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const studentId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the student belongs to this teacher
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: parseInt(userId),
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
        parentContacts: true,
        goals: { include: { outcome: true, theme: true } },
        reflections: { include: { outcome: true, theme: true, activity: true } },
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
});

// Delete a student
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const studentId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the student belongs to this teacher
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: parseInt(userId),
      },
    });

    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Delete related data first (cascade delete)
    await prisma.$transaction([
      prisma.parentContact.deleteMany({ where: { studentId } }),
      prisma.studentAssessmentResult.deleteMany({ where: { studentId } }),
      prisma.studentArtifact.deleteMany({ where: { studentId } }),
      prisma.studentReflection.deleteMany({ where: { studentId } }),
      prisma.studentGoal.deleteMany({ where: { studentId } }),
      prisma.parentSummary.deleteMany({ where: { studentId } }),
      prisma.student.delete({ where: { id: studentId } }),
    ]);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Add parent contact to student
router.post(
  '/:id/contacts',
  validate(parentContactSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.user?.userId;
      const studentId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify the student belongs to this teacher
      const existingStudent = await prisma.student.findFirst({
        where: {
          id: studentId,
          userId: parseInt(userId),
        },
      });

      if (!existingStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const contact = await prisma.parentContact.create({
        data: {
          ...req.body,
          studentId,
        },
      });

      res.status(201).json(contact);
    } catch (err) {
      next(err);
    }
  },
);

// Delete parent contact
router.delete('/:studentId/contacts/:contactId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const studentId = parseInt(req.params.studentId);
    const contactId = parseInt(req.params.contactId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the student belongs to this teacher
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: parseInt(userId),
      },
    });

    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await prisma.parentContact.delete({
      where: { id: contactId },
    });

    res.status(204).send();
  } catch (err) {
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
      include: { outcome: true, theme: true, activity: true },
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
          content: req.body.content || req.body.text || null,
          createdAt: req.body.date ? new Date(req.body.date) : new Date(),
          activityId: req.body.activityId || null,
          outcomeId: req.body.outcomeId || null,
          themeId: req.body.themeId || null,
        },
        include: { outcome: true, theme: true, activity: true },
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

// Get student progress summary
router.get('/:id/progress', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const studentId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: parseInt(userId),
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get assessment statistics
    const assessmentStats = await prisma.studentAssessmentResult.aggregate({
      where: { studentId },
      _avg: { score: true },
      _count: true,
    });

    // Get recent assessments by type
    const recentAssessments = await prisma.studentAssessmentResult.findMany({
      where: { studentId },
      include: {
        assessment: {
          include: {
            template: true,
          },
        },
      },
      orderBy: { assessment: { date: 'desc' } },
      take: 5,
    });

    // Group by assessment type
    const assessmentsByType = recentAssessments.reduce(
      (acc, result) => {
        const type = result.assessment.template.type;
        if (!acc[type]) acc[type] = [];
        acc[type].push(result);
        return acc;
      },
      {} as Record<string, typeof recentAssessments>,
    );

    res.json({
      student,
      progress: {
        totalAssessments: assessmentStats._count,
        averageScore: assessmentStats._avg.score,
        assessmentsByType,
        artifactCount: await prisma.studentArtifact.count({ where: { studentId } }),
        reflectionCount: await prisma.studentReflection.count({ where: { studentId } }),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
