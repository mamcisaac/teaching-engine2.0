import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schemas
const studentCreateSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    grade: z.number().int().min(1).max(12),
    parentContacts: z
      .array(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
        }),
      )
      .optional(),
  }),
});

const studentUpdateSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    grade: z.number().int().min(1).max(12).optional(),
  }),
});

const parentContactSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
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

    res.json(students);
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
        reflections: {
          include: {
            activity: true,
          },
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

    res.json(student);
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

    const { firstName, lastName, grade, parentContacts } = req.body;

    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        grade,
        userId: parseInt(userId),
        parentContacts: {
          create: parentContacts || [],
        },
      },
      include: {
        parentContacts: true,
      },
    });

    res.status(201).json(student);
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

    const student = await prisma.student.update({
      where: { id: studentId },
      data: req.body,
      include: {
        parentContacts: true,
      },
    });

    res.json(student);
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
