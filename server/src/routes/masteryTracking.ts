/**
 * ETFO Mastery Tracking API Routes
 * Handles student progress tracking using 4-level Growing Success framework
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PrismaClient } from '@teaching-engine/database';

const router = Router();
const prisma = new PrismaClient();

// Types
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface MasteryUpdateRequest {
  studentId: string;
  outcomeId: string;
  currentLevel: 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';
  areasForGrowth?: string;
  strengths?: string;
  teacherNotes?: string;
  strongestEvidence?: {
    artifactId: string;
    evidenceType: string;
    description: string;
  };
}

// Validation middleware
const validateMasteryUpdate = [
  body('studentId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Student ID is required'),
  
  body('outcomeId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Outcome ID is required'),
  
  body('currentLevel')
    .isIn(['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING'])
    .withMessage('Current level must be one of: NOT_YET, APPROACHING, MEETING, EXCEEDING'),
  
  body('areasForGrowth')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Areas for growth must be less than 1000 characters'),
  
  body('strengths')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Strengths must be less than 1000 characters'),
  
  body('teacherNotes')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Teacher notes must be less than 2000 characters'),
  
  body('strongestEvidence')
    .optional()
    .isObject()
    .withMessage('Strongest evidence must be an object'),
  
  body('strongestEvidence.artifactId')
    .optional()
    .isString()
    .withMessage('Artifact ID must be a string'),
  
  body('strongestEvidence.evidenceType')
    .optional()
    .isIn(['OBSERVATION', 'CONVERSATION', 'PRODUCT'])
    .withMessage('Evidence type must be OBSERVATION, CONVERSATION, or PRODUCT'),
  
  body('strongestEvidence.description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Evidence description must be less than 500 characters')
];

const validateBatchUpdate = [
  body('updates')
    .isArray()
    .withMessage('Updates must be an array'),
  
  body('updates.*.studentId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Student ID is required for each update'),
  
  body('updates.*.outcomeId')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Outcome ID is required for each update'),
  
  body('updates.*.currentLevel')
    .isIn(['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING'])
    .withMessage('Current level must be valid for each update')
];

// Error handling middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
    return;
  }
  next();
};

// Authentication middleware
const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.id) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
};

// Student access validation
const validateStudentAccess = async (studentId: string, userId: number): Promise<boolean> => {
  try {
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: userId,
        isActive: true
      }
    });
    return !!student;
  } catch (error: unknown) {
    return false;
  }
};

// Outcome validation
const validateOutcomeAccess = async (outcomeId: string): Promise<boolean> => {
  try {
    const outcome = await prisma.curriculumExpectation.findUnique({
      where: { id: outcomeId }
    });
    return !!outcome;
  } catch (error: unknown) {
    return false;
  }
};

/**
 * POST /api/mastery/update
 * Update or create student mastery progress for a specific outcome
 */
