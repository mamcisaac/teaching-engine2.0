/**
 * Curriculum Validator Test Suite
 */

import { CurriculumValidator, ValidationOptions } from '../CurriculumValidator';
import { ParsedCurriculum, ParsedExpectation } from '../../parsers/CurriculumParser';

describe('CurriculumValidator', () => {
  let validator: CurriculumValidator;

  beforeEach(() => {
    validator = new CurriculumValidator();
  });

  describe('Basic Validation', () => {
    it('should validate well-formed curriculum', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1',
            description: 'Overall expectation',
            type: 'overall',
            strand: 'Number Sense',
          },
          {
            code: 'A1.1',
            description: 'Specific expectation',
            type: 'specific',
            strand: 'Number Sense',
          },
        ],
      };

      const result = validator.validate(curriculum);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.stats.totalExpectations).toBe(2);
      expect(result.stats.overallExpectations).toBe(1);
      expect(result.stats.specificExpectations).toBe(1);
    });

    it('should fail validation for missing required fields', () => {
      const curriculum: ParsedCurriculum = {
        subject: '',
        grade: 0,
        expectations: [],
      };

      const result = validator.validate(curriculum);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'subject')).toBe(true);
      expect(result.errors.some(e => e.field === 'expectations')).toBe(true);
    });
  });

  describe('Grade Validation', () => {
    it('should validate grade within range', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 5,
        expectations: [
          {
            code: 'A1',
            description: 'Test',
            type: 'overall',
            strand: 'Test',
          },
        ],
      };

      const result = validator.validate(curriculum);
      expect(result.errors.filter(e => e.field === 'grade')).toHaveLength(0);
    });

    it('should fail for grade outside range', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 15,
        expectations: [
          {
            code: 'A1',
            description: 'Test',
            type: 'overall',
            strand: 'Test',
          },
        ],
      };

      const result = validator.validate(curriculum);
      expect(result.errors.some(e => e.field === 'grade')).toBe(true);
    });

    it('should respect custom grade range', () => {
      const customValidator = new CurriculumValidator({
        gradeRange: { min: 7, max: 12 },
      });

      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 6,
        expectations: [
          {
            code: 'A1',
            description: 'Test',
            type: 'overall',
            strand: 'Test',
          },
        ],
      };

      const result = customValidator.validate(curriculum);
      expect(result.errors.some(e => e.field === 'grade')).toBe(true);
    });
  });

  describe('Expectation Validation', () => {
    it('should validate expectation codes', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1.2',
            description: 'Valid code',
            type: 'specific',
            strand: 'Number Sense',
          },
          {
            code: 'Invalid Code Format',
            description: 'Invalid code',
            type: 'specific',
            strand: 'Number Sense',
          },
        ],
      };

      const result = validator.validate(curriculum);
      
      expect(result.warnings.some(w => 
        w.field === 'expectation.code' && w.value === 'Invalid Code Format'
      )).toBe(true);
      expect(result.stats.invalidCodes).toBe(1);
    });

    it('should check for duplicate expectations', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1.1',
            description: 'First instance',
            type: 'specific',
            strand: 'Number Sense',
          },
          {
            code: 'A1.1',
            description: 'Duplicate code',
            type: 'specific',
            strand: 'Number Sense',
          },
        ],
      };

      const result = validator.validate(curriculum);
      
      expect(result.warnings.some(w => 
        w.message.includes('Duplicate expectation code')
      )).toBe(true);
    });

    it('should validate expectation types', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1',
            description: 'Test',
            type: 'invalid' as unknown,
            strand: 'Test',
          },
        ],
      };

      const result = validator.validate(curriculum);
      
      expect(result.errors.some(e => 
        e.field === 'expectation.type'
      )).toBe(true);
    });

    it('should warn about short descriptions', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1',
            description: 'Too short',
            type: 'overall',
            strand: 'Test',
          },
        ],
      };

      const result = validator.validate(curriculum);
      
      expect(result.warnings.some(w => 
        w.field === 'expectation.description' && 
        w.message.includes('too short')
      )).toBe(true);
    });
  });

  describe('Subject Validation', () => {
    it('should warn about unknown subjects in strict mode', () => {
      const strictValidator = new CurriculumValidator({ strictMode: true });
      
      const curriculum: ParsedCurriculum = {
        subject: 'Computer Science',
        grade: 3,
        expectations: [
          {
            code: 'CS1',
            description: 'Test',
            type: 'overall',
            strand: 'Programming',
          },
        ],
      };

      const result = strictValidator.validate(curriculum);
      
      expect(result.warnings.some(w => 
        w.field === 'subject' && w.message.includes('Unknown subject')
      )).toBe(true);
    });

    it('should accept known subjects', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1',
            description: 'Test',
            type: 'overall',
            strand: 'Test',
          },
        ],
      };

      const result = validator.validate(curriculum);
      
      expect(result.warnings.filter(w => w.field === 'subject')).toHaveLength(0);
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate correct statistics', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1',
            description: 'Overall 1',
            type: 'overall',
            strand: 'Number Sense',
          },
          {
            code: 'A2',
            description: 'Overall 2',
            type: 'overall',
            strand: 'Measurement',
          },
          {
            code: 'A1.1',
            description: 'Specific 1',
            type: 'specific',
            strand: 'Number Sense',
          },
          {
            code: 'A1.2',
            description: 'Specific 2',
            type: 'specific',
            strand: 'Number Sense',
          },
          {
            code: 'A2.1',
            description: 'Specific 3',
            type: 'specific',
            strand: 'Measurement',
          },
        ],
      };

      const result = validator.validate(curriculum);
      
      expect(result.stats.totalExpectations).toBe(5);
      expect(result.stats.overallExpectations).toBe(2);
      expect(result.stats.specificExpectations).toBe(3);
      expect(result.stats.strands).toContain('Number Sense');
      expect(result.stats.strands).toContain('Measurement');
      expect(result.stats.strands).toHaveLength(2);
    });

    it('should detect duplicates correctly', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1.1',
            description: 'First instance of expectation',
            type: 'specific',
            strand: 'Number Sense',
          },
          {
            code: 'A1.1',
            description: 'First instance of expectation',
            type: 'specific',
            strand: 'Number Sense',
          },
          {
            code: 'A1.2',
            description: 'Different expectation',
            type: 'specific',
            strand: 'Number Sense',
          },
        ],
      };

      const result = validator.validate(curriculum);
      
      expect(result.stats.duplicates).toBe(1);
    });
  });

  describe('Validation Options', () => {
    it('should skip duplicate checking when disabled', () => {
      const noDupValidator = new CurriculumValidator({ checkDuplicates: false });
      
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1.1',
            description: 'First',
            type: 'specific',
            strand: 'Test',
          },
          {
            code: 'A1.1',
            description: 'Duplicate',
            type: 'specific',
            strand: 'Test',
          },
        ],
      };

      const result = noDupValidator.validate(curriculum);
      
      expect(result.warnings.filter(w => 
        w.message.includes('Duplicate')
      )).toHaveLength(0);
      expect(result.stats.duplicates).toBe(0);
    });

    it('should enforce minimum expectations', () => {
      const minValidator = new CurriculumValidator({ minExpectations: 5 });
      
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1',
            description: 'Only one',
            type: 'overall',
            strand: 'Test',
          },
        ],
      };

      const result = minValidator.validate(curriculum);
      
      expect(result.errors.some(e => 
        e.field === 'expectations' && e.message.includes('At least 5')
      )).toBe(true);
    });

    it('should validate required strands', () => {
      const strandValidator = new CurriculumValidator({
        requiredStrands: ['Number Sense', 'Measurement', 'Geometry'],
      });
      
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1',
            description: 'Test',
            type: 'overall',
            strand: 'Number Sense',
          },
          {
            code: 'B1',
            description: 'Test',
            type: 'overall',
            strand: 'Measurement',
          },
        ],
      };

      const result = strandValidator.validate(curriculum);
      
      expect(result.errors.some(e => 
        e.field === 'strands' && e.message.includes('Geometry')
      )).toBe(true);
    });
  });

  describe('Factory Methods', () => {
    it('should create default validator', () => {
      const defaultValidator = CurriculumValidator.createDefault();
      
      expect(defaultValidator).toBeInstanceOf(CurriculumValidator);
    });

    it('should create strict validator', () => {
      const strictValidator = CurriculumValidator.createStrict();
      
      const curriculum: ParsedCurriculum = {
        subject: 'Test',
        grade: 1,
        expectations: [], // Should fail with strict validator
      };

      const result = strictValidator.validate(curriculum);
      expect(result.isValid).toBe(false);
    });

    it('should create lenient validator', () => {
      const lenientValidator = CurriculumValidator.createLenient();
      
      const curriculum: ParsedCurriculum = {
        subject: 'Test',
        grade: 1,
        expectations: [
          {
            code: 'Invalid-Code-Format!!!',
            description: 'Test',
            type: 'overall',
            strand: 'Test',
          },
        ],
      };

      const result = lenientValidator.validate(curriculum);
      // Lenient validator should be more forgiving
      expect(result.warnings.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined values gracefully', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: 'A1',
            description: 'Test',
            type: 'overall',
            strand: 'Test',
            substrand: undefined,
            keywords: undefined,
          },
        ],
      };

      const result = validator.validate(curriculum);
      expect(result.isValid).toBe(true);
    });

    it('should handle empty strings appropriately', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations: [
          {
            code: '',
            description: 'No code',
            type: 'overall',
            strand: 'Test',
          },
        ],
      };

      const result = validator.validate(curriculum);
      expect(result.errors.some(e => e.field === 'expectation.code')).toBe(true);
    });

    it('should handle very large curriculum datasets', () => {
      const expectations: ParsedExpectation[] = [];
      
      // Generate 1000 expectations
      for (let i = 0; i < 1000; i++) {
        expectations.push({
          code: `A${Math.floor(i / 100)}.${i % 100}`,
          description: `Expectation ${i} with a reasonably long description`,
          type: i % 10 === 0 ? 'overall' : 'specific',
          strand: `Strand ${Math.floor(i / 200)}`,
        });
      }

      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 3,
        expectations,
      };

      const startTime = Date.now();
      const result = validator.validate(curriculum);
      const duration = Date.now() - startTime;

      expect(result.stats.totalExpectations).toBe(1000);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});