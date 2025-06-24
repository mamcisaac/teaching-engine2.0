import { BaseConnector } from './baseConnector';
import { SearchParams } from '../activityDiscoveryService';
import { ExternalActivity } from '@teaching-engine/database';
import { WebFetch } from '../../utils/webFetch';
import * as cheerio from 'cheerio';

interface CurriculumSite {
  name: string;
  baseUrl: string;
  searchUrl: (query: string, grade?: number) => string;
  parseResults: (html: string, $: cheerio.CheerioAPI) => CurriculumActivity[];
}

interface CurriculumActivity {
  title: string;
  url: string;
  description?: string;
  grade?: string;
  subject?: string;
  type?: string;
}

export class CurriculumWebConnector extends BaseConnector {
  private webFetch: WebFetch;
  private sites: CurriculumSite[] = [
    {
      name: 'PEI Curriculum',
      baseUrl: 'https://www.princeedwardisland.ca',
      searchUrl: (query: string, grade?: number) => {
        const baseSearch = `https://www.princeedwardisland.ca/en/search/site/${encodeURIComponent(query)}`;
        if (grade) {
          return `${baseSearch}+grade+${grade}`;
        }
        return baseSearch;
      },
      parseResults: (html: string, $: cheerio.CheerioAPI): CurriculumActivity[] => {
        const results: CurriculumActivity[] = [];
        
        // Parse PEI government search results
        $('.search-result').each((i, elem) => {
          const $elem = $(elem);
          const title = $elem.find('.search-result-title a').text().trim();
          const url = $elem.find('.search-result-title a').attr('href');
          const description = $elem.find('.search-result-snippet').text().trim();
          
          if (title && url) {
            // Extract grade and subject from title or description
            const gradeMatch = (title + ' ' + description).match(/grade\s+(\d+)/i);
            const grade = gradeMatch ? gradeMatch[1] : undefined;
            
            results.push({
              title,
              url: url.startsWith('http') ? url : `https://www.princeedwardisland.ca${url}`,
              description,
              grade,
              type: 'document'
            });
          }
        });
        
        return results;
      }
    },
    {
      name: 'Ontario Curriculum',
      baseUrl: 'https://www.dcp.edu.gov.on.ca',
      searchUrl: (query: string, grade?: number) => {
        return `https://www.dcp.edu.gov.on.ca/en/search?q=${encodeURIComponent(query)}${grade ? `+grade+${grade}` : ''}`;
      },
      parseResults: (html: string, $: cheerio.CheerioAPI): CurriculumActivity[] => {
        const results: CurriculumActivity[] = [];
        
        // Parse Ontario curriculum search results
        $('.search-results-item').each((i, elem) => {
          const $elem = $(elem);
          const title = $elem.find('h3 a').text().trim();
          const url = $elem.find('h3 a').attr('href');
          const description = $elem.find('.description').text().trim();
          
          if (title && url) {
            results.push({
              title,
              url: url.startsWith('http') ? url : `https://www.dcp.edu.gov.on.ca${url}`,
              description,
              type: 'curriculum_doc'
            });
          }
        });
        
        return results;
      }
    }
  ];

  constructor() {
    super();
    this.sourceName = 'CurriculumWeb';
    this.webFetch = new WebFetch();
  }

  async search(params: SearchParams): Promise<ExternalActivity[]> {
    const activities: ExternalActivity[] = [];
    
    // Search each curriculum site
    const searchPromises = this.sites.map(async (site) => {
      try {
        const searchUrl = site.searchUrl(params.query, params.gradeLevel);
        const html = await this.webFetch.fetch(searchUrl);
        const $ = cheerio.load(html);
        const siteResults = site.parseResults(html, $);
        
        // Convert to ExternalActivity format
        for (const result of siteResults) {
          // Fetch additional details from the activity page
          const activityDetails = await this.fetchActivityDetails(result.url);
          
          activities.push(this.transformToExternalActivity({
            externalId: this.generateIdFromUrl(result.url),
            source: this.sourceName,
            url: result.url,
            title: result.title,
            description: activityDetails?.description || result.description,
            activityType: this.inferActivityTypeFromContent(result, activityDetails),
            gradeMin: params.gradeLevel || (result.grade ? parseInt(result.grade) : 1),
            gradeMax: params.gradeLevel || (result.grade ? parseInt(result.grade) : 8),
            subject: params.subject || activityDetails?.subject || 'General',
            language: params.language || 'en',
            materials: activityDetails?.materials || [],
            duration: activityDetails?.duration || 45,
            groupSize: activityDetails?.groupSize || 'whole class',
            pedagogicalApproach: activityDetails?.approach || ['inquiry-based'],
            curriculumAlignments: activityDetails?.alignments || [],
            createdBy: site.name,
            license: 'Government of Canada - Open Government Licence',
            resourceUrls: activityDetails?.resources || []
          }));
        }
      } catch (error) {
        console.error(`Error searching ${site.name}:`, error);
      }
    });
    
    await Promise.all(searchPromises);
    
    return activities;
  }