router.post('/update',
  requireAuth,
  validateMasteryUpdate,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { studentId, outcomeId, currentLevel, areasForGrowth, strengths, teacherNotes, strongestEvidence } = req.body as MasteryUpdateRequest;

      // Validate student access
      if (!(await validateStudentAccess(studentId, userId))) {
        res.status(404).json({ error: 'Student not found or access denied' });
        return;
      }

      // Validate outcome access
      if (!(await validateOutcomeAccess(outcomeId))) {
        res.status(404).json({ error: 'Curriculum outcome not found' });
        return;
      }

      // Get existing progress record
      const existing = await prisma.studentOutcomeProgress.findUnique({
        where: {
          studentId_outcomeId: {
            studentId,
            outcomeId
          }
        }
      });

      // Determine if this is a level change
      const previousLevel = existing?.currentLevel;
      const isLevelChange = !existing || previousLevel !== currentLevel;

      // Count total evidence pieces for this outcome
      const totalEvidencePieces = await prisma.studentArtifactOutcome.count({
        where: {
          outcomeId,
          artifact: {
            studentId
          }
        }
      });

      // Prepare update data
      const updateData = {
        userId,
        currentLevel,
        previousLevel: isLevelChange ? previousLevel : undefined,
        lastAssessmentDate: new Date(),
        totalEvidencePieces,
        areasForGrowth,
        strengths,
        teacherNotes,
        strongestEvidence: strongestEvidence ? JSON.stringify(strongestEvidence) : null
      };

      // Upsert progress record
      const progress = await prisma.studentOutcomeProgress.upsert({
        where: {
          studentId_outcomeId: {
            studentId,
            outcomeId
          }
        },
        update: updateData,
        create: {
          studentId,
          outcomeId,
          ...updateData
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              grade: true
            }
          },
          outcome: {
            select: {
              code: true,
              description: true,
              subject: true,
              strand: true
            }
          }
        }
      });

      res.json({
        id: progress.id,
        studentId: progress.studentId,
        outcomeId: progress.outcomeId,
        currentLevel: progress.currentLevel,
        previousLevel: progress.previousLevel,
        lastAssessmentDate: progress.lastAssessmentDate,
        totalEvidencePieces: progress.totalEvidencePieces,
        areasForGrowth: progress.areasForGrowth,
        strengths: progress.strengths,
        teacherNotes: progress.teacherNotes,
        strongestEvidence: progress.strongestEvidence ? JSON.parse(progress.strongestEvidence as string) : null,
        parentShared: progress.parentShared,
        updatedAt: progress.updatedAt,
        student: progress.student,
        outcome: progress.outcome,
        isLevelChange
      });
    } catch (error: unknown) {
      console.error('Mastery update error:', error);
      res.status(500).json({ error: 'Failed to update mastery progress' });
    }
  }
);

/**
 * POST /api/mastery/batch-update
 * Update multiple mastery records in a single transaction
 */
router.post('/batch-update',
  requireAuth,
  validateBatchUpdate,
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { updates } = req.body as { updates: MasteryUpdateRequest[] };

      if (updates.length > 20) {
        res.status(400).json({ error: 'Maximum 20 updates allowed per batch' });
        return;
      }

      // Validate all students and outcomes
      const studentIds = [...new Set(updates.map(u => u.studentId))];
      const outcomeIds = [...new Set(updates.map(u => u.outcomeId))];

      const [validStudents, validOutcomes] = await Promise.all([
        prisma.student.findMany({
          where: {
            id: { in: studentIds },
            userId: userId,
            isActive: true
          },
          select: { id: true }
        }),
        prisma.curriculumExpectation.findMany({
          where: { id: { in: outcomeIds } },
          select: { id: true }
        })
      ]);

      const validStudentIds = new Set(validStudents.map(s => s.id));
      const validOutcomeIds = new Set(validOutcomes.map(o => o.id));

      // Filter valid updates
      const validUpdates = updates.filter(update => 
        validStudentIds.has(update.studentId) && validOutcomeIds.has(update.outcomeId)
      );

      if (validUpdates.length === 0) {
        res.status(400).json({ error: 'No valid updates found' });
        return;
      }

      // Process updates in transaction
      const results = await prisma.$transaction(async (tx) => {
        const promises = validUpdates.map(async (update) => {
          const { studentId, outcomeId, currentLevel, areasForGrowth, strengths, teacherNotes, strongestEvidence } = update;

          // Get existing progress
          const existing = await tx.studentOutcomeProgress.findUnique({
            where: {
              studentId_outcomeId: { studentId, outcomeId }
            }
          });

          const previousLevel = existing?.currentLevel;
          const isLevelChange = !existing || previousLevel !== currentLevel;

          // Count evidence pieces
          const totalEvidencePieces = await tx.studentArtifactOutcome.count({
            where: {
              outcomeId,
              artifact: { studentId }
            }
          });

          // Upsert progress record
          return await tx.studentOutcomeProgress.upsert({
            where: {
              studentId_outcomeId: { studentId, outcomeId }
            },
            update: {
              currentLevel,
              previousLevel: isLevelChange ? previousLevel : existing?.previousLevel,
              lastAssessmentDate: new Date(),
              totalEvidencePieces,
              areasForGrowth,
              strengths,
              teacherNotes,
              strongestEvidence: strongestEvidence ? JSON.stringify(strongestEvidence) : undefined
            },
            create: {
              studentId,
              outcomeId,
              userId,
              currentLevel,
              previousLevel,
              lastAssessmentDate: new Date(),
              totalEvidencePieces,
              areasForGrowth,
              strengths,
              teacherNotes,
              strongestEvidence: strongestEvidence ? JSON.stringify(strongestEvidence) : undefined
            }
          });
        });

        return await Promise.all(promises);
      });

      res.json({
        message: `Successfully updated ${results.length} mastery records`,
        updated: results.length,
        total: updates.length,
        results: results.map(r => ({
          id: r.id,
          studentId: r.studentId,
          outcomeId: r.outcomeId,
          currentLevel: r.currentLevel,
          lastAssessmentDate: r.lastAssessmentDate
        }))
      });
    } catch (error: unknown) {
      console.error('Batch mastery update error:', error);
      res.status(500).json({ error: 'Failed to update mastery records' });
    }
  }
);

