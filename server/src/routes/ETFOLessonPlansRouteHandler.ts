/**
 * ETFO Lesson Plans Route Handler
 * Extends BaseRouteHandler with ETFO lesson plan-specific business logic
 */

import type { Prisma } from '@teaching-engine/database';
import type { Response, NextFunction } from 'express';
import { z } from 'zod';

import { isNonEmptyArray, isObject, isString, isArray, hasProperty } from '../../../shared/utils/typeGuards';
import { prisma } from '../prisma';
import { BaseService } from '../services/base/BaseService';
import type { ETFOLessonPlanCreateData, ETFOLessonPlanUpdateData } from '../types/routes';

import type { AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler';
import { BaseRouteHandler } from './base/BaseRouteHandler';
import { commonValidations } from './base/validation';
import {
  optimizedIncludes,
  optimizedQueries,
  queryPerformance,
} from './optimizations/queryOptimizations';

// ETFO lesson plan-specific validation schemas
const lessonPlanCreateSchema = z.object({
  title: commonValidations.title,
  titleFr: commonValidations.titleFr,
  unitPlanId: z.string().cuid(),
  date: z.string().datetime(),
  duration: z.number().int().positive().max(480), // Max 8 hours

  // Three-part lesson structure
  mindsOn: z.string().max(2000).optional(),
  mindsOnFr: z.string().max(2000).optional(),
  action: z.string().max(5000).optional(),
  actionFr: z.string().max(5000).optional(),
  consolidation: z.string().max(2000).optional(),
  consolidationFr: z.string().max(2000).optional(),

  learningGoals: z.string().max(2000).optional(),
  learningGoalsFr: z.string().max(2000).optional(),
  materials: z.array(z.string().max(200)).max(50).optional(),
  grouping: z.string().max(500).optional(),

  // Differentiation
  accommodations: z.array(z.string().max(300)).max(20).optional(),
  modifications: z.array(z.string().max(300)).max(20).optional(),
  extensions: z.array(z.string().max(300)).max(20).optional(),

  // Assessment
  assessmentType: z.enum(['diagnostic', 'formative', 'summative']).optional(),
  assessmentNotes: z.string().max(1000).optional(),

  // Substitute teacher support
  isSubFriendly: z.boolean().optional(),
  subNotes: z.string().max(1000).optional(),

  // Curriculum expectations
  expectationIds: z.array(z.string().cuid()).max(20).optional(),
});

const lessonPlanUpdateSchema = lessonPlanCreateSchema.partial().omit({ unitPlanId: true });

const lessonPlanQuerySchema = z.object({
  unitPlanId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isSubFriendly: z.coerce.boolean().optional(),
  assessmentType: z.enum(['diagnostic', 'formative', 'summative']).optional(),
  hasExpectations: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['date', 'title', 'createdAt', 'duration']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

const resourceSchema = z.object({
  title: z.string().min(1).max(255),
  url: z.string().url().optional(),
  type: z
    .enum(['handout', 'slide', 'video', 'website', 'document', 'image', 'other'])
    .default('other'),
  content: z.string().max(500).optional(),
});

const duplicateSchema = z.object({
  lessonPlanId: z.string().cuid(),
  unitPlanId: z.string().cuid(),
  date: z.string().datetime().optional(),
  title: z.string().min(1).max(255).optional(),
});

const rescheduleSchema = z.object({
  newDate: z.string().datetime(),
  updateRelated: z.boolean().default(false),
});

// ETFO Lesson Plan service
class ETFOLessonPlanService extends BaseService {
  constructor() {
    super('ETFOLessonPlanService');
  }

  async findMany(
    filters: {
      unitPlanId?: number;
      startDate?: Date;
      endDate?: Date;
      isSubFriendly?: boolean;
      assessmentType?: string;
      hasExpectations?: boolean;
      hasAccommodations?: boolean;
      hasTechIntegration?: boolean;
      subjects?: string[];
      resourceTypes?: string[];
      selectedActivityIds?: number[];
      limit?: number;
      offset?: number;
      sort?: string;
      order?: 'asc' | 'desc';
    },
    userId: number,
  ): Promise<{ lessonPlans: Array<Record<string, unknown>>; pagination: { total: number; limit: number; offset: number; hasMore: boolean } }> {
    const {
      unitPlanId,
      startDate,
      endDate,
      isSubFriendly,
      assessmentType,
      hasExpectations,
      limit,
      offset,
      sort,
      order,
    } = filters;

    const where: Prisma.ETFOLessonPlanWhereInput = { userId };

    if (unitPlanId != null) {
      where.unitPlanId = String(unitPlanId);
    }
    if (isSubFriendly != null) {
where.isSubFriendly = isSubFriendly;
}
    if (assessmentType != null && assessmentType !== '') {
where.assessmentType = assessmentType;
}

    // Date filtering using optimized range function
    const dateWhere = optimizedQueries.createDateRangeWhere('date', startDate, endDate);
    if (Object.keys(dateWhere).length > 0) {
      Object.assign(where, dateWhere);
    }

    // Filter by lessons with curriculum expectations
    if (hasExpectations != null) {
      if (hasExpectations) {
        where.expectations = { some: {} };
      } else {
        where.expectations = { none: {} };
      }
    }

    // Sorting with validation
    const orderBy = queryPerformance.createOptimizedSort(sort || 'date', order || 'asc', [
      'date',
      'title',
      'duration',
      'createdAt',
    ]);

    const result = await queryPerformance.monitorQuery('etfoLessonPlan.findMany', () =>
      optimizedQueries.paginatedQuery(prisma.eTFOLessonPlan, where, {
        limit: limit ?? 10,
        offset: offset ?? 0,
        orderBy,
        include: optimizedIncludes.etfoLessonPlan,
      }),
    );

    if (!isObject(result) || !hasProperty(result, 'items') || !hasProperty(result, 'total')) {
      throw new Error('Invalid query result structure');
    }
    const { items: lessonPlans, total } = result;

    const validatedLessonPlans = isArray(lessonPlans) ? lessonPlans : [];
    
    return {
      lessonPlans: validatedLessonPlans,
      pagination: {
        total,
        limit: limit ?? 10,
        offset: offset ?? 0,
        hasMore: (offset ?? 0) + (limit ?? 10) < total,
      },
    };
  }

  async findById(id: string, userId: number): Promise<Record<string, unknown> | null> {
    return queryPerformance.monitorQuery('etfoLessonPlan.findById', () =>
      prisma.eTFOLessonPlan.findFirst({
        where: { id, userId },
        include: optimizedIncludes.etfoLessonPlan,
      }),
    );
  }

  async create(data: ETFOLessonPlanCreateData, userId: number): Promise<Record<string, unknown>> {
    // Verify user owns the unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        id: data.unitPlanId,
        longRangePlan: { userId },
      },
    });

    if (unitPlan == null) {
      throw new Error('Unit plan not found or access denied');
    }

    // Safe extraction of expectationIds with type checking
    const expectationIds = hasProperty(data, 'expectationIds') && isArray(data.expectationIds) 
      ? data.expectationIds.filter(id => isString(id))
      : undefined;

    // Create lesson plan data that matches Prisma schema
    const baseData = {
      title: data.title,
      unitPlanId: data.unitPlanId ?? '',
      date: new Date(data.date),
      duration: data.duration ?? 60, // Default 60 minutes
      mindsOn: data.mindsOn,
      mindsOnFr: data.mindsOnFr,
      action: data.action,
      actionFr: data.actionFr,
      consolidation: data.consolidation,
      consolidationFr: data.consolidationFr,
      learningGoals: data.learningGoals,
      learningGoalsFr: data.learningGoalsFr,
      materials: data.materials ? JSON.stringify(data.materials) : undefined,
      grouping: data.grouping,
      titleFr: data.titleFr,
      accommodations: data.accommodations ? JSON.stringify(data.accommodations) : undefined,
      modifications: data.modifications ? JSON.stringify(data.modifications) : undefined,
      extensions: data.extensions ? JSON.stringify(data.extensions) : undefined,
      assessmentType: data.assessmentType,
      assessmentNotes: data.assessmentNotes,
      isSubFriendly: data.isSubFriendly ?? true,
      subNotes: data.subNotes,
      userId,
    };

    // Add expectations relationship if provided
    const createData = isNonEmptyArray(expectationIds)
        ? {
            ...baseData,
            expectations: {
              create: expectationIds.map((expectationId) => ({
                expectationId: String(expectationId),
              })),
            },
          }
        : baseData;

    return prisma.eTFOLessonPlan.create({
      data: createData,
      include: {
        expectations: {
          include: {
            expectation: true,
          },
        },
      },
    });
  }

  async update(id: string, data: ETFOLessonPlanUpdateData, userId: number): Promise<Record<string, unknown>> {
    // Verify ownership
    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id, userId },
    });

    if (lessonPlan == null) {
      throw new Error('Lesson plan not found or access denied');
    }

    // Safe extraction of expectationIds with type checking
    const expectationIds = hasProperty(data, 'expectationIds') && isArray(data.expectationIds)
      ? data.expectationIds.filter(id => isString(id))
      : undefined;
    
    // Create a safe copy without expectationIds
    const updateData = { ...data };
    if (hasProperty(updateData, 'expectationIds')) {
      delete (updateData as { expectationIds?: unknown }).expectationIds;
    }

    // Create update data that matches Prisma schema
    const baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput> = {};

    // Only include fields that are actually being updated
    if (updateData.title != null) {
baseUpdateData.title = updateData.title;
}
    if (updateData.unitPlanId != null) {
baseUpdateData.unitPlanId = updateData.unitPlanId;
}
    if (updateData.duration != null) {
baseUpdateData.duration = updateData.duration;
}
    if (updateData.mindsOn != null) {
baseUpdateData.mindsOn = updateData.mindsOn;
}
    if (updateData.mindsOnFr != null) {
baseUpdateData.mindsOnFr = updateData.mindsOnFr;
}
    if (updateData.action != null) {
baseUpdateData.action = updateData.action;
}
    if (updateData.actionFr != null) {
baseUpdateData.actionFr = updateData.actionFr;
}
    if (updateData.consolidation != null) {
baseUpdateData.consolidation = updateData.consolidation;
}
    if (updateData.consolidationFr != null) {
baseUpdateData.consolidationFr = updateData.consolidationFr;
}
    if (updateData.learningGoals != null) {
baseUpdateData.learningGoals = updateData.learningGoals;
}
    if (updateData.learningGoalsFr != null) {
baseUpdateData.learningGoalsFr = updateData.learningGoalsFr;
}
    if (updateData.materials != null) {
baseUpdateData.materials = updateData.materials
        ? JSON.stringify(updateData.materials)
        : undefined;
}
    if (updateData.grouping != null) {
baseUpdateData.grouping = updateData.grouping;
}
    if (updateData.titleFr != null) {
baseUpdateData.titleFr = updateData.titleFr;
}
    if (updateData.accommodations != null) {
baseUpdateData.accommodations = updateData.accommodations
        ? JSON.stringify(updateData.accommodations)
        : undefined;
}
    if (updateData.modifications != null) {
baseUpdateData.modifications = updateData.modifications
        ? JSON.stringify(updateData.modifications)
        : undefined;
}
    if (updateData.extensions != null) {
baseUpdateData.extensions = updateData.extensions
        ? JSON.stringify(updateData.extensions)
        : undefined;
}
    if (updateData.assessmentType != null) {
baseUpdateData.assessmentType = updateData.assessmentType;
}
    if (updateData.assessmentNotes != null) {
baseUpdateData.assessmentNotes = updateData.assessmentNotes;
}
    if (updateData.isSubFriendly != null) {
baseUpdateData.isSubFriendly = updateData.isSubFriendly;
}
    if (updateData.subNotes != null) {
baseUpdateData.subNotes = updateData.subNotes;
}

    // Handle date conversion with proper type checking
    if (hasProperty(data, 'date') && isString(data.date) && data.date !== '') {
      baseUpdateData.date = new Date(data.date);
    }

    // Handle expectations relationship if provided
    const updateInput =
      Array.isArray(expectationIds)
        ? {
            ...baseUpdateData,
            expectations: {
              deleteMany: {},
              create: expectationIds.map((expectationId) => ({
                expectationId: String(expectationId),
              })),
            },
          }
        : baseUpdateData;

    return prisma.eTFOLessonPlan.update({
      where: { id },
      data: updateInput,
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
    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id, userId },
    });

    if (lessonPlan == null) {
      return false;
    }

    await prisma.eTFOLessonPlan.delete({
      where: { id },
    });

    return true;
  }

  async addResource(
    lessonPlanId: string,
    resourceData: { url?: string; title: string; type: string; content?: string },
    userId: number,
  ): Promise<unknown> {
    // Verify ownership
    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id: lessonPlanId, userId },
    });

    if (lessonPlan == null) {
      throw new Error('Lesson plan not found or access denied');
    }

    // Map resource data to match Prisma schema
    const createData = {
      lessonPlanId,
      title: resourceData.title,
      type: resourceData.type,
      url: resourceData.url,
      content: resourceData.content,
    };

    return prisma.eTFOLessonPlanResource.create({
      data: createData,
    });
  }

  async removeResource(lessonPlanId: string, resourceId: string, userId: number): Promise<boolean> {
    // Verify ownership through lesson plan
    const resource = await prisma.eTFOLessonPlanResource.findFirst({
      where: {
        id: resourceId,
        lessonPlan: {
          id: lessonPlanId,
          userId,
        },
      },
    });

    if (resource == null) {
      return false;
    }

    await prisma.eTFOLessonPlanResource.delete({
      where: { id: resourceId },
    });

    return true;
  }

  async createSubVersion(lessonPlanId: string, userId: number): Promise<unknown> {
    const originalLesson = await prisma.eTFOLessonPlan.findFirst({
      where: { id: lessonPlanId, userId },
      include: {
        expectations: true,
        resources: true,
      },
    });

    if (originalLesson == null) {
      throw new Error('Lesson plan not found or access denied');
    }

    return prisma.eTFOLessonPlan.create({
      data: {
        title: `${originalLesson.title} (Sub-Friendly)`,
        titleFr: originalLesson.titleFr ? `${originalLesson.titleFr} (Sub-Friendly)` : undefined,
        unitPlanId: originalLesson.unitPlanId,
        userId,
        date: originalLesson.date,
        duration: originalLesson.duration,
        mindsOn: originalLesson.mindsOn,
        mindsOnFr: originalLesson.mindsOnFr,
        action: originalLesson.action,
        actionFr: originalLesson.actionFr,
        consolidation: originalLesson.consolidation,
        consolidationFr: originalLesson.consolidationFr,
        learningGoals: originalLesson.learningGoals,
        learningGoalsFr: originalLesson.learningGoalsFr,
        materials: originalLesson.materials ?? undefined,
        grouping: originalLesson.grouping,
        accommodations: originalLesson.accommodations ?? undefined,
        modifications: originalLesson.modifications ?? undefined,
        extensions: originalLesson.extensions ?? undefined,
        assessmentType: originalLesson.assessmentType,
        assessmentNotes: originalLesson.assessmentNotes,
        isSubFriendly: true,
        subNotes:
          'Auto-generated substitute-friendly version. Please review and customize as needed.',
        expectations: {
          create: originalLesson.expectations.map((exp) => ({
            expectationId: exp.expectationId,
          })),
        },
        resources: {
          create: originalLesson.resources.map((resource) => ({
            title: resource.title,
            url: resource.url,
            type: resource.type,
            content: resource.content,
          })),
        },
      },
    });
  }

  async reschedule(
    lessonPlanId: string,
    rescheduleData: { newDate: string | Date; updateRelated?: boolean },
    userId: number,
  ): Promise<unknown> {
    const { newDate, updateRelated } = rescheduleData;

    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id: lessonPlanId, userId },
    });

    if (lessonPlan == null) {
      throw new Error('Lesson plan not found or access denied');
    }

    // Update the lesson plan date
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: { id: lessonPlanId },
      data: { date: new Date(newDate) },
    });

    // If requested, update related daybook entries
    if (updateRelated === true) {
      await prisma.daybookEntry.updateMany({
        where: {
          lessonPlanId,
          userId,
        },
        data: {
          date: new Date(newDate),
        },
      });
    }

    return updatedLesson;
  }

  async duplicate(
    duplicateData: {
      lessonPlanId: string;
      unitPlanId: string;
      date?: string | Date;
      title?: string;
    },
    userId: number,
  ): Promise<unknown> {
    const { lessonPlanId, unitPlanId, date, title } = duplicateData;

    // Verify user owns both the source lesson plan and target unit plan
    const [sourceLessonPlan, targetUnitPlan] = await Promise.all([
      prisma.eTFOLessonPlan.findFirst({
        where: { id: lessonPlanId, userId },
        include: {
          expectations: true,
          resources: true,
        },
      }),
      prisma.unitPlan.findFirst({
        where: {
          id: unitPlanId,
          longRangePlan: { userId },
        },
      }),
    ]);

    if (sourceLessonPlan == null || targetUnitPlan == null) {
      throw new Error('Source lesson plan or target unit plan not found');
    }

    return prisma.eTFOLessonPlan.create({
      data: {
        title: title ?? `${sourceLessonPlan.title} (Copy)`,
        titleFr: sourceLessonPlan.titleFr,
        unitPlanId,
        userId,
        date: date ? new Date(date) : sourceLessonPlan.date,
        duration: sourceLessonPlan.duration,
        mindsOn: sourceLessonPlan.mindsOn,
        mindsOnFr: sourceLessonPlan.mindsOnFr,
        action: sourceLessonPlan.action,
        actionFr: sourceLessonPlan.actionFr,
        consolidation: sourceLessonPlan.consolidation,
        consolidationFr: sourceLessonPlan.consolidationFr,
        learningGoals: sourceLessonPlan.learningGoals,
        learningGoalsFr: sourceLessonPlan.learningGoalsFr,
        materials: sourceLessonPlan.materials ?? undefined,
        grouping: sourceLessonPlan.grouping,
        accommodations: sourceLessonPlan.accommodations ?? undefined,
        modifications: sourceLessonPlan.modifications ?? undefined,
        extensions: sourceLessonPlan.extensions ?? undefined,
        assessmentType: sourceLessonPlan.assessmentType,
        assessmentNotes: sourceLessonPlan.assessmentNotes,
        isSubFriendly: sourceLessonPlan.isSubFriendly,
        subNotes: sourceLessonPlan.subNotes,
        expectations: {
          create: sourceLessonPlan.expectations.map((exp) => ({
            expectationId: exp.expectationId,
          })),
        },
        resources: {
          create: sourceLessonPlan.resources.map((resource) => ({
            title: resource.title,
            url: resource.url,
            type: resource.type,
            content: resource.content,
          })),
        },
      },
    });
  }
}

