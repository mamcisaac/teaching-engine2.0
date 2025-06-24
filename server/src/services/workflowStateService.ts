import BaseService from './base/BaseService';
import { prisma } from '../prisma';

export interface WorkflowState {
  userId: number;
  currentLevel: ETFOLevel;
  completedLevels: ETFOLevel[];
  accessibleLevels: ETFOLevel[];
  blockedLevels: ETFOLevel[];
  progress: LevelProgress[];
}

export interface LevelProgress {
  level: ETFOLevel;
  isComplete: boolean;
  isAccessible: boolean;
  progressPercentage: number;
  completedItems: number;
  totalItems: number;
  blockedReason?: string;
}

export enum ETFOLevel {
  CURRICULUM_EXPECTATIONS = 'CURRICULUM_EXPECTATIONS',
  LONG_RANGE_PLANS = 'LONG_RANGE_PLANS',
  UNIT_PLANS = 'UNIT_PLANS',
  LESSON_PLANS = 'LESSON_PLANS',
  DAYBOOK_ENTRIES = 'DAYBOOK_ENTRIES',
}

export const ETFO_LEVEL_SEQUENCE = [
  ETFOLevel.CURRICULUM_EXPECTATIONS,
  ETFOLevel.LONG_RANGE_PLANS,
  ETFOLevel.UNIT_PLANS,
  ETFOLevel.LESSON_PLANS,
  ETFOLevel.DAYBOOK_ENTRIES,
];

export const ETFO_LEVEL_METADATA = {
  [ETFOLevel.CURRICULUM_EXPECTATIONS]: {
    name: 'Curriculum Expectations',
    description: 'Import and organize curriculum standards',
    requiredFields: ['code', 'description', 'strand'],
    completionCriteria: 'At least one curriculum expectation imported',
  },
  [ETFOLevel.LONG_RANGE_PLANS]: {
    name: 'Long-Range Plans',
    description: 'Create year/term overview with major units',
    requiredFields: ['title', 'startDate', 'endDate', 'goals'],
    completionCriteria: 'At least one long-range plan with goals defined',
  },
  [ETFOLevel.UNIT_PLANS]: {
    name: 'Unit Plans',
    description: 'Develop detailed instructional units',
    requiredFields: ['title', 'bigIdeas', 'learningGoals', 'curriculumExpectations'],
    completionCriteria: 'At least one unit plan with big ideas and linked expectations',
  },
  [ETFOLevel.LESSON_PLANS]: {
    name: 'Lesson Plans',
    description: 'Plan individual teaching sessions',
    requiredFields: ['title', 'learningGoals', 'materials', 'activities'],
    completionCriteria: 'At least one lesson plan with complete details',
  },
  [ETFOLevel.DAYBOOK_ENTRIES]: {
    name: 'Daybook Entries',
    description: 'Maintain daily planning records',
    requiredFields: ['date', 'activities', 'reflections'],
    completionCriteria: 'At least one daybook entry with reflections',
  },
};

export class WorkflowStateService extends BaseService {
  constructor() {
    super('WorkflowStateService');
  }

  /**
   * Get the current workflow state for a user
   */
  async getUserWorkflowState(userId: number): Promise<WorkflowState> {
    try {
      const progress = await this.calculateAllLevelProgress(userId);
      const completedLevels = this.getCompletedLevels(progress);
      const currentLevel = this.getCurrentLevel(progress);
      const accessibleLevels = this.getAccessibleLevels(progress);
      const blockedLevels = this.getBlockedLevels(progress);

      return {
        userId,
        currentLevel,
        completedLevels,
        accessibleLevels,
        blockedLevels,
        progress,
      };
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to get user workflow state');
      throw error;
    }
  }

  /**
   * Check if a user can access a specific level
   */
  async canAccessLevel(
    userId: number,
    level: ETFOLevel,
  ): Promise<{ canAccess: boolean; reason?: string }> {
    try {
      const levelIndex = ETFO_LEVEL_SEQUENCE.indexOf(level);

      // First level is always accessible
      if (levelIndex === 0) {
        return { canAccess: true };
      }

      // Check if all previous levels are complete
      for (let i = 0; i < levelIndex; i++) {
        const previousLevel = ETFO_LEVEL_SEQUENCE[i];
        const isComplete = await this.isLevelComplete(userId, previousLevel);

        if (!isComplete) {
          return {
            canAccess: false,
            reason: `Must complete ${ETFO_LEVEL_METADATA[previousLevel].name} first`,
          };
        }
      }

      return { canAccess: true };
    } catch (error) {
      this.logger.error({ error, userId, level }, 'Failed to check level access');
      return { canAccess: false, reason: 'Error checking access permissions' };
    }
  }