/**
 * GET /api/mastery/student/:studentId
 * Get comprehensive mastery overview for a specific student
 */
router.get('/student/:studentId',
  requireAuth,
  param('studentId').isString().withMessage('Student ID is required'),
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const studentId = req.params.studentId;
      const { subject, includeArchived = 'false' } = req.query;

      // Validate student access
      if (!(await validateStudentAccess(studentId, userId))) {
        res.status(404).json({ error: 'Student not found or access denied' });
        return;
      }

      // Get student info
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          grade: true,
          homeroom: true
        }
      });

      // Build where clause for progress records
      const where: any = {
        studentId,
        isArchived: includeArchived === 'true' ? undefined : false
      };

      if (subject) {
        where.outcome = {
          subject: subject as string
        };
      }

      // Get progress records with outcome details
      const progressRecords = await prisma.studentOutcomeProgress.findMany({
        where,
        include: {
          outcome: {
            select: {
              id: true,
              code: true,
              description: true,
              subject: true,
              strand: true,
              substrand: true,
              grade: true
            }
          }
        },
        orderBy: [
          { outcome: { subject: 'asc' } },
          { outcome: { strand: 'asc' } },
          { lastAssessmentDate: 'desc' }
        ]
      });

      // Calculate mastery statistics
      const masteryStats = {
        NOT_YET: 0,
        APPROACHING: 0,
        MEETING: 0,
        EXCEEDING: 0
      };

      progressRecords.forEach(record => {
        masteryStats[record.currentLevel as keyof typeof masteryStats]++;
      });

      const totalAssessed = progressRecords.length;
      const masteryPercentage = totalAssessed > 0 
        ? Math.round(((masteryStats.MEETING + masteryStats.EXCEEDING) / totalAssessed) * 100)
        : 0;

      // Group by subject
      const progressBySubject = progressRecords.reduce((acc, record) => {
        const subject = record.outcome.subject;
        if (!acc[subject]) {
          acc[subject] = {
            subject,
            totalOutcomes: 0,
            mastery: {
              NOT_YET: 0,
              APPROACHING: 0,
              MEETING: 0,
              EXCEEDING: 0
            },
            records: []
          };
        }

        acc[subject].totalOutcomes++;
        acc[subject].mastery[record.currentLevel as keyof typeof acc[subject]['mastery']]++;
        acc[subject].records.push({
          id: record.id,
          outcomeId: record.outcomeId,
          currentLevel: record.currentLevel,
          previousLevel: record.previousLevel,
          lastAssessmentDate: record.lastAssessmentDate,
          totalEvidencePieces: record.totalEvidencePieces,
          areasForGrowth: record.areasForGrowth,
          strengths: record.strengths,
          teacherNotes: record.teacherNotes,
          strongestEvidence: record.strongestEvidence ? JSON.parse(record.strongestEvidence as string) : null,
          parentShared: record.parentShared,
          outcome: record.outcome
        });

        return acc;
      }, {} as Record<string, any>);

      res.json({
        student,
        summary: {
          totalAssessed,
          masteryPercentage,
          masteryStats,
          subjectCount: Object.keys(progressBySubject).length,
          lastUpdated: progressRecords.length > 0 
            ? progressRecords.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0].updatedAt
            : null
        },
        progressBySubject: Object.values(progressBySubject)
      });
    } catch (error: unknown) {
      console.error('Student mastery retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve student mastery data' });
    }
  }
);

