/**
 * Student Management API Routes
 * Includes CSV bulk import for classroom setup
 */

import { PrismaClient } from '@teaching-engine/database';
import { prisma } from '../prisma';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';

import { logger } from '../logger';
import { bulkOperationRateLimit, artifactViewRateLimit } from '../middleware/rateLimit/artifactRateLimit';
import { importStudentsFromCSV, validateCSVFormat, generateCSVTemplate, exportStudentsToCSV } from '../services/csvImport';
import { getStudentsOptimized, invalidateUserCache } from '../services/performanceOptimizer';
import { checkClassQuota, checkStudentQuota, formatBytes } from '../services/quotaManager';
import { AssessmentAggregationService } from '../services/assessmentAggregation';

const router = Router();

// Configure multer for CSV uploads
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024, // 1MB max for CSV
    files: 1
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}


/**
 * GET /api/students
 * List all students for the teacher
 */
router.get('/',
  artifactViewRateLimit,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      // Direct query (bypass cache to prevent corruption)
      const students = await prisma.student.findMany({
        where: {
          userId,
          isActive: true
        },
        include: {
          _count: {
            select: {
              artifacts: { where: { isArchived: false } }
            }
          }
        },
        orderBy: [
          { grade: 'asc' },
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });
      
      res.json({
        students: students.map(student => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: student.studentNumber, // Map for client compatibility
          studentNumber: student.studentNumber,
          dateOfBirth: '2018-01-01', // Default value as DB doesn't have this field
          grade: student.grade,
          program: 'French Immersion', // Default value as DB doesn't have this field
          hasIEP: false, // Default value as DB doesn't have this field
          notes: student.notes || '',
          createdAt: student.createdAt.toISOString(),
          updatedAt: student.updatedAt.toISOString(),
          status: student.isActive ? 'active' : 'archived',
          assessmentCount: student._count.artifacts
        })),
        total: students.length
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to fetch students:');
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  }
);

/**
 * POST /api/students/import/csv
 * Bulk import students from CSV file
 */
router.post('/import/csv',
  bulkOperationRateLimit,
  csvUpload.single('csvFile'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'CSV file is required' });
        return;
      }

      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const options = {
        skipDuplicates: req.body.skipDuplicates === 'true',
        updateExisting: req.body.updateExisting === 'true'
      };

      // Validate CSV format first
      const validation = validateCSVFormat(req.file.buffer);
      if (!validation.valid) {
        res.status(400).json({
          error: 'Invalid CSV format',
          details: validation.errors
        });
        return;
      }

      // Import students
      const result = await importStudentsFromCSV(req.file.buffer, userId, options);

      // Invalidate cache after bulk import
      if (result.imported > 0) {
        await invalidateUserCache(userId);
      }

      res.status(result.success ? 200 : 207).json({
        success: result.success,
        imported: result.imported,
        failed: result.failed,
        errors: result.errors,
        students: result.students,
        message: result.success
          ? `Successfully imported ${result.imported} students`
          : `Imported ${result.imported} students with ${result.failed} errors`
      });

    } catch (error: unknown) {
      logger.error({ error }, 'CSV import failed:');
      res.status(500).json({ error: 'CSV import failed' });
    }
  }
);

/**
 * GET /api/students/template/csv
 * Download CSV template for student import
 */
router.get('/template/csv',
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const template = generateCSVTemplate();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="student_import_template.csv"');
      res.send(template);
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to generate template:');
      res.status(500).json({ error: 'Failed to generate template' });
    }
  }
);

/**
 * GET /api/students/export/csv
 * Export all students to CSV
 */
router.get('/export/csv',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const csv = await exportStudentsToCSV(userId);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="students_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to export students:');
      res.status(500).json({ error: 'Failed to export students' });
    }
  }
);

/**
 * GET /api/students/quota/report
 * Get storage quota usage report for all students
 */