  /**
   * Calculate progress for all levels
   */
  private async calculateAllLevelProgress(userId: number): Promise<LevelProgress[]> {
    const progress: LevelProgress[] = [];

    for (const level of ETFO_LEVEL_SEQUENCE) {
      const levelProgress = await this.calculateLevelProgress(userId, level);
      progress.push(levelProgress);
    }

    return progress;
  }

  /**
   * Calculate progress for a specific level
   */
  private async calculateLevelProgress(userId: number, level: ETFOLevel): Promise<LevelProgress> {
    switch (level) {
      case ETFOLevel.CURRICULUM_EXPECTATIONS:
        return this.calculateCurriculumProgress(userId);
      case ETFOLevel.LONG_RANGE_PLANS:
        return this.calculateLongRangeProgress(userId);
      case ETFOLevel.UNIT_PLANS:
        return this.calculateUnitProgress(userId);
      case ETFOLevel.LESSON_PLANS:
        return this.calculateLessonProgress(userId);
      case ETFOLevel.DAYBOOK_ENTRIES:
        return this.calculateDaybookProgress(userId);
      default:
        throw new Error(`Unknown level: ${level}`);
    }
  }

  private async calculateCurriculumProgress(userId: number): Promise<LevelProgress> {
    const total = await prisma.curriculumExpectation.count({
      where: {
        import: { userId },
      },
    });

    return {
      level: ETFOLevel.CURRICULUM_EXPECTATIONS,
      isComplete: total > 0,
      isAccessible: true,
      progressPercentage: total > 0 ? 100 : 0,
      completedItems: total,
      totalItems: Math.max(total, 1), // At least 1 to avoid division by zero
    };
  }

  private async calculateLongRangeProgress(userId: number): Promise<LevelProgress> {
    const total = await prisma.longRangePlan.count({ where: { userId } });
    const completed = await prisma.longRangePlan.count({
      where: {
        userId,
        goals: { not: null },
      },
    });

    const isAccessible = await this.isLevelComplete(userId, ETFOLevel.CURRICULUM_EXPECTATIONS);

    return {
      level: ETFOLevel.LONG_RANGE_PLANS,
      isComplete: completed > 0,
      isAccessible,
      progressPercentage: total > 0 ? (completed / total) * 100 : 0,
      completedItems: completed,
      totalItems: Math.max(total, 1),
      blockedReason: !isAccessible ? 'Complete Curriculum Expectations first' : undefined,
    };
  }

  private async calculateUnitProgress(userId: number): Promise<LevelProgress> {
    const total = await prisma.unitPlan.count({ where: { userId } });
    const completed = await prisma.unitPlan.count({
      where: {
        userId,
        bigIdeas: { not: null },
        expectations: {
          some: {},
        },
      },
    });

    const isAccessible = await this.isLevelComplete(userId, ETFOLevel.LONG_RANGE_PLANS);

    return {
      level: ETFOLevel.UNIT_PLANS,
      isComplete: completed > 0,
      isAccessible,
      progressPercentage: total > 0 ? (completed / total) * 100 : 0,
      completedItems: completed,
      totalItems: Math.max(total, 1),
      blockedReason: !isAccessible ? 'Complete Long-Range Plans first' : undefined,
    };
  }

  private async calculateLessonProgress(userId: number): Promise<LevelProgress> {
    const total = await prisma.eTFOLessonPlan.count({ where: { userId } });
    const completed = await prisma.eTFOLessonPlan.count({
      where: {
        userId,
        learningGoals: { not: null },
        materials: { not: null },
      },
    });

    const isAccessible = await this.isLevelComplete(userId, ETFOLevel.UNIT_PLANS);

    return {
      level: ETFOLevel.LESSON_PLANS,
      isComplete: completed > 0,
      isAccessible,
      progressPercentage: total > 0 ? (completed / total) * 100 : 0,
      completedItems: completed,
      totalItems: Math.max(total, 1),
      blockedReason: !isAccessible ? 'Complete Unit Plans first' : undefined,
    };
  }

  private async calculateDaybookProgress(userId: number): Promise<LevelProgress> {
    const total = await prisma.daybookEntry.count({ where: { userId } });
    const completed = await prisma.daybookEntry.count({
      where: {
        userId,
        whatWorked: { not: null },
      },
    });

    const isAccessible = await this.isLevelComplete(userId, ETFOLevel.LESSON_PLANS);

    return {
      level: ETFOLevel.DAYBOOK_ENTRIES,
      isComplete: completed > 0,
      isAccessible,
      progressPercentage: total > 0 ? (completed / total) * 100 : 0,
      completedItems: completed,
      totalItems: Math.max(total, 1),
      blockedReason: !isAccessible ? 'Complete Lesson Plans first' : undefined,
    };
  }

