/**
 * Daybook Entries Route Handler
 * Extends BaseRouteHandler with daybook-specific business logic and analytics
 */

import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { BaseRouteHandler, AuthenticatedRequest, CrudOperations } from './base/BaseRouteHandler.js';
import { BaseService } from '../services/base/BaseService.js';
import { prisma } from '../prisma.js';
import { Prisma } from '@teaching-engine/database';
import { optimizedIncludes, optimizedQueries, queryPerformance } from './optimizations/queryOptimizations.js';

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

    const firstAvg = firstHalf.reduce((sum, e) => sum + (e.overallRating || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, e) => sum + (e.overallRating || 0), 0) / secondHalf.length;

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
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'was', 'were', 'is', 'are', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ];

  const allText = entries
    .map(e => [e.whatWorked, e.whatDidntWork, e.commonChallenges, e.nextSteps].filter(Boolean).join(' '))
    .join(' ')
    .toLowerCase();

  const words = allText.match(/\b\w{3,}\b/g) || [];
  const wordFreq: Record<string, number> = {};

  words.forEach(word => {
    if (!stopWords.includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

// Daybook service
class DaybookService extends BaseService {
  constructor() {
    super('DaybookService');
  }

  async findMany(filters: unknown, userId: number) {
    const {
      startDate,
      endDate,
      lessonPlanId,
      subject,
      limit,
      offset,
      sortBy,
      sortOrder,
    } = filters;

    const where: Prisma.DaybookEntryWhereInput = { userId };

    if (startDate) where.date = { gte: new Date(startDate) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) };
    if (lessonPlanId) where.lessonPlanId = lessonPlanId;

    // Subject filtering through lesson plan relationship
    if (subject) {
      where.lessonPlan = {
        unitPlan: {
          longRangePlan: {
            subject: { contains: subject, mode: 'insensitive' }
          }
        }
      };
    }

    const orderBy: Prisma.DaybookEntryOrderByWithRelationInput = {};
    if (sortBy === 'date') orderBy.date = sortOrder;
    else if (sortBy === 'overallRating') orderBy.overallRating = sortOrder;
    else if (sortBy === 'createdAt') orderBy.createdAt = sortOrder;

    const result = await queryPerformance.monitorQuery(
      'daybookEntry.findMany',
      () => optimizedQueries.paginatedQuery(
        prisma.daybookEntry,
        where,
        {
          limit,
          offset,
          orderBy,
          include: optimizedIncludes.daybookEntry,
        }
      )
    );

    const { items: entries, total } = result;

    return {
      entries,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
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

  async create(data: unknown, userId: number) {
    const { expectations, ...daybookData } = data;
    
    return prisma.daybookEntry.create({
      data: {
        ...daybookData,
        userId,
        date: new Date(data.date),
        expectations: expectations
          ? {
              create: expectations.map((exp: any) => ({
                expectationId: exp.expectationId,
                coverage: exp.coverage,
              })),
            }
          : undefined,
      },
      include: optimizedIncludes.daybookEntry,
    });
  }

  async update(id: string, data: unknown, userId: number) {
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
            create: expectations.map((exp: any) => ({
              expectationId: exp.expectationId,
              coverage: exp.coverage,
            })),
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

    const averageRating = recentEntries.length > 0
      ? recentEntries.reduce((sum, entry) => sum + (entry.overallRating || 0), 0) / recentEntries.length
      : 0;

    const subjectBreakdown = recentEntries.reduce((acc, entry) => {
      const subject = entry.lessonPlan?.unitPlan?.longRangePlan?.subject || 'Unknown';
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
      create: this.daybookService.create.bind(this.daybookService),
      findMany: this.daybookService.findMany.bind(this.daybookService),
      findById: this.daybookService.findById.bind(this.daybookService),
      update: this.daybookService.update.bind(this.daybookService),
      delete: this.daybookService.delete.bind(this.daybookService),
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
      
      const result = await this.daybookService.findMany(filters, userId);
      res.json(result);
    } catch (_error) {
      this.logger.error(`Error in ${this.routeName} list:`, _error);
      next(_error);
    }
  }

  protected setupCustomRoutes(): void {
    // GET /daybook-entries/insights/summary
    this.router.get(
      '/insights/summary',
      this.requireAuthentication,
      this.asyncHandler(this.handleInsightsSummary.bind(this))
    );
  }

  private async handleInsightsSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId!;
      const insights = await this.daybookService.getInsightsSummary(userId);
      res.json(insights);
    } catch (_error) {
      this.logger.error('Error getting insights summary:', _error);
      next(_error);
    }
  }
}