router.get('/quota/report',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const report = await checkClassQuota(userId);
      
      res.json({
        summary: {
          totalStudents: report.totalStudents,
          totalUsage: formatBytes(report.totalUsageBytes),
          averageUsage: `${report.averageUsagePercent.toFixed(1)}%`,
          studentsOverWarning: report.studentsOverWarning,
          studentsOverCritical: report.studentsOverCritical,
          studentsOverQuota: report.studentsOverQuota
        },
        students: report.students.map(s => ({
          ...s,
          totalUsage: formatBytes(s.totalBytes),
          quota: formatBytes(s.quotaBytes)
        }))
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to get quota report:');
      res.status(500).json({ error: 'Failed to get quota report' });
    }
  }
);

/**
 * GET /api/students/:id/quota
 * Get storage quota usage for specific student
 */
router.get('/:id/quota',
  [param('id').isString().isLength({ min: 1 }).withMessage('Student ID is required')],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    try {
      const studentId = req.params.id;
      if (!studentId) {
        res.status(400).json({ error: 'Student ID is required' });
        return;
      }
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const quota = await checkStudentQuota(studentId, userId);
      
      res.json({
        ...quota,
        totalUsage: formatBytes(quota.totalBytes),
        quota: formatBytes(quota.quotaBytes),
        largestFiles: quota.largestFiles.map(f => ({
          ...f,
          size: formatBytes(f.size)
        }))
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to get student quota:');
      if ((error as Error).message.includes('not found')) {
        res.status(404).json({ error: 'Student not found' });
      } else {
        res.status(500).json({ error: 'Failed to get quota information' });
      }
    }
  }
);

/**
 * POST /api/students
 * Create a single student
 */
router.post('/',
  [
    body('firstName').isString().isLength({ min: 1, max: 100 }).withMessage('First name is required (1-100 characters)'),
    body('lastName').isString().isLength({ min: 1, max: 100 }).withMessage('Last name is required (1-100 characters)'),
    body('studentId').optional().isString().isLength({ max: 50 }).withMessage('Student ID must be less than 50 characters'),
    body('grade').optional().isString().isLength({ max: 10 }).withMessage('Grade must be less than 10 characters'),
    body('email').optional().isEmail().withMessage('Must be a valid email'),
    body('parentEmail').optional().isEmail().withMessage('Must be a valid email'),
    body('notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
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
      const student = await prisma.student.create({
        data: {
          userId: userId,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          studentNumber: req.body.studentId || `${req.body.firstName[0]}${req.body.lastName[0]}${Date.now()}`,
          grade: parseInt(req.body.grade || '1', 10),
          notes: req.body.notes || null,
          isActive: true
        }
      });

      // Invalidate cache after creating student
      await invalidateUserCache(userId);

      // Return response in the format the client expects
      res.status(201).json({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentNumber, // Map back to studentId for client
        studentNumber: student.studentNumber,
        dateOfBirth: req.body.dateOfBirth || '2018-01-01',
        grade: student.grade,
        program: req.body.program || 'French Immersion',
        hasIEP: req.body.hasIEP || false,
        notes: student.notes || '',
        createdAt: student.createdAt.toISOString(),
        updatedAt: student.updatedAt.toISOString(),
        status: 'active',
        assessmentCount: 0
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to create student:');
      res.status(500).json({ error: 'Failed to create student' });
    }
  }
);

/**
 * DELETE /api/students
 * Delete ALL students for the authenticated user
 */
router.delete('/',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      const result = await prisma.student.deleteMany({ where: { userId } });
      await invalidateUserCache(userId);
      res.status(200).json({ deleted: result.count });
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to delete students:');
      res.status(500).json({ error: 'Failed to delete students' });
    }
  }
);

/**
 * DELETE /api/students/:id
 * Delete a single student by ID (owned by authenticated user)
 */
router.delete('/:id',
  [param('id').isString().isLength({ min: 1 }).withMessage('Student ID is required')],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    try {
      const userId = req.user.id;
      const id = req.params.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Ensure ownership by deleting only if userId matches
      const result = await prisma.student.deleteMany({ where: { id, userId } });
      await invalidateUserCache(userId);
      if (result.count === 0) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      res.status(204).send();
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to delete student:');
      res.status(500).json({ error: 'Failed to delete student' });
    }
  }
);

export { router };