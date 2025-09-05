/**
 * Performance Optimizer for Single-Teacher Use
 * Optimizes database queries, caching, and system performance for Emily's classroom
 */

import { PrismaClient } from '@teaching-engine/database';
import Redis from 'ioredis';
import { logger } from '../logger';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export interface CacheConfig {
  keyPrefix: string;
  ttl: number; // seconds
  staleWhileRevalidate?: number; // seconds
}

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  students: { keyPrefix: 'students', ttl: 300, staleWhileRevalidate: 60 }, // 5 min cache
  artifacts: { keyPrefix: 'artifacts', ttl: 180, staleWhileRevalidate: 30 }, // 3 min cache
  progress: { keyPrefix: 'progress', ttl: 60, staleWhileRevalidate: 15 }, // 1 min cache
  analytics: { keyPrefix: 'analytics', ttl: 600, staleWhileRevalidate: 120 }, // 10 min cache
  reports: { keyPrefix: 'reports', ttl: 1800 }, // 30 min cache (no stale-while-revalidate)
};

/**
 * Generic cached query wrapper with stale-while-revalidate support
 */
export const cachedQuery = async <T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  config: CacheConfig
): Promise<T> => {
  const fullKey = `${config.keyPrefix}:${cacheKey}`;
  const staleKey = `${fullKey}:stale`;
  
  try {
    // Try to get fresh data from cache
    const cachedData = await redis.get(fullKey);
    if (cachedData) {
      logger.debug(`Cache hit for ${fullKey}`);
      return JSON.parse(cachedData);
    }

    // If stale-while-revalidate is configured, try stale data
    if (config.staleWhileRevalidate) {
      const staleData = await redis.get(staleKey);
      if (staleData) {
        logger.debug(`Cache stale hit for ${fullKey}, revalidating in background`);
        
        // Return stale data immediately
        const parsedStaleData = JSON.parse(staleData);
        
        // Revalidate in background
        setImmediate(async () => {
          try {
            const freshData = await queryFn();
            await redis.setex(fullKey, config.ttl, JSON.stringify(freshData));
            await redis.setex(staleKey, config.ttl + (config.staleWhileRevalidate || 0), JSON.stringify(freshData));
            logger.debug(`Background revalidation completed for ${fullKey}`);
          } catch (error: unknown) {
            logger.warn(`Background revalidation failed for ${fullKey}:`, error instanceof Error ? error.message : String(error));
          }
        });
        
        return parsedStaleData;
      }
    }

    // Cache miss - execute query
    logger.debug(`Cache miss for ${fullKey}`);
    const data = await queryFn();
    
    // Store in cache
    await redis.setex(fullKey, config.ttl, JSON.stringify(data));
    if (config.staleWhileRevalidate) {
      await redis.setex(staleKey, config.ttl + config.staleWhileRevalidate, JSON.stringify(data));
    }
    
    return data;
  } catch (cacheError) {
    logger.warn(`Cache error for ${fullKey}, falling back to direct query:`, cacheError instanceof Error ? cacheError.message : String(cacheError));
    return queryFn();
  }
};

/**
 * Optimized query for getting all students for a teacher
 */
export const getStudentsOptimized = async (userId: number, includeInactive = false) => {
  const cacheKey = `${userId}:${includeInactive ? 'all' : 'active'}`;
  
  return cachedQuery(
    cacheKey,
    () => prisma.student.findMany({
      where: {
        userId,
        ...(includeInactive ? {} : { isActive: true })
      },
      include: {
        _count: {
          select: {
            artifacts: { where: { isArchived: false } },
            outcomeProgress: true
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    }),
    CACHE_CONFIGS.students || { keyPrefix: 'students', ttl: 300 }
  );
};

/**
 * Optimized query for student artifacts with common filters
 */
export const getStudentArtifactsOptimized = async (
  studentId: string, 
  userId: number,
  options: {
    artifactType?: string;
    limit?: number;
    includeArchived?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
  } = {}
) => {
  const cacheKey = `${studentId}:${userId}:${JSON.stringify(options)}`;
  
  return cachedQuery(
    cacheKey,
    () => prisma.studentArtifact.findMany({
      where: {
        studentId,
        userId,
        ...(options.artifactType ? { artifactType: options.artifactType } : {}),
        ...(options.includeArchived === false ? { isArchived: false } : {}),
        ...(options.dateFrom || options.dateTo ? {
          dateCollected: {
            ...(options.dateFrom ? { gte: options.dateFrom } : {}),
            ...(options.dateTo ? { lte: options.dateTo } : {})
          }
        } : {})
      },
      include: {
        outcomes: {
          include: {
            outcome: {
              select: {
                code: true,
                subject: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: { dateCollected: 'desc' },
      ...(options.limit ? { take: options.limit } : {})
    }),
    CACHE_CONFIGS.artifacts || { keyPrefix: 'artifacts', ttl: 180 }
  );
};

/**
 * Optimized query for student progress across all outcomes
 */
export const getStudentProgressOptimized = async (
  studentId: string,
  userId: number,
  subject?: string
) => {
  const cacheKey = `${studentId}:${userId}:${subject || 'all'}`;
  
  return cachedQuery(
    cacheKey,
    () => prisma.studentOutcomeProgress.findMany({
      where: {
        studentId,
        userId,
        ...(subject ? {
          outcome: { subject }
        } : {})
      },
      include: {
        outcome: {
          select: {
            code: true,
            subject: true,
            strand: true,
            description: true
          }
        }
      },
      orderBy: { lastAssessmentDate: 'desc' }
    }),
    CACHE_CONFIGS.progress || { keyPrefix: 'progress', ttl: 60 }
  );
};

/**
 * Optimized analytics query - pre-computed class metrics
 */
export const getClassAnalyticsOptimized = async (userId: number) => {
  const cacheKey = `class:${userId}`;
  
  return cachedQuery(
    cacheKey,
    async () => {
      // Use efficient aggregation queries instead of loading all data
      const [
        studentCount,
        artifactStats,
        progressStats,
        recentActivity
      ] = await Promise.all([
        // Student count
        prisma.student.count({
          where: { userId, isActive: true }
        }),
        
        // Artifact statistics
        prisma.studentArtifact.groupBy({
          by: ['artifactType'],
          where: { 
            userId, 
            isArchived: false,
            student: { isActive: true }
          },
          _count: { id: true },
          _sum: { fileSize: true }
        }),
        
        // Progress distribution
        prisma.studentOutcomeProgress.groupBy({
          by: ['currentLevel'],
          where: { 
            userId,
            student: { isActive: true }
          },
          _count: { id: true }
        }),
        
        // Recent activity (last 30 days)
        prisma.studentArtifact.count({
          where: {
            userId,
            isArchived: false,
            dateCollected: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return {
        totalStudents: studentCount,
        artifactStats: artifactStats.reduce((acc, stat) => {
          acc[stat.artifactType] = {
            count: stat._count.id,
            totalSize: stat._sum.fileSize || 0
          };
          return acc;
        }, {} as Record<string, { count: number; totalSize: number }>),
        progressDistribution: progressStats.reduce((acc, stat) => {
          acc[stat.currentLevel] = stat._count.id;
          return acc;
        }, {} as Record<string, number>),
        recentArtifacts: recentActivity,
        lastUpdated: new Date().toISOString()
      };
    },
    CACHE_CONFIGS.analytics || { keyPrefix: 'analytics', ttl: 600 }
  );
};

/**
 * Batch invalidate cache for a user's data
 */
export const invalidateUserCache = async (userId: number) => {
  logger.info(`Invalidating cache for user ${userId}`);
  
  try {
    const patterns = [
      `students:${userId}*`,
      `artifacts:*:${userId}*`,
      `progress:*:${userId}*`,
      `analytics:class:${userId}*`
    ];
    
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug(`Deleted ${keys.length} cache keys for pattern: ${pattern}`);
      }
    }
  } catch (error: unknown) {
    logger.warn('Cache invalidation failed:', error instanceof Error ? error.message : String(error));
  }
};

/**
 * Invalidate cache when student data changes
 */
export const invalidateStudentCache = async (studentId: string, userId: number) => {
  try {
    const patterns = [
      `students:${userId}*`,
      `artifacts:${studentId}:${userId}*`,
      `progress:${studentId}:${userId}*`,
      `analytics:class:${userId}*`
    ];
    
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch (error: unknown) {
    logger.warn('Student cache invalidation failed:', error instanceof Error ? error.message : String(error));
  }
};

/**
 * Database query optimizer - suggests better indexes
 */
export const analyzeQueryPerformance = async () => {
  logger.info('Analyzing query performance...');
  
  // Since we're using SQLite, we can use EXPLAIN QUERY PLAN
  const commonQueries = [
    'SELECT * FROM Student WHERE userId = ? AND isActive = 1',
    'SELECT * FROM StudentArtifact WHERE studentId = ? ORDER BY dateCollected DESC',
    'SELECT * FROM StudentOutcomeProgress WHERE userId = ? AND currentLevel = ?',
    'SELECT COUNT(*) FROM StudentArtifact WHERE userId = ? AND dateCollected > ?'
  ];
  
  const results = [];
  
  for (const query of commonQueries) {
    try {
      const plan = await prisma.$queryRaw`EXPLAIN QUERY PLAN ${query}`;
      results.push({
        query,
        plan,
        recommendation: analyzeExecutionPlan(plan as any[])
      });
    } catch (error: unknown) {
      logger.warn(`Failed to analyze query: ${query}`, error instanceof Error ? error.message : String(error));
    }
  }
  
  return results;
};

/**
 * Analyze execution plan and provide recommendations
 */
const analyzeExecutionPlan = (plan: any[]): string => {
  const planText = JSON.stringify(plan);
  
  if (planText.includes('SCAN TABLE')) {
    return 'Consider adding an index - table scan detected';
  }
  if (planText.includes('USING INDEX')) {
    return 'Good - using index efficiently';
  }
  if (planText.includes('TEMP B-TREE')) {
    return 'Consider optimizing ORDER BY clauses or adding covering index';
  }
  
  return 'Query appears optimized';
};

/**
 * Warm up cache with commonly accessed data
 */
export const warmupCache = async (userId: number) => {
  logger.info(`Warming up cache for user ${userId}`);
  
  try {
    // Warm up student list
    await getStudentsOptimized(userId);
    
    // Warm up class analytics
    await getClassAnalyticsOptimized(userId);
    
    // Warm up recent artifacts for active students
    const students = await prisma.student.findMany({
      where: { userId, isActive: true },
      select: { id: true }
    });
    
    const warmupPromises = students.slice(0, 5).map(student => 
      getStudentArtifactsOptimized(student.id, userId, { limit: 10 })
    );
    
    await Promise.allSettled(warmupPromises);
    
    logger.info(`Cache warmup completed for user ${userId}`);
  } catch (error: unknown) {
    logger.warn('Cache warmup failed:', error instanceof Error ? error.message : String(error));
  }
};

/**
 * Performance monitoring and metrics
 */
export const getPerformanceMetrics = async () => {
  const [
    cacheInfo,
    dbStats,
    memoryUsage
  ] = await Promise.all([
    redis.info('memory'),
    prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'` as Promise<any[]>,
    process.memoryUsage()
  ]);
  
  return {
    cache: {
      info: cacheInfo,
      keyCount: await redis.dbsize()
    },
    database: {
      tableCount: dbStats.length,
      connectionStatus: 'healthy'
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    }
  };
};

export default {
  cachedQuery,
  getStudentsOptimized,
  getStudentArtifactsOptimized,
  getStudentProgressOptimized,
  getClassAnalyticsOptimized,
  invalidateUserCache,
  invalidateStudentCache,
  analyzeQueryPerformance,
  warmupCache,
  getPerformanceMetrics
};