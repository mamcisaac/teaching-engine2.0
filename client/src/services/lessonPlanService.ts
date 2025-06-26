import { LessonPlanFormData } from '../hooks/useETFOLessonPlanForm';
import { ETFOLessonPlan, UnitPlan } from '../hooks/useETFOPlanning';

// Business logic for lesson plans
export class LessonPlanService {
  // Calculate time allocation for three-part lesson
  static calculateTimeAllocation(duration: number): {
    mindsOn: number;
    action: number;
    consolidation: number;
  } {
    return {
      mindsOn: Math.round(duration * 0.15), // 15%
      action: Math.round(duration * 0.65), // 65%
      consolidation: Math.round(duration * 0.2), // 20%
    };
  }

  // Validate lesson timing
  static validateTiming(date: string, unitStartDate: string, unitEndDate: string): boolean {
    const lessonDate = new Date(date);
    const start = new Date(unitStartDate);
    const end = new Date(unitEndDate);
    return lessonDate >= start && lessonDate <= end;
  }

  // Format lesson plan for export
  static formatForExport(lesson: ETFOLessonPlan, unitPlan?: UnitPlan): string {
    let content = `# ${lesson.title}\n`;
    if (lesson.titleFr) {
      content += `## ${lesson.titleFr}\n`;
    }
    content += `\n**Date:** ${new Date(lesson.date).toLocaleDateString()}\n`;
    content += `**Duration:** ${lesson.duration} minutes\n`;

    if (unitPlan) {
      content += `**Unit:** ${unitPlan.title}\n`;
    }

    content += '\n---\n\n';

    if (lesson.learningGoals) {
      content += `## Learning Goals\n${lesson.learningGoals}\n\n`;
    }

    content += `## Three-Part Lesson\n\n`;

    content += `### Minds On (${this.calculateTimeAllocation(lesson.duration).mindsOn} min)\n`;
    content += `${lesson.mindsOn || 'No content provided'}\n\n`;

    content += `### Action (${this.calculateTimeAllocation(lesson.duration).action} min)\n`;
    content += `${lesson.action || 'No content provided'}\n\n`;

    content += `### Consolidation (${this.calculateTimeAllocation(lesson.duration).consolidation} min)\n`;
    content += `${lesson.consolidation || 'No content provided'}\n\n`;

    if (lesson.materials && lesson.materials.length > 0) {
      content += `## Materials Needed\n`;
      lesson.materials.forEach((material: string) => {
        content += `- ${material}\n`;
      });
      content += '\n';
    }

    return content;
  }

  // Prepare form data for submission
  static prepareFormData(data: LessonPlanFormData, unitPlanId: string): LessonPlanFormData {
    return {
      ...data,
      materials: data.materials.filter((m) => m.trim()),
      accommodations: data.accommodations.filter((a) => a.trim()),
      modifications: data.modifications.filter((m) => m.trim()),
      extensions: data.extensions.filter((e) => e.trim()),
      unitPlanId, // Add unitPlanId separately
    } as LessonPlanFormData & { unitPlanId: string };
  }

  // Check if lesson is complete
  static isComplete(lesson: ETFOLessonPlan): boolean {
    return !!(
      lesson.title &&
      lesson.learningGoals &&
      lesson.mindsOn &&
      lesson.action &&
      lesson.consolidation &&
      lesson.materials &&
      lesson.materials.length > 0
    );
  }

  // Get assessment type badge color
  static getAssessmentBadgeColor(type: string): string {
    switch (type) {
      case 'diagnostic':
        return 'bg-blue-100 text-blue-800';
      case 'formative':
        return 'bg-green-100 text-green-800';
      case 'summative':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Generate substitute teacher summary
  static generateSubSummary(lesson: ETFOLessonPlan): string {
    if (!lesson.isSubFriendly) return '';

    let summary = `**Substitute Teacher Information**\n\n`;
    summary += `Lesson: ${lesson.title}\n`;
    summary += `Duration: ${lesson.duration} minutes\n`;
    summary += `Grouping: ${lesson.grouping}\n\n`;

    if (lesson.subNotes) {
      summary += `Special Notes:\n${lesson.subNotes}\n\n`;
    }

    summary += `Materials (all should be prepared):\n`;
    lesson.materials?.forEach((material: string) => {
      summary += `- ${material}\n`;
    });

    return summary;
  }

  // Check if lesson is ready for teaching
  static isReadyForTeaching(lesson: ETFOLessonPlan): boolean {
    const requiredFields = [
      'title',
      'date',
      'duration',
      'learningGoals',
      'mindsOn',
      'action',
      'consolidation',
      'materials',
    ];

    return requiredFields.every((field) => {
      const value = lesson[field];
      if (Array.isArray(value)) {
        return value.length > 0 && value.some((item) => item.trim());
      }
      return value && value.toString().trim();
    });
  }
}