/**
 * GET /api/mastery/overview/:studentId (ALIAS)
 * Alias for /api/mastery/student/:studentId for backward compatibility
 * Get comprehensive mastery overview for a specific student
 */
router.get('/overview/:studentId',
  requireAuth,
  param('studentId').isString().withMessage('Student ID is required'),
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const studentId = req.params.studentId;
      const { subject, includeArchived = 'false' } = req.query;

      // Validate student access
      if (!(await validateStudentAccess(studentId, userId))) {
        res.status(404).json({ error: 'Student not found or access denied' });
        return;
      }

      // Get student info
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          grade: true,
          homeroom: true
        }
      });

      // Build where clause for progress records
      const where: any = {
        studentId,
        isArchived: includeArchived === 'true' ? undefined : false
      };

      if (subject) {
        where.outcome = {
          subject: subject as string
        };
      }

      // Get progress records with outcome details
      const progressRecords = await prisma.studentOutcomeProgress.findMany({
        where,
        include: {
          outcome: {
            select: {
              id: true,
              code: true,
              description: true,
              subject: true,
              strand: true,
              substrand: true,
              grade: true
            }
          }
        },
        orderBy: [
          { outcome: { subject: 'asc' } },
          { outcome: { strand: 'asc' } },
          { lastAssessmentDate: 'desc' }
        ]
      });

      // Calculate mastery statistics
      const masteryStats = {
        NOT_YET: 0,
        APPROACHING: 0,
        MEETING: 0,
        EXCEEDING: 0
      };

      progressRecords.forEach(record => {
        masteryStats[record.currentLevel as keyof typeof masteryStats]++;
      });

      const totalAssessed = progressRecords.length;
      const masteryPercentage = totalAssessed > 0 
        ? Math.round(((masteryStats.MEETING + masteryStats.EXCEEDING) / totalAssessed) * 100)
        : 0;

      // Group by subject
      const progressBySubject = progressRecords.reduce((acc, record) => {
        const subject = record.outcome.subject;
        if (!acc[subject]) {
          acc[subject] = {
            subject,
            totalOutcomes: 0,
            mastery: {
              NOT_YET: 0,
              APPROACHING: 0,
              MEETING: 0,
              EXCEEDING: 0
            },
            records: []
          };
        }

        acc[subject].totalOutcomes++;
        acc[subject].mastery[record.currentLevel as keyof typeof acc[subject]['mastery']]++;
        acc[subject].records.push({
          id: record.id,
          outcomeId: record.outcomeId,
          currentLevel: record.currentLevel,
          previousLevel: record.previousLevel,
          lastAssessmentDate: record.lastAssessmentDate,
          totalEvidencePieces: record.totalEvidencePieces,
          areasForGrowth: record.areasForGrowth,
          strengths: record.strengths,
          teacherNotes: record.teacherNotes,
          strongestEvidence: record.strongestEvidence ? JSON.parse(record.strongestEvidence as string) : null,
          parentShared: record.parentShared,
          outcome: record.outcome
        });

        return acc;
      }, {} as Record<string, any>);

      res.json({
        student,
        summary: {
          totalAssessed,
          masteryPercentage,
          masteryStats,
          subjectCount: Object.keys(progressBySubject).length,
          lastUpdated: progressRecords.length > 0 
            ? progressRecords.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0].updatedAt
            : null
        },
        progressBySubject: Object.values(progressBySubject)
      });
    } catch (error: unknown) {
      console.error('Student mastery retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve student mastery data' });
    }
  }
);

