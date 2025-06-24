import { prisma } from '../prisma';
import { generateContent } from './llmService';
import logger from '../logger';

export interface ReportGenerationRequest {
  studentId: number;
  reportType: 'progress' | 'narrative' | 'term_summary' | 'report_card';
  termId?: number;
  subjectId?: number;
  startDate: Date;
  endDate: Date;
  language: 'en' | 'fr';
  includeAssessments?: boolean;
  includeAttendance?: boolean;
  includeGoals?: boolean;
}

export interface GeneratedReport {
  studentName: string;
  period: string;
  sections: ReportSection[];
  overallComments: string;
  nextSteps: string[];
}

export interface ReportSection {
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

// Type definitions for student data with relations
interface StudentWithRelations {
  id: number;
  firstName: string;
  lastName: string;
  userId: number;
  artifacts: Artifact[];
  reflections: Reflection[];
  goals: Goal[];
}


interface Artifact {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
}

interface Reflection {
  id: number;
  content: string;
  createdAt: Date;
}

interface Goal {
  id: number;
  text: string;
  status: string;
}

interface SubjectProgress {
  id: number;
  name: string;
  outcomes: string[];
  averageScore: number;
  [key: string]: unknown;
}

interface SubjectReportCard {
  id: number;
  name: string;
  grade: string;
  outcomes: string[];
}

export class ReportGeneratorService {
  async generateReport(request: ReportGenerationRequest): Promise<GeneratedReport> {
    try {
      // Fetch student data
      const student = await prisma.student.findUnique({
        where: { id: request.studentId },
        include: {
          user: true,
          artifacts: {
            where: {
              createdAt: {
                gte: request.startDate,
                lte: request.endDate,
              },
            },
          },
          reflections: {
            where: {
              createdAt: {
                gte: request.startDate,
                lte: request.endDate,
              },
            },
          },
          goals: {
            where: {
              OR: [
                { status: 'active' },
                { status: 'completed' },
              ],
            },
          },
        },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Generate report based on type
      let report: GeneratedReport;
      
      switch (request.reportType) {
        case 'progress':
          report = await this.generateProgressReport(student, request);
          break;
        case 'narrative':
          report = await this.generateNarrativeReport(student, request);
          break;
        case 'term_summary':
          report = await this.generateTermSummary(student, request);
          break;
        case 'report_card':
          report = await this.generateReportCard(student, request);
          break;
        default:
          throw new Error('Invalid report type');
      }

      return report;
    } catch (error) {
      logger.error('Failed to generate report:', error);
      throw error;
    }
  }

  private async generateProgressReport(
    student: StudentWithRelations,
    request: ReportGenerationRequest
  ): Promise<GeneratedReport> {
    const sections: ReportSection[] = [];

    // Assessment functionality removed - focus on artifacts and reflections
    if (student.artifacts.length > 0 || student.reflections.length > 0) {
      sections.push({
        title: request.language === 'fr' ? 'Progrès académique' : 'Academic Progress',
        content: await this.generateProgressFromArtifacts(student.artifacts, student.reflections, request.language),
        data: { artifacts: student.artifacts, reflections: student.reflections },
      });
    }

    // Goals Section
    if (request.includeGoals && student.goals.length > 0) {
      sections.push({
        title: request.language === 'fr' ? 'Objectifs' : 'Goals',
        content: await this.generateGoalsNarrative(student.goals, request.language),
        data: { goals: student.goals },
      });
    }

    // Overall Comments
    const overallComments = await this.generateOverallComments(
      student,
      sections,
      request.language
    );

    // Next Steps
    const nextSteps = await this.generateNextSteps(student, sections, request.language);

    return {
      studentName: `${student.firstName} ${student.lastName}`,
      period: `${request.startDate.toLocaleDateString()} - ${request.endDate.toLocaleDateString()}`,
      sections,
      overallComments,
      nextSteps,
    };
  }

  private async generateNarrativeReport(
    student: StudentWithRelations,
    request: ReportGenerationRequest
  ): Promise<GeneratedReport> {
    // Gather comprehensive data
    const learningJourney = this.compileLearningJourney(student);
    
    // Generate narrative using LLM
    const prompt = request.language === 'fr' 
      ? `Générez un rapport narratif détaillé pour ${student.firstName} ${student.lastName}, couvrant la période du ${request.startDate.toLocaleDateString()} au ${request.endDate.toLocaleDateString()}. Incluez les réalisations, les défis et les domaines de croissance.`
      : `Generate a detailed narrative report for ${student.firstName} ${student.lastName}, covering the period from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()}. Include achievements, challenges, and areas of growth.`;

    const narrative = await generateContent(prompt, JSON.stringify(learningJourney));

    return {
      studentName: `${student.firstName} ${student.lastName}`,
      period: `${request.startDate.toLocaleDateString()} - ${request.endDate.toLocaleDateString()}`,
      sections: [{
        title: request.language === 'fr' ? 'Rapport narratif' : 'Narrative Report',
        content: narrative,
      }],
      overallComments: '',
      nextSteps: [],
    };
  }

  private async generateTermSummary(
    student: StudentWithRelations,
    request: ReportGenerationRequest
  ): Promise<GeneratedReport> {
    const sections: ReportSection[] = [];

    // Get subject-specific progress
    const subjectProgress = await this.getSubjectProgress(student);
    
    for (const subject of subjectProgress) {
      sections.push({
        title: subject.name,
        content: await this.generateSubjectSummary(subject, request.language),
        data: subject,
      });
    }

    // Overall term performance
    const overallComments = await this.generateTermOverview(
      student,
      subjectProgress,
      request.language
    );

    // Recommendations for next term
    const nextSteps = await this.generateTermRecommendations(
      student,
      subjectProgress,
      request.language
    );

    return {
      studentName: `${student.firstName} ${student.lastName}`,
      period: request.language === 'fr' ? 'Résumé du trimestre' : 'Term Summary',
      sections,
      overallComments,
      nextSteps,
    };
  }

  private async generateReportCard(
    student: StudentWithRelations,
    request: ReportGenerationRequest
  ): Promise<GeneratedReport> {
    const sections: ReportSection[] = [];

    // Get formal grades/assessments by subject
    const reportCardData = await this.compileReportCardData(student);

    for (const subject of reportCardData) {
      // Generate teacher comments for each subject
      const comments = await this.generateSubjectComments(
        subject,
        student,
        request.language
      );

      sections.push({
        title: subject.name,
        content: comments,
        data: {
          grade: subject.grade,
          outcomes: subject.outcomes,
        },
      });
    }

    // General comments
    const overallComments = await this.generateReportCardComments(
      student,
      reportCardData,
      request.language
    );

    return {
      studentName: `${student.firstName} ${student.lastName}`,
      period: request.language === 'fr' ? 'Bulletin scolaire' : 'Report Card',
      sections,
      overallComments,
      nextSteps: [],
    };
  }

  // Helper methods
  private async generateProgressFromArtifacts(
    artifacts: Artifact[],
    reflections: Reflection[],
    language: 'en' | 'fr'
  ): Promise<string> {
    const context = {
      artifactCount: artifacts.length,
      reflectionCount: reflections.length,
      recentArtifacts: artifacts.slice(0, 3).map(a => ({ title: a.title, description: a.description })),
      recentReflections: reflections.slice(0, 3).map(r => ({ content: r.content }))
    };

    const prompt = language === 'fr'
      ? `Décrivez le progrès académique basé sur ${artifacts.length} artefacts et ${reflections.length} réflexions.`
      : `Describe academic progress based on ${artifacts.length} artifacts and ${reflections.length} reflections.`;

    return generateContent(prompt, JSON.stringify(context));
  }


  private async generateGoalsNarrative(
    goals: Goal[],
    language: 'en' | 'fr'
  ): Promise<string> {
    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const context = {
      active: activeGoals.map(g => ({ text: g.text })),
      completed: completedGoals.map(g => ({ text: g.text })),
    };

    const prompt = language === 'fr'
      ? `Décrivez le progrès vers les objectifs de l'élève: ${JSON.stringify(context)}`
      : `Describe the student's progress toward their goals: ${JSON.stringify(context)}`;

    return generateContent(prompt);
  }

  private async generateOverallComments(
    student: StudentWithRelations,
    sections: ReportSection[],
    language: 'en' | 'fr'
  ): Promise<string> {
    const context = {
      studentName: `${student.firstName} ${student.lastName}`,
      sectionsCount: sections.length,
      sectionTitles: sections.map(s => s.title),
    };

    const prompt = language === 'fr'
      ? `Générez des commentaires généraux positifs et encourageants pour ${context.studentName} basés sur leur rapport de progrès.`
      : `Generate positive and encouraging overall comments for ${context.studentName} based on their progress report.`;

    return generateContent(prompt, JSON.stringify(context));
  }

  private async generateNextSteps(
    student: StudentWithRelations,
    sections: ReportSection[],
    language: 'en' | 'fr'
  ): Promise<string[]> {
    const prompt = language === 'fr'
      ? `Suggérez 3-5 prochaines étapes spécifiques pour ${student.firstName} pour continuer leur progrès.`
      : `Suggest 3-5 specific next steps for ${student.firstName} to continue their progress.`;

    const suggestions = await generateContent(
      prompt, 
      JSON.stringify(sections.map(s => ({ title: s.title, summary: s.content.substring(0, 100) })))
    );

    // Parse the suggestions into an array
    return suggestions.split('\n').filter(s => s.trim().length > 0).slice(0, 5);
  }

  private compileLearningJourney(student: StudentWithRelations) {
    return {
      artifacts: student.artifacts.map((a) => ({
        title: a.title,
        description: a.description,
        createdAt: a.createdAt,
      })),
      reflections: student.reflections.map((r) => ({
        content: r.content,
        createdAt: r.createdAt,
      })),
      goals: student.goals,
    };
  }

  private async getSubjectProgress(student: StudentWithRelations): Promise<SubjectProgress[]> {
    // Simplified subject progress without deep relations
    const subjects = await prisma.subject.findMany({
      where: { userId: student.userId },
    });

    return subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      outcomes: [],
      averageScore: 0, // Assessment functionality removed
    }));
  }