export class ETFOLessonPlansRouteHandler extends BaseRouteHandler {
  private lessonPlanService: ETFOLessonPlanService;

  constructor() {
    super({
      routeName: 'etfo-lesson-plans',
      requireAuth: true,
    });
    this.lessonPlanService = new ETFOLessonPlanService();
  }

  protected getService(): BaseService {
    return this.lessonPlanService;
  }

  protected getValidationSchemas(): { create: unknown; update: unknown; query: unknown } {
    return {
      create: lessonPlanCreateSchema,
      update: lessonPlanUpdateSchema,
      query: lessonPlanQuerySchema,
    };
  }

  protected getCrudOperations(): CrudOperations<unknown> {
    return {
      create: async (data: unknown, userId: number) => this.lessonPlanService.create(data as ETFOLessonPlanCreateData, userId),
      findMany: async (filters: unknown, userId: number): Promise<unknown> => {
        const result = await this.lessonPlanService.findMany(
          filters as {
            unitPlanId?: number;
            startDate?: Date;
            endDate?: Date;
            isSubFriendly?: boolean;
            assessmentType?: string;
            hasExpectations?: boolean;
            hasAccommodations?: boolean;
            hasTechIntegration?: boolean;
            subjects?: string[];
            resourceTypes?: string[];
            selectedActivityIds?: number[];
            limit?: number;
            offset?: number;
            sort?: string;
            order?: 'asc' | 'desc';
          },
          userId,
        );
        return result.lessonPlans;
      },
      findById: async (id: string, userId: number) => this.lessonPlanService.findById(id, userId),
      update: async (id: string, data: unknown, userId: number) => this.lessonPlanService.update(id, data as ETFOLessonPlanUpdateData, userId),
      delete: async (id: string, userId: number) => this.lessonPlanService.delete(id, userId),
    };
  }

