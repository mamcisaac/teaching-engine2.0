import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { validate } from '../validation';
import { z } from 'zod';
import {
  generateParentSummary,
  regenerateSummaryWithVariation,
} from '../services/parentSummaryLLM';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schemas
const generateSummarySchema = z.object({
  studentId: z.number().int().positive(),
  from: z.string().datetime(),
  to: z.string().datetime(),
  focus: z.array(z.string()).optional(),
});

const saveSummarySchema = z.object({
  studentId: z.number().int().positive(),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  focus: z.array(z.string()).optional(),
  contentFr: z.string().min(1),
  contentEn: z.string().min(1),
  isDraft: z.boolean().optional(),
});

const regenerateSchema = z.object({
  originalFrench: z.string(),
  originalEnglish: z.string(),
  studentId: z.number().int().positive(),
  from: z.string().datetime(),
  to: z.string().datetime(),
  focus: z.array(z.string()).optional(),
  tone: z.enum(['formal', 'informal']).optional(),
});

// Generate AI parent summary
router.post(
  '/generate',
  validate(generateSummarySchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { studentId, from, to, focus } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify the student belongs to the teacher
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          userId: parseInt(userId),
        },
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Fetch all relevant data for the student
      const dateFrom = new Date(from);
      const dateTo = new Date(to);

      // Get activities within the date range
      const activities = await prisma.activity.findMany({
        where: {
          userId: parseInt(userId),
          completedAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        include: {
          outcomes: {
            include: {
              outcome: true,
            },
          },
        },
      });

      // Get assessment results for the student
      const assessmentResults = await prisma.studentAssessmentResult.findMany({
        where: {
          studentId,
          assessment: {
            date: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        },
        include: {
          assessment: {
            include: {
              template: true,
            },
          },
        },
      });

      // Get student artifacts
      const artifacts = await prisma.studentArtifact.findMany({
        where: {
          studentId,
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
      });

      // Get student reflections
      const reflections = await prisma.studentReflection.findMany({
        where: {
          studentId,
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        include: {
          activity: true,
        },
      });

      // Filter activities by focus areas if provided
      let filteredActivities = activities;
      if (focus && focus.length > 0) {
        filteredActivities = activities.filter((activity) =>
          activity.outcomes.some(({ outcome }) =>
            focus.some((f) => outcome.subject.toLowerCase().includes(f.toLowerCase())),
          ),
        );
      }

      // Generate the summary
      const summary = await generateParentSummary({
        studentData: {
          studentName: `${student.firstName} ${student.lastName}`,
          grade: student.grade,
          activities: filteredActivities,
          assessments: assessmentResults.map((result) => ({
            studentResult: result,
            assessment: result.assessment,
          })),
          artifacts,
          reflections,
        },
        dateFrom,
        dateTo,
        focus,
      });

      res.json(summary);
    } catch (err) {
      next(err);
    }
  },
);

// Save parent summary
router.post('/save', validate(saveSummarySchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { studentId, dateFrom, dateTo, focus, contentFr, contentEn, isDraft = true } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the student belongs to the teacher
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: parseInt(userId),
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const summary = await prisma.parentSummary.create({
      data: {
        studentId,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        focus: JSON.stringify(focus || []),
        contentFr,
        contentEn,
        isDraft,
      },
    });

    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// Get all summaries for a student
router.get('/student/:studentId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const studentId = parseInt(req.params.studentId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the student belongs to the teacher
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: parseInt(userId),
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const summaries = await prisma.parentSummary.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(summaries);
  } catch (err) {
    next(err);
  }
});

// Update summary
router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const summaryId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the summary belongs to a student of this teacher
    const existingSummary = await prisma.parentSummary.findUnique({
      where: { id: summaryId },
      include: { student: true },
    });

    if (!existingSummary || existingSummary.student.userId !== parseInt(userId)) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    const summary = await prisma.parentSummary.update({
      where: { id: summaryId },
      data: req.body,
    });

    res.json(summary);
  } catch (err) {
    next(err);
  }
});

// Delete summary
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const summaryId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify the summary belongs to a student of this teacher
    const existingSummary = await prisma.parentSummary.findUnique({
      where: { id: summaryId },
      include: { student: true },
    });

    if (!existingSummary || existingSummary.student.userId !== parseInt(userId)) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    await prisma.parentSummary.delete({
      where: { id: summaryId },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Regenerate summary with variation
router.post(
  '/regenerate',
  validate(regenerateSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const {
        originalFrench,
        originalEnglish,
        studentId,
        from,
        to,
        focus,
        tone = 'formal',
      } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Verify the student belongs to the teacher
      const student = await prisma.student.findFirst({
        where: {
          id: studentId,
          userId: parseInt(userId),
        },
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Fetch student data (similar to generate endpoint)
      const dateFrom = new Date(from);
      const dateTo = new Date(to);

      const activities = await prisma.activity.findMany({
        where: {
          userId: parseInt(userId),
          completedAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        include: {
          outcomes: {
            include: {
              outcome: true,
            },
          },
        },
      });

      const regeneratedSummary = await regenerateSummaryWithVariation(
        { french: originalFrench, english: originalEnglish },
        {
          studentData: {
            studentName: `${student.firstName} ${student.lastName}`,
            grade: student.grade,
            activities,
            assessments: [],
            artifacts: [],
            reflections: [],
          },
          dateFrom,
          dateTo,
          focus,
        },
        tone,
      );

      res.json(regeneratedSummary);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
