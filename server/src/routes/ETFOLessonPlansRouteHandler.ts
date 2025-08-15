/**
 * ETFO Lesson Plans Route Handler
 * Extends BaseRouteHandler with ETFO lesson plan-specific business logic
 */

import { isNonEmptyArray, isObject, isString, isArray, hasProperty } from '../../../shared/utils/typeGuards';
import type { Prisma } from '@teaching-engine/database';
import type { Response, NextFunction } from 'express';
import { z } from 'zod';

import { prisma } from '../prisma';
import { BaseService } from '../services/base/BaseService';
import type { ETFOLessonPlan } from '../types/prisma-types';
import type { ETFOLessonPlanCreateData, ETFOLessonPlanUpdateData } from '../types/routes';

import type { AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler';
import { BaseRouteHandler } from './base/BaseRouteHandler';
import { commonValidations } from './base/validation';
import {
  optimizedIncludes,
  optimizedQueries,
  queryPerformance,
} from './optimizations/queryOptimizations';

// Extended interfaces for lesson plan data with relations
interface ETFOLessonPlanExpectation {
  expectationId: string;
}

interface ETFOLessonPlanResource {
  title: string;
  url?: string;
  type: string;
  content?: string;
}

interface ETFOLessonPlanWithRelations extends ETFOLessonPlan {
  expectations: ETFOLessonPlanExpectation[];
  resources: ETFOLessonPlanResource[];
}

interface LessonPlanQueryResult {
  items: ETFOLessonPlanWithRelations[];
  total: number;
}

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
  
  // New differentiation strategies (teacher-friendly format)
  differentiationStrategies: z.object({
    forStruggling: z.string().max(1000).optional(),
    forAdvanced: z.string().max(1000).optional(),
    forELL: z.string().max(1000).optional(),
    forIEP: z.string().max(1000).optional(),
  }).optional(),

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

  private buildBasicFilters(filters: {
    unitPlanId?: number;
    isSubFriendly?: boolean;
    assessmentType?: string;
  }, userId: number): Prisma.ETFOLessonPlanWhereInput {
    const where: Prisma.ETFOLessonPlanWhereInput = { userId };

    if (filters.unitPlanId !== undefined) {
      where.unitPlanId = String(filters.unitPlanId);
    }
    if (filters.isSubFriendly !== undefined) {
      where.isSubFriendly = filters.isSubFriendly;
    }
    if (filters.assessmentType !== undefined && filters.assessmentType !== '') {
      where.assessmentType = filters.assessmentType;
    }

    return where;
  }

  private addDateRangeFilter(
    where: Prisma.ETFOLessonPlanWhereInput,
    startDate?: Date,
    endDate?: Date
  ): void {
    const dateWhere = optimizedQueries.createDateRangeWhere('date', startDate, endDate);
    if (Object.keys(dateWhere).length > 0) {
      Object.assign(where, dateWhere);
    }
  }

  private addExpectationsFilter(
    where: Prisma.ETFOLessonPlanWhereInput,
    hasExpectations?: boolean
  ): void {
    if (hasExpectations !== undefined) {
      if (hasExpectations) {
        where.expectations = { some: {} };
      } else {
        where.expectations = { none: {} };
      }
    }
  }

  private buildOrderBy(sort?: string, order?: 'asc' | 'desc'): Record<string, 'asc' | 'desc'> | undefined {
    return queryPerformance.createOptimizedSort(sort || 'date', order || 'asc', [
      'date',
      'title',
      'duration',
      'createdAt',
    ]) as Record<string, 'asc' | 'desc'> | undefined;
  }

  private formatFindManyResult(
    result: unknown,
    limit: number,
    offset: number
  ): { lessonPlans: ETFOLessonPlanWithRelations[]; pagination: { total: number; limit: number; offset: number; hasMore: boolean } } {
    if (!isObject(result) || !hasProperty(result, 'items') || !hasProperty(result, 'total')) {
      throw new Error('Invalid query result structure');
    }
    
    const typedResult = result as unknown as LessonPlanQueryResult;
    const validatedLessonPlans = isArray(typedResult.items) ? typedResult.items : [];
    const validatedTotal = typeof typedResult.total === 'number' ? typedResult.total : 0;
    
    return {
      lessonPlans: validatedLessonPlans,
      pagination: {
        total: validatedTotal,
        limit,
        offset,
        hasMore: offset + limit < validatedTotal,
      },
    };
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
  ): Promise<{ lessonPlans: ETFOLessonPlanWithRelations[]; pagination: { total: number; limit: number; offset: number; hasMore: boolean } }> {
    const { startDate, endDate, hasExpectations, limit = 10, offset = 0, sort, order } = filters;

    // Build where clause
    const where = this.buildBasicFilters(filters, userId);
    this.addDateRangeFilter(where, startDate, endDate);
    this.addExpectationsFilter(where, hasExpectations);

    // Build order by
    const orderBy = this.buildOrderBy(sort, order);

    // Execute query
    const result = await queryPerformance.monitorQuery('etfoLessonPlan.findMany', () =>
      optimizedQueries.paginatedQuery(prisma.eTFOLessonPlan, where, {
        limit,
        offset,
        orderBy,
        include: optimizedIncludes.etfoLessonPlan,
      }),
    );

    return this.formatFindManyResult(result, limit, offset);
  }

  async findById(id: string, userId: number): Promise<Record<string, unknown> | null> {
    return queryPerformance.monitorQuery('etfoLessonPlan.findById', () =>
      prisma.eTFOLessonPlan.findFirst({
        where: { id, userId },
        include: optimizedIncludes.etfoLessonPlan,
      }),
    );
  }

  private async validateUnitPlanOwnership(unitPlanId: string, userId: number): Promise<void> {
    const unitPlan = await prisma.unitPlan.findFirst({
      where: {
        id: unitPlanId,
        longRangePlan: { userId },
      },
    });

    if (!unitPlan) {
      throw new Error('Unit plan not found or access denied');
    }
  }

  private buildCreateBaseData(data: ETFOLessonPlanCreateData, userId: number): any {
    return {
      title: data.title,
      titleFr: data.titleFr,
      unitPlanId: data.unitPlanId,
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
      accommodations: data.accommodations ? JSON.stringify(data.accommodations) : undefined,
      modifications: data.modifications ? JSON.stringify(data.modifications) : undefined,
      extensions: data.extensions ? JSON.stringify(data.extensions) : undefined,
      assessmentType: data.assessmentType,
      assessmentNotes: data.assessmentNotes,
      isSubFriendly: data.isSubFriendly ?? true,
      subNotes: data.subNotes,
      userId,
    };
  }

  private buildCreateDataWithExpectations(
    baseData: Prisma.ETFOLessonPlanCreateInput,
    expectationIds?: string[]
  ): Prisma.ETFOLessonPlanCreateInput {
    if (!isNonEmptyArray(expectationIds)) {
      return baseData;
    }

    return {
      ...baseData,
      expectations: {
        create: expectationIds.map((expectationId) => ({
          expectationId: String(expectationId),
        })),
      },
    };
  }

  async create(data: ETFOLessonPlanCreateData, userId: number): Promise<Record<string, unknown>> {
    // Verify user owns the unit plan
    await this.validateUnitPlanOwnership(data.unitPlanId, userId);

    // Safe extraction of expectationIds with type checking
    const expectationIds = hasProperty(data, 'expectationIds') && isArray(data.expectationIds) 
      ? data.expectationIds.filter(id => isString(id))
      : undefined;

    // Build base data
    const baseData = this.buildCreateBaseData(data, userId);

    // Add expectations relationship if provided
    const createData = this.buildCreateDataWithExpectations(baseData, expectationIds);

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

  private async validateLessonPlanOwnership(id: string, userId: number): Promise<void> {
    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id, userId },
    });

    if (!lessonPlan) {
      throw new Error('Lesson plan not found or access denied');
    }
  }

  private extractExpectationIds(data: ETFOLessonPlanUpdateData): string[] | undefined {
    return this.safelyExtractStringArray(data, 'expectationIds');
  }

  private safelyExtractStringArray(data: Record<string, unknown>, key: string): string[] | undefined {
    if (!hasProperty(data, key) || !isArray(data[key])) {
      return undefined;
    }
    return data[key].filter(id => isString(id));
  }

  private buildLessonPlanUpdateData(data: ETFOLessonPlanUpdateData): Partial<Prisma.ETFOLessonPlanUpdateInput> {
    // Create a safe copy without expectationIds
    const updateData = this.sanitizeUpdateData(data);
    
    const baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput> = {};

    // Apply field mappings using focused helper methods
    this.mapBasicFields(updateData, baseUpdateData);
    this.mapUnitPlanRelationship(updateData, baseUpdateData);
    this.mapLessonStructureFields(updateData, baseUpdateData);
    this.mapLearningGoalFields(updateData, baseUpdateData);
    this.mapJsonArrayFields(updateData, baseUpdateData);
    this.mapAssessmentFields(updateData, baseUpdateData);
    this.mapSubstituteTeacherFields(updateData, baseUpdateData);
    this.mapDateField(data, baseUpdateData);

    return baseUpdateData;
  }

  private sanitizeUpdateData(data: ETFOLessonPlanUpdateData): ETFOLessonPlanUpdateData {
    const updateData = { ...data };
    if (hasProperty(updateData, 'expectationIds')) {
      delete (updateData as { expectationIds?: unknown }).expectationIds;
    }
    return updateData;
  }

  private mapBasicFields(
    updateData: ETFOLessonPlanUpdateData,
    baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput>
  ): void {
    if (updateData.title !== undefined) baseUpdateData.title = updateData.title;
    if (updateData.titleFr !== undefined) baseUpdateData.titleFr = updateData.titleFr;
    if (updateData.duration !== undefined) baseUpdateData.duration = updateData.duration;
    if (updateData.grouping !== undefined) baseUpdateData.grouping = updateData.grouping;
  }

  private mapUnitPlanRelationship(
    updateData: ETFOLessonPlanUpdateData,
    baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput>
  ): void {
    if (updateData.unitPlanId !== undefined) {
      baseUpdateData.unitPlan = { connect: { id: updateData.unitPlanId } };
    }
  }

  private mapLessonStructureFields(
    updateData: ETFOLessonPlanUpdateData,
    baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput>
  ): void {
    // Three-part lesson structure
    if (updateData.mindsOn !== undefined) baseUpdateData.mindsOn = updateData.mindsOn;
    if (updateData.mindsOnFr !== undefined) baseUpdateData.mindsOnFr = updateData.mindsOnFr;
    if (updateData.action !== undefined) baseUpdateData.action = updateData.action;
    if (updateData.actionFr !== undefined) baseUpdateData.actionFr = updateData.actionFr;
    if (updateData.consolidation !== undefined) baseUpdateData.consolidation = updateData.consolidation;
    if (updateData.consolidationFr !== undefined) baseUpdateData.consolidationFr = updateData.consolidationFr;
  }

  private mapLearningGoalFields(
    updateData: ETFOLessonPlanUpdateData,
    baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput>
  ): void {
    if (updateData.learningGoals !== undefined) baseUpdateData.learningGoals = updateData.learningGoals;
    if (updateData.learningGoalsFr !== undefined) baseUpdateData.learningGoalsFr = updateData.learningGoalsFr;
  }

  private mapJsonArrayFields(
    updateData: ETFOLessonPlanUpdateData,
    baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput>
  ): void {
    // JSON fields (arrays)
    if (updateData.materials !== undefined) {
      baseUpdateData.materials = updateData.materials ? JSON.stringify(updateData.materials) : undefined;
    }
    if (updateData.accommodations !== undefined) {
      baseUpdateData.accommodations = updateData.accommodations ? JSON.stringify(updateData.accommodations) : undefined;
    }
    if (updateData.modifications !== undefined) {
      baseUpdateData.modifications = updateData.modifications ? JSON.stringify(updateData.modifications) : undefined;
    }
    if (updateData.extensions !== undefined) {
      baseUpdateData.extensions = updateData.extensions ? JSON.stringify(updateData.extensions) : undefined;
    }
  }

  private mapAssessmentFields(
    updateData: ETFOLessonPlanUpdateData,
    baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput>
  ): void {
    if (updateData.assessmentType !== undefined) baseUpdateData.assessmentType = updateData.assessmentType;
    if (updateData.assessmentNotes !== undefined) baseUpdateData.assessmentNotes = updateData.assessmentNotes;
  }

  private mapSubstituteTeacherFields(
    updateData: ETFOLessonPlanUpdateData,
    baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput>
  ): void {
    if (updateData.isSubFriendly !== undefined) baseUpdateData.isSubFriendly = updateData.isSubFriendly;
    if (updateData.subNotes !== undefined) baseUpdateData.subNotes = updateData.subNotes;
  }

  private mapDateField(
    data: ETFOLessonPlanUpdateData,
    baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput>
  ): void {
    // Handle date conversion with proper type checking
    if (hasProperty(data, 'date') && isString(data.date) && data.date !== '') {
      baseUpdateData.date = new Date(data.date);
    }
  }

  private buildUpdateInputWithExpectations(
    baseUpdateData: Partial<Prisma.ETFOLessonPlanUpdateInput>,
    expectationIds?: string[]
  ): Partial<Prisma.ETFOLessonPlanUpdateInput> {
    if (!this.hasValidExpectationIds(expectationIds)) {
      return baseUpdateData;
    }

    return {
      ...baseUpdateData,
      expectations: this.buildExpectationRelationshipUpdate(expectationIds!),
    };
  }

  private hasValidExpectationIds(expectationIds?: string[]): expectationIds is string[] {
    return Array.isArray(expectationIds) && expectationIds.length > 0;
  }

  private buildExpectationRelationshipUpdate(expectationIds: string[]): Record<string, unknown> {
    return {
      deleteMany: {},
      create: expectationIds.map((expectationId) => ({
        expectationId: String(expectationId),
      })),
    };
  }

  async update(id: string, data: ETFOLessonPlanUpdateData, userId: number): Promise<Record<string, unknown>> {
    // Perform all validation steps
    await this.performUpdateValidation(id, data, userId);

    // Process update data
    const updateInput = this.processUpdateData(data);

    // Execute update with proper response formatting
    return this.executeUpdateQuery(id, updateInput);
  }

  private async performUpdateValidation(
    id: string,
    data: ETFOLessonPlanUpdateData,
    userId: number
  ): Promise<void> {
    // Verify ownership
    await this.validateLessonPlanOwnership(id, userId);

    // Additional validation could be added here
    this.validateUpdateData(data);
  }

  private validateUpdateData(data: ETFOLessonPlanUpdateData): void {
    // Basic data validation - can be extended as needed
    if (Object.keys(data).length === 0) {
      throw new Error('Update data cannot be empty');
    }
  }

  private processUpdateData(data: ETFOLessonPlanUpdateData): Partial<Prisma.ETFOLessonPlanUpdateInput> {
    // Extract expectation IDs safely
    const expectationIds = this.extractExpectationIds(data);

    // Build update data
    const baseUpdateData = this.buildLessonPlanUpdateData(data);

    // Handle expectations relationship
    return this.buildUpdateInputWithExpectations(baseUpdateData, expectationIds);
  }

  private async executeUpdateQuery(
    id: string,
    updateInput: Partial<Prisma.ETFOLessonPlanUpdateInput>
  ): Promise<Record<string, unknown>> {
    return prisma.eTFOLessonPlan.update({
      where: { id },
      data: updateInput,
      include: this.getUpdateResponseIncludes(),
    });
  }

  private getUpdateResponseIncludes(): Record<string, unknown> {
    return {
      expectations: {
        include: {
          expectation: true,
        },
      },
    };
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

  async addResource(
    lessonPlanId: string,
    resourceData: { url?: string; title: string; type: string; content?: string },
    userId: number,
  ): Promise<unknown> {
    // Verify ownership
    const lessonPlan = await prisma.eTFOLessonPlan.findFirst({
      where: { id: lessonPlanId, userId },
    });

    if (!lessonPlan) {
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

    if (!resource) {
      return false;
    }

    await prisma.eTFOLessonPlanResource.delete({
      where: { id: resourceId },
    });

    return true;
  }

  private async validateOriginalLessonPlan(lessonPlanId: string, userId: number): Promise<any> {
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

    return originalLesson;
  }

  private buildSubFriendlyData(
    originalLesson: ETFOLessonPlanWithRelations,
    userId: number
  ): Prisma.ETFOLessonPlanCreateInput {
    return {
      title: `${originalLesson.title} (Sub-Friendly)`,
      titleFr: originalLesson.titleFr ? `${originalLesson.titleFr} (Sub-Friendly)` : undefined,
      unitPlan: { connect: { id: originalLesson.unitPlanId } },
      user: { connect: { id: userId } },
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
      subNotes: 'Auto-generated substitute-friendly version. Please review and customize as needed.',
      expectations: {
        create: isArray(originalLesson.expectations) ?
          originalLesson.expectations.map((exp) => ({
            expectationId: String(exp.expectationId),
          })) : [],
      },
      resources: {
        create: isArray(originalLesson.resources) ?
          originalLesson.resources.map((resource) => ({
            title: String(resource.title),
            url: resource.url ? String(resource.url) : undefined,
            type: String(resource.type),
            content: resource.content ? String(resource.content) : undefined,
          })) : [],
      },
    };
  }

  async createSubVersion(lessonPlanId: string, userId: number): Promise<unknown> {
    // Validate and fetch original lesson plan
    const originalLesson = await this.validateOriginalLessonPlan(lessonPlanId, userId);

    // Build sub-friendly version data
    const subFriendlyData = this.buildSubFriendlyData(originalLesson, userId);

    return prisma.eTFOLessonPlan.create({ data: subFriendlyData });
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

    if (!lessonPlan) {
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

  private async validateDuplicationSources(
    lessonPlanId: string,
    unitPlanId: string,
    userId: number
  ): Promise<{ sourceLessonPlan: any; targetUnitPlan: any }> {
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

    return { sourceLessonPlan, targetUnitPlan };
  }

  private buildDuplicateCreateData(
    sourceLessonPlan: any,
    unitPlanId: string,
    userId: number,
    options: { date?: string | Date; title?: string }
  ): any {
    const { date, title } = options;

    return {
      title: title ?? `${sourceLessonPlan.title} (Copy)`,
      titleFr: sourceLessonPlan.titleFr,
      unitPlanId,
      userId,
      date: date !== undefined && date !== null ? new Date(date) : sourceLessonPlan.date,
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
        create: sourceLessonPlan.expectations.map((exp: any) => ({
          expectationId: exp.expectationId,
        })) ?? [],
      },
      resources: {
        create: sourceLessonPlan.resources.map((resource: any) => ({
          title: resource.title,
          url: resource.url,
          type: resource.type,
          content: resource.content,
        })),
      },
    };
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

    // Validate sources
    const { sourceLessonPlan } = await this.validateDuplicationSources(
      lessonPlanId,
      unitPlanId,
      userId
    );

    // Build create data
    const createData = this.buildDuplicateCreateData(sourceLessonPlan, unitPlanId, userId, {
      date,
      title,
    });

    return prisma.eTFOLessonPlan.create({ data: createData });
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
      create: async (data: unknown, userId: number) => this.lessonPlanService.create(data as ETFOLessonPlanCreateData, userId),
      findMany: async (filters: unknown, userId: number): Promise<unknown[]> => {
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

  private validateAuthenticationForList(req: AuthenticatedRequest, res: Response): number | null {
    const { userId } = req;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return null;
    }
    return userId;
  }

  private parseAndValidateListQuery(req: AuthenticatedRequest): {
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
  } {
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
    return querySchema.parse(req.query);
  }

  private convertFiltersForService(filters: {
    sortBy: string;
    sortOrder: string;
    startDate?: string;
    endDate?: string;
    unitPlanId?: string;
    [key: string]: unknown;
  }): {
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
  } {
    const { sortBy, sortOrder, startDate, endDate, unitPlanId, ...filterBase } = filters;
    return {
      ...filterBase,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(unitPlanId && { unitPlanId: parseInt(String(unitPlanId), 10) }),
      // Convert sortBy/sortOrder to sort/order for service
      sort: sortBy,
      order: sortOrder,
    } as {
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
    };
  }

  protected async handleList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      // Validate authentication
      const userId = this.validateAuthenticationForList(req, res);
      if (!userId) return;

      // Parse and validate query parameters
      const filters = this.parseAndValidateListQuery(req);

      // Convert filters for service layer
      const convertedFilters = this.convertFiltersForService(filters);

      // Execute query and return result
      const result = await this.lessonPlanService.findMany(convertedFilters, userId);
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
      if (!userId) {
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
      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const { id: lessonPlanId, resourceId } = req.params;

      const success = await this.lessonPlanService.removeResource(lessonPlanId, resourceId, userId);

      if (!success) {
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
      if (!userId) {
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
      if (!userId) {
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
      if (!userId) {
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
