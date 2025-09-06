import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { logger } from '../logger';

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
    
    // Get all units grouped by subject to show real distribution
    const allUnits = await prisma.unitPlan.findMany({
      where: { userId: EMILY_USER_ID },
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
    
    // Get subject distribution for dashboard
    const subjectStats = allUnits.reduce((acc, unit) => {
      const subject = unit.longRangePlan.subject || 'Unknown';
      if (!acc[subject]) {
        acc[subject] = { count: 0, units: [] };
      }
      acc[subject].count += 1;
      acc[subject].units.push({
        id: unit.id,
        title: unit.title,
        hours: unit.estimatedHours || 0
      });
      return acc;
    }, {} as Record<string, { count: number; units: Array<{ id: string; title: string; hours: number }> }>);
    
    // For sample units, get first unit from each subject for display
    const sampleUnits = Object.values(subjectStats).map(subjectData => subjectData.units[0]);
    
    res.json({
      stats: {
        unitCount,
        lessonCount,
        lrpCount,
        totalHours: Math.round(totalHours * 100) / 100 // Round to 2 decimal places
      },
      sampleUnits,
      subjectDistribution: Object.fromEntries(
        Object.entries(subjectStats).map(([subject, data]) => [subject, data.count])
      ),
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      currentDate: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    logger.error({ error }, 'Error fetching public stats:');
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      stats: {
        unitCount: 0,
        lessonCount: 0,
        lrpCount: 0,
        totalHours: 0
      },
      sampleUnits: [],
      subjectDistribution: {},
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      currentDate: new Date().toISOString()
    });
  }
});

export { router };