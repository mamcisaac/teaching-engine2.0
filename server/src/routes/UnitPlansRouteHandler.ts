/**
 * Unit Plans Route Handler
 * Extends BaseRouteHandler with unit plan-specific business logic
 */

import type { Prisma } from '@teaching-engine/database';
import type { Response, NextFunction } from 'express';
import { z } from 'zod';

import { prisma } from '../prisma.js';
import { BaseService } from '../services/base/BaseService.js';
import type { UnitPlanCreateData, UnitPlanUpdateData, ResourceData } from '../types/routes.js';

import type { AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler.js';
import { BaseRouteHandler } from './base/BaseRouteHandler.js';
import { commonValidations } from './base/validation.js';
import {
  optimizedIncludes,
  optimizedQueries,
  queryPerformance,
} from './optimizations/queryOptimizations.js';

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

const unitPlanUpdateSchema = unitPlanCreateSchema
  .partial()
  .omit({ longRangePlanId: true })
  .extend({
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

  async findMany(filters: Record<string, unknown>, userId: number) {
    const filtersObj = filters || {};
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
    } = filtersObj;

    const longRangePlanFilter: Prisma.LongRangePlanWhereInput = { userId };
    if (subject) {
      longRangePlanFilter.subject = { contains: String(subject) };
    }

    const where: Prisma.UnitPlanWhereInput = {
      longRangePlan: longRangePlanFilter,
    };

    if (longRangePlanId) {
where.longRangePlanId = longRangePlanId;
}
    if (startDate) {
where.startDate = { gte: new Date(String(startDate)) };
}
    if (endDate) {
where.endDate = { lte: new Date(String(endDate)) };
}

    // Search functionality using optimized search utility
    if (search) {
      where.OR = [
        ...optimizedQueries.createSearchWhere(String(search), ['title', 'description', 'bigIdeas'])
          .OR,
      ];
    }

    // Date range filtering
    const dateWhere = optimizedQueries.createDateRangeWhere(
      'startDate',
      startDate ? String(startDate) : undefined,
      endDate ? String(endDate) : undefined,
    );
    if (Object.keys(dateWhere).length > 0) {
      Object.assign(where, dateWhere);
    }

    // Sorting with validation
    const orderBy = queryPerformance.createOptimizedSort(
      String(sortBy || 'startDate'),
      (sortOrder || 'asc') as 'asc' | 'desc',
      ['title', 'startDate', 'endDate', 'createdAt'],
    );

    const result = await queryPerformance.monitorQuery('unitPlan.findMany', () =>
      optimizedQueries.paginatedQuery(prisma.unitPlan, where, {
        limit: Number(limit || 20),
        offset: Number(offset || 0),
        orderBy,
        include: optimizedIncludes.unitPlan,
      }),
    );

    const { items: unitPlans, total } = result;

    return {
      unitPlans,
      pagination: {
        total,
        limit: Number(limit || 20),
        offset: Number(offset || 0),
        hasMore: Number(offset || 0) + Number(limit || 20) < total,
      },
    };
  }

  async findById(id: string, userId: number) {
    return queryPerformance.monitorQuery('unitPlan.findById', () =>
      prisma.unitPlan.findFirst({
        where: {
          id,
          longRangePlan: { userId },
        },
        include: optimizedIncludes.unitPlan,
      }),
    );
  }

  async create(data: UnitPlanCreateData, userId: number) {
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

    const { expectations, resources } = data as unknown as Record<string, unknown>;

    // Create unit plan data that matches Prisma schema
    const createData = {
      userId,
      title: data.title,
      longRangePlanId: data.longRangePlanId,
      description: data.description,
      bigIdeas: data.bigIdeas,
      essentialQuestions: data.essentialQuestions
        ? JSON.stringify(data.essentialQuestions)
        : undefined,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      estimatedHours: data.estimatedHours,
      titleFr: data.titleFr,
      descriptionFr: data.descriptionFr,
      bigIdeasFr: data.bigIdeasFr,
      assessmentPlan: data.assessmentPlan,
      successCriteria: data.successCriteria ? JSON.stringify(data.successCriteria) : undefined,
      crossCurricularConnections: data.crossCurricularConnections,
      learningSkills: data.learningSkills ? JSON.stringify(data.learningSkills) : undefined,
      culminatingTask: data.culminatingTask,
      keyVocabulary: data.keyVocabulary ? JSON.stringify(data.keyVocabulary) : undefined,
      priorKnowledge: data.priorKnowledge,
      parentCommunicationPlan: data.parentCommunicationPlan,
      fieldTripsAndGuestSpeakers: data.fieldTripsAndGuestSpeakers,
      differentiationStrategies: data.differentiationStrategies
        ? JSON.stringify(data.differentiationStrategies)
        : undefined,
      indigenousPerspectives: data.indigenousPerspectives,
      environmentalEducation: data.environmentalEducation,
      socialJusticeConnections: data.socialJusticeConnections,
      technologyIntegration: data.technologyIntegration,
      communityConnections: data.communityConnections,
      // Add expectations relationship if provided
      ...(expectations &&
        Array.isArray(expectations) &&
        expectations.length > 0 ? {
          expectations: {
            create: expectations.map((exp: unknown) => {
              const expectation = exp as { expectationId: string };
              return {
                expectationId: expectation.expectationId,
              };
            }),
          },
        } : {}),
      // Add resources relationship if provided
      ...(resources &&
        Array.isArray(resources) &&
        resources.length > 0 ? {
          resources: {
            create: resources.map((resource: unknown) => {
              const res = resource as { title: string; type: string; url?: string; content?: string };
              return {
                title: res.title,
                type: res.type,
                url: res.url,
                notes: res.content, // Map content to notes field
              };
            }),
          },
        } : {}),
    };

    return prisma.unitPlan.create({
      data: createData,
      include: {
        expectations: {
          include: {
            expectation: true,
          },
        },
        resources: true,
      },
    });
  }

  async update(id: string, data: UnitPlanUpdateData, userId: number) {
    // Verify ownership
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        id,
        longRangePlan: { userId },
      },
    });

    if (unitPlan === null || unitPlan === undefined) {
      throw new Error('Unit plan not found or access denied');
    }

    const { expectationIds, ...updateDataBase } = data as unknown as Record<string, unknown>;

    // Build update data without longRangePlanId and with proper date conversion
    const updateData: Record<string, unknown> = {};
    Object.keys(updateDataBase).forEach((key) => {
      if (key !== 'longRangePlanId') {
        // Skip longRangePlanId - can't be updated
        updateData[key] = updateDataBase[key as keyof typeof updateDataBase];
      }
    });

    // Handle date conversion
    if (data.startDate !== null && data.startDate !== undefined && data.startDate !== '') {
updateData.startDate = new Date(data.startDate);
}
    if (data.endDate !== null && data.endDate !== undefined && data.endDate !== '') {
updateData.endDate = new Date(data.endDate);
}

    return prisma.unitPlan.update({
      where: { id },
      data: {
        ...updateData,
        ...(expectationIds && Array.isArray(expectationIds) ? {
          expectations: {
            deleteMany: {},
            create: expectationIds.map((expectationId: unknown) => ({
              expectationId: String(expectationId),
            })),
          },
        } : {}),
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

    if (unitPlan === null || unitPlan === undefined) {
      return false;
    }

    await prisma.unitPlan.delete({
      where: { id },
    });

    return true;
  }

  async addResource(unitPlanId: string, resourceData: ResourceData, userId: number) {
    // Verify ownership
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        id: unitPlanId,
        longRangePlan: { userId },
      },
    });

    if (unitPlan === null || unitPlan === undefined) {
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

  async duplicate(
    duplicateData: { unitPlanId: string; longRangePlanId: string; title: string },
    userId: number,
  ) {
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
        userId,
        title: title || `${sourceUnitPlan.title} (Copy)`,
        titleFr: sourceUnitPlan.titleFr,
        description: sourceUnitPlan.description,
        descriptionFr: sourceUnitPlan.descriptionFr,
        bigIdeas: sourceUnitPlan.bigIdeas,
        bigIdeasFr: sourceUnitPlan.bigIdeasFr,
        essentialQuestions: sourceUnitPlan.essentialQuestions || undefined,
        startDate: sourceUnitPlan.startDate,
        endDate: sourceUnitPlan.endDate,
        estimatedHours: sourceUnitPlan.estimatedHours,
        assessmentPlan: sourceUnitPlan.assessmentPlan,
        successCriteria: sourceUnitPlan.successCriteria || undefined,
        crossCurricularConnections: sourceUnitPlan.crossCurricularConnections,
        learningSkills: sourceUnitPlan.learningSkills || undefined,
        culminatingTask: sourceUnitPlan.culminatingTask,
        keyVocabulary: sourceUnitPlan.keyVocabulary || undefined,
        priorKnowledge: sourceUnitPlan.priorKnowledge,
        parentCommunicationPlan: sourceUnitPlan.parentCommunicationPlan,
        fieldTripsAndGuestSpeakers: sourceUnitPlan.fieldTripsAndGuestSpeakers,
        differentiationStrategies: sourceUnitPlan.differentiationStrategies || undefined,
        socialJusticeConnections: sourceUnitPlan.socialJusticeConnections,
        technologyIntegration: sourceUnitPlan.technologyIntegration,
        communityConnections: sourceUnitPlan.communityConnections,
        longRangePlanId,
        expectations: {
          create: sourceUnitPlan.expectations.map((exp: { expectationId: string }) => ({
            expectationId: exp.expectationId,
          })),
        },
        resources: {
          create: sourceUnitPlan.resources.map((resource: { title: string; url: string | null; type: string; notes: string | null }) => ({
            title: resource.title,
            url: resource.url ?? '',
            type: resource.type,
            notes: resource.notes ?? '',
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
      create: async (data: unknown, userId: number) => this.unitPlanService.create(data as UnitPlanCreateData, userId),
      findMany: async (filters: unknown, userId: number) => {
        const result = await this.unitPlanService.findMany(
          filters as Record<string, unknown>,
          userId,
        );
        return result.unitPlans;
      },
      findById: async (id: string, userId: number) => this.unitPlanService.findById(id, userId),
      update: async (id: string, data: unknown, userId: number) => this.unitPlanService.update(id, data as UnitPlanUpdateData, userId),
      delete: async (id: string, userId: number) => this.unitPlanService.delete(id, userId),
    };
  }

  protected async handleList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const schemas = this.getValidationSchemas();
      const filters = schemas.query.parse(req.query);

      const result = await this.unitPlanService.findMany(filters, userId);
      res.json(result);
      return;
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} list:`, _error);
      next(_error); return;
    }
  }

  protected setupCustomRoutes(): void {
    // POST /unit-plans/:id/resources
    this.router.post(
      '/:id/resources',
      this.requireAuthentication,
      this.asyncHandler(this.handleAddResource.bind(this)),
    );

    // DELETE /unit-plans/:id/resources/:resourceId
    this.router.delete(
      '/:id/resources/:resourceId',
      this.requireAuthentication,
      this.asyncHandler(this.handleRemoveResource.bind(this)),
    );

    // POST /unit-plans/duplicate
    this.router.post(
      '/duplicate',
      this.requireAuthentication,
      this.asyncHandler(this.handleDuplicate.bind(this)),
    );
  }

  private async handleAddResource(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const { id: unitPlanId } = req.params;
      const parsedData = resourceSchema.parse(req.body);
      const resourceData: ResourceData = {
        title: parsedData.name,
        type: parsedData.type,
        url: parsedData.url,
        content: parsedData.description,
      };

      const resource = await this.unitPlanService.addResource(unitPlanId, resourceData, userId);
      res.status(201).json(resource);
    } catch (_error) {
      this.logger.error('Error adding resource:', _error);
      next(_error); return;
    }
  }

  private async handleRemoveResource(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const { id: unitPlanId, resourceId } = req.params;

      const success = await this.unitPlanService.removeResource(unitPlanId, resourceId, userId);

      if (!success) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      res.status(204).send();
    } catch (_error) {
      this.logger.error('Error removing resource:', _error);
      next(_error); return;
    }
  }

  private async handleDuplicate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const parsedData = duplicateUnitPlanSchema.parse(req.body);
      const duplicateData = {
        unitPlanId: parsedData.unitPlanId,
        longRangePlanId: parsedData.longRangePlanId,
        title: parsedData.title ?? '', // Will use default in the duplicate method if empty
      };

      const duplicatedUnitPlan = await this.unitPlanService.duplicate(duplicateData, userId);
      res.status(201).json(duplicatedUnitPlan);
    } catch (_error) {
      this.logger.error('Error duplicating unit plan:', _error);
      next(_error); return;
    }
  }
}
