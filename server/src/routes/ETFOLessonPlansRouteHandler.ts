/**
 * ETFO Lesson Plans Route Handler
 * Extends BaseRouteHandler with ETFO lesson plan-specific business logic
 */

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { BaseRouteHandler, AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler.js';
import { BaseService } from '../services/base/BaseService.js';
import { commonValidations } from './base/validation.js';
import { prisma } from '../prisma.js';
import { Prisma } from '@teaching-engine/database';
import { optimizedIncludes, optimizedQueries, queryPerformance } from './optimizations/queryOptimizations.js';

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
  name: z.string().min(1).max(255),
  url: z.string().url().optional(),
  type: z.enum(['website', 'document', 'video', 'image', 'other']).default('other'),
  description: z.string().max(500).optional(),
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

  async findMany(filters: unknown, userId: number) {
    const {
      unitPlanId,
      startDate,
      endDate,
      isSubFriendly,
      assessmentType,
      hasExpectations,
      limit,
      offset,
      sortBy,
      sortOrder,
    } = filters;

    const where: Prisma.ETFOLessonPlanWhereInput = { userId };

    if (unitPlanId) where.unitPlanId = unitPlanId;
    if (isSubFriendly !== undefined) where.isSubFriendly = isSubFriendly;
    if (assessmentType) where.assessmentType = assessmentType;

    // Date filtering using optimized range function
    const dateWhere = optimizedQueries.createDateRangeWhere('date', startDate, endDate);
    if (Object.keys(dateWhere).length > 0) {
      Object.assign(where, dateWhere);
    }

    // Filter by lessons with curriculum expectations
    if (hasExpectations !== undefined) {
      if (hasExpectations) {
        where.expectations = { some: {} };
      } else {
        where.expectations = { none: {} };
      }
    }

    // Sorting with validation
    const orderBy = queryPerformance.createOptimizedSort(
      sortBy,
      sortOrder,
      ['date', 'title', 'duration', 'createdAt']
    );

    const result = await queryPerformance.monitorQuery(
      'etfoLessonPlan.findMany',
      () => optimizedQueries.paginatedQuery(
        prisma.eTFOLessonPlan,
        where,
        {
          limit,
          offset,
          orderBy,
          include: optimizedIncludes.etfoLessonPlan,
        }
      )
    );

    const { items: lessonPlans, total } = result;

    return {
      lessonPlans,
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
      'etfoLessonPlan.findById',
      () => prisma.eTFOLessonPlan.findFirst({
        where: { id, userId },
        include: optimizedIncludes.etfoLessonPlan,
      })
    );
  }

  async create(data: unknown, userId: number) {
    // Verify user owns the unit plan
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        id: data.unitPlanId,
        longRangePlan: { userId },
      },
    });

    if (!unitPlan) {
      throw new Error('Unit plan not found or access denied');
    }

    const { expectationIds, ...lessonPlanData } = data;

    return prisma.eTFOLessonPlan.create({
      data: {
        ...lessonPlanData,
        userId,
        date: new Date(data.date),
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
    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id, userId },
    });

    if (!lessonPlan) {
      throw new Error('Lesson plan not found or access denied');
    }

    const { expectationIds, ...updateData } = data;

    // Handle date conversion
    if (data.date) updateData.date = new Date(data.date);

    return prisma.eTFOLessonPlan.update({
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
    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id, userId },
    });

    if (!lessonPlan) {
      return false;
    }

    await prisma.eTFOLessonPlan.delete({
      where: { id },
    });

    return true;
  }

  async addResource(lessonPlanId: string, resourceData: unknown, userId: number) {
    // Verify ownership
    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id: lessonPlanId, userId },
    });

    if (!lessonPlan) {
      throw new Error('Lesson plan not found or access denied');
    }

    return prisma.eTFOLessonPlanResource.create({
      data: {
        ...resourceData,
        lessonPlanId,
      },
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

    if (!resource) {
      return false;
    }

    await prisma.eTFOLessonPlanResource.delete({
      where: { id: resourceId },
    });

    return true;
  }

  async createSubVersion(lessonPlanId: string, userId: number) {
    const originalLesson = await prisma.eTFOLessonPlan.findFirst({
      where: { id: lessonPlanId, userId },
      include: {
        expectations: true,
        resources: true,
      },
    });

    if (!originalLesson) {
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
        materials: originalLesson.materials,
        grouping: originalLesson.grouping,
        accommodations: originalLesson.accommodations,
        modifications: originalLesson.modifications,
        extensions: originalLesson.extensions,
        assessmentType: originalLesson.assessmentType,
        assessmentNotes: originalLesson.assessmentNotes,
        isSubFriendly: true,
        subNotes: 'Auto-generated substitute-friendly version. Please review and customize as needed.',
        expectations: {
          create: originalLesson.expectations.map((exp) => ({
            expectationId: exp.expectationId,
          })),
        },
        resources: {
          create: originalLesson.resources.map((resource) => ({
            name: resource.name,
            url: resource.url,
            type: resource.type,
            description: resource.description,
          })),
        },
      },
    });
  }

  async reschedule(lessonPlanId: string, rescheduleData: unknown, userId: number) {
    const { newDate, updateRelated } = rescheduleData;

    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id: lessonPlanId, userId },
    });

    if (!lessonPlan) {
      throw new Error('Lesson plan not found or access denied');
    }

    // Update the lesson plan date
    const updatedLesson = await prisma.eTFOLessonPlan.update({
      where: { id: lessonPlanId },
      data: { date: new Date(newDate) },
    });

    // If requested, update related daybook entries
    if (updateRelated) {
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

  async duplicate(duplicateData: unknown, userId: number) {
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

    if (!sourceLessonPlan || !targetUnitPlan) {
      throw new Error('Source lesson plan or target unit plan not found');
    }

    return prisma.eTFOLessonPlan.create({
      data: {
        title: title || `${sourceLessonPlan.title} (Copy)`,
        titleFr: sourceLessonPlan.titleFr,
        unitPlanId: unitPlanId,
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
        materials: sourceLessonPlan.materials,
        grouping: sourceLessonPlan.grouping,
        accommodations: sourceLessonPlan.accommodations,
        modifications: sourceLessonPlan.modifications,
        extensions: sourceLessonPlan.extensions,
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

  protected getValidationSchemas() {
    return {
      create: lessonPlanCreateSchema,
      update: lessonPlanUpdateSchema,
      query: lessonPlanQuerySchema,
    };
  }

  protected getCrudOperations(): CrudOperations<unknown> {
    return {
      create: this.lessonPlanService.create.bind(this.lessonPlanService),
      findMany: this.lessonPlanService.findMany.bind(this.lessonPlanService),
      findById: this.lessonPlanService.findById.bind(this.lessonPlanService),
      update: this.lessonPlanService.update.bind(this.lessonPlanService),
      delete: this.lessonPlanService.delete.bind(this.lessonPlanService),
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
      
      const result = await this.lessonPlanService.findMany(filters, userId);
      res.json(result);
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
      this.asyncHandler(this.handleAddResource.bind(this))
    );

    // DELETE /etfo-lesson-plans/:id/resources/:resourceId
    this.router.delete(
      '/:id/resources/:resourceId',
      this.requireAuthentication,
      this.asyncHandler(this.handleRemoveResource.bind(this))
    );

    // POST /etfo-lesson-plans/:id/sub-version
    this.router.post(
      '/:id/sub-version',
      this.requireAuthentication,
      this.asyncHandler(this.handleCreateSubVersion.bind(this))
    );

    // PUT /etfo-lesson-plans/:id/reschedule
    this.router.put(
      '/:id/reschedule',
      this.requireAuthentication,
      this.asyncHandler(this.handleReschedule.bind(this))
    );

    // POST /etfo-lesson-plans/duplicate
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
      const { id: lessonPlanId } = req.params;
      const resourceData = resourceSchema.parse(req.body);
      
      const resource = await this.lessonPlanService.addResource(lessonPlanId, resourceData, userId);
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
      const { id: lessonPlanId, resourceId } = req.params;
      
      const success = await this.lessonPlanService.removeResource(lessonPlanId, resourceId, userId);
      
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

  private async handleCreateSubVersion(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { id: lessonPlanId } = req.params;
      
      const subVersion = await this.lessonPlanService.createSubVersion(lessonPlanId, userId);
      res.status(201).json(subVersion);
    } catch (_error) {
      this.logger.error('Error creating sub version:', _error);
      next(_error);
    }
  }

  private async handleReschedule(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const { id: lessonPlanId } = req.params;
      const rescheduleData = rescheduleSchema.parse(req.body);
      
      const rescheduledLesson = await this.lessonPlanService.reschedule(lessonPlanId, rescheduleData, userId);
      res.json(rescheduledLesson);
    } catch (_error) {
      this.logger.error('Error rescheduling lesson:', _error);
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
      const duplicateData = duplicateSchema.parse(req.body);
      
      const duplicatedLesson = await this.lessonPlanService.duplicate(duplicateData, userId);
      res.status(201).json(duplicatedLesson);
    } catch (_error) {
      this.logger.error('Error duplicating lesson plan:', _error);
      next(_error);
    }
  }
}