/**
 * GET /api/mastery/outcome/:outcomeId
 * Get all students' progress for a specific curriculum outcome
 */
router.get('/outcome/:outcomeId',
  requireAuth,
  param('outcomeId').isString().withMessage('Outcome ID is required'),
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const outcomeId = req.params.outcomeId;
      const { includeArchived = 'false' } = req.query;

      // Validate outcome exists
      const outcome = await prisma.curriculumExpectation.findUnique({
        where: { id: outcomeId },
        select: {
          id: true,
          code: true,
          description: true,
          subject: true,
          strand: true,
          substrand: true,
          grade: true,
          title: true
        }
      });

      if (!outcome) {
        res.status(404).json({ error: 'Curriculum outcome not found' });
        return;
      }

      // Get all teacher's students
      const students = await prisma.student.findMany({
        where: {
          userId: userId,
          isActive: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          grade: true,
          homeroom: true
        }
      });

      // Get progress records for this outcome
      const progressRecords = await prisma.studentOutcomeProgress.findMany({
        where: {
          outcomeId: outcomeId,
          userId: userId,
          isArchived: includeArchived === 'true' ? undefined : false
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              grade: true,
              homeroom: true
            }
          }
        },
        orderBy: [
          { student: { lastName: 'asc' } },
          { student: { firstName: 'asc' } }
        ]
      });

      // Create progress map for quick lookup
      const progressMap = new Map(
        progressRecords.map(record => [record.studentId, record])
      );

      // Build comprehensive student progress list
      const studentProgress = students.map(student => {
        const progress = progressMap.get(student.id);
        return {
          studentId: student.id,
          student: {
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade,
            homeroom: student.homeroom
          },
          currentLevel: progress?.currentLevel || 'NOT_YET',
          previousLevel: progress?.previousLevel,
          lastAssessmentDate: progress?.lastAssessmentDate,
          totalEvidencePieces: progress?.totalEvidencePieces || 0,
          areasForGrowth: progress?.areasForGrowth,
          strengths: progress?.strengths,
          teacherNotes: progress?.teacherNotes,
          strongestEvidence: progress?.strongestEvidence ? JSON.parse(progress.strongestEvidence as string) : null,
          parentShared: progress?.parentShared || false,
          hasProgress: !!progress,
          updatedAt: progress?.updatedAt
        };
      });

      // Calculate class statistics
      const classStats = {
        totalStudents: students.length,
        assessed: progressRecords.length,
        notAssessed: students.length - progressRecords.length,
        mastery: {
          NOT_YET: 0,
          APPROACHING: 0,
          MEETING: 0,
          EXCEEDING: 0
        }
      };

      studentProgress.forEach(sp => {
        classStats.mastery[sp.currentLevel as keyof typeof classStats.mastery]++;
      });

      const masteryPercentage = classStats.totalStudents > 0 
        ? Math.round(((classStats.mastery.MEETING + classStats.mastery.EXCEEDING) / classStats.totalStudents) * 100)
        : 0;

      res.json({
        outcome,
        classStats: {
          ...classStats,
          masteryPercentage
        },
        studentProgress
      });
    } catch (error: unknown) {
      console.error('Outcome mastery retrieval error:', error);
      res.status(500).json({ error: 'Failed to retrieve outcome mastery data' });
    }
  }
);

/**
 * GET /api/mastery/analytics
 * Get comprehensive mastery analytics for the teacher's students
 */
