/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Template Data Fetcher
 * Fetches and aggregates data for templates
 */

import { prisma } from '../../../prisma';
import { DataRequirement } from '../providers/TemplateProvider';

export interface FetchContext {
  userId: number;
  filters?: Record<string, unknown>;
  options?: {
    includeRelations?: boolean;
    limit?: number;
    orderBy?: Record<string, 'asc' | 'desc'>;
  };
}

export class TemplateDataFetcher {
  /**
   * Fetch data based on requirements
   */
  async fetchData(
    requirements: DataRequirement[],
    context: FetchContext
  ): Promise<Record<string, unknown>> {
    const data: Record<string, unknown> = {};
    
    // Fetch data for each requirement
    const fetchPromises = requirements.map(async (req) => {
      try {
        const result = await this.fetchDataForRequirement(req, context);
        data[req.key] = result;
      } catch (_error) {
        if (req.required) {
          throw _error;
        }
        // Use default value for optional requirements
        data[req.key] = req.defaultValue || null;
      }
    });

    await Promise.all(fetchPromises);
    
    return data;
  }

  /**
   * Fetch data for a single requirement
   */
  private async fetchDataForRequirement(
    requirement: DataRequirement,
    context: FetchContext
  ): Promise<unknown> {
    switch (requirement.type) {
      case 'user':
        return this.fetchUserData(context.userId);
        
      case 'student':
        return this.fetchStudentData(context);
        
      case 'lesson':
        return this.fetchLessonData(context);
        
      case 'assessment':
        return this.fetchAssessmentData(context);
        
      case 'curriculum':
        return this.fetchCurriculumData(context);
        
      case 'custom':
        return this.fetchCustomData(requirement.key, context);
        
      default:
        throw new Error(`Unknown data requirement type: ${requirement.type}`);
    }
  }

