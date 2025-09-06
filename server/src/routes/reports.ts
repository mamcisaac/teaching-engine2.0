/**
 * Reports API Routes
 * PDF report generation for student progress
 */

import { PrismaClient } from '@teaching-engine/database';
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { param, query, validationResult } from 'express-validator';

import { logger } from '../logger';
import { reportGenerationRateLimit } from '../middleware/rateLimit/artifactRateLimit';
import { generateStudentReport, generateClassReport } from '../services/reportGenerator';

const router = Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

/**
 * GET /api/reports/student/:id
 * Generate individual student progress report
 */
router.get('/student/:id',
  requireAuth,
  reportGenerationRateLimit,
  [
    param('id').isString().isLength({ min: 1 }).withMessage('Student ID is required'),
    query('subject').optional().isString().withMessage('Subject must be a string'),
    query('includeArtifacts').optional().isBoolean().withMessage('Include artifacts must be boolean'),
    query('includeProgressChart').optional().isBoolean().withMessage('Include progress chart must be boolean'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid date')
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    try {
      const studentId = req.params.id;
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!studentId) {
        res.status(400).json({ error: 'Student ID is required' });
        return;
      }

      // Verify student belongs to teacher
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      });

      if (!student || student.userId !== userId) {
        res.status(404).json({ error: 'Student not found or access denied' });
        return;
      }

      // Generate report options
      const options = {
        subject: req.query.subject as string,
        includeArtifacts: req.query.includeArtifacts === 'true',
        includeProgressChart: req.query.includeProgressChart === 'true',
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      // Generate PDF report
      const reportBuffer = await generateStudentReport(studentId, userId, options);

      // Set headers for PDF download
      const fileName = `${student.firstName}_${student.lastName}_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', reportBuffer.length);
      
      res.send(reportBuffer);

    } catch (error: unknown) {
      logger.error({ error }, 'Student report generation failed:');
      res.status(500).json({ error: 'Failed to generate student report' });
    }
  }
);

/**
 * GET /api/reports/class
 * Generate class overview report
 */
router.get('/class',
  requireAuth,
  reportGenerationRateLimit,
  [
    query('subject').optional().isString().withMessage('Subject must be a string'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid date')
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    try {
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Generate report options
      const options = {
        subject: req.query.subject as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
      };

      // Generate PDF report
      const reportBuffer = await generateClassReport(userId, options);

      // Set headers for PDF download
      const fileName = `Class_Progress_Overview_${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', reportBuffer.length);
      
      res.send(reportBuffer);

    } catch (error: unknown) {
      logger.error({ error }, 'Class report generation failed:');
      res.status(500).json({ error: 'Failed to generate class report' });
    }
  }
);

/**
 * GET /api/reports/available
 * Get list of available report types and options
 */
router.get('/available',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get student count and subjects for report options
      const [studentCount, subjects] = await Promise.all([
        prisma.student.count({
          where: {
            userId,
            isActive: true
          }
        }),
        prisma.curriculumExpectation.findMany({
          select: { subject: true },
          distinct: ['subject']
        })
      ]);

      res.json({
        reportTypes: [
          {
            type: 'student',
            name: 'Individual Student Report',
            description: 'Detailed progress report for a specific student',
            available: studentCount > 0,
            options: {
              includeArtifacts: 'Include recent work samples',
              includeProgressChart: 'Include visual progress charts',
              subject: 'Filter by specific subject',
              dateRange: 'Specify time period'
            }
          },
          {
            type: 'class',
            name: 'Class Overview Report', 
            description: 'Summary report for all students in the class',
            available: studentCount > 0,
            options: {
              subject: 'Filter by specific subject',
              dateRange: 'Specify time period'
            }
          }
        ],
        options: {
          subjects: subjects.map(s => s.subject),
          studentCount
        }
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to get available reports:');
      res.status(500).json({ error: 'Failed to get available reports' });
    }
  }
);

export { router };