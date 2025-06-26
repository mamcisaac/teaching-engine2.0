import { UnitPlan } from '../hooks/useETFOPlanning';
import { UnitPlanFormData } from '../hooks/useUnitPlanForm';

// Business logic for unit plans
export class UnitPlanService {
  // Calculate progress percentage
  static calculateProgress(unit: UnitPlan): number {
    if (!unit._count?.lessonPlans || unit._count.lessonPlans === 0) {
      return 0;
    }

    const completedLessons =
      unit.lessonPlans?.filter((lesson) => lesson.daybookEntry !== null).length || 0;

    return Math.round((completedLessons / unit._count.lessonPlans) * 100);
  }

  // Validate date range
  static validateDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }

  // Calculate estimated weeks
  static calculateEstimatedWeeks(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  }

  // Format unit plan for export
  static formatForExport(unit: UnitPlan): string {
    let content = `# ${unit.title}\n\n`;

    if (unit.description) {
      content += `## Description\n${unit.description}\n\n`;
    }

    if (unit.bigIdeas) {
      content += `## Big Ideas\n${unit.bigIdeas}\n\n`;
    }

    if (unit.essentialQuestions && unit.essentialQuestions.length > 0) {
      content += `## Essential Questions\n`;
      unit.essentialQuestions.forEach((q) => {
        content += `- ${q}\n`;
      });
      content += '\n';
    }

    if (unit.successCriteria && unit.successCriteria.length > 0) {
      content += `## Success Criteria\n`;
      unit.successCriteria.forEach((c) => {
        content += `- ${c}\n`;
      });
      content += '\n';
    }

    return content;
  }

  // Prepare form data for submission
  static prepareFormData(data: UnitPlanFormData): UnitPlanFormData {
    return {
      ...data,
      essentialQuestions: data.essentialQuestions.filter((q) => q.trim()),
      successCriteria: data.successCriteria.filter((c) => c.trim()),
      keyVocabulary: data.keyVocabulary.filter((v) => v.trim()),
      differentiationStrategies: {
        forStruggling: data.differentiationStrategies.forStruggling.filter((s) => s.trim()),
        forAdvanced: data.differentiationStrategies.forAdvanced.filter((s) => s.trim()),
        forELL: data.differentiationStrategies.forELL.filter((s) => s.trim()),
        forIEP: data.differentiationStrategies.forIEP.filter((s) => s.trim()),
      },
    };
  }

  // Check if unit is complete
  static isComplete(unit: UnitPlan): boolean {
    return !!(
      unit.title &&
      unit.bigIdeas &&
      unit.essentialQuestions &&
      unit.essentialQuestions.length > 0 &&
      unit.successCriteria &&
      unit.successCriteria.length > 0 &&
      unit.assessmentPlan &&
      unit.expectations &&
      unit.expectations.length > 0
    );
  }

  // Get status color
  static getStatusColor(unit: UnitPlan): string {
    const progress = unit.progress?.percentage || 0;
    if (progress === 100) return 'text-green-600';
    if (progress > 50) return 'text-yellow-600';
    if (progress > 0) return 'text-orange-600';
    return 'text-gray-600';
  }

  // Generate summary
  static generateSummary(unit: UnitPlan): string {
    const weeks = this.calculateEstimatedWeeks(unit.startDate, unit.endDate);
    const lessonCount = unit._count?.lessonPlans || 0;
    const expectationCount = unit._count?.expectations || 0;

    return `${weeks} weeks • ${lessonCount} lessons • ${expectationCount} expectations`;
  }
}
