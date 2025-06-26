import BaseService from './base/BaseService';
import { ExternalActivity } from '@teaching-engine/database';
import { BaseConnector } from './connectors/baseConnector';
import { OERConnector } from './connectors/oerConnector';
import { CurriculumWebConnector } from './connectors/curriculumWebConnector';
import { EducationWebConnector } from './connectors/educationWebConnector';

export interface SearchParams {
  query?: string;
  grade?: number;
  subject?: string;
  gradeLevel?: number;
  language?: string;
  duration?: {
    min?: number;
    max?: number;
  };
  materials?: string[];
  requireAllMaterials?: boolean;
  activityType?: string[];
  curriculumAlignment?: string[];
  sources?: string[];
  onlyFree?: boolean;
  limit?: number;
  offset?: number;
}

export interface ActivitySearchResult {
  activities: ExternalActivity[];
  total: number;
  hasMore: boolean;
  searchParams: SearchParams;
  sources: string[];
  executionTime: number;
}

export interface ActivityRecommendations {
  activities: ExternalActivity[];
  basedOn: 'lessonPlan' | 'userHistory' | 'similarTeachers';
  lessonPlanId?: string;
  limit: number;
  criteria: string[];
}

/**
 * Enhanced Activity Discovery Service
 * Manages multiple connectors to search educational activities from various sources
 */
export class ActivityDiscoveryService extends BaseService {
  private connectors: Map<string, BaseConnector> = new Map();
  private cache: Map<string, { data: unknown; expiry: number }> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutes

  constructor() {
    super('ActivityDiscoveryService');
    this.initializeConnectors();
  }

  /**
   * Initialize available connectors
   */
  private initializeConnectors(): void {
    try {
      // Add OER Commons connector
      this.connectors.set('oer', new OERConnector());
      
      // Add Curriculum Web connector (government resources)
      this.connectors.set('curriculum', new CurriculumWebConnector());
      
      // Add Educational Websites connector (Khan Academy, ReadWorks, etc.)
      this.connectors.set('education', new EducationWebConnector());
      
      this.logger.info(`Initialized ${this.connectors.size} activity discovery connectors`);
    } catch (error) {
      this.logger.error({ error }, 'Failed to initialize connectors');
    }
  }

  /**
   * Search for activities across all available sources
   */
  async search(params: SearchParams, userId: number): Promise<ActivitySearchResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info({ params, userId }, 'Starting activity search');

