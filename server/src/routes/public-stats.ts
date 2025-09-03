import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Public stats endpoint - no auth required for basic dashboard stats
router.get('/stats', async (_req, res) => {
  try {
    // Get stats for Emily McIsaac (user ID 23) - the showcase user
    const EMILY_USER_ID = 23;
    
    const [unitCount, lessonCount, lrpCount] = await Promise.all([
      prisma.unitPlan.count({ where: { userId: EMILY_USER_ID } }),
      prisma.eTFOLessonPlan.count({ where: { userId: EMILY_USER_ID } }),
      prisma.longRangePlan.count({ where: { userId: EMILY_USER_ID } })
    ]);
    
    // Calculate total hours from unit plans
    const unitsWithHours = await prisma.unitPlan.findMany({
      where: { userId: EMILY_USER_ID },
      select: { estimatedHours: true }
    });
    
    const totalHours = unitsWithHours.reduce((sum, unit) => {
      return sum + (unit.estimatedHours || 0);
    }, 0);
    
    // Get basic unit plan data for showcase (no sensitive info)
    const sampleUnits = await prisma.unitPlan.findMany({
      where: { userId: EMILY_USER_ID },
      take: 5,
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        estimatedHours: true,
        longRangePlan: {
          select: {
            subject: true,
            title: true
          }
        }
      }
    });
    
    res.json({
      stats: {
        unitCount,
        lessonCount,
        lrpCount,
        totalHours: Math.round(totalHours * 100) / 100 // Round to 2 decimal places
      },
      sampleUnits,
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      currentDate: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      stats: {
        unitCount: 0,
        lessonCount: 0,
        lrpCount: 0,
        totalHours: 0
      },
      sampleUnits: [],
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      currentDate: new Date().toISOString()
    });
  }
});

export default router;