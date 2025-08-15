/**
 * Lesson Generation API Routes
 * 
 * API endpoints for triggering the intelligent lesson generation framework
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { LessonGenerationFramework } from '../services/LessonGenerationFramework';
import { logger } from '../logger';
import { getErrorMessage } from '../utils/type-guards';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/lesson-generation/generate-all
 * Generate lessons for all unit plans
 */
router.post('/generate-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User authentication required' 
      });
    }

    // Check if user is Emily (only Emily should generate lessons in production)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user || user.email !== 'emmcisaac@gmail.com') {
      return res.status(403).json({
        success: false,
        error: 'Lesson generation is restricted to Emily McIsaac\'s account'
      });
    }

    logger.info(`Lesson generation initiated by ${user.name} (${user.email})`);

    // Initialize and run lesson generation
    const framework = new LessonGenerationFramework(prisma);
    
    // Health check first
    const healthCheck = await framework.checkHealth();
    if (!healthCheck.healthy) {
      return res.status(500).json({
        success: false,
        error: 'Framework health check failed',
        details: healthCheck.details
      });
    }

    const startTime = Date.now();
    const initialLessonCount = Number(healthCheck.details.lessonsGenerated) || 0;

    // Generate lessons
    await framework.generateAllLessons();

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Final count
    const finalCheck = await framework.checkHealth();
    const finalLessonCount = Number(finalCheck.details.lessonsGenerated) || 0;
    const lessonsGenerated = finalLessonCount - initialLessonCount;

    // Get breakdown by subject
    const subjects = [
      'Français (Immersion)',
      'Mathématiques',
      'Sciences de la nature', 
      'Sciences humaines',
      'Arts visuels',
      'Formation personnelle et sociale'
    ];

    const subjectBreakdown: { [key: string]: number } = {};
    for (const subject of subjects) {
      const count = await prisma.eTFOLessonPlan.count({
        where: {
          userId: userId,
          subject: subject
        }
      });
      subjectBreakdown[subject] = count;
    }

    logger.info(`Lesson generation completed: ${lessonsGenerated} new lessons in ${duration}s`);

    res.json({
      success: true,
      message: `Successfully generated ${lessonsGenerated} new lessons`,
      data: {
        lessonsGenerated,
        totalLessons: finalLessonCount,
        generationTimeSeconds: duration,
        unitPlansProcessed: healthCheck.details.unitPlansAvailable,
        subjectBreakdown
      }
    });

  } catch (error) {
    logger.error('Lesson generation failed:', getErrorMessage(error));
    
    res.status(500).json({
      success: false,
      error: 'Lesson generation failed',
      message: getErrorMessage(error)
    });
  }
});

/**
 * GET /api/lesson-generation/status
 * Get current status of lesson generation system
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User authentication required' 
      });
    }

    const framework = new LessonGenerationFramework(prisma);
    const healthCheck = await framework.checkHealth();

    // Get some additional stats
    const unitPlans = await prisma.unitPlan.count({
      where: { userId: userId }
    });

    const lessonPlans = await prisma.eTFOLessonPlan.count({
      where: { userId: userId }
    });

    const upcomingLessons = await prisma.eTFOLessonPlan.count({
      where: {
        userId: userId,
        date: {
          gte: new Date()
        }
      }
    });

    res.json({
      success: true,
      data: {
        frameworkHealthy: healthCheck.healthy,
        unitPlans,
        totalLessons: lessonPlans,
        upcomingLessons,
        frameworkDetails: healthCheck.details
      }
    });

  } catch (error) {
    logger.error('Failed to get lesson generation status:', getErrorMessage(error));
    
    res.status(500).json({
      success: false,
      error: 'Failed to get status',
      message: getErrorMessage(error)
    });
  }
});

/**
 * POST /api/lesson-generation/generate-unit/:unitId
 * Generate lessons for a specific unit
 */
router.post('/generate-unit/:unitId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { unitId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'User authentication required' 
      });
    }

    // Verify unit belongs to user
    const unit = await prisma.unitPlan.findFirst({
      where: {
        id: unitId,
        userId: userId
      },
      include: {
        longRangePlan: true,
        expectations: {
          include: {
            expectation: true
          }
        }
      }
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit plan not found or unauthorized'
      });
    }

    const framework = new LessonGenerationFramework(prisma);
    await framework.initialize();

    // Build unit context
    const unitContext = {
      id: unit.id,
      title: unit.title,
      titleFr: unit.titleFr || unit.title,
      subject: unit.longRangePlan.subject,
      startDate: unit.startDate,
      endDate: unit.endDate,
      keyVocabulary: Array.isArray(unit.keyVocabulary) ? unit.keyVocabulary : [],
      bigIdeas: unit.bigIdeas || '',
      bigIdeasFr: unit.bigIdeasFr || unit.bigIdeas || '',
      essentialQuestions: Array.isArray(unit.essentialQuestions) ? unit.essentialQuestions : [],
      expectations: unit.expectations.map((ue: any) => ({
        id: ue.expectation.id,
        code: ue.expectation.code,
        description: ue.expectation.description
      }))
    };

    const startTime = Date.now();
    const initialCount = await prisma.eTFOLessonPlan.count({
      where: { unitPlanId: unitId }
    });

    const lessonsCreated = await framework.generateLessonsForUnit(unitContext);

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    logger.info(`Generated ${lessonsCreated} lessons for unit "${unit.title}" in ${duration}s`);

    res.json({
      success: true,
      message: `Successfully generated ${lessonsCreated} lessons for unit "${unit.title}"`,
      data: {
        unitId,
        unitTitle: unit.title,
        lessonsCreated,
        generationTimeSeconds: duration
      }
    });

  } catch (error) {
    logger.error('Unit lesson generation failed:', getErrorMessage(error));
    
    res.status(500).json({
      success: false,
      error: 'Unit lesson generation failed',
      message: getErrorMessage(error)
    });
  }
});

export default router;