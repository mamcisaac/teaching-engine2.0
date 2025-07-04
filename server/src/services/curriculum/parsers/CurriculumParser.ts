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
    // Ontario curriculum code format: Grade.Strand.Substrand.Number
    const codePattern = /^[A-Z0-9]+\.[A-Z0-9]+(\.[A-Z0-9]+)?(\.[0-9]+)?$/;
    return codePattern.test(code);
  }

  /**
   * Parse expectation type from code or description
   */
  protected parseExpectationType(code: string, description: string): 'overall' | 'specific' {
    // Overall expectations typically have shorter codes or contain "overall" in description
    if (code.split('.').length <= 2 || description.toLowerCase().includes('overall')) {
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