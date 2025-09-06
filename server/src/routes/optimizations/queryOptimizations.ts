/**
 * Database Query Optimizations
 * Centralized optimizations for common query patterns
 */

import type { Prisma } from '@teaching-engine/database';

import { logger } from '../../logger';

// Type definitions for query optimization
interface PrismaModel {
  findMany(args?: Record<string, unknown>): Promise<unknown[]>;
  count(args?: Record<string, unknown>): Promise<number>;
}

interface PaginationOptions {
  limit: number;
  offset: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
  include?: Record<string, unknown>;
  select?: Record<string, boolean>;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
}

type WhereCondition = Record<string, unknown>;
type SortOrder = 'asc' | 'desc';
/**
 * Optimized select patterns for common relationships
 */
// Basic user selection (exclude sensitive data)
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

export const optimizedSelects = {
  user: userSelect,

  // Minimal lesson plan selection for lists
  lessonPlanMinimal: {
    id: true,
    title: true,
    date: true,
    duration: true,
  },

  // Unit plan with essential relationships
  unitPlanWithPlan: {
    id: true,
    title: true,
    longRangePlan: {
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
      },
    },
  },

  // Curriculum expectation essential fields
  expectationMinimal: {
    code: true,
    description: true,
    strand: true,
    substrand: true,
  },

  // Daybook entry with optimized relationships
  daybookEntryOptimized: {
    id: true,
    date: true,
    overallRating: true,
    whatWorked: true,
    whatDidntWork: true,
    nextSteps: true,
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
  },

  // Template with minimal data for lists
  templateMinimal: {
    id: true,
    title: true,
    type: true,
    category: true,
    subject: true,
    gradeMin: true,
    gradeMax: true,
    usageCount: true,
    averageRating: true,
    createdAt: true,
    createdByUser: {
      select: userSelect,
    },
  },
};

/**
 * Optimized include patterns with proper selections
 */
export const optimizedIncludes = {
  // Daybook entry with relationships
  daybookEntry: {
    lessonPlan: {
      select: optimizedSelects.lessonPlanMinimal,
    },
    expectations: {
      select: {
        expectationId: true,
        coverage: true,
        expectation: {
          select: optimizedSelects.expectationMinimal,
        },
      },
    },
  },

  // Unit plan with relationships
  unitPlan: {
    longRangePlan: {
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
      },
    },
    _count: {
      select: {
        lessonPlans: true,
      },
    },
    expectations: {
      select: {
        unitPlanId: true,
        expectationId: true,
        expectation: {
          select: optimizedSelects.expectationMinimal,
        },
      },
    },
    lessonPlans: {
      select: optimizedSelects.lessonPlanMinimal,
      orderBy: { createdAt: 'asc' as Prisma.SortOrder },
    },
  },

  // ETFO lesson plan with relationships
  etfoLessonPlan: {
    unitPlan: {
      select: optimizedSelects.unitPlanWithPlan,
    },
    expectations: {
      select: {
        lessonPlanId: true,
        expectationId: true,
        expectation: {
          select: optimizedSelects.expectationMinimal,
        },
      },
    },
    resources: {
      select: {
        id: true,
        title: true,
        url: true,
        type: true,
        content: true,
      },
    },
  },

  // Template with relationships
  template: {
    createdByUser: {
      select: userSelect,
    },
    ratings: {
      select: {
        id: true,
        userId: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' as Prisma.SortOrder },
      take: 5,
    },
    variations: {
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' as Prisma.SortOrder },
    },
  },
};

/**
 * Common query patterns with optimizations
 */
export const optimizedQueries = {
  /**
   * Get paginated results with count optimization
   */
  async paginatedQuery<T>(
    model: PrismaModel,
    where: WhereCondition,
    options: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    const { limit, offset, orderBy, include, select } = options;

    // Use transaction for consistency
    const [items, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        ...(include && { include }),
        ...(select && { select }),
      }),
      model.count({ where }),
    ]);

    return { items: items as T[], total };
  },

  /**
   * Optimized search query with text search
   */
  createSearchWhere(searchTerm: string, fields: string[]): WhereCondition {
    if (searchTerm === '' || searchTerm === undefined || fields.length === 0) {
return {};
}

    return {
      OR: fields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive' as Prisma.QueryMode,
        },
      })),
    };
  },

  /**
   * Date range filter optimization
   */
  createDateRangeWhere(
    dateField: string,
    startDate?: string | Date,
    endDate?: string | Date
  ): WhereCondition {
    const where: WhereCondition = {};

    if (startDate !== undefined || endDate !== undefined) {
      where[dateField] = {};
      if (startDate !== undefined) {
        (where[dateField] as Record<string, unknown>).gte = startDate instanceof Date ? startDate : new Date(startDate);
      }
      if (endDate !== undefined) {
        (where[dateField] as Record<string, unknown>).lte = endDate instanceof Date ? endDate : new Date(endDate);
      }
    }

    return where;
  },

  /**
   * Ownership filter for user-specific data
   */
  createOwnershipWhere(userId: number, additionalWhere?: WhereCondition): WhereCondition {
    return {
      AND: [
        {
          OR: [
            { isSystem: true },
            { createdByUserId: userId },
          ],
        },
        ...(additionalWhere ? [additionalWhere] : []),
      ],
    };
  },
};

