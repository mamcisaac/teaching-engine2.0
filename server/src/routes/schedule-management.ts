import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Simple position management - just sequential integers
const POSITION_GAP = 1000;

// Validation schemas
const reorderSchema = z.object({
  lessonId: z.string(),
  targetDate: z.string().datetime(),
  targetIndex: z.number().int().min(0)
});

const batchUpdateSchema = z.object({
  updates: z.array(z.object({
    lessonId: z.string(),
    date: z.string().datetime(),
    position: z.number().int().optional()
  }))
});

// Helper to get date boundaries
function getDayBoundaries(date: Date): { start: Date, end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

// Reindex all lessons for a day with clean positions
async function reindexLessonsForDay(
  tx: any,
  userId: number,
  date: Date
): Promise<void> {
  const { start, end } = getDayBoundaries(date);
  
  // Get all lessons for the day
  const lessons = await tx.eTFOLessonPlan.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lt: end
      }
    },
    orderBy: { position: 'asc' },
    select: { id: true }
  });

  // Update each with clean position
  for (let i = 0; i < lessons.length; i++) {
    await tx.eTFOLessonPlan.update({
      where: { id: lessons[i].id },
      data: { position: (i + 1) * POSITION_GAP }
    });
  }
}

// Reorder a lesson
router.post('/reorder', authenticate, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;

    const { lessonId, targetDate, targetIndex } = reorderSchema.parse(req.body);

    const updatedLesson = await prisma.$transaction(async (tx) => {
      // Verify ownership
      const lesson = await tx.eTFOLessonPlan.findFirst({
        where: { id: lessonId, userId },
        select: { id: true }
      });

      if (!lesson) {
        throw new Error('Lesson not found');
      }

      const newDate = new Date(targetDate);
      
      // Update lesson with temporary position that will sort correctly
      await tx.eTFOLessonPlan.update({
        where: { id: lessonId },
        data: {
          date: newDate,
          position: targetIndex * POSITION_GAP + POSITION_GAP / 2 // Places it between existing positions
        }
      });

      // Reindex the entire day to get clean positions
      await reindexLessonsForDay(tx, userId, newDate);

      // Return the updated lesson
      return await tx.eTFOLessonPlan.findUnique({
        where: { id: lessonId },
        include: {
          unitPlan: {
            include: {
              longRangePlan: {
                select: { subject: true }
              }
            }
          }
        }
      });
    });

    res.json({
      success: true,
      lesson: updatedLesson
    });
  } catch (error: any) {
    console.error('Reorder error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error.message === 'Lesson not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to reorder lesson' });
  }
});

// Get lessons for date range
router.get('/range', authenticate, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;

    const { startDate, endDate } = z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime()
    }).parse(req.query);

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
              select: { subject: true }
            }
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { position: 'asc' }
      ]
    });

    res.json(lessons);
  } catch (error) {
    console.error('Get range error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to get schedule' });
  }
});

// Batch update lessons
router.patch('/batch-update', authenticate, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;

    const { updates } = batchUpdateSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const affectedDates = new Set<string>();
      
      for (const update of updates) {
        const newDate = new Date(update.date);
        affectedDates.add(newDate.toDateString());
        
        // Verify ownership
        const lesson = await tx.eTFOLessonPlan.findFirst({
          where: { id: update.lessonId, userId },
          select: { id: true }
        });
        
        if (!lesson) {
          throw new Error(`Lesson ${update.lessonId} not found`);
        }
        
        await tx.eTFOLessonPlan.update({
          where: { id: update.lessonId },
          data: {
            date: newDate,
            ...(update.position !== undefined && { position: update.position })
          }
        });
      }

      // Reindex affected dates
      for (const dateStr of affectedDates) {
        await reindexLessonsForDay(tx, userId, new Date(dateStr));
      }

      return { success: true, updatedCount: updates.length };
    });

    res.json(result);
  } catch (error: any) {
    console.error('Batch update error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Swap two lessons
router.post('/swap', authenticate, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;

    const { lessonId1, lessonId2 } = z.object({
      lessonId1: z.string(),
      lessonId2: z.string()
    }).parse(req.body);

    await prisma.$transaction(async (tx) => {
      const [lesson1, lesson2] = await Promise.all([
        tx.eTFOLessonPlan.findFirst({
          where: { id: lessonId1, userId },
          select: { id: true, date: true, position: true }
        }),
        tx.eTFOLessonPlan.findFirst({
          where: { id: lessonId2, userId },
          select: { id: true, date: true, position: true }
        })
      ]);

      if (!lesson1 || !lesson2) {
        throw new Error('One or both lessons not found');
      }

      // Swap the lessons
      await Promise.all([
        tx.eTFOLessonPlan.update({
          where: { id: lessonId1 },
          data: {
            date: lesson2.date,
            position: lesson2.position
          }
        }),
        tx.eTFOLessonPlan.update({
          where: { id: lessonId2 },
          data: {
            date: lesson1.date,
            position: lesson1.position
          }
        })
      ]);
    });

    res.json({
      success: true,
      message: 'Lessons swapped successfully'
    });
  } catch (error: any) {
    console.error('Swap error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error.message === 'One or both lessons not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to swap lessons' });
  }
});

// Move all lessons in a unit
router.post('/move-unit', authenticate, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;

    const { unitId, startDate } = z.object({
      unitId: z.string(),
      startDate: z.string().datetime()
    }).parse(req.body);

    await prisma.$transaction(async (tx) => {
      const lessons = await tx.eTFOLessonPlan.findMany({
        where: {
          unitPlanId: unitId,
          userId
        },
        orderBy: [
          { date: 'asc' },
          { position: 'asc' }
        ]
      });

      if (lessons.length === 0) {
        throw new Error('No lessons found in this unit');
      }

      const firstLessonDate = new Date(lessons[0].date);
      const newStartDate = new Date(startDate);
      const daysDiff = Math.floor((newStartDate.getTime() - firstLessonDate.getTime()) / (1000 * 60 * 60 * 24));

      const affectedDates = new Set<string>();

      // Update all lessons
      await Promise.all(
        lessons.map(lesson => {
          const oldDate = new Date(lesson.date);
          const newDate = new Date(oldDate);
          newDate.setDate(newDate.getDate() + daysDiff);
          affectedDates.add(newDate.toDateString());
          
          return tx.eTFOLessonPlan.update({
            where: { id: lesson.id },
            data: { date: newDate }
          });
        })
      );

      // Reindex all affected dates
      for (const dateStr of affectedDates) {
        await reindexLessonsForDay(tx, userId, new Date(dateStr));
      }
    });

    res.json({
      success: true,
      message: 'Unit moved successfully'
    });
  } catch (error: any) {
    console.error('Move unit error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error.message === 'No lessons found in this unit') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to move unit' });
  }
});

export default router;