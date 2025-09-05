import { logger } from '../logger';
/**
 * Evidence Export API Routes
 * Provides endpoints for Emily to export student evidence packages
 * for sharing with parents through her usual communication methods
 */

import { promises as fs } from 'fs';
import path from 'path';

import { PrismaClient } from '@teaching-engine/database';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { param, query, validationResult } from 'express-validator';

import { reportGenerationRateLimit } from '../middleware/rateLimit/artifactRateLimit';
import type { ExportOptions } from '../services/evidenceExport';
import { exportStudentEvidence, exportClassSummary } from '../services/evidenceExport';


const router = Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: any) => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

/**
 * GET /api/evidence-export/student/:id
 * Export evidence package for specific student
 */
router.get('/student/:id',
  requireAuth,
  reportGenerationRateLimit,
  [
    param('id').isString().isLength({ min: 1 }).withMessage('Student ID is required'),
    query('format').optional().isIn(['pdf', 'zip', 'both']).withMessage('Format must be pdf, zip, or both'),
    query('subject').optional().isString().withMessage('Subject must be a string'),
    query('startDate').optional().isISO8601().withMessage('Start date must be valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid date'),
    query('includePhotos').optional().isBoolean().withMessage('Include photos must be boolean'),
    query('includeVideos').optional().isBoolean().withMessage('Include videos must be boolean'),
    query('includeAudio').optional().isBoolean().withMessage('Include audio must be boolean'),
    query('includeDocuments').optional().isBoolean().withMessage('Include documents must be boolean'),
    query('includeNotes').optional().isBoolean().withMessage('Include notes must be boolean'),
    query('parentFriendly').optional().isBoolean().withMessage('Parent friendly must be boolean')
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    try {
      const studentId = req.params.id;
      const userId = req.user?.id;
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

      // Parse export options
      const options: ExportOptions = {
        format: req.query.format as 'pdf' | 'zip' | 'both' || 'pdf',
        subject: req.query.subject as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        includePhotos: req.query.includePhotos !== 'false', // Default to true
        includeVideos: req.query.includeVideos !== 'false',
        includeAudio: req.query.includeAudio !== 'false',
        includeDocuments: req.query.includeDocuments !== 'false',
        includeNotes: req.query.includeNotes !== 'false',
        parentFriendly: req.query.parentFriendly !== 'false' // Default to parent-friendly
      };

      // Generate export
      const result = await exportStudentEvidence(studentId, userId, options);

      if (!result.success) {
        res.status(400).json({
          error: result.message,
          includedItems: result.includedItems
        });
        return;
      }

      // Set headers for file download
      const fileName = result.fileName!;
      const contentType = fileName.endsWith('.pdf') ? 'application/pdf' : 'application/zip';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', result.fileSize!);
      
      // Send file
      const fileBuffer = await fs.readFile(result.filePath!);
      res.send(fileBuffer);

      // Clean up temp file after sending
      setTimeout(async () => {
        try {
          await fs.unlink(result.filePath!);
          // Also clean up the temp directory if empty
          const tempDir = path.dirname(result.filePath!);
          try {
            await fs.rmdir(tempDir);
          } catch (error: unknown) {
            // Directory might not be empty, that's okay
          }
        } catch (error: unknown) {
          logger.warn({ error }, 'Failed to clean up temp export file:');
        }
      }, 5000); // Clean up after 5 seconds

    } catch (error: unknown) {
      logger.error({ error }, 'Student evidence export failed:');
      res.status(500).json({ error: 'Failed to export student evidence' });
    }
  }
);

/**
 * GET /api/evidence-export/class-summary
 * Export class-wide learning summary for newsletters
 */
router.get('/class-summary',
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
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Parse export options
      const options: ExportOptions = {
        subject: req.query.subject as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        parentFriendly: true // Always parent-friendly for newsletters
      };

      // Generate export
      const result = await exportClassSummary(userId, options);

      if (!result.success) {
        res.status(400).json({
          error: result.message,
          includedItems: result.includedItems
        });
        return;
      }

      // Set headers for PDF download
      const fileName = result.fileName!;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', result.fileSize!);
      
      // Send file
      const fileBuffer = await fs.readFile(result.filePath!);
      res.send(fileBuffer);

      // Clean up temp file after sending
      setTimeout(async () => {
        try {
          await fs.unlink(result.filePath!);
          const tempDir = path.dirname(result.filePath!);
          try {
            await fs.rmdir(tempDir);
          } catch (error: unknown) {
            // Directory might not be empty, that's okay
          }
        } catch (error: unknown) {
          logger.warn({ error }, 'Failed to clean up temp export file:');
        }
      }, 5000);

    } catch (error: unknown) {
      logger.error({ error }, 'Class summary export failed:');
      res.status(500).json({ error: 'Failed to export class summary' });
    }
  }
);

