/**
 * Templates Route Handler
 * Extends BaseRouteHandler with templates-specific business logic
 */

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { BaseRouteHandler, AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler.js';
import { BaseService } from '../services/base/BaseService.js';
import { commonValidations } from './base/validation.js';
import { prisma } from '../prisma.js';
import { Prisma } from '@teaching-engine/database';
import { optimizedIncludes, optimizedQueries, queryPerformance } from './optimizations/queryOptimizations.js';
import { TemplateCreateData, TemplateUpdateData } from '../types/routes.js';

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
  category: z.enum(['BY_SUBJECT', 'BY_GRADE', 'BY_THEME', 'BY_SEASON', 'BY_SKILL', 'CUSTOM']).optional(),
  subject: z.string().optional(),
  gradeMin: z.coerce.number().int().min(1).max(12).optional(),
  gradeMax: z.coerce.number().int().min(1).max(12).optional(),
  isSystem: z.coerce.boolean().optional(),
  search: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
    typeof val === 'string' ? [val] : val
  ),
  sortBy: z.enum(['title', 'usageCount', 'averageRating', 'createdAt', 'lastUsedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

// Template service that handles business logic
class TemplateService extends BaseService {
  constructor() {
    super('TemplateService');
  }

  async findMany(filters: Record<string, any>, userId: number) {
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
    const where = optimizedQueries.createOwnershipWhere(userId);

    if (type) where.AND.push({ type });
    if (category) where.AND.push({ category });
    if (subject) where.AND.push({ subject: { contains: subject, mode: 'insensitive' } });
    if (gradeMin) where.AND.push({ gradeMin: { gte: gradeMin } });
    if (gradeMax) where.AND.push({ gradeMax: { lte: gradeMax } });
    if (isSystem !== undefined) where.AND.push({ isSystem });

    // Search functionality using optimized search utility
    if (search) {
      const searchWhere = optimizedQueries.createSearchWhere(search, ['title', 'description', 'subject']);
      where.AND.push(searchWhere);
    }

    // Tag filtering
    if (tags && tags.length > 0) {
      where.AND.push({
        tags: {
          path: [],
          array_contains: tags,
        } as Prisma.JsonFilter,
      });
    }

    // Sorting with validation
    const orderBy = queryPerformance.createOptimizedSort(
      sortBy,
      sortOrder,
      ['title', 'usageCount', 'averageRating', 'createdAt', 'lastUsedAt']
    );

    const result = await queryPerformance.monitorQuery(
      'template.findMany',
      () => optimizedQueries.paginatedQuery(
        prisma.planTemplate,
        where,
        {
          limit,
          offset,
          orderBy,
          include: optimizedIncludes.template,
        }
      )
    );

    const { items: templates, total } = result;

    return {
      templates,
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
      'template.findById',
      () => prisma.planTemplate.findFirst({
        where: {
          id,
          OR: [{ isSystem: true }, { createdByUserId: userId }],
        },
        include: optimizedIncludes.template,
      })
    );
  }

  async create(data: TemplateCreateData, userId: number) {
    return prisma.planTemplate.create({
      data: {
        title: data.title,
        titleFr: data.titleFr,
        description: data.description,
        descriptionFr: data.descriptionFr,
        type: data.type as any, // Will be validated by schema
        category: data.category as any, // Will be validated by schema
        subject: data.subject,
        gradeMin: data.gradeMin,
        gradeMax: data.gradeMax,
        tags: data.tags || [],
        keywords: data.tags || [], // Use same as tags for now
        isSystem: data.isSystem ?? false,
        createdByUserId: userId,
        content: data.content || {},
      },
    });
  }

  async update(id: string, data: TemplateUpdateData, userId: number) {
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
        ...(data.title && { title: data.title }),
        ...(data.titleFr && { titleFr: data.titleFr }),
        ...(data.description && { description: data.description }),
        ...(data.descriptionFr && { descriptionFr: data.descriptionFr }),
        ...(data.type && { type: data.type as any }),
        ...(data.category && { category: data.category as any }),
        ...(data.subject && { subject: data.subject }),
        ...(data.gradeMin !== undefined && { gradeMin: data.gradeMin }),
        ...(data.gradeMax !== undefined && { gradeMax: data.gradeMax }),
        ...(data.tags && { tags: data.tags }),
        ...(data.content && { content: data.content }),
        ...(data.templateData && { templateData: data.templateData }),
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

  async getFilterOptions(userId: number) {
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
      .map((t) => t.subject)
      .filter((s) => s !== null)
      .sort();

    const gradeRange = grades.reduce(
      (range, template) => {
        if (template.gradeMin) range.min = Math.min(range.min, template.gradeMin);
        if (template.gradeMax) range.max = Math.max(range.max, template.gradeMax);
        return range;
      },
      { min: 12, max: 1 },
    );

    const allTags = tags
      .flatMap((t) => (Array.isArray(t.tags) ? t.tags : []))
      .filter((tag, index, array) => array.indexOf(tag) === index)
      .sort();

    return {
      subjects: uniqueSubjects,
      grades: Array.from(
        { length: gradeRange.max - gradeRange.min + 1 },
        (_, i) => gradeRange.min + i,
      ),
      categories: categories.map((c) => c.category),
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

  protected getValidationSchemas() {
    return {
      create: templateCreateSchema,
      update: templateUpdateSchema,
      query: templateQuerySchema,
    };
  }

  protected getCrudOperations(): CrudOperations<unknown> {
    return {
      create: this.templateService.create.bind(this.templateService),
      findMany: this.templateService.findMany.bind(this.templateService),
      findById: this.templateService.findById.bind(this.templateService),
      update: this.templateService.update.bind(this.templateService),
      delete: this.templateService.delete.bind(this.templateService),
    };
  }

  /**
   * Override the list handler to return the custom structure
   */
  protected async handleList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const schemas = this.getValidationSchemas();
      const filters = schemas.query.parse(req.query);
      
      const result = await this.templateService.findMany(filters, userId);
      res.json(result);
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} list:`, _error);
      next(_error);
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
      this.asyncHandler(this.handleFilterOptions.bind(this))
    );
  }

  private async handleFilterOptions(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const options = await this.templateService.getFilterOptions(userId);
      res.json(options);
    } catch (_error) {
      this.logger.error('Error getting filter options:', _error);
      next(_error);
    }
  }
}