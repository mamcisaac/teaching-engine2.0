import { ExternalActivity } from '@teaching-engine/database';
import { SearchParams } from '../activityDiscoveryService';

/**
 * Base abstract class for all activity source connectors
 * Each connector implements the logic to search and retrieve activities
 * from a specific external source (OER Commons, Khan Academy, TPT, etc.)
 */
export abstract class BaseConnector {
  protected sourceName: string;

  constructor(sourceName: string) {
    this.sourceName = sourceName;
  }

  /**
   * Search for activities based on the provided parameters
   * @param params Search parameters including query, filters, etc.
   * @returns Array of activities matching the search criteria
   */
  abstract search(
    params: SearchParams,
  ): Promise<Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'>[]>;

  /**
   * Get detailed information about a specific activity
   * @param externalId The ID of the activity in the external system
   * @returns Detailed activity information or null if not found
   */
  abstract getActivityDetails(
    externalId: string,
  ): Promise<Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'> | null>;

  /**
   * Check if an activity is still available at the source
   * @param externalId The ID of the activity in the external system
   * @returns true if the activity is still available
   */
  async checkAvailability(externalId: string): Promise<boolean> {
    const activity = await this.getActivityDetails(externalId);
    return activity !== null;
  }

  /**
   * Transform external API response to our ExternalActivity format
   * This is a helper method that connectors can override
   */
  protected transformToExternalActivity(
    sourceData: unknown,
    defaults: Partial<ExternalActivity> = {},
  ): Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      source: this.sourceName,
      externalId: '',
      url: '',
      title: '',
      description: null,
      thumbnailUrl: null,
      duration: null,
      activityType: 'worksheet',
      gradeMin: 1,
      gradeMax: 1,
      subject: 'general',
      language: 'en',
      materials: [],
      technology: null,
      groupSize: null,
      sourceRating: null,
      sourceReviews: null,
      internalRating: null,
      internalReviews: null,
      curriculumTags: [],
      learningGoals: null,
      isFree: true,
      price: null,
      license: null,
      lastVerified: new Date(),
      isActive: true,
      ...defaults,
    };
  }

  /**
   * Parse duration string to minutes
   * Handles formats like "PT15M", "15 minutes", "1 hour", etc.
   */
  protected parseDuration(durationStr: string): number | null {
    if (!durationStr) return null;

    // ISO 8601 duration format (PT15M, PT1H30M)
    const iso8601Match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (iso8601Match) {
      const hours = parseInt(iso8601Match[1] || '0');
      const minutes = parseInt(iso8601Match[2] || '0');
      const seconds = parseInt(iso8601Match[3] || '0');
      return hours * 60 + minutes + Math.ceil(seconds / 60);
    }

    // Common text formats
    const textMatch = durationStr.match(/(\d+)\s*(hours?|minutes?|mins?)/i);
    if (textMatch) {
      const value = parseInt(textMatch[1]);
      const unit = textMatch[2].toLowerCase();
      if (unit.startsWith('hour')) {
        return value * 60;
      } else {
        return value;
      }
    }

    return null;
  }

  /**
   * Extract grade range from various formats
   * Examples: "Grade 1", "K-2", "1st Grade", "Grades 1-3"
   */
  protected parseGradeRange(gradeStr: string): { min: number; max: number } {
    const defaultRange = { min: 1, max: 1 };

    if (!gradeStr) return defaultRange;

    // Handle "K" for kindergarten
    const normalized = gradeStr.replace(/K/gi, '0');

    // Try to extract all numbers
    const numbers = normalized.match(/\d+/g);
    if (!numbers || numbers.length === 0) return defaultRange;

    const grades = numbers.map((n) => parseInt(n));

    if (grades.length === 1) {
      return { min: grades[0], max: grades[0] };
    } else {
      return {
        min: Math.min(...grades),
        max: Math.max(...grades),
      };
    }
  }

  /**
   * Map external subject names to our standardized subjects
   */
  protected normalizeSubject(subject: string): string {
    const subjectMap: Record<string, string> = {
      mathematics: 'math',
      maths: 'math',
      french: 'francais',
      'french immersion': 'francais',
      english: 'english',
      'language arts': 'english',
      ela: 'english',
      science: 'science',
      'social studies': 'social-studies',
      history: 'social-studies',
      geography: 'social-studies',
      'phys ed': 'physical-education',
      'physical education': 'physical-education',
      pe: 'physical-education',
      art: 'arts',
      arts: 'arts',
      music: 'arts',
      drama: 'arts',
      health: 'health',
    };

    const normalized = subject.toLowerCase().trim();
    return subjectMap[normalized] || normalized;
  }

  /**
   * Determine activity type from title, description, or metadata
   */
  protected inferActivityType(data: {
    title?: string;
    description?: string;
    format?: string;
    mediaType?: string;
  }): string {
    const combined =
      `${data.title || ''} ${data.description || ''} ${data.format || ''} ${data.mediaType || ''}`.toLowerCase();

    if (combined.includes('video')) return 'video';
    if (combined.includes('worksheet') || combined.includes('printable')) return 'worksheet';
    if (combined.includes('game') || combined.includes('interactive')) return 'game';
    if (combined.includes('experiment') || combined.includes('lab')) return 'experiment';
    if (combined.includes('hands-on') || combined.includes('manipulative')) return 'handson';

    return 'worksheet'; // default
  }

  /**
   * Extract materials from description or metadata
   */
  protected extractMaterials(text: string): string[] {
    if (!text) return [];

    const materials: string[] = [];
    const materialPatterns = [
      /materials?\s*needed\s*:?\s*([^.]+)/i,
      /you\s*will\s*need\s*:?\s*([^.]+)/i,
      /supplies\s*:?\s*([^.]+)/i,
      /required\s*materials?\s*:?\s*([^.]+)/i,
    ];

    for (const pattern of materialPatterns) {
      const match = text.match(pattern);
      if (match) {
        // Split by common delimiters and clean up
        const items = match[1]
          .split(/[,;]/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0 && item.length < 50);

        materials.push(...items);
      }
    }

    // Also look for specific material mentions
    const specificMaterials = [
      'pencil',
      'paper',
      'scissors',
      'glue',
      'markers',
      'crayons',
      'dice',
      'cards',
      'counters',
      'calculator',
      'ruler',
      'computer',
      'tablet',
      'whiteboard',
      'manipulatives',
    ];

    for (const material of specificMaterials) {
      if (
        text.toLowerCase().includes(material) &&
        !materials.some((m) => m.toLowerCase().includes(material))
      ) {
        materials.push(material);
      }
    }

    return Array.from(new Set(materials)); // Remove duplicates
  }
}