router.get('/analytics',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { 
        grade, 
        subject, 
        timeframe = '30',
        includeArchived = 'false' 
      } = req.query;

      // Build date filter for timeframe
      const dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - parseInt(timeframe as string));

      // Build where clauses
      const studentWhere: any = {
        userId: userId,
        isActive: true
      };

      if (grade) {
        studentWhere.grade = parseInt(grade as string);
      }

      const progressWhere: any = {
        userId: userId,
        isArchived: includeArchived === 'true' ? undefined : false
      };

      if (subject) {
        progressWhere.outcome = {
          subject: subject as string
        };
      }

      // Get comprehensive data
      const [
        totalStudents,
        totalOutcomes,
        progressRecords,
        recentUpdates,
        masteryDistribution,
        subjectBreakdown,
        evidenceStats
      ] = await Promise.all([
        // Total students count
        prisma.student.count({ where: studentWhere }),
        
        // Total outcomes for grade/subject
        prisma.curriculumExpectation.count({
          where: {
            ...(grade && { grade: parseInt(grade as string) }),
            ...(subject && { subject: subject as string })
          }
        }),
        
        // All progress records
        prisma.studentOutcomeProgress.findMany({
          where: progressWhere,
          include: {
            outcome: {
              select: {
                subject: true,
                strand: true,
                grade: true
              }
            }
          }
        }),
        
        // Recent updates
        prisma.studentOutcomeProgress.findMany({
          where: {
            ...progressWhere,
            lastAssessmentDate: {
              gte: dateFilter
            }
          },
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            outcome: {
              select: {
                code: true,
                description: true,
                subject: true
              }
            }
          },
          orderBy: { lastAssessmentDate: 'desc' },
          take: 20
        }),
        
        // Mastery distribution
        prisma.studentOutcomeProgress.groupBy({
          by: ['currentLevel'],
          where: progressWhere,
          _count: { currentLevel: true }
        }),
        
        // Subject breakdown using aggregated data to avoid BigInt serialization issues
        prisma.studentOutcomeProgress.findMany({
          where: {
            userId: userId,
            isArchived: includeArchived === 'true' ? undefined : false,
            ...(subject && {
              outcome: {
                subject: subject as string
              }
            })
          },
          include: {
            outcome: {
              select: {
                subject: true,
                strand: true
              }
            }
          }
        }).then(records => {
          const breakdown: Record<string, any> = {};
          
          records.forEach(record => {
            const key = `${record.outcome?.subject || 'Unknown'}-${record.outcome?.strand || 'Unknown'}`;
            if (!breakdown[key]) {
              breakdown[key] = {
                subject: record.outcome?.subject || 'Unknown',
                strand: record.outcome?.strand || 'Unknown',
                total_assessments: 0,
                exceeding: 0,
                meeting: 0,
                approaching: 0,
                not_yet: 0,
                avg_evidence: 0,
                evidenceSum: 0
              };
            }
            
            breakdown[key].total_assessments++;
            breakdown[key][record.currentLevel.toLowerCase()]++;
            breakdown[key].evidenceSum += record.totalEvidencePieces || 0;
          });
          
          // Calculate averages
          return Object.values(breakdown).map((item: any) => ({
            ...item,
            avg_evidence: item.total_assessments > 0 ? 
              Math.round((item.evidenceSum / item.total_assessments) * 100) / 100 : 0
          }));
        }),
        
        // Evidence statistics
        prisma.studentArtifact.groupBy({
          by: ['artifactType'],
          where: { userId: userId },
          _count: { artifactType: true },
          _sum: { fileSize: true }
        })
      ]);

      // Process mastery distribution
      const masteryStats = {
        NOT_YET: 0,
        APPROACHING: 0,
        MEETING: 0,
        EXCEEDING: 0
      };

      masteryDistribution.forEach(stat => {
        masteryStats[stat.currentLevel as keyof typeof masteryStats] = stat._count.currentLevel;
      });

      const totalAssessments = progressRecords.length;
      const masteryPercentage = totalAssessments > 0
        ? Math.round(((masteryStats.MEETING + masteryStats.EXCEEDING) / totalAssessments) * 100)
        : 0;

      // Calculate coverage percentage
      const coveragePercentage = totalOutcomes > 0
        ? Math.round((totalAssessments / (totalStudents * totalOutcomes)) * 100)
        : 0;

      // Process evidence statistics
      const evidenceBreakdown = evidenceStats.reduce((acc, stat) => {
        acc[stat.artifactType] = {
          count: stat._count.artifactType,
          totalSize: stat._sum.fileSize || 0
        };
        return acc;
      }, {} as Record<string, { count: number; totalSize: number }>);

      res.json({
        summary: {
          totalStudents,
          totalOutcomes,
          totalAssessments,
          masteryPercentage,
          coveragePercentage,
          recentUpdatesCount: recentUpdates.length
        },
        masteryStats,
        subjectBreakdown: subjectBreakdown as any[],
        recentUpdates: recentUpdates.map(update => ({
          id: update.id,
          studentName: `${update.student.firstName} ${update.student.lastName}`,
          outcomeCode: update.outcome.code,
          outcomeDescription: update.outcome.description,
          subject: update.outcome.subject,
          currentLevel: update.currentLevel,
          previousLevel: update.previousLevel,
          lastAssessmentDate: update.lastAssessmentDate,
          totalEvidencePieces: update.totalEvidencePieces
        })),
        evidenceBreakdown,
        timeframe: parseInt(timeframe as string)
      });
    } catch (error: unknown) {
      console.error('Mastery analytics error:', error);
      res.status(500).json({ error: 'Failed to retrieve mastery analytics' });
    }
  }
);

