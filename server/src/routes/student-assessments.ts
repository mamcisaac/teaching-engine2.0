// Define AchievementLevel locally since it's not exported from the database package
const AchievementLevel = {
  EXCEEDING: 'EXCEEDING',
  MEETING: 'MEETING',
  APPROACHING: 'APPROACHING',
  BEGINNING: 'BEGINNING',
  NOT_YET: 'NOT_YET'
} as const;
type AchievementLevel = typeof AchievementLevel[keyof typeof AchievementLevel];
import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

import { logger } from '../logger';
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
router.get('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { 
      studentId, 
      subject, 
      date,
      page = '1',
      limit = '20',
      includeAnecdotal = 'false' // New parameter to optionally include anecdotal notes
    } = req.query;

    // Parse pagination params
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100); // Max 100 items
    const skip = (pageNum - 1) * limitNum;

    const where: {
      userId: number;
      isAnecdotal?: boolean;
      studentId?: string;
      subject?: string;
      date?: {
        gte: Date;
        lt: Date;
      };
    } = { 
      userId: parseInt(String(userId), 10),
      // Exclude anecdotal notes by default unless explicitly requested
      isAnecdotal: includeAnecdotal === 'true' ? undefined : false
    };
    
    if (studentId) where.studentId = studentId as string;
    if (subject) where.subject = subject as string;
    
    // Fixed date filtering for daily assessments
    if (date) {
      const targetDate = new Date(date as string);
      where.date = {
        gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.studentAssessment.count({ where: where as unknown });

    const assessments = await prisma.studentAssessment.findMany({
      where: where as unknown,
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

    return res.json({
      data: assessments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching student assessments:');
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/student-assessments - Create new assessment
router.post('/', async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const validatedData = createAssessmentSchema.parse(req.body);

    // Detect anecdotal notes and flag them appropriately
    const isAnecdotal = typeof validatedData.subject === 'string' && validatedData.subject.startsWith('ANECDOTAL_') || false;

    const assessment = await prisma.studentAssessment.create({
      data: {
        ...validatedData,
        userId: parseInt(String(userId), 10),
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        isAnecdotal // Automatically flag anecdotal notes
      } as any,
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

    return res.status(201).json(assessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error({ error }, 'Error creating student assessment:');
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/student-assessments/:id - Update assessment
router.put('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;
    const validatedData = updateAssessmentSchema.parse(req.body);

    // Check if assessment exists and belongs to user
    const existingAssessment = await prisma.studentAssessment.findFirst({
      where: { id, userId: parseInt(String(userId), 10) }
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

    return res.json(assessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error({ error }, 'Error updating student assessment:');
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/student-assessments/:id - Delete assessment
router.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { id } = req.params;

    // Check if assessment exists and belongs to user
    const existingAssessment = await prisma.studentAssessment.findFirst({
      where: { id, userId: parseInt(String(userId), 10) }
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    await prisma.studentAssessment.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error) {
    logger.error({ error }, 'Error deleting student assessment:');
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/student-assessments/differentiation-groups - Get differentiation groups
router.get('/differentiation-groups', async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { subject, date } = req.query as { subject?: string; date?: string };
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const where: any = {
      userId: parseInt(String(userId), 10),
      subject: subject,
      isAnecdotal: false,
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.date = {
        gte: startDate,
        lt: endDate
      };
    }

    // Get recent assessments
    const assessments = await prisma.studentAssessment.findMany({
      where,
      orderBy: {
        date: 'desc'
      },
      take: 100 // Limit to recent assessments
    });

    // Group students by achievement level
    const groups: Record<string, string[]> = {
      extension: [],
      independent: [],
      support: [],
      reteaching: []
    };

    // Get latest assessment for each student
    const studentLatestAssessment = new Map<string, string>();
    assessments.forEach(assessment => {
      if (!studentLatestAssessment.has(assessment.studentId)) {
        studentLatestAssessment.set(assessment.studentId, assessment.level);
      }
    });

    // Categorize students
    studentLatestAssessment.forEach((level, studentId) => {
      switch (level) {
        case 'EXCEEDING':
          groups.extension.push(studentId);
          break;
        case 'MEETING':
          groups.independent.push(studentId);
          break;
        case 'APPROACHING':
          groups.support.push(studentId);
          break;
        case 'NOT_YET':
        case 'BEGINNING':
          groups.reteaching.push(studentId);
          break;
      }
    });

    return res.json(groups);
  } catch (error) {
    logger.error({ error }, 'Error generating differentiation groups:');
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/student-assessments/differentiation-groups - Generate differentiation groups
router.post('/differentiation-groups', async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { subject, date } = req.body as { subject?: string; date?: string };
    if (!subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    const where: any = { 
      userId: parseInt(String(userId), 10), 
      subject: subject,
      isAnecdotal: false // Exclude anecdotal notes from differentiation groups
    };
    if (date) {
      const targetDate = new Date(date);
      where.date = {
        gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
      };
    }

    const assessments = await prisma.studentAssessment.findMany({
      where: where as unknown,
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
        case 'NOT_YET':
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

    return res.json(groups);
  } catch (error) {
    logger.error({ error }, 'Error generating differentiation groups:');
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router };