import { prisma } from '../prisma';
import { Router } from 'express';

import { logger } from '../logger';

const router = Router();

// Public stats endpoint - no auth required for basic dashboard stats
router.get('/stats', async (_req, res) => {
  try {
    // Get stats for Emily McIsaac (user ID 23) - the showcase user
    const EMILY_USER_ID = 23;
    
    // Get current date info for September calculations
    const currentYear = new Date().getFullYear();
    const septemberStart = new Date(`${currentYear}-09-01T00:00:00Z`);
    const septemberEnd = new Date(`${currentYear}-09-30T23:59:59Z`);
    
    const [unitCount, lessonCount, lrpCount, septemberLessonCount] = await Promise.all([
      prisma.unitPlan.count({ where: { userId: EMILY_USER_ID } }),
      prisma.eTFOLessonPlan.count({ where: { userId: EMILY_USER_ID } }),
      prisma.longRangePlan.count({ where: { userId: EMILY_USER_ID } }),
      // Count September lessons using date field (not isScheduled)
      prisma.eTFOLessonPlan.count({ 
        where: { 
          userId: EMILY_USER_ID,
          date: {
            gte: septemberStart,
            lte: septemberEnd
          }
        } 
      })
    ]);
    
    // Calculate total hours from unit plans
    const unitsWithHours = await prisma.unitPlan.findMany({
      where: { userId: EMILY_USER_ID },
      select: { estimatedHours: true }
    });
    
    const totalHours = unitsWithHours.reduce((sum, unit) => {
      return sum + (unit.estimatedHours || 0);
    }, 0);
    
    // Get first 5 September lessons for preview (using date field)
    const septemberLessons = await prisma.eTFOLessonPlan.findMany({
      where: { 
        userId: EMILY_USER_ID,
        date: {
          gte: septemberStart,
          lte: septemberEnd
        }
      },
      orderBy: { date: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        titleFr: true,
        date: true,
        duration: true,
        unitPlan: {
          select: {
            title: true,
            longRangePlan: {
              select: {
                subject: true
              }
            }
          }
        }
      }
    });
    
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
    // Map to the actual full unit objects to preserve all fields including dates
    const sampleUnits = Object.entries(subjectStats).map(([subject, data]) => {
      const firstUnitId = data.units[0]?.id;
      return allUnits.find(unit => unit.id === firstUnitId);
    }).filter(Boolean);
    
    res.json({
      stats: {
        unitCount,
        lessonCount,
        lrpCount,
        totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
        septemberLessonCount
      },
      sampleUnits,
      septemberLessons,
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
        totalHours: 0,
        septemberLessonCount: 0
      },
      sampleUnits: [],
      septemberLessons: [],
      subjectDistribution: {},
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      currentDate: new Date().toISOString()
    });
  }
});

export { router };