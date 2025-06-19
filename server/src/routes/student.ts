import { Router } from 'express';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Validation schemas
const studentCreateSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    grade: z.string().optional(),
    parentEmail: z.string().email().optional().or(z.literal('')),
    notes: z.string().optional(),
  }),
});

const studentUpdateSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    grade: z.string().optional(),
    parentEmail: z.string().email().optional().or(z.literal('')),
    notes: z.string().optional(),
  }),
});

const artifactCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    filePath: z.string().min(1),
    type: z.enum(['image', 'audio', 'video', 'pdf']),
    date: z.string(),
    outcomeIds: z.array(z.string()).default([]),
    notes: z.string().optional(),
  }),
});

const reflectionCreateSchema = z.object({
  body: z.object({
    date: z.string(),
    content: z.string().min(1),
    tags: z.array(z.string()).default([]),
    studentIds: z.array(z.number()).default([]),
    outcomeIds: z.array(z.string()).default([]),
  }),
});

// GET /api/students - Get all students
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    const students = await prisma.student.findMany({
      where: { teacherId: userId },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    res.json(students);
  } catch (err) {
    next(err);
  }
});

// POST /api/students - Create a new student
router.post(
  '/',
  authMiddleware,
  validate(studentCreateSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.userId!;
      const { firstName, lastName, grade, parentEmail, notes } = req.body;

      const student = await prisma.student.create({
        data: {
          firstName,
          lastName,
          grade,
          parentEmail,
          notes,
          teacherId: userId,
        },
      });

      res.status(201).json(student);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/students/:id - Get single student details
router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: {
        id: parseInt(id),
        teacherId: userId,
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

// PUT /api/students/:id - Update student
router.put(
  '/:id',
  authMiddleware,
  validate(studentUpdateSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const student = await prisma.student.update({
        where: {
          id: parseInt(id),
          teacherId: userId,
        },
        data: req.body,
      });

      res.json(student);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/students/:id - Delete student
router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Delete related data first
    await prisma.studentArtifact.deleteMany({
      where: { studentId: parseInt(id) },
    });

    await prisma.studentAssessmentResult.deleteMany({
      where: { studentId: parseInt(id) },
    });

    await prisma.student.delete({
      where: {
        id: parseInt(id),
        teacherId: userId,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/students/:id/profile - Get comprehensive student profile
router.get('/:id/profile', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const student = await prisma.student.findFirst({
      where: {
        id: parseInt(id),
        teacherId: userId,
      },
      include: {
        artifacts: {
          orderBy: { date: 'desc' },
        },
        assessmentResults: {
          include: {
            assessmentResult: {
              include: {
                template: {
                  select: {
                    title: true,
                    type: true,
                    outcomeIds: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        reflectionTags: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Parse JSON fields
    const profileData = {
      ...student,
      artifacts: student.artifacts.map((artifact) => ({
        ...artifact,
        outcomeIds: JSON.parse(artifact.outcomeIds),
      })),
      assessmentResults: student.assessmentResults.map((result) => ({
        ...result,
        assessmentResult: result.assessmentResult
          ? {
              ...result.assessmentResult,
              template: {
                ...result.assessmentResult.template,
                outcomeIds: JSON.parse(result.assessmentResult.template.outcomeIds),
              },
            }
          : null,
      })),
      reflectionTags: student.reflectionTags.map((reflection) => ({
        ...reflection,
        tags: JSON.parse(reflection.tags),
        outcomeIds: JSON.parse(reflection.outcomeIds),
      })),
    };

    res.json(profileData);
  } catch (err) {
    next(err);
  }
});

// GET /api/students/:id/artifacts - Get student artifacts
router.get('/:id/artifacts', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify student belongs to teacher
    const student = await prisma.student.findFirst({
      where: {
        id: parseInt(id),
        teacherId: userId,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const artifacts = await prisma.studentArtifact.findMany({
      where: { studentId: parseInt(id) },
      orderBy: { date: 'desc' },
    });

    const artifactsWithParsedOutcomes = artifacts.map((artifact) => ({
      ...artifact,
      outcomeIds: JSON.parse(artifact.outcomeIds),
    }));

    res.json(artifactsWithParsedOutcomes);
  } catch (err) {
    next(err);
  }
});

// POST /api/students/:id/artifacts - Upload student artifact
router.post(
  '/:id/artifacts',
  authMiddleware,
  validate(artifactCreateSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { title, filePath, type, date, outcomeIds, notes } = req.body;

      // Verify student belongs to teacher
      const student = await prisma.student.findFirst({
        where: {
          id: parseInt(id),
          teacherId: userId,
        },
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const artifact = await prisma.studentArtifact.create({
        data: {
          studentId: parseInt(id),
          title,
          filePath,
          type,
          date: new Date(date),
          outcomeIds: JSON.stringify(outcomeIds),
          notes,
        },
      });

      res.status(201).json({
        ...artifact,
        outcomeIds: JSON.parse(artifact.outcomeIds),
      });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/students/:id/artifacts/:artifactId - Delete artifact
router.delete('/:id/artifacts/:artifactId', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id, artifactId } = req.params;

    // Verify student belongs to teacher
    const student = await prisma.student.findFirst({
      where: {
        id: parseInt(id),
        teacherId: userId,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await prisma.studentArtifact.delete({
      where: {
        id: parseInt(artifactId),
        studentId: parseInt(id),
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/students/:id/outcome-summary - Get outcome coverage for a student
router.get('/:id/outcome-summary', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify student belongs to teacher
    const student = await prisma.student.findFirst({
      where: {
        id: parseInt(id),
        teacherId: userId,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get all artifacts and their outcomes
    const artifacts = await prisma.studentArtifact.findMany({
      where: { studentId: parseInt(id) },
      select: { outcomeIds: true, date: true },
    });

    // Get all assessment results for this student
    const assessmentResults = await prisma.studentAssessmentResult.findMany({
      where: { studentId: parseInt(id) },
      include: {
        assessmentResult: {
          include: {
            template: {
              select: { outcomeIds: true },
            },
          },
        },
      },
    });

    // Get reflections tagged with this student
    const reflections = await prisma.reflectionJournalEntry.findMany({
      where: {
        studentTags: {
          some: { id: parseInt(id) },
        },
      },
      select: { outcomeIds: true, date: true },
    });

    // Aggregate outcome coverage
    const outcomeCoverage = new Map<
      string,
      {
        count: number;
        lastActivity: Date | null;
        sources: string[];
      }
    >();

    // Process artifacts
    artifacts.forEach((artifact) => {
      const outcomeIds = JSON.parse(artifact.outcomeIds) as string[];
      outcomeIds.forEach((outcomeId) => {
        const existing = outcomeCoverage.get(outcomeId) || {
          count: 0,
          lastActivity: null,
          sources: [],
        };
        existing.count++;
        existing.sources.push('artifact');
        if (!existing.lastActivity || artifact.date > existing.lastActivity) {
          existing.lastActivity = artifact.date;
        }
        outcomeCoverage.set(outcomeId, existing);
      });
    });

    // Process assessments
    assessmentResults.forEach((result) => {
      if (result.assessmentResult?.template) {
        const outcomeIds = JSON.parse(result.assessmentResult.template.outcomeIds) as string[];
        outcomeIds.forEach((outcomeId) => {
          const existing = outcomeCoverage.get(outcomeId) || {
            count: 0,
            lastActivity: null,
            sources: [],
          };
          existing.count++;
          existing.sources.push('assessment');
          if (!existing.lastActivity || result.assessmentResult.date > existing.lastActivity) {
            existing.lastActivity = result.assessmentResult.date;
          }
          outcomeCoverage.set(outcomeId, existing);
        });
      }
    });

    // Process reflections
    reflections.forEach((reflection) => {
      const outcomeIds = JSON.parse(reflection.outcomeIds) as string[];
      outcomeIds.forEach((outcomeId) => {
        const existing = outcomeCoverage.get(outcomeId) || {
          count: 0,
          lastActivity: null,
          sources: [],
        };
        existing.count++;
        existing.sources.push('reflection');
        if (!existing.lastActivity || reflection.date > existing.lastActivity) {
          existing.lastActivity = reflection.date;
        }
        outcomeCoverage.set(outcomeId, existing);
      });
    });

    // Get outcome details
    const outcomeIds = Array.from(outcomeCoverage.keys());
    const outcomes = await prisma.outcome.findMany({
      where: { id: { in: outcomeIds } },
    });

    const summary = outcomes.map((outcome) => ({
      outcome,
      coverage: outcomeCoverage.get(outcome.id)!,
    }));

    res.json({
      studentId: parseInt(id),
      totalOutcomesCovered: summary.length,
      outcomeSummary: summary,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/reflections - Create reflection journal entry
router.post(
  '/reflections',
  authMiddleware,
  validate(reflectionCreateSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.userId!;
      const { date, content, tags, studentIds, outcomeIds } = req.body;

      const reflection = await prisma.reflectionJournalEntry.create({
        data: {
          teacherId: userId,
          date: new Date(date),
          content,
          tags: JSON.stringify(tags),
          outcomeIds: JSON.stringify(outcomeIds),
          studentTags: {
            connect: studentIds.map((id: number) => ({ id })),
          },
        },
        include: {
          studentTags: true,
        },
      });

      res.status(201).json({
        ...reflection,
        tags: JSON.parse(reflection.tags),
        outcomeIds: JSON.parse(reflection.outcomeIds),
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
