import { ExternalActivity } from '@teaching-engine/database';
import { BaseConnector } from './baseConnector';
import { SearchParams } from '../activityDiscoveryService';

interface OERResource {
  id: number;
  title: string;
  abstract?: string;
  description?: string;
  url?: string;
  thumbnail_url?: string;
  material_types?: string[];
  grade_levels?: string[];
  subjects?: string[];
  keywords?: string[];
  languages?: string[];
  language?: string;
  authors?: string[];
  license?: string;
  rating?: number;
  reviews_count?: number;
  visits?: number;
  requires_internet?: boolean;
  learning_objectives?: string[];
  standards?: OERStandard[];
}

interface OERSearchResponse {
  meta: {
    pagination: {
      count: number;
      page: number;
      per_page: number;
    };
  };
  results: OERResource[];
}

interface OERStandard {
  notation?: string;
  code?: string;
}

/**
 * Open Educational Resources (OER) connector
 * Searches OER Commons and other open educational resource repositories
 * Free, openly licensed educational materials
 */
export class OERConnector extends BaseConnector {
  private apiKey: string;
  private baseUrl = 'https://www.oercommons.org/api/v1';

  constructor() {
    super('oer');
    this.apiKey = process.env.OER_API_KEY || '';

    if (!this.apiKey) {
      console.warn('OER API key not configured. OER search will not be available.');
    }
  }

