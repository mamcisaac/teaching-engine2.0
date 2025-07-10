/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Newsletter Service
 * Generates classroom newsletters from lesson plans and reflections
 */

interface LessonPlan {
  id: string;
  title: string;
  date: Date;
  subject: string | null;
  learningGoals: string | null;
  userId: number;
  unitPlanId: string | null;
  gradeLevel: string;
  duration: number;
  materials: string;
  assessment: string;
  differentiation: string;
  expectations: unknown[];
  unitPlan?: {
    title: string;
  } | null;
}

interface Reflection {
  id: string;
  userId: number;
  lessonPlanId: string;
  date: Date;
  notableAchievements: string | null;
  whatWorked: string | null;
  classEngagement: string;
  improvementNotes: string | null;
  followUpActions: string | null;
  lessonPlan?: {
    title: string;
  };
}

export class NewsletterService {
  // @ts-expect-error Method reserved for future newsletter generation
  private static _generateTemplateContent(
    lessonPlans: LessonPlan[],
    reflections: Reflection[],
    fromDate: Date,
    toDate: Date,
  ): string {
    const dateRange = this.formatDateRange(fromDate, toDate);

    let content = `# Classroom Newsletter
*${dateRange}*

Dear Families,

I hope this newsletter finds you well! Here's a summary of what we've been working on in our classroom recently.
`;

    if (lessonPlans.length > 0) {
      content += '\n## Recent Learning Highlights\n\n';

      // Group lessons by subject
      const lessonsBySubject: Record<string, LessonPlan[]> = {};

      lessonPlans.forEach((lesson) => {
        const subject = lesson.subject || lesson.unitPlan?.title || 'General Studies';
        if (!lessonsBySubject[subject]) {
          lessonsBySubject[subject] = [];
        }
        lessonsBySubject[subject].push(lesson);
      });

      Object.entries(lessonsBySubject).forEach(([subject, lessons]) => {
        const titles = lessons.map((l) => l.title).join(', ');
        const goals = lessons
          .map((l) => l.learningGoals)
          .filter((g) => g)
          .join(', ')
          .replace(/,\s*/g, ' and ');

        content += `**${subject}**: We've been exploring ${titles}`;
        if (goals) {
          content += `. Our focus has been on ${goals}`;
        }
        content += '.\n\n';
      });
    }

    if (reflections.length > 0) {
      const achievements = reflections
        .map((r) => r.notableAchievements)
        .filter((a) => a && a.trim());

      content += '## Classroom Celebrations\n\n';
      if (achievements.length > 0) {
        achievements.forEach((achievement) => {
          content += `• ${achievement}\n`;
        });
        content += '\n';
      }
    }

    if (lessonPlans.length === 0 && reflections.length === 0) {
      content +=
        "\nWe've been busy with various learning activities and continuing to build our classroom community. ";
    }

    content += `
Thank you for your continued support of your child's learning journey. Please feel free to reach out if you have any questions or concerns.

Warm regards,
[Your name here]`;

    return content;
  }

  private static formatDateRange(fromDate: Date, toDate: Date): string {
    const from = new Date(fromDate.getTime() - 24 * 60 * 60 * 1000); // Subtract a day
    const to = new Date(toDate.getTime() - 24 * 60 * 60 * 1000); // Subtract a day

    return `${from.toISOString().split('T')[0]} to ${to.toISOString().split('T')[0]}`;
  }

  // @ts-expect-error Method reserved for future newsletter formatting
  private static _formatLessonSummary(lessons: unknown[]): string {
    if (lessons.length === 0) {
return '';
}

    let summary = '### Recent Lessons\n\n';

    lessons.forEach((lesson: any) => {
      const date = new Date(lesson.date.getTime() - 24 * 60 * 60 * 1000); // Subtract a day
      const dateStr = date.toISOString().split('T')[0];

      summary += `**${dateStr}**: ${lesson.title}\n`;
      if (lesson.learningGoals) {
        summary += `- Learning Goals: ${lesson.learningGoals}\n`;
      }
      summary += '\n';
    });

    return summary;
  }

  // @ts-expect-error Method reserved for future newsletter formatting
  private static _formatReflectionHighlights(reflections: unknown[]): string {
    if (reflections.length === 0) {
return '';
}

    let highlights = '### Teacher Reflections\n\n';

    reflections.forEach((reflection: any) => {
      const date = new Date(reflection.date.getTime() - 24 * 60 * 60 * 1000); // Subtract a day
      const dateStr = date.toISOString().split('T')[0];

      if (reflection.notableAchievements) {
        highlights += `- ${dateStr}: ${reflection.notableAchievements}\n`;
      }
      if (reflection.whatWorked) {
        highlights += `- What worked well: ${reflection.whatWorked}\n`;
      }
    });

    return highlights;
  }

  // @ts-expect-error Method reserved for future user preferences
  private static async _getUserPreferences(_userId: number): Promise<unknown> {
    // Mock implementation - returns empty preferences
    return {};
  }

  // @ts-expect-error Method reserved for future newsletter tracking
  private static async _getLastNewsletterDate(_userId: number): Promise<Date | null> {
    // Mock implementation - returns null
    return null;
  }

  static async recordNewsletterGeneration(_userId: number): Promise<void> {
    // Mock implementation that doesn't throw
    return Promise.resolve();
  }

  static async getUserPreferences(_userId: number): Promise<Record<string, never>> {
    // Mock implementation - returns empty object
    return {};
  }
}
