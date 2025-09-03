import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to extract user from token
const getUserFromToken = (req: Request): number | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key-for-development') as any;
    return decoded.id;
  } catch {
    return null;
  }
};

// Get cascade data with real database
router.get('/data', async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Fetch LRPs with nested units and lessons - avoiding schema issues
    const lrps = await prisma.longRangePlan.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        subject: true,
        academicYear: true,
        unitPlans: {
          select: {
            id: true,
            title: true,
            description: true,
            lessonPlans: {
              select: {
                id: true,
                title: true,
                duration: true,
                learningGoals: true
              }
            }
          }
        }
      },
      orderBy: { subject: 'asc' }
    });

    // Transform to cascade format
    const cascadeData = lrps.map(lrp => ({
      id: `lrp-${lrp.id}`,
      nodeType: 'lrp' as const,
      label: lrp.title,
      title: lrp.title,
      type: 'lrp' as const,
      hasChildren: lrp.unitPlans.length > 0,
      childrenCount: lrp.unitPlans.length,
      expanded: false,
      metadata: {
        academicYear: lrp.academicYear,
        subject: lrp.subject
      },
      children: lrp.unitPlans.map(unit => ({
        id: `unit-${unit.id}`,
        nodeType: 'unit' as const,
        label: unit.title,
        title: unit.title,
        type: 'unit' as const,
        hasChildren: unit.lessonPlans.length > 0,
        childrenCount: unit.lessonPlans.length,
        expanded: false,
        metadata: {
          description: unit.description
        },
        children: unit.lessonPlans.map(lesson => ({
          id: `lesson-${lesson.id}`,
          nodeType: 'lesson' as const,
          label: lesson.title,
          title: lesson.title,
          type: 'lesson' as const,
          hasChildren: false,
          childrenCount: 0,
          expanded: false,
          metadata: {
            duration: lesson.duration,
            learningGoals: lesson.learningGoals
          },
          children: []
        }))
      }))
    }));

    // Calculate stats
    const stats = {
      totalLRPs: lrps.length,
      totalUnits: lrps.reduce((sum, lrp) => sum + lrp.unitPlans.length, 0),
      totalLessons: lrps.reduce((sum, lrp) => 
        sum + lrp.unitPlans.reduce((unitSum, unit) => 
          unitSum + unit.lessonPlans.length, 0), 0),
      subjects: [...new Set(lrps.map(lrp => lrp.subject))]
    };

    res.json({
      success: true,
      data: cascadeData,
      stats
    });
  } catch (error) {
    console.error('Cascade data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cascade data'
    });
  }
});

// Get only root level items (LRPs)
router.get('/roots', async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const lrps = await prisma.longRangePlan.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        subject: true,
        academicYear: true,
        totalHours: true,
        grade: true,
        _count: {
          select: { unitPlans: true }
        }
      },
      orderBy: { subject: 'asc' }
    });

    const roots = lrps.map(lrp => ({
      id: `lrp-${lrp.id}`,
      nodeType: 'lrp' as const,
      title: lrp.title,
      hasChildren: lrp._count.unitPlans > 0,
      childCount: lrp._count.unitPlans,
      metadata: {
        academicYear: lrp.academicYear,
        subject: lrp.subject,
        grade: lrp.grade,
        totalHours: lrp.totalHours
      }
    }));

    res.json({
      success: true,
      data: roots
    });
  } catch (error) {
    console.error('Roots error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch root items'
    });
  }
});

// Get children of a specific node
router.get('/children/:nodeType/:parentId', async (req: Request, res: Response) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { nodeType, parentId } = req.params;
    const id = parseInt(parentId.replace(/^(lrp|unit|lesson)-/, ''));

    let children: any[] = [];

    if (nodeType === 'lrp') {
      // Get units for an LRP
      const units = await prisma.unitPlan.findMany({
        where: { 
          longRangePlanId: id,
          longRangePlan: { userId }
        },
        select: {
          id: true,
          title: true,
          description: true,
          estimatedHours: true,
          startDate: true,
          endDate: true,
          _count: {
            select: { lessonPlans: true }
          }
        },
        orderBy: { startDate: 'asc' }
      });

      children = units.map(unit => ({
        id: `unit-${unit.id}`,
        nodeType: 'unit',
        title: unit.title,
        hasChildren: unit._count.lessonPlans > 0,
        childCount: unit._count.lessonPlans,
        metadata: {
          startDate: unit.startDate,
          endDate: unit.endDate,
          estimatedHours: unit.estimatedHours,
          description: unit.description
        }
      }));
    } else if (nodeType === 'unit') {
      // Get lessons for a unit
      const lessons = await prisma.eTFOLessonPlan.findMany({
        where: { 
          unitPlanId: id,
          unitPlan: {
            longRangePlan: { userId }
          }
        },
        select: {
          id: true,
          title: true,
          date: true,
          duration: true,
          learningGoals: true
        },
        orderBy: { date: 'asc' }
      });

      children = lessons.map(lesson => ({
        id: `lesson-${lesson.id}`,
        nodeType: 'lesson',
        title: lesson.title,
        hasChildren: false,
        childCount: 0,
        metadata: {
          date: lesson.date,
          duration: lesson.duration,
          learningGoals: lesson.learningGoals
        }
      }));
    }

    res.json({
      success: true,
      data: children
    });
  } catch (error) {
    console.error('Children error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch children'
    });
  }
});

export { router };