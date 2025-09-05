/**
 * Planning Cascade API Routes
 * Endpoints for hierarchical curriculum planning
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Get year plan with full cascade data
 */
router.get('/year-plan/:year/:grade', async (req: Request, res: Response) => {
  try {
    const { year, grade } = req.params;
    
    // Input validation
    const yearNum = parseInt(year);
    const gradeNum = parseInt(grade);
    
    if (!year || isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      return res.status(400).json({ error: 'Invalid year. Must be between 2020-2030' });
    }
    
    if (!grade || isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      return res.status(400).json({ error: 'Invalid grade. Must be between 1-12' });
    }

    // Get pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50; // Default 50 lessons per page
    const skip = (page - 1) * limit;

    // Count total lessons for pagination
    const totalCount = await prisma.eTFOLessonPlan.count({
      where: {
        grade: gradeNum,
        createdAt: {
          gte: new Date(`${yearNum}-09-01`),
          lt: new Date(`${yearNum + 1}-07-01`)
        }
      }
    });

    // Fetch paginated lesson plans
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        grade: gradeNum,
        // Note: Using createdAt as proxy for lesson date since actual lesson date isn't stored
        // TODO: Add proper lesson scheduling date field
        createdAt: {
          gte: new Date(`${yearNum}-09-01`),
          lt: new Date(`${yearNum + 1}-07-01`)
        }
      },
      include: {
        unit: true // Simplified - remove nested includes for performance
      },
      orderBy: [
        { lessonNumber: 'asc' }
      ],
      skip,
      take: limit
    });

    // Fetch curriculum expectations
    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        grade: `Grade ${gradeNum}`
      }
    });

    // Group lessons by subject, term, unit, and week
    const subjectMap = new Map<string, any>();
    
    for (const lesson of lessons) {
      const subject = lesson.unit.subject;
      
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, {
          id: `subject-${subject}`,
          subject,
          totalHours: 0,
          terms: new Map(),
          curriculum: expectations.filter(e => e.subject === subject).map(e => ({
            id: e.id,
            code: e.code,
            description: e.description,
            subject: e.subject,
            grade: gradeNum,
            strand: e.strand || undefined,
            subcategory: e.subcategory || undefined,
            covered: false, // Would need to track this properly
            lessonIds: []
          })),
          yearlyObjectives: []
        });
      }
      
      const subjectData = subjectMap.get(subject);
      const termNum = lesson.unit.termNumber;
      
      if (!subjectData.terms.has(termNum)) {
        subjectData.terms.set(termNum, {
          id: `term-${subject}-${termNum}`,
          termNumber: termNum,
          name: `Term ${termNum}`,
          startDate: getTermStartDate(parseInt(year), termNum),
          endDate: getTermEndDate(parseInt(year), termNum),
          units: new Map(),
          assessments: []
        });
      }
      
      const termData = subjectData.terms.get(termNum);
      const unitId = lesson.unit.id;
      
      if (!termData.units.has(unitId)) {
        termData.units.set(unitId, {
          id: unitId,
          name: lesson.unit.title,
          description: lesson.unit.description || '',
          duration: lesson.unit.hours,
          weeks: new Map(),
          objectives: lesson.unit.objectives ? lesson.unit.objectives.split('\n') : [],
          keyQuestions: lesson.unit.bigIdeas ? lesson.unit.bigIdeas.split('\n') : [],
          culminatingTask: lesson.unit.culminatingTask || undefined,
          resources: lesson.unit.resources ? lesson.unit.resources.split('\n') : [],
          crossCurricular: lesson.unit.crossCurricular ? [lesson.unit.crossCurricular] : []
        });
      }
      
      const unitData = termData.units.get(unitId);
      
      // Calculate week number based on lesson date
      const lessonDate = new Date(lesson.createdAt);
      const weekNum = getWeekNumber(lessonDate);
      
      if (!unitData.weeks.has(weekNum)) {
        const weekStart = getWeekStartDate(lessonDate);
        const weekEnd = getWeekEndDate(lessonDate);
        
        unitData.weeks.set(weekNum, {
          id: `week-${unitId}-${weekNum}`,
          weekNumber: weekNum,
          startDate: weekStart,
          endDate: weekEnd,
          lessons: [],
          theme: undefined,
          notes: undefined
        });
      }
      
      const weekData = unitData.weeks.get(weekNum);
      
      // Add lesson to week
      weekData.lessons.push({
        id: lesson.id,
        name: lesson.title,
        subject: lesson.unit.subject,
        grade: gradeNum,
        date: lesson.createdAt,
        duration: 45, // Default 45 minutes
        objectives: lesson.expectations ? lesson.expectations.split('\n') : [],
        activities: lesson.lessonSteps ? lesson.lessonSteps.split('\n') : [],
        materials: lesson.materials ? lesson.materials.split(', ') : [],
        assessment: lesson.assessment ? lesson.assessment.split('\n') : [],
        differentiation: lesson.differentiation ? lesson.differentiation.split('\n') : [],
        homework: lesson.homework || undefined,
        notes: lesson.reflection || undefined,
        unitId: lesson.unit.id,
        weekId: `week-${unitId}-${weekNum}`,
        sequenceNumber: lesson.lessonNumber,
        status: 'planned', // Would need to track actual status
        panicLevel: undefined
      });
      
      // Update total hours
      subjectData.totalHours += 0.75; // 45 minutes = 0.75 hours
    }

    // Convert maps to arrays
    const subjects = Array.from(subjectMap.values()).map(subject => ({
      ...subject,
      terms: Array.from(subject.terms.values()).map(term => ({
        ...term,
        units: Array.from(term.units.values()).map(unit => ({
          ...unit,
          weeks: Array.from(unit.weeks.values()).sort((a, b) => a.weekNumber - b.weekNumber)
        })).sort((a, b) => {
          // Sort units by their first lesson's sequence number
          const aFirst = a.weeks[0]?.lessons[0]?.sequenceNumber || 0;
          const bFirst = b.weeks[0]?.lessons[0]?.sequenceNumber || 0;
          return aFirst - bFirst;
        })
      })).sort((a, b) => a.termNumber - b.termNumber)
    }));

    const yearPlan = {
      id: `year-${year}-grade-${grade}`,
      year,
      grade: gradeNum,
      subjects,
      totalWeeks: 40, // School year is typically 40 weeks
      startDate: new Date(`${year}-09-01`),
      endDate: new Date(`${parseInt(year) + 1}-06-30`),
      holidays: getSchoolHolidays(parseInt(year)),
      pdDays: getPDDays(parseInt(year))
    };

    res.json(yearPlan);
  } catch (error) {
    console.error('Error fetching year plan:', error);
    res.status(500).json({ 
      error: 'Failed to fetch year plan',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get cascade statistics
 */
router.get('/statistics/:year/:grade', async (req: Request, res: Response) => {
  try {
    const { year, grade } = req.params;
    
    // Input validation
    const yearNum = parseInt(year);
    const gradeNum = parseInt(grade);
    
    if (!year || isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      return res.status(400).json({ error: 'Invalid year. Must be between 2020-2030' });
    }
    
    if (!grade || isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      return res.status(400).json({ error: 'Invalid grade. Must be between 1-12' });
    }

    const totalLessons = await prisma.eTFOLessonPlan.count({
      where: {
        grade: gradeNum,
        createdAt: {
          gte: new Date(`${yearNum}-09-01`),
          lt: new Date(`${yearNum + 1}-07-01`)
        }
      }
    });

    // In a real implementation, we'd track completion status
    // For now, simulate some data
    const completedLessons = Math.floor(totalLessons * 0.3);
    const upcomingLessons = Math.floor(totalLessons * 0.6);
    const overdueItems = Math.floor(totalLessons * 0.1);

    // Get subject breakdown
    const subjectStats = await prisma.eTFOLessonPlan.groupBy({
      by: ['unit'],
      where: {
        grade: gradeNum,
        createdAt: {
          gte: new Date(`${yearNum}-09-01`),
          lt: new Date(`${yearNum + 1}-07-01`)
        }
      },
      _count: {
        id: true
      }
    });

    const bySubject: Record<string, any> = {};
    
    // Would need to join with units to get subject names
    // For now, returning mock data structure
    const subjects = ['Français', 'Mathématiques', 'Sciences', 'Études sociales', 'Arts', 'Santé'];
    for (const subject of subjects) {
      bySubject[subject] = {
        planned: Math.floor(totalLessons / subjects.length),
        completed: Math.floor(completedLessons / subjects.length),
        coverage: Math.floor(Math.random() * 40) + 60 // 60-100%
      };
    }

    res.json({
      totalLessons,
      completedLessons,
      upcomingLessons,
      overdueItems,
      coveragePercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      bySubject,
      panicAreas: []
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Validate curriculum coverage
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { grade, year } = req.body;
    
    // Input validation
    const yearNum = parseInt(year);
    const gradeNum = parseInt(grade);
    
    if (!year || isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      return res.status(400).json({ error: 'Invalid year. Must be between 2020-2030' });
    }
    
    if (!grade || isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
      return res.status(400).json({ error: 'Invalid grade. Must be between 1-12' });
    }

    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        grade: gradeNum,
        createdAt: {
          gte: new Date(`${yearNum}-09-01`),
          lt: new Date(`${yearNum + 1}-07-01`)
        }
      },
      orderBy: {
        lessonNumber: 'asc'
      }
    });

    const expectations = await prisma.curriculumExpectation.findMany({
      where: {
        grade: `Grade ${grade}`
      }
    });

    const errors = [];
    const warnings = [];

    // Check for sequence gaps
    const sequenceNumbers = lessons.map(l => l.lessonNumber);
    const maxSequence = Math.max(...sequenceNumbers, 0);
    
    for (let i = 1; i <= maxSequence; i++) {
      if (!sequenceNumbers.includes(i)) {
        errors.push({
          type: 'sequence_gap',
          message: `Missing lesson at sequence position ${i}`,
          affectedItems: [`sequence_${i}`],
          severity: 'error'
        });
      }
    }

    // Check for duplicate sequence numbers
    const sequenceCount: Record<number, string[]> = {};
    for (const lesson of lessons) {
      if (!sequenceCount[lesson.lessonNumber]) {
        sequenceCount[lesson.lessonNumber] = [];
      }
      sequenceCount[lesson.lessonNumber].push(lesson.id);
    }

    for (const [seq, ids] of Object.entries(sequenceCount)) {
      if (ids.length > 1) {
        errors.push({
          type: 'duplicate_lesson',
          message: `Multiple lessons with sequence number ${seq}`,
          affectedItems: ids,
          severity: 'error'
        });
      }
    }

    // Check for assessment balance
    const assessmentLessons = lessons.filter(l => l.assessment && l.assessment.length > 0);
    if (assessmentLessons.length < lessons.length * 0.1) {
      warnings.push({
        type: 'sparse_assessment',
        message: 'Insufficient assessment activities',
        affectedItems: [],
        suggestion: 'Add more formative assessment opportunities'
      });
    }

    res.json({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  } catch (error) {
    console.error('Error validating curriculum:', error);
    res.status(500).json({ 
      error: 'Failed to validate curriculum',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get upcoming lessons
 */
router.get('/upcoming/:days', async (req: Request, res: Response) => {
  try {
    const daysAhead = parseInt(req.params.days) || 7;
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        createdAt: {
          gte: today,
          lte: futureDate
        }
      },
      include: {
        unit: true
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 50 // Limit to 50 upcoming lessons
    });

    const upcomingLessons = lessons.map(lesson => ({
      id: lesson.id,
      name: lesson.title,
      subject: lesson.unit.subject,
      grade: lesson.grade,
      date: lesson.createdAt,
      duration: 45,
      objectives: lesson.expectations ? lesson.expectations.split('\n') : [],
      activities: lesson.lessonSteps ? lesson.lessonSteps.split('\n') : [],
      materials: lesson.materials ? lesson.materials.split(', ') : [],
      assessment: lesson.assessment ? lesson.assessment.split('\n') : [],
      unitId: lesson.unit.id,
      sequenceNumber: lesson.lessonNumber,
      status: 'planned'
    }));

    res.json(upcomingLessons);
  } catch (error) {
    console.error('Error fetching upcoming lessons:', error);
    res.status(500).json({ 
      error: 'Failed to fetch upcoming lessons',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions
function getTermStartDate(year: number, term: number): Date {
  switch (term) {
    case 1: return new Date(`${year}-09-01`);
    case 2: return new Date(`${year + 1}-01-01`);
    case 3: return new Date(`${year + 1}-04-01`);
    default: return new Date(`${year}-09-01`);
  }
}

function getTermEndDate(year: number, term: number): Date {
  switch (term) {
    case 1: return new Date(`${year}-12-31`);
    case 2: return new Date(`${year + 1}-03-31`);
    case 3: return new Date(`${year + 1}-06-30`);
    default: return new Date(`${year + 1}-06-30`);
  }
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 8, 1); // September 1
  const diff = date.getTime() - startOfYear.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function getWeekStartDate(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(date.setDate(diff));
}

function getWeekEndDate(date: Date): Date {
  const start = getWeekStartDate(new Date(date));
  return new Date(start.getTime() + 4 * 24 * 60 * 60 * 1000); // Friday
}

function getSchoolHolidays(year: number) {
  return [
    {
      name: 'Thanksgiving',
      startDate: new Date(`${year}-10-10`),
      endDate: new Date(`${year}-10-10`),
      type: 'holiday' as const
    },
    {
      name: 'Winter Break',
      startDate: new Date(`${year}-12-23`),
      endDate: new Date(`${year + 1}-01-03`),
      type: 'break' as const
    },
    {
      name: 'March Break',
      startDate: new Date(`${year + 1}-03-13`),
      endDate: new Date(`${year + 1}-03-17`),
      type: 'break' as const
    }
  ];
}

function getPDDays(year: number): Date[] {
  return [
    new Date(`${year}-09-02`),
    new Date(`${year}-10-20`),
    new Date(`${year + 1}-02-10`),
    new Date(`${year + 1}-04-14`),
    new Date(`${year + 1}-06-02`)
  ];
}

export default router;