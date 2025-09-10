/**
 * Student Progress API Routes
 * Quick access endpoints for student progress summaries
 */

import { PrismaClient } from '@teaching-engine/database';
import { prisma } from '../prisma';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { param, query, body, validationResult } from 'express-validator';

import { logger } from '../logger';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: () => void) => {
  if (!req.user.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

// Simple in-memory cache for quick summaries
const summaryCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

/**
 * GET /api/students/:id/progress-summary
 * Quick progress summary optimized for < 2 second load time
 */
router.get('/:id/progress-summary',
  requireAuth,
  [
    param('id').isString().isLength({ min: 1 }).withMessage('Student ID is required')
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const startTime = Date.now();
    const studentId = req.params.id;
    const userId = req.user.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      // Check cache first
      const cacheKey = `${userId}-${studentId}`;
      const cached = summaryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        res.json({
          ...(cached.data && typeof cached.data === 'object' ? cached.data : {}),
          fromCache: true,
          loadTimeMs: Date.now() - startTime
        });
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

      // Fetch recent assessments (excluding anecdotal notes)
      const [assessments, outcomeProgress] = await Promise.all([
        prisma.studentAssessment.findMany({
          where: {
            studentId,
            userId,
            isAnecdotal: false
          },
          orderBy: { date: 'desc' },
          take: 30
        }),
        prisma.studentOutcomeProgress.findMany({
          where: {
            studentId,
            userId
          },
          include: {
            outcome: {
              select: {
                title: true,
                description: true,
                subject: true
              }
            }
          },
          orderBy: { lastAssessmentDate: 'desc' },
          take: 20
        })
      ]);

      // Categorize strengths and growth areas
      const strengths: string[] = [];
      const growthAreas: string[] = [];
      const recentNotes: string[] = [];

      // Process assessments
      assessments.forEach(assessment => {
        if (assessment.level === 'MEETING' || assessment.level === 'EXCEEDING') {
          if (!strengths.includes(assessment.title)) {
            strengths.push(assessment.title);
          }
        } else if (assessment.level === 'NOT_YET' || assessment.level === 'APPROACHING') {
          if (!growthAreas.includes(assessment.title)) {
            growthAreas.push(assessment.title);
          }
        }
        
        if (assessment.notes && recentNotes.length < 5) {
          recentNotes.push(assessment.notes);
        }
      });

      // Process outcome progress
      outcomeProgress.forEach(progress => {
        const expectationText = progress.outcome.title || progress.outcome.description;
        if (expectationText) {
          if (progress.currentLevel === 'MEETING' || progress.currentLevel === 'EXCEEDING') {
            if (!strengths.includes(expectationText)) {
              strengths.push(expectationText);
            }
          } else if (progress.currentLevel === 'NOT_YET' || progress.currentLevel === 'APPROACHING') {
            if (!growthAreas.includes(expectationText)) {
              growthAreas.push(expectationText);
            }
          }
        }
      });

      // Generate one-liner summary
      const studentName = `${student.firstName} ${student.lastName}`;
      let oneLiner = `${studentName} `;
      
      if (strengths.length > 0) {
        oneLiner += `is doing well in ${strengths.slice(0, 2).join(' and ')}`;
      }
      
      if (growthAreas.length > 0) {
        if (strengths.length > 0) {
          oneLiner += ', and we\'re working on ';
        } else {
          oneLiner += 'is working on ';
        }
        oneLiner += growthAreas.slice(0, 2).join(' and ');
      }
      
      if (strengths.length === 0 && growthAreas.length === 0) {
        oneLiner += 'is settling in well and we\'re completing initial assessments';
      }
      
      oneLiner += '.';

      // Check if safe to share publicly (no IEP or sensitive info mentioned)
      const sensitiveTerms = [
        'behavior', 'behavioral', 'struggle', 'struggling', 'difficulty', 'difficult',
        'concern', 'concerning', 'issue', 'problem', 'challenge', 'therapy',
        'medication', 'diagnosis', 'disorder', 'disability', 'iep', 'special needs',
        'intervention', 'support plan', 'accommodation', 'modification',
        'anxiety', 'adhd', 'autism', 'dyslexia', 'emotional', 'mental health',
        'counseling', 'psychologist', 'psychiatrist', 'social worker',
        'custody', 'divorce', 'separated', 'family issue', 'trauma', 'abuse'
      ];
      
      const safeToShare = !student.hasIEP && 
        !recentNotes.some(note => {
          const noteLower = note.toLowerCase();
          return sensitiveTerms.some(term => noteLower.includes(term));
        });

      const summary = {
        studentId,
        studentName,
        oneLiner,
        safeToShare,
        strengths: strengths.slice(0, 5),
        growthAreas: growthAreas.slice(0, 5),
        recentNotes: recentNotes.slice(0, 5),
        lastUpdated: new Date(),
        loadTimeMs: Date.now() - startTime
      };

      // Cache the result
      summaryCache.set(cacheKey, {
        data: summary,
        timestamp: Date.now()
      });

      res.json(summary);

    } catch (error: unknown) {
      logger.error('Failed to generate progress summary:', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to generate progress summary' });
    }
  }
);

/**
 * GET /api/students/:id/evidence
 * Get improvement evidence for a specific subject
 */
router.get('/:id/evidence',
  requireAuth,
  [
    param('id').isString().isLength({ min: 1 }).withMessage('Student ID is required'),
    query('subject').isString().withMessage('Subject is required')
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const studentId = req.params.id;
    const subject = req.query.subject as string;
    const userId = req.user.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      // Verify student belongs to teacher
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      });

      if (!student || student.userId !== userId) {
        res.status(404).json({ error: 'Student not found or access denied' });
        return;
      }

      // Get historical assessments for the subject
      const assessments = await prisma.studentAssessment.findMany({
        where: {
          studentId,
          userId,
          subject,
          isAnecdotal: false
        },
        orderBy: { date: 'asc' },
        take: 20
      });

      if (assessments.length === 0) {
        res.json({
          subject,
          then: 'No previous assessments',
          now: 'Assessment in progress',
          proof: [],
          trajectory: 'stable'
        });
        return;
      }

      // Get first and most recent assessments
      const firstAssessment = assessments[0];
      const latestAssessment = assessments[assessments.length - 1];

      // Generate evidence
      const proof = assessments.slice(-5).map(a => ({
        date: a.date,
        description: `${a.title}: ${a.level}${a.notes ? ` - ${a.notes}` : ''}`
      }));

      // Determine trajectory
      let trajectory: 'improving' | 'stable' | 'declining' = 'stable';
      
      const levelValues = {
        'NOT_YET': 1,
        'APPROACHING': 2,
        'MEETING': 3,
        'EXCEEDING': 4
      };
      
      if (!firstAssessment || !latestAssessment) {
        res.status(404).json({ error: 'Insufficient assessment data' });
        return;
      }

      const firstValue = levelValues[firstAssessment.level as keyof typeof levelValues];
      const latestValue = levelValues[latestAssessment.level as keyof typeof levelValues];
      
      if (latestValue > firstValue) trajectory = 'improving';
      else if (latestValue < firstValue) trajectory = 'declining';

      res.json({
        subject,
        then: `${firstAssessment.date.toLocaleDateString()}: ${firstAssessment.title} - ${firstAssessment.level}`,
        now: `${latestAssessment.date.toLocaleDateString()}: ${latestAssessment.title} - ${latestAssessment.level}`,
        proof,
        trajectory
      });

    } catch (error: unknown) {
      logger.error('Failed to get improvement evidence:', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to get improvement evidence' });
    }
  }
);

