/**
 * Templates Route Handler
 * Extends BaseRouteHandler with templates-specific business logic
 */

import { isDefined, isObject, isArray, hasProperty, isString, isValidNumber } from '@shared/utils/typeGuards';
import type { Prisma } from '@teaching-engine/database';
import type { Response, NextFunction } from 'express';
import { z } from 'zod';

import { prisma } from '../prisma';
import { BaseService } from '../services/base/BaseService';
import type { TemplateCreateData, TemplateUpdateData } from '../types/routes';
import { isValidStringProperty, isNumber } from '../utils/typeGuards';

import type { AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler';
import { BaseRouteHandler } from './base/BaseRouteHandler';
import { commonValidations } from './base/validation';
import {
  optimizedIncludes,
  optimizedQueries,
  queryPerformance,
} from './optimizations/queryOptimizations';

// Template-specific validation schemas
const templateContentSchema = z.object({
  // Unit Plan fields
  overview: z.string().optional(),
  learningGoals: z.array(z.string()).optional(),
  bigIdeas: z.string().optional(),
  essentialQuestions: z.array(z.string()).optional(),
  assessments: z.array(z.record(z.unknown())).optional(),
  activities: z.array(z.record(z.unknown())).optional(),
  successCriteria: z.array(z.string()).optional(),
  keyVocabulary: z.array(z.string()).optional(),
  crossCurricularConnections: z.string().optional(),
  differentiationStrategies: z
    .object({
      forStruggling: z.array(z.string()).optional(),
      forAdvanced: z.array(z.string()).optional(),
      forELL: z.array(z.string()).optional(),
      forIEP: z.array(z.string()).optional(),
    })
    .optional(),

  // Lesson Plan fields
  minds_on: z.record(z.unknown()).optional(),
  action: z.record(z.unknown()).optional(),
  consolidation: z.record(z.unknown()).optional(),
  materials: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
  assessment: z.record(z.unknown()).optional(),
  accommodations: z.array(z.string()).optional(),
  extensions: z.array(z.string()).optional(),
});

const templateCreateSchema = z.object({
  title: commonValidations.title,
  titleFr: commonValidations.titleFr,
  description: commonValidations.description,
  descriptionFr: commonValidations.descriptionFr,
  type: z.enum(['UNIT_PLAN', 'LESSON_PLAN']),
  category: z.enum(['BY_SUBJECT', 'BY_GRADE', 'BY_THEME', 'BY_SEASON', 'BY_SKILL', 'CUSTOM']),
  subject: commonValidations.subject,
  gradeMin: z.number().int().min(1).max(12).optional(),
  gradeMax: z.number().int().min(1).max(12).optional(),
  tags: commonValidations.tags,
  keywords: commonValidations.keywords,
  estimatedWeeks: commonValidations.estimatedWeeks,
  estimatedMinutes: commonValidations.estimatedMinutes,
  content: templateContentSchema,
});

const templateUpdateSchema = templateCreateSchema.partial();

const templateQuerySchema = z.object({
  type: z.enum(['UNIT_PLAN', 'LESSON_PLAN']).optional(),
  category: z
    .enum(['BY_SUBJECT', 'BY_GRADE', 'BY_THEME', 'BY_SEASON', 'BY_SKILL', 'CUSTOM'])
    .optional(),
  subject: z.string().optional(),
  gradeMin: z.coerce.number().int().min(1).max(12).optional(),
  gradeMax: z.coerce.number().int().min(1).max(12).optional(),
  isSystem: z.coerce.boolean().optional(),
  search: z.string().optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => (typeof val === 'string' ? [val] : val)),
  sortBy: z.enum(['title', 'usageCount', 'averageRating', 'createdAt', 'lastUsedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

// Helper function to safely get numeric values
function getNumericValue(value: unknown, defaultValue: number): number {
  if (value === null || value === undefined) {
return defaultValue;
}
  if (typeof value === 'number' && !isNaN(value)) {
return value;
}
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) ? parsed : defaultValue;
  }
  return defaultValue;
}

// Template service that handles business logic
class TemplateService extends BaseService {
  constructor() {
    super('TemplateService');
  }

  async findMany(filters: Record<string, unknown>, userId: number): Promise<{ templates: Record<string, unknown>[]; pagination: { total: number; limit: number; offset: number; hasMore: boolean } }> {
    const {
      type,
      category,
      subject,
      gradeMin,
      gradeMax,
      isSystem,
      search,
      tags,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 10,
      offset = 0,
    } = filters;

    // Build where clause using optimized ownership filter
    const ownershipWhere = optimizedQueries.createOwnershipWhere(userId);
    if (!isObject(ownershipWhere) || !hasProperty(ownershipWhere, 'AND') || !isArray(ownershipWhere.AND)) {
      throw new Error('Invalid ownership where clause structure');
    }
    const where = ownershipWhere as { AND: Record<string, unknown>[] };

    if (isValidStringProperty(type)) {
      where.AND.push({ type });
    }
    if (isValidStringProperty(category)) {
      where.AND.push({ category });
    }
    if (isValidStringProperty(subject)) {
      where.AND.push({ subject: { contains: subject, mode: 'insensitive' } });
    }
    if (isNumber(gradeMin) && gradeMin !== 0) {
      where.AND.push({ gradeMin: { gte: gradeMin } });
    }
    if (isNumber(gradeMax) && gradeMax !== 0) {
      where.AND.push({ gradeMax: { lte: gradeMax } });
    }
    if (isDefined(isSystem)) {
      where.AND.push({ isSystem });
    }

    // Search functionality using optimized search utility
    if (isValidStringProperty(search)) {
      const searchWhere = optimizedQueries.createSearchWhere(search, [
        'title',
        'description',
        'subject',
      ]);
      where.AND.push(searchWhere);
    }

    // Tag filtering
    if (Array.isArray(tags) && tags.length > 0) {
      where.AND.push({
        tags: {
          path: [],
          array_contains: tags,
        } as Prisma.JsonFilter,
      });
    }

    // Sorting with validation
    const orderBy = queryPerformance.createOptimizedSort(
      String(sortBy || 'title'),
      (sortOrder || 'asc') as 'asc' | 'desc',
      ['title', 'usageCount', 'averageRating', 'createdAt', 'lastUsedAt'],
    );

    const result = await queryPerformance.monitorQuery('template.findMany', () =>
      optimizedQueries.paginatedQuery(prisma.planTemplate, where, {
        limit: getNumericValue(limit, 20),
        offset: getNumericValue(offset, 0),
        orderBy,
        include: optimizedIncludes.template,
      }),
    );

    if (!isObject(result) || !hasProperty(result, 'items') || !hasProperty(result, 'total')) {
      throw new Error('Invalid query result structure');
    }
    const { items: templates, total } = result;

    const finalLimit = getNumericValue(limit, 20);
    const finalOffset = getNumericValue(offset, 0);
    
    const validatedTemplates = isArray(templates) ? templates as Record<string, unknown>[] : [];
    
    return {
      templates: validatedTemplates,
      pagination: {
        total,
        limit: finalLimit,
        offset: finalOffset,
        hasMore: finalOffset + finalLimit < total,
      },
    };
  }

  async findById(id: string, userId: number): Promise<Record<string, unknown> | null> {
    return queryPerformance.monitorQuery('template.findById', () =>
      prisma.planTemplate.findFirst({
        where: {
          id,
          OR: [{ isSystem: true }, { createdByUserId: userId }],
        },
        include: optimizedIncludes.template,
      }),
    );
  }

  async create(data: TemplateCreateData, userId: number): Promise<Record<string, unknown>> {
    return prisma.planTemplate.create({
      data: {
        title: data.title,
        titleFr: data.titleFr,
        description: data.description,
        descriptionFr: data.descriptionFr,
        type: data.type as 'UNIT_PLAN' | 'LESSON_PLAN',
        category: data.category as
          | 'BY_SUBJECT'
          | 'BY_GRADE'
          | 'BY_THEME'
          | 'BY_SEASON'
          | 'BY_SKILL'
          | 'CUSTOM',
        subject: data.subject,
        gradeMin: data.gradeMin,
        gradeMax: data.gradeMax,
        tags: isDefined(data.tags) ? data.tags : [],
        keywords: isDefined(data.tags) ? data.tags : [], // Use same as tags for now
        isSystem: data.isSystem ?? false,
        createdByUserId: userId,
        content: isDefined(data.content) ? data.content : {},
      },
    });
  }

  async update(id: string, data: TemplateUpdateData, userId: number): Promise<Record<string, unknown>> {
    // Check ownership
    const template = await prisma.planTemplate.findFirst({
      where: {
        id,
        createdByUserId: userId, // Only allow updating own templates
      },
    });

    if (!template) {
      throw new Error('Template not found or access denied');
    }

    return prisma.planTemplate.update({
      where: { id },
      data: {
        ...(isDefined(data.title) && isValidStringProperty(data.title) && { title: data.title }),
        ...(isDefined(data.titleFr) && isValidStringProperty(data.titleFr) && { titleFr: data.titleFr }),
        ...(isDefined(data.description) && isValidStringProperty(data.description) && { description: data.description }),
        ...(isDefined(data.descriptionFr) && isValidStringProperty(data.descriptionFr) && { descriptionFr: data.descriptionFr }),
        ...(isDefined(data.type) && isValidStringProperty(data.type) && { type: data.type as 'UNIT_PLAN' | 'LESSON_PLAN' }),
        ...(isDefined(data.category) && isValidStringProperty(data.category) && {
          category: data.category as
            | 'BY_SUBJECT'
            | 'BY_GRADE'
            | 'BY_THEME'
            | 'BY_SEASON'
            | 'BY_SKILL'
            | 'CUSTOM',
        }),
        ...(isDefined(data.subject) && isValidStringProperty(data.subject) && { subject: data.subject }),
        ...(isDefined(data.gradeMin) && { gradeMin: data.gradeMin }),
        ...(isDefined(data.gradeMax) && { gradeMax: data.gradeMax }),
        ...(isDefined(data.tags) && { tags: data.tags }),
        ...(isDefined(data.content) && { content: data.content }),
        ...(isDefined(data.templateData) && { templateData: data.templateData }),
      },
    });
  }

  async delete(id: string, userId: number): Promise<boolean> {
    // Check ownership
    const template = await prisma.planTemplate.findFirst({
      where: {
        id,
        createdByUserId: userId, // Only allow deleting own templates
        isSystem: false, // Can't delete system templates
      },
    });

    if (!template) {
      return false;
    }

    await prisma.planTemplate.delete({
      where: { id },
    });

    return true;
  }

  async getFilterOptions(userId: number): Promise<{ subjects: string[]; grades: number[]; categories: string[]; tags: string[] }> {
    const [subjects, grades, categories, tags] = await Promise.all([
      prisma.planTemplate.findMany({
        where: {
          OR: [{ isSystem: true }, { createdByUserId: userId }],
          subject: { not: null },
        },
        select: { subject: true },
        distinct: ['subject'],
      }),
      prisma.planTemplate.findMany({
        where: {
          AND: [
            {
              OR: [{ isSystem: true }, { createdByUserId: userId }],
            },
            {
              OR: [{ gradeMin: { not: null } }, { gradeMax: { not: null } }],
            },
          ],
        },
        select: { gradeMin: true, gradeMax: true },
      }),
      prisma.planTemplate.findMany({
        select: { category: true },
        distinct: ['category'],
      }),
      prisma.planTemplate.findMany({
        where: {
          OR: [{ isSystem: true }, { createdByUserId: userId }],
        },
        select: { tags: true },
      }),
    ]);

    const uniqueSubjects = subjects
      .filter(t => isObject(t) && hasProperty(t, 'subject'))
      .map((t) => t.subject)
      .filter((s): s is string => isString(s))
      .sort();

    const gradeRange = grades.reduce(
      (range, template) => {
        if (isValidNumber(template.gradeMin) && template.gradeMin !== 0) {
          range.min = Math.min(range.min, template.gradeMin);
        }
        if (isValidNumber(template.gradeMax) && template.gradeMax !== 0) {
          range.max = Math.max(range.max, template.gradeMax);
        }
        return range;
      },
      { min: 12, max: 1 },
    );

    const allTags = tags
      .filter(t => isObject(t) && hasProperty(t, 'tags'))
      .flatMap((t) => isArray(t.tags) ? t.tags.filter(tag => isString(tag)) : [])
      .filter((tag, index, array) => array.indexOf(tag) === index)
      .sort();

    return {
      subjects: uniqueSubjects,
      grades: Array.from(
        { length: gradeRange.max - gradeRange.min + 1 },
        (_, i) => gradeRange.min + i,
      ),
      categories: categories
        .filter(c => isObject(c) && hasProperty(c, 'category') && isString(c.category))
        .map((c) => c.category as string),
      tags: allTags,
    };
  }
}

export class TemplatesRouteHandler extends BaseRouteHandler {
  private templateService: TemplateService;

  constructor() {
    super({
      routeName: 'templates',
      requireAuth: true,
    });
    this.templateService = new TemplateService();
  }

  protected getService(): BaseService {
    return this.templateService;
  }

  protected getValidationSchemas(): { create: typeof templateCreateSchema; update: typeof templateUpdateSchema; query: typeof templateQuerySchema } {
    return {
      create: templateCreateSchema,
      update: templateUpdateSchema,
      query: templateQuerySchema,
    };
  }

  protected getCrudOperations(): CrudOperations<unknown> {
    return {
      create: async (data: unknown, userId: number): Promise<Record<string, unknown>> => {
        if (!isObject(data)) {
throw new Error('Invalid create data');
}
        return this.templateService.create(data as unknown as TemplateCreateData, userId);
      },
      findMany: async (filters: unknown, userId: number): Promise<Record<string, unknown>[]> => {
        if (!isObject(filters)) {
throw new Error('Invalid filters');
}
        const result = await this.templateService.findMany(
          filters as Record<string, unknown>,
          userId,
        );
        return result.templates;
      },
      findById: async (id: string, userId: number) => this.templateService.findById(id, userId),
      update: async (id: string, data: unknown, userId: number) => {
        if (!isObject(data)) {
throw new Error('Invalid update data');
}
        return this.templateService.update(id, data as TemplateUpdateData, userId);
      },
      delete: async (id: string, userId: number) => this.templateService.delete(id, userId),
    };
  }

  /**
   * Override the list handler to return the custom structure
   */
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

      const result = await this.templateService.findMany(filters, userId);
      res.json(result);
      return;
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} list:`, _error as string | undefined);
      next(_error); return;
    }
  }

  /**
   * Add custom routes
   */
  protected setupCustomRoutes(): void {
    // GET /templates/filter-options
    this.router.get(
      '/filter-options',
      this.requireAuthentication,
      this.asyncHandler(this.handleFilterOptions.bind(this)),
    );
  }

  private async handleFilterOptions(
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
      const options = await this.templateService.getFilterOptions(userId);
      res.json(options);
      return;
    } catch (_error) {
      this.logger.error('Error getting filter options:', _error as string | undefined);
      next(_error); return;
    }
  }
}
