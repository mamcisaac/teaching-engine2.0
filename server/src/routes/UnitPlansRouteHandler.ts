/**
 * Unit Plans Route Handler
 * Extends BaseRouteHandler with unit plan-specific business logic
 */

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { BaseRouteHandler, AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler.js';
import { BaseService } from '../services/base/BaseService.js';
import { commonValidations } from './base/validation.js';
import { prisma } from '../prisma.js';
import { Prisma } from '@teaching-engine/database';
import { optimizedIncludes, optimizedQueries, queryPerformance } from './optimizations/queryOptimizations.js';

// Unit plan-specific validation schemas
const unitPlanCreateSchema = z.object({
  title: commonValidations.title,
  titleFr: commonValidations.titleFr,
  longRangePlanId: z.string().cuid(),
  description: commonValidations.description,
  descriptionFr: commonValidations.descriptionFr,
  bigIdeas: z.string().max(2000).optional(),
  bigIdeasFr: z.string().max(2000).optional(),
  essentialQuestions: z.array(z.string().max(500)).max(20).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  estimatedHours: z.number().int().positive().max(1000).optional(),
  assessmentPlan: z.string().max(2000).optional(),
  successCriteria: z.array(z.string().max(500)).max(20).optional(),
  expectationIds: z
    .array(z.string().cuid())
    .max(50)
    .min(1, 'At least one curriculum expectation must be selected'),

  // ETFO-aligned planning fields
  crossCurricularConnections: z.string().max(1000).optional(),
  learningSkills: z.array(z.string().max(100)).max(10).optional(),
  culminatingTask: z.string().max(1000).optional(),
  keyVocabulary: z.array(z.string().max(100)).max(30).optional(),
  priorKnowledge: z.string().max(1000).optional(),
  parentCommunicationPlan: z.string().max(1000).optional(),
  fieldTripsAndGuestSpeakers: z.string().max(1000).optional(),
  differentiationStrategies: z
    .object({
      forStruggling: z.array(z.string().max(200)).max(10).optional(),
      forAdvanced: z.array(z.string().max(200)).max(10).optional(),
      forELL: z.array(z.string().max(200)).max(10).optional(),
      forIEP: z.array(z.string().max(200)).max(10).optional(),
    })
    .optional(),
  socialJusticeConnections: z.string().max(1000).optional(),
  technologyIntegration: z.string().max(1000).optional(),
  communityConnections: z.string().max(1000).optional(),
});

const unitPlanUpdateSchema = unitPlanCreateSchema.partial().omit({ longRangePlanId: true }).extend({
  // Allow null values for optional fields
  description: z.string().max(2000).nullable().optional(),
  descriptionFr: z.string().max(2000).nullable().optional(),
  bigIdeas: z.string().max(2000).nullable().optional(),
  bigIdeasFr: z.string().max(2000).nullable().optional(),
  assessmentPlan: z.string().max(2000).nullable().optional(),
  differentiationStrategies: z
    .object({
      forStruggling: z.array(z.string().max(200)).max(10).optional(),
      forAdvanced: z.array(z.string().max(200)).max(10).optional(),
      forELL: z.array(z.string().max(200)).max(10).optional(),
      forIEP: z.array(z.string().max(200)).max(10).optional(),
    })
    .nullable()
    .optional(),
  // Override expectationIds to allow empty array on updates
  expectationIds: z.array(z.string().cuid()).max(50).optional(),
});

const unitPlanQuerySchema = z.object({
  longRangePlanId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  subject: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['title', 'startDate', 'endDate', 'createdAt']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

const duplicateUnitPlanSchema = z.object({
  unitPlanId: z.string().cuid(),
  longRangePlanId: z.string().cuid(),
  title: z.string().min(1).max(255).optional(),
});

const resourceSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url().optional(),
  type: z.enum(['website', 'document', 'video', 'image', 'other']).default('other'),
  description: z.string().max(500).optional(),
});

// Unit plan service
class UnitPlanService extends BaseService {
  constructor() {
    super('UnitPlanService');
  }

  async findMany(filters: unknown, userId: number) {
    const {
      longRangePlanId,
      startDate,
      endDate,
      subject,
      search,
      limit,
      offset,
      sortBy,
      sortOrder,
    } = filters;

    const where: Prisma.UnitPlanWhereInput = {
      longRangePlan: { userId },
    };

    if (longRangePlanId) where.longRangePlanId = longRangePlanId;
    if (startDate) where.startDate = { gte: new Date(startDate) };
    if (endDate) where.endDate = { lte: new Date(endDate) };

    // Subject filtering through long range plan
    if (subject) {
      where.longRangePlan = {
        ...where.longRangePlan,
        subject: { contains: subject, mode: 'insensitive' },
      };
    }

    // Search functionality using optimized search utility
    if (search) {
      where.OR = [
        ...optimizedQueries.createSearchWhere(search, ['title', 'description', 'bigIdeas']).OR,
      ];
    }

    // Date range filtering
    const dateWhere = optimizedQueries.createDateRangeWhere('startDate', startDate, endDate);
    if (Object.keys(dateWhere).length > 0) {
      Object.assign(where, dateWhere);
    }

    // Sorting with validation
    const orderBy = queryPerformance.createOptimizedSort(
      sortBy,
      sortOrder,
      ['title', 'startDate', 'endDate', 'createdAt']
    );

    const result = await queryPerformance.monitorQuery(
      'unitPlan.findMany',
      () => optimizedQueries.paginatedQuery(
        prisma.unitPlan,
        where,
        {
          limit,
          offset,
          orderBy,
          include: optimizedIncludes.unitPlan,
        }
      )
    );

    const { items: unitPlans, total } = result;

    return {
      unitPlans,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async findById(id: string, userId: number) {
    return queryPerformance.monitorQuery(
      'unitPlan.findById',
      () => prisma.unitPlan.findFirst({
        where: {
          id,
          longRangePlan: { userId },
        },
        include: optimizedIncludes.unitPlan,
      })
    );
  }

  async create(data: unknown, userId: number) {
    // Verify user owns the long range plan
    const longRangePlan = await prisma.longRangePlan.findFirst({
      where: {
        id: data.longRangePlanId,
        userId,
      },
    });

    if (!longRangePlan) {
      throw new Error('Long range plan not found or access denied');
    }

    const { expectationIds, ...unitPlanData } = data;

    return prisma.unitPlan.create({
      data: {
        ...unitPlanData,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        expectations: expectationIds
          ? {
              create: expectationIds.map((expectationId: string) => ({
                expectationId,
              })),
            }
          : undefined,
      },
      include: {
        expectations: {
          include: {
            expectation: true,
          },
        },
      },
    });
  }

  async update(id: string, data: unknown, userId: number) {
    // Verify ownership
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        id,
        longRangePlan: { userId },
      },
    });

    if (!unitPlan) {
      throw new Error('Unit plan not found or access denied');
    }

    const { expectationIds, ...updateData } = data;

    // Handle date conversion
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    return prisma.unitPlan.update({
      where: { id },
      data: {
        ...updateData,
        ...(expectationIds && {
          expectations: {
            deleteMany: {},
            create: expectationIds.map((expectationId: string) => ({
              expectationId,
            })),
          },
        }),
      },
      include: {
        expectations: {
          include: {
            expectation: true,
          },
        },
      },
    });
  }

  async delete(id: string, userId: number): Promise<boolean> {
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        id,
        longRangePlan: { userId },
      },
    });

    if (!unitPlan) {
      return false;
    }

    await prisma.unitPlan.delete({
      where: { id },
    });

    return true;
  }

  async addResource(unitPlanId: string, resourceData: unknown, userId: number) {
    // Verify ownership
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        id: unitPlanId,
        longRangePlan: { userId },
      },
    });

    if (!unitPlan) {
      throw new Error('Unit plan not found or access denied');
    }

    return prisma.unitPlanResource.create({
      data: {
        ...resourceData,
        unitPlanId,
      },
    });
  }

  async removeResource(unitPlanId: string, resourceId: string, userId: number): Promise<boolean> {
    // Verify ownership through unit plan
    const resource = await prisma.unitPlanResource.findFirst({
      where: {
        id: resourceId,
        unitPlan: {
          id: unitPlanId,
          longRangePlan: { userId },
        },
      },
    });

    if (!resource) {
      return false;
    }

    await prisma.unitPlanResource.delete({
      where: { id: resourceId },
    });

    return true;
  }

  async duplicate(duplicateData: unknown, userId: number) {
    const { unitPlanId, longRangePlanId, title } = duplicateData;

    // Verify user owns both the source unit plan and target long range plan
    const [sourceUnitPlan, targetLongRangePlan] = await Promise.all([
      prisma.unitPlan.findFirst({
        where: {
          id: unitPlanId,
          longRangePlan: { userId },
        },
        include: {
          expectations: true,
          resources: true,
        },
      }),
      prisma.longRangePlan.findFirst({
        where: {
          id: longRangePlanId,
          userId,
        },
      }),
    ]);

    if (!sourceUnitPlan || !targetLongRangePlan) {
      throw new Error('Source unit plan or target long range plan not found');
    }

    return prisma.unitPlan.create({
      data: {
        title: title || `${sourceUnitPlan.title} (Copy)`,
        titleFr: sourceUnitPlan.titleFr,
        description: sourceUnitPlan.description,
        descriptionFr: sourceUnitPlan.descriptionFr,
        bigIdeas: sourceUnitPlan.bigIdeas,
        bigIdeasFr: sourceUnitPlan.bigIdeasFr,
        essentialQuestions: sourceUnitPlan.essentialQuestions,
        startDate: sourceUnitPlan.startDate,
        endDate: sourceUnitPlan.endDate,
        estimatedHours: sourceUnitPlan.estimatedHours,
        assessmentPlan: sourceUnitPlan.assessmentPlan,
        successCriteria: sourceUnitPlan.successCriteria,
        crossCurricularConnections: sourceUnitPlan.crossCurricularConnections,
        learningSkills: sourceUnitPlan.learningSkills,
        culminatingTask: sourceUnitPlan.culminatingTask,
        keyVocabulary: sourceUnitPlan.keyVocabulary,
        priorKnowledge: sourceUnitPlan.priorKnowledge,
        parentCommunicationPlan: sourceUnitPlan.parentCommunicationPlan,
        fieldTripsAndGuestSpeakers: sourceUnitPlan.fieldTripsAndGuestSpeakers,
        differentiationStrategies: sourceUnitPlan.differentiationStrategies,
        socialJusticeConnections: sourceUnitPlan.socialJusticeConnections,
        technologyIntegration: sourceUnitPlan.technologyIntegration,
        communityConnections: sourceUnitPlan.communityConnections,
        longRangePlanId: longRangePlanId,
        expectations: {
          create: sourceUnitPlan.expectations.map((exp) => ({
            expectationId: exp.expectationId,
          })),
        },
        resources: {
          create: sourceUnitPlan.resources.map((resource) => ({
            name: resource.name,
            url: resource.url,
            type: resource.type,
            description: resource.description,
          })),
        },
      },
    });
  }
}