/**
 * GET /api/students/:id/communications
 * Get parent communication history
 */
router.get('/:id/communications',
  requireAuth,
  [
    param('id').isString().isLength({ min: 1 }).withMessage('Student ID is required')
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const studentId = req.params.id;
    const userId = req.user.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      // Verify student belongs to teacher
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      });

      if (!student || student.userId !== userId) {
        res.status(404).json({ error: 'Student not found or access denied' });
        return;
      }

      // Get parent communications (would be from a separate table in real implementation)
      // For now, return mock data structure
      const previousReports: Array<{ id: string; summary: string; date: Date }> = [];
      
      // Check for contradictions between what was said before and current state
      const contradictions: string[] = [];

      res.json({
        previousReports,
        lastToldThem: previousReports.length > 0 ? (previousReports[0]?.summary || '') : '',
        contradictions
      });

    } catch (error: unknown) {
      logger.error('Failed to get communication history:', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to get communication history' });
    }
  }
);

/**
 * POST /api/students/:id/communications
 * Record a parent communication
 */
router.post('/:id/communications',
  requireAuth,
  [
    param('id').isString().isLength({ min: 1 }).withMessage('Student ID is required'),
    body('summary').isString().isLength({ min: 1 }).withMessage('Summary is required'),
    body('type').isIn(['verbal', 'written', 'report']).withMessage('Invalid communication type'),
    body('sharedWith').isString().withMessage('Shared with is required')
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const studentId = req.params.id;
    const { summary, type, sharedWith } = req.body;
    const userId = req.user.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      // Verify student belongs to teacher
      const student = await prisma.student.findUnique({
        where: { id: studentId }
      });

      if (!student || student.userId !== userId) {
        res.status(404).json({ error: 'Student not found or access denied' });
        return;
      }

      // In a real implementation, would save to a parent_communications table
      // For now, we'll store it as a special type of assessment note
      const communication = await prisma.studentAssessment.create({
        data: {
          userId: userId!,
          studentId: studentId!,
          subject: 'PARENT_COMMUNICATION',
          title: `Communication with ${sharedWith || 'parent'}`,
          level: 'MEETING', // Default level for communications
          notes: `${type.toUpperCase()}: ${summary}`,
          isAnecdotal: true, // Use anecdotal flag to separate from assessments
          date: new Date()
        }
      });

      res.json({
        id: communication.id,
        studentId,
        summary,
        type,
        sharedWith,
        date: communication.date
      });

    } catch (error: unknown) {
      logger.error('Failed to save communication:', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Failed to save communication' });
    }
  }
);

export { router };