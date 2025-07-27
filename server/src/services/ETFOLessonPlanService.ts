import type { Prisma, PrismaClient } from '@prisma/client';

import { logger } from '../logger';
import type { ETFOLessonPlanRepository } from '../repositories/ETFOLessonPlanRepository';
import { RepositoryFactory } from '../repositories/RepositoryFactory';

import { BaseService } from './base/BaseService';

export interface ETFOLessonPlanCreateData {
  title: string;
  titleFr?: string;
  unitPlanId: string;
  date: string;
  duration: number;
  mindsOn?: string;
  mindsOnFr?: string;
  action?: string;
  actionFr?: string;
  consolidation?: string;
  consolidationFr?: string;
  learningGoals?: string;
  learningGoalsFr?: string;
  materials?: string[];
  grouping?: string;
  accommodations?: string[];
  modifications?: string[];
  extensions?: string[];
  assessmentType?: 'diagnostic' | 'formative' | 'summative';
  assessmentNotes?: string;
  isSubFriendly?: boolean;
  subNotes?: string;
  expectationIds?: number[];
  userId: number;
}

export type ETFOLessonPlanUpdateData = Partial<Omit<ETFOLessonPlanCreateData, 'unitPlanId' | 'userId'>>

export interface ETFOLessonPlanWithRelations {
  id: string;
  title: string;
  titleFr?: string | null;
  unitPlanId: string;
  date: Date;
  duration: number;
  mindsOn?: string | null;
  mindsOnFr?: string | null;
  action?: string | null;
  actionFr?: string | null;
  consolidation?: string | null;
  consolidationFr?: string | null;
  learningGoals?: string | null;
  learningGoalsFr?: string | null;
  materials?: string[];
  grouping?: string | null;
  accommodations?: string[];
  modifications?: string[];
  extensions?: string[];
  assessmentType?: 'diagnostic' | 'formative' | 'summative' | null;
  assessmentNotes?: string | null;
  isSubFriendly?: boolean | null;
  subNotes?: string | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  unitPlan?: {
    id: string;
    title: string;
    longRangePlan?: {
      subject: string;
    } | null;
  } | null;
  expectations?: Array<{
    id: string;
    expectationId: number;
  }>;
}

export interface ETFOLessonPlanListResponse {
  plans: ETFOLessonPlanWithRelations[];
  total: number;
  pagination: {
    skip: number;
    take: number;
    hasMore: boolean;
  };
}

export interface ETFOLessonPlanSearchResult {
  plans: ETFOLessonPlanWithRelations[];
  total: number;
  searchTerm: string;
  pagination: {
    skip: number;
    take: number;
    hasMore: boolean;
  };
}

export interface ETFOLessonPlanFilters {
  unitPlanId?: string;
  startDate?: string;
  endDate?: string;
  isSubFriendly?: boolean;
  assessmentType?: 'diagnostic' | 'formative' | 'summative';
  hasExpectations?: boolean;
}

export class ETFOLessonPlanService extends BaseService {
  private repository: ETFOLessonPlanRepository;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super('ETFOLessonPlanService');
    this.prisma = prisma;
    this.repository = RepositoryFactory.getInstance(prisma).getETFOLessonPlanRepository();
  }

  async findByUser(
    userId: number,
    filters: ETFOLessonPlanFilters = {},
    pagination: { skip?: number; take?: number } = {},
  ): Promise<ETFOLessonPlanListResponse> {
    try {
      const where: Prisma.ETFOLessonPlanWhereInput = {
        userId,
      };

      if (filters.unitPlanId !== null && filters.unitPlanId !== '') {
        where.unitPlanId = filters.unitPlanId;
      }

      if ((filters.startDate !== null && filters.startDate !== '') || (filters.endDate !== null && filters.endDate !== '')) {
        where.date = {};
        if (filters.startDate !== null && filters.startDate !== '') {
          where.date.gte = new Date(filters.startDate);
        }
        if (filters.endDate !== null && filters.endDate !== '') {
          where.date.lte = new Date(filters.endDate);
        }
      }

      if (filters.isSubFriendly !== undefined) {
        where.isSubFriendly = filters.isSubFriendly;
      }

      if (filters.assessmentType !== null && filters.assessmentType !== '') {
        where.assessmentType = filters.assessmentType;
      }

      if (filters.hasExpectations === true) {
        where.expectations = {
          some: {},
        };
      } else if (filters.hasExpectations === false) {
        where.expectations = {
          none: {},
        };
      }

      const result = await this.repository.findByUserId(userId, {
        includeRelations: true,
        skip: pagination.skip || 0,
        take: pagination.take || 20,
      });

      return result;
    } catch (error) {
      logger.error('Error finding ETFO lesson plans:', error);
      throw error;
    }
  }

  async findById(id: string, userId: number): Promise<ETFOLessonPlanWithRelations | null> {
    try {
      const plan = await this.repository.findByIdWithRelations(id);

      if (plan === null || plan.userId !== userId) {
        return null;
      }

      return plan;
    } catch (error) {
      logger.error('Error finding ETFO lesson plan by id:', error);
      throw error;
    }
  }

  async create(data: ETFOLessonPlanCreateData, userId: number): Promise<ETFOLessonPlanWithRelations> {
    try {
      const { expectationIds = [], ...planData } = data;

      // Verify unit plan belongs to user
      const unitPlan = await this.prisma.unitPlan.findFirst({
        where: {
          id: data.unitPlanId,
          userId,
        },
      });

      if (unitPlan === null) {
        throw new Error('Unit plan not found or unauthorized');
      }

      const plan = await this.repository.createWithExpectations(
        {
          ...planData,
          date: new Date(planData.date),
          user: {
            connect: { id: userId },
          },
          unitPlan: {
            connect: { id: planData.unitPlanId },
          },
        },
        expectationIds.map((id) => String(id)),
      );

      return plan;
    } catch (error) {
      logger.error('Error creating ETFO lesson plan:', error);
      throw error;
    }
  }

  async update(id: string, userId: number, data: ETFOLessonPlanUpdateData): Promise<ETFOLessonPlanWithRelations> {
    try {
      // Verify ownership
      const existingPlan = await this.repository.findById(id);
      if (existingPlan === null || existingPlan.userId !== userId) {
        throw new Error('Lesson plan not found or unauthorized');
      }

      const { expectationIds, ...updateData } = data;

      const updatedPlan = await this.repository.updateWithExpectations(
        id,
        {
          ...updateData,
          date: data.date !== null && data.date !== '' ? new Date(data.date) : undefined,
        },
        (expectationIds ?? []).map((id) => String(id)),
      );

      return updatedPlan;
    } catch (error) {
      logger.error('Error updating ETFO lesson plan:', error);
      throw error;
    }
  }

  async delete(id: string, userId: number): Promise<void> {
    try {
      // Verify ownership
      const existingPlan = await this.repository.findById(id);
      if (existingPlan === null || existingPlan.userId !== userId) {
        throw new Error('Lesson plan not found or unauthorized');
      }

      await this.repository.delete(id);
    } catch (error) {
      logger.error('Error deleting ETFO lesson plan:', error);
      throw error;
    }
  }

  async duplicate(id: string, userId: number): Promise<ETFOLessonPlanWithRelations> {
    try {
      // Get the original plan
      const originalPlan = await this.repository.findByIdWithRelations(id);
      if (originalPlan === null || originalPlan.userId !== userId) {
        throw new Error('Lesson plan not found or unauthorized');
      }

      // Extract expectation IDs if they exist
      const expectationIds = originalPlan.expectations.map((exp) => exp.expectationId) ?? [];

      // Create minimal duplicate data with only the essential fields
      const createData = {
        userId,
        unitPlanId: originalPlan.unitPlanId,
        title: `${originalPlan.title} (Copy)`,
        date: originalPlan.date.toISOString(),
        duration: originalPlan.duration,
        language: originalPlan.language ?? undefined,
        subject: originalPlan.subject ?? undefined,
        grade: originalPlan.grade,
        titleFr: originalPlan.titleFr ?? undefined,
        mindsOn: originalPlan.mindsOn ?? undefined,
        action: originalPlan.action ?? undefined,
        consolidation: originalPlan.consolidation ?? undefined,
        learningGoals: originalPlan.learningGoals ?? undefined,
        materials: Array.isArray(originalPlan.materials)
          ? (originalPlan.materials as string[])
          : undefined,
        grouping: originalPlan.grouping ?? undefined,
        mindsOnFr: originalPlan.mindsOnFr ?? undefined,
        actionFr: originalPlan.actionFr ?? undefined,
        consolidationFr: originalPlan.consolidationFr ?? undefined,
        expectationIds: expectationIds.map((id) => parseInt(id, 10)),
      };

      return await this.create(createData, userId);
    } catch (error) {
      logger.error('Error duplicating ETFO lesson plan:', error);
      throw error;
    }
  }

  async search(
    userId: number,
    searchTerm: string,
    pagination: { skip?: number; take?: number } = {},
  ): Promise<ETFOLessonPlanSearchResult> {
    try {
      const plans = await this.repository.searchByContent(userId, searchTerm, pagination);
      return plans;
    } catch (error) {
      logger.error('Error searching ETFO lesson plans:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth(): Promise<{ healthy: boolean; details: Record<string, unknown> }> {
    try {
      const count = await this.repository.count();
      return {
        healthy: true,
        details: {
          totalPlans: count,
          repositoryStatus: 'connected',
        },
      };
    } catch (error) {
      return {
        healthy: false,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
