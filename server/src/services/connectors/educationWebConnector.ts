import { BaseConnector } from './baseConnector';
import { SearchParams } from '../activityDiscoveryService';
import { ExternalActivity } from '@teaching-engine/database';
import * as cheerio from 'cheerio';

interface EducationalSite {
  id: string;
  name: string;
  baseUrl: string;
  searchUrl: (query: string, params: SearchParams) => string;
  parseResults: (html: string, $: cheerio.CheerioAPI, site: EducationalSite) => EducationalActivity[];
  isActive: boolean;
  language: 'en' | 'fr' | 'both';
  crawlDelay: number; // milliseconds
}

interface EducationalActivity {
  title: string;
  url: string;
  description?: string;
  grade?: string;
  subject?: string;
  type?: string;
  materials?: string[];
  duration?: number;
  thumbnail?: string;
  isFree?: boolean;
  rating?: number;
}

/**
 * Educational Websites Connector
 * Searches multiple educational resource websites for activities and lessons
 */
export class EducationWebConnector extends BaseConnector {
  private sites: EducationalSite[] = [
    {
      id: 'khan-academy',
      name: 'Khan Academy',
      baseUrl: 'https://www.khanacademy.org',
      language: 'both',
      isActive: true,
      crawlDelay: 2000,
      searchUrl: (query: string, params: SearchParams) => {
        const searchParams = new URLSearchParams({
          search: query,
          sort: 'votes',
        });
        
        if (params.grade) {
          // Khan Academy uses different grade representations
          if (params.grade >= 1 && params.grade <= 8) {
            searchParams.append('class', `grade-${params.grade}`);
          }
        }
        
        if (params.subject) {
          const subjectMap: Record<string, string> = {
            'math': 'math',
            'science': 'science',
            'english': 'ela',
            'social-studies': 'humanities',
          };
          const khanSubject = subjectMap[params.subject.toLowerCase()];
          if (khanSubject) {
            searchParams.append('subject', khanSubject);
          }
        }

        return `https://www.khanacademy.org/search?${searchParams.toString()}`;
      },
      parseResults: (html: string, $: cheerio.CheerioAPI): EducationalActivity[] => {
        const activities: EducationalActivity[] = [];

        $('.search-results-list .result').each((_, element) => {
          const $element = $(element);
          const title = $element.find('.result-title a').text().trim();
          const url = $element.find('.result-title a').attr('href');
          const description = $element.find('.result-description').text().trim();
          const thumbnail = $element.find('img').attr('src');

          if (title && url) {
            activities.push({
              title,
              url: url.startsWith('http') ? url : `https://www.khanacademy.org${url}`,
              description,
              type: 'video', // Khan Academy is primarily video-based
              thumbnail,
              isFree: true,
            });
          }
        });

        return activities;
      },
    },
    {
      id: 'teacher-resources',
      name: 'Teacher Resources (Readworks, Scholastic)',
      baseUrl: 'https://www.readworks.org',
      language: 'en',
      isActive: true,
      crawlDelay: 3000,
      searchUrl: (query: string, params: SearchParams) => {
        const searchParams = new URLSearchParams({
          q: query,
        });
        
        if (params.grade) {
          searchParams.append('grade', params.grade.toString());
        }

        return `https://www.readworks.org/find-content?${searchParams.toString()}`;
      },
      parseResults: (html: string, $: cheerio.CheerioAPI): EducationalActivity[] => {
        const activities: EducationalActivity[] = [];

        $('.search-result, .content-card').each((_, element) => {
          const $element = $(element);
          const title = $element.find('.title, h3, .card-title').first().text().trim();
          const url = $element.find('a').first().attr('href');
          const description = $element.find('.description, .excerpt, .card-text').first().text().trim();
          const gradeText = $element.find('.grade, .grade-level').text().trim();

          if (title && url) {
            activities.push({
              title,
              url: url.startsWith('http') ? url : `https://www.readworks.org${url}`,
              description,
              grade: gradeText,
              type: 'worksheet',
              isFree: true,
            });
          }
        });

        return activities;
      },
    },
    {
      id: 'education-ca',
      name: 'Education.ca Resources',
      baseUrl: 'https://www.education.ca',
      language: 'both',
      isActive: true,
      crawlDelay: 2500,
      searchUrl: (query: string, params: SearchParams) => {
        const searchParams = new URLSearchParams({
          q: query,
          sort: 'relevance',
        });
        
        if (params.language === 'fr') {
          searchParams.append('lang', 'fr');
        }

        return `https://www.education.ca/search?${searchParams.toString()}`;
      },
      parseResults: (html: string, $: cheerio.CheerioAPI): EducationalActivity[] => {
        const activities: EducationalActivity[] = [];

        $('.resource-item, .search-result').each((_, element) => {
          const $element = $(element);
          const title = $element.find('.resource-title, .title').text().trim();
          const url = $element.find('a').first().attr('href');
          const description = $element.find('.resource-description, .description').text().trim();
          const gradeText = $element.find('.grade-level, .grade').text().trim();
          const subjectText = $element.find('.subject').text().trim();

          if (title && url) {
            activities.push({
              title,
              url: url.startsWith('http') ? url : `https://www.education.ca${url}`,
              description,
              grade: gradeText,
              subject: subjectText,
              type: 'resource',
              isFree: true,
            });
          }
        });

        return activities;
      },
    },
    {
      id: 'tvo-ilc',
      name: 'TVO ILC (French Resources)',
      baseUrl: 'https://www.tvoilc.ca',
      language: 'fr',
      isActive: true,
      crawlDelay: 3000,
      searchUrl: (query: string, params: SearchParams) => {
        const searchParams = new URLSearchParams({
          q: query,
        });
        
        if (params.grade) {
          searchParams.append('niveau', params.grade.toString());
        }

        return `https://www.tvoilc.ca/recherche?${searchParams.toString()}`;
      },
      parseResults: (html: string, $: cheerio.CheerioAPI): EducationalActivity[] => {
        const activities: EducationalActivity[] = [];

        $('.resource, .cours-item').each((_, element) => {
          const $element = $(element);
          const title = $element.find('.titre, .title, h3').first().text().trim();
          const url = $element.find('a').first().attr('href');
          const description = $element.find('.description, .resume').first().text().trim();

          if (title && url) {
            activities.push({
              title,
              url: url.startsWith('http') ? url : `https://www.tvoilc.ca${url}`,
              description,
              type: 'lesson_plan',
              isFree: true,
            });
          }
        });

        return activities;
      },
    },
    {
      id: 'teachingideas',
      name: 'Teaching Ideas & Worksheets',
      baseUrl: 'https://www.teachingideas.co.uk',
      language: 'en',
      isActive: true,
      crawlDelay: 2000,
      searchUrl: (query: string, _params: SearchParams) => {
        return `https://www.teachingideas.co.uk/search?q=${encodeURIComponent(query)}`;
      },
      parseResults: (html: string, $: cheerio.CheerioAPI): EducationalActivity[] => {
        const activities: EducationalActivity[] = [];

        $('.search-result, .resource-card').each((_, element) => {
          const $element = $(element);
          const title = $element.find('.title, h3, .resource-title').first().text().trim();
          const url = $element.find('a').first().attr('href');
          const description = $element.find('.excerpt, .description').first().text().trim();

          if (title && url) {
            activities.push({
              title,
              url: url.startsWith('http') ? url : `https://www.teachingideas.co.uk${url}`,
              description,
              type: this.inferTypeFromTitle(title),
              isFree: true,
            });
          }
        });

        return activities;
      },
    },
  ];