/**
 * Performance monitoring utilities
 */
export const queryPerformance = {
  /**
   * Wrap query with performance monitoring
   */
  async monitorQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await queryFn();
      const duration = Date.now() - start;
      
      // Log slow queries (>1 second) in development only
      if (duration > 1000 && process.env.NODE_ENV === 'development') {
        logger.warn(`Slow query detected: ${queryName} took ${duration}ms`);
      }
      
      return result;
    } catch (error: unknown) {
      const duration = Date.now() - start;
      logger.error(`Query failed: ${queryName} failed after ${duration}ms:`, error as string | undefined);
      throw error;
    }
  },

  /**
   * Create optimized sorting configuration
   */
  createOptimizedSort(
    sortBy: string,
    sortOrder: SortOrder,
    allowedFields: string[]
  ): Record<string, SortOrder> {
    if (!allowedFields.includes(sortBy)) {
      return { createdAt: 'desc' }; // Default safe sort
    }

    return { [sortBy]: sortOrder };
  },
};

/**
 * Index recommendations for better query performance
 */
export const indexRecommendations = {
  // Composite indexes for common query patterns
  daybookEntry: [
    ['userId', 'date'], // User's entries by date
    ['userId', 'lessonPlanId'], // User's entries for specific lesson
    ['userId', 'overallRating'], // User's entries by rating
  ],

  unitPlan: [
    ['longRangePlanId', 'startDate'], // Unit plans by LRP and date
    ['userId', 'startDate'], // User's unit plans by date (if userId exists)
  ],

  etfoLessonPlan: [
    ['userId', 'date'], // User's lessons by date
    ['userId', 'unitPlanId'], // User's lessons by unit plan
    ['userId', 'isSubFriendly'], // User's sub-friendly lessons
  ],

  planTemplate: [
    ['createdByUserId', 'type'], // User's templates by type
    ['isSystem', 'category'], // System templates by category
    ['subject', 'gradeMin', 'gradeMax'], // Templates by subject and grade
  ],

  substitutePlan: [
    ['userId', 'dateFor'], // User's sub plans by date
    ['userId', 'isActive'], // User's active sub plans
  ],
};

/**
 * Query optimization utilities
 */
export const queryUtils = {
  /**
   * Limit the depth of includes to prevent N+1 queries
   */
  limitIncludeDepth(include: Record<string, unknown>, maxDepth = 3): Record<string, unknown> | undefined {
    if (maxDepth <= 0) {
      return undefined;
    }

    const limited: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(include)) {
      if (typeof value === 'object' && value !== null) {
        if (typeof value === 'object' && value !== null && 'include' in value) {
          const valueObj = value as Record<string, unknown>;
          limited[key] = {
            ...valueObj,
            include: queryUtils.limitIncludeDepth(valueObj.include as Record<string, unknown>, maxDepth - 1),
          };
        } else {
          limited[key] = value;
        }
      } else {
        limited[key] = value;
      }
    }
    return limited;
  },

  /**
   * Create efficient pagination cursor
   */
  createCursor(id: string, sortField: string, sortValue: unknown): Record<string, unknown> {
    return {
      id,
      [sortField]: sortValue,
    };
  },

  /**
   * Validate query limits to prevent abuse
   */
  validateLimit(limit: number, maxAllowed = 100): number {
    return Math.min(Math.max(1, limit), maxAllowed);
  },

  /**
   * Validate offset to prevent expensive queries
   */
  validateOffset(offset: number, maxAllowed = 10000): number {
    return Math.min(Math.max(0, offset), maxAllowed);
  },
};