export class UnitPlansRouteHandler extends BaseRouteHandler {
  private unitPlanService: UnitPlanService;

  constructor() {
    super({
      routeName: 'unit-plans',
      requireAuth: true,
    });
    this.unitPlanService = new UnitPlanService();
  }

  protected getService(): BaseService {
    return this.unitPlanService;
  }

  protected getValidationSchemas() {
    return {
      create: unitPlanCreateSchema,
      update: unitPlanUpdateSchema,
      query: unitPlanQuerySchema,
    };
  }

  protected getCrudOperations(): CrudOperations<unknown> {
    return {
      create: this.unitPlanService.create.bind(this.unitPlanService),
      findMany: this.unitPlanService.findMany.bind(this.unitPlanService),
      findById: this.unitPlanService.findById.bind(this.unitPlanService),
      update: this.unitPlanService.update.bind(this.unitPlanService),
      delete: this.unitPlanService.delete.bind(this.unitPlanService),
    };
  }

  protected async handleList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const schemas = this.getValidationSchemas();
      const filters = schemas.query.parse(req.query);
      
      const result = await this.unitPlanService.findMany(filters, userId);
      res.json(result);
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} list:`, _error);
      next(_error);
    }
  }

  protected setupCustomRoutes(): void {
    // POST /unit-plans/:id/resources
    this.router.post(
      '/:id/resources',
      this.requireAuthentication,
      this.asyncHandler(this.handleAddResource.bind(this))
    );

    // DELETE /unit-plans/:id/resources/:resourceId
    this.router.delete(
      '/:id/resources/:resourceId',
      this.requireAuthentication,
      this.asyncHandler(this.handleRemoveResource.bind(this))
    );

    // POST /unit-plans/duplicate
    this.router.post(
      '/duplicate',
      this.requireAuthentication,
      this.asyncHandler(this.handleDuplicate.bind(this))
    );
  }

  private async handleAddResource(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { id: unitPlanId } = req.params;
      const resourceData = resourceSchema.parse(req.body);
      
      const resource = await this.unitPlanService.addResource(unitPlanId, resourceData, userId);
      res.status(201).json(resource);
    } catch (_error) {
      this.logger.error('Error adding resource:', _error);
      next(_error);
    }
  }

  private async handleRemoveResource(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { id: unitPlanId, resourceId } = req.params;
      
      const success = await this.unitPlanService.removeResource(unitPlanId, resourceId, userId);
      
      if (!success) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }
      
      res.status(204).send();
    } catch (_error) {
      this.logger.error('Error removing resource:', _error);
      next(_error);
    }
  }

  private async handleDuplicate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const duplicateData = duplicateUnitPlanSchema.parse(req.body);
      
      const duplicatedUnitPlan = await this.unitPlanService.duplicate(duplicateData, userId);
      res.status(201).json(duplicatedUnitPlan);
    } catch (_error) {
      this.logger.error('Error duplicating unit plan:', _error);
      next(_error);
    }
  }
}