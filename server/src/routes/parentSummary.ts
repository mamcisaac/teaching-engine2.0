import { Router, Request } from 'express';
import { prisma } from '../prisma';
import { generateParentSummary, regenerateParentSummary } from '../services/parentSummaryLLM';
import { z } from 'zod';

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

const regenerateSummarySchema = z.object({
  originalFrench: z.string().min(1),
  originalEnglish: z.string().min(1),
  studentId: z.number().int().positive(),
  from: z.string().datetime(),
  to: z.string().datetime(),
  focus: z.array(z.string()).optional(),
  tone: z.enum(['formal', 'informal']).optional(),
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

// Generate a new parent summary using AI
router.post('/generate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = generateSummarySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const { studentId, from, to, focus } = validation.data;

    // Verify the student belongs to this teacher
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: parseInt(userId),
      },
      include: {
        parentContacts: true,
        artifacts: {
          where: {
            createdAt: {
              gte: new Date(from),
              lte: new Date(to),
            },
          },
        },
        reflections: {
          where: {
            createdAt: {
              gte: new Date(from),
              lte: new Date(to),
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Generate the summary using AI
    const summaryData = await generateParentSummary({
      student,
      fromDate: new Date(from),
      toDate: new Date(to),
      focusAreas: focus,
    });

    res.json(summaryData);
  } catch (err) {
    console.error('Error generating parent summary:', err);
    next(err);
  }
});

// Regenerate an existing summary with variations
router.post('/regenerate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = regenerateSummarySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const { originalFrench, originalEnglish, studentId, from, to, focus, tone } = validation.data;

    // Verify the student belongs to this teacher
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: parseInt(userId),
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Regenerate the summary with variations
    const summaryData = await regenerateParentSummary({
      originalFrench,
      originalEnglish,
      student,
      fromDate: new Date(from),
      toDate: new Date(to),
      focusAreas: focus,
      tone: tone || 'formal',
    });

    res.json(summaryData);
  } catch (err) {
    console.error('Error regenerating parent summary:', err);
    next(err);
  }
});

// Save a summary to the database
router.post('/save', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validation = saveSummarySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validation.error.flatten(),
      });
    }

    const { studentId, dateFrom, dateTo, focus, contentFr, contentEn, isDraft } = validation.data;

    // Verify the student belongs to this teacher
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: parseInt(userId),
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Save the summary
    const summary = await prisma.parentSummary.create({
      data: {
        studentId,
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        focus: JSON.stringify(focus || []),
        contentFr,
        contentEn,
        isDraft: isDraft ?? true,
      },
    });

    res.status(201).json(summary);
  } catch (err) {
    console.error('Error saving parent summary:', err);
    next(err);
  }
});

// Get all summaries for a specific student
router.get('/student/:studentId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const studentId = parseInt(req.params.studentId);

    // Verify the student belongs to this teacher
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

// Update a summary
router.put('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const summaryId = parseInt(req.params.id);

    // Verify the summary belongs to a student of this teacher
    const existingSummary = await prisma.parentSummary.findFirst({
      where: {
        id: summaryId,
        student: {
          userId: parseInt(userId),
        },
      },
    });

    if (!existingSummary) {
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

// Delete a summary
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const summaryId = parseInt(req.params.id);

    // Verify the summary belongs to a student of this teacher
    const existingSummary = await prisma.parentSummary.findFirst({
      where: {
        id: summaryId,
        student: {
          userId: parseInt(userId),
        },
      },
    });

    if (!existingSummary) {
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

export default router;