  constructor() {
    super('EducationWeb');
  }

  async search(
    params: SearchParams,
  ): Promise<Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const activities: Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    // Filter sites based on language preference
    const sitesToSearch = this.sites.filter((site) => {
      if (!site.isActive) return false;
      if (params.language === 'fr' && site.language === 'en') return false;
      if (params.language === 'en' && site.language === 'fr') return false;
      return true;
    });

    // Search each site
    for (const site of sitesToSearch) {
      try {
        console.log(`Searching ${site.name} for: ${params.query}`);
        
        const searchUrl = site.searchUrl(params.query || '', params);
        const html = await this.fetchWithRetry(searchUrl);
        
        if (!html) continue;

        const $ = cheerio.load(html);
        const siteResults = site.parseResults(html, $, site);

        // Transform results to ExternalActivity format
        for (const result of siteResults) {
          const activity = this.transformToExternalActivity(
            result,
            {
              externalId: this.generateIdFromUrl(result.url),
              source: this.sourceName,
              url: result.url,
              title: result.title,
              description: result.description,
              thumbnailUrl: result.thumbnail,
              duration: result.duration || this.estimateDuration(result),
              activityType: result.type || this.inferActivityType({
                title: result.title,
                description: result.description,
              }),
              gradeMin: this.extractGradeFromText(result.grade || result.description || '').min,
              gradeMax: this.extractGradeFromText(result.grade || result.description || '').max,
              subject: this.normalizeSubject(result.subject || this.inferSubject(result.title + ' ' + (result.description || ''))),
              language: params.language || site.language === 'fr' ? 'fr' : 'en',
              materials: result.materials || this.extractMaterials(result.description || ''),
              sourceRating: result.rating,
              isFree: result.isFree !== false, // Default to free
              license: 'Educational Use',
            }
          );

          activities.push(activity);
        }

        // Respect crawl delay between sites
        await this.delay(site.crawlDelay);
      } catch (error) {
        console.error(`Error searching ${site.name}:`, error);
      }
    }

