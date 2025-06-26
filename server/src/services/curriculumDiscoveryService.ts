import BaseService from './base/BaseService';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import { CurriculumImportService } from './curriculumImportService';
import { safeFetch, isValidExternalURL, validateFileSize } from '../utils/urlValidator';

export interface CurriculumDocument {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceType: 'government' | 'ministry' | 'department';
  province: string;
  grade?: number;
  gradeRange?: { min: number; max: number };
  subject?: string;
  documentType: 'curriculum' | 'guideline' | 'assessment' | 'resource';
  fileType: 'pdf' | 'docx' | 'html' | 'unknown';
  publishedDate?: Date;
  lastModified?: Date;
  fileSize?: number;
  description?: string;
  language: 'en' | 'fr' | 'both';
  isActive: boolean;
  lastVerified: Date;
  downloadAttempts: number;
  downloadStatus: 'pending' | 'downloaded' | 'processed' | 'failed';
  processingErrors?: string[];
}

export interface DiscoverySource {
  id: string;
  name: string;
  baseUrl: string;
  province: string;
  searchUrls: string[];
  isActive: boolean;
  lastScanDate?: Date;
  robotsTxt?: string;
  crawlDelay: number; // milliseconds
  maxDepth: number;
  allowedDomains: string[];
  excludePatterns: string[];
}

const CurriculumDocumentSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  source: z.string(),
  province: z.string(),
  grade: z.number().optional(),
  subject: z.string().optional(),
  documentType: z.enum(['curriculum', 'guideline', 'assessment', 'resource']),
  fileType: z.enum(['pdf', 'docx', 'html', 'unknown']),
  description: z.string().optional(),
  language: z.enum(['en', 'fr', 'both']),
});

export class CurriculumDiscoveryService extends BaseService {
  private curriculumImportService: CurriculumImportService;
  private discoveredDocuments: Map<string, CurriculumDocument> = new Map();
  private sources: DiscoverySource[] = [];

  constructor() {
    super('CurriculumDiscoveryService');
    this.curriculumImportService = new CurriculumImportService();
    this.initializeDefaultSources();
  }

  /**
   * Initialize default government curriculum sources
   */
  private initializeDefaultSources(): void {
    this.sources = [
      {
        id: 'pei-gov',
        name: 'Prince Edward Island Department of Education',
        baseUrl: 'https://www.princeedwardisland.ca',
        province: 'PE',
        searchUrls: [
          'https://www.princeedwardisland.ca/en/topic/curriculum',
          'https://www.princeedwardisland.ca/en/topic/curriculum-french-immersion',
          'https://www.princeedwardisland.ca/en/information/education-and-lifelong-learning/curriculum-documents',
        ],
        isActive: true,
        robotsTxt: 'https://www.princeedwardisland.ca/robots.txt',
        crawlDelay: 2000,
        maxDepth: 3,
        allowedDomains: ['www.princeedwardisland.ca'],
        excludePatterns: ['/search/', '/contact/', '/about/'],
      },
      {
        id: 'ontario-edu',
        name: 'Ontario Ministry of Education',
        baseUrl: 'https://www.dcp.edu.gov.on.ca',
        province: 'ON',
        searchUrls: [
          'https://www.dcp.edu.gov.on.ca/en/curriculum',
          'https://www.dcp.edu.gov.on.ca/en/curriculum/elementary',
          'https://www.dcp.edu.gov.on.ca/en/curriculum/elementary/french-immersion',
        ],
        isActive: true,
        robotsTxt: 'https://www.dcp.edu.gov.on.ca/robots.txt',
        crawlDelay: 3000,
        maxDepth: 3,
        allowedDomains: ['www.dcp.edu.gov.on.ca', 'edu.gov.on.ca'],
        excludePatterns: ['/search/', '/login/', '/admin/'],
      },
      {
        id: 'bc-gov',
        name: 'British Columbia Ministry of Education',
        baseUrl: 'https://curriculum.gov.bc.ca',
        province: 'BC',
        searchUrls: [
          'https://curriculum.gov.bc.ca/curriculum',
          'https://curriculum.gov.bc.ca/curriculum/french-immersion',
        ],
        isActive: true,
        robotsTxt: 'https://curriculum.gov.bc.ca/robots.txt',
        crawlDelay: 2000,
        maxDepth: 2,
        allowedDomains: ['curriculum.gov.bc.ca'],
        excludePatterns: ['/search/', '/contact/'],
      },
    ];
  }

