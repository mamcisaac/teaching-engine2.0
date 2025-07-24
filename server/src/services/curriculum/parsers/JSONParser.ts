/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * JSON Curriculum Parser
 * Parses curriculum expectations from JSON files
 */

import { safeJsonParse } from '../../../utils/type-guards.js';

import type { ParsedCurriculum, ParsedExpectation } from './CurriculumParser';
import { CurriculumParser } from './CurriculumParser';

export interface JSONExpectation {
  code?: string;
  id?: string;
  description?: string;
  content?: string;
  text?: string;
  type?: string;
  category?: string;
  strand?: string;
  domain?: string;
  substrand?: string;
  topic?: string;
  grade?: number | string;
  level?: number | string;
  subject?: string;
  course?: string;
  keywords?: string[];
  [key: string]: unknown;
}

export interface JSONCurriculum {
  subject?: string;
  course?: string;
  grade?: number | string;
  level?: number | string;
  expectations?: JSONExpectation[];
  outcomes?: JSONExpectation[];
  standards?: JSONExpectation[];
  metadata?: unknown;
  [key: string]: unknown;
}

export class JSONParser extends CurriculumParser {
  /**
   * Parse JSON content
   */
  async parse(content: string | Buffer): Promise<ParsedCurriculum> {
    let stringContent: string;
    if (content instanceof Buffer) {
      stringContent = content.toString('utf-8');
    } else {
      stringContent = content as string;
    }
    
    let data: unknown;
    try {
      data = safeJsonParse(stringContent, {});
    } catch (_error) {
      throw new Error(`Invalid JSON format: ${_error instanceof Error ? _error.message : String(_error)}`);
    }

    // Handle array of expectations
    if (Array.isArray(data)) {
      return this.parseExpectationArray(data);
    }

    // Handle object with expectations
    if (typeof data === 'object' && data !== null) {
      return this.parseCurriculumObject(data as JSONCurriculum);
    }

    throw new Error('Invalid JSON structure for curriculum data');
  }

  /**
   * Parse array of expectations
   */
  private parseExpectationArray(data: unknown[]): ParsedCurriculum {
    const expectations: ParsedExpectation[] = [];
    let inferredGrade: number | undefined;
    let inferredSubject: string | undefined;

    for (const item of data) {
      const expectation = this.parseExpectation(item as JSONExpectation);
      if (expectation !== null) {
        expectations.push(expectation);
        
        // Try to infer grade and subject
        if ((inferredGrade === null) && (expectation.grade !== null)) {
          inferredGrade = expectation.grade;
        }
        if ((inferredSubject === null || inferredSubject === '') && (expectation.subject !== null && expectation.subject !== '')) {
          inferredSubject = expectation.subject;
        }
      }
    }

    const curriculum: ParsedCurriculum = {
      subject: (inferredSubject !== null && inferredSubject !== '') ? inferredSubject : 'Unknown',
      grade: (inferredGrade !== null) ? inferredGrade : 0,
      expectations,
      metadata: {
        source: 'JSON Import',
        lastUpdated: new Date(),
      },
    };

    if (this.validate(curriculum) !== true) {
      throw new Error('Invalid curriculum data structure');
    }

    return curriculum;
  }

  /**
   * Parse curriculum object
   */
  private parseCurriculumObject(data: JSONCurriculum): ParsedCurriculum {
    // Extract metadata
    const grade = this.parseGrade((data.grade !== null) ? data.grade : data.level);
    const subject = (data.subject !== null && data.subject !== '') ? data.subject : ((data.course !== null && data.course !== '') ? data.course : 'Unknown');

    // Find expectations array
    const expectationsList = 
      data.expectations || 
      data.outcomes || 
      data.standards ||
      this.findExpectationsArray(data);

    if ((expectationsList === null) || !Array.isArray(expectationsList)) {
      throw new Error('No expectations array found in JSON');
    }

    // Parse expectations
    const expectations: ParsedExpectation[] = [];
    
    for (const item of expectationsList) {
      const expectation = this.parseExpectation(item as JSONExpectation, grade, subject);
      if (expectation !== null) {
        expectations.push(expectation);
      }
    }

    const curriculum: ParsedCurriculum = {
      subject,
      grade: (grade !== null) ? grade : 0,
      expectations: this.organizeExpectations(expectations),
      metadata: {
        source: 'JSON Import',
        lastUpdated: new Date(),
        ...(typeof data.metadata === 'object' && data.metadata !== null ? data.metadata : {}),
      },
    };

    if (this.validate(curriculum) !== true) {
      throw new Error('Invalid curriculum data structure');
    }

    return curriculum;
  }

