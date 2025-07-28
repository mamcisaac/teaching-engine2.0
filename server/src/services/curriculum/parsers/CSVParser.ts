/**
 * CSV Curriculum Parser
 * Parses curriculum expectations from CSV files
 */

import { parse } from 'csv-parse/sync';

import { CurriculumParser, type ParsedCurriculum, type ParsedExpectation } from './CurriculumParser';

export interface CSVRow {
  code?: string;
  expectation_code?: string;
  description?: string;
  expectation_description?: string;
  type?: string;
  expectation_type?: string;
  strand?: string;
  substrand?: string;
  grade?: string | number;
  subject?: string;
  [key: string]: unknown;
}

export class CSVParser extends CurriculumParser {
  /**
   * Parse CSV content
   */
  async parse(content: string | Buffer): Promise<ParsedCurriculum> {
    const stringContent = content instanceof Buffer ? content.toString('utf-8') : content;
    
    // Parse CSV with error handling for malformed data
    let records: CSVRow[];
    try {
      records = parse(stringContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: true,
        cast_date: false,
        relax_quotes: true, // Allow unescaped quotes
        skip_records_with_error: true, // Skip malformed records
      }) as CSVRow[];
    } catch (_error) {
      // If parsing fails, try with more relaxed settings
      try {
        records = parse(stringContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          cast: false, // Don't cast types
          relax_quotes: true,
          relax_column_count: true, // Allow varying column counts
          skip_records_with_error: true,
        }) as CSVRow[];
      } catch (fallbackError) {
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
        throw new Error(`Failed to parse CSV: ${errorMessage}`);
      }
    }

    if (records.length === 0) {
      // In non-strict mode, return empty curriculum
      if (!this.options.strict) {
        return {
          subject: 'Unknown',
          grade: 1,
          expectations: [],
          metadata: {
            source: 'CSV Import',
            lastUpdated: new Date(),
          },
        };
      }
      throw new Error('No data found in CSV file');
    }

    // Extract metadata from first row or headers
    const [firstRow] = records;
    const grade = this.extractGrade(firstRow);
    const subject = this.extractSubject(firstRow);

    // Parse expectations
    const expectations: ParsedExpectation[] = [];
    
    for (const row of records) {
      const expectation = this.parseRow(row, grade, subject);
      if (expectation && this.isValidExpectation(expectation)) {
        expectations.push(expectation);
      }
    }

    // Try to extract subject and grade from any row if not found in first row
    let finalSubject = subject;
    let finalGrade = grade;
    
    if (!finalSubject || !finalGrade) {
      for (const expectation of expectations) {
        if (!finalSubject && expectation.subject) {
          finalSubject = expectation.subject;
        }
        if (!finalGrade && expectation.grade) {
          finalGrade = expectation.grade;
        }
        if (finalSubject && finalGrade) {
break;
}
      }
    }

    const curriculum: ParsedCurriculum = {
      subject: finalSubject ?? 'Unknown',
      grade: finalGrade ?? 1,
      expectations,
      metadata: {
        source: 'CSV Import',
        lastUpdated: new Date(),
      },
    };

    // In non-strict mode, always return the curriculum even if validation would fail
    if (this.options.strict !== true) {
      return curriculum;
    }

    if (!this.validate(curriculum)) {
      throw new Error('Invalid curriculum data structure');
    }

    return curriculum;
  }

  /**
   * Parse a single CSV row
   */
  private parseRow(row: CSVRow, defaultGrade?: number, defaultSubject?: string): ParsedExpectation | null {
    // Try different column name variations
    const code = this.cleanText(
      this.ensureString(((): string => {
        if (row.code) {
return String(row.code);
}
        if (row.expectation_code) {
return String(row.expectation_code);
}
        if (row.Code) {
return String(row.Code);
}
        if (row['Expectation Code']) {
return String(row['Expectation Code']);
}
        return '';
      })())
    );
    
    const description = this.cleanText(
      this.ensureString(((): string => {
        if (row.description) {
return String(row.description);
}
        if (row.expectation_description) {
return String(row.expectation_description);
}
        if (row.Description) {
return String(row.Description);
}
        if (row['Expectation Description']) {
return String(row['Expectation Description']);
}
        return '';
      })())
    );

    if (!code || !description) {
      return null;
    }

    const type = this.parseType(row);
    const strand = this.cleanText(this.ensureString(((): string => {
      if (row.strand) {
return String(row.strand);
}
      if (row.Strand) {
return String(row.Strand);
}
      return '';
    })()));
    const substrand = this.cleanText(this.ensureString(((): string => {
      if (row.substrand) {
return String(row.substrand);
}
      if (row.Substrand) {
return String(row.Substrand);
}
      return '';
    })()));

    const expectation: ParsedExpectation = {
      code,
      description,
      type,
      strand: strand || this.extractStrandFromCode(code),
      substrand: substrand ?? undefined,
      grade: this.extractGrade(row) ?? defaultGrade,
      subject: ((): string | undefined => {
        const extractedSubject = this.extractSubject(row);
        const finalSubject = extractedSubject ?? defaultSubject;
        return finalSubject ?? undefined;
      })(),
    };

    if (this.options.extractKeywords) {
      expectation.keywords = this.extractKeywords(description);
    }

    return expectation;
  }

  /**
   * Parse expectation type
   */
  private parseType(row: CSVRow): 'overall' | 'specific' {
    const typeValue = ((): string => {
      if (row.type) {
return String(row.type);
}
      if (row.expectation_type) {
return String(row.expectation_type);
}
      if (row.Type) {
return String(row.Type);
}
      if (row['Expectation Type']) {
return String(row['Expectation Type']);
}
      return '';
    })();
    
    if (typeValue) {
      const normalizedType = typeValue.toString().toLowerCase();
      if (normalizedType.includes('overall')) {
return 'overall';
}
      if (normalizedType.includes('specific')) {
return 'specific';
}
    }

    // Fall back to code analysis
    const code = ((): string => {
      if (row.code) {
return String(row.code);
}
      if (row.expectation_code) {
return String(row.expectation_code);
}
      return '';
    })();
    const description = ((): string => {
      if (row.description) {
return String(row.description);
}
      if (row.expectation_description) {
return String(row.expectation_description);
}
      return '';
    })();
    
    return this.parseExpectationType(code, description);
  }

  /**
   * Extract grade from row
   */
  private extractGrade(row: CSVRow): number | undefined {
    const gradeValue = row.grade ?? row.Grade ?? row.grade_level ?? row['Grade Level'];
    
    if (gradeValue !== undefined && gradeValue !== null) {
      const numericGrade = typeof gradeValue === 'number' 
        ? gradeValue 
        : parseInt(gradeValue.toString().replace(/\D/g, ''));
      
      if (!isNaN(numericGrade) && numericGrade >= 1 && numericGrade <= 12) {
        return numericGrade;
      }
    }
    
    return undefined;
  }

  /**
   * Extract subject from row
   */
  private extractSubject(row: CSVRow): string | undefined {
    const subjectValue = ((): string | undefined => {
      if (row.subject) {
return String(row.subject);
}
      if (row.Subject) {
return String(row.Subject);
}
      if (row.subject_area) {
return String(row.subject_area);
}
      if (row['Subject Area']) {
return String(row['Subject Area']);
}
      return undefined;
    })();
    return subjectValue ? this.cleanText(subjectValue.toString()) : undefined;
  }

  /**
   * Extract strand from expectation code
   */
  private extractStrandFromCode(code: string): string {
    const parts = code.split('.');
    if (parts.length >= 2) {
      return parts[1];
    }
    return 'General';
  }

  /**
   * Ensure value is a string
   */
  private ensureString(value: unknown): string {
    if (value === null) {
      return '';
    }
    return String(value);
  }

  /**
   * Check if expectation is valid
   */
  private isValidExpectation(expectation: ParsedExpectation): boolean {
    if (this.options.strict !== true) {
      return true;
    }

    if (this.options.validateCodes && !this.validateExpectationCode(expectation.code)) {
      return false;
    }

    return expectation.code.length > 0 && expectation.description.length > 0;
  }

  /**
   * Validate parsed curriculum
   */
  validate(data: ParsedCurriculum): boolean {
    if (!data.subject || !data.grade) {
      return false;
    }

    // In strict mode, require non-empty expectations
    if (this.options.strict && data.expectations.length === 0) {
      return false;
    }

    // Don't require overall expectations - some curriculum files might only have specific expectations
    // This was causing valid data to be rejected
    
    return true;
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['.csv', '.txt'];
  }
}