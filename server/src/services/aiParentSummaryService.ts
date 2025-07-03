import { openai } from './llmService';
import BaseService, { ServiceDependencies } from './base/BaseService';

export interface ParentSummaryRequest {
  studentId: number;
  from: Date;
  to: Date;
  focus?: string[];
  userId: number;
}

export interface ParentSummaryResponse {
  french: string;
  english: string;
  metadata?: {
    activitiesCount: number;
    goalsCount: number;
    reflectionsCount: number;
    outcomesCount: number;
    subjects: string[];
  };
}

export class AIParentSummaryService extends BaseService {
  constructor(dependencies?: ServiceDependencies) {
    super('AIParentSummaryService', dependencies);
  }

  /**
   * Check if AI service is available
   */
  isAIServiceAvailable(): boolean {
    return !!openai;
  }

  /**
   * Generate AI-based parent summary for a student
   */
  async generateParentSummary(request: ParentSummaryRequest): Promise<ParentSummaryResponse> {
    const { studentId, from, to, focus, userId } = request;

    try {
      // Get student information
      const student = await this.prisma.student.findFirst({
        where: {
          id: studentId,
          userId: userId,
        },
      });

      if (!student) {
        this.logger.error({ studentId, userId }, 'Student not found');
        throw new Error('Failed to generate parent summary');
      }

      // Fetch student goals
      const goals = await this.prisma.studentGoal.findMany({
        where: {
          studentId: studentId,
          createdAt: {
            gte: from,
            lte: to,
          },
        },
      });

      // Fetch student reflections
      const reflections = await this.prisma.studentReflection.findMany({
        where: {
          studentId: studentId,
          date: {
            gte: from,
            lte: to,
          },
        },
      });

      // Fetch activities from daybook entries
      const activities = await this.fetchStudentActivities(from, to);

      // Generate summary based on collected data
      const summaryData = {
        studentName: `${student.firstName} ${student.lastName}`,
        period: { from, to },
        focus: focus || [],
        activities: activities.length,
        outcomes: [
          ...new Set(
            activities.flatMap((a) => a.expectations?.map((e) => e.expectation?.code) || []),
          ),
        ],
        subjects: [
          ...new Set(
            activities.flatMap((a) => a.expectations?.map((e) => e.expectation?.subject) || []),
          ),
        ].filter(Boolean),
        goals: goals.length,
        reflections: reflections.length,
        assessments: 0, // TODO: Implement assessment tracking
      };

      // Generate summaries
      let french: string;
      let english: string;

      if (this.isAIServiceAvailable()) {
        // Use AI service if available
        const aiSummary = await this.generateAISummary(summaryData);
        french = aiSummary.french;
        english = aiSummary.english;
      } else {
        // Fallback to rule-based summaries
        french = generateFrenchSummary(summaryData);
        english = generateEnglishSummary(summaryData);
      }

      return {
        french,
        english,
        metadata: {
          activitiesCount: summaryData.activities,
          goalsCount: summaryData.goals,
          reflectionsCount: summaryData.reflections,
          outcomesCount: summaryData.outcomes.length,
          subjects: summaryData.subjects,
        },
      };
    } catch (error) {
      this.logger.error({ error, studentId }, 'Error generating parent summary');
      throw new Error('Failed to generate parent summary');
    }
  }

  /**
   * Fetch student activities from daybook entries
   */
  private async fetchStudentActivities(from: Date, to: Date) {
    try {
      const daybookEntries = await this.prisma.daybookEntry.findMany({
        where: {
          date: {
            gte: from,
            lte: to,
          },
        },
        include: {
          expectations: {
            include: {
              expectation: true,
            },
          },
        },
      });

      return daybookEntries;
    } catch (error) {
      this.logger.error({ error }, 'Failed to fetch student activities');
      return [];
    }
  }

  /**
   * Generate AI-powered summary
   */
  private async generateAISummary(
    summaryData: SummaryData,
  ): Promise<{ french: string; english: string }> {
    // This would use OpenAI or similar service in production
    // For now, using rule-based generation
    return {
      french: generateFrenchSummary(summaryData),
      english: generateEnglishSummary(summaryData),
    };
  }
}

/**
 * Generate AI-based parent summary for a student (backward compatibility)
 */
export async function generateParentSummary(
  request: ParentSummaryRequest,
): Promise<ParentSummaryResponse> {
  const service = new AIParentSummaryService();
  const result = await service.generateParentSummary(request);
  // Return without metadata for backward compatibility
  return {
    french: result.french,
    english: result.english,
  };
}

interface SummaryData {
  studentName: string;
  period: { from: Date; to: Date };
  focus: string[];
  activities: number;
  outcomes: string[];
  subjects: string[];
  goals: number;
  reflections: number;
  assessments: number;
}

function generateFrenchSummary(data: SummaryData): string {
  const { studentName, activities, outcomes, subjects, goals, reflections } = data;

  let summary = `Au cours de cette période, ${studentName} a participé activement à ${activities} activités d'apprentissage`;

  if (subjects.length > 0) {
    summary += ` dans les matières suivantes : ${subjects.join(', ')}`;
  }

  summary += '. ';

  if (outcomes.length > 0) {
    summary += `Les apprentissages ont couvert ${outcomes.length} objectifs du curriculum, incluant ${outcomes.slice(0, 3).join(', ')}`;
    if (outcomes.length > 3) {
      summary += ` et ${outcomes.length - 3} autres objectifs`;
    }
    summary += '. ';
  }

  if (goals > 0) {
    summary += `${studentName} a travaillé sur ${goals} objectifs personnalisés d'apprentissage. `;
  }

  if (reflections > 0) {
    summary += `L'élève a également participé à ${reflections} réflexions sur son apprentissage, démontrant une capacité croissante d'autoévaluation. `;
  }

  summary += `${studentName} continue de progresser dans son développement académique et personnel.`;

  return summary;
}

function generateEnglishSummary(data: SummaryData): string {
  const { studentName, activities, outcomes, subjects, goals, reflections } = data;

  let summary = `During this period, ${studentName} actively participated in ${activities} learning activities`;

  if (subjects.length > 0) {
    summary += ` across the following subjects: ${subjects.join(', ')}`;
  }

  summary += '. ';

  if (outcomes.length > 0) {
    summary += `The learning covered ${outcomes.length} curriculum outcomes, including ${outcomes.slice(0, 3).join(', ')}`;
    if (outcomes.length > 3) {
      summary += ` and ${outcomes.length - 3} additional outcomes`;
    }
    summary += '. ';
  }

  if (goals > 0) {
    summary += `${studentName} worked toward ${goals} personalized learning goals. `;
  }

  if (reflections > 0) {
    summary += `The student also engaged in ${reflections} learning reflections, demonstrating growing self-assessment abilities. `;
  }

  summary += `${studentName} continues to make progress in both academic and personal development.`;

  return summary;
}
