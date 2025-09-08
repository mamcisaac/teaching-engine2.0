/**
 * Lesson Completion Tracker Service
 * Manages lesson completion state and progress calculations
 */

import { PrismaClient } from '@teaching-engine/database';
import { prisma } from '../prisma';


export class LessonCompletionTracker {
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  /**
   * Mark a lesson as complete
   */
  async markComplete(lessonId: string, notes?: string, actualDuration?: number): Promise<void> {
    await prisma.lessonCompletion.upsert({
      where: {
        userId_lessonId: {
          userId: this.userId,
          lessonId
        }
      },
      update: {
        notes,
        actualDuration,
        completedAt: new Date()
      },
      create: {
        userId: this.userId,
        lessonId,
        notes,
        actualDuration
      }
    });
  }

  /**
   * Mark a lesson as incomplete (remove completion)
   */
  async markIncomplete(lessonId: string): Promise<void> {
    try {
      await prisma.lessonCompletion.delete({
        where: {
          userId_lessonId: {
            userId: this.userId,
            lessonId
          }
        }
      });
    } catch (error) {
      // If completion doesn't exist, that's fine - this is expected behavior
    }
  }

  /**
   * Check if a lesson is completed
   */
  async isCompleted(lessonId: string): Promise<boolean> {
    const completion = await prisma.lessonCompletion.findUnique({
      where: {
        userId_lessonId: {
          userId: this.userId,
          lessonId
        }
      }
    });
    return !!completion;
  }

  /**
   * Get completion status for multiple lessons
   */
  async getCompletionStatus(lessonIds: string[]): Promise<Map<string, boolean>> {
    const completions = await prisma.lessonCompletion.findMany({
      where: {
        userId: this.userId,
        lessonId: {
          in: lessonIds
        }
      },
      select: {
        lessonId: true
      }
    });

    const statusMap = new Map<string, boolean>();
    const completedLessonIds = new Set(completions.map(c => c.lessonId));
    
    for (const lessonId of lessonIds) {
      statusMap.set(lessonId, completedLessonIds.has(lessonId));
    }

    return statusMap;
  }

  /**
   * Get progress for a set of lessons
   */
  async getProgress(lessonIds: string[]): Promise<{ completed: number; total: number; percentage: number }> {
    if (lessonIds.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completions = await prisma.lessonCompletion.findMany({
      where: {
        userId: this.userId,
        lessonId: {
          in: lessonIds
        }
      }
    });

    const completed = completions.length;
    const total = lessonIds.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  }

  /**
   * Get progress for lessons within a date range
   */
  async getProgressByDateRange(startDate: Date, endDate: Date): Promise<{ completed: number; total: number; percentage: number }> {
    const lessons = await prisma.eTFOLessonPlan.findMany({
      where: {
        userId: this.userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        id: true
      }
    });

    const lessonIds = lessons.map(l => l.id);
    return this.getProgress(lessonIds);
  }

  /**
   * Get daily progress for a specific date
   */
  async getDailyProgress(date: Date): Promise<{ completed: number; total: number; percentage: number }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getProgressByDateRange(startOfDay, endOfDay);
  }

  /**
   * Get weekly progress
   */
  async getWeeklyProgress(weekStart: Date): Promise<{ completed: number; total: number; percentage: number }> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return this.getProgressByDateRange(weekStart, weekEnd);
  }

  /**
   * Get all completions for the user
   */
  async getAllCompletions() {
    return prisma.lessonCompletion.findMany({
      where: {
        userId: this.userId
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            date: true,
            subject: true,
            unitPlanId: true,
            duration: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });
  }

  /**
   * Get recent completions
   */
  async getRecentCompletions(limit: number = 10) {
    return prisma.lessonCompletion.findMany({
      where: {
        userId: this.userId
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            date: true,
            subject: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: limit
    });
  }
}