  /**
   * Fetch user data
   */
  private async fetchUserData(userId: number): Promise<unknown> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        preferredLanguage: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Use available user data
    const preferences = {} as any; // TODO: Add preferences to schema if needed

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      className: (preferences as any)?.className || `Grade ${(preferences as any)?.grade || ''}`,
      schoolName: (preferences as any)?.schoolName || 'School',
      schoolPhone: (preferences as any)?.schoolPhone,
      classWebsite: (preferences as any)?.classWebsite,
      preferredLanguage: user.preferredLanguage,
    };
  }

  /**
   * Fetch student data
   */
  private async fetchStudentData(context: FetchContext): Promise<unknown> {
    const where: any = {
      userId: context.userId,
      active: true,
    };

    if (context.filters?.studentId) {
      where.id = context.filters.studentId;
    }

    if (context.filters?.grade) {
      where.grade = context.filters.grade;
    }

    // TODO: Update when student model is available
    const students = [] as any; 
    /*
    await prisma.student.findMany({
      where,
      include: {
        goals: context.options?.includeRelations ? {
          where: { active: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        } : false,
        reflections: context.options?.includeRelations ? {
          orderBy: { date: 'desc' },
          take: 5,
        } : false,
      },
      orderBy: context.options?.orderBy || { lastName: 'asc' },
      take: context.options?.limit,
    });
    */

    return students;
  }

  /**
   * Fetch lesson data
   */
  private async fetchLessonData(context: FetchContext): Promise<unknown> {
    const where: any = {
      userId: context.userId,
    };

    if (context.filters?.startDate && context.filters?.endDate) {
      where.date = {
        gte: new Date(context.filters.startDate as string | number | Date),
        lte: new Date(context.filters.endDate as string | number | Date),
      };
    }

    if (context.filters?.subject) {
      where.subject = context.filters.subject;
    }

    const lessons = await prisma.eTFOLessonPlan.findMany({
      where,
      include: {
        unitPlan: {
          include: {
            longRangePlan: true,
          },
        },
        expectations: context.options?.includeRelations ? {
          include: {
            expectation: true,
          },
        } : false,
      },
      orderBy: context.options?.orderBy || { date: 'desc' },
      take: context.options?.limit,
    });

    // Transform to template-friendly format
    return lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      date: lesson.date,
      subject: lesson.unitPlan?.longRangePlan?.subject || lesson.subject,
      grade: lesson.unitPlan?.longRangePlan?.grade,
      duration: lesson.duration,
      unit: lesson.unitPlan ? {
        title: lesson.unitPlan.title,
        week: Math.ceil(
          (lesson.date.getTime() - lesson.unitPlan.startDate.getTime()) / 
          (7 * 24 * 60 * 60 * 1000)
        ),
      } : null,
      learningGoals: lesson.learningGoals,
      materials: lesson.materials,
      mindsOn: lesson.mindsOn,
      action: lesson.action,
      consolidation: lesson.consolidation,
      grouping: lesson.grouping,
      assessmentType: lesson.assessmentType,
      assessmentNotes: lesson.assessmentNotes,
      accommodations: lesson.accommodations,
      modifications: lesson.modifications,
      extensions: lesson.extensions,
      expectations: lesson.expectations?.map(e => ({
        code: e.expectationId,
        description: '',
        type: 'specific',
      })),
    }));
  }

  /**
   * Fetch assessment data
   */
  private async fetchAssessmentData(_context: FetchContext): Promise<unknown> {
    // This would fetch from assessment tables
    // For now, return mock data
    return {
      overall: [],
      specific: [],
    };
  }

  /**
   * Fetch curriculum data
   */
  private async fetchCurriculumData(context: FetchContext): Promise<unknown> {
    const where: any = {
      isActive: true,
    };

    if (context.filters?.subjectId) {
      where.subjectId = context.filters.subjectId;
    }

    if (context.filters?.grade) {
      where.grade = context.filters.grade;
    }

    if (context.filters?.strand) {
      where.strand = context.filters.strand;
    }

    const expectations = await prisma.curriculumExpectation.findMany({
      where,
      orderBy: [
        { code: 'asc' },
      ],
    });

    // Group by code pattern (e.g., A1 is overall, A1.1 is specific)
    const grouped = {
      overall: expectations.filter(e => !e.code.includes('.')),
      specific: expectations.filter(e => e.code.includes('.')),
    };

    return grouped;
  }

  /**
   * Fetch custom data
   */
  private async fetchCustomData(
    key: string,
    context: FetchContext
  ): Promise<unknown> {
    // Handle specific custom data requirements
    switch (key) {
      case 'reportPeriod':
        return {
          name: context.filters?.periodName || 'Progress Report',
          startDate: context.filters?.startDate || new Date(),
          endDate: context.filters?.endDate || new Date(),
          totalDays: context.filters?.totalDays || 0,
        };

      case 'attendance':
        // Fetch from attendance records
        return {
          absent: 0,
          late: 0,
          present: 0,
        };

      case 'achievements':
        // Fetch student achievements
        return [];

      case 'upcomingEvents':
        // Fetch calendar events
        return [];

      case 'weekStart':
      case 'weekEnd': {
        // Calculate week dates
        const now = new Date();
        const dayOfWeek = now.getDay();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return key === 'weekStart' ? weekStart : weekEnd;
      }

      default:
        return null;
    }
  }

  /**
   * Aggregate data for newsletter
   */
  async fetchNewsletterData(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<unknown> {
    const lessons = await this.fetchLessonData({
      userId,
      filters: { startDate, endDate },
      options: { includeRelations: true },
    });

    // Group lessons by subject
    const subjectSummaries = this.groupLessonsBySubject(lessons as any[]);

    // Fetch achievements from daybook
    const achievements = await this.fetchAchievements(userId, startDate, endDate);

    // Fetch upcoming events
    const upcomingEvents = await this.fetchUpcomingEvents(userId);

    return {
      lessons,
      subjectSummaries,
      achievements,
      upcomingEvents,
      weekStart: startDate,
      weekEnd: endDate,
      openingMessage: this.generateOpeningMessage((lessons as any[]).length, (achievements as any[]).length),
      nextWeekPreview: this.generateNextWeekPreview(),
      parentInfo: {
        suggestions: this.generateParentSuggestions(subjectSummaries),
      },
    };
  }

  /**
   * Group lessons by subject
   */
  private groupLessonsBySubject(lessons: unknown[]): unknown[] {
    const grouped = new Map<string, any>();

    for (const lesson of lessons) {
      const subject = (lesson as any).subject || 'General';
      
      if (!grouped.has(subject)) {
        grouped.set(subject, {
          subject,
          summary: '',
          highlights: [],
        });
      }

      const group = grouped.get(subject)!;
      group.highlights.push((lesson as any).title);
    }

    // Generate summaries
    return Array.from(grouped.values()).map(group => ({
      ...group,
      summary: `This week in ${group.subject}, we explored ${group.highlights.length} topics including ${group.highlights[0]}.`,
      highlights: group.highlights.slice(0, 3),
    }));
  }

  /**
   * Fetch achievements from daybook
   */
  private async fetchAchievements(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<string[]> {
    const entries = await prisma.daybookEntry.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        notableAchievements: {
          not: null,
        },
      },
      select: {
        notableAchievements: true,
      },
    });

    return entries
      .map(e => e.notableAchievements)
      .filter(Boolean) as string[];
  }

  /**
   * Fetch upcoming events
   */
  private async fetchUpcomingEvents(_userId: number): Promise<unknown[]> {
    // This would fetch from calendar events
    return [];
  }

  /**
   * Generate opening message
   */
  private generateOpeningMessage(lessonCount: number, achievementCount: number): string {
    if (achievementCount > 0) {
      return `What an amazing week we've had! With ${lessonCount} engaging lessons and ${achievementCount} special achievements, our classroom has been buzzing with learning and growth.`;
    }
    return `We've had a productive week with ${lessonCount} engaging lessons. The students have shown great enthusiasm and progress in their learning journey.`;
  }

  /**
   * Generate next week preview
   */
  private generateNextWeekPreview(): string[] {
    return [
      'Continuing our exploration in Mathematics',
      'Starting a new unit in Science',
      'Presenting our creative writing projects',
      'Special guest speaker on Wednesday',
    ];
  }

  /**
   * Generate parent suggestions
   */
  private generateParentSuggestions(subjectSummaries: unknown[]): string[] {
    const suggestions: string[] = [
      'Ask your child about their favorite lesson from this week',
      'Practice reading together for 20 minutes each evening',
    ];

    // Add subject-specific suggestions
    if ((subjectSummaries as any[]).some(s => (s as any).subject === 'Mathematics')) {
      suggestions.push('Review math facts using everyday situations like cooking or shopping');
    }

    if ((subjectSummaries as any[]).some(s => (s as any).subject === 'Science')) {
      suggestions.push('Encourage questions about the natural world during outdoor time');
    }

    return suggestions;
  }
}