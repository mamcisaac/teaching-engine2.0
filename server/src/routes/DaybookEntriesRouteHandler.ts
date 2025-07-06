/**
 * Daybook Entries Route Handler
 * Extends BaseRouteHandler with daybook-specific business logic and analytics
 */

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@teaching-engine/database';

import { BaseService } from '../services/base/BaseService.js';
import { prisma } from '../prisma.js';
import { DaybookEntryCreateData, DaybookEntryUpdateData } from '../types/routes.js';

import { BaseRouteHandler, AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler.js';
import {
  optimizedIncludes,
  optimizedQueries,
  queryPerformance,
} from './optimizations/queryOptimizations.js';


// Daybook-specific interfaces
interface DaybookEntryForAnalytics {
  date: Date | string;
  rating?: number | null;
  overallRating?: number | null;
  classEngagement?: string | null;
  whatWorked?: string | null;
  whatDidntWork?: string | null;
  commonChallenges?: string | null;
  nextSteps?: string | null;
  wouldReuseLesson?: boolean | null;
  lessonPlan?: {
    unitPlan?: {
      longRangePlan?: {
        subject?: string;
      } | null;
    } | null;
  } | null;
}

// Validation schemas
const daybookEntryCreateSchema = z.object({
  date: z.string().datetime(),
  lessonPlanId: z.string().optional(),
  whatWorked: z.string().optional(),
  whatWorkedFr: z.string().optional(),
  whatDidntWork: z.string().optional(),
  whatDidntWorkFr: z.string().optional(),
  nextSteps: z.string().optional(),
  nextStepsFr: z.string().optional(),
  classEngagement: z.string().optional(),
  commonChallenges: z.string().optional(),
  notableAchievements: z.string().optional(),
  notes: z.string().optional(),
  notesFr: z.string().optional(),
  privateNotes: z.string().optional(),
  overallRating: z.number().int().min(1).max(5).optional(),
  wouldReuseLesson: z.boolean().optional(),
  expectations: z
    .array(
      z.object({
        expectationId: z.string(),
        coverage: z.enum(['introduced', 'developing', 'consolidated']),
      }),
    )
    .optional(),
});

const daybookEntryUpdateSchema = daybookEntryCreateSchema.partial();

const daybookQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  lessonPlanId: z.string().optional(),
  subject: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.enum(['date', 'overallRating', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Analytics helper functions
function calculateTrends(entries: DaybookEntryForAnalytics[]): {
  ratingTrend: string;
  engagementTrend: string;
} {
  if (entries.length < 2) {
    return { ratingTrend: 'insufficient_data', engagementTrend: 'insufficient_data' };
  }

  const sortedEntries = entries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const ratingsWithValues = sortedEntries.filter((e) => e.overallRating !== null);
  let ratingTrend = 'stable';

  if (ratingsWithValues.length >= 3) {
    const firstHalf = ratingsWithValues.slice(0, Math.ceil(ratingsWithValues.length / 2));
    const secondHalf = ratingsWithValues.slice(Math.floor(ratingsWithValues.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, e) => sum + (e.overallRating || 0), 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, e) => sum + (e.overallRating || 0), 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.3) {
      ratingTrend = 'improving';
    } else if (secondAvg < firstAvg - 0.3) {
      ratingTrend = 'declining';
    }
  }

  // Similar logic for engagement trend based on text analysis
  const engagementTrend = 'stable'; // Simplified for this refactoring

  return { ratingTrend, engagementTrend };
}

function extractKeywords(entries: DaybookEntryForAnalytics[]): string[] {
  const stopWords = [
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'was',
    'were',
    'is',
    'are',
    'be',
    'been',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'can',
    'this',
    'that',
    'these',
    'those',
  ];

  const allText = entries
    .map((e) =>
      [e.whatWorked, e.whatDidntWork, e.commonChallenges, e.nextSteps].filter(Boolean).join(' '),
    )
    .join(' ')
    .toLowerCase();

  const words = allText.match(/\b\w{3,}\b/g) || [];
  const wordFreq: Record<string, number> = {};

  words.forEach((word) => {
    if (!stopWords.includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

// Daybook service
class DaybookService extends BaseService {
  constructor() {
    super('DaybookService');
  }

  async findMany(
    filters: {
      startDate?: Date;
      endDate?: Date;
      lessonPlanId?: number;
      subject?: string;
      limit?: number;
      offset?: number;
      sort?: string;
      order?: 'asc' | 'desc';
    },
    userId: number,
  ) {
    const { startDate, endDate, lessonPlanId, subject, limit, offset, sort, order } = filters;

    const where: Prisma.DaybookEntryWhereInput = { userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = { gte: new Date(startDate) };
    } else if (endDate) {
      where.date = { lte: new Date(endDate) };
    }
    if (lessonPlanId) where.lessonPlanId = String(lessonPlanId);

    // Subject filtering through lesson plan relationship
    if (subject) {
      where.lessonPlan = {
        unitPlan: {
          longRangePlan: {
            subject: { contains: subject },
          },
        },
      };
    }

    const orderBy: Prisma.DaybookEntryOrderByWithRelationInput = {};
    if (sort === 'date') orderBy.date = order;
    else if (sort === 'overallRating') orderBy.overallRating = order;
    else if (sort === 'createdAt') orderBy.createdAt = order;

    const result = await queryPerformance.monitorQuery('daybookEntry.findMany', () =>
      optimizedQueries.paginatedQuery(prisma.daybookEntry, where, {
        limit: limit!,
        offset: offset!,
        orderBy,
        include: optimizedIncludes.daybookEntry,
      }),
    );

    const { items: entries, total } = result;

    return {
      entries,
      pagination: {
        total,
        limit: limit!,
        offset: offset!,
        hasMore: offset! + limit! < total,
      },
    };
  }

  async findById(id: string, userId: number) {
    return prisma.daybookEntry.findFirst({
      where: { id, userId },
      include: {
        lessonPlan: {
          select: {
            id: true,
            title: true,
            unitPlan: {
              select: {
                id: true,
                title: true,
                longRangePlan: {
                  select: {
                    subject: true,
                  },
                },
              },
            },
          },
        },
        expectations: {
          include: {
            expectation: {
              select: {
                code: true,
                description: true,
              },
            },
          },
        },
      },
    });
  }

  async create(data: DaybookEntryCreateData, userId: number) {
    const { expectations, ...daybookData } = data;

    return prisma.daybookEntry.create({
      data: {
        ...daybookData,
        userId,
        date: new Date(data.date),
        expectations: expectations
          ? {
              create: expectations.map((exp: { expectationId: string; coverage?: string }) => ({
                expectationId: exp.expectationId,
                coverage: exp.coverage || 'introduced',
              })),
            }
          : undefined,
      },
      include: optimizedIncludes.daybookEntry,
    });
  }

  async update(id: string, data: DaybookEntryUpdateData, userId: number) {
    // Verify ownership
    const entry = await prisma.daybookEntry.findFirst({
      where: { id, userId },
    });

    if (!entry) {
      throw new Error('Daybook entry not found');
    }

    const { expectations, ...updateData } = data;

    return prisma.daybookEntry.update({
      where: { id },
      data: {
        ...updateData,
        ...(data.date && { date: new Date(data.date) }),
        ...(expectations && {
          expectations: {
            deleteMany: {},
            create: expectations.map(
              (exp: { expectationId: string; notes?: string; coverage?: string }) => ({
                expectationId: exp.expectationId,
                coverage: exp.coverage || 'introduced',
              }),
            ),
          },
        }),
      },
      include: optimizedIncludes.daybookEntry,
    });
  }

  async delete(id: string, userId: number): Promise<boolean> {
    const entry = await prisma.daybookEntry.findFirst({
      where: { id, userId },
    });

    if (!entry) {
      return false;
    }

    await prisma.daybookEntry.delete({
      where: { id },
    });

    return true;
  }

  async getInsightsSummary(userId: number) {
    const recentEntries = await prisma.daybookEntry.findMany({
      where: {
        userId,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      include: {
        lessonPlan: {
          select: {
            unitPlan: {
              select: {
                longRangePlan: {
                  select: {
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const trends = calculateTrends(recentEntries);
    const keywords = extractKeywords(recentEntries);

    const averageRating =
      recentEntries.length > 0
        ? recentEntries.reduce((sum: number, entry: { overallRating: number | null }) => sum + (entry.overallRating || 0), 0) /
          recentEntries.length
        : 0;

    const subjectBreakdown = recentEntries.reduce(
      (acc: Record<string, number>, entry) => {
        const subject = entry.lessonPlan?.unitPlan?.longRangePlan?.subject || 'Unknown';
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalEntries: recentEntries.length,
      averageRating: Math.round(averageRating * 10) / 10,
      trends,
      keywords,
      subjectBreakdown,
      timeRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
    };
  }
}

export class DaybookEntriesRouteHandler extends BaseRouteHandler {
  private daybookService: DaybookService;

  constructor() {
    super({
      routeName: 'daybook-entries',
      requireAuth: true,
    });
    this.daybookService = new DaybookService();
  }

  protected getService(): BaseService {
    return this.daybookService;
  }

  protected getValidationSchemas() {
    return {
      create: daybookEntryCreateSchema,
      update: daybookEntryUpdateSchema,
      query: daybookQuerySchema,
    };
  }

  protected getCrudOperations(): CrudOperations<unknown> {
    return {
      create: async (data: unknown, userId: number) => {
        return this.daybookService.create(data as DaybookEntryCreateData, userId);
      },
      findMany: async (filters: unknown, userId: number) => {
        const result = await this.daybookService.findMany(
          filters as {
            startDate?: Date;
            endDate?: Date;
            lessonPlanId?: number;
            subject?: string;
            limit?: number;
            offset?: number;
            sort?: string;
            order?: 'asc' | 'desc';
          },
          userId,
        );
        return result.entries;
      },
      findById: async (id: string, userId: number) => {
        return this.daybookService.findById(id, userId);
      },
      update: async (id: string, data: unknown, userId: number) => {
        return this.daybookService.update(id, data as DaybookEntryUpdateData, userId);
      },
      delete: async (id: string, userId: number) => {
        return this.daybookService.delete(id, userId);
      },
    };
  }

  protected async handleList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const schemas = this.getValidationSchemas();
      const filters = schemas.query.parse(req.query);

      // Convert string dates to Date objects for service and fix field names
      const { sortBy, sortOrder, startDate, endDate, lessonPlanId, ...filterBase } = filters;
      const convertedFilters = {
        ...filterBase,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(lessonPlanId && { lessonPlanId: parseInt(String(lessonPlanId), 10) }),
        // Convert sortBy/sortOrder to sort/order for service
        sort: sortBy,
        order: sortOrder,
      };

      const result = await this.daybookService.findMany(convertedFilters, userId);
      res.json(result);
      return;
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} list:`, _error);
      return next(_error);
    }
  }

  protected setupCustomRoutes(): void {
    // GET /daybook-entries/insights/summary
    this.router.get(
      '/insights/summary',
      this.requireAuthentication,
      this.asyncHandler(this.handleInsightsSummary.bind(this)),
    );
  }

  private async handleInsightsSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const insights = await this.daybookService.getInsightsSummary(userId);
      res.json(insights);
      return;
    } catch (_error) {
      this.logger.error('Error getting insights summary:', _error);
      return next(_error);
    }
  }
}
