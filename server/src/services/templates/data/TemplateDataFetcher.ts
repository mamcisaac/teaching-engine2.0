/**
 * Template Data Fetcher
 * Fetches and aggregates data for templates
 */

import { prisma } from '../../../prisma';
import type {
  UserTemplateData,
  UserPreferences,
  Student,
  LessonTemplateData,
  ExpectationReference,
  GroupedExpectations,
  AssessmentData,
  ReportPeriodData,
  AttendanceData,
  SubjectSummary,
  NewsletterData,
  LessonFilterOptions,
  StudentFilterOptions,
  CurriculumFilterOptions,
  CustomDataFilters,
  LessonWhereInput,
  StudentWhereInput,
} from '../../../types/template-data';
import type { DataRequirement } from '../providers/TemplateProvider';

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
        data[req.key] = (req.defaultValue !== null) ? req.defaultValue : null;
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
  private async fetchUserData(userId: number): Promise<UserTemplateData> {
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
    const preferences: UserPreferences = {}; // TODO: Add preferences to schema if needed

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      className: preferences.className ?? `Grade ${preferences.grade ?? ''}`,
      schoolName: preferences.schoolName ?? 'School',
      schoolPhone: preferences.schoolPhone,
      classWebsite: preferences.classWebsite,
      preferredLanguage: user.preferredLanguage,
    };
  }

  /**
   * Fetch student data
   */
  private async fetchStudentData(context: FetchContext): Promise<Student[]> {
    const filters = context.filters as StudentFilterOptions | undefined;
    const where: StudentWhereInput = {
      userId: context.userId,
      active: true,
    };

    if (filters?.studentId) {
      where.id = filters.studentId;
    }

    if (filters?.grade) {
      where.grade = filters.grade;
    }

    // TODO: Update when student model is available
    const students: Student[] = []; 
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
      orderBy: context.options?.orderBy ?? { lastName: 'asc' },
      take: context.options?.limit,
    });
    */

    return students;
  }

  /**
   * Fetch lesson data
   */
  private async fetchLessonData(context: FetchContext): Promise<LessonTemplateData[]> {
    const filters = context.filters as LessonFilterOptions | undefined;
    const where: LessonWhereInput = {
      userId: context.userId,
    };

    if (filters?.startDate && filters.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    if (filters?.subject) {
      where.subject = filters.subject;
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
      orderBy: context.options?.orderBy ?? { date: 'desc' },
      take: context.options?.limit,
    });

    // Transform to template-friendly format
    return lessons.map((lesson): LessonTemplateData => ({
      id: parseInt(lesson.id),
      title: lesson.title,
      date: lesson.date,
      subject: lesson.unitPlan.longRangePlan.subject || lesson.subject || '',
      grade: lesson.unitPlan.longRangePlan.grade.toString() || '0',
      duration: parseInt(String(lesson.duration || '0')),
      unit: lesson.unitPlan != null ? {
        title: lesson.unitPlan.title,
        week: Math.ceil(
          (lesson.date.getTime() - lesson.unitPlan.startDate.getTime()) / 
          (7 * 24 * 60 * 60 * 1000)
        ),
      } : null,
      learningGoals: typeof lesson.learningGoals === 'string' ? lesson.learningGoals : lesson.learningGoals ? String(lesson.learningGoals) : null,
      materials: typeof lesson.materials === 'string' ? lesson.materials : lesson.materials ? String(lesson.materials) : null,
      mindsOn: typeof lesson.mindsOn === 'string' ? lesson.mindsOn : lesson.mindsOn ? String(lesson.mindsOn) : null,
      action: typeof lesson.action === 'string' ? lesson.action : (lesson.action ? String(lesson.action) : null),
      consolidation: typeof lesson.consolidation === 'string' ? lesson.consolidation : (lesson.consolidation ? String(lesson.consolidation) : null),
      grouping: typeof lesson.grouping === 'string' ? lesson.grouping : lesson.grouping ? String(lesson.grouping) : null,
      assessmentType: typeof lesson.assessmentType === 'string' ? lesson.assessmentType : lesson.assessmentType ? String(lesson.assessmentType) : null,
      assessmentNotes: typeof lesson.assessmentNotes === 'string' ? lesson.assessmentNotes : lesson.assessmentNotes ? String(lesson.assessmentNotes) : null,
      accommodations: typeof lesson.accommodations === 'string' ? lesson.accommodations : lesson.accommodations ? String(lesson.accommodations) : null,
      modifications: typeof lesson.modifications === 'string' ? lesson.modifications : (lesson.modifications ? String(lesson.modifications) : null),
      extensions: typeof lesson.extensions === 'string' ? lesson.extensions : (lesson.extensions ? String(lesson.extensions) : null),
      expectations: lesson.expectations.map((e): ExpectationReference => ({
        code: e.expectationId || '',
        description: '',
        type: 'specific' as const,
      })),
    }));
  }

  /**
   * Fetch assessment data
   */
  private async fetchAssessmentData(_context: FetchContext): Promise<AssessmentData> {
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
  private async fetchCurriculumData(context: FetchContext): Promise<GroupedExpectations> {
    const filters = context.filters as CurriculumFilterOptions | undefined;
    interface CurriculumWhereClause {
      isActive: boolean;
      subjectId?: string;
      grade?: number;
      strand?: string;
      subject?: string;
    }
    
    const where: CurriculumWhereClause = {
      isActive: true,
    };

    if (filters?.subjectId) {
      where.subjectId = filters.subjectId;
    }

    if (filters?.grade) {
      where.grade = Number(filters.grade);
    }

    if (filters?.strand) {
      where.strand = filters.strand;
    }

    const expectations = await prisma.curriculumExpectation.findMany({
      where,
      select: {
        id: true,
        code: true,
        description: true,
        grade: true,
        subject: true,
        strand: true,
      },
      orderBy: [
        { code: 'asc' },
      ],
    });

    // Transform to match interface requirements
    const transformedExpectations = expectations.map(e => ({
      id: parseInt(e.id),
      code: e.code,
      description: e.description,
      grade: e.grade.toString(),
      subject: e.subject,
      strand: e.strand,
      isActive: true, // Default to true since we filter by isActive in where clause
    }));

    // Group by code pattern (e.g., A1 is overall, A1.1 is specific)
    const grouped: GroupedExpectations = {
      overall: transformedExpectations.filter((e) => !e.code.includes('.')),
      specific: transformedExpectations.filter((e) => e.code.includes('.')),
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
      case 'reportPeriod': {
        const filters = context.filters as CustomDataFilters | undefined;
        const reportData: ReportPeriodData = {
          name: filters?.periodName ?? 'Progress Report',
          startDate: filters?.startDate ? new Date(filters.startDate) : new Date(),
          endDate: filters?.endDate ? new Date(filters.endDate) : new Date(),
          totalDays: filters?.totalDays ?? 0,
        };
        return reportData;
      }

      case 'attendance': {
        // Fetch from attendance records
        const attendanceData: AttendanceData = {
          absent: 0,
          late: 0,
          present: 0,
        };
        return attendanceData;
      }

      case 'achievements':
        // Fetch student achievements
        return [] as string[];

      case 'upcomingEvents':
        // Fetch calendar events
        return [] as unknown[];

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
  ): Promise<NewsletterData> {
    const lessons = await this.fetchLessonData({
      userId,
      filters: { startDate, endDate },
      options: { includeRelations: true },
    });

    // Group lessons by subject
    const subjectSummaries = this.groupLessonsBySubject(lessons);

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
      openingMessage: this.generateOpeningMessage(lessons.length, achievements.length),
      nextWeekPreview: this.generateNextWeekPreview(),
      parentInfo: {
        suggestions: this.generateParentSuggestions(subjectSummaries),
      },
    };
  }

  /**
   * Group lessons by subject
   */
  private groupLessonsBySubject(lessons: LessonTemplateData[]): SubjectSummary[] {
    const grouped = new Map<string, {
      subject: string;
      summary: string;
      highlights: string[];
    }>();

    for (const lesson of lessons) {
      const subject = lesson.subject ?? 'General';
      
      if (!grouped.has(subject)) {
        grouped.set(subject, {
          subject,
          summary: '',
          highlights: [],
        });
      }

      const group = grouped.get(subject);
      if (group) {
        group.highlights.push(lesson.title);
      }
    }

    // Generate summaries
    return Array.from(grouped.values()).map(group => ({
      ...group,
      summary: `This week in ${group.subject}, we explored ${group.highlights.length} topics including ${group.highlights[0] ?? 'various concepts'}.`,
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
      .map((e) => e.notableAchievements)
      .filter((achievement): achievement is string => Boolean(achievement));
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
  private generateParentSuggestions(subjectSummaries: SubjectSummary[]): string[] {
    const suggestions: string[] = [
      'Ask your child about their favorite lesson from this week',
      'Practice reading together for 20 minutes each evening',
    ];

    // Add subject-specific suggestions
    if (subjectSummaries.some(s => s.subject === 'Mathematics')) {
      suggestions.push('Review math facts using everyday situations like cooking or shopping');
    }

    if (subjectSummaries.some(s => s.subject === 'Science')) {
      suggestions.push('Encourage questions about the natural world during outdoor time');
    }

    return suggestions;
  }
}