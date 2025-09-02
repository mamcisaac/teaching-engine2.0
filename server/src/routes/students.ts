/**
 * Student Management API Routes
 * Includes CSV bulk import for classroom setup
 */

import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';
import { PrismaClient } from '@teaching-engine/database';
import { importStudentsFromCSV, validateCSVFormat, generateCSVTemplate, exportStudentsToCSV } from '../services/csvImport';
import { checkClassQuota, checkStudentQuota, formatBytes } from '../services/quotaManager';
import { withDatabaseResilience } from '../services/errorHandling';
import { bulkOperationRateLimit, artifactViewRateLimit } from '../middleware/rateLimit/artifactRateLimit';
import { getStudentsOptimized, invalidateUserCache, invalidateStudentCache } from '../services/performanceOptimizer';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for CSV uploads
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024, // 1MB max for CSV
    files: 1
  },
  fileFilter: (req, file, cb) => {
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

// Authentication is handled by middleware in index.ts

/**
 * GET /api/students
 * List all students for the teacher
 */
router.get('/',
  artifactViewRateLimit,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Validate user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Use optimized cached query
      const students = await getStudentsOptimized(req.user.id, false);
      
      res.json({
        students: students.map(student => ({
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentNumber: student.studentNumber,
          grade: student.grade,
          artifactCount: student._count.artifacts,
          createdAt: student.createdAt
        })),
        total: students.length
      });
    } catch (error) {
      console.error('Failed to fetch students:', error);
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

      const userId = req.user!.id;
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

    } catch (error) {
      console.error('CSV import failed:', error);
      res.status(500).json({ error: 'CSV import failed' });
    }
  }
);

/**
 * GET /api/students/template/csv
 * Download CSV template for student import
 */
router.get('/template/csv',
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const template = generateCSVTemplate();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="student_import_template.csv"');
      res.send(template);
    } catch (error) {
      console.error('Failed to generate template:', error);
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
      const csv = await exportStudentsToCSV(req.user!.id);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="students_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error('Failed to export students:', error);
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
      const report = await checkClassQuota(req.user!.id);
      
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
    } catch (error) {
      console.error('Failed to get quota report:', error);
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
      const quota = await checkStudentQuota(req.params.id, req.user!.id);
      
      res.json({
        ...quota,
        totalUsage: formatBytes(quota.totalBytes),
        quota: formatBytes(quota.quotaBytes),
        largestFiles: quota.largestFiles.map(f => ({
          ...f,
          size: formatBytes(f.size)
        }))
      });
    } catch (error) {
      console.error('Failed to get student quota:', error);
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
    try {
      // Validate user is authenticated
      if (!req.user?.id) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      // Create student with proper error handling
      const student = await prisma.student.create({
        data: {
          userId: req.user.id,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          studentNumber: req.body.studentId || `${req.body.firstName[0]}${req.body.lastName[0]}${Date.now()}`,
          grade: parseInt(req.body.grade || '1', 10),
          notes: req.body.notes || null,
          isActive: true
        }
      });
      
      // Invalidate cache after creating student
      await invalidateUserCache(req.user.id);
      
      res.status(201).json({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentNumber: student.studentNumber,
        grade: student.grade,
        createdAt: student.createdAt
      });
    } catch (error) {
      console.error('Failed to create student:', error);
      
      // Provide more detailed error message
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint')) {
          res.status(400).json({ error: 'Student with this ID already exists' });
        } else {
          res.status(500).json({ error: 'Failed to create student', details: error.message });
        }
      } else {
        res.status(500).json({ error: 'Failed to create student' });
      }
    }
  }
);

export default router;