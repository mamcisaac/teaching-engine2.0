import type { PrismaClient } from '@prisma/client';
import { parseISO } from 'date-fns';

import { logger } from '../logger';

import { getSchoolCalendar } from './schoolCalendar';

interface ScheduleUpdate {
  lessonId: string;
  date: string;
  slotNumber: number;
}

interface UnitSchedulingResult {
  unitId: string;
  unitTitle: string;
  subject: string;
  lessonsScheduled: number;
  updates: ScheduleUpdate[];
  dateRange: {
    start: string;
    end: string;
  };
}

interface SubjectSlotMapping {
  [key: string]: number;
}

export class LessonSchedulerService {
  private prisma: PrismaClient;
  private subjectSlotMapping: SubjectSlotMapping;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    
    // Define Emily's subject-to-slot mapping based on best practices
    this.subjectSlotMapping = {
      'Français (Immersion)': 1,        // Slot 1: Morning when minds are fresh
      'Mathématiques': 2,               // Slot 2: Good concentration time
      'Sciences de la nature': 3,       // Slot 3: After morning break
      'Arts visuels': 4,                // Slot 4: Creative time
      'Sciences humaines': 5,           // Slot 5: Alternating
      'Formation personnelle et sociale': 5  // Slot 5: Alternating
    };
  }

  /**
   * Schedule all lessons for a unit using intelligent distribution
   */
  async scheduleUnit(unitId: string, userId: number): Promise<UnitSchedulingResult> {
    // Get unit and its lessons
    const unit = await this.prisma.unitPlan.findUnique({
      where: { id: unitId },
      include: {
        longRangePlan: {
          select: { subject: true }
        },
        lessonPlans: {
          where: { userId },
          orderBy: [
            { lessonNumber: 'asc' },  // Use explicit lesson numbering
            { createdAt: 'asc' }      // Fallback to creation order
          ]
        }
      }
    });

    if (!unit) {
      throw new Error(`Unit with ID ${unitId} not found`);
    }

    const subject = unit.longRangePlan.subject;
    const slotNumber = this.subjectSlotMapping[subject] || 1;
    
    // Determine if this is a daily or alternating subject
    const subjectType = this.isAlternatingSubject(subject) ? 'alternating' : 'daily';
    
    // Get optimal distribution dates for this unit
    const distributionDates = await getSchoolCalendar().getUnitDistributionDates(
      unit.lessonPlans.length, 
      subjectType
    );

    if (distributionDates.length < unit.lessonPlans.length) {
      logger.warn(`Not enough teaching days for unit ${unit.title}. Need ${unit.lessonPlans.length}, have ${distributionDates.length}`);
    }

    // Create schedule updates
    const updates: ScheduleUpdate[] = [];
    
    for (let i = 0; i < unit.lessonPlans.length; i++) {
      const lesson = unit.lessonPlans[i];
      if (!lesson) continue; // Skip if lesson is undefined
      
      const dateIndex = i % distributionDates.length; // Cycle through dates if needed
      const scheduledDate = distributionDates[dateIndex];
      
      if (!scheduledDate) {
        logger.warn(`No date available for lesson ${lesson.id}`);
        continue;
      }
      
      updates.push({
        lessonId: lesson.id,
        date: scheduledDate,
        slotNumber
      });
    }

    // Apply the updates to the database
    await this.applyScheduleUpdates(updates);

    return {
      unitId: unit.id,
      unitTitle: unit.title,
      subject,
      lessonsScheduled: updates.length,
      updates,
      dateRange: {
        start: distributionDates[0] || '',
        end: distributionDates[distributionDates.length - 1] || ''
      }
    };
  }

  /**
   * Schedule the next unscheduled unit for a subject
   */
  async scheduleNextUnit(subject: string, userId: number): Promise<UnitSchedulingResult> {
    // Find the next unscheduled unit for this subject
    const nextUnit = await this.findNextUnscheduledUnit(subject, userId);
    
    if (!nextUnit) {
      throw new Error(`No unscheduled units found for subject: ${subject}`);
    }

    return await this.scheduleUnit(nextUnit.id, userId);
  }

  /**
   * Schedule all lessons with best practices distribution
   */
  async scheduleAllLessons(userId: number): Promise<{
    totalLessonsScheduled: number;
    unitResults: UnitSchedulingResult[];
    summary: {
      message: string;
      totalLessons: number;
      scheduledLessons: number;
      subjects: Record<string, number>;
    };
  }> {
    logger.info('🎯 Starting intelligent lesson scheduling for all subjects...');
    
    const unitResults: UnitSchedulingResult[] = [];
    let totalLessonsScheduled = 0;

    // Get all subjects in priority order (daily subjects first, then alternating)
    const subjects = [
      'Français (Immersion)',
      'Mathématiques', 
      'Sciences de la nature',
      'Arts visuels',
      'Sciences humaines',
      'Formation personnelle et sociale'
    ];

    for (const subject of subjects) {
      logger.info(`📚 Scheduling units for ${subject}...`);
      
      // Get all units for this subject ordered by start date
      const units = await this.prisma.unitPlan.findMany({
        where: {
          userId,
          longRangePlan: {
            subject
          }
        },
        orderBy: [
          { startDate: 'asc' },
          { createdAt: 'asc' }
        ],
        include: {
          longRangePlan: {
            select: { subject: true }
          },
          lessonPlans: {
            where: { userId }
          }
        }
      });

      // Schedule each unit in sequence
      for (const unit of units) {
        if (unit.lessonPlans.length > 0) {
          try {
            const result = await this.scheduleUnit(unit.id, userId);
            unitResults.push(result);
            totalLessonsScheduled += result.lessonsScheduled;
            logger.info(`  ✅ Scheduled ${result.lessonsScheduled} lessons for "${result.unitTitle}"`);
          } catch (error) {
            logger.error({ error }, `  ❌ Failed to schedule unit "${unit.title}":`);
          }
        }
      }
    }

    // const rawSummary = schoolCalendar.getSchoolYearSummary();
    
    // Transform summary to match expected interface
    const summary = {
      message: `Scheduled ${totalLessonsScheduled} lessons across ${unitResults.length} units`,
      totalLessons: totalLessonsScheduled,
      scheduledLessons: totalLessonsScheduled,
      subjects: {} as Record<string, number>
    };
    
    logger.info(`🎯 Scheduling complete! ${totalLessonsScheduled} lessons scheduled across ${unitResults.length} units`);

    return {
      totalLessonsScheduled,
      unitResults,
      summary
    };
  }

  /**
   * Apply schedule updates to the database
   */
  private async applyScheduleUpdates(updates: ScheduleUpdate[]): Promise<void> {
    if (updates.length === 0) return;

    // Use transaction for batch updates
    await this.prisma.$transaction(
      updates.map(update => 
        this.prisma.eTFOLessonPlan.update({
          where: { id: update.lessonId },
          data: {
            date: parseISO(update.date),
            slotNumber: update.slotNumber,
            updatedAt: new Date()
          }
        })
      )
    );
  }

  /**
   * Find the next unscheduled unit for a subject
   */
  private async findNextUnscheduledUnit(subject: string, userId: number) {
    const units = await this.prisma.unitPlan.findMany({
      where: {
        userId,
        longRangePlan: {
          subject
        }
      },
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        lessonPlans: {
          where: { 
            userId,
            lessonType: 'core' // Only check core lessons for completion
          },
          select: {
            id: true,
            date: true,
            isScheduled: true,
            lessonType: true
          }
        }
      }
    });

    // Find the first unit where not all core lessons are scheduled
    for (const unit of units) {
      if (unit.lessonPlans.length === 0) continue;
      
      // Check if any core lessons in this unit are unscheduled
      const hasUnscheduledCoreLessons = unit.lessonPlans.some(lesson => {
        return !lesson.isScheduled || 
               (lesson.date && new Date(lesson.date).getFullYear() >= 2099);
      });
      
      if (hasUnscheduledCoreLessons) {
        return unit;
      }
    }
    
    return null;
  }
  
  /**
   * Get available extension lessons for a unit
   */
  async getAvailableExtensions(unitId: string, userId: number) {
    return await this.prisma.eTFOLessonPlan.findMany({
      where: {
        unitPlanId: unitId,
        userId,
        lessonType: 'extension',
        isScheduled: false
      },
      orderBy: {
        lessonNumber: 'asc'
      }
    });
  }
  
  /**
   * Schedule an extension lesson to a specific date
   */
  async scheduleExtension(lessonId: string, date: Date, userId: number) {
    const lesson = await this.prisma.eTFOLessonPlan.findFirst({
      where: {
        id: lessonId,
        userId,
        lessonType: 'extension'
      }
    });
    
    if (!lesson) {
      throw new Error('Extension lesson not found');
    }
    
    return await this.prisma.eTFOLessonPlan.update({
      where: { id: lessonId },
      data: {
        date,
        isScheduled: true
      }
    });
  }

  /**
   * Check if a subject alternates (every other day) vs daily
   */
  private isAlternatingSubject(subject: string): boolean {
    return ['Sciences humaines', 'Formation personnelle et sociale'].includes(subject);
  }

  /**
   * Get current scheduling statistics
   */
  async getSchedulingStats(userId: number) {
    const totalLessons = await this.prisma.eTFOLessonPlan.count({
      where: { userId }
    });

    const scheduledLessons = await this.prisma.eTFOLessonPlan.count({
      where: {
        userId,
        date: {
          not: undefined
        }
      }
    });

    const unscheduledLessons = totalLessons - scheduledLessons;

    const subjectStats = await this.prisma.eTFOLessonPlan.groupBy({
      by: ['subject'],
      where: { userId },
      _count: {
        id: true
      }
    });

    return {
      total: totalLessons,
      scheduled: scheduledLessons,
      unscheduled: unscheduledLessons,
      bySubject: subjectStats,
      completionPercentage: totalLessons > 0 ? Math.round((scheduledLessons / totalLessons) * 100) : 0
    };
  }
}