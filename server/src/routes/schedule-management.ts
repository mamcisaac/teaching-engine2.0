import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { LessonSchedulerService } from '../services/lessonScheduler';

const router = Router();
const prisma = new PrismaClient();
const schedulerService = new LessonSchedulerService(prisma);

// Validation schema for batch updates
const batchUpdateSchema = z.object({
  updates: z.array(z.object({
    lessonId: z.string(),
    date: z.string().datetime()
  }))
});

// Batch update lesson schedules
router.patch('/batch-update', authenticate, async (req, res) => {
  try {
    const { updates } = batchUpdateSchema.parse(req.body);
    const userId = req.user!.id;

    // Verify all lessons belong to the user
    const lessonIds = updates.map(u => u.lessonId);
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        id: { in: lessonIds },
        userId
      },
      select: { id: true }
    });

    if (lessons.length !== lessonIds.length) {
      return res.status(403).json({ 
        error: 'Some lessons do not belong to you or do not exist' 
      });
    }

    // Perform batch update
    const updatePromises = updates.map(({ lessonId, date }) =>
      prisma.eTFOLessonPlan.update({
        where: { id: lessonId },
        data: { date: new Date(date) }
      })
    );

    await prisma.$transaction(updatePromises);

    return res.json({ 
      success: true, 
      message: `Updated ${updates.length} lessons` 
    });
  } catch (error: unknown) {
    console.error('Batch update error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Swap two lessons
router.post('/swap', authenticate, async (req, res) => {
  try {
    const { lessonId1, lessonId2 } = z.object({
      lessonId1: z.string(),
      lessonId2: z.string()
    }).parse(req.body);
    
    const userId = req.user!.id;

    // Get both lessons
    const [lesson1, lesson2] = await Promise.all([
      prisma.eTFOLessonPlan.findFirst({
        where: { id: lessonId1, userId },
        select: { id: true, date: true }
      }),
      prisma.eTFOLessonPlan.findFirst({
        where: { id: lessonId2, userId },
        select: { id: true, date: true }
      })
    ]);

    if (!lesson1 || !lesson2) {
      return res.status(404).json({ error: 'One or both lessons not found' });
    }

    // Swap the dates
    await prisma.$transaction([
      prisma.eTFOLessonPlan.update({
        where: { id: lessonId1 },
        data: { date: lesson2.date }
      }),
      prisma.eTFOLessonPlan.update({
        where: { id: lessonId2 },
        data: { date: lesson1.date }
      })
    ]);

    return res.json({ 
      success: true, 
      message: 'Lessons swapped successfully' 
    });
  } catch (error: unknown) {
    console.error('Swap error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to swap lessons' });
  }
});

// Get schedule for date range
router.get('/range', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime()
    }).parse(req.query);
    
    const userId = req.user!.id;

    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: {
              select: {
                subject: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return res.json(lessons);
  } catch (error: unknown) {
    console.error('Get range error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to get schedule' });
  }
});

// Move all lessons in a unit
router.post('/move-unit', authenticate, async (req, res) => {
  try {
    const { unitId, startDate } = z.object({
      unitId: z.string(),
      startDate: z.string().datetime()
    }).parse(req.body);
    
    const userId = req.user!.id;

    // Get all lessons in the unit
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: unitId,
        userId
      },
      orderBy: {
        date: 'asc'
      }
    });

    if (lessons.length === 0) {
      return res.status(404).json({ error: 'No lessons found in this unit' });
    }

    // Calculate new dates maintaining relative spacing
    const firstLessonDate = new Date(lessons[0].date);
    const newStartDate = new Date(startDate);
    const daysDiff = Math.floor((newStartDate.getTime() - firstLessonDate.getTime()) / (1000 * 60 * 60 * 24));

    // Update all lessons
    const updatePromises = lessons.map(lesson => {
      const oldDate = new Date(lesson.date);
      const newDate = new Date(oldDate);
      newDate.setDate(newDate.getDate() + daysDiff);
      
      return prisma.eTFOLessonPlan.update({
        where: { id: lesson.id },
        data: { date: newDate }
      });
    });

    await prisma.$transaction(updatePromises);

    return res.json({ 
      success: true, 
      message: `Moved ${lessons.length} lessons in unit` 
    });
  } catch (error: unknown) {
    console.error('Move unit error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to move unit' });
  }
});

