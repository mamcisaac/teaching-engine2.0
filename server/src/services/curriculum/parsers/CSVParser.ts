/**
 * CSV Curriculum Parser
 * Parses curriculum expectations from CSV files
 */

import * as csvParse from 'csv-parse/sync';
import { CurriculumParser, ParsedCurriculum, ParsedExpectation } from './CurriculumParser';

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
  [key: string]: any;
}

export class CSVParser extends CurriculumParser {
  /**
   * Parse CSV content
   */
  async parse(content: string | Buffer): Promise<ParsedCurriculum> {
    const stringContent = content instanceof Buffer ? content.toString('utf-8') : content;
    
    // Parse CSV
    const records = csvParse.parse(stringContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: true,
      cast_date: false,
    }) as CSVRow[];

    if (!records || records.length === 0) {
      throw new Error('No data found in CSV file');
    }

    // Extract metadata from first row or headers
    const firstRow = records[0];
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

    const curriculum: ParsedCurriculum = {
      subject: subject || 'Unknown',
      grade: grade || 0,
      expectations,
      metadata: {
        source: 'CSV Import',
        lastUpdated: new Date(),
      },
    };

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
      row.code || row.expectation_code || row.Code || row['Expectation Code'] || ''
    );
    
    const description = this.cleanText(
      row.description || row.expectation_description || 
      row.Description || row['Expectation Description'] || ''
    );

    if (!code || !description) {
      return null;
    }

    const type = this.parseType(row);
    const strand = this.cleanText(row.strand || row.Strand || '');
    const substrand = this.cleanText(row.substrand || row.Substrand || '');

    const expectation: ParsedExpectation = {
      code,
      description,
      type,
      strand: strand || this.extractStrandFromCode(code),
      substrand: substrand || undefined,
      grade: this.extractGrade(row) || defaultGrade,
      subject: this.extractSubject(row) || defaultSubject,
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
    const typeValue = row.type || row.expectation_type || row.Type || row['Expectation Type'] || '';
    
    if (typeValue) {
      const normalizedType = typeValue.toString().toLowerCase();
      if (normalizedType.includes('overall')) return 'overall';
      if (normalizedType.includes('specific')) return 'specific';
    }

    // Fall back to code analysis
    const code = row.code || row.expectation_code || '';
    const description = row.description || row.expectation_description || '';
    
    return this.parseExpectationType(code, description);
  }

  /**
   * Extract grade from row
   */
  private extractGrade(row: CSVRow): number | undefined {
    const gradeValue = row.grade || row.Grade || row.grade_level || row['Grade Level'];
    
    if (gradeValue) {
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
    const subjectValue = row.subject || row.Subject || row.subject_area || row['Subject Area'];
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
   * Check if expectation is valid
   */
  private isValidExpectation(expectation: ParsedExpectation): boolean {
    if (!this.options.strict) {
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
    if (!data.subject || !data.grade || !data.expectations) {
      return false;
    }

    if (data.expectations.length === 0) {
      return false;
    }

    // Check for at least some overall expectations
    const hasOverallExpectations = data.expectations.some(e => e.type === 'overall');
    if (this.options.strict && !hasOverallExpectations) {
      return false;
    }

    return true;
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['.csv', '.txt'];
  }
}