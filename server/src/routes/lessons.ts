/**
 * Lesson API endpoints for detailed lesson views
 * Provides French-first content with parsed JSON pedagogy fields
 */

import { Router } from 'express';
import type { Response, NextFunction } from 'express';

import { prisma } from '../prisma';
import { toLessonView } from '../services/lessons/view';
import type { AuthenticatedRequest } from './base/BaseRouteHandler';

export const lessonsRouter = Router();

// GET /api/lessons/:id - Return full lesson with parsed JSON fields
lessonsRouter.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const lesson = await prisma.eTFOLessonPlan.findUnique({ 
      where: { id: String(id) }
    });
    
    if (!lesson) {
      return res.status(404).json({ error: 'lesson_not_found' });
    }
    
    // Check user owns this lesson
    if (lesson.userId !== req.user?.id) {
      return res.status(403).json({ error: 'forbidden' });
    }
    
    return res.json(toLessonView(lesson));
  } catch (error) {
    next(error);
  }
});

// GET /api/lessons/:id/assessment-context - Return lesson + expectations for assessment
lessonsRouter.get('/:id/assessment-context', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const lesson = await prisma.eTFOLessonPlan.findUnique({ 
      where: { id: String(id) }
    });
    
    if (!lesson) {
      return res.status(404).json({ error: 'lesson_not_found' });
    }
    
    // Check user owns this lesson
    if (lesson.userId !== req.user?.id) {
      return res.status(403).json({ error: 'forbidden' });
    }
    
    const view = toLessonView(lesson);
    
    // Try to get linked expectations if the join table exists
    let expectations: Array<{ id: string; code: string; text: string }> = [];
    try {
      // Check if ETFOLessonPlanExpectation table exists
      const linkedExpectations = await prisma.eTFOLessonPlanExpectation.findMany({
        where: { lessonId: String(id) },
        include: {
          expectation: {
            select: { id: true, code: true, text: true }
          }
        }
      });
      
      expectations = linkedExpectations.map(link => ({
        id: String(link.expectation.id),
        code: link.expectation.code,
        text: link.expectation.text
      }));
    } catch {
      // Join table might not exist, keep expectations empty
    }
    
    return res.json({
      lesson: { 
        id: view.id, 
        title: view.title, 
        date: view.date, 
        subject: view.subject 
      },
      expectations
    });
  } catch (error) {
    next(error);
  }
});