  private async generateSubjectSummary(subject: SubjectProgress, language: 'en' | 'fr'): Promise<string> {
    const prompt = language === 'fr'
      ? `Résumez la performance de l'élève en ${subject.name} avec une note moyenne de ${subject.averageScore.toFixed(1)}% et couvrant ${subject.outcomes.length} résultats d'apprentissage.`
      : `Summarize the student's performance in ${subject.name} with an average score of ${subject.averageScore.toFixed(1)}% and covering ${subject.outcomes.length} learning outcomes.`;

    return generateContent(prompt);
  }

  private async generateTermOverview(
    student: StudentWithRelations,
    subjectProgress: SubjectProgress[],
    language: 'en' | 'fr'
  ): Promise<string> {
    const overallAverage = subjectProgress.reduce((sum, s) => sum + s.averageScore, 0) / subjectProgress.length;
    
    const prompt = language === 'fr'
      ? `Générez un aperçu du trimestre pour ${student.firstName} avec une moyenne générale de ${overallAverage.toFixed(1)}% à travers ${subjectProgress.length} matières.`
      : `Generate a term overview for ${student.firstName} with an overall average of ${overallAverage.toFixed(1)}% across ${subjectProgress.length} subjects.`;

    return generateContent(
      prompt,
      JSON.stringify(subjectProgress.map(s => ({ name: s.name, average: s.averageScore })))
    );
  }

