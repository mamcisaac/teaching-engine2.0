/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Curriculum Validator
 * Validates curriculum data structure and content
 */

import { ParsedCurriculum, ParsedExpectation } from '../parsers/CurriculumParser';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: ValidationStats;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  expectationCode?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: unknown;
  expectationCode?: string;
}

export interface ValidationStats {
  totalExpectations: number;
  overallExpectations: number;
  specificExpectations: number;
  strands: string[];
  duplicates: number;
  invalidCodes: number;
}

export interface ValidationOptions {
  strictMode?: boolean;
  checkDuplicates?: boolean;
  validateCodes?: boolean;
  minExpectations?: number;
  requiredStrands?: string[];
  gradeRange?: { min: number; max: number };
}

export class CurriculumValidator {
  private options: ValidationOptions;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      strictMode: true,
      checkDuplicates: true,
      validateCodes: true,
      minExpectations: 1,
      gradeRange: { min: 1, max: 12 },
      ...options,
    };
  }

  /**
   * Validate curriculum data
   */
  validate(curriculum: ParsedCurriculum): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const stats: ValidationStats = {
      totalExpectations: curriculum.expectations.length,
      overallExpectations: 0,
      specificExpectations: 0,
      strands: [],
      duplicates: 0,
      invalidCodes: 0,
    };

    // Basic structure validation
    this.validateStructure(curriculum, errors);

    // Grade validation
    this.validateGrade(curriculum.grade, errors);

    // Subject validation
    this.validateSubject(curriculum.subject, errors, warnings);

    // Expectations validation
    this.validateExpectations(curriculum.expectations, errors, warnings, stats);

    // Check duplicates
    if (this.options.checkDuplicates) {
      stats.duplicates = this.checkDuplicates(curriculum.expectations, warnings);
    } else {
      stats.duplicates = 0;
    }

    // Calculate stats
    this.calculateStats(curriculum.expectations, stats);

    // Check required strands
    if (this.options.requiredStrands) {
      this.validateRequiredStrands(stats.strands, errors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats,
    };
  }

  /**
   * Validate basic structure
   */
  private validateStructure(curriculum: ParsedCurriculum, errors: ValidationError[]): void {
    if (!curriculum) {
      errors.push({
        field: 'curriculum',
        message: 'Curriculum object is required',
      });
      return;
    }

    if (!curriculum.expectations) {
      errors.push({
        field: 'expectations',
        message: 'Expectations array is required',
      });
    } else if (!Array.isArray(curriculum.expectations)) {
      errors.push({
        field: 'expectations',
        message: 'Expectations must be an array',
        value: typeof curriculum.expectations,
      });
    } else if (curriculum.expectations.length < this.options.minExpectations!) {
      errors.push({
        field: 'expectations',
        message: `At least ${this.options.minExpectations} expectation(s) required`,
        value: curriculum.expectations.length,
      });
    }
  }

  /**
   * Validate grade
   */
  private validateGrade(grade: number, errors: ValidationError[]): void {
    if (!grade && grade !== 0) {
      errors.push({
        field: 'grade',
        message: 'Grade is required',
      });
      return;
    }

    const { min, max } = this.options.gradeRange!;
    if (grade < min || grade > max) {
      errors.push({
        field: 'grade',
        message: `Grade must be between ${min} and ${max}`,
        value: grade,
      });
    }
  }

  /**
   * Validate subject
   */
  private validateSubject(subject: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!subject) {
      errors.push({
        field: 'subject',
        message: 'Subject is required',
      });
      return;
    }

    // Check against known subjects
    const knownSubjects = [
      'Mathematics', 'Language', 'Science', 'Social Studies',
      'The Arts', 'Health and Physical Education', 'French',
      'French as a Second Language', 'Native Languages', 'Technology',
    ];

    const normalizedSubject = subject.toLowerCase();
    const isKnown = knownSubjects.some(s => s.toLowerCase() === normalizedSubject);

    if (!isKnown && this.options.strictMode) {
      warnings.push({
        field: 'subject',
        message: `Unknown subject: ${subject}. Expected one of: ${knownSubjects.join(', ')}`,
        value: subject,
      });
    }
  }

  /**
   * Validate expectations
   */
  private validateExpectations(
    expectations: ParsedExpectation[],
    errors: ValidationError[],
    warnings: ValidationWarning[],
    stats: ValidationStats
  ): void {
    const seenCodes = new Set<string>();

    for (const expectation of expectations) {
      // Validate required fields
      if (!expectation.code) {
        errors.push({
          field: 'expectation.code',
          message: 'Expectation code is required',
          expectationCode: expectation.code,
        });
      } else {
        // Validate code format
        if (this.options.validateCodes && !this.isValidCode(expectation.code)) {
          warnings.push({
            field: 'expectation.code',
            message: 'Invalid expectation code format',
            value: expectation.code,
            expectationCode: expectation.code,
          });
          stats.invalidCodes++;
        }

        // Check for duplicate codes only if checkDuplicates is enabled
        if (this.options.checkDuplicates) {
          if (seenCodes.has(expectation.code)) {
            warnings.push({
              field: 'expectation.code',
              message: 'Duplicate expectation code',
              value: expectation.code,
              expectationCode: expectation.code,
            });
          }
          seenCodes.add(expectation.code);
        }
      }

      // Validate description
      if (!expectation.description) {
        errors.push({
          field: 'expectation.description',
          message: 'Expectation description is required',
          expectationCode: expectation.code,
        });
      } else if (expectation.description.length < 10) {
        warnings.push({
          field: 'expectation.description',
          message: 'Expectation description is too short',
          value: expectation.description,
          expectationCode: expectation.code,
        });
      }

      // Validate type
      if (!expectation.type) {
        errors.push({
          field: 'expectation.type',
          message: 'Expectation type is required',
          expectationCode: expectation.code,
        });
      } else if (expectation.type !== 'overall' && expectation.type !== 'specific') {
        errors.push({
          field: 'expectation.type',
          message: 'Expectation type must be "overall" or "specific"',
          value: expectation.type,
          expectationCode: expectation.code,
        });
      }

      // Validate strand
      if (!expectation.strand) {
        errors.push({
          field: 'expectation.strand',
          message: 'Expectation strand is required',
          expectationCode: expectation.code,
        });
      }
    }
  }

  /**
   * Check for duplicate expectations
   */
  private checkDuplicates(expectations: ParsedExpectation[], _warnings: ValidationWarning[]): number {
    const seenCodes = new Map<string, number>();
    let duplicates = 0;

    // Count occurrences of each code
    for (const expectation of expectations) {
      const count = seenCodes.get(expectation.code) || 0;
      seenCodes.set(expectation.code, count + 1);
    }

    // Count codes that appear more than once
    for (const [_code, count] of seenCodes.entries()) {
      if (count > 1) {
        duplicates += count - 1; // Each duplicate after the first
      }
    }

    return duplicates;
  }

  /**
   * Calculate statistics
   */
  private calculateStats(expectations: ParsedExpectation[], stats: ValidationStats): void {
    const strands = new Set<string>();

    for (const expectation of expectations) {
      // Count by type
      if (expectation.type === 'overall') {
        stats.overallExpectations++;
      } else {
        stats.specificExpectations++;
      }

      // Collect strands
      if (expectation.strand) {
        strands.add(expectation.strand);
      }
    }

    stats.strands = Array.from(strands).sort();
  }

  /**
   * Validate required strands
   */
  private validateRequiredStrands(strands: string[], errors: ValidationError[]): void {
    const requiredStrands = this.options.requiredStrands!;
    const missingStrands = requiredStrands.filter(s => !strands.includes(s));

    if (missingStrands.length > 0) {
      errors.push({
        field: 'strands',
        message: `Missing required strands: ${missingStrands.join(', ')}`,
        value: strands,
      });
    }
  }

  /**
   * Check if code is valid
   */
  private isValidCode(code: string): boolean {
    // Ontario curriculum code patterns
    const patterns = [
      /^[A-Z]\d+\.\d+$/i, // A1.2 (Letter + number + dot + number)
      /^[A-Z]\d+\.[A-Z]+\d+$/i, // A1.NA2 (Letter + number + dot + letters + number)
      /^[A-Z0-9]+\.[A-Z0-9]+\.[A-Z0-9]+$/i, // 1.NA.2
      /^\d+\.[A-Z]+\.\d+$/i, // 1.NA.2
      /^[A-Z]+\d*$/i, // Overall expectations like A1
    ];

    return patterns.some(pattern => pattern.test(code));
  }

  /**
   * Create default validator
   */
  static createDefault(): CurriculumValidator {
    return new CurriculumValidator();
  }

  /**
   * Create strict validator
   */
  static createStrict(): CurriculumValidator {
    return new CurriculumValidator({
      strictMode: true,
      checkDuplicates: true,
      validateCodes: true,
      minExpectations: 10,
    });
  }

  /**
   * Create lenient validator
   */
  static createLenient(): CurriculumValidator {
    return new CurriculumValidator({
      strictMode: false,
      checkDuplicates: false,
      validateCodes: false,
      minExpectations: 1,
    });
  }
}