  /**
   * Find expectations array in nested object
   */
  private findExpectationsArray(obj: unknown, depth = 0): unknown[] | null {
    if (depth > 3) {
return null;
} // Prevent deep recursion
    
    if (typeof obj !== 'object' || obj === null) {
return null;
}

    for (const key in obj as Record<string, unknown>) {
      const value = (obj as Record<string, unknown>)[key];
      
      if (Array.isArray(value) && value.length > 0) {
        // Check if this looks like an expectations array
        const firstItem = value[0];
        if (
          typeof firstItem === 'object' &&
          (firstItem.code || firstItem.id || firstItem.description || firstItem.content)
        ) {
          return value;
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recurse into objects
        const found = this.findExpectationsArray(value, depth + 1);
        if (found) {
return found;
}
      }
    }

    return null;
  }

  /**
   * Parse individual expectation
   */
  private parseExpectation(
    item: JSONExpectation,
    defaultGrade?: number,
    defaultSubject?: string
  ): ParsedExpectation | null {
    // Extract code
    const code = this.cleanText(
      item.code || item.id || `EXP-${Date.now()}-${Math.random()}`
    );

    // Extract description
    const description = this.cleanText(
      item.description || item.content || item.text || ''
    );

    if (!description) {
return null;
}

    // Extract type
    const type = this.parseExpectationTypeFromJSON(
      item.type || item.category || '',
      code,
      description
    );

    // Extract strand
    const strand = this.cleanText(
      item.strand || item.domain || this.extractStrandFromCode(code)
    );

    // Extract other fields
    const expectation: ParsedExpectation = {
      code,
      description,
      type: type === 'overall' || type === 'specific' ? type : 'specific',
      strand,
      substrand: item.substrand || item.topic,
      grade: this.parseGrade(item.grade || item.level) || defaultGrade,
      subject: item.subject || item.course || defaultSubject,
    };

    // Handle keywords
    if (item.keywords && Array.isArray(item.keywords)) {
      expectation.keywords = item.keywords;
    } else if (this.options.extractKeywords) {
      expectation.keywords = this.extractKeywords(description);
    }

    return expectation;
  }

  /**
   * Parse grade value
   */
  private parseGrade(value: unknown): number | undefined {
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      const numeric = parseInt(value.replace(/\D/g, ''));
      if (!isNaN(numeric) && numeric >= 1 && numeric <= 12) {
        return numeric;
      }
    }
    
    return undefined;
  }

  /**
   * Parse expectation type from JSON value or fallback to parent logic
   */
  private parseExpectationTypeFromJSON(typeValue: string, code: string, description: string): 'overall' | 'specific' {
    if (typeValue) {
      const normalized = typeValue.toLowerCase();
      if (normalized.includes('overall')) {
return 'overall';
}
      if (normalized.includes('specific')) {
return 'specific';
}
      if (normalized === 'o') {
return 'overall';
}
      if (normalized === 's') {
return 'specific';
}
    }
    
    return super.parseExpectationType(code, description);
  }

  /**
   * Extract strand from code
   */
  private extractStrandFromCode(code: string): string {
    const parts = code.split('.');
    if (parts.length >= 2) {
      return parts[1];
    }
    return 'General';
  }

  /**
   * Organize expectations
   */
  private organizeExpectations(expectations: ParsedExpectation[]): ParsedExpectation[] {
    // Group by strand, then by type
    const grouped = new Map<string, { overall: ParsedExpectation[]; specific: ParsedExpectation[] }>();

    for (const exp of expectations) {
      if (!grouped.has(exp.strand)) {
        grouped.set(exp.strand, { overall: [], specific: [] });
      }
      
      const group = grouped.get(exp.strand);
      if (group) {
        if (exp.type === 'overall') {
          group.overall.push(exp);
        } else {
          group.specific.push(exp);
        }
      }
    }

    // Sort and flatten
    const organized: ParsedExpectation[] = [];
    
    for (const [_strand, group] of grouped) {
      // Sort within groups
      group.overall.sort((a, b) => a.code.localeCompare(b.code));
      group.specific.sort((a, b) => a.code.localeCompare(b.code));
      
      // Add to organized list
      organized.push(...group.overall, ...group.specific);
    }

    return organized;
  }

  /**
   * Validate parsed curriculum
   */
  validate(data: ParsedCurriculum): boolean {
    if (!data.subject || !data.grade || data.expectations === null) {
      return false;
    }

    if (data.expectations.length === 0) {
      return false;
    }

    // Validate each expectation
    for (const exp of data.expectations) {
      if (!exp.code || !exp.description || !exp.type || !exp.strand) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['.json'];
  }
}