  /**
   * Discover curriculum documents from all active sources
   */
  async discoverDocuments(): Promise<CurriculumDocument[]> {
    try {
      this.logger.info('Starting curriculum document discovery');
      const allDocuments: CurriculumDocument[] = [];

      for (const source of this.sources.filter((s) => s.isActive)) {
        try {
          this.logger.info(`Discovering documents from ${source.name}`);
          const documents = await this.discoverFromSource(source);
          allDocuments.push(...documents);
          
          // Update last scan date
          source.lastScanDate = new Date();
        } catch (error) {
          this.logger.error(
            { error, sourceId: source.id },
            `Failed to discover documents from ${source.name}`
          );
        }

        // Respect crawl delay between sources
        await this.delay(source.crawlDelay);
      }

      this.logger.info(`Discovered ${allDocuments.length} curriculum documents`);
      return allDocuments;
    } catch (error) {
      this.logger.error({ error }, 'Failed to discover curriculum documents');
      throw error;
    }
  }

  /**
   * Discover documents from a specific source
   */
  private async discoverFromSource(source: DiscoverySource): Promise<CurriculumDocument[]> {
    const documents: CurriculumDocument[] = [];
    const visitedUrls = new Set<string>();

    for (const searchUrl of source.searchUrls) {
      try {
        const pageDocuments = await this.crawlPage(
          searchUrl,
          source,
          visitedUrls,
          0
        );
        documents.push(...pageDocuments);
      } catch (error) {
        this.logger.error(
          { error, searchUrl, sourceId: source.id },
          'Failed to crawl search URL'
        );
      }
    }

    return documents;
  }

  /**
   * Crawl a page and its linked pages for curriculum documents
   */
  private async crawlPage(
    url: string,
    source: DiscoverySource,
    visitedUrls: Set<string>,
    depth: number
  ): Promise<CurriculumDocument[]> {
    if (depth > source.maxDepth || visitedUrls.has(url)) {
      return [];
    }

    // Check if URL should be excluded
    if (source.excludePatterns.some((pattern) => url.includes(pattern))) {
      return [];
    }

    visitedUrls.add(url);
    const documents: CurriculumDocument[] = [];

    try {
      this.logger.debug(`Crawling page: ${url} (depth: ${depth})`);
      
      // Validate and fetch page content securely
      const urlValidation = isValidExternalURL(url);
      if (!urlValidation.valid) {
        throw new Error(`URL validation failed: ${urlValidation.error}`);
      }

      const response = await safeFetch(url, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Validate file size for large responses
      if (!validateFileSize(response, 10 * 1024 * 1024)) { // 10MB limit
        throw new Error('Response too large - potential DoS attempt');
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract curriculum documents from current page
      const pageDocuments = await this.extractDocumentsFromPage($, url, source);
      documents.push(...pageDocuments);

      // Find links to other curriculum pages
      if (depth < source.maxDepth) {
        const links = this.extractCurriculumLinks($, url, source);
        
        for (const link of links) {
          await this.delay(source.crawlDelay);
          const linkedDocuments = await this.crawlPage(link, source, visitedUrls, depth + 1);
          documents.push(...linkedDocuments);
        }
      }
    } catch (error) {
      this.logger.error({ error, url }, 'Failed to crawl page');
    }

    return documents;
  }

  /**
   * Extract curriculum documents from a single page
   */
  private async extractDocumentsFromPage(
    $: cheerio.CheerioAPI,
    pageUrl: string,
    source: DiscoverySource
  ): Promise<CurriculumDocument[]> {
    const documents: CurriculumDocument[] = [];

    // Look for PDF and DOCX links that might be curriculum documents
    const documentLinks = $('a[href$=".pdf"], a[href$=".docx"], a[href*="/download/"], a[href*="/resource/"]');

    documentLinks.each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const linkText = $link.text().trim();
      const parentText = $link.parent().text().trim();

      if (!href || !this.isCurriculumDocument(linkText, parentText)) {
        return;
      }

      // Resolve relative URLs
      const absoluteUrl = new URL(href, pageUrl).toString();

      // Extract document metadata
      const document = this.createDocumentFromLink({
        url: absoluteUrl,
        title: linkText || this.extractTitleFromUrl(absoluteUrl),
        source: source.name,
        province: source.province,
        context: parentText,
        pageUrl,
      });

      if (document) {
        documents.push(document);
      }
    });

    return documents;
  }

