/**
 * Base Curriculum Parser Interface
 * Defines the contract for all curriculum file parsers
 */

export interface ParsedExpectation {
  code: string;
  description: string;
  type: 'overall' | 'specific';
  strand: string;
  substrand?: string;
  grade?: number;
  subject?: string;
  keywords?: string[];
}

export interface ParsedCurriculum {
  subject: string;
  grade: number;
  expectations: ParsedExpectation[];
  metadata?: {
    source?: string;
    version?: string;
    lastUpdated?: Date;
  };
}

export interface ParserOptions {
  strict?: boolean;
  validateCodes?: boolean;
  extractKeywords?: boolean;
}

export abstract class CurriculumParser {
  protected options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = {
      strict: true,
      validateCodes: true,
      extractKeywords: true,
      ...options,
    };
  }

  /**
   * Parse curriculum file content
   */
  abstract parse(content: string | Buffer): Promise<ParsedCurriculum>;

  /**
   * Validate parsed data
   */
  abstract validate(data: ParsedCurriculum): boolean;

  /**
   * Get supported file extensions
   */
  abstract getSupportedExtensions(): string[];

  /**
   * Extract keywords from description
   */
  protected extractKeywords(description: string): string[] {
    // Common educational keywords to extract
    const keywordPatterns = [
      /\b(understand|identify|analyze|create|evaluate|apply|compare|describe|explain)\b/gi,
      /\b(measurement|number|geometry|algebra|data|probability)\b/gi,
      /\b(reading|writing|oral|media|literacy)\b/gi,
      /\b(science|technology|engineering|arts|mathematics)\b/gi,
    ];

    const keywords = new Set<string>();

    keywordPatterns.forEach(pattern => {
      const matches = description.match(pattern);
      if (matches) {
        matches.forEach(match => keywords.add(match.toLowerCase()));
      }
    });

    return Array.from(keywords);
  }

  /**
   * Validate expectation code format
   */
  protected validateExpectationCode(code: string): boolean {
    // Ontario curriculum code format: supports both single codes (A1) and multi-part codes (A1.1, A1.1.2)
    const codePattern = /^[A-Z0-9]+(\.[A-Z0-9]+)*$/;
    return codePattern.test(code);
  }

  /**
   * Parse expectation type from code or description
   */
  protected parseExpectationType(code: string, description: string): 'overall' | 'specific' {
    // Check description first for explicit type indicators
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('overall')) {
      return 'overall';
    }
    if (lowerDesc.includes('specific')) {
      return 'specific';
    }
    
    // Overall expectations typically have single-part codes (e.g., A1, B2)
    // Specific expectations have multi-part codes (e.g., A1.1, B2.3)
    const parts = code.split('.');
    if (parts.length === 1) {
      return 'overall';
    }
    return 'specific';
  }

  /**
   * Clean and normalize text
   */
  protected cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"');
  }
}