// INTELLIGENT SCHEDULING ENDPOINTS

// Input validation schemas for intelligent scheduling
const startNextUnitSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  userId: z.number().int().positive('Valid user ID required')
});

const scheduleUnitSchema = z.object({
  unitId: z.string().min(1, 'Unit ID is required'),
  userId: z.number().int().positive('Valid user ID required')
});

const scheduleAllLessonsSchema = z.object({
  userId: z.number().int().positive('Valid user ID required')
});

/**
 * POST /api/schedule/start-next-unit
 * Schedules the next unscheduled unit for a specific subject
 */
router.post('/start-next-unit', authenticate, async (req, res) => {
  try {
    console.log('🚀 API: Starting next unit for subject:', req.body);

    const { subject } = startNextUnitSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await schedulerService.scheduleNextUnit(subject, userId);

    console.log(`✅ Successfully scheduled next unit for ${subject}:`, {
      unitTitle: result.unitTitle,
      lessonsScheduled: result.lessonsScheduled,
      dateRange: result.dateRange
    });

    res.json({
      success: true,
      message: `Successfully scheduled unit "${result.unitTitle}"`,
      data: result
    });

  } catch (error) {
    console.error('❌ Error starting next unit:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to start next unit'
    });
  }
});

/**
 * POST /api/schedule/schedule-unit
 * Schedules a specific unit by ID
 */
router.post('/schedule-unit', authenticate, async (req, res) => {
  try {
    console.log('🎯 API: Scheduling specific unit:', req.body);

    const { unitId } = scheduleUnitSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await schedulerService.scheduleUnit(unitId, userId);

    console.log(`✅ Successfully scheduled unit ${unitId}:`, {
      unitTitle: result.unitTitle,
      lessonsScheduled: result.lessonsScheduled,
      dateRange: result.dateRange
    });

    res.json({
      success: true,
      message: `Successfully scheduled unit "${result.unitTitle}"`,
      data: result
    });

  } catch (error) {
    console.error('❌ Error scheduling unit:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to schedule unit'
    });
  }
});

/**
 * POST /api/schedule/schedule-all-lessons  
 * Schedules all lessons across all subjects with optimal distribution
 */
router.post('/schedule-all-lessons', authenticate, async (req, res) => {
  try {
    console.log('🌟 API: Starting comprehensive lesson scheduling:', req.body);

    const userId = req.user!.id;

    const result = await schedulerService.scheduleAllLessons(userId);

    console.log(`✅ Comprehensive scheduling complete:`, {
      totalLessonsScheduled: result.totalLessonsScheduled,
      unitsProcessed: result.unitResults.length,
      summary: result.summary
    });

    res.json({
      success: true,
      message: `Successfully scheduled ${result.totalLessonsScheduled} lessons across ${result.unitResults.length} units`,
      data: result
    });

  } catch (error) {
    console.error('❌ Error scheduling all lessons:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to schedule all lessons'
    });
  }
});

/**
 * GET /api/schedule/stats
 * Get current scheduling statistics for the authenticated user
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    console.log(`📊 API: Getting scheduling stats for user ${userId}`);

    const stats = await schedulerService.getSchedulingStats(userId);

    console.log(`✅ Retrieved scheduling stats:`, stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error getting scheduling stats:', error);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get scheduling statistics'
    });
  }
});

/**
 * GET /api/schedule/calendar-summary
 * Get school calendar summary information
 */
router.get('/calendar-summary', authenticate, async (req, res) => {
  try {
    console.log('📅 API: Getting school calendar summary');

    // Import here to avoid circular dependencies
    const { schoolCalendar } = await import('../services/schoolCalendar');
    const summary = schoolCalendar.getSchoolYearSummary();

    console.log('✅ Retrieved calendar summary:', summary);

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('❌ Error getting calendar summary:', error);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get calendar summary'
    });
  }
});

export default router;