  async search(params: SearchParams): Promise<ExternalActivity[]> {
    if (!this.apiKey) return [];

    try {
      // Build OER search parameters
      const searchParams = new URLSearchParams({
        q: params.query || '',
        limit: String(params.limit || 20),
        offset: String(params.offset || 0),
        has_materials: 'true',
      });

      // Add grade level filter
      if (params.grade) {
        searchParams.append('grade_level', this.mapGradeToOER(params.grade));
      }

      // Add subject filter
      if (params.subject) {
        searchParams.append('subject', this.mapSubjectToOER(params.subject));
      }

      const url = `${this.baseUrl}/search?${searchParams.toString()}`;

      const response = await this.fetchWithTimeout(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      }, 30000); // 30 second timeout

      if (!response.ok) {
        throw new Error(`OER API error: ${response.statusText}`);
      }

      const data: OERSearchResponse = await response.json();

      // Transform OER results to our format
      const activities: ExternalActivity[] = data.results
        .map((item: OERResource) => this.transformOERResource(item, params))
        .filter(
          (activity: ExternalActivity | null): activity is ExternalActivity => activity !== null,
        );

      return activities as ExternalActivity[];
    } catch (error) {
      console.error('OER search error:', error);
      return [];
    }
  }

  async getActivityDetails(externalId: string): Promise<ExternalActivity | null> {
    if (!this.apiKey) return null;

    try {
      const url = `${this.baseUrl}/resources/${externalId}`;

      const response = await this.fetchWithTimeout(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
      }, 30000); // 30 second timeout

      if (!response.ok) return null;

      const data = await response.json();
      return this.transformOERResource(data, {}) as ExternalActivity;
    } catch (error) {
      console.error('OER getActivityDetails error:', error);
      return null;
    }
  }

  private mapGradeToOER(grade: number): string {
    // OER uses different grade level naming
    if (grade === 0) return 'kindergarten';
    if (grade >= 1 && grade <= 12) return `grade_${grade}`;
    return 'primary';
  }

  private mapSubjectToOER(subject: string): string {
    const subjectMap: Record<string, string> = {
      math: 'mathematics',
      francais: 'world_languages',
      english: 'english_language_arts',
      science: 'science',
      'social-studies': 'social_studies',
      'physical-education': 'health_physical_education',
      arts: 'arts',
    };

    return subjectMap[subject.toLowerCase()] || subject;
  }

  private transformOERResource(
    resource: OERResource,
    _params: SearchParams,
  ): Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'> | null {
    if (!resource) return null;

    // Determine activity type based on material types
    const activityType = this.inferActivityTypeFromMaterialTypes(resource.material_types || []);

    // Extract grade range
    const gradeRange = this.extractGradeRangeFromOER(resource.grade_levels || []);

    // Extract subject
    const subject = this.extractSubjectFromOER(resource.subjects || []);

    return this.transformToExternalActivity(
      {} as ExternalActivity,
      {
        externalId: String(resource.id),
        url: resource.url || `https://www.oercommons.org/courses/${resource.id}`,
        title: resource.title,
        description: resource.abstract || resource.description,
        thumbnailUrl: resource.thumbnail_url,
        duration: this.estimateDurationFromDescription(resource.abstract),
        activityType,
        gradeMin: gradeRange.min,
        gradeMax: gradeRange.max,
        subject: this.normalizeSubject(subject),
        language: resource.language || 'en',
        materials: this.extractMaterialsFromDescription(resource.abstract || ''),
        technology: this.extractTechnologyRequirements(resource),
        groupSize: null,
        sourceRating: resource.rating ? resource.rating * 5 : null, // Convert to 5-star scale
        sourceReviews: resource.reviews_count || null,
        curriculumTags: this.extractStandardsFromOER(resource.standards || []),
        learningGoals: resource.learning_objectives || null,
        isFree: true,
        license: resource.license || 'Open Educational Resource',
        isActive: true,
      },
    );
  }

  private inferActivityTypeFromMaterialTypes(materialTypes: string[]): string {
    const typeMap: Record<string, string> = {
      video: 'video',
      interactive: 'game',
      worksheet: 'worksheet',
      activity: 'handson',
      experiment: 'experiment',
      lesson_plan: 'worksheet',
      assessment: 'worksheet',
    };

    for (const materialType of materialTypes) {
      const normalized = materialType.toLowerCase();
      if (typeMap[normalized]) {
        return typeMap[normalized];
      }
    }

    return 'worksheet'; // default
  }

  private extractGradeRangeFromOER(gradeLevels: string[]): { min: number; max: number } {
    if (!gradeLevels || gradeLevels.length === 0) {
      return { min: 1, max: 1 };
    }

    const grades: number[] = [];

    for (const level of gradeLevels) {
      if (level.includes('kindergarten')) {
        grades.push(0);
      } else {
        const match = level.match(/\d+/);
        if (match) {
          grades.push(parseInt(match[0]));
        }
      }
    }

    if (grades.length === 0) return { min: 1, max: 1 };

    return {
      min: Math.min(...grades),
      max: Math.max(...grades),
    };
  }

  private extractSubjectFromOER(subjects: string[]): string {
    if (!subjects || subjects.length === 0) return 'general';

    // Take the first subject and normalize it
    return subjects[0].toLowerCase().replace(/_/g, '-');
  }

  private extractTechnologyRequirements(resource: OERResource): string[] | null {
    const tech: string[] = [];

    if (resource.requires_internet) tech.push('internet');
    if (resource.material_types?.includes('interactive')) tech.push('ordinateur');
    if (resource.material_types?.includes('video')) tech.push('projecteur');

    return tech.length > 0 ? tech : null;
  }

  private estimateDurationFromDescription(description: string): number | null {
    if (!description) return null;

    // Look for duration mentions in description
    const durationMatch = description.match(/(\d+)\s*(?:minutes?|mins?|hours?)/i);
    if (durationMatch) {
      return this.parseDuration(durationMatch[0]);
    }

    // Estimate based on content length
    const wordCount = description.split(/\s+/).length;
    if (wordCount < 100) return 15;
    if (wordCount < 300) return 25;
    return 35;
  }

  private extractStandardsFromOER(standards: OERStandard[]): string[] {
    if (!standards || standards.length === 0) return [];

    return standards
      .map((s) => s.notation || s.code)
      .filter((s) => s)
      .slice(0, 5); // Limit to 5 standards
  }

  private extractMaterialsFromDescription(description: string): string[] {
    const materials = this.extractMaterials(description);

    // Add common materials for open resources
    if (materials.length === 0) {
      materials.push('papier', 'crayons');
    }

    return materials;
  }
}
