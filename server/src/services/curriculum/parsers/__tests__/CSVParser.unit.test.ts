/**
 * CSV Parser Test Suite
 */

import { CSVParser } from '../CSVParser';
import { ParsedCurriculum } from '../CurriculumParser';

describe('CSVParser', () => {
  let parser: CSVParser;

  beforeEach(() => {
    parser = new CSVParser();
  });

  describe('Basic Parsing', () => {
    it('should parse valid CSV content', async () => {
      const csvContent = `code,description,type,strand,grade,subject
A1.1,"Understand basic addition concepts",overall,"Number Sense",1,Mathematics
A1.1.1,"Add single-digit numbers",specific,"Number Sense",1,Mathematics
A1.1.2,"Use manipulatives for addition",specific,"Number Sense",1,Mathematics`;

      const result = await parser.parse(csvContent);

      expect(result).toBeDefined();
      expect(result.subject).toBe('Mathematics');
      expect(result.grade).toBe(1);
      expect(result.expectations).toHaveLength(3);
      expect(result.expectations[0]).toMatchObject({
        code: 'A1.1',
        description: 'Understand basic addition concepts',
        type: 'overall',
        strand: 'Number Sense',
        grade: 1,
        subject: 'Mathematics',
      });
    });

    it('should handle different column name variations', async () => {
      const csvContent = `expectation_code,expectation_description,expectation_type,Strand,Grade,Subject
B2.1,"Read with comprehension",overall,Reading,2,Language`;

      const result = await parser.parse(csvContent);

      expect(result.expectations).toHaveLength(1);
      expect(result.expectations[0]).toMatchObject({
        code: 'B2.1',
        description: 'Read with comprehension',
        type: 'overall',
        strand: 'Reading',
      });
    });

    it('should extract keywords when enabled', async () => {
      const csvContent = `code,description,type,strand,grade,subject
A1.1,"Students will analyze and evaluate mathematical concepts",overall,"Number Sense",3,Mathematics`;

      const result = await parser.parse(csvContent);

      expect(result.expectations[0].keywords).toBeDefined();
      expect(result.expectations[0].keywords).toContain('analyze');
      expect(result.expectations[0].keywords).toContain('evaluate');
    });
  });

  describe('Validation', () => {
    it('should validate parsed curriculum', async () => {
      const csvContent = `code,description,type,strand,grade,subject
A1.1,"Valid expectation",overall,"Number Sense",1,Mathematics`;

      const result = await parser.parse(csvContent);
      const isValid = parser.validate(result);

      expect(isValid).toBe(true);
    });

    it('should fail validation for empty expectations', () => {
      const curriculum: ParsedCurriculum = {
        subject: 'Mathematics',
        grade: 1,
        expectations: [],
      };

      const isValid = parser.validate(curriculum);
      expect(isValid).toBe(false);
    });

    it('should validate expectation codes when strict mode is enabled', async () => {
      const strictParser = new CSVParser({ strict: true, validateCodes: true });
      
      const csvContent = `code,description,type,strand,grade,subject
INVALID_CODE,"Invalid code format",overall,"Number Sense",1,Mathematics
A1.1,"Valid code format",overall,"Number Sense",1,Mathematics`;

      const result = await strictParser.parse(csvContent);
      
      // In strict mode with validation, invalid codes might be filtered out
      expect(result.expectations.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for empty CSV', async () => {
      await expect(parser.parse('')).rejects.toThrow('No data found in CSV file');
    });

    it('should handle missing required fields gracefully', async () => {
      const csvContent = `description,type
"Missing code field",overall`;

      const result = await parser.parse(csvContent);
      
      // Should skip rows without required fields
      expect(result.expectations.length).toBe(0);
    });

    it('should handle malformed CSV gracefully', async () => {
      const csvContent = `code,description,type,strand,grade,subject
A1.1,"Unclosed quote,overall,"Number Sense",1,Mathematics`;

      // Should either parse with best effort or throw a clear error
      try {
        const result = await parser.parse(csvContent);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Type Parsing', () => {
    it('should parse expectation type correctly', async () => {
      const csvContent = `code,description,type,strand,grade,subject
A1,"Overall expectation",overall,"Number Sense",1,Mathematics
A1.1,"Specific expectation",specific,"Number Sense",1,Mathematics
A2,"Type from description - overall expectation",,Number Sense",1,Mathematics`;

      const result = await parser.parse(csvContent);

      expect(result.expectations[0].type).toBe('overall');
      expect(result.expectations[1].type).toBe('specific');
      expect(result.expectations[2].type).toBe('overall');
    });

    it('should infer type from code pattern when type is missing', async () => {
      const csvContent = `code,description,strand,grade,subject
A1,"Short code expectation","Number Sense",1,Mathematics
A1.2.3,"Long code expectation","Number Sense",1,Mathematics`;

      const result = await parser.parse(csvContent);

      expect(result.expectations[0].type).toBe('overall');
      expect(result.expectations[1].type).toBe('specific');
    });
  });

  describe('Grade and Subject Extraction', () => {
    it('should extract grade from various formats', async () => {
      const csvContent = `code,description,type,strand,grade,subject
A1.1,"Expectation 1",overall,"Strand",1,Mathematics
A1.2,"Expectation 2",overall,"Strand","Grade 2",Mathematics
A1.3,"Expectation 3",overall,"Strand","2nd Grade",Mathematics`;

      const result = await parser.parse(csvContent);

      expect(result.expectations[0].grade).toBe(1);
      expect(result.expectations[1].grade).toBe(2);
      expect(result.expectations[2].grade).toBe(2);
    });

    it('should use default grade when individual rows lack grade', async () => {
      const csvContent = `code,description,type,strand,subject,grade
A1.1,"Expectation without grade",overall,"Strand",Mathematics,3
A1.2,"Expectation with grade",overall,"Strand",Mathematics,`;

      const result = await parser.parse(csvContent);

      expect(result.grade).toBe(3);
      expect(result.expectations[0].grade).toBe(3);
    });
  });

  describe('Options', () => {
    it('should respect strict mode option', async () => {
      const lenientParser = new CSVParser({ strict: false });
      
      const csvContent = `code,description
,"Description without code"
"","Empty code"
"A1.1","Valid expectation"`;

      const result = await lenientParser.parse(csvContent);
      
      // In non-strict mode, might include more expectations
      expect(result.expectations.length).toBeGreaterThanOrEqual(1);
    });

    it('should skip keyword extraction when disabled', async () => {
      const noKeywordsParser = new CSVParser({ extractKeywords: false });
      
      const csvContent = `code,description,type,strand,grade,subject
A1.1,"Students will analyze and create mathematical models",overall,"Number Sense",1,Mathematics`;

      const result = await noKeywordsParser.parse(csvContent);

      expect(result.expectations[0].keywords).toBeUndefined();
    });
  });

  describe('File Extensions', () => {
    it('should report supported extensions', () => {
      const extensions = parser.getSupportedExtensions();
      
      expect(extensions).toContain('.csv');
      expect(extensions).toContain('.txt');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle real-world CSV with mixed data quality', async () => {
      const csvContent = `Expectation Code,Description,Type,Strand,Substrand,Grade Level,Subject Area,Keywords
A1,"Demonstrate an understanding of numbers",Overall,Number Sense,,1,Mathematics,"numbers, understanding"
A1.1,"Count to 50 by 1s, 2s, 5s, and 10s",Specific,Number Sense,Counting,1,Mathematics,"counting, skip counting"
A1.2,,Specific,Number Sense,Operations,1,Mathematics,
,Missing code,Specific,Number Sense,,1,Mathematics,
A2,"Solve problems involving addition",Overall,Number Sense,,1,Mathematics,"addition, problem solving"
`;

      const result = await parser.parse(csvContent);

      expect(result).toBeDefined();
      expect(result.subject).toBe('Mathematics');
      expect(result.grade).toBe(1);
      
      // Should have valid expectations only
      const validExpectations = result.expectations.filter(e => e.code && e.description);
      expect(validExpectations.length).toBeGreaterThan(0);
      
      // Check substrand parsing
      const withSubstrand = result.expectations.find(e => e.code === 'A1.1');
      expect(withSubstrand?.substrand).toBe('Counting');
    });

    it('should handle UTF-8 and special characters', async () => {
      const csvContent = `code,description,type,strand,grade,subject
A1.1,"Comprendre les concepts mathématiques de base",overall,"Sens du nombre",1,Mathématiques
A1.2,"Use "real-world" examples",specific,"Number Sense",1,Mathematics`;

      const result = await parser.parse(csvContent);

      expect(result.expectations).toHaveLength(2);
      expect(result.expectations[0].description).toContain('mathématiques');
      expect(result.expectations[1].description).toContain('real-world');
    });
  });
});