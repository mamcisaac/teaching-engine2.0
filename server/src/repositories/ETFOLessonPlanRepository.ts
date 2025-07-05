import { ETFOLessonPlan, Prisma } from '@prisma/client';
import { BaseRepository } from './base/BaseRepository';
import { logger } from '../utils/logger';

export interface ETFOLessonPlanWithRelations extends ETFOLessonPlan {
  user?: {
    id: number;
    name: string;
    email: string;
  };
  expectations?: {
    id: number;
    expectation: {
      id: number;
      expectation: string;
      subject: string;
      grade: string;
      strand: string;
    };
  }[];
}

export class ETFOLessonPlanRepository extends BaseRepository<
  ETFOLessonPlan,
  Prisma.ETFOLessonPlanCreateInput,
  Prisma.ETFOLessonPlanUpdateInput
> {
  constructor(prisma: Prisma.PrismaClient) {
    super(prisma, 'eTFOLessonPlan');
  }

  async findByUserId(
    userId: number,
    options?: {
      includeRelations?: boolean;
      skip?: number;
      take?: number;
    },
  ): Promise<ETFOLessonPlanWithRelations[]> {
    try {
      const { includeRelations = false, skip = 0, take = 20 } = options || {};

      const plans = await this.model.findMany({
        where: { userId },
        include: includeRelations
          ? {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              expectations: {
                include: {
                  expectation: {
                    select: {
                      id: true,
                      expectation: true,
                      subject: true,
                      grade: true,
                      strand: true,
                    },
                  },
                },
              },
            }
          : undefined,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      });

      return plans;
    } catch (error) {
      logger.error('Error finding ETFO lesson plans by user:', error);
      throw error;
    }
  }

  async findByIdWithRelations(id: number): Promise<ETFOLessonPlanWithRelations | null> {
    try {
      const plan = await this.model.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          expectations: {
            include: {
              expectation: {
                select: {
                  id: true,
                  expectation: true,
                  subject: true,
                  grade: true,
                  strand: true,
                },
              },
            },
          },
        },
      });

      return plan;
    } catch (error) {
      logger.error('Error finding ETFO lesson plan with relations:', error);
      throw error;
    }
  }

  async createWithExpectations(
    data: Prisma.ETFOLessonPlanCreateInput,
    expectationIds: number[],
  ): Promise<ETFOLessonPlanWithRelations> {
    try {
      const plan = await this.prisma.$transaction(async (tx) => {
        // Create the lesson plan
        const createdPlan = await tx.eTFOLessonPlan.create({
          data,
        });

        // Link expectations if provided
        if (expectationIds.length > 0) {
          await tx.eTFOLessonPlanExpectation.createMany({
            data: expectationIds.map((expectationId) => ({
              lessonPlanId: createdPlan.id,
              expectationId,
            })),
          });
        }

        // Return with relations
        return tx.eTFOLessonPlan.findUnique({
          where: { id: createdPlan.id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            expectations: {
              include: {
                expectation: {
                  select: {
                    id: true,
                    expectation: true,
                    subject: true,
                    grade: true,
                    strand: true,
                  },
                },
              },
            },
          },
        });
      });

      logger.info(`Created ETFO lesson plan with id: ${plan!.id}`);
      return plan!;
    } catch (error) {
      logger.error('Error creating ETFO lesson plan with expectations:', error);
      throw error;
    }
  }

  async updateWithExpectations(
    id: number,
    data: Prisma.ETFOLessonPlanUpdateInput,
    expectationIds?: number[],
  ): Promise<ETFOLessonPlanWithRelations> {
    try {
      const plan = await this.prisma.$transaction(async (tx) => {
        // Update the lesson plan
        await tx.eTFOLessonPlan.update({
          where: { id },
          data,
        });

        // Update expectations if provided
        if (expectationIds !== undefined) {
          // Remove existing expectations
          await tx.eTFOLessonPlanExpectation.deleteMany({
            where: { lessonPlanId: id },
          });

          // Add new expectations
          if (expectationIds.length > 0) {
            await tx.eTFOLessonPlanExpectation.createMany({
              data: expectationIds.map((expectationId) => ({
                lessonPlanId: id,
                expectationId,
              })),
            });
          }
        }

        // Return with relations
        return tx.eTFOLessonPlan.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            expectations: {
              include: {
                expectation: {
                  select: {
                    id: true,
                    expectation: true,
                    subject: true,
                    grade: true,
                    strand: true,
                  },
                },
              },
            },
          },
        });
      });

      logger.info(`Updated ETFO lesson plan with id: ${id}`);
      return plan!;
    } catch (error) {
      logger.error('Error updating ETFO lesson plan with expectations:', error);
      throw error;
    }
  }

  async searchByContent(
    userId: number,
    searchTerm: string,
    options?: {
      skip?: number;
      take?: number;
    },
  ): Promise<ETFOLessonPlanWithRelations[]> {
    try {
      const { skip = 0, take = 20 } = options || {};

      const plans = await this.model.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { threeBigIdeas: { contains: searchTerm, mode: 'insensitive' } },
            { overallExpectations: { contains: searchTerm, mode: 'insensitive' } },
            { specificExpectations: { contains: searchTerm, mode: 'insensitive' } },
            { lessonOverview: { contains: searchTerm, mode: 'insensitive' } },
            { assessmentStrategies: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          expectations: {
            include: {
              expectation: {
                select: {
                  id: true,
                  expectation: true,
                  subject: true,
                  grade: true,
                  strand: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      });

      return plans;
    } catch (error) {
      logger.error('Error searching ETFO lesson plans:', error);
      throw error;
    }
  }

  async duplicatePlan(id: number, userId: number): Promise<ETFOLessonPlanWithRelations> {
    try {
      const originalPlan = await this.findByIdWithRelations(id);

      if (!originalPlan) {
        throw new Error('Original plan not found');
      }

      const expectationIds = originalPlan.expectations?.map((e) => e.expectation.id) || [];

      const duplicatedPlan = await this.createWithExpectations(
        {
          ...originalPlan,
          id: undefined,
          userId,
          title: `${originalPlan.title} (Copy)`,
          createdAt: undefined,
          updatedAt: undefined,
        } as Prisma.ETFOLessonPlanCreateInput,
        expectationIds,
      );

      logger.info(`Duplicated ETFO lesson plan ${id} to ${duplicatedPlan.id}`);
      return duplicatedPlan;
    } catch (error) {
      logger.error('Error duplicating ETFO lesson plan:', error);
      throw error;
    }
  }
}
