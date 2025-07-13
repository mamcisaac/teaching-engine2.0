import type { ETFOLessonPlan, Prisma, PrismaClient } from '@prisma/client';

import logger from '../logger';

export interface ETFOLessonPlanWithRelations extends ETFOLessonPlan {
  unitPlan?: {
    id: string;
    title: string;
    longRangePlan?: {
      id: string;
      title: string;
      subject: string;
      grade: number;
    };
  };
  expectations?: {
    lessonPlanId: string;
    expectationId: string;
    expectation: {
      code: string;
      description: string;
      strand: string;
      substrand?: string | null;
    };
  }[];
  resources?: {
    id: string;
    title: string;
    url?: string | null;
    type: string;
    content?: string | null;
  }[];
}

export class ETFOLessonPlanRepository {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: string): Promise<ETFOLessonPlan | null> {
    try {
      const result = await this.prisma.eTFOLessonPlan.findUnique({
        where: { id },
      });
      return result;
    } catch (error) {
      logger.error('Error finding ETFO lesson plan by id:', error);
      throw error;
    }
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
      const { includeRelations = false, skip = 0, take = 20 } = options ?? {};

      const plans = await this.prisma.eTFOLessonPlan.findMany({
        where: { userId },
        include: includeRelations
          ? {
              unitPlan: {
                select: {
                  id: true,
                  title: true,
                  longRangePlan: {
                    select: {
                      id: true,
                      title: true,
                      subject: true,
                      grade: true,
                    },
                  },
                },
              },
              expectations: {
                select: {
                  lessonPlanId: true,
                  expectationId: true,
                  expectation: {
                    select: {
                      code: true,
                      description: true,
                      strand: true,
                      substrand: true,
                    },
                  },
                },
              },
              resources: {
                select: {
                  id: true,
                  title: true,
                  url: true,
                  type: true,
                  content: true,
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

  async findByIdWithRelations(id: string): Promise<ETFOLessonPlanWithRelations | null> {
    try {
      const plan = await this.prisma.eTFOLessonPlan.findUnique({
        where: { id },
        include: {
          unitPlan: {
            select: {
              id: true,
              title: true,
              longRangePlan: {
                select: {
                  id: true,
                  title: true,
                  subject: true,
                  grade: true,
                },
              },
            },
          },
          expectations: {
            select: {
              lessonPlanId: true,
              expectationId: true,
              expectation: {
                select: {
                  code: true,
                  description: true,
                  strand: true,
                  substrand: true,
                },
              },
            },
          },
          resources: {
            select: {
              id: true,
              title: true,
              url: true,
              type: true,
              content: true,
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
    expectationIds: string[],
  ): Promise<ETFOLessonPlanWithRelations> {
    try {
      const plan = await this.prisma.$transaction(
        async (
          tx: Omit<
            PrismaClient,
            '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
          >,
        ) => {
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
              unitPlan: {
                select: {
                  id: true,
                  title: true,
                  longRangePlan: {
                    select: {
                      id: true,
                      title: true,
                      subject: true,
                      grade: true,
                    },
                  },
                },
              },
              expectations: {
                select: {
                  lessonPlanId: true,
                  expectationId: true,
                  expectation: {
                    select: {
                      code: true,
                      description: true,
                      strand: true,
                      substrand: true,
                    },
                  },
                },
              },
              resources: {
                select: {
                  id: true,
                  title: true,
                  url: true,
                  type: true,
                  content: true,
                },
              },
            },
          });
        },
      );

      if (!plan) {
        throw new Error('Failed to retrieve created ETFO lesson plan');
      }
      
      logger.info(`Created ETFO lesson plan with id: ${plan.id}`);
      return plan;
    } catch (error) {
      logger.error('Error creating ETFO lesson plan with expectations:', error);
      throw error;
    }
  }

  async update(id: string, data: Prisma.ETFOLessonPlanUpdateInput): Promise<ETFOLessonPlan> {
    try {
      const result = await this.prisma.eTFOLessonPlan.update({
        where: { id },
        data,
      });
      logger.info(`Updated ETFO lesson plan with id: ${id}`);
      return result;
    } catch (error) {
      logger.error('Error updating ETFO lesson plan:', error);
      throw error;
    }
  }

  async updateWithExpectations(
    id: string,
    data: Prisma.ETFOLessonPlanUpdateInput,
    expectationIds?: string[],
  ): Promise<ETFOLessonPlanWithRelations> {
    try {
      const plan = await this.prisma.$transaction(
        async (
          tx: Omit<
            PrismaClient,
            '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
          >,
        ) => {
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
              unitPlan: {
                select: {
                  id: true,
                  title: true,
                  longRangePlan: {
                    select: {
                      id: true,
                      title: true,
                      subject: true,
                      grade: true,
                    },
                  },
                },
              },
              expectations: {
                select: {
                  lessonPlanId: true,
                  expectationId: true,
                  expectation: {
                    select: {
                      code: true,
                      description: true,
                      strand: true,
                      substrand: true,
                    },
                  },
                },
              },
              resources: {
                select: {
                  id: true,
                  title: true,
                  url: true,
                  type: true,
                  content: true,
                },
              },
            },
          });
        },
      );

      logger.info(`Updated ETFO lesson plan with id: ${id}`);
      
      if (!plan) {
        throw new Error('Failed to retrieve updated ETFO lesson plan');
      }
      
      return plan;
    } catch (error) {
      logger.error('Error updating ETFO lesson plan with expectations:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<ETFOLessonPlan> {
    try {
      const result = await this.prisma.eTFOLessonPlan.delete({
        where: { id },
      });
      logger.info(`Deleted ETFO lesson plan with id: ${id}`);
      return result;
    } catch (error) {
      logger.error('Error deleting ETFO lesson plan:', error);
      throw error;
    }
  }

  async count(where?: Prisma.ETFOLessonPlanWhereInput): Promise<number> {
    try {
      const result = await this.prisma.eTFOLessonPlan.count({ where });
      return result;
    } catch (error) {
      logger.error('Error counting ETFO lesson plans:', error);
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
      const { skip = 0, take = 20 } = options ?? {};

      const plans = await this.prisma.eTFOLessonPlan.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: searchTerm } },
            { mindsOn: { contains: searchTerm } },
            { action: { contains: searchTerm } },
            { consolidation: { contains: searchTerm } },
            { learningGoals: { contains: searchTerm } },
          ],
        },
        include: {
          expectations: {
            select: {
              lessonPlanId: true,
              expectationId: true,
              expectation: {
                select: {
                  code: true,
                  description: true,
                  strand: true,
                  substrand: true,
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
}