/**
 * POST /api/mastery/share-with-parents
 * Mark mastery records as shared with parents
 */
router.post('/share-with-parents',
  requireAuth,
  [
    body('progressIds')
      .isArray()
      .withMessage('Progress IDs must be an array'),
    
    body('progressIds.*')
      .isString()
      .withMessage('Each progress ID must be a string')
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { progressIds } = req.body;

      if (progressIds.length > 50) {
        res.status(400).json({ error: 'Maximum 50 records can be shared at once' });
        return;
      }

      // Update progress records
      const updateResult = await prisma.studentOutcomeProgress.updateMany({
        where: {
          id: { in: progressIds },
          userId: userId  // Ensure teacher owns these records
        },
        data: {
          parentShared: true,
          parentShareDate: new Date()
        }
      });

      res.json({
        message: `Marked ${updateResult.count} progress records as shared with parents`,
        sharedCount: updateResult.count,
        totalRequested: progressIds.length
      });
    } catch (error: unknown) {
      console.error('Parent sharing error:', error);
      res.status(500).json({ error: 'Failed to mark progress as shared' });
    }
  }
);

/**
 * DELETE /api/mastery/:progressId
 * Archive (soft delete) a mastery progress record
 */
router.delete('/:progressId',
  requireAuth,
  param('progressId').isString().withMessage('Progress ID is required'),
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const progressId = req.params.progressId;

      // Verify ownership and update
      const updateResult = await prisma.studentOutcomeProgress.updateMany({
        where: {
          id: progressId,
          userId: userId
        },
        data: {
          isArchived: true,
          updatedAt: new Date()
        }
      });

      if (updateResult.count === 0) {
        res.status(404).json({ error: 'Progress record not found or access denied' });
        return;
      }

      res.status(204).send();
    } catch (error: unknown) {
      console.error('Progress archiving error:', error);
      res.status(500).json({ error: 'Failed to archive progress record' });
    }
  }
);

// Cleanup on module exit
process.on('exit', async () => {
  await prisma.$disconnect();
});

export { router };