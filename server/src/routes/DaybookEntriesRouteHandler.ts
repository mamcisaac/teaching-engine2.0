/**
 * Daybook Entries Route Handler
 * Extends BaseRouteHandler with daybook-specific business logic and analytics
 */

import type { Prisma } from '@teaching-engine/database';
import type { Response, NextFunction } from 'express';
import { z } from 'zod';

import { prisma } from '../prisma.js';
import { BaseService } from '../services/base/BaseService.js';
import type { DaybookEntryCreateData, DaybookEntryUpdateData } from '../types/routes.js';

import type { AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler.js';
import { BaseRouteHandler } from './base/BaseRouteHandler.js';
import {
  optimizedIncludes,
  queryPerformance,
} from './optimizations/queryOptimizations.js';

// Daybook-specific interfaces
interface DaybookEntryWithRelations {
  id: string;
  date: Date;
  rating?: number | null;
  overallRating?: number | null;
  classEngagement?: string | null;
  whatWorked?: string | null;
  whatDidntWork?: string | null;
  commonChallenges?: string | null;
  nextSteps?: string | null;
  wouldReuseLesson?: boolean | null;
  userId: number;
  lessonPlanId?: string | null;
  lessonPlan?: {
    id: string;
    title: string;
    unitPlan?: {
      id: string;
      title: string;
      longRangePlan?: {
        subject: string;
      } | null;
    } | null;
  } | null;
  expectations?: Array<{
    id: string;
    expectationId: string;
    coverage: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface DaybookEntriesListResponse {
  entries: DaybookEntryWithRelations[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface InsightsSummary {
  totalEntries: number;
  averageRating: number | null;
  mostCommonChallenges: Array<{ challenge: string; count: number }>;
  subjectInsights: Array<{ subject: string; averageRating: number; entryCount: number }>;
  engagementTrends: Array<{ period: string; rating: number }>;
  commonSuccesses: string[];
  improvementAreas: string[];
}

interface ValidationSchemas {
  create: typeof daybookEntryCreateSchema;
  update: typeof daybookEntryUpdateSchema;
  query: typeof daybookQuerySchema;
}

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
      firstHalf.reduce((sum, e) => sum + (e.overallRating ?? 0), 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, e) => sum + (e.overallRating ?? 0), 0) / secondHalf.length;

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
      [e.whatWorked, e.whatDidntWork, e.commonChallenges, e.nextSteps].filter((item) => item !== null && item !== '').join(' '),
    )
    .join(' ')
    .toLowerCase();

  const words = allText.match(/\b\w{3,}\b/g) ?? [];
  const wordFreq: Record<string, number> = {};

  words.forEach((word) => {
    if (stopWords.includes(word) === false) {
      wordFreq[word] = (wordFreq[word] ?? 0) + 1;
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
  ): Promise<DaybookEntriesListResponse> {
    const { startDate, endDate, lessonPlanId, subject, limit, offset, sort, order } = filters;

    const where: Prisma.DaybookEntryWhereInput = { userId };

    if (startDate !== null && endDate !== null) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate !== null) {
      where.date = { gte: new Date(startDate) };
    } else if (endDate !== null) {
      where.date = { lte: new Date(endDate) };
    }
    if (lessonPlanId !== null && lessonPlanId !== 0) {
      where.lessonPlanId = String(lessonPlanId);
    }

    // Subject filtering through lesson plan relationship
    if (subject !== null && subject !== '') {
      where.lessonPlan = {
        unitPlan: {
          longRangePlan: {
            subject: { contains: subject },
          },
        },
      };
    }

    const orderBy: Prisma.DaybookEntryOrderByWithRelationInput = {};
    if (sort === 'date') {
orderBy.date = order;
} else if (sort === 'overallRating') {
orderBy.overallRating = order;
} else if (sort === 'createdAt') {
orderBy.createdAt = order;
}

    const result = await queryPerformance.monitorQuery('daybookEntry.findMany', async () => {
      const [items, total] = await Promise.all([
        prisma.daybookEntry.findMany({
          where,
          take: limit ?? 10,
          skip: offset ?? 0,
          orderBy,
          include: optimizedIncludes.daybookEntry,
        }),
        prisma.daybookEntry.count({ where }),
      ]);
      return { items, total };
    });

    const { items: entries, total } = result;

    return {
      entries,
      pagination: {
        total,
        limit: limit ?? 10,
        offset: offset ?? 0,
        hasMore: (offset ?? 0) + (limit ?? 10) < total,
      },
    };
  }

  async findById(id: string, userId: number): Promise<DaybookEntryWithRelations | null> {
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

  async create(data: DaybookEntryCreateData, userId: number): Promise<DaybookEntryWithRelations> {
    const { expectations, ...daybookData } = data as unknown as Record<string, unknown>;

    return prisma.daybookEntry.create({
      data: {
        ...daybookData,
        userId,
        date: new Date(data.date),
        expectations: expectations !== null && Array.isArray(expectations)
          ? {
              create: expectations.map((exp: unknown) => {
                const expectation = exp as { expectationId: string; coverage?: string };
                return {
                  expectationId: expectation.expectationId,
                  coverage: expectation.coverage ?? 'introduced',
                };
              }),
            }
          : undefined,
      },
      include: optimizedIncludes.daybookEntry,
    });
  }

  async update(id: string, data: DaybookEntryUpdateData, userId: number): Promise<DaybookEntryWithRelations> {
    // Verify ownership
    const entry = await prisma.daybookEntry.findFirst({
      where: { id, userId },
    });

    if (entry === null) {
      throw new Error('Daybook entry not found');
    }

    const { expectations, ...updateData } = data;

    return prisma.daybookEntry.update({
      where: { id },
      data: {
        ...updateData as Prisma.DaybookEntryUpdateInput,
        ...(data.date !== null && data.date !== '' && { date: new Date(data.date) }),
        ...(expectations !== null && Array.isArray(expectations) && {
          expectations: {
            deleteMany: {},
            create: expectations.map((exp: unknown) => {
              const expectation = exp as { expectationId: string; notes?: string; coverage?: string };
              return {
                expectationId: expectation.expectationId,
                coverage: expectation.coverage ?? 'introduced',
              };
            }),
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

    if (entry === null) {
      return false;
    }

    await prisma.daybookEntry.delete({
      where: { id },
    });

    return true;
  }

  async getInsightsSummary(userId: number): Promise<InsightsSummary> {
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
        ? recentEntries.reduce((sum: number, entry: { overallRating: number | null }) => sum + (entry.overallRating ?? 0), 0) /
          recentEntries.length
        : 0;

    const subjectBreakdown = recentEntries.reduce<Record<string, number>>(
      (acc: Record<string, number>, entry) => {
        const subject = entry.lessonPlan.unitPlan.longRangePlan.subject ?? 'Unknown';
        acc[subject] = (acc[subject] ?? 0) + 1;
        return acc;
      },
      {},
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

  protected getValidationSchemas(): ValidationSchemas {
    return {
      create: daybookEntryCreateSchema,
      update: daybookEntryUpdateSchema,
      query: daybookQuerySchema,
    };
  }

  protected getCrudOperations(): CrudOperations<unknown> {
    return {
      create: async (data: unknown, userId: number) => this.daybookService.create(data as DaybookEntryCreateData, userId),
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
      findById: async (id: string, userId: number) => this.daybookService.findById(id, userId),
      update: async (id: string, data: unknown, userId: number) => this.daybookService.update(id, data as DaybookEntryUpdateData, userId),
      delete: async (id: string, userId: number) => this.daybookService.delete(id, userId),
    };
  }

  protected async handleList(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {userId} = req;
      if (userId === null) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const schemas = this.getValidationSchemas();
      const filters = schemas.query.parse(req.query);

      // Convert string dates to Date objects for service and fix field names
      const { sortBy, sortOrder, startDate, endDate, lessonPlanId, ...filterBase } = filters;
      const convertedFilters = {
        ...filterBase,
        ...(startDate !== null && startDate !== '' && { startDate: new Date(startDate as string | number | Date) }),
        ...(endDate !== null && endDate !== '' && { endDate: new Date(endDate as string | number | Date) }),
        ...(lessonPlanId !== null && lessonPlanId !== '' && { lessonPlanId: parseInt(String(lessonPlanId), 10) }),
        // Convert sortBy/sortOrder to sort/order for service
        sort: sortBy,
        order: sortOrder,
      };

      const result = await this.daybookService.findMany(convertedFilters as { startDate?: Date | undefined; endDate?: Date | undefined; lessonPlanId?: number | undefined; subject?: string | undefined; limit?: number | undefined; offset?: number | undefined; sort?: string | undefined; order?: "asc" | "desc" | undefined; }, userId as string | undefined);
      res.json(result);
      return;
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} list:`, _error as string | undefined);
      next(_error); return;
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
      const {userId} = req;
      if (userId === null) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }
      const insights = await this.daybookService.getInsightsSummary(userId);
      res.json(insights);
      return;
    } catch (_error) {
      this.logger.error('Error getting insights summary:', _error as string | undefined);
      next(_error); return;
    }
  }
}