/**
 * GET /api/evidence-export/options
 * Get available export options and student list
 */
router.get('/options',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Get students and their artifact counts
      const students = await prisma.student.findMany({
        where: {
          userId,
          isActive: true
        },
        include: {
          _count: {
            select: {
              artifacts: {
                where: { isArchived: false }
              }
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });

      // Get available subjects
      const subjects = await prisma.curriculumExpectation.findMany({
        select: { subject: true },
        distinct: ['subject']
      });

      res.json({
        students: students.map(student => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          evidenceCount: student._count.artifacts,
          hasEvidence: student._count.artifacts > 0
        })),
        subjects: subjects.map(s => s.subject),
        formats: [
          {
            value: 'pdf',
            label: 'PDF Report',
            description: 'Parent-friendly PDF with embedded evidence summary'
          },
          {
            value: 'zip',
            label: 'Complete Package',
            description: 'ZIP file with all evidence files and PDF report'
          },
          {
            value: 'both',
            label: 'PDF + Complete Package',
            description: 'Both formats for maximum flexibility'
          }
        ],
        defaultOptions: {
          includePhotos: true,
          includeVideos: true,
          includeAudio: true,
          includeDocuments: true,
          includeNotes: true,
          parentFriendly: true,
          timeframe: '90days' // Last 90 days default
        }
      });
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to get export options:');
      res.status(500).json({ error: 'Failed to get export options' });
    }
  }
);

/**
 * POST /api/evidence-export/bulk
 * Export evidence for multiple students
 */
router.post('/bulk',
  requireAuth,
  reportGenerationRateLimit,
  [
    // Validation for bulk export would go here
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { studentIds, options } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        res.status(400).json({ error: 'Student IDs array is required' });
        return;
      }

      if (studentIds.length > 10) {
        res.status(400).json({ error: 'Maximum 10 students per bulk export' });
        return;
      }

      // Verify all students belong to this teacher
      const students = await prisma.student.findMany({
        where: {
          id: { in: studentIds },
          userId,
          isActive: true
        }
      });

      if (students.length !== studentIds.length) {
        res.status(404).json({ error: 'One or more students not found or access denied' });
        return;
      }

      // For bulk export, we'll create a ZIP with individual student packages
      const tempDir = path.join(require('os').tmpdir(), `bulk-export-${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });

      const archiver = require('archiver');
      const output = require('fs').createWriteStream(path.join(tempDir, 'bulk_evidence_export.zip'));
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.pipe(output);

      let successCount = 0;
      const results = [];

      for (const student of students) {
        try {
          const result = await exportStudentEvidence(student.id, userId, {
            ...options,
            format: 'pdf', // Individual PDFs for bulk export
            parentFriendly: true
          });

          if (result.success) {
            const fileName = `${student.firstName}_${student.lastName}_Evidence.pdf`;
            archive.file(result.filePath!, { name: fileName });
            successCount++;
            results.push({ studentId: student.id, success: true, fileName });
          } else {
            results.push({ studentId: student.id, success: false, error: result.message });
          }
        } catch (error: unknown) {
          results.push({ 
            studentId: student.id, 
            success: false, 
            error: (error as Error).message 
          });
        }
      }

      // Add summary report
      const summaryContent = `
Bulk Evidence Export Summary
Generated: ${new Date().toLocaleDateString('en-CA')}

Students Exported: ${successCount}/${students.length}

Export Results:
${results.map(r => 
  `• ${students.find(s => s.id === r.studentId)?.firstName} ${students.find(s => s.id === r.studentId)?.lastName}: ${r.success ? 'SUCCESS' : 'FAILED - ' + r.error}`
).join('\n')}
      `;
      
      archive.append(summaryContent, { name: 'Export_Summary.txt' });
      archive.finalize();

      // Wait for archive to finish
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
      });

      const zipPath = path.join(tempDir, 'bulk_evidence_export.zip');
      const stats = await fs.stat(zipPath);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="bulk_evidence_export_${new Date().toISOString().split('T')[0]}.zip"`);
      res.setHeader('Content-Length', stats.size);

      const fileBuffer = await fs.readFile(zipPath);
      res.send(fileBuffer);

      // Clean up
      setTimeout(async () => {
        try {
          await fs.unlink(zipPath);
          await fs.rmdir(tempDir);
        } catch (error: unknown) {
          logger.warn({ error }, 'Failed to clean up bulk export files:');
        }
      }, 5000);

    } catch (error: unknown) {
      logger.error({ error }, 'Bulk export failed:');
      res.status(500).json({ error: 'Failed to export evidence for multiple students' });
    }
  }
);

export default router;