/**
 * Planning Cascade API Routes  
 * Hierarchical planning view showing Year → Subject → Unit → Week → Lesson structure
 */

import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { z } from 'zod';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

// Types for cascade structure
interface LessonNode {
  id: string;
  type: 'lesson';
  title: string;
  date: Date;
  duration: number;
  status: string;
  isOverdue: boolean;
  isTaught: boolean;
  subject?: string;
  expectations: number;
}

interface WeekNode {
  id: string;
  type: 'week';
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  lessons: LessonNode[];
  progress: {
    total: number;
    taught: number;
    overdue: number;
  };
}

interface UnitNode {
  id: string;
  type: 'unit';
  title: string;
  titleFr?: string;
  startDate: Date;
  endDate: Date;
  weeks: WeekNode[];
  progress: {
    total: number;
    taught: number;
    overdue: number;
  };
}

interface SubjectNode {
  id: string;
  type: 'subject';
  subject: string;
  grade: number;
  units: UnitNode[];
  progress: {
    total: number;
    taught: number;
    overdue: number;
  };
}

interface TermNode {
  id: string;
  type: 'term';
  term: string;
  termNumber: number;
  startDate: Date;
  endDate: Date;
  subjects: SubjectNode[];
  progress: {
    total: number;
    taught: number;
    overdue: number;
  };
}

interface YearNode {
  id: string;
  type: 'year';
  academicYear: string;
  terms: TermNode[];
  progress: {
    total: number;
    taught: number;
    overdue: number;
  };
}

// Validation schemas
const getCascadeSchema = z.object({
  year: z.string().optional(),
  includeEmptyWeeks: z.coerce.boolean().optional().default(false),
});

const updateLessonScheduleSchema = z.object({
  scheduledDate: z.string().datetime(),
  scheduledTime: z.string().optional(),
});

const moveLessonSchema = z.object({
  fromLessonId: z.string(),
  toWeekStartDate: z.string().datetime(),
  toUnitId: z.string().optional(),
});

/**
 * Get the full planning cascade hierarchy
 * Returns: Year → Term → Subject → Unit → Week → Lesson tree structure
 */