  protected async handleList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (userId == null) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const schemas = this.getValidationSchemas();
      const querySchema = schemas.query as z.ZodSchema<{
        unitPlanId?: string;
        startDate?: string;
        endDate?: string;
        isSubFriendly?: boolean;
        assessmentType?: 'diagnostic' | 'formative' | 'summative';
        hasExpectations?: boolean;
        limit: number;
        offset: number;
        sortBy: 'date' | 'title' | 'createdAt' | 'duration';
        sortOrder: 'asc' | 'desc';
      }>;
      const filters = querySchema.parse(req.query);

      // Convert string dates to Date objects and fix field names for service
      const { sortBy, sortOrder, startDate, endDate, unitPlanId, ...filterBase } = filters;
      const convertedFilters = {
        ...filterBase,
        ...(startDate != null && startDate !== '' && { startDate: new Date(startDate) }),
        ...(endDate != null && endDate !== '' && { endDate: new Date(endDate) }),
        ...(unitPlanId != null && unitPlanId !== '' && { unitPlanId: parseInt(String(unitPlanId), 10) }),
        // Convert sortBy/sortOrder to sort/order for service
        sort: sortBy,
        order: sortOrder,
      };

      const result = await this.lessonPlanService.findMany(convertedFilters as {
        unitPlanId?: number;
        startDate?: Date;
        endDate?: Date;
        isSubFriendly?: boolean;
        assessmentType?: string;
        hasExpectations?: boolean;
        limit?: number;
        offset?: number;
        sort?: string;
        order?: 'asc' | 'desc';
      }, userId);
      res.json(result);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in ${this.routeName} list:`, message);
      next(error);
    }
  }

  protected setupCustomRoutes(): void {
    // POST /etfo-lesson-plans/:id/resources
    this.router.post(
      '/:id/resources',
      this.requireAuthentication,
      this.asyncHandler(this.handleAddResource.bind(this)),
    );

    // DELETE /etfo-lesson-plans/:id/resources/:resourceId
    this.router.delete(
      '/:id/resources/:resourceId',
      this.requireAuthentication,
      this.asyncHandler(this.handleRemoveResource.bind(this)),
    );

    // POST /etfo-lesson-plans/:id/sub-version
    this.router.post(
      '/:id/sub-version',
      this.requireAuthentication,
      this.asyncHandler(this.handleCreateSubVersion.bind(this)),
    );

    // PUT /etfo-lesson-plans/:id/reschedule
    this.router.put(
      '/:id/reschedule',
      this.requireAuthentication,
      this.asyncHandler(this.handleReschedule.bind(this)),
    );

    // POST /etfo-lesson-plans/duplicate
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
      if (userId == null) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const { id: lessonPlanId } = req.params;
      const resourceData = resourceSchema.parse(req.body);

      const resource = await this.lessonPlanService.addResource(lessonPlanId, resourceData, userId);
      res.status(201).json(resource);
    } catch (_error) {
      this.logger.error('Error adding resource:', _error as string | undefined);
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
      if (userId == null) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const { id: lessonPlanId, resourceId } = req.params;

      const success = await this.lessonPlanService.removeResource(lessonPlanId, resourceId, userId);

      if (success !== true) {
        res.status(404).json({ error: 'Resource not found' });
        return;
      }

      res.status(204).send();
    } catch (_error) {
      this.logger.error('Error removing resource:', _error as string | undefined);
      next(_error); return;
    }
  }

  private async handleCreateSubVersion(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (userId == null) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const { id: lessonPlanId } = req.params;

      const subVersion = await this.lessonPlanService.createSubVersion(lessonPlanId, userId);
      res.status(201).json(subVersion);
    } catch (_error) {
      this.logger.error('Error creating sub version:', _error as string | undefined);
      next(_error); return;
    }
  }

  private async handleReschedule(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (userId == null) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const { id: lessonPlanId } = req.params;
      const rescheduleData = rescheduleSchema.parse(req.body);

      const rescheduledLesson = await this.lessonPlanService.reschedule(
        lessonPlanId,
        rescheduleData,
        userId,
      );
      res.json(rescheduledLesson);
      return;
    } catch (_error) {
      this.logger.error('Error rescheduling lesson:', _error as string | undefined);
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
      if (userId == null) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const duplicateData = duplicateSchema.parse(req.body);

      const duplicatedLesson = await this.lessonPlanService.duplicate(duplicateData, userId);
      res.status(201).json(duplicatedLesson);
    } catch (_error) {
      this.logger.error('Error duplicating lesson plan:', _error as string | undefined);
      next(_error); return;
    }
  }
}
