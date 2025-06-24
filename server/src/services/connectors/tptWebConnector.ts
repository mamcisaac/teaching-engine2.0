import { BaseConnector } from './baseConnector';
import { SearchParams } from '../activityDiscoveryService';
import { ExternalActivity } from '@teaching-engine/database';
import { WebFetch } from '../../utils/webFetch';
import * as cheerio from 'cheerio';

interface TPTSearchResult {
  title: string;
  url: string;
  price: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  author?: string;
  thumbnailUrl?: string;
  gradeRange?: string;
  subjects?: string[];
}

export class TPTWebConnector extends BaseConnector {
  private webFetch: WebFetch;
  private readonly baseUrl = 'https://www.teacherspayteachers.com';

  constructor() {
    super('TeachersPayTeachers');
    this.webFetch = new WebFetch();
  }

  async search(
    params: SearchParams,
  ): Promise<Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const activities: Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    try {
      // Build search URL with filters
      const searchUrl = this.buildSearchUrl(params);
      const html = await this.webFetch.fetch(searchUrl);
      const $ = cheerio.load(html);

      // Parse search results
      const results = this.parseSearchResults($);

      // Convert to ExternalActivity format, focusing on free resources
      for (const result of results) {
        // Skip paid resources if we want only free ones
        if (result.price !== 'FREE' && result.price !== '$0.00') {
          continue;
        }

        activities.push(
          this.transformToExternalActivity({
            externalId: this.extractIdFromUrl(result.url),
            source: this.sourceName,
            url: result.url,
            title: result.title,
            description:
              result.description ||
              `${result.gradeRange || ''} ${result.subjects?.join(', ') || ''}`.trim(),
            thumbnailUrl: result.thumbnailUrl,
            activityType: this.inferActivityTypeFromTitle(result.title),
            gradeMin: this.extractGradeMin(result.gradeRange || '', params.gradeLevel),
            gradeMax: this.extractGradeMax(result.gradeRange || '', params.gradeLevel),
            subject: params.subject || this.mapTPTSubject(result.subjects?.[0]),
            language: params.language || 'en',
            materials: [],
            duration: this.estimateDuration(result.title),
            groupSize: 'flexible',
            pedagogicalApproach: ['differentiated-instruction'],
            curriculumAlignments: [],
            createdBy: result.author || 'TPT Educator',
            license: 'TPT Terms of Use',
            resourceUrls: [result.url],
            metadata: {
              rating: result.rating,
              reviewCount: result.reviewCount,
              isFree: true,
            },
          }),
        );
      }

      // Limit results
      return activities.slice(0, params.limit || 20);
    } catch (error) {
      console.error('Error searching TPT:', error);
      return [];
    }
  }

  async getActivityDetails(
    externalId: string,
  ): Promise<Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'> | null> {
    try {
      const url = `${this.baseUrl}/Product/${externalId}`;
      const html = await this.webFetch.fetch(url);
      const $ = cheerio.load(html);

      // Extract detailed information
      const title = $('h1').first().text().trim();
      const description =
        $('.product-description').text().trim() ||
        $('meta[property="og:description"]').attr('content') ||
        '';

      const gradeText = $('.grade-range').text() || '';
      const subjectTags: string[] = [];
      $('.subject-tag').each((i, elem) => {
        subjectTags.push($(elem).text().trim());
      });

      const thumbnailUrl = $('meta[property="og:image"]').attr('content');
      const author = $('.store-name').text().trim();
      const price = $('.price-tag').text().trim();

      // Only process free resources
      if (!price.includes('FREE') && price !== '$0.00') {
        return null;
      }

      // Look for materials and instructions
      const materials: string[] = [];
      const instructionSections = $('.product-details, .included-materials');
      instructionSections.find('li').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text.toLowerCase().includes('material') || text.toLowerCase().includes('supply')) {
          materials.push(text);
        }
      });

      return this.transformToExternalActivity({
        externalId,
        source: this.sourceName,
        url,
        title,
        description,
        thumbnailUrl,
        activityType: this.inferActivityTypeFromTitle(title),
        gradeMin: this.extractGradeMin(gradeText),
        gradeMax: this.extractGradeMax(gradeText),
        subject: this.mapTPTSubject(subjectTags[0]),
        language: 'en',
        materials,
        duration: this.estimateDuration(title),
        groupSize: 'flexible',
        pedagogicalApproach: ['differentiated-instruction', 'hands-on-learning'],
        curriculumAlignments: [],
        createdBy: author,
        license: 'TPT Terms of Use - Free Resource',
        resourceUrls: [url],
      });
    } catch (error) {
      console.error('Error fetching TPT activity details:', error);
      return null;
    }
  }

  private buildSearchUrl(params: SearchParams): string {
    const queryParams = new URLSearchParams();

    // Add search query
    if (params.query) {
      queryParams.append('q', params.query);
    }

    // Add grade filter
    if (params.gradeLevel) {
      queryParams.append('grade', params.gradeLevel.toString());
    }

    // Add subject filter
    if (params.subject) {
      queryParams.append('subject', this.mapToTPTSubject(params.subject));
    }

    // Filter for free resources only
    queryParams.append('price', 'free');

    // Add language filter if French
    if (params.language === 'fr') {
      queryParams.append('q', queryParams.get('q') + ' french français');
    }

    return `${this.baseUrl}/Browse/Search:${queryParams.toString()}`;
  }

  private parseSearchResults($: cheerio.CheerioAPI): TPTSearchResult[] {
    const results: TPTSearchResult[] = [];

    // Parse product cards
    $('.product-card, .resource-card, .search-result-item').each((i, elem) => {
      const $elem = $(elem);

      const title = $elem.find('.product-title, .resource-title, h3').first().text().trim();
      const url = $elem.find('a').first().attr('href');
      const price = $elem.find('.price, .resource-price').text().trim();
      const author = $elem.find('.author-name, .store-name').text().trim();
      const thumbnailUrl = $elem.find('img').first().attr('src');

      // Extract rating
      const ratingText = $elem.find('.rating').text();
      const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

      // Extract review count
      const reviewText = $elem.find('.review-count').text();
      const reviewMatch = reviewText.match(/\((\d+)\)/);
      const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : undefined;

      // Extract grade range
      const gradeRange = $elem.find('.grade-range, .grades').text().trim();

      // Extract subjects
      const subjects: string[] = [];
      $elem.find('.subject-tag, .subject').each((j, subElem) => {
        subjects.push($(subElem).text().trim());
      });

      if (title && url) {
        results.push({
          title,
          url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
          price,
          rating,
          reviewCount,
          author,
          thumbnailUrl,
          gradeRange,
          subjects,
        });
      }
    });

    return results;
  }

  private extractIdFromUrl(url: string): string {
    // Extract product ID from URL patterns like /Product/Activity-Name-123456
    const match = url.match(/Product\/[^/]+-(\d+)/);
    if (match) {
      return match[1];
    }

    // Fallback: use last segment
    const segments = url.split('/').filter((s) => s.length > 0);
    return segments[segments.length - 1];
  }

  private inferActivityTypeFromTitle(title: string): string {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('worksheet') || titleLower.includes('printable')) {
      return 'worksheet';
    } else if (titleLower.includes('lesson plan') || titleLower.includes('unit plan')) {
      return 'lesson_plan';
    } else if (
      titleLower.includes('game') ||
      titleLower.includes('bingo') ||
      titleLower.includes('puzzle')
    ) {
      return 'game';
    } else if (
      titleLower.includes('experiment') ||
      titleLower.includes('lab') ||
      titleLower.includes('science')
    ) {
      return 'experiment';
    } else if (titleLower.includes('project') || titleLower.includes('research')) {
      return 'project';
    } else if (
      titleLower.includes('assessment') ||
      titleLower.includes('test') ||
      titleLower.includes('quiz')
    ) {
      return 'assessment';
    } else if (titleLower.includes('center') || titleLower.includes('station')) {
      return 'center_activity';
    } else if (titleLower.includes('craft') || titleLower.includes('art')) {
      return 'art_craft';
    } else if (titleLower.includes('reading') || titleLower.includes('comprehension')) {
      return 'reading';
    } else if (titleLower.includes('writing') || titleLower.includes('journal')) {
      return 'writing';
    } else if (titleLower.includes('math') || titleLower.includes('number')) {
      return 'math_activity';
    }

    return 'handson';
  }

  private extractGradeMin(gradeRange: string, defaultGrade?: number): number {
    // Handle patterns like "1st - 3rd", "K-2", "Grades 1-5"
    const match = gradeRange.match(/(\d+|K)/i);
    if (match) {
      if (match[1].toUpperCase() === 'K') return 0;
      return parseInt(match[1]);
    }
    return defaultGrade || 1;
  }

  private extractGradeMax(gradeRange: string, defaultGrade?: number): number {
    // Look for the second number in range
    const matches = gradeRange.match(/(\d+|K)[^\d]*(\d+)?/i);
    if (matches && matches[2]) {
      return parseInt(matches[2]);
    }
    // If only one grade found, use it
    if (matches && matches[1] && matches[1] !== 'K') {
      return parseInt(matches[1]);
    }
    return defaultGrade || 8;
  }

  private estimateDuration(title: string): number {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('quick') || titleLower.includes('5 minute')) {
      return 5;
    } else if (titleLower.includes('15 minute') || titleLower.includes('warm up')) {
      return 15;
    } else if (titleLower.includes('30 minute')) {
      return 30;
    } else if (titleLower.includes('full lesson') || titleLower.includes('complete lesson')) {
      return 45;
    } else if (titleLower.includes('unit') || titleLower.includes('week')) {
      return 60;
    } else if (titleLower.includes('center') || titleLower.includes('station')) {
      return 20;
    }

    return 30; // Default duration
  }

  private mapTPTSubject(tptSubject?: string): string {
    if (!tptSubject) return 'General';

    const subjectMap: { [key: string]: string } = {
      'English Language Arts': 'English',
      ELA: 'English',
      Math: 'Mathematics',
      Science: 'Science',
      'Social Studies': 'Social Studies',
      French: 'French',
      Spanish: 'French', // Map to French for our French immersion context
      Art: 'Arts',
      Music: 'Arts',
      'Physical Education': 'Physical Education',
      PE: 'Physical Education',
      Health: 'Health',
      'Character Education': 'Social Emotional Learning',
      SEL: 'Social Emotional Learning',
    };

    return subjectMap[tptSubject] || tptSubject;
  }

  private mapToTPTSubject(subject: string): string {
    const reverseMap: { [key: string]: string } = {
      Mathematics: 'Math',
      English: 'English Language Arts',
      Science: 'Science',
      'Social Studies': 'Social Studies',
      French: 'French',
      Arts: 'Art',
      'Physical Education': 'Physical Education',
      Health: 'Health',
      'Social Emotional Learning': 'Character Education',
    };

    return reverseMap[subject] || subject;
  }
}