  /**
   * Determine if a link is likely a curriculum document
   */
  private isCurriculumDocument(linkText: string, context: string): boolean {
    const combinedText = (linkText + ' ' + context).toLowerCase();
    
    const curriculumKeywords = [
      'curriculum',
      'program of studies',
      'course outline',
      'learning outcomes',
      'expectations',
      'grade',
      'subject guide',
      'teaching guide',
      'assessment',
      'rubric',
      'français',
      'french immersion',
      'mathematics',
      'science',
      'social studies',
      'english language arts',
      'physical education',
      'arts education',
    ];

    // Must contain at least one curriculum keyword
    const hasCurriculumKeyword = curriculumKeywords.some((keyword) =>
      combinedText.includes(keyword)
    );

    // Exclude non-curriculum documents
    const excludeKeywords = [
      'form',
      'application',
      'newsletter',
      'news',
      'event',
      'calendar',
      'contact',
      'directory',
      'budget',
      'policy',
      'procedure',
    ];

    const hasExcludeKeyword = excludeKeywords.some((keyword) =>
      combinedText.includes(keyword)
    );

    return hasCurriculumKeyword && !hasExcludeKeyword;
  }

  /**
   * Extract curriculum-related links from a page
   */
  private extractCurriculumLinks(
    $: cheerio.CheerioAPI,
    pageUrl: string,
    source: DiscoverySource
  ): string[] {
    const links: string[] = [];
    const linkElements = $('a[href]');

    linkElements.each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const linkText = $link.text().trim().toLowerCase();

      if (!href) return;

      // Resolve relative URLs
      let absoluteUrl: string;
      try {
        absoluteUrl = new URL(href, pageUrl).toString();
      } catch {
        return; // Skip invalid URLs
      }

      // Check if URL is within allowed domains
      const url = new URL(absoluteUrl);
      if (!source.allowedDomains.some((domain) => url.hostname.includes(domain))) {
        return;
      }

      // Look for curriculum-related page links
      const curriculumPageKeywords = [
        'curriculum',
        'grade',
        'subject',
        'program',
        'course',
        'français',
        'french',
        'immersion',
        'elementary',
        'primary',
      ];

      if (curriculumPageKeywords.some((keyword) => linkText.includes(keyword))) {
        links.push(absoluteUrl);
      }
    });

    return Array.from(new Set(links)); // Remove duplicates
  }

  /**
   * Create a CurriculumDocument from a link
   */
  private createDocumentFromLink(params: {
    url: string;
    title: string;
    source: string;
    province: string;
    context: string;
    pageUrl: string;
  }): CurriculumDocument | null {
    try {
      const { url, title, source, province, context } = params;

      // Extract metadata from title and context
      const grade = this.extractGrade(title + ' ' + context);
      const subject = this.extractSubject(title + ' ' + context);
      const documentType = this.extractDocumentType(title + ' ' + context);
      const fileType = this.extractFileType(url);
      const language = this.extractLanguage(title + ' ' + context);

      const document: CurriculumDocument = {
        id: this.generateDocumentId(url),
        title: this.cleanTitle(title),
        url,
        source,
        sourceType: 'government',
        province,
        grade,
        subject,
        documentType,
        fileType,
        description: context !== title ? context : undefined,
        language,
        isActive: true,
        lastVerified: new Date(),
        downloadAttempts: 0,
        downloadStatus: 'pending',
      };

      // Validate document
      const validation = CurriculumDocumentSchema.safeParse(document);
      if (!validation.success) {
        this.logger.warn(
          { errors: validation.error.errors, document },
          'Invalid curriculum document discovered'
        );
        return null;
      }

      return document;
    } catch (error) {
      this.logger.error({ error, params }, 'Failed to create document from link');
      return null;
    }
  }

  /**
   * Extract grade from text
   */
  private extractGrade(text: string): number | undefined {
    const gradePatterns = [
      /grade\s+(\d+)/i,
      /gr\.\s*(\d+)/i,
      /\b(\d+)(?:st|nd|rd|th)\s+grade/i,
      /year\s+(\d+)/i,
    ];

    for (const pattern of gradePatterns) {
      const match = text.match(pattern);
      if (match) {
        const grade = parseInt(match[1]);
        if (grade >= 0 && grade <= 12) {
          return grade;
        }
      }
    }

    // Check for kindergarten
    if (/kindergarten|kinder|maternelle/i.test(text)) {
      return 0;
    }

    return undefined;
  }

  /**
   * Extract subject from text
   */
  private extractSubject(text: string): string | undefined {
    const subjectPatterns: Record<string, RegExp[]> = {
      'Mathematics': [/math/i, /mathematics/i, /mathématiques/i],
      'French': [/french/i, /français/i, /fsl/i, /french immersion/i],
      'English': [/english/i, /language arts/i, /ela/i, /anglais/i],
      'Science': [/science/i, /sciences/i],
      'Social Studies': [/social studies/i, /social science/i, /études sociales/i, /history/i, /geography/i],
      'Physical Education': [/physical education/i, /phys ed/i, /pe/i, /éducation physique/i, /health/i],
      'Arts': [/arts/i, /art/i, /music/i, /drama/i, /visual arts/i],
    };

    for (const [subject, patterns] of Object.entries(subjectPatterns)) {
      if (patterns.some((pattern) => pattern.test(text))) {
        return subject;
      }
    }

    return undefined;
  }

  /**
   * Extract document type from text
   */
  private extractDocumentType(text: string): CurriculumDocument['documentType'] {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('assessment') || lowerText.includes('rubric') || lowerText.includes('evaluation')) {
      return 'assessment';
    }
    if (lowerText.includes('guide') || lowerText.includes('resource') || lowerText.includes('support')) {
      return 'resource';
    }
    if (lowerText.includes('guideline') || lowerText.includes('framework')) {
      return 'guideline';
    }

    return 'curriculum';
  }

  /**
   * Extract file type from URL
   */
  private extractFileType(url: string): CurriculumDocument['fileType'] {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('.pdf')) return 'pdf';
    if (lowerUrl.includes('.docx') || lowerUrl.includes('.doc')) return 'docx';
    if (lowerUrl.includes('.html') || lowerUrl.includes('.htm')) return 'html';
    return 'unknown';
  }

  /**
   * Extract language from text
   */
  private extractLanguage(text: string): CurriculumDocument['language'] {
    const hasFrench = /french|français|immersion|fsl|francophone/i.test(text);
    const hasEnglish = /english|anglais/i.test(text) || (!hasFrench && /curriculum|program|guide/i.test(text));

    if (hasFrench && hasEnglish) return 'both';
    if (hasFrench) return 'fr';
    return 'en';
  }

  /**
   * Generate unique document ID from URL
   */
  private generateDocumentId(url: string): string {
    const hash = Buffer.from(url).toString('base64');
    return hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  /**
   * Clean and normalize document title
   */
  private cleanTitle(title: string): string {
    return title
      .replace(/\.(pdf|docx?|html?)$/i, '')
      .replace(/^\s*-\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract title from URL if no title is available
   */
  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const fileName = urlObj.pathname.split('/').pop() || 'curriculum-document';
      return this.cleanTitle(fileName);
    } catch {
      return 'Curriculum Document';
    }
  }

  /**
   * Download a discovered curriculum document
   */
  async downloadDocument(documentId: string): Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }> {
    try {
      const document = this.discoveredDocuments.get(documentId);
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      this.logger.info(`Starting download of document: ${document.title}`);

      // Update download attempts
      document.downloadAttempts++;
      document.downloadStatus = 'pending';

      // Validate URL before downloading
      const urlValidation = isValidExternalURL(document.url);
      if (!urlValidation.valid) {
        throw new Error(`URL validation failed: ${urlValidation.error}`);
      }

      const response = await safeFetch(document.url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Validate file size before downloading
      const maxFileSize = 50 * 1024 * 1024; // 50MB limit
      if (!validateFileSize(response, maxFileSize)) {
        throw new Error('File too large - exceeds 50MB limit');
      }

      const buffer = await response.arrayBuffer();
      
      // Additional size check after download
      if (buffer.byteLength > maxFileSize) {
        throw new Error('Downloaded file exceeds size limit');
      }
      
      const fileBuffer = Buffer.from(buffer);

      // Store file metadata
      document.fileSize = fileBuffer.length;
      document.lastModified = new Date();
      document.downloadStatus = 'downloaded';

      this.logger.info(`Downloaded document: ${document.title} (${document.fileSize} bytes)`);

      return {
        success: true,
        filePath: document.url, // In production, would save to cloud storage
      };
    } catch (error) {
      this.logger.error({ error, documentId }, 'Failed to download document');
      
      const document = this.discoveredDocuments.get(documentId);
      if (document) {
        document.downloadStatus = 'failed';
        document.processingErrors = document.processingErrors || [];
        document.processingErrors.push(error instanceof Error ? error.message : 'Unknown error');
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process a downloaded document using the curriculum import service
   */
  async processDocument(
    documentId: string,
    userId: number
  ): Promise<{
    success: boolean;
    importId?: string;
    error?: string;
  }> {
    try {
      const document = this.discoveredDocuments.get(documentId);
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      if (document.downloadStatus !== 'downloaded') {
        throw new Error('Document must be downloaded before processing');
      }

      this.logger.info(`Processing document: ${document.title}`);

      // Create import session
      const importId = await this.curriculumImportService.startImport(
        userId,
        document.grade || 1,
        document.subject || 'General',
        document.fileType === 'pdf' ? 'pdf' : document.fileType === 'docx' ? 'docx' : 'manual',
        document.title,
        {
          discoverySource: document.source,
          originalUrl: document.url,
          documentType: document.documentType,
          province: document.province,
          autoDiscovered: true,
        }
      );

      // Update document status
      document.downloadStatus = 'processed';

      this.logger.info(`Created import session ${importId} for document: ${document.title}`);

      return {
        success: true,
        importId,
      };
    } catch (error) {
      this.logger.error({ error, documentId }, 'Failed to process document');

      const document = this.discoveredDocuments.get(documentId);
      if (document) {
        document.downloadStatus = 'failed';
        document.processingErrors = document.processingErrors || [];
        document.processingErrors.push(error instanceof Error ? error.message : 'Unknown error');
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all discovered documents
   */
  getDiscoveredDocuments(): CurriculumDocument[] {
    return Array.from(this.discoveredDocuments.values());
  }

  /**
   * Get discovered documents filtered by criteria
   */
  getDocumentsByFilter(filter: {
    province?: string;
    grade?: number;
    subject?: string;
    language?: string;
    documentType?: string;
    downloadStatus?: string;
  }): CurriculumDocument[] {
    const documents = this.getDiscoveredDocuments();
    
    return documents.filter((doc) => {
      if (filter.province && doc.province !== filter.province) return false;
      if (filter.grade && doc.grade !== filter.grade) return false;
      if (filter.subject && doc.subject !== filter.subject) return false;
      if (filter.language && doc.language !== filter.language) return false;
      if (filter.documentType && doc.documentType !== filter.documentType) return false;
      if (filter.downloadStatus && doc.downloadStatus !== filter.downloadStatus) return false;
      return true;
    });
  }

  /**
   * Update document verification status
   */
  async verifyDocument(documentId: string): Promise<boolean> {
    try {
      const document = this.discoveredDocuments.get(documentId);
      if (!document) return false;

      // Validate URL before verification
      const urlValidation = isValidExternalURL(document.url);
      if (!urlValidation.valid) {
        this.logger.warn({ documentId, url: document.url }, 'Invalid URL for verification');
        return false;
      }

      // Check if document is still available
      const response = await safeFetch(document.url, { method: 'HEAD' });
      const isAvailable = response.ok;

      document.isActive = isAvailable;
      document.lastVerified = new Date();

      return isAvailable;
    } catch (error) {
      this.logger.error({ error, documentId }, 'Failed to verify document');
      const document = this.discoveredDocuments.get(documentId);
      if (document) {
        document.isActive = false;
        document.lastVerified = new Date();
      }
      return false;
    }
  }

  /**
   * Add discovered document to internal storage
   */
  addDiscoveredDocument(document: CurriculumDocument): void {
    this.discoveredDocuments.set(document.id, document);
  }

  /**
   * Remove document from discovery results
   */
  removeDiscoveredDocument(documentId: string): boolean {
    return this.discoveredDocuments.delete(documentId);
  }

  /**
   * Get discovery statistics
   */
  getDiscoveryStats(): {
    totalDocuments: number;
    byProvince: Record<string, number>;
    bySubject: Record<string, number>;
    byGrade: Record<string, number>;
    byStatus: Record<string, number>;
    byLanguage: Record<string, number>;
  } {
    const documents = this.getDiscoveredDocuments();
    
    const stats = {
      totalDocuments: documents.length,
      byProvince: {} as Record<string, number>,
      bySubject: {} as Record<string, number>,
      byGrade: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byLanguage: {} as Record<string, number>,
    };

    documents.forEach((doc) => {
      // Count by province
      stats.byProvince[doc.province] = (stats.byProvince[doc.province] || 0) + 1;
      
      // Count by subject
      if (doc.subject) {
        stats.bySubject[doc.subject] = (stats.bySubject[doc.subject] || 0) + 1;
      }
      
      // Count by grade
      if (doc.grade !== undefined) {
        const gradeKey = `Grade ${doc.grade}`;
        stats.byGrade[gradeKey] = (stats.byGrade[gradeKey] || 0) + 1;
      }
      
      // Count by status
      stats.byStatus[doc.downloadStatus] = (stats.byStatus[doc.downloadStatus] || 0) + 1;
      
      // Count by language
      stats.byLanguage[doc.language] = (stats.byLanguage[doc.language] || 0) + 1;
    });

    return stats;
  }

  /**
   * Utility method to add delay between requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const curriculumDiscoveryService = new CurriculumDiscoveryService();