    console.log(`Found ${activities.length} activities from educational websites`);
    return activities;
  }

  async getActivityDetails(
    _externalId: string,
  ): Promise<Omit<ExternalActivity, 'id' | 'createdAt' | 'updatedAt'> | null> {
    // For educational web connector, we'd need to store the original URL mapping
    // This is a simplified implementation
    try {
      // In a real implementation, we'd reconstruct the URL from the external ID
      // or store the mapping in a database
      return null;
    } catch (error) {
      console.error('Error getting activity details:', error);
      return null;
    }
  }

  private async fetchWithRetry(
    url: string,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<string | null> {
    const headers = {
      'User-Agent': 'Teaching Engine 2.0 Educational Resource Bot (+https://teaching-engine.ca/bot)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
    };

    // Use the new fetchWithRetryAndTimeout from base class
    return this.fetchWithRetryAndTimeout(
      url,
      { headers },
      maxRetries,
      30000, // 30 second timeout per request
      delay
    );
  }

  private generateIdFromUrl(url: string): string {
    // Create a unique ID from the URL
    const hash = Buffer.from(url).toString('base64');
    return hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  }

  private extractGradeFromText(text: string): { min: number; max: number } {
    const gradeMatch = text.match(/grade\s*(\d+)(?:\s*-\s*(\d+))?|(\d+)(?:st|nd|rd|th)\s*grade/i);
    
    if (gradeMatch) {
      const grade1 = parseInt(gradeMatch[1] || gradeMatch[3]);
      const grade2 = gradeMatch[2] ? parseInt(gradeMatch[2]) : grade1;
      
      return {
        min: Math.min(grade1, grade2),
        max: Math.max(grade1, grade2),
      };
    }

    // Default for elementary
    return { min: 1, max: 8 };
  }

  private inferSubject(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('math') || lowerText.includes('number') || lowerText.includes('calculation')) {
      return 'mathematics';
    }
    if (lowerText.includes('science') || lowerText.includes('experiment') || lowerText.includes('biology')) {
      return 'science';
    }
    if (lowerText.includes('english') || lowerText.includes('reading') || lowerText.includes('writing')) {
      return 'english';
    }
    if (lowerText.includes('french') || lowerText.includes('français')) {
      return 'french';
    }
    if (lowerText.includes('history') || lowerText.includes('geography') || lowerText.includes('social')) {
      return 'social-studies';
    }
    if (lowerText.includes('art') || lowerText.includes('music') || lowerText.includes('drama')) {
      return 'arts';
    }
    if (lowerText.includes('physical') || lowerText.includes('pe') || lowerText.includes('sport')) {
      return 'physical-education';
    }

    return 'general';
  }

  private inferTypeFromTitle(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('worksheet') || lowerTitle.includes('printable')) {
      return 'worksheet';
    }
    if (lowerTitle.includes('game') || lowerTitle.includes('activity')) {
      return 'game';
    }
    if (lowerTitle.includes('lesson') || lowerTitle.includes('plan')) {
      return 'lesson_plan';
    }
    if (lowerTitle.includes('video') || lowerTitle.includes('watch')) {
      return 'video';
    }
    if (lowerTitle.includes('experiment') || lowerTitle.includes('investigation')) {
      return 'experiment';
    }

    return 'worksheet';
  }

  private estimateDuration(activity: EducationalActivity): number {
    const text = (activity.title + ' ' + (activity.description || '')).toLowerCase();
    
    // Look for explicit duration mentions
    const durationMatch = text.match(/(\d+)\s*(?:minutes?|mins?|hours?)/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[0].toLowerCase();
      
      if (unit.includes('hour')) {
        return value * 60;
      }
      return value;
    }

    // Estimate based on activity type
    if (activity.type === 'video') return 10;
    if (activity.type === 'game') return 20;
    if (activity.type === 'worksheet') return 25;
    if (activity.type === 'lesson_plan') return 45;
    if (activity.type === 'experiment') return 60;

    return 30; // Default
  }

}