router.get('/cascade', async (req: Request, res: Response): Promise<void> => {
  try {
    const params = getCascadeSchema.parse(req.query);
    const userId = (req as AuthenticatedRequest).user.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch all data with proper relations
    const longRangePlans = await prisma.longRangePlan.findMany({
      where: {
        userId,
        ...(params.year && { academicYear: params.year })
      },
      include: {
        unitPlans: {
          include: {
            lessonPlans: {
              include: {
                expectations: true
              },
              orderBy: [
                { scheduledDate: 'asc' },
                { date: 'asc' }
              ]
            }
          },
          orderBy: { startDate: 'asc' }
        }
      },
      orderBy: [
        { academicYear: 'desc' },
        { subject: 'asc' }
      ]
    });

    // Build cascade structure
    const cascadeByYear: Map<string, YearNode> = new Map();

    for (const lrp of longRangePlans) {
      // Get or create year node
      let yearNode = cascadeByYear.get(lrp.academicYear);
      if (!yearNode) {
        yearNode = {
          id: `year-${lrp.academicYear}`,
          type: 'year',
          academicYear: lrp.academicYear,
          terms: [],
          progress: { total: 0, taught: 0, overdue: 0 }
        };
        cascadeByYear.set(lrp.academicYear, yearNode);
      }

      // Create subject node
      const subjectNode: SubjectNode = {
        id: lrp.id,
        type: 'subject',
        subject: lrp.subject,
        grade: lrp.grade,
        units: [],
        progress: { total: 0, taught: 0, overdue: 0 }
      };

      // Process units
      for (const unit of lrp.unitPlans) {
        const unitNode: UnitNode = {
          id: unit.id,
          type: 'unit',
          title: unit.title,
          titleFr: unit.titleFr || undefined,
          startDate: unit.startDate,
          endDate: unit.endDate,
          weeks: [],
          progress: { total: 0, taught: 0, overdue: 0 }
        };

        // Group lessons by week
        const lessonsByWeek = new Map<number, LessonNode[]>();
        
        for (const lesson of unit.lessonPlans) {
          const lessonDate = lesson.scheduledDate || lesson.date;
          const weekNumber = getWeekNumber(lessonDate, unit.startDate);
          
          const lessonNode: LessonNode = {
            id: lesson.id,
            type: 'lesson',
            title: lesson.titleFr || lesson.title,
            date: lessonDate,
            duration: lesson.duration,
            status: lesson.status,
            isOverdue: lesson.status === 'PLANNED' && lessonDate < today,
            isTaught: lesson.status === 'TAUGHT',
            subject: lrp.subject,
            expectations: lesson.expectations.length
          };

          // Update progress counters
          unitNode.progress.total++;
          subjectNode.progress.total++;
          yearNode.progress.total++;
          
          if (lessonNode.isTaught) {
            unitNode.progress.taught++;
            subjectNode.progress.taught++;
            yearNode.progress.taught++;
          }
          
          if (lessonNode.isOverdue) {
            unitNode.progress.overdue++;
            subjectNode.progress.overdue++;
            yearNode.progress.overdue++;
          }

          // Add to week group
          if (!lessonsByWeek.has(weekNumber)) {
            lessonsByWeek.set(weekNumber, []);
          }
          lessonsByWeek.get(weekNumber)!.push(lessonNode);
        }

        // Create week nodes
        const weekCount = Math.ceil(
          (unit.endDate.getTime() - unit.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );

        for (let weekNum = 1; weekNum <= weekCount; weekNum++) {
          const weekStart = new Date(unit.startDate);
          weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7);
          
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          const weekLessons = lessonsByWeek.get(weekNum) || [];
          
          if (weekLessons.length > 0 || params.includeEmptyWeeks) {
            const weekNode: WeekNode = {
              id: `${unit.id}-week-${weekNum}`,
              type: 'week',
              weekNumber: weekNum,
              startDate: weekStart,
              endDate: weekEnd,
              lessons: weekLessons,
              progress: {
                total: weekLessons.length,
                taught: weekLessons.filter(l => l.isTaught).length,
                overdue: weekLessons.filter(l => l.isOverdue).length
              }
            };
            
            unitNode.weeks.push(weekNode);
          }
        }

        subjectNode.units.push(unitNode);
      }

      // Determine term from dates
      const termNumber = getTermFromDates(lrp.unitPlans);
      let termNode = yearNode.terms.find(t => t.termNumber === termNumber);
      
      if (!termNode) {
        const termDates = getTermDates(lrp.academicYear, termNumber);
        termNode = {
          id: `${lrp.academicYear}-term-${termNumber}`,
          type: 'term',
          term: getTermName(termNumber),
          termNumber,
          startDate: termDates.start,
          endDate: termDates.end,
          subjects: [],
          progress: { total: 0, taught: 0, overdue: 0 }
        };
        yearNode.terms.push(termNode);
        yearNode.terms.sort((a, b) => a.termNumber - b.termNumber);
      }

      termNode.subjects.push(subjectNode);
      termNode.progress.total += subjectNode.progress.total;
      termNode.progress.taught += subjectNode.progress.taught;
      termNode.progress.overdue += subjectNode.progress.overdue;
    }

    // Convert map to array and get most recent year
    const years = Array.from(cascadeByYear.values());
    const cascade = years.length === 1 ? years[0] : { years };

    const progress = cascade && 'progress' in cascade ? cascade.progress : { total: 0, taught: 0, overdue: 0 };
    
    res.json({
      cascade,
      summary: {
        totalLessons: progress.total || 0,
        taughtLessons: progress.taught || 0,
        overdueLessons: progress.overdue || 0,
        completionRate: progress.total 
          ? Math.round((progress.taught / progress.total) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('Cascade generation failed:', error);
    res.status(500).json({ 
      error: 'Failed to generate planning cascade',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update lesson scheduling
 */
router.patch('/lesson/:lessonId/schedule', async (req: Request, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const userId = (req as AuthenticatedRequest).user.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const updates = updateLessonScheduleSchema.parse(req.body);
    
    // Verify lesson belongs to user
    const lesson = await prisma.eTFOLessonPlan.findFirst({
      where: {
        id: lessonId,
        userId
      }
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Update scheduling
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: { id: lessonId },
      data: {
        scheduledDate: new Date(updates.scheduledDate),
        scheduledTime: updates.scheduledTime
      }
    });

    res.json({
      success: true,
      lesson: updatedLesson
    });
  } catch (error) {
    console.error('Schedule update failed:', error);
    res.status(500).json({ 
      error: 'Failed to update lesson schedule',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Move lesson between weeks/units (drag and drop support)
 */
router.post('/lesson/move', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const move = moveLessonSchema.parse(req.body);
    
    // Verify lesson belongs to user
    const lesson = await prisma.eTFOLessonPlan.findFirst({
      where: {
        id: move.fromLessonId,
        userId
      }
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Update lesson with new schedule and optionally new unit
    const updateData: { scheduledDate: Date; unitPlanId?: string } = {
      scheduledDate: new Date(move.toWeekStartDate)
    };

    if (move.toUnitId) {
      // Verify target unit belongs to user
      const targetUnit = await prisma.unitPlan.findFirst({
        where: {
          id: move.toUnitId,
          userId
        }
      });

      if (!targetUnit) {
        res.status(404).json({ error: 'Target unit not found' });
        return;
      }

      updateData.unitPlanId = move.toUnitId;
    }

    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: { id: move.fromLessonId },
      data: updateData
    });

    res.json({
      success: true,
      lesson: updatedLesson
    });
  } catch (error) {
    console.error('Lesson move failed:', error);
    res.status(500).json({ 
      error: 'Failed to move lesson',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get workload balance across terms
 */
router.get('/workload-balance', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const unitsByTerm = await prisma.unitPlan.findMany({
      where: { userId },
      include: {
        lessonPlans: {
          select: {
            id: true,
            duration: true,
            scheduledDate: true,
            date: true
          }
        }
      }
    });

    // Group by term based on dates
    const termData: Record<string, { lessons: number; minutes: number; units: number }> = {
      Fall: { lessons: 0, minutes: 0, units: 0 },
      Winter: { lessons: 0, minutes: 0, units: 0 },
      Spring: { lessons: 0, minutes: 0, units: 0 }
    };

    unitsByTerm.forEach(unit => {
      const month = unit.startDate.getMonth() + 1;
      let term = 'Fall';
      if (month >= 1 && month <= 3) term = 'Winter';
      else if (month >= 4 && month <= 6) term = 'Spring';
      
      const currentTermData = termData[term];
      if (currentTermData) {
        currentTermData.units++;
        currentTermData.lessons += unit.lessonPlans.length;
        currentTermData.minutes += unit.lessonPlans.reduce((sum, l) => sum + l.duration, 0);
      }
    });

    const balance = Object.entries(termData).map(([term, data]) => ({
      term,
      lesson_count: data.lessons,
      total_minutes: data.minutes,
      unit_count: data.units
    }));

    res.json({
      balance,
      recommendation: analyzeWorkloadBalance(balance)
    });
  } catch (error) {
    console.error('Workload balance failed:', error);
    res.status(500).json({ 
      error: 'Failed to calculate workload balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions
function getWeekNumber(date: Date, unitStartDate: Date): number {
  const diffTime = date.getTime() - unitStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

function getTermFromDates(units: Array<{ startDate: string | Date }>): number {
  if (units.length === 0) return 1;
  
  const avgMonth = units.reduce((sum, unit) => {
    const month = new Date(unit.startDate).getMonth() + 1;
    return sum + month;
  }, 0) / units.length;

  if (avgMonth >= 9 || avgMonth <= 1) return 1; // Fall
  if (avgMonth >= 2 && avgMonth <= 4) return 2; // Winter
  return 3; // Spring
}

function getTermName(termNumber: number): string {
  switch (termNumber) {
    case 1: return 'Fall Term';
    case 2: return 'Winter Term';
    case 3: return 'Spring Term';
    default: return `Term ${termNumber}`;
  }
}

function getTermDates(academicYear: string, termNumber: number): { start: Date; end: Date } {
  const year = parseInt(academicYear.split('-')[0] || '2024');
  
  switch (termNumber) {
    case 1: // Fall: Sep-Dec
      return {
        start: new Date(year, 8, 1), // September 1
        end: new Date(year, 11, 31)  // December 31
      };
    case 2: // Winter: Jan-Mar
      return {
        start: new Date(year + 1, 0, 1), // January 1
        end: new Date(year + 1, 2, 31)   // March 31
      };
    case 3: // Spring: Apr-Jun
      return {
        start: new Date(year + 1, 3, 1), // April 1
        end: new Date(year + 1, 5, 30)   // June 30
      };
    default:
      return {
        start: new Date(year, 8, 1),
        end: new Date(year + 1, 5, 30)
      };
  }
}

// Helper functions for workload analysis

function analyzeWorkloadBalance(termData: Array<{ lesson_count: number }>): string {
  if (termData.length === 0) return 'No scheduled lessons found';
  
  const lessonCounts = termData.map(t => t.lesson_count);
  const avg = lessonCounts.reduce((a, b) => a + b, 0) / lessonCounts.length;
  const maxDeviation = Math.max(...lessonCounts.map(c => Math.abs(c - avg)));
  
  if (maxDeviation > avg * 0.3) {
    return 'Workload is unbalanced. Consider redistributing lessons across terms.';
  }
  
  return 'Workload is well balanced across terms.';
}

export { router };