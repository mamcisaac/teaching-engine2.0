export interface SearchParams {
  query?: string;
  grade?: number;
  subject?: string;
  gradeLevel?: number;
  language?: string;
  limit?: number;
  offset?: number;
}

// Temporary stub for ActivityDiscoveryService to fix missing import
export class ActivityDiscoveryService {
  constructor() {}

  async search(_params: SearchParams, _userId: number) {
    return {
      activities: [],
      total: 0,
      hasMore: false,
    };
  }

  async searchActivities() {
    return [];
  }

  async getActivity(source: string, externalId: string) {
    return {
      id: `${source}-${externalId}`,
      title: 'Sample Activity',
      description: 'This is a stub activity',
      duration: 30,
      gradeMin: 1,
      gradeMax: 3,
      grade: 1,
      subject: 'Math',
      source: source,
      externalId: externalId,
      url: 'https://example.com',
      thumbnailUrl: null,
      materials: [],
      learningGoals: null,
      curriculumTags: [],
      isFree: true,
      lastVerified: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      activityType: 'worksheet',
      language: 'fr',
      technology: null,
      groupSize: null,
      sourceRating: null,
      sourceReviews: null,
      internalRating: null,
      internalReviews: null,
      price: null,
      license: null,
    };
  }

  async getActivityById(id: string) {
    // Parse id to extract source and externalId
    const [source, ...externalIdParts] = id.split('-');
    const externalId = externalIdParts.join('-');
    return this.getActivity(source || 'mock', externalId || id);
  }

  async getActivityDetails(id: string) {
    return this.getActivityById(id);
  }

  async importActivity(
    params: {
      activityId: string;
      lessonPlanId?: string;
      lessonSection?: string;
      customizations?: Record<string, unknown>;
      notes?: string;
    },
    _userId: number,
  ) {
    return {
      id: 'import-' + Date.now(),
      userId: _userId,
      activityId: params.activityId,
      lessonPlanId: params.lessonPlanId || null,
      lessonSection: params.lessonSection || null,
      customizations: params.customizations || null,
      notes: params.notes || null,
      timesUsed: 1,
      lastUsed: new Date(),
      effectiveness: null,
      createdAt: new Date(),
    };
  }

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
    _userId: number,
  ) {
    return {
      id: 'rating-' + Date.now(),
      userId: _userId,
      activityId,
      rating,
      review,
      wouldRecommend: details.wouldRecommend || null,
      gradeUsed: details.gradeUsed || null,
      subjectUsed: details.subjectUsed || null,
      workedWell: details.workedWell || null,
      challenges: details.challenges || null,
      createdAt: new Date(),
    };
  }

  async getUserCollections(_userId: number) {
    return [];
  }

  async createCollection(
    data: { name: string; description?: string; isPublic?: boolean },
    _userId: number,
  ) {
    return {
      id: 'collection-' + Date.now(),
      userId: _userId,
      name: data.name,
      description: data.description || null,
      isPublic: data.isPublic || false,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async addToCollection(collectionId: string, activityId: string, _userId: number) {
    return {
      success: true,
      collectionId,
      activityId,
    };
  }

  async removeFromCollection(collectionId: string, activityId: string, _userId: number) {
    return {
      success: true,
      collectionId,
      activityId,
    };
  }

  async getRecommendedActivities(lessonPlanId: string, _userId: number, limit?: number) {
    return {
      activities: [],
      basedOn: 'lessonPlan',
      lessonPlanId,
      limit: limit || 5,
    };
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

// Export SearchParams type
export interface SearchParams {
  query?: string;
  grade?: number;
  gradeLevel?: number; // Alias for backward compatibility
  subject?: string;
  durationMin?: number;
  durationMax?: number;
  materials?: string[];
  requireAllMaterials?: boolean;
  activityType?: string[];
  language?: string;
  curriculumAlignment?: string[];
  onlyFree?: boolean;
  limit?: number;
  offset?: number;
}
