import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { LessonSchedulerService } from '../services/lessonScheduler';
import { schoolCalendar } from '../services/schoolCalendar';

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
    const firstLesson = lessons[0];
    if (!firstLesson) {
      return res.status(404).json({ error: 'No lessons found' });
    }
    const firstLessonDate = new Date(firstLesson.date);
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

// Unused schema - commenting out to avoid unused variable warning
// const scheduleAllLessonsSchema = z.object({
//   userId: z.number().int().positive('Valid user ID required')
// });

/**
 * POST /api/schedule/start-next-unit
 * Schedules the next unscheduled unit for a specific subject
 */
router.post('/start-next-unit', authenticate, async (req, res): Promise<any> => {
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

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to start next unit'
    });
  }
});

/**
 * POST /api/schedule/schedule-unit
 * Schedules a specific unit by ID
 */
router.post('/schedule-unit', authenticate, async (req, res): Promise<any> => {
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
router.post('/schedule-all-lessons', authenticate, async (req, res): Promise<any> => {
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
router.get('/calendar-summary', authenticate, async (_req, res) => {
  try {
    console.log('📅 API: Getting school calendar summary');

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

// FLEXIBLE SCHEDULING ENDPOINTS

/**
 * POST /api/schedule/shift-subject
 * Shift all future lessons for a subject forward by N days
 * Maintains core lesson sequence and respects school calendar
 */
router.post('/shift-subject', authenticate, async (req, res): Promise<any> => {
  try {
    const { subject, fromDate, shiftDays, shiftOnlyFrom } = z.object({
      subject: z.string().min(1),
      fromDate: z.string().datetime(),
      shiftDays: z.number().int().min(1).max(30),
      shiftOnlyFrom: z.boolean().optional() // If true, only shift from this date onward
    }).parse(req.body);
    
    const userId = req.user!.id;
    
    console.log(`📅 Shifting ${subject} lessons by ${shiftDays} days from ${fromDate}`);
    
    // Determine which lessons to shift
    const dateFilter = shiftOnlyFrom 
      ? { gte: new Date(fromDate) }
      : { gt: new Date(fromDate) };
    
    // CRITICAL FIX: Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Get lessons to shift with lock (both core and scheduled extensions)
      const lessonsToShift = await tx.eTFOLessonPlan.findMany({
        where: {
          userId,
          subject,
          date: dateFilter,
          isScheduled: true
        },
        include: {
          unitPlan: {
            include: {
              longRangePlan: {
                select: { subject: true }
              }
            }
          }
        },
        orderBy: [
          { date: 'asc' },
          { lessonNumber: 'asc' }
        ]
      });
      
      if (lessonsToShift.length === 0) {
        return {
          success: true,
          message: 'No future lessons to shift',
          lessonsShifted: 0
        };
      }
      
      // Get the actual subject from LRP if not directly on lesson
      const actualSubject = subject || lessonsToShift[0]?.unitPlan?.longRangePlan?.subject;
      
      // Use school calendar to find valid teaching days
      const teachingDays = schoolCalendar.getTeachingDays();
      // const startDateObj = new Date(fromDate); // Unused variable - commenting out
      
      // Check if this is an alternating subject
      const isAlternating = actualSubject ? ['Sciences humaines', 'Formation personnelle et sociale'].includes(actualSubject) : false;
      
      // Calculate new dates and apply updates atomically
      let lessonsShifted = 0;
      
      for (const lesson of lessonsToShift) {
        const currentDate = new Date(lesson.date);
        let targetDayIndex = teachingDays.findIndex((d: any) => 
          d.date === currentDate.toISOString().split('T')[0]
        );
        
        if (targetDayIndex === -1) {
          console.warn(`Current date ${currentDate} not found in teaching days, using closest`);
          targetDayIndex = teachingDays.findIndex((d: any) => d.dateObj >= currentDate);
        }
        
        // Find the next valid teaching day
        let newDayIndex = targetDayIndex + shiftDays;
        
        // For alternating subjects, ensure we maintain the pattern with loop protection
        if (isAlternating) {
          const shouldBeEven = actualSubject === 'Sciences humaines';
          let attempts = 0;
          const maxAttempts = Math.min(10, teachingDays.length - newDayIndex);
          
          while (newDayIndex < teachingDays.length && attempts < maxAttempts) {
            const newIsEven = newDayIndex % 2 === 0;
            if ((shouldBeEven && newIsEven) || (!shouldBeEven && !newIsEven)) {
              break;
            }
            newDayIndex++;
            attempts++;
          }
        }
        
        if (newDayIndex >= teachingDays.length) {
          console.warn(`Cannot shift lesson ${lesson.id} - would exceed school year`);
          continue;
        }
        
        const teachingDay = teachingDays[newDayIndex];
        if (!teachingDay) {
          console.warn(`Cannot shift lesson ${lesson.id} - teaching day not found`);
          continue;
        }
        const newDate = new Date(teachingDay.date + 'T09:00:00');
        
        // Update immediately within transaction
        await tx.eTFOLessonPlan.update({
          where: { id: lesson.id },
          data: { 
            date: newDate,
            slotNumber: lesson.slotNumber
          }
        });
        
        lessonsShifted++;
      }
      
      return {
        success: lessonsShifted > 0,
        message: lessonsShifted > 0
          ? `Shifted ${lessonsShifted} ${actualSubject} lessons forward by ${shiftDays} day(s)`
          : 'Could not shift any lessons - would exceed school year',
        lessonsShifted,
        isAlternating,
        maintainedPattern: true
      };
    });
    
    console.log(`✅ Shift operation completed: ${result.lessonsShifted} lessons shifted`);
    res.json(result);
    
  } catch (error) {
    console.error('Error shifting subject:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: 'Failed to shift lessons' 
    });
  }
});

/**
 * POST /api/schedule/activate-extension
 * Schedule an extension lesson to a specific date
 */
router.post('/activate-extension', authenticate, async (req, res): Promise<any> => {
  try {
    const { lessonId, date, slotNumber } = z.object({
      lessonId: z.string(),
      date: z.string().datetime(),
      slotNumber: z.number().int().min(1).max(5).optional()
    }).parse(req.body);
    
    const userId = req.user!.id;
    
    // Verify the lesson is an extension and belongs to user
    const lesson = await prisma.eTFOLessonPlan.findFirst({
      where: {
        id: lessonId,
        userId,
        lessonType: 'extension'
      }
    });
    
    if (!lesson) {
      return res.status(404).json({
        error: 'Extension lesson not found'
      });
    }
    
    // CRITICAL FIX: Prevent double-scheduling of extensions
    if (lesson.isScheduled && lesson.date && 
        new Date(lesson.date).getFullYear() < 2099) {
      return res.status(400).json({
        error: 'Extension lesson is already scheduled',
        scheduledDate: lesson.date,
        lessonTitle: lesson.titleFr || lesson.title
      });
    }
    
    // Update the lesson to be scheduled
    const updated = await prisma.eTFOLessonPlan.update({
      where: { id: lessonId },
      data: {
        date: new Date(date),
        isScheduled: true,
        slotNumber: slotNumber || lesson.slotNumber
      }
    });
    
    console.log(`✅ Activated extension lesson: ${updated.titleFr || updated.title}`);
    
    res.json({
      success: true,
      message: 'Extension lesson scheduled successfully',
      lesson: updated
    });
    
  } catch (error) {
    console.error('Error activating extension:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: 'Failed to activate extension' 
    });
  }
});

/**
 * POST /api/schedule/replace-with-extension
 * Replace a scheduled core lesson with an extension
 * The core lesson is properly rescheduled to the next available slot
 */
router.post('/replace-with-extension', authenticate, async (req, res): Promise<any> => {
  try {
    const { coreLessonId, extensionLessonId, rescheduleCore } = z.object({
      coreLessonId: z.string(),
      extensionLessonId: z.string(),
      rescheduleCore: z.boolean().optional().default(true) // Whether to reschedule the core lesson
    }).parse(req.body);
    
    const userId = req.user!.id;
    
    // Get both lessons with their units for subject info
    const [coreLesson, extensionLesson] = await Promise.all([
      prisma.eTFOLessonPlan.findFirst({
        where: { id: coreLessonId, userId, lessonType: 'core' },
        include: {
          unitPlan: {
            include: {
              longRangePlan: { select: { subject: true } }
            }
          }
        }
      }),
      prisma.eTFOLessonPlan.findFirst({
        where: { id: extensionLessonId, userId, lessonType: 'extension' }
      })
    ]);
    
    if (!coreLesson || !extensionLesson) {
      return res.status(404).json({
        error: 'Core or extension lesson not found'
      });
    }
    
    // Validate they're from the same unit
    if (coreLesson.unitPlanId !== extensionLesson.unitPlanId) {
      return res.status(400).json({
        error: 'Core and extension lessons must be from the same unit'
      });
    }
    
    const updates = [];
    const coreLessonDate = new Date(coreLesson.date);
    
    if (rescheduleCore) {
      // Find next available slot for the core lesson
      const subject = coreLesson.subject || coreLesson.unitPlan.longRangePlan.subject;
      const isAlternating = ['Sciences humaines', 'Formation personnelle et sociale'].includes(subject);
      
      // Get next teaching day after current date
      const teachingDays = schoolCalendar.getTeachingDays();
      const currentDayIndex = teachingDays.findIndex((d: any) => 
        d.date === coreLessonDate.toISOString().split('T')[0]
      );
      
      let nextAvailableDate = null;
      
      // Find next available date for this subject
      for (let i = currentDayIndex + 1; i < teachingDays.length; i++) {
        const candidateDay = teachingDays[i];
        
        // For alternating subjects, check pattern
        if (isAlternating) {
          const shouldBeEven = subject === 'Sciences humaines';
          const isEvenDay = i % 2 === 0;
          if ((shouldBeEven && !isEvenDay) || (!shouldBeEven && isEvenDay)) {
            continue;
          }
        }
        
        // Check if this date is already occupied by another lesson from this subject
        const conflict = await prisma.eTFOLessonPlan.findFirst({
          where: {
            userId,
            subject,
            date: {
              gte: new Date((candidateDay?.date || '') + 'T00:00:00'),
              lt: new Date((candidateDay?.date || '') + 'T23:59:59')
            },
            id: { not: coreLessonId }
          }
        });
        
        if (!conflict) {
          nextAvailableDate = new Date((candidateDay?.date || '') + 'T09:00:00');
          break;
        }
      }
      
      if (!nextAvailableDate) {
        return res.status(400).json({
          error: 'No available date found to reschedule core lesson'
        });
      }
      
      // Reschedule core lesson to next available date
      updates.push(
        prisma.eTFOLessonPlan.update({
          where: { id: coreLessonId },
          data: { 
            date: nextAvailableDate,
            isScheduled: true
          }
        })
      );
    } else {
      // Just unschedule the core lesson
      updates.push(
        prisma.eTFOLessonPlan.update({
          where: { id: coreLessonId },
          data: { 
            date: new Date('2099-12-31'),
            isScheduled: false
          }
        })
      );
    }
    
    // Schedule the extension in place of the core lesson
    updates.push(
      prisma.eTFOLessonPlan.update({
        where: { id: extensionLessonId },
        data: { 
          date: coreLessonDate,
          isScheduled: true,
          slotNumber: coreLesson.slotNumber
        }
      })
    );
    
    await prisma.$transaction(updates);
    
    console.log(`✅ Replaced core lesson with extension, core rescheduled: ${rescheduleCore}`);
    
    res.json({
      success: true,
      message: rescheduleCore 
        ? 'Successfully replaced core lesson with extension and rescheduled core'
        : 'Successfully replaced core lesson with extension',
      coreRescheduled: rescheduleCore
    });
    
  } catch (error) {
    console.error('Error replacing with extension:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: 'Failed to replace with extension' 
    });
  }
});

/**
 * POST /api/schedule/validate-shift
 * Validate if shifting lessons would cause conflicts
 */
router.post('/validate-shift', authenticate, async (req, res): Promise<any> => {
  try {
    const { subject, fromDate, shiftDays } = z.object({
      subject: z.string().min(1),
      fromDate: z.string().datetime(),
      shiftDays: z.number().int().min(-30).max(30)
    }).parse(req.body);
    
    const userId = req.user!.id;
    
    // Get lessons that would be shifted
    const lessonsToCheck = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId,
        subject,
        date: { gte: new Date(fromDate) },
        isScheduled: true
      },
      include: {
        unitPlan: {
          include: {
            longRangePlan: { select: { subject: true } }
          }
        }
      }
    });
    
    const conflicts = [];
    const warnings = [];
    
    for (const lesson of lessonsToCheck) {
      const currentDate = new Date(lesson.date);
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + shiftDays);
      
      // Check if new date would be outside school year
      const teachingDays = schoolCalendar.getTeachingDays();
      const lastDay = teachingDays[teachingDays.length - 1]?.dateObj;
      
      if (lastDay && newDate > lastDay) {
        conflicts.push({
          lessonId: lesson.id,
          title: lesson.titleFr || lesson.title,
          reason: 'Would exceed school year',
          currentDate: currentDate.toISOString().split('T')[0],
          proposedDate: newDate.toISOString().split('T')[0]
        });
      }
      
      // Check for conflicts with other subjects on the same day/slot
      const conflictingLesson = await prisma.eTFOLessonPlan.findFirst({
        where: {
          userId,
          date: {
            gte: new Date(newDate.toISOString().split('T')[0] + 'T00:00:00'),
            lt: new Date(newDate.toISOString().split('T')[0] + 'T23:59:59')
          },
          slotNumber: lesson.slotNumber,
          id: { not: lesson.id }
        }
      });
      
      if (conflictingLesson) {
        warnings.push({
          lessonId: lesson.id,
          title: lesson.titleFr || lesson.title,
          reason: `Slot ${lesson.slotNumber} already occupied`,
          conflictsWith: conflictingLesson.titleFr || conflictingLesson.title
        });
      }
    }
    
    const isValid = conflicts.length === 0;
    
    res.json({
      valid: isValid,
      totalLessons: lessonsToCheck.length,
      conflicts,
      warnings,
      canProceed: isValid && warnings.length === 0
    });
    
  } catch (error) {
    console.error('Error validating shift:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: 'Failed to validate shift' 
    });
  }
});

/**
 * GET /api/schedule/available-extensions
 * Get all unscheduled extension lessons for a subject or unit
 */
router.get('/available-extensions', authenticate, async (req, res): Promise<any> => {
  try {
    const { subject, unitId } = z.object({
      subject: z.string().optional(),
      unitId: z.string().optional()
    }).parse(req.query);
    
    const userId = req.user!.id;
    
    const where: any = {
      userId,
      lessonType: 'extension',
      isScheduled: false
    };
    
    if (subject) {
      where.subject = subject;
    }
    
    if (unitId) {
      where.unitPlanId = unitId;
    }
    
    const extensions = await prisma.eTFOLessonPlan.findMany({
      where,
      include: {
        unitPlan: {
          select: {
            title: true,
            titleFr: true
          }
        }
      },
      orderBy: [
        { unitPlanId: 'asc' },
        { lessonNumber: 'asc' }
      ]
    });
    
    res.json({
      success: true,
      extensions,
      count: extensions.length
    });
    
  } catch (error) {
    console.error('Error getting available extensions:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid query parameters', 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: 'Failed to get available extensions' 
    });
  }
});

export default router;