  private async generateTermRecommendations(
    student: StudentWithRelations,
    subjectProgress: SubjectProgress[],
    language: 'en' | 'fr'
  ): Promise<string[]> {
    const weakSubjects = subjectProgress.filter(s => s.averageScore < 70);
    const strongSubjects = subjectProgress.filter(s => s.averageScore >= 85);

    const prompt = language === 'fr'
      ? `Suggérez 3-5 recommandations pour le prochain trimestre basées sur les forces (${strongSubjects.map(s => s.name).join(', ')}) et les domaines à améliorer (${weakSubjects.map(s => s.name).join(', ')}).`
      : `Suggest 3-5 recommendations for the next term based on strengths (${strongSubjects.map(s => s.name).join(', ')}) and areas for improvement (${weakSubjects.map(s => s.name).join(', ')}).`;

    const recommendations = await generateContent(prompt);

    return recommendations.split('\n').filter(r => r.trim().length > 0).slice(0, 5);
  }

  private async compileReportCardData(student: StudentWithRelations): Promise<SubjectReportCard[]> {
    const subjects = await prisma.subject.findMany({
      where: { userId: student.userId },
    });

    return subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      grade: 'N/A', // Assessment functionality removed
      outcomes: [],
    }));
  }

  private scoreToGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private async generateSubjectComments(
    subject: SubjectReportCard,
    student: StudentWithRelations,
    language: 'en' | 'fr'
  ): Promise<string> {
    const prompt = language === 'fr'
      ? `Générez des commentaires d'enseignant pour ${student.firstName} en ${subject.name} avec une note de ${subject.grade}. Soyez spécifique et encourageant.`
      : `Generate teacher comments for ${student.firstName} in ${subject.name} with a grade of ${subject.grade}. Be specific and encouraging.`;

    return generateContent(
      prompt,
      JSON.stringify({
        outcomes: subject.outcomes.length,
      })
    );
  }

  private async generateReportCardComments(
    student: StudentWithRelations,
    reportCardData: SubjectReportCard[],
    language: 'en' | 'fr'
  ): Promise<string> {
    const overallGrade = reportCardData.reduce((sum, s) => {
      const gradeValue = { A: 4, B: 3, C: 2, D: 1, F: 0 }[s.grade] || 0;
      return sum + gradeValue;
    }, 0) / reportCardData.length;

    const prompt = language === 'fr'
      ? `Générez des commentaires généraux de bulletin pour ${student.firstName} ${student.lastName} avec une performance globale de ${overallGrade.toFixed(1)}/4.0.`
      : `Generate overall report card comments for ${student.firstName} ${student.lastName} with an overall performance of ${overallGrade.toFixed(1)}/4.0.`;

    return generateContent(
      prompt,
      JSON.stringify(reportCardData.map(s => ({ subject: s.name, grade: s.grade })))
    );
  }
}

export const reportGeneratorService = new ReportGeneratorService();