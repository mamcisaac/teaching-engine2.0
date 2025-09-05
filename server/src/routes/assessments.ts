import { logger } from '../logger';
/**
 * Assessment API Routes
 * ETFO 4-level mastery tracking for Grade 1 French Immersion
 */

import { PrismaClient } from '@teaching-engine/database';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';

const router = Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// GET /api/assessments - Get assessments with filters
router.get('/',
  [
    query('studentId').optional().isString(),
    query('subject').optional().isString(),
    query('level').optional().isIn(['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING']),
    query('evidenceType').optional().isIn(['OBSERVATION', 'CONVERSATION', 'PRODUCT']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt()
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const {
        studentId,
        subject,
        level,
        evidenceType,
        startDate,
        endDate,
        limit = 50,
        offset = 0
      } = req.query;

      const where: any = { teacherId: userId };

      if (studentId) where.studentId = studentId;
      if (subject) where.subject = subject;
      if (level) where.level = level;
      if (evidenceType) where.evidenceType = evidenceType;
      
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate as string);
        if (endDate) where.date.lte = new Date(endDate as string);
      }

      const [assessments, total] = await Promise.all([
        prisma.assessment.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentId: true,
                grade: true
              }
            }
          },
          orderBy: { date: 'desc' },
          take: limit as number,
          skip: offset as number
        }),
        prisma.assessment.count({ where })
      ]);

      res.json({
        assessments,
        total,
        limit,
        offset
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Error fetching assessments:');
      res.status(500).json({ error: 'Failed to fetch assessments' });
    }
  }
);

// GET /api/assessments/:id - Get single assessment
router.get('/:id',
  [param('id').isString()],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const assessment = await prisma.assessment.findFirst({
        where: {
          id: req.params.id,
          teacherId: userId
        },
        include: {
          student: true
        }
      });

      if (!assessment) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }

      res.json(assessment);
    } catch (error: unknown) {
      logger.error({ error }, 'Error fetching assessment:');
      res.status(500).json({ error: 'Failed to fetch assessment' });
    }
  }
);

// POST /api/assessments - Create new assessment
router.post('/',
  [
    body('studentId').isString().notEmpty(),
    body('subject').isString().notEmpty(),
    body('expectation').isString().notEmpty(),
    body('level').isIn(['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING']),
    body('evidenceType').isIn(['OBSERVATION', 'CONVERSATION', 'PRODUCT']),
    body('expectationCode').optional().isString(),
    body('description').optional().isString(),
    body('notes').optional().isString(),
    body('artifacts').optional().isArray(),
    body('date').optional().isISO8601()
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify student belongs to teacher
      const student = await prisma.student.findFirst({
        where: {
          id: req.body.studentId,
          userId
        }
      });

      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const assessment = await prisma.assessment.create({
        data: {
          studentId: req.body.studentId,
          teacherId: userId,
          subject: req.body.subject,
          expectation: req.body.expectation,
          expectationCode: req.body.expectationCode,
          level: req.body.level,
          evidenceType: req.body.evidenceType,
          description: req.body.description,
          notes: req.body.notes,
          artifacts: req.body.artifacts || [],
          date: req.body.date ? new Date(req.body.date) : new Date()
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true
            }
          }
        }
      });

      res.status(201).json(assessment);
    } catch (error: unknown) {
      logger.error({ error }, 'Error creating assessment:');
      res.status(500).json({ error: 'Failed to create assessment' });
    }
  }
);

// PUT /api/assessments/:id - Update assessment
router.put('/:id',
  [
    param('id').isString(),
    body('subject').optional().isString(),
    body('expectation').optional().isString(),
    body('level').optional().isIn(['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING']),
    body('evidenceType').optional().isIn(['OBSERVATION', 'CONVERSATION', 'PRODUCT']),
    body('description').optional().isString(),
    body('notes').optional().isString(),
    body('artifacts').optional().isArray()
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify assessment belongs to teacher
      const existing = await prisma.assessment.findFirst({
        where: {
          id: req.params.id,
          teacherId: userId
        }
      });

      if (!existing) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }

      const assessment = await prisma.assessment.update({
        where: { id: req.params.id },
        data: {
          ...req.body,
          updatedAt: new Date()
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true
            }
          }
        }
      });

      res.json(assessment);
    } catch (error: unknown) {
      logger.error({ error }, 'Error updating assessment:');
      res.status(500).json({ error: 'Failed to update assessment' });
    }
  }
);

