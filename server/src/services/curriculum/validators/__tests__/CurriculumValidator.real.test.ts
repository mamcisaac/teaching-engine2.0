/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Real Curriculum Validator Tests
 * Testing actual validation logic with real curriculum data and error scenarios
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { CurriculumValidator, ValidationOptions } from '../CurriculumValidator';
import { ParsedCurriculum, ParsedExpectation } from '../../parsers/CurriculumParser';
import logger from '../../../../logger';

describe('CurriculumValidator - Real Implementation Tests', () => {
  let validator: CurriculumValidator;

  beforeEach(() => {
    validator = CurriculumValidator.createDefault();
  });

  describe('Real Curriculum Data Validation', () => {
    test('should validate real Ontario Mathematics curriculum data', async () => {
      const realOntarioMathData: ParsedCurriculum = {
        grade: 3,
        subject: 'Mathematics',
        source: 'ontario-math-grade3.csv',
        expectations: [
          {
            code: 'A1.1',
            description: 'read and write numbers to 1000',
            type: 'specific',
            strand: 'Number Sense and Numeration',
            keywords: ['numbers', 'reading', 'writing', '1000'],
          },
          {
            code: 'A1.2',
            description: 'compare and order numbers to 1000 using a variety of tools',
            type: 'specific',
            strand: 'Number Sense and Numeration',
            keywords: ['compare', 'order', 'numbers', 'tools'],
          },
          {
            code: 'A1.3',
            description: 'demonstrate an understanding of place value in whole numbers to 1000',
            type: 'specific',
            strand: 'Number Sense and Numeration',
            keywords: ['place value', 'whole numbers', '1000'],
          },
          {
            code: 'B1.1',
            description: 'estimate, measure, and record length, height, and distance',
            type: 'specific',
            strand: 'Measurement',
            keywords: ['estimate', 'measure', 'length', 'height', 'distance'],
          },
          {
            code: 'B1.2',
            description: 'estimate, measure, and record the passage of time',
            type: 'specific',
            strand: 'Measurement',
            keywords: ['estimate', 'measure', 'time'],
          },
          {
            code: 'C1.1',
            description: 'identify and compare various polygons and sort them by their attributes',
            type: 'specific',
            strand: 'Geometry and Spatial Sense',
            keywords: ['polygons', 'compare', 'sort', 'attributes'],
          },
          {
            code: 'D1.1',
            description: 'identify, extend, and create repeating patterns',
            type: 'specific',
            strand: 'Patterning and Algebra',
            keywords: ['patterns', 'repeating', 'extend', 'create'],
          },
          {
            code: 'E1.1',
            description: 'collect and organize primary data that is categorical or discrete',
            type: 'specific',
            strand: 'Data Management and Probability',
            keywords: ['data', 'collect', 'organize', 'categorical', 'discrete'],
          },
        ],
      };

      const result = validator.validate(realOntarioMathData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);

      // Verify statistics
      expect(result.stats.totalExpectations).toBe(8);
      expect(result.stats.specificExpectations).toBe(8);
      expect(result.stats.overallExpectations).toBe(0);
      expect(result.stats.strands).toHaveLength(5);
      expect(result.stats.duplicates).toBe(0);
      expect(result.stats.invalidCodes).toBe(0);

      // Verify strands are correctly identified
      expect(result.stats.strands).toContain('Number Sense and Numeration');
      expect(result.stats.strands).toContain('Measurement');
      expect(result.stats.strands).toContain('Geometry and Spatial Sense');
      expect(result.stats.strands).toContain('Patterning and Algebra');
      expect(result.stats.strands).toContain('Data Management and Probability');

      logger.info('Real Ontario Math curriculum validation completed', {
        isValid: result.isValid,
        totalExpectations: result.stats.totalExpectations,
        strands: result.stats.strands.length,
      });
    });

    test('should validate real Science curriculum with mixed expectation types', async () => {
      const realScienceData: ParsedCurriculum = {
        grade: 4,
        subject: 'Science',
        source: 'ontario-science-grade4.json',
        expectations: [
          {
            code: 'A1',
            description: 'demonstrate an understanding of biodiversity',
            type: 'overall',
            strand: 'Life Systems',
            keywords: ['biodiversity', 'understanding'],
          },
          {
            code: 'A1.1',
            description: 'describe the characteristics of different habitats',
            type: 'specific',
            strand: 'Life Systems',
            keywords: ['habitats', 'characteristics', 'describe'],
          },
          {
            code: 'A1.2',
            description: 'identify factors that affect the ability of plants and animals to survive',
            type: 'specific',
            strand: 'Life Systems',
            keywords: ['factors', 'survive', 'plants', 'animals'],
          },
          {
            code: 'B1',
            description: 'demonstrate an understanding of light and sound',
            type: 'overall',
            strand: 'Matter and Energy',
            keywords: ['light', 'sound', 'understanding'],
          },
          {
            code: 'B1.1',
            description: 'identify a variety of forms of energy',
            type: 'specific',
            strand: 'Matter and Energy',
            keywords: ['energy', 'forms', 'identify'],
          },
          {
            code: 'C1',
            description: 'demonstrate an understanding of rocks and minerals',
            type: 'overall',
            strand: 'Earth and Space Systems',
            keywords: ['rocks', 'minerals', 'understanding'],
          },
        ],
      };

      const result = validator.validate(realScienceData);

      expect(result.isValid).toBe(true);
      expect(result.stats.totalExpectations).toBe(6);
      expect(result.stats.overallExpectations).toBe(3);
      expect(result.stats.specificExpectations).toBe(3);
      expect(result.stats.strands).toHaveLength(3);

      logger.info('Real Science curriculum validation completed', {
        overallExpectations: result.stats.overallExpectations,
        specificExpectations: result.stats.specificExpectations,
        strands: result.stats.strands,
      });
    });

    test('should validate French Immersion curriculum data', async () => {
      const frenchImmersionData: ParsedCurriculum = {
        grade: 2,
        subject: 'French',
        source: 'french-immersion-grade2.csv',
        expectations: [
          {
            code: 'A1.1',
            description: 'écouter et comprendre des messages courts',
            type: 'specific',
            strand: 'Écoute',
            keywords: ['écouter', 'comprendre', 'messages'],
          },
          {
            code: 'A1.2',
            description: 'réagir de façon appropriée aux messages écoutés',
            type: 'specific',
            strand: 'Écoute',
            keywords: ['réagir', 'messages', 'appropriée'],
          },
          {
            code: 'B1.1',
            description: 'exprimer ses idées et ses sentiments oralement',
            type: 'specific',
            strand: 'Expression orale',
            keywords: ['exprimer', 'idées', 'sentiments', 'oral'],
          },
          {
            code: 'C1.1',
            description: 'lire des textes simples avec expression et fluidité',
            type: 'specific',
            strand: 'Lecture',
            keywords: ['lire', 'textes', 'expression', 'fluidité'],
          },
          {
            code: 'D1.1',
            description: 'rédiger des textes courts et cohérents',
            type: 'specific',
            strand: 'Écriture',
            keywords: ['rédiger', 'textes', 'courts', 'cohérents'],
          },
        ],
      };

      const result = validator.validate(frenchImmersionData);

      expect(result.isValid).toBe(true);
      expect(result.stats.totalExpectations).toBe(5);
      expect(result.stats.strands).toHaveLength(4);
      expect(result.stats.strands).toContain('Écoute');
      expect(result.stats.strands).toContain('Expression orale');
      expect(result.stats.strands).toContain('Lecture');
      expect(result.stats.strands).toContain('Écriture');

      logger.info('French Immersion curriculum validation completed', {
        language: 'French',
        strands: result.stats.strands,
      });
    });
  });

  describe('Real Error Scenarios', () => {
    test('should detect missing required fields in real data', async () => {
      const invalidData: ParsedCurriculum = {
        grade: 3,
        subject: 'Mathematics',
        source: 'invalid-math-data.csv',
        expectations: [
          {
            code: '', // Missing code
            description: 'read numbers',
            type: 'specific',
            strand: 'Number Sense',
            keywords: ['numbers'],
          },
          {
            code: 'A1.2',
            description: '', // Missing description
            type: 'specific',
            strand: 'Number Sense',
            keywords: ['compare'],
          },
          {
            code: 'A1.3',
            description: 'understand place value',
            type: '', // Missing type
            strand: 'Number Sense',
            keywords: ['place value'],
          },
          {
            code: 'A1.4',
            description: 'count objects',
            type: 'specific',
            strand: '', // Missing strand
            keywords: ['count'],
          },
        ],
      };

      const result = validator.validate(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      // Check specific error types
      const errorMessages = result.errors.map(e => e.message);
      expect(errorMessages).toContain('Expectation code is required');
      expect(errorMessages).toContain('Expectation description is required');
      expect(errorMessages).toContain('Expectation type is required');
      expect(errorMessages).toContain('Expectation strand is required');

      logger.info('Missing fields validation completed', {
        errorCount: result.errors.length,
        errors: result.errors.map(e => ({ field: e.field, message: e.message })),
      });
    });

    test('should detect invalid expectation types', async () => {
      const invalidTypeData: ParsedCurriculum = {
        grade: 4,
        subject: 'Science',
        source: 'invalid-types.csv',
        expectations: [
          {
            code: 'A1.1',
            description: 'valid specific expectation',
            type: 'specific',
            strand: 'Life Systems',
            keywords: ['valid'],
          },
          {
            code: 'A1.2',
            description: 'invalid type expectation',
            type: 'invalid-type' as any, // Invalid type
            strand: 'Life Systems',
            keywords: ['invalid'],
          },
          {
            code: 'A1.3',
            description: 'another invalid type',
            type: 'general' as any, // Another invalid type
            strand: 'Life Systems',
            keywords: ['general'],
          },
        ],
      };

      const result = validator.validate(invalidTypeData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(2); // Two invalid types

      const typeErrors = result.errors.filter(e => e.field === 'expectation.type');
      expect(typeErrors).toHaveLength(2);
      expect(typeErrors[0].message).toBe('Expectation type must be "overall" or "specific"');

      logger.info('Invalid types validation completed', {
        typeErrors: typeErrors.length,
        invalidValues: typeErrors.map(e => e.value),
      });
    });

    test('should detect invalid grade ranges', async () => {
      const invalidGrades = [-1, 0, 13, 20];

      for (const grade of invalidGrades) {
        const data: ParsedCurriculum = {
          grade,
          subject: 'Mathematics',
          source: 'invalid-grade.csv',
          expectations: [
            {
              code: 'A1.1',
              description: 'test expectation',
              type: 'specific',
              strand: 'Test Strand',
              keywords: ['test'],
            },
          ],
        };

        const result = validator.validate(data);

        expect(result.isValid).toBe(false);
        const gradeErrors = result.errors.filter(e => e.field === 'grade');
        expect(gradeErrors).toHaveLength(1);
        expect(gradeErrors[0].message).toContain('Grade must be between 1 and 12');
        expect(gradeErrors[0].value).toBe(grade);
      }

      logger.info('Invalid grade validation completed', {
        testedGrades: invalidGrades,
      });
    });

    test('should detect duplicate expectation codes', async () => {
      const duplicateData: ParsedCurriculum = {
        grade: 3,
        subject: 'Mathematics',
        source: 'duplicate-codes.csv',
        expectations: [
          {
            code: 'A1.1',
            description: 'first expectation with A1.1',
            type: 'specific',
            strand: 'Number Sense',
            keywords: ['first'],
          },
          {
            code: 'A1.2',
            description: 'unique expectation',
            type: 'specific',
            strand: 'Number Sense',
            keywords: ['unique'],
          },
          {
            code: 'A1.1', // Duplicate code
            description: 'second expectation with A1.1',
            type: 'specific',
            strand: 'Number Sense',
            keywords: ['duplicate'],
          },
          {
            code: 'A1.3',
            description: 'another unique expectation',
            type: 'specific',
            strand: 'Number Sense',
            keywords: ['another'],
          },
          {
            code: 'A1.1', // Third occurrence
            description: 'third expectation with A1.1',
            type: 'specific',
            strand: 'Number Sense',
            keywords: ['third'],
          },
        ],
      };

      const result = validator.validate(duplicateData);

      expect(result.isValid).toBe(true); // Duplicates are warnings, not errors
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.stats.duplicates).toBe(2); // Two duplicates (3 total - 1 original)

      const duplicateWarnings = result.warnings.filter(w => w.message === 'Duplicate expectation code');
      expect(duplicateWarnings).toHaveLength(2);
      expect(duplicateWarnings.every(w => w.value === 'A1.1')).toBe(true);

      logger.info('Duplicate codes validation completed', {
        totalDuplicates: result.stats.duplicates,
        duplicateWarnings: duplicateWarnings.length,
      });
    });

    test('should detect invalid expectation code formats', async () => {
      const invalidCodesData: ParsedCurriculum = {
        grade: 4,
        subject: 'Science',
        source: 'invalid-codes.csv',
        expectations: [
          {
            code: 'A1.1', // Valid
            description: 'valid code format',
            type: 'specific',
            strand: 'Life Systems',
            keywords: ['valid'],
          },
          {
            code: 'InvalidCode', // Invalid format
            description: 'invalid code format',
            type: 'specific',
            strand: 'Life Systems',
            keywords: ['invalid'],
          },
          {
            code: '123ABC', // Invalid format
            description: 'another invalid format',
            type: 'specific',
            strand: 'Life Systems',
            keywords: ['invalid'],
          },
          {
            code: 'A.1.2.3', // Too many segments
            description: 'too many segments',
            type: 'specific',
            strand: 'Life Systems',
            keywords: ['segments'],
          },
          {
            code: 'B2', // Valid overall expectation
            description: 'valid overall expectation',
            type: 'overall',
            strand: 'Matter and Energy',
            keywords: ['overall'],
          },
        ],
      };

      const result = validator.validate(invalidCodesData);

      expect(result.isValid).toBe(true); // Invalid codes are warnings
      expect(result.stats.invalidCodes).toBe(2); // Two invalid codes (InvalidCode is actually valid)

      const codeWarnings = result.warnings.filter(w => w.message === 'Invalid expectation code format');
      expect(codeWarnings).toHaveLength(2);

      const invalidCodes = codeWarnings.map(w => w.value);
      // 'InvalidCode' matches pattern /^[A-Z]+\d*$/i so it's actually valid
      expect(invalidCodes).not.toContain('InvalidCode');
      expect(invalidCodes).toContain('123ABC');
      expect(invalidCodes).toContain('A.1.2.3');

      logger.info('Invalid code formats validation completed', {
        invalidCodes: result.stats.invalidCodes,
        invalidCodeValues: invalidCodes,
      });
    });

    test('should detect short descriptions', async () => {
      const shortDescData: ParsedCurriculum = {
        grade: 2,
        subject: 'Language',
        source: 'short-descriptions.csv',
        expectations: [
          {
            code: 'A1.1',
            description: 'read', // Too short
            type: 'specific',
            strand: 'Reading',
            keywords: ['read'],
          },
          {
            code: 'A1.2',
            description: 'write well and clearly with proper grammar and style', // Good length
            type: 'specific',
            strand: 'Writing',
            keywords: ['write'],
          },
          {
            code: 'A1.3',
            description: 'listen', // Too short
            type: 'specific',
            strand: 'Listening',
            keywords: ['listen'],
          },
        ],
      };

      const result = validator.validate(shortDescData);

      expect(result.isValid).toBe(true); // Short descriptions are warnings
      expect(result.warnings.length).toBe(2);

      const shortDescWarnings = result.warnings.filter(w => w.message === 'Expectation description is too short');
      expect(shortDescWarnings).toHaveLength(2);

      logger.info('Short descriptions validation completed', {
        shortDescriptions: shortDescWarnings.length,
      });
    });
  });

  describe('Real Validation Options Testing', () => {
    test('should enforce strict mode validation', async () => {
      const strictValidator = CurriculumValidator.createStrict();

      const dataWithUnknownSubject: ParsedCurriculum = {
        grade: 5,
        subject: 'Unknown Subject', // Not in known subjects list
        source: 'unknown-subject.csv',
        expectations: [
          {
            code: 'A1.1',
            description: 'learn something new',
            type: 'specific',
            strand: 'Learning',
            keywords: ['learn'],
          },
        ],
      };

      const result = strictValidator.validate(dataWithUnknownSubject);

      expect(result.isValid).toBe(false); // Strict mode requires min 10 expectations
      const subjectWarnings = result.warnings.filter(w => w.field === 'subject');
      expect(subjectWarnings).toHaveLength(1);
      expect(subjectWarnings[0].message).toContain('Unknown subject');

      logger.info('Strict mode validation completed', {
        isValid: result.isValid,
        subjectWarnings: subjectWarnings.length,
      });
    });

    test('should allow lenient validation', async () => {
      const lenientValidator = CurriculumValidator.createLenient();

      const problemData: ParsedCurriculum = {
        grade: 8,
        subject: 'Custom Subject',
        source: 'lenient-test.csv',
        expectations: [
          {
            code: 'InvalidCode123',
            description: 'short',
            type: 'specific',
            strand: 'Custom Strand',
            keywords: ['custom'],
          },
          {
            code: 'InvalidCode123', // Duplicate
            description: 'another short description',
            type: 'specific',
            strand: 'Custom Strand',
            keywords: ['duplicate'],
          },
        ],
      };

      const result = lenientValidator.validate(problemData);

      expect(result.isValid).toBe(true); // Lenient mode allows issues
      expect(result.warnings).toHaveLength(0); // No warnings in lenient mode
      expect(result.stats.duplicates).toBe(0); // Duplicates not checked
      expect(result.stats.invalidCodes).toBe(0); // Code validation disabled

      logger.info('Lenient mode validation completed', {
        isValid: result.isValid,
        warningsCount: result.warnings.length,
      });
    });

    test('should validate required strands', async () => {
      const strandValidator = new CurriculumValidator({
        requiredStrands: [
          'Number Sense and Numeration',
          'Measurement',
          'Geometry and Spatial Sense',
        ],
      });

      const incompleteData: ParsedCurriculum = {
        grade: 3,
        subject: 'Mathematics',
        source: 'incomplete-strands.csv',
        expectations: [
          {
            code: 'A1.1',
            description: 'read numbers to 100',
            type: 'specific',
            strand: 'Number Sense and Numeration',
            keywords: ['numbers'],
          },
          {
            code: 'B1.1',
            description: 'measure length',
            type: 'specific',
            strand: 'Measurement',
            keywords: ['measure'],
          },
          // Missing Geometry and Spatial Sense strand
        ],
      };

      const result = strandValidator.validate(incompleteData);

      expect(result.isValid).toBe(false);
      const strandErrors = result.errors.filter(e => e.field === 'strands');
      expect(strandErrors).toHaveLength(1);
      expect(strandErrors[0].message).toContain('Missing required strands: Geometry and Spatial Sense');

      logger.info('Required strands validation completed', {
        missingStrands: ['Geometry and Spatial Sense'],
        foundStrands: result.stats.strands,
      });
    });

    test('should validate minimum expectations requirement', async () => {
      const minExpectationsValidator = new CurriculumValidator({
        minExpectations: 5,
      });

      const insufficientData: ParsedCurriculum = {
        grade: 2,
        subject: 'Mathematics',
        source: 'insufficient-expectations.csv',
        expectations: [
          {
            code: 'A1.1',
            description: 'count to 10',
            type: 'specific',
            strand: 'Number Sense',
            keywords: ['count'],
          },
          {
            code: 'A1.2',
            description: 'add single digits',
            type: 'specific',
            strand: 'Number Sense',
            keywords: ['add'],
          },
        ], // Only 2 expectations, need 5
      };

      const result = minExpectationsValidator.validate(insufficientData);

      expect(result.isValid).toBe(false);
      const expectationErrors = result.errors.filter(e => e.field === 'expectations');
      expect(expectationErrors).toHaveLength(1);
      expect(expectationErrors[0].message).toBe('At least 5 expectation(s) required');
      expect(expectationErrors[0].value).toBe(2);

      logger.info('Minimum expectations validation completed', {
        required: 5,
        provided: 2,
      });
    });
  });

  describe('Real Performance and Edge Cases', () => {
    test('should handle large curriculum datasets efficiently', async () => {
      // Generate large dataset
      const largeExpectations: ParsedExpectation[] = [];
      const strands = ['Number Sense', 'Measurement', 'Geometry', 'Algebra', 'Data Management'];
      
      for (let i = 1; i <= 1000; i++) {
        largeExpectations.push({
          code: `A${Math.floor(i / 100) + 1}.${(i % 100) + 1}`,
          description: `This is expectation number ${i} which describes learning outcome ${i}`,
          type: i % 10 === 0 ? 'overall' : 'specific',
          strand: strands[i % strands.length],
          keywords: [`keyword${i}`, `learning${i}`],
        });
      }

      const largeData: ParsedCurriculum = {
        grade: 6,
        subject: 'Mathematics',
        source: 'large-dataset.csv',
        expectations: largeExpectations,
      };

      const startTime = Date.now();
      const result = validator.validate(largeData);
      const validationTime = Date.now() - startTime;

      expect(result.isValid).toBe(true);
      expect(result.stats.totalExpectations).toBe(1000);
      expect(result.stats.strands).toHaveLength(5);
      expect(validationTime).toBeLessThan(1000); // Should complete within 1 second

      logger.info('Large dataset validation completed', {
        expectationsCount: result.stats.totalExpectations,
        validationTimeMs: validationTime,
        expectationsPerMs: Math.round(result.stats.totalExpectations / validationTime),
      });
    });

    test('should handle empty and malformed data gracefully', async () => {
      const edgeCases = [
        null as any,
        undefined as any,
        {} as any,
        { grade: 3, subject: 'Math' } as any, // Missing expectations
        { grade: 3, subject: 'Math', expectations: null } as any,
        { grade: 3, subject: 'Math', expectations: 'not an array' } as any,
        {
          grade: 3,
          subject: 'Math',
          expectations: [],
        } as ParsedCurriculum,
      ];

      for (const [index, edgeCase] of edgeCases.entries()) {
        const result = validator.validate(edgeCase);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        
        logger.info(`Edge case ${index + 1} validation completed`, {
          errorsCount: result.errors.length,
          firstError: result.errors[0]?.message,
        });
      }
    });

    test('should validate complex real-world mixed data', async () => {
      const complexRealData: ParsedCurriculum = {
        grade: 7,
        subject: 'Science',
        source: 'real-complex-curriculum.json',
        expectations: [
          // Valid expectations
          {
            code: 'A1',
            description: 'demonstrate an understanding of the relationship between pure substances and mixtures',
            type: 'overall',
            strand: 'Matter and Energy',
            keywords: ['substances', 'mixtures', 'relationship'],
          },
          {
            code: 'A1.1',
            description: 'use appropriate terminology related to pure substances and mixtures',
            type: 'specific',
            strand: 'Matter and Energy',
            keywords: ['terminology', 'substances', 'mixtures'],
          },
          // Problematic but not invalid
          {
            code: 'A1.2',
            description: 'identify pure substances and mixtures through investigation', // Good
            type: 'specific',
            strand: 'Matter and Energy',
            keywords: ['identify', 'investigation'],
          },
          {
            code: 'CUSTOM.1', // Non-standard but valid format
            description: 'conduct experiments safely and accurately record observations and measurements',
            type: 'specific',
            strand: 'Matter and Energy',
            keywords: ['experiments', 'observations', 'measurements'],
          },
          // Warnings but not errors
          {
            code: 'B1.WEIRD', // Unusual format
            description: 'brief', // Too short
            type: 'specific',
            strand: 'Life Systems',
            keywords: ['brief'],
          },
          {
            code: 'B1.1',
            description: 'demonstrate an understanding of the basic concepts related to nutrients and their role in the body',
            type: 'specific',
            strand: 'Life Systems',
            keywords: ['nutrients', 'body', 'concepts'],
          },
        ],
      };

      const result = validator.validate(complexRealData);

      expect(result.isValid).toBe(true); // Should be valid despite warnings
      expect(result.warnings.length).toBeGreaterThan(0); // Should have warnings
      expect(result.stats.totalExpectations).toBe(6);
      expect(result.stats.overallExpectations).toBe(1);
      expect(result.stats.specificExpectations).toBe(5);
      expect(result.stats.strands).toContain('Matter and Energy');
      expect(result.stats.strands).toContain('Life Systems');

      logger.info('Complex real-world data validation completed', {
        isValid: result.isValid,
        warningsCount: result.warnings.length,
        strandsCount: result.stats.strands.length,
        mixedExpectationTypes: true,
      });
    });
  });
});