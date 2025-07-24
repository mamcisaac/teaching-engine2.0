/**
 * Excel Curriculum Parser
 * Parses curriculum expectations from Excel files
 */

import * as XLSX from '@datalens-tech/xlsx';

import type { ParsedCurriculum, ParsedExpectation } from './CurriculumParser';
import { CurriculumParser } from './CurriculumParser';

export type ExcelRow = Record<string, unknown>;

export class ExcelParser extends CurriculumParser {
  /**
   * Parse Excel content
   */
  async parse(content: string | Buffer): Promise<ParsedCurriculum> {
    // Read workbook
    const workbook = XLSX.read(content, { type: 'buffer' });

    if (workbook.SheetNames === null || workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in Excel file');
    }

    // Process first sheet (or sheet named 'Expectations' if exists)
    const sheetName = workbook.SheetNames.includes('Expectations')
      ? 'Expectations'
      : workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    if (worksheet === null) {
      throw new Error(`Worksheet ${sheetName} not found`);
    }

    // Convert to JSON
    const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: '',
    });

    if (rows === null || rows.length === 0) {
      throw new Error('No data found in Excel file');
    }

    // Extract metadata
    const metadata = this.extractMetadata(workbook, rows);
    const { grade, subject } = metadata;

    // Parse expectations
    const expectations: ParsedExpectation[] = [];

    for (const row of rows) {
      const expectation = this.parseRow(row, grade, subject);
      if (expectation && this.isValidExpectation(expectation)) {
        expectations.push(expectation);
      }
    }

    // Group and organize expectations
    const organized = this.organizeExpectations(expectations);

    const curriculum: ParsedCurriculum = {
      subject: subject ?? 'Unknown',
      grade: grade ?? 0,
      expectations: organized,
      metadata: {
        source: 'Excel Import',
        lastUpdated: new Date(),
        version: metadata.version,
      },
    };

    if (!this.validate(curriculum)) {
      throw new Error('Invalid curriculum data structure');
    }

    return curriculum;
  }

  /**
   * Extract metadata from workbook
   */
  private extractMetadata(
    workbook: XLSX.WorkBook,
    rows: ExcelRow[],
  ): {
    grade?: number;
    subject?: string;
    version?: string;
  } {
    // Try to extract from workbook properties
    const props = workbook.Props;
    const metadata: {
      grade?: number;
      subject?: string;
      version?: string;
    } = {};

    if (props) {
      metadata.version = props.Title ?? props.Subject;
    }

    // Try to extract from first few rows
    const firstRow = rows[0];
    if (firstRow !== null) {
      metadata.grade = this.extractGrade(firstRow);
      metadata.subject = this.extractSubject(firstRow);
    }

    // Try to find metadata in sheet names or cell values
    if ((!metadata.grade) || (!metadata.subject || metadata.subject === '')) {
      for (const sheetName of workbook.SheetNames) {
        const gradeMatch = sheetName.match(/Grade\s*(\d+)/i);
        if (gradeMatch) {
          metadata.grade = parseInt(gradeMatch[1]);
        }

        // Check for subject in sheet name
        const subjects = ['Mathematics', 'Language', 'Science', 'Social Studies', 'Arts'];
        for (const subject of subjects) {
          if (sheetName.toLowerCase().includes(subject.toLowerCase())) {
            metadata.subject = subject;
            break;
          }
        }
      }
    }

    return metadata;
  }

  /**
   * Parse a single Excel row
   */
  private parseRow(
    row: ExcelRow,
    defaultGrade?: number,
    defaultSubject?: string,
  ): ParsedExpectation | null {
    // Find code column (try various naming conventions)
    const codeKeys = ['Code', 'code', 'Expectation Code', 'expectation_code', 'ID', 'Reference'];
    const code = this.findValue(row, codeKeys);

    if (!code || code === '') {
      return null;
    }

    // Find description column
    const descKeys = [
      'Description',
      'description',
      'Expectation',
      'expectation',
      'Text',
      'Content',
    ];
    const description = this.findValue(row, descKeys);

    if (!description || description === '') {
      return null;
    }

    // Find other fields
    const typeKeys = ['Type', 'type', 'Category', 'Level'];
    const type = this.parseType(this.findValue(row, typeKeys) ?? '', code, description);

    const strandKeys = ['Strand', 'strand', 'Domain', 'Area'];
    const strand = this.findValue(row, strandKeys) ?? this.extractStrandFromCode(code);

    const substrandKeys = ['Substrand', 'substrand', 'Topic', 'Subtopic'];
    const substrand = this.findValue(row, substrandKeys);

    const expectation: ParsedExpectation = {
      code: this.cleanText(code),
      description: this.cleanText(description),
      type,
      strand: this.cleanText(strand),
      substrand: substrand && substrand !== '' ? this.cleanText(substrand) : undefined,
      grade: this.extractGrade(row) ?? defaultGrade,
      subject: this.extractSubject(row) ?? defaultSubject,
    };

    if (this.options.extractKeywords) {
      expectation.keywords = this.extractKeywords(description);
    }

    return expectation;
  }

  /**
   * Find value from row using multiple possible keys
   */
  private findValue(row: ExcelRow, keys: string[]): string | undefined {
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return String(row[key]);
      }
    }
    return undefined;
  }

  /**
   * Parse expectation type
   */
  private parseType(typeValue: string, code: string, description: string): 'overall' | 'specific' {
    if (typeValue && typeValue !== '') {
      const normalized = typeValue.toLowerCase();
      if (normalized.includes('overall')) {
        return 'overall';
      }
      if (normalized.includes('specific')) {
        return 'specific';
      }
    }

    return this.parseExpectationType(code, description);
  }

  /**
   * Extract grade from row
   */
  private extractGrade(row: ExcelRow): number | undefined {
    const gradeKeys = ['Grade', 'grade', 'Level', 'Year'];
    const gradeValue = this.findValue(row, gradeKeys);

    if (gradeValue && gradeValue !== '') {
      const numericGrade = parseInt(gradeValue.replace(/\D/g, ''));
      if (!isNaN(numericGrade) && numericGrade >= 1 && numericGrade <= 12) {
        return numericGrade;
      }
    }

    return undefined;
  }

  /**
   * Extract subject from row
   */
  private extractSubject(row: ExcelRow): string | undefined {
    const subjectKeys = ['Subject', 'subject', 'Course', 'Area'];
    const subjectValue = this.findValue(row, subjectKeys);
    return subjectValue ? this.cleanText(subjectValue) : undefined;
  }

  /**
   * Extract strand from expectation code
   */
  private extractStrandFromCode(code: string): string {
    const parts = code.split('.');
    if (parts.length >= 2) {
      return parts[1];
    }

    // Try to extract from code pattern
    const match = code.match(/^[A-Z0-9]+\.([A-Z]+)/);
    if (match) {
      return match[1];
    }

    return 'General';
  }

  /**
   * Organize expectations (group overall before specific)
   */
  private organizeExpectations(expectations: ParsedExpectation[]): ParsedExpectation[] {
    const overall = expectations.filter((e) => e.type === 'overall');
    const specific = expectations.filter((e) => e.type === 'specific');

    // Sort by code
    overall.sort((a, b) => a.code.localeCompare(b.code));
    specific.sort((a, b) => a.code.localeCompare(b.code));

    return [...overall, ...specific];
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
    if ((!data.subject || data.subject === '') || 
        (!data.grade) || 
        (data.expectations === null || data.expectations === undefined)) {
      return false;
    }

    if (data.expectations.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Get supported file extensions
   */
  getSupportedExtensions(): string[] {
    return ['.xlsx', '.xls', '.xlsm'];
  }
}