// DELETE /api/assessments/:id - Delete assessment
router.delete('/:id',
  [param('id').isString()],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify assessment belongs to teacher
      const existing = await prisma.assessment.findFirst({
        where: {
          id: req.params.id,
          teacherId: userId
        }
      });

      if (!existing) {
        res.status(404).json({ error: 'Assessment not found' });
        return;
      }

      await prisma.assessment.delete({
        where: { id: req.params.id }
      });

      res.json({ success: true });
    } catch (error: unknown) {
      logger.error({ error }, 'Error deleting assessment:');
      res.status(500).json({ error: 'Failed to delete assessment' });
    }
  }
);

// POST /api/assessments/bulk - Create multiple assessments
router.post('/bulk',
  [
    body('assessments').isArray({ min: 1, max: 100 }),
    body('assessments.*.studentId').isString().notEmpty(),
    body('assessments.*.subject').isString().notEmpty(),
    body('assessments.*.expectation').isString().notEmpty(),
    body('assessments.*.level').isIn(['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING']),
    body('assessments.*.evidenceType').isIn(['OBSERVATION', 'CONVERSATION', 'PRODUCT'])
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Verify all students belong to teacher
      const studentIds = [...new Set(req.body.assessments.map((a: any) => a.studentId))] as string[];
      const students = await prisma.student.findMany({
        where: {
          id: { in: studentIds },
          userId
        },
        select: { id: true }
      });

      if (students.length !== studentIds.length) {
        res.status(400).json({ error: 'Some students not found or not authorized' });
        return;
      }

      const assessments = await prisma.assessment.createMany({
        data: req.body.assessments.map((a: any) => ({
          ...a,
          teacherId: userId,
          date: a.date ? new Date(a.date) : new Date(),
          artifacts: a.artifacts || []
        }))
      });

      res.status(201).json({
        created: assessments.count,
        success: true
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Error creating bulk assessments:');
      res.status(500).json({ error: 'Failed to create assessments' });
    }
  }
);

// GET /api/assessments/stats/evidence-balance - Get evidence triangulation stats
router.get('/stats/evidence-balance',
  [
    query('studentId').optional().isString(),
    query('subject').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const where: any = { teacherId: userId };

      if (req.query.studentId) where.studentId = req.query.studentId;
      if (req.query.subject) where.subject = req.query.subject;
      
      if (req.query.startDate || req.query.endDate) {
        where.date = {};
        if (req.query.startDate) where.date.gte = new Date(req.query.startDate as string);
        if (req.query.endDate) where.date.lte = new Date(req.query.endDate as string);
      }

      const assessments = await prisma.assessment.groupBy({
        by: ['evidenceType'],
        where,
        _count: {
          id: true
        }
      });

      const total = assessments.reduce((sum, a) => sum + a._count.id, 0);
      const balance = {
        OBSERVATION: 0,
        CONVERSATION: 0,
        PRODUCT: 0,
        total
      };

      assessments.forEach(a => {
        balance[a.evidenceType as keyof typeof balance] = a._count.id;
      });

      // Calculate percentages
      const percentages = {
        observation: total > 0 ? Math.round((balance.OBSERVATION / total) * 100) : 0,
        conversation: total > 0 ? Math.round((balance.CONVERSATION / total) * 100) : 0,
        product: total > 0 ? Math.round((balance.PRODUCT / total) * 100) : 0
      };

      res.json({
        counts: balance,
        percentages,
        isBalanced: Object.values(percentages).every(p => p >= 25 && p <= 40),
        recommendations: getBalanceRecommendations(percentages)
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Error fetching evidence balance:');
      res.status(500).json({ error: 'Failed to fetch evidence balance' });
    }
  }
);

// Helper function for balance recommendations
function getBalanceRecommendations(percentages: any) {
  const recommendations = [];
  
  if (percentages.observation < 25) {
    recommendations.push('Increase classroom observations');
  }
  if (percentages.conversation < 25) {
    recommendations.push('Conduct more student conferences');
  }
  if (percentages.product < 25) {
    recommendations.push('Collect more student work samples');
  }
  
  return recommendations;
}

export default router;