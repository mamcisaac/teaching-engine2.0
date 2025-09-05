import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AchievementLevel } from '@teaching-engine/database';
import { authenticate } from '../middleware/auth';
import { prisma } from '../prisma';

const router = Router();

// Validation schemas
const createAssessmentSchema = z.object({
  studentId: z.string().min(1),
  lessonId: z.string().optional(),
  expectationId: z.string().optional(),
  subject: z.string().min(1),
  title: z.string().min(1),
  level: z.nativeEnum(AchievementLevel),
  notes: z.string().optional(),
  date: z.string().datetime().optional(),
});

const updateAssessmentSchema = z.object({
  level: z.nativeEnum(AchievementLevel).optional(),
  notes: z.string().optional(),
  title: z.string().min(1).optional(),
});

// GET /api/student-assessments - Get assessments for a user with pagination
router.get('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { 
      studentId, 
      subject, 
      date,
      page = '1',
      limit = '20'
    } = req.query;

    // Parse pagination params
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100); // Max 100 items
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };
    
    if (studentId) where.studentId = studentId;
    if (subject) where.subject = subject;
    
    // Fixed date filtering for daily assessments
    if (date) {
      const targetDate = new Date(date as string);
      where.date = {
        gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.studentAssessment.count({ where });

    const assessments = await prisma.studentAssessment.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            titleFr: true,
            date: true,
          }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limitNum,
    });

    res.json({
      data: assessments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching student assessments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/student-assessments - Create new assessment
router.post('/', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validatedData = createAssessmentSchema.parse(req.body);

    const assessment = await prisma.studentAssessment.create({
      data: {
        ...validatedData,
        userId,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            titleFr: true,
            date: true,
          }
        }
      }
    });

    res.status(201).json(assessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating student assessment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/student-assessments/:id - Update assessment
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const validatedData = updateAssessmentSchema.parse(req.body);

    // Check if assessment exists and belongs to user
    const existingAssessment = await prisma.studentAssessment.findFirst({
      where: { id, userId }
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const assessment = await prisma.studentAssessment.update({
      where: { id },
      data: validatedData,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            titleFr: true,
            date: true,
          }
        }
      }
    });

    res.json(assessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating student assessment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/student-assessments/:id - Delete assessment
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    // Check if assessment exists and belongs to user
    const existingAssessment = await prisma.studentAssessment.findFirst({
      where: { id, userId }
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    await prisma.studentAssessment.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting student assessment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/student-assessments/differentiation-groups - Generate differentiation groups
router.post('/differentiation-groups', authenticate, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { subject, date } = req.body as { subject?: string; date?: string };
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const where: any = { userId, subject };
    if (date) {
      const targetDate = new Date(date);
      where.date = {
        gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
      };
    }

    const assessments = await prisma.studentAssessment.findMany({
      where,
      select: {
        studentId: true,
        level: true,
      }
    });

    // Generate differentiation groups based on achievement levels
    const groups = {
      reteaching: [] as string[],    // NOT_YET students
      support: [] as string[],       // APPROACHING students  
      independent: [] as string[],   // MEETING students
      extension: [] as string[],     // EXCEEDING students
    };

    assessments.forEach(assessment => {
      switch (assessment.level) {
        case AchievementLevel.NOT_YET:
          groups.reteaching.push(assessment.studentId);
          break;
        case AchievementLevel.APPROACHING:
          groups.support.push(assessment.studentId);
          break;
        case AchievementLevel.MEETING:
          groups.independent.push(assessment.studentId);
          break;
        case AchievementLevel.EXCEEDING:
          groups.extension.push(assessment.studentId);
          break;
      }
    });

    res.json(groups);
  } catch (error) {
    console.error('Error generating differentiation groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router };