      // Check cache first
      const cacheKey = this.generateCacheKey('search', params);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached search results');
        return cached;
      }

      // Normalize and validate parameters
      const normalizedParams = this.normalizeSearchParams(params);
      
      // Determine which sources to search
      const sourcesToSearch = normalizedParams.sources 
        ? normalizedParams.sources.filter(s => this.connectors.has(s))
        : Array.from(this.connectors.keys());

      // Search each connector in parallel
      const searchPromises = sourcesToSearch.map(async (sourceId) => {
        const connector = this.connectors.get(sourceId);
        if (!connector) return [];

        try {
          this.logger.debug(`Searching ${sourceId} connector`);
          const results = await connector.search(normalizedParams);
          this.logger.debug(`${sourceId} returned ${results.length} results`);
          return results;
        } catch (error) {
          this.logger.error({ error, sourceId }, `Search failed for ${sourceId}`);
          return [];
        }
      });

      const allResults = await Promise.all(searchPromises);
      const flatResults = allResults.flat() as ExternalActivity[];

      // Apply additional filtering and ranking
      const filteredResults = this.filterAndRankResults(flatResults, normalizedParams);
      
      // Apply pagination
      const paginatedResults = this.applyPagination(filteredResults, normalizedParams);

      const result: ActivitySearchResult = {
        activities: paginatedResults,
        total: filteredResults.length,
        hasMore: (normalizedParams.offset || 0) + paginatedResults.length < filteredResults.length,
        searchParams: normalizedParams,
        sources: sourcesToSearch,
        executionTime: Date.now() - startTime,
      };

      // Cache the result
      this.setCache(cacheKey, result);

      this.logger.info({
        resultsCount: paginatedResults.length,
        totalFound: filteredResults.length,
        executionTime: result.executionTime,
        sources: sourcesToSearch,
      }, 'Activity search completed');

      return result;
    } catch (error) {
      this.logger.error({ error, params, userId }, 'Activity search failed');
      throw new Error('Activity search failed');
    }
  }

  /**
   * Get activity details from a specific source
   */
  async getActivity(source: string, externalId: string): Promise<ExternalActivity | null> {
    try {
      const cacheKey = this.generateCacheKey('activity', { source, externalId });
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const connector = this.connectors.get(source);
      if (!connector) {
        this.logger.warn({ source }, 'Unknown activity source');
        return null;
      }

      const activity = await connector.getActivityDetails(externalId);
      if (activity) {
        this.setCache(cacheKey, activity);
      }

      return activity as ExternalActivity | null;
    } catch (error) {
      this.logger.error({ error, source, externalId }, 'Failed to get activity details');
      return null;
    }
  }

  /**
   * Get activity by composite ID (source-externalId)
   */
  async getActivityById(id: string): Promise<ExternalActivity | null> {
    const [source, ...externalIdParts] = id.split('-');
    const externalId = externalIdParts.join('-');
    return this.getActivity(source || 'unknown', externalId || id);
  }

  /**
   * Alias for getActivityById for backward compatibility
   */
  async getActivityDetails(id: string): Promise<ExternalActivity | null> {
    return this.getActivityById(id);
  }

  /**
   * Import an activity into user's collection or lesson plan
   */
  async importActivity(
    params: {
      activityId: string;
      lessonPlanId?: string;
      lessonSection?: string;
      customizations?: Record<string, unknown>;
      notes?: string;
    },
    userId: number,
  ): Promise<any> {
    try {
      const { prisma } = await import('../prisma');

      // Ensure the activity exists in our database
      const [source, ...externalIdParts] = params.activityId.split('-');
      const externalId = externalIdParts.join('-');
      
      // Get activity details to store in our database if needed
      const activityDetails = await this.getActivity(source, externalId);
      if (!activityDetails) {
        throw new Error('Activity not found');
      }

      // Create or find the external activity record
      let externalActivity = await prisma.externalActivity.findUnique({
        where: {
          source_externalId: {
            source: activityDetails.source,
            externalId: activityDetails.externalId,
          },
        },
      });

      if (!externalActivity) {
        externalActivity = await prisma.externalActivity.create({
          data: activityDetails,
        });
      }

      // Create the activity import record
      const activityImport = await prisma.activityImport.create({
        data: {
          userId,
          activityId: externalActivity.id,
          lessonPlanId: params.lessonPlanId || null,
          lessonSection: params.lessonSection || null,
          customizations: params.customizations || null,
          notes: params.notes || null,
        },
        include: {
          activity: true,
          lessonPlan: {
            select: {
              id: true,
              title: true,
              date: true,
            },
          },
        },
      });

      this.logger.info(
        { userId, activityId: params.activityId, lessonPlanId: params.lessonPlanId },
        'Activity imported successfully'
      );

      return activityImport;
    } catch (error) {
      this.logger.error({ error, params, userId }, 'Failed to import activity');
      throw error;
    }
  }

  /**
   * Rate an activity
   */
  async rateActivity(
    activityId: string,
    rating: number,
    review: string | null,
    details: {
      gradeUsed?: number;
      subjectUsed?: string;
      workedWell?: string;
      challenges?: string;
      wouldRecommend?: boolean;
    },
    userId: number,
  ): Promise<any> {
    try {
      const { prisma } = await import('../prisma');

      // Ensure the activity exists
      const activity = await prisma.externalActivity.findUnique({
        where: { id: activityId },
      });

      if (!activity) {
        throw new Error('Activity not found');
      }

      // Create or update the rating
      const activityRating = await prisma.activityRating.upsert({
        where: {
          userId_activityId: {
            userId,
            activityId,
          },
        },
        update: {
          rating,
          review,
          wouldRecommend: details.wouldRecommend,
          gradeUsed: details.gradeUsed,
          subjectUsed: details.subjectUsed,
          workedWell: details.workedWell,
          challenges: details.challenges,
        },
        create: {
          userId,
          activityId,
          rating,
          review,
          wouldRecommend: details.wouldRecommend,
          gradeUsed: details.gradeUsed,
          subjectUsed: details.subjectUsed,
          workedWell: details.workedWell,
          challenges: details.challenges,
        },
        include: {
          activity: true,
        },
      });

      this.logger.info(
        { userId, activityId, rating },
        'Activity rated successfully'
      );

      return activityRating;
    } catch (error) {
      this.logger.error({ error, activityId, userId }, 'Failed to rate activity');
      throw error;
    }
  }

  /**
   * Get user's activity collections
   */
  async getUserCollections(userId: number): Promise<any[]> {
    try {
      const { prisma } = await import('../prisma');

      const collections = await prisma.activityCollection.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              activity: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return collections;
    } catch (error) {
      this.logger.error({ error, userId }, 'Failed to get user collections');
      return [];
    }
  }

  /**
   * Create a new activity collection
   */
  async createCollection(
    data: { name: string; description?: string; isPublic?: boolean },
    userId: number,
  ): Promise<any> {
    try {
      const { prisma } = await import('../prisma');

      const collection = await prisma.activityCollection.create({
        data: {
          userId,
          name: data.name,
          description: data.description || null,
          isPublic: data.isPublic || false,
        },
        include: {
          items: true,
        },
      });

      this.logger.info(
        { userId, collectionName: data.name },
        'Activity collection created'
      );

      return collection;
    } catch (error) {
      this.logger.error({ error, data, userId }, 'Failed to create collection');
      throw error;
    }
  }

  /**
   * Add activity to collection
   */
  async addToCollection(collectionId: string, activityId: string, userId: number): Promise<any> {
    try {
      const { prisma } = await import('../prisma');

      // Verify the collection belongs to the user
      const collection = await prisma.activityCollection.findFirst({
        where: {
          id: collectionId,
          userId,
        },
      });

      if (!collection) {
        throw new Error('Collection not found or access denied');
      }

      // Add to collection
      await prisma.activityCollectionItem.create({
        data: {
          collectionId,
          activityId,
        },
      });

      return {
        success: true,
        collectionId,
        activityId,
      };
    } catch (error) {
      this.logger.error({ error, collectionId, activityId, userId }, 'Failed to add to collection');
      throw error;
    }
  }

  /**
   * Remove activity from collection
   */
  async removeFromCollection(collectionId: string, activityId: string, userId: number): Promise<any> {
    try {
      const { prisma } = await import('../prisma');

      // Verify the collection belongs to the user
      const collection = await prisma.activityCollection.findFirst({
        where: {
          id: collectionId,
          userId,
        },
      });

      if (!collection) {
        throw new Error('Collection not found or access denied');
      }

      // Remove from collection
      await prisma.activityCollectionItem.delete({
        where: {
          collectionId_activityId: {
            collectionId,
            activityId,
          },
        },
      });

      return {
        success: true,
        collectionId,
        activityId,
      };
    } catch (error) {
      this.logger.error({ error, collectionId, activityId, userId }, 'Failed to remove from collection');
      throw error;
    }
  }

  /**
   * Get recommended activities for a lesson plan
   */
  async getRecommendedActivities(
    lessonPlanId: string,
    userId: number,
    limit: number = 5
  ): Promise<ActivityRecommendations> {
    try {
      const { prisma } = await import('../prisma');

      // Get lesson plan details
      const lessonPlan = await prisma.eTFOLessonPlan.findUnique({
        where: { id: lessonPlanId },
        include: {
          unitPlan: {
            include: {
              longRangePlan: true,
            },
          },
          expectations: {
            include: {
              expectation: true,
            },
          },
        },
      });

      if (!lessonPlan) {
        throw new Error('Lesson plan not found');
      }

      // Build search criteria based on lesson plan
      const searchParams: SearchParams = {
        grade: lessonPlan.unitPlan.longRangePlan.grade,
        subject: lessonPlan.unitPlan.longRangePlan.subject,
        language: 'en', // Default to English for now
        limit,
      };

      // Search for relevant activities
      const searchResult = await this.search(searchParams, userId);

      return {
        activities: searchResult.activities,
        basedOn: 'lessonPlan',
        lessonPlanId,
        limit,
        criteria: [
          `Grade ${lessonPlan.unitPlan.longRangePlan.grade}`,
          lessonPlan.unitPlan.longRangePlan.subject,
          'English',
        ],
      };
    } catch (error) {
      this.logger.error({ error, lessonPlanId, userId }, 'Failed to get recommended activities');
      return {
        activities: [],
        basedOn: 'lessonPlan',
        lessonPlanId,
        limit,
        criteria: [],
      };
    }
  }

  // Private helper methods

  private normalizeSearchParams(params: SearchParams): SearchParams {
    return {
      ...params,
      grade: params.grade || params.gradeLevel,
      limit: Math.min(params.limit || 20, 100),
      offset: Math.max(params.offset || 0, 0),
    };
  }

  private filterAndRankResults(
    results: ExternalActivity[],
    params: SearchParams
  ): ExternalActivity[] {
    let filtered = results;

    // Filter by grade if specified
    if (params.grade) {
      filtered = filtered.filter(
        (activity) => activity.gradeMin <= params.grade! && activity.gradeMax >= params.grade!
      );
    }

    // Filter by free only if specified
    if (params.onlyFree) {
      filtered = filtered.filter((activity) => activity.isFree);
    }

    // Filter by activity type if specified
    if (params.activityType && params.activityType.length > 0) {
      filtered = filtered.filter((activity) =>
        params.activityType!.includes(activity.activityType)
      );
    }

    // Filter by materials if specified
    if (params.materials && params.materials.length > 0) {
      filtered = filtered.filter((activity) => {
        const activityMaterials = Array.isArray(activity.materials) ? activity.materials as string[] : [];
        if (params.requireAllMaterials) {
          return params.materials!.every((material) =>
            activityMaterials.some((am) => typeof am === 'string' && am.toLowerCase().includes(material.toLowerCase()))
          );
        } else {
          return params.materials!.some((material) =>
            activityMaterials.some((am) => typeof am === 'string' && am.toLowerCase().includes(material.toLowerCase()))
          );
        }
      });
    }

    // Sort by relevance (this could be enhanced with more sophisticated ranking)
    filtered.sort((a, b) => {
      // Prioritize activities with ratings
      if (a.sourceRating && !b.sourceRating) return -1;
      if (!a.sourceRating && b.sourceRating) return 1;
      
      // Sort by rating if both have ratings
      if (a.sourceRating && b.sourceRating) {
        return b.sourceRating - a.sourceRating;
      }

      // Sort by last verified date
      return new Date(b.lastVerified).getTime() - new Date(a.lastVerified).getTime();
    });

    return filtered;
  }

  private applyPagination(results: ExternalActivity[], params: SearchParams): ExternalActivity[] {
    const offset = params.offset || 0;
    const limit = params.limit || 20;
    return results.slice(offset, offset + limit);
  }

  private generateCacheKey(type: string, params: Record<string, unknown>): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): unknown {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL,
    });
  }

  /**
   * Clear expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get available activity sources
   */
  getAvailableSources(): string[] {
    return Array.from(this.connectors.keys());
  }

  /**
   * Check if a source is available
   */
  isSourceAvailable(source: string): boolean {
    return this.connectors.has(source);
  }
}

// Export singleton instance getter
let serviceInstance: ActivityDiscoveryService | null = null;

export function getActivityDiscoveryService(): ActivityDiscoveryService {
  if (!serviceInstance) {
    serviceInstance = new ActivityDiscoveryService();
  }
  return serviceInstance;
}

// Export singleton instance
export const activityDiscoveryService = getActivityDiscoveryService();
