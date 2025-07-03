/**
 * Simplified Newsletter Service
 * Generates basic newsletter templates from lesson plans - no AI needed
 */

import { prisma } from '../prisma';
import debug from 'debug';
import type { ETFOLessonPlan, DaybookEntry, CurriculumExpectation, ETFOLessonPlanExpectation } from '@teaching-engine/database';

const log = debug('server:newsletter');

export interface NewsletterDraft {
  content: string;
  metadata: {
    dateRange: {
      from: string;
      to: string;
    };
    lessonsIncluded: number;
    reflectionsIncluded: number;
    generatedAt: string;
  };
}

export interface GenerateNewsletterParams {
  userId: number;
  sinceDate?: Date; // If not provided, finds date of last newsletter or 2 weeks ago
}

// User preferences interface
export interface UserPreferences {
  lastNewsletterGenerated?: string;
  [key: string]: unknown;
}

// Lesson plan with included relationships for newsletter generation
export interface LessonPlanWithRelations extends ETFOLessonPlan {
  expectations: (ETFOLessonPlanExpectation & {
    expectation: CurriculumExpectation;
  })[];
  unitPlan: {
    title: string;
  } | null;
}

// Daybook entry with included relationships for newsletter generation
export interface DaybookEntryWithRelations extends DaybookEntry {
  lessonPlan: {
    title: string;
  } | null;
}

// Generic lesson plan interface for AI generation
export interface LessonPlanForNewsletter {
  id: string;
  title: string;
  date: Date;
  subject?: string | null;
  learningGoals?: string | null;
  expectations?: Array<{
    expectation: {
      code: string;
    };
  }>;
  unitPlan?: {
    title: string;
  } | null;
}

// Generic reflection interface for AI generation
export interface ReflectionForNewsletter {
  id: string;
  date: Date;
  notableAchievements?: string | null;
  whatWorked?: string | null;
  lessonPlan?: {
    title: string;
  } | null;
}

// Subject grouping type for template content
export interface SubjectGroup {
  [subject: string]: LessonPlanForNewsletter[];
}

export class NewsletterService {
  /**
   * Generate a newsletter draft based on recent lesson plans and teacher reflections
   */
  static async generateDraft(params: GenerateNewsletterParams): Promise<NewsletterDraft> {
    const { userId, sinceDate } = params;

    // Determine the date range - since last newsletter or default to 2 weeks ago
    const fromDate = sinceDate || await this.getLastNewsletterDate(userId) || new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const toDate = new Date();

    log(`Generating newsletter for user ${userId} from ${fromDate.toISOString()} to ${toDate.toISOString()}`);

    // Get recent lesson plans and reflections
    const [lessonPlans, daybookEntries] = await Promise.all([
      this.getRecentLessonPlans(userId, fromDate, toDate),
      this.getRecentReflections(userId, fromDate, toDate),
    ]);

    log(`Found ${lessonPlans.length} lesson plans and ${daybookEntries.length} reflections`);

    // Generate newsletter content using simple template
    const content = this.generateTemplateContent(lessonPlans, daybookEntries, fromDate, toDate);

    return {
      content,
      metadata: {
        dateRange: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
        lessonsIncluded: lessonPlans.length,
        reflectionsIncluded: daybookEntries.length,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Save newsletter generation timestamp
   */
  static async recordNewsletterGeneration(userId: number): Promise<void> {
    // Simplified - no need to track last generation time for MVP
    log(`Newsletter generated for user ${userId}`);
  }

  /**
   * Get recent lesson plans with curriculum expectations
   */
  private static async getRecentLessonPlans(userId: number, fromDate: Date, toDate: Date) {
    return await prisma.eTFOLessonPlan.findMany({
      where: {
        userId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        expectations: {
          include: {
            expectation: true,
          },
        },
        unitPlan: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get recent teacher reflections that might be suitable for newsletters
   */
  private static async getRecentReflections(userId: number, fromDate: Date, toDate: Date) {
    return await prisma.daybookEntry.findMany({
      where: {
        userId,
        date: {
          gte: fromDate,
          lte: toDate,
        },
        // Only include entries with notable achievements or positive reflections
        OR: [
          { notableAchievements: { not: null } },
          { whatWorked: { not: null } },
          { classEngagement: { not: null } }, // Any engagement notes worth sharing
        ],
      },
      include: {
        lessonPlan: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get the date of the last newsletter generation
   */
  private static async getLastNewsletterDate(userId: number): Promise<Date | null> {
    const preferences = await this.getUserPreferences(userId);
    const lastGenerated = preferences?.lastNewsletterGenerated;
    return lastGenerated ? new Date(lastGenerated) : null;
  }

  /**
   * Get user preferences
   */
  private static async getUserPreferences(userId: number): Promise<UserPreferences> {
    // Simplified - no caching needed for single-teacher use
    return {};
  }

  /**
   * Generate newsletter content using simple template
   */
  private static async generateNewsletterContent(
    lessonPlans: LessonPlanWithRelations[],
    reflections: DaybookEntryWithRelations[],
    fromDate: Date,
    toDate: Date
  ): Promise<string> {
    return this.generateTemplateContent(lessonPlans, reflections, fromDate, toDate);
  }

  private static formatDateRange(fromDate: Date, toDate: Date): string {
    return `${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`;
  }

  private static formatLessonSummary(lessonPlans: LessonPlanWithRelations[]): string {
    if (lessonPlans.length === 0) return '';
    
    let summary = '### Recent Lessons\n\n';
    lessonPlans.forEach(lesson => {
      summary += `**${lesson.date.toLocaleDateString()}**: ${lesson.title}\n`;
      if (lesson.learningGoals) {
        summary += `- Learning Goals: ${lesson.learningGoals}\n`;
      }
      summary += '\n';
    });
    return summary;
  }

  private static formatReflectionHighlights(reflections: DaybookEntryWithRelations[]): string {
    if (reflections.length === 0) return '';
    
    let highlights = '### Teacher Reflections\n\n';
    reflections.forEach(reflection => {
      if (reflection.notableAchievements) {
        highlights += `- ${reflection.date.toLocaleDateString()}: ${reflection.notableAchievements}\n`;
      }
      if (reflection.whatWorked) {
        highlights += `- What worked well: ${reflection.whatWorked}\n`;
      }
    });
    highlights += '\n';
    
    return highlights;
  }

  /**
   * Generate newsletter content using templates (fallback)
   */
  private static generateTemplateContent(
    lessonPlans: LessonPlanWithRelations[],
    reflections: DaybookEntryWithRelations[],
    fromDate: Date,
    toDate: Date
  ): string {
    const dateRange = `${fromDate.toLocaleDateString()} to ${toDate.toLocaleDateString()}`;
    
    let content = `# Classroom Newsletter - ${dateRange}\n\n`;
    content += `Dear Families,\n\n`;
    content += `I'm excited to share what we've been learning about in our classroom recently!\n\n`;

    if (lessonPlans.length > 0) {
      content += `## Recent Learning Highlights\n\n`;
      
      // Group lessons by subject
      const subjectGroups = lessonPlans.reduce((groups: SubjectGroup, lesson) => {
        const subject = lesson.subject || lesson.unitPlan?.title || 'General Studies';
        if (!groups[subject]) groups[subject] = [];
        groups[subject].push(lesson);
        return groups;
      }, {});

      Object.entries(subjectGroups).forEach(([subject, lessons]: [string, LessonPlanForNewsletter[]]) => {
        content += `**${subject}**: `;
        const topics = lessons.map(lesson => lesson.title).join(', ');
        content += `We've been exploring ${topics}. `;
        
        // Add learning goals if available
        const goalsSet = new Set<string>();
        lessons.forEach(lesson => {
          if (lesson.learningGoals) {
            lesson.learningGoals.split(',').forEach((goal: string) => goalsSet.add(goal.trim()));
          }
        });
        
        if (goalsSet.size > 0) {
          content += `Students have been working on ${Array.from(goalsSet).slice(0, 2).join(' and ')}.`;
        }
        content += '\n\n';
      });
    }

    if (reflections.length > 0) {
      content += `## Classroom Celebrations\n\n`;
      reflections.forEach(reflection => {
        if (reflection.notableAchievements) {
          content += `• ${reflection.notableAchievements}\n`;
        }
      });
      content += '\n';
    }

    if (lessonPlans.length === 0 && reflections.length === 0) {
      content += `We've been busy with various learning activities and continuing to build our classroom community. Students are making great progress in their academic and social development.\n\n`;
    }

    content += `Thank you for your continued support of your child's learning journey!\n\n`;
    content += `Warm regards,\n`;
    content += `[Your name here]`;

    return content;
  }
}