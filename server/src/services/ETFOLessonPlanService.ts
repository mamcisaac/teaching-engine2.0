import { BaseService } from './base/BaseService';
import { ETFOLessonPlanRepository } from '../repositories/ETFOLessonPlanRepository';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { Prisma, PrismaClient } from '@prisma/client';
import logger from '../logger';

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

export interface ETFOLessonPlanUpdateData
  extends Partial<Omit<ETFOLessonPlanCreateData, 'unitPlanId' | 'userId'>> {}

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
  ) {
    try {
      const where: Prisma.ETFOLessonPlanWhereInput = {
        userId,
      };

      if (filters.unitPlanId) {
        where.unitPlanId = filters.unitPlanId;
      }

      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.date.lte = new Date(filters.endDate);
        }
      }

      if (filters.isSubFriendly !== undefined) {
        where.isSubFriendly = filters.isSubFriendly;
      }

      if (filters.assessmentType) {
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

      const result = await this.repository.findMany({
        where,
        include: {
          expectations: {
            include: {
              expectation: true,
            },
          },
        },
        pagination,
      });

      return result;
    } catch (error) {
      logger.error('Error finding ETFO lesson plans:', error);
      throw error;
    }
  }

  async findById(id: number, userId: number) {
    try {
      const plan = await this.repository.findByIdWithRelations(id);

      if (!plan || plan.userId !== userId) {
        return null;
      }

      return plan;
    } catch (error) {
      logger.error('Error finding ETFO lesson plan by id:', error);
      throw error;
    }
  }

  async create(data: ETFOLessonPlanCreateData) {
    try {
      const { expectationIds = [], ...planData } = data;

      // Verify unit plan belongs to user
      const unitPlan = await this.prisma.unitPlan.findFirst({
        where: {
          id: planData.unitPlanId,
          userId: planData.userId,
        },
      });

      if (!unitPlan) {
        throw new Error('Unit plan not found or unauthorized');
      }

      const plan = await this.repository.createWithExpectations(
        {
          ...planData,
          date: new Date(planData.date),
          user: {
            connect: { id: planData.userId },
          },
          unitPlan: {
            connect: { id: planData.unitPlanId },
          },
        },
        expectationIds,
      );

      return plan;
    } catch (error) {
      logger.error('Error creating ETFO lesson plan:', error);
      throw error;
    }
  }

  async update(id: number, userId: number, data: ETFOLessonPlanUpdateData) {
    try {
      // Verify ownership
      const existingPlan = await this.repository.findById(id);
      if (!existingPlan || existingPlan.userId !== userId) {
        throw new Error('Lesson plan not found or unauthorized');
      }

      const { expectationIds, ...updateData } = data;

      const updatedPlan = await this.repository.updateWithExpectations(
        id,
        {
          ...updateData,
          date: updateData.date ? new Date(updateData.date) : undefined,
        },
        expectationIds,
      );

      return updatedPlan;
    } catch (error) {
      logger.error('Error updating ETFO lesson plan:', error);
      throw error;
    }
  }

  async delete(id: number, userId: number) {
    try {
      // Verify ownership
      const existingPlan = await this.repository.findById(id);
      if (!existingPlan || existingPlan.userId !== userId) {
        throw new Error('Lesson plan not found or unauthorized');
      }

      await this.repository.delete(id);
      return true;
    } catch (error) {
      logger.error('Error deleting ETFO lesson plan:', error);
      throw error;
    }
  }

  async duplicate(id: number, userId: number) {
    try {
      const plan = await this.repository.duplicatePlan(id, userId);
      return plan;
    } catch (error) {
      logger.error('Error duplicating ETFO lesson plan:', error);
      throw error;
    }
  }

  async search(
    userId: number,
    searchTerm: string,
    pagination: { skip?: number; take?: number } = {},
  ) {
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