  private async isLevelComplete(userId: number, level: ETFOLevel): Promise<boolean> {
    const progress = await this.calculateLevelProgress(userId, level);
    return progress.isComplete;
  }

  private getCompletedLevels(progress: LevelProgress[]): ETFOLevel[] {
    return progress.filter((p) => p.isComplete).map((p) => p.level);
  }

  private getCurrentLevel(progress: LevelProgress[]): ETFOLevel {
    // Find the first incomplete but accessible level
    const current = progress.find((p) => !p.isComplete && p.isAccessible);
    if (current) return current.level;

    // If all accessible levels are complete, return the last completed level
    const lastCompleted = progress.filter((p) => p.isComplete).pop();
    if (lastCompleted) return lastCompleted.level;

    // Default to first level
    return ETFOLevel.CURRICULUM_EXPECTATIONS;
  }

  private getAccessibleLevels(progress: LevelProgress[]): ETFOLevel[] {
    return progress.filter((p) => p.isAccessible).map((p) => p.level);
  }

  private getBlockedLevels(progress: LevelProgress[]): ETFOLevel[] {
    return progress.filter((p) => !p.isAccessible).map((p) => p.level);
  }

  /**
   * Validate that a level has all required fields completed
   */
  async validateLevelCompletion(
    userId: number,
    level: ETFOLevel,
    entityId: string,
  ): Promise<{ isValid: boolean; missingFields: string[] }> {
    const _metadata = ETFO_LEVEL_METADATA[level];
    const missingFields: string[] = [];

    try {
      switch (level) {
        case ETFOLevel.CURRICULUM_EXPECTATIONS: {
          const expectation = await prisma.curriculumExpectation.findUnique({
            where: { id: entityId },
          });
          if (!expectation) return { isValid: false, missingFields: ['entity not found'] };

          if (!expectation.code) missingFields.push('code');
          if (!expectation.description) missingFields.push('description');
          if (!expectation.strand) missingFields.push('strand');
          break;
        }

        case ETFOLevel.LONG_RANGE_PLANS: {
          const lrp = await prisma.longRangePlan.findUnique({
            where: { id: entityId },
          });
          if (!lrp) return { isValid: false, missingFields: ['entity not found'] };

          if (!lrp.title) missingFields.push('title');
          // Long-range plans don't have specific start/end dates, they span the academic year
          if (!lrp.goals) missingFields.push('goals');
          break;
        }

        case ETFOLevel.UNIT_PLANS: {
          const unit = await prisma.unitPlan.findUnique({
            where: { id: entityId },
            include: { expectations: true },
          });
          if (!unit) return { isValid: false, missingFields: ['entity not found'] };

          if (!unit.title) missingFields.push('title');
          if (!unit.bigIdeas) missingFields.push('bigIdeas');
          // learningGoals is not a field on UnitPlan, it's on ETFOLessonPlan
          if (unit.expectations.length === 0) missingFields.push('expectations');
          break;
        }

        case ETFOLevel.LESSON_PLANS: {
          const lesson = await prisma.eTFOLessonPlan.findUnique({
            where: { id: entityId },
          });
          if (!lesson) return { isValid: false, missingFields: ['entity not found'] };

          if (!lesson.title) missingFields.push('title');
          if (!lesson.learningGoals) missingFields.push('learningGoals');
          if (!lesson.materials) missingFields.push('materials');
          // activities is not a field on ETFOLessonPlan
          break;
        }

        case ETFOLevel.DAYBOOK_ENTRIES: {
          const daybook = await prisma.daybookEntry.findUnique({
            where: { id: entityId },
          });
          if (!daybook) return { isValid: false, missingFields: ['entity not found'] };

          if (!daybook.date) missingFields.push('date');
          // activities is not a field on DaybookEntry
          if (!daybook.whatWorked && !daybook.whatDidntWork) missingFields.push('reflections');
          break;
        }
      }

      return {
        isValid: missingFields.length === 0,
        missingFields,
      };
    } catch (error) {
      this.logger.error({ error, userId, level, entityId }, 'Failed to validate level completion');
      return { isValid: false, missingFields: ['validation error'] };
    }
  }
}

export const workflowStateService = new WorkflowStateService();
