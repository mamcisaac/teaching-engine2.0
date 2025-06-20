import { Router, Request } from 'express';
import { z } from 'zod';
import { reportGeneratorService } from '../services/reportGeneratorService';
import logger from '../logger';

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const router = Router();

// Validation schema for report generation
const generateReportSchema = z.object({
  studentId: z.number().int().positive(),
  reportType: z.enum(['progress', 'narrative', 'term_summary', 'report_card']),
  termId: z.number().int().positive().optional(),
  subjectId: z.number().int().positive().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  language: z.enum(['en', 'fr']).default('en'),
  includeAssessments: z.boolean().default(true),
  includeAttendance: z.boolean().default(false),
  includeGoals: z.boolean().default(true),
});

// Generate a report
router.post('/generate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const data = generateReportSchema.parse(req.body);
    
    // Verify student belongs to user
    const { prisma } = await import('../prisma');
    const student = await prisma.student.findFirst({
      where: { id: data.studentId, userId },
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Generate the report
    const report = await reportGeneratorService.generateReport({
      studentId: data.studentId,
      reportType: data.reportType,
      termId: data.termId,
      subjectId: data.subjectId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      language: data.language,
      includeAssessments: data.includeAssessments,
      includeAttendance: data.includeAttendance,
      includeGoals: data.includeGoals,
    });
    
    res.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid report data', details: error.errors });
    }
    logger.error('Failed to generate report:', error);
    next(error);
  }
});

// Get available report types
router.get('/types', (_req: AuthenticatedRequest, res) => {
  res.json([
    {
      id: 'progress',
      name: 'Progress Report',
      nameFr: 'Rapport de progrès',
      description: 'Detailed progress report with assessments and goals',
      descriptionFr: 'Rapport de progrès détaillé avec évaluations et objectifs',
    },
    {
      id: 'narrative',
      name: 'Narrative Report',
      nameFr: 'Rapport narratif',
      description: 'Comprehensive narrative describing student journey',
      descriptionFr: 'Récit complet décrivant le parcours de l\'élève',
    },
    {
      id: 'term_summary',
      name: 'Term Summary',
      nameFr: 'Résumé du trimestre',
      description: 'Summary of performance by subject for the term',
      descriptionFr: 'Résumé des performances par matière pour le trimestre',
    },
    {
      id: 'report_card',
      name: 'Report Card',
      nameFr: 'Bulletin scolaire',
      description: 'Formal report card with grades and comments',
      descriptionFr: 'Bulletin scolaire formel avec notes et commentaires',
    },
  ]);
});

// Save generated report (for future retrieval)
router.post('/save', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const { studentId, reportType, content, metadata } = req.body;
    
    // Verify student belongs to user
    const { prisma } = await import('../prisma');
    const student = await prisma.student.findFirst({
      where: { id: studentId, userId },
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Save report to database (would need a Report model)
    // For now, we'll return a mock response
    const savedReport = {
      id: Date.now(),
      studentId,
      reportType,
      content,
      metadata,
      createdAt: new Date(),
      userId,
    };
    
    res.json(savedReport);
  } catch (error) {
    logger.error('Failed to save report:', error);
    next(error);
  }
});

// Get saved reports for a student
router.get('/student/:studentId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = parseInt(req.user?.userId || '0', 10);
    const studentId = parseInt(req.params.studentId, 10);
    
    // Verify student belongs to user
    const { prisma } = await import('../prisma');
    const student = await prisma.student.findFirst({
      where: { id: studentId, userId },
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Return mock reports for now
    const reports = [
      {
        id: 1,
        studentId,
        reportType: 'progress',
        createdAt: new Date('2024-01-15'),
        period: 'Q1 2024',
      },
      {
        id: 2,
        studentId,
        reportType: 'report_card',
        createdAt: new Date('2023-12-20'),
        period: 'Fall 2023',
      },
    ];
    
    res.json(reports);
  } catch (error) {
    logger.error('Failed to fetch student reports:', error);
    next(error);
  }
});

export default router;