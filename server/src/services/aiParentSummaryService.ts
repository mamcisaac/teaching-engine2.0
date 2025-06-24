import { prisma } from '../prisma';

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
}

/**
 * Generate AI-based parent summary for a student
 */
export async function generateParentSummary(
  request: ParentSummaryRequest,
): Promise<ParentSummaryResponse> {
  const { studentId, from, to, focus, userId } = request;

  try {
    // Get student information
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        userId: userId,
      },
      include: {
        goals: {
          where: {
            createdAt: {
              gte: from,
              lte: to,
            },
          },
          include: {
            expectation: true,
            theme: true,
          },
        },
        reflections: {
          where: {
            date: {
              gte: from,
              lte: to,
            },
          },
          include: {
            expectation: true,
            theme: true,
          },
        },
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Get activities completed during this period with outcomes
    const activities = await prisma.activity.findMany({
      where: {
        userId: userId,
        completedAt: {
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
        milestone: {
          include: {
            subject: true,
          },
        },
      },
    });

    // Assessment functionality removed
    const assessments: Array<Record<string, unknown>> = [];

    // Generate summary based on collected data
    const summaryData = {
      studentName: `${student.firstName} ${student.lastName}`,
      period: { from, to },
      focus: focus || [],
      activities: activities.length,
      expectations: [...new Set(activities.flatMap((a) => a.expectations.map((e) => e.expectation.code)))],
      subjects: [...new Set(activities.map((a) => a.milestone.subject?.name || 'General'))],
      goals: student.goals.length,
      reflections: student.reflections.length,
      assessments: 0,
    };

    // For now, generate basic rule-based summaries
    // In future versions, this would use OpenAI or similar AI service
    const french = generateFrenchSummary(summaryData);
    const english = generateEnglishSummary(summaryData);

    return { french, english };
  } catch (error) {
    console.error('Error generating parent summary:', error);
    throw new Error('Failed to generate parent summary');
  }
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