  async getActivityDetails(externalId: string): Promise<ExternalActivity | null> {
    // Reconstruct URL from external ID
    const url = this.getUrlFromId(externalId);
    if (!url) return null;
    
    const activityDetails = await this.fetchActivityDetails(url);
    if (!activityDetails) return null;
    
    return this.transformToExternalActivity({
      externalId,
      source: this.sourceName,
      url,
      title: activityDetails.title,
      description: activityDetails.description,
      activityType: activityDetails.type || 'document',
      gradeMin: activityDetails.gradeMin || 1,
      gradeMax: activityDetails.gradeMax || 8,
      subject: activityDetails.subject || 'General',
      language: activityDetails.language || 'en',
      materials: activityDetails.materials || [],
      duration: activityDetails.duration || 45,
      groupSize: activityDetails.groupSize || 'whole class',
      pedagogicalApproach: activityDetails.approach || ['direct-instruction'],
      curriculumAlignments: activityDetails.alignments || [],
      createdBy: activityDetails.author || 'Unknown',
      license: 'Government of Canada - Open Government Licence',
      resourceUrls: activityDetails.resources || []
    });
  }

  private async fetchActivityDetails(url: string): Promise<any> {
    try {
      const html = await this.webFetch.fetch(url);
      const $ = cheerio.load(html);
      
      // Extract common patterns from curriculum pages
      const details: any = {
        title: $('h1').first().text().trim() || $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || 
                    $('.content-description').text().trim() ||
                    $('p').first().text().trim(),
        resources: []
      };
      
      // Look for grade information
      const gradeMatch = html.match(/grade\s+(\d+)(?:\s*-\s*(\d+))?/i);
      if (gradeMatch) {
        details.gradeMin = parseInt(gradeMatch[1]);
        details.gradeMax = gradeMatch[2] ? parseInt(gradeMatch[2]) : details.gradeMin;
      }
      
      // Look for subject information
      const subjectKeywords = ['mathematics', 'math', 'science', 'english', 'french', 'social studies', 'physical education', 'arts', 'music'];
      for (const keyword of subjectKeywords) {
        if (html.toLowerCase().includes(keyword)) {
          details.subject = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }
      
      // Look for PDF links and other resources
      $('a[href$=".pdf"], a[href*="/download/"], a[href*="/resource/"]').each((i, elem) => {
        const href = $(elem).attr('href');
        const text = $(elem).text().trim();
        if (href) {
          details.resources.push({
            url: href.startsWith('http') ? href : new URL(href, url).toString(),
            title: text || 'Resource'
          });
        }
      });
      
      // Look for activity type indicators
      if (html.toLowerCase().includes('lesson plan')) {
        details.type = 'lesson_plan';
      } else if (html.toLowerCase().includes('worksheet')) {
        details.type = 'worksheet';
      } else if (html.toLowerCase().includes('activity')) {
        details.type = 'handson';
      } else if (html.toLowerCase().includes('assessment')) {
        details.type = 'assessment';
      }
      
      // Look for materials list
      const materialsSection = $('.materials, .required-materials, #materials').text();
      if (materialsSection) {
        details.materials = materialsSection
          .split(/[,\n]/)
          .map(m => m.trim())
          .filter(m => m.length > 0);
      }
      
      // Look for curriculum alignments
      const alignments: string[] = [];
      $('.curriculum-expectation, .learning-outcome, .standard').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text) alignments.push(text);
      });
      if (alignments.length > 0) {
        details.alignments = alignments;
      }
      
      return details;
    } catch (error) {
      console.error('Error fetching activity details:', error);
      return null;
    }
  }

  private inferActivityTypeFromContent(result: CurriculumActivity, details: any): string {
    const content = (result.title + ' ' + result.description + ' ' + (details?.description || '')).toLowerCase();
    
    if (content.includes('worksheet') || content.includes('printable')) {
      return 'worksheet';
    } else if (content.includes('lesson plan') || content.includes('teaching plan')) {
      return 'lesson_plan';
    } else if (content.includes('experiment') || content.includes('lab')) {
      return 'experiment';
    } else if (content.includes('game') || content.includes('play')) {
      return 'game';
    } else if (content.includes('project')) {
      return 'project';
    } else if (content.includes('assessment') || content.includes('test') || content.includes('quiz')) {
      return 'assessment';
    } else if (content.includes('activity') || content.includes('hands-on')) {
      return 'handson';
    }
    
    return 'document';
  }

  private generateIdFromUrl(url: string): string {
    // Create a unique ID from the URL
    return Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
  }

  private getUrlFromId(externalId: string): string | null {
    // This is a simplified reconstruction - in production, we'd store the mapping
    // For now, return null as we'd need to look up the original URL
    return null;
  }
}