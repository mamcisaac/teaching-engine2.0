import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate as authenticateUser } from '../middleware/authenticate';

const router = Router();
const prisma = new PrismaClient();

// Validation schema for batch updates
const batchUpdateSchema = z.object({
  updates: z.array(z.object({
    lessonId: z.string(),
    date: z.string().datetime()
  }))
});

// Batch update lesson schedules
router.patch('/batch-update', authenticateUser, async (req, res) => {
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

    res.json({ 
      success: true, 
      message: `Updated ${updates.length} lessons` 
    });
  } catch (error) {
    console.error('Batch update error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Swap two lessons
router.post('/swap', authenticateUser, async (req, res) => {
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

    res.json({ 
      success: true, 
      message: 'Lessons swapped successfully' 
    });
  } catch (error) {
    console.error('Swap error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to swap lessons' });
  }
});

// Get schedule for date range
router.get('/range', authenticateUser, async (req, res) => {
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

    res.json(lessons);
  } catch (error) {
    console.error('Get range error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to get schedule' });
  }
});

// Move all lessons in a unit
router.post('/move-unit', authenticateUser, async (req, res) => {
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

    res.json({ 
      success: true, 
      message: `Moved ${lessons.length} lessons in unit` 
    });
  } catch (error) {
    console.error('Move unit error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to move unit' });
  }
});

export default router;