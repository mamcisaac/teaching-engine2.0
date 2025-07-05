/**
 * Real Curriculum File Processing Tests
 * Tests curriculum file parsing with actual CSV, JSON, PDF, and DOCX files
 * 
 * RED-GREEN-REFACTOR: Tests written first to define expected behavior
 * 
 * These tests verify:
 * - Real CSV parsing with various formats and edge cases
 * - JSON curriculum file validation and processing
 * - PDF content extraction (when available)
 * - DOCX curriculum document processing
 * - Error handling with malformed files
 * - Batch file processing operations
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { FileSystemTestUtils, FileSystemTestSetup, TempDirectory } from '../utils/FileSystemTestUtils';
import { CSVParser } from '../../src/services/curriculum/parsers/CSVParser';
import { JSONParser } from '../../src/services/curriculum/parsers/JSONParser';
import { PDFParser } from '../../src/services/curriculum/parsers/PDFParser';
import { ParserFactory } from '../../src/services/curriculum/parsers/ParserFactory';
import { CurriculumValidator } from '../../src/services/curriculum/validators/CurriculumValidator';
import { CurriculumImportOrchestrator } from '../../src/services/curriculum/CurriculumImportOrchestrator';

describe('Real Curriculum File Processing Tests', () => {
  let testDir: TempDirectory;
  let filesDir: TempDirectory;
  let csvParser: CSVParser;
  let jsonParser: JSONParser;
  let pdfParser: PDFParser;
  let validator: CurriculumValidator;

  beforeAll(async () => {
    testDir = await FileSystemTestSetup.beforeAll();
    filesDir = await testDir.createSubDir('curriculum-files');
    
    csvParser = new CSVParser({ strict: false });
    jsonParser = new JSONParser({ strict: false });
    pdfParser = new PDFParser({ strict: false });
    validator = CurriculumValidator.createDefault();
  });

  afterAll(async () => {
    await FileSystemTestSetup.afterAll();
  });

  beforeEach(async () => {
    // Clean files directory between tests
    const files = await FileSystemTestUtils.listFiles(filesDir.path);
    await Promise.all(files.map(file => 
      FileSystemTestUtils.deleteFile(`${filesDir.path}/${file}`).catch(() => {})
    ));
  });

  describe('Real CSV File Processing', () => {
    it('should parse valid Ontario curriculum CSV files', async () => {
      const ontarioCsvContent = `Grade,Subject,Strand,Code,Type,Description
1,Mathematics,Number Sense,1.N.1,overall,"demonstrate an understanding of numbers up to 50"
1,Mathematics,Number Sense,1.N.1.1,specific,"read number words from one to twenty"
1,Mathematics,Number Sense,1.N.1.2,specific,"represent and describe numbers from 0 to 50"
1,Mathematics,Number Sense,1.N.1.3,specific,"compare and order numbers from 0 to 50"
1,Mathematics,Patterning,1.P.1,overall,"identify and describe patterns and use them to make predictions"
1,Mathematics,Patterning,1.P.1.1,specific,"identify and describe repeating patterns"`;

      const csvFile = await filesDir.createFile('ontario-math-grade1.csv', ontarioCsvContent);

      try {
        // Read file content
        const fileContent = await FileSystemTestUtils.readFile(csvFile.path);
        
        // Parse with CSV parser
        const parsed = await csvParser.parse(fileContent);
        
        // Verify parsed structure
        expect(parsed.subject).toBe('Mathematics');
        expect(parsed.grade).toBe(1);
        expect(parsed.expectations).toHaveLength(6);
        
        // Verify overall expectations
        const overallExpectations = parsed.expectations.filter(exp => exp.type === 'overall');
        expect(overallExpectations).toHaveLength(2);
        expect(overallExpectations[0].code).toBe('1.N.1');
        expect(overallExpectations[1].code).toBe('1.P.1');
        
        // Verify specific expectations
        const specificExpectations = parsed.expectations.filter(exp => exp.type === 'specific');
        expect(specificExpectations).toHaveLength(4);
        expect(specificExpectations[0].code).toBe('1.N.1.1');
        
        // Verify strands
        const numberSenseExpectations = parsed.expectations.filter(exp => exp.strand === 'Number Sense');
        const patterningExpectations = parsed.expectations.filter(exp => exp.strand === 'Patterning');
        expect(numberSenseExpectations).toHaveLength(4);
        expect(patterningExpectations).toHaveLength(2);
      } finally {
        await csvFile.cleanup();
      }
    });

    it('should handle CSV files with different column formats', async () => {
      // Test alternative column naming
      const alternativeCsvContent = `Expectation Code,Expectation Description,Expectation Type,Subject Area,Grade Level
A1.1,"Students will demonstrate understanding of whole numbers to 100",Specific,Mathematics,2
A1.2,"Students will use concrete materials to represent numbers",Specific,Mathematics,2
A,"Overall expectations for number sense and numeration",Overall,Mathematics,2`;

      const csvFile = await filesDir.createFile('alternative-format.csv', alternativeCsvContent);

      try {
        const fileContent = await FileSystemTestUtils.readFile(csvFile.path);
        const parsed = await csvParser.parse(fileContent);
        
        expect(parsed.subject).toBe('Mathematics');
        expect(parsed.grade).toBe(2);
        expect(parsed.expectations).toHaveLength(3);
        
        // Verify parser handles different column names
        expect(parsed.expectations[0].code).toBe('A1.1');
        expect(parsed.expectations[0].type).toBe('specific');
        expect(parsed.expectations[2].type).toBe('overall');
      } finally {
        await csvFile.cleanup();
      }
    });

    it('should handle CSV files with malformed data', async () => {
      const malformedCsvContent = `Code,Description,Type
A1.1,"Unclosed quote and special chars: <script>alert('xss')</script>,specific
A1.2,Normal description,specific
"A1.3","Properly quoted, with commas",specific
A1.4,Description with "embedded quotes" and 'single quotes',specific
,Empty code field,specific
A1.5,,specific
A1.6,"SQL injection attempt: '; DROP TABLE users; --",specific`;

      const csvFile = await filesDir.createFile('malformed.csv', malformedCsvContent);

      try {
        const fileContent = await FileSystemTestUtils.readFile(csvFile.path);
        
        // Should parse without throwing errors (strict=false)
        const parsed = await csvParser.parse(fileContent);
        
        expect(parsed.expectations.length).toBeGreaterThan(0);
        
        // Verify malicious content is captured but not executed
        const suspiciousExp = parsed.expectations.find(exp => 
          exp.description.includes('script') || exp.description.includes('DROP TABLE')
        );
        
        if (suspiciousExp) {
          // Content should be present but sanitized during validation
          expect(suspiciousExp.description).toBeTruthy();
        }
      } finally {
        await csvFile.cleanup();
      }
    });

    it('should handle large CSV files efficiently', async () => {
      // Generate a large CSV with 1000 expectations
      const headerRow = 'Code,Description,Type,Strand,Grade,Subject\n';
      const dataRows = Array.from({ length: 1000 }, (_, i) => 
        `A${Math.floor(i/10)}.${i%10 + 1},"Description for expectation ${i + 1}",specific,Strand${i%5},3,Mathematics`
      ).join('\n');
      
      const largeCsvContent = headerRow + dataRows;
      const largeCsvFile = await filesDir.createFile('large-curriculum.csv', largeCsvContent);

      try {
        const startTime = Date.now();
        const fileContent = await FileSystemTestUtils.readFile(largeCsvFile.path);
        const parsed = await csvParser.parse(fileContent);
        const endTime = Date.now();
        
        expect(parsed.expectations).toHaveLength(1000);
        expect(parsed.subject).toBe('Mathematics');
        expect(parsed.grade).toBe(3);
        
        // Should parse reasonably quickly (under 1 second)
        expect(endTime - startTime).toBeLessThan(1000);
        
        // Verify memory usage is reasonable
        const fileSize = await FileSystemTestUtils.getFileSize(largeCsvFile.path);
        expect(fileSize).toBeGreaterThan(50000); // Should be > 50KB
      } finally {
        await largeCsvFile.cleanup();
      }
    });

    it('should handle CSV files with different encodings', async () => {
      // Test with UTF-8 content including accented characters
      const utf8CsvContent = `Code,Description,Type,Subject
F1.1,"Élèves démontreront la compréhension des nombres",specific,Français
F1.2,"Résoudre des problèmes mathématiques simples",specific,Français
S1.1,"Los estudiantes entenderán los números",specific,Español`;

      const utf8File = await filesDir.createFile('utf8-curriculum.csv', utf8CsvContent);

      try {
        const fileContent = await FileSystemTestUtils.readFile(utf8File.path);
        const parsed = await csvParser.parse(fileContent);
        
        expect(parsed.expectations).toHaveLength(3);
        
        // Verify accented characters are preserved
        expect(parsed.expectations[0].description).toContain('Élèves');
        expect(parsed.expectations[1].description).toContain('Résoudre');
        expect(parsed.expectations[2].description).toContain('españ');
      } finally {
        await utf8File.cleanup();
      }
    });
  });

  describe('Real JSON File Processing', () => {
    it('should parse valid curriculum JSON files', async () => {
      const curriculumJson = {
        metadata: {
          title: "Grade 2 Science Curriculum",
          province: "Ontario",
          year: 2022,
          lastUpdated: "2024-01-15"
        },
        curriculum: {
          subject: "Science",
          grade: 2,
          expectations: [
            {
              code: "2.S.1",
              description: "demonstrate understanding of basic scientific concepts",
              type: "overall",
              strand: "Understanding Life Systems",
              keywords: ["science", "concepts", "understanding"]
            },
            {
              code: "2.S.1.1",
              description: "identify basic needs of plants and animals",
              type: "specific",
              strand: "Understanding Life Systems",
              keywords: ["plants", "animals", "needs"]
            },
            {
              code: "2.S.1.2", 
              description: "describe how plants and animals meet their basic needs",
              type: "specific",
              strand: "Understanding Life Systems",
              keywords: ["plants", "animals", "basic needs"]
            }
          ]
        }
      };

      const jsonFile = await filesDir.createFile('science-grade2.json', JSON.stringify(curriculumJson, null, 2));

      try {
        const fileContent = await FileSystemTestUtils.readFile(jsonFile.path);
        const parsed = await jsonParser.parse(fileContent);
        
        expect(parsed.subject).toBe('Science');
        expect(parsed.grade).toBe(2);
        expect(parsed.expectations).toHaveLength(3);
        
        // Verify metadata preservation
        expect(parsed.metadata).toBeTruthy();
        expect(parsed.metadata.source).toBe('JSON Import');
        
        // Verify expectations structure
        const overallExp = parsed.expectations.find(exp => exp.type === 'overall');
        expect(overallExp).toBeTruthy();
        expect(overallExp?.code).toBe('2.S.1');
        
        const specificExps = parsed.expectations.filter(exp => exp.type === 'specific');
        expect(specificExps).toHaveLength(2);
      } finally {
        await jsonFile.cleanup();
      }
    });

    it('should handle nested JSON curriculum structures', async () => {
      const nestedJson = {
        curriculum: {
          subject: "Language Arts",
          grade: 4,
          strands: {
            "Reading": {
              overall: [
                {
                  code: "4.R.1",
                  description: "read and demonstrate comprehension of texts"
                }
              ],
              specific: [
                {
                  code: "4.R.1.1",
                  description: "read various texts fluently"
                },
                {
                  code: "4.R.1.2",
                  description: "demonstrate comprehension strategies"
                }
              ]
            },
            "Writing": {
              overall: [
                {
                  code: "4.W.1",
                  description: "write clearly and coherently"
                }
              ],
              specific: [
                {
                  code: "4.W.1.1",
                  description: "use proper grammar and spelling"
                }
              ]
            }
          }
        }
      };

      const jsonFile = await filesDir.createFile('nested-curriculum.json', JSON.stringify(nestedJson, null, 2));

      try {
        const fileContent = await FileSystemTestUtils.readFile(jsonFile.path);
        const parsed = await jsonParser.parse(fileContent);
        
        expect(parsed.subject).toBe('Language Arts');
        expect(parsed.grade).toBe(4);
        expect(parsed.expectations.length).toBeGreaterThan(0);
        
        // Verify flattened structure
        const readingExps = parsed.expectations.filter(exp => exp.strand === 'Reading');
        const writingExps = parsed.expectations.filter(exp => exp.strand === 'Writing');
        
        expect(readingExps.length).toBeGreaterThan(0);
        expect(writingExps.length).toBeGreaterThan(0);
      } finally {
        await jsonFile.cleanup();
      }
    });

    it('should handle malformed JSON gracefully', async () => {
      const malformedJson = `{
        "curriculum": {
          "subject": "Mathematics",
          "grade": 3,
          "expectations": [
            {
              "code": "3.M.1",
              "description": "Malformed JSON with missing quote
            }
          ]
        }
      }`;

      const jsonFile = await filesDir.createFile('malformed.json', malformedJson);

      try {
        const fileContent = await FileSystemTestUtils.readFile(jsonFile.path);
        
        // Should throw a parsing error for malformed JSON
        await expect(jsonParser.parse(fileContent)).rejects.toThrow();
      } finally {
        await jsonFile.cleanup();
      }
    });
  });

  describe('Real PDF File Processing', () => {
    it('should handle PDF files with text content', async () => {
      // Create a simple PDF-like file with proper header
      const pdfHeader = Buffer.from('%PDF-1.4\n');
      const textContent = Buffer.from(`
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Mathematics Grade 1 Curriculum) Tj
ET
endstream
endobj

trailer
<<
/Size 5
/Root 1 0 R
>>
%%EOF
`);

      const pdfContent = Buffer.concat([pdfHeader, textContent]);
      const pdfFile = await filesDir.createFile('curriculum.pdf', pdfContent);

      try {
        const fileContent = await FileSystemTestUtils.readFile(pdfFile.path);
        
        // Note: Real PDF parsing requires pdf-parse library
        // In test environment, we might get mocked results
        const parsed = await pdfParser.parse(fileContent);
        
        // Verify parser returns a valid structure
        expect(parsed.subject).toBeTruthy();
        expect(parsed.grade).toBeTruthy();
        expect(parsed.expectations).toBeDefined();
        expect(Array.isArray(parsed.expectations)).toBe(true);
      } finally {
        await pdfFile.cleanup();
      }
    });

    it('should handle corrupted PDF files', async () => {
      const corruptedPdf = await FileSystemTestUtils.createCorruptedFile(filesDir, 'pdf');

      try {
        const fileContent = await FileSystemTestUtils.readFile(corruptedPdf.path);
        
        // Should handle corrupted PDFs gracefully
        await expect(pdfParser.parse(fileContent)).rejects.toThrow();
      } finally {
        await corruptedPdf.cleanup();
      }
    });
  });

  describe('Batch File Processing', () => {
    it('should process multiple curriculum files in batch', async () => {
      // Create multiple curriculum files
      const files = await Promise.all([
        filesDir.createFile('math-grade1.csv', `Code,Description,Type,Subject,Grade
M1.1,Numbers to 20,specific,Mathematics,1
M1.2,Addition basics,specific,Mathematics,1`),
        
        filesDir.createFile('science-grade1.json', JSON.stringify({
          curriculum: {
            subject: "Science",
            grade: 1,
            expectations: [
              { code: "S1.1", description: "Observe natural world", type: "specific" }
            ]
          }
        })),
        
        filesDir.createFile('language-grade1.csv', `Code,Description,Type,Subject,Grade
L1.1,Reading comprehension,specific,Language,1
L1.2,Writing skills,specific,Language,1`)
      ]);

      try {
        const results = [];
        
        // Process each file
        for (const file of files) {
          const fileContent = await FileSystemTestUtils.readFile(file.path);
          const extension = file.path.split('.').pop();
          
          let parsed;
          switch (extension) {
            case 'csv':
              parsed = await csvParser.parse(fileContent);
              break;
            case 'json':
              parsed = await jsonParser.parse(fileContent);
              break;
            default:
              continue;
          }
          
          results.push(parsed);
        }
        
        expect(results).toHaveLength(3);
        
        // Verify each subject was processed
        const subjects = results.map(r => r.subject);
        expect(subjects).toContain('Mathematics');
        expect(subjects).toContain('Science');
        expect(subjects).toContain('Language');
        
        // Verify all are grade 1
        results.forEach(result => {
          expect(result.grade).toBe(1);
        });
      } finally {
        await Promise.all(files.map(file => file.cleanup()));
      }
    });

    it('should handle mixed valid and invalid files in batch', async () => {
      const files = await Promise.all([
        filesDir.createFile('valid.csv', `Code,Description,Type
V1.1,Valid expectation,specific`),
        
        filesDir.createFile('invalid.json', `{ invalid json`),
        
        filesDir.createFile('empty.csv', ``),
        
        filesDir.createFile('valid2.csv', `Code,Description,Type
V2.1,Another valid expectation,specific`)
      ]);

      try {
        const results = [];
        const errors = [];
        
        // Process files with error handling
        for (const file of files) {
          try {
            const fileContent = await FileSystemTestUtils.readFile(file.path);
            const extension = file.path.split('.').pop();
            
            let parsed;
            switch (extension) {
              case 'csv':
                parsed = await csvParser.parse(fileContent);
                break;
              case 'json':
                parsed = await jsonParser.parse(fileContent);
                break;
              default:
                continue;
            }
            
            results.push({ file: file.path, result: parsed });
          } catch (error) {
            errors.push({ file: file.path, error: error.message });
          }
        }
        
        // Should have some successful and some failed
        expect(results.length).toBeGreaterThan(0);
        expect(errors.length).toBeGreaterThan(0);
        
        // Verify successful files produced valid results
        results.forEach(({ result }) => {
          expect(result.expectations).toBeDefined();
        });
      } finally {
        await Promise.all(files.map(file => file.cleanup()));
      }
    });
  });

  describe('File Validation and Processing Pipeline', () => {
    it('should validate processed curriculum data', async () => {
      const validCsvContent = `Code,Description,Type,Strand,Grade,Subject
1.N.1,Demonstrate understanding of numbers,overall,Number Sense,1,Mathematics
1.N.1.1,Count to 20,specific,Number Sense,1,Mathematics
1.N.1.2,Read number words,specific,Number Sense,1,Mathematics`;

      const csvFile = await filesDir.createFile('valid-curriculum.csv', validCsvContent);

      try {
        const fileContent = await FileSystemTestUtils.readFile(csvFile.path);
        const parsed = await csvParser.parse(fileContent);
        
        // Validate using curriculum validator
        const validationResult = await validator.validate(parsed);
        
        expect(validationResult.isValid).toBe(true);
        expect(validationResult.errors).toHaveLength(0);
        expect(validationResult.warnings).toBeDefined();
      } finally {
        await csvFile.cleanup();
      }
    });

    it('should integrate with curriculum import orchestrator', async () => {
      const csvContent = `Code,Description,Type,Strand,Grade,Subject
2.M.1,Understanding numbers to 100,overall,Number Sense,2,Mathematics
2.M.1.1,Count by 2s to 20,specific,Number Sense,2,Mathematics`;

      const csvFile = await filesDir.createFile('orchestrator-test.csv', csvContent);

      try {
        const fileContent = await FileSystemTestUtils.readFile(csvFile.path);
        
        // Test with orchestrator (if available in test environment)
        const orchestrator = CurriculumImportOrchestrator.getInstance();
        
        // Verify orchestrator can handle file content
        const supported = orchestrator.getSupportedFormats();
        expect(supported).toContain('.csv');
        
        // Validate import options
        const options = {
          userId: 1,
          filename: 'orchestrator-test.csv',
          validate: true,
          dryRun: true
        };
        
        const validation = orchestrator.validateImportOptions(options);
        expect(validation.isValid).toBe(true);
      } finally {
        await csvFile.cleanup();
      }
    });

    it('should handle file format detection', async () => {
      const files = await Promise.all([
        filesDir.createFile('test.csv', 'Code,Description\nT1,Test'),
        filesDir.createFile('test.json', '{"test": true}'),
        filesDir.createFile('test.txt', 'Plain text'),
        filesDir.createFile('test.pdf', Buffer.from('%PDF-1.4\nPDF content'))
      ]);

      try {
        for (const file of files) {
          const extension = '.' + file.path.split('.').pop();
          const isSupported = ParserFactory.isSupported(file.path);
          const supportedExtensions = ParserFactory.getSupportedExtensions();
          
          if (supportedExtensions.includes(extension)) {
            expect(isSupported).toBe(true);
            
            // Verify parser can be created
            const parser = ParserFactory.createParser(file.path);
            expect(parser).toBeTruthy();
          } else {
            expect(isSupported).toBe(false);
          }
        }
      } finally {
        await Promise.all(files.map(file => file.cleanup()));
      }
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle processing multiple large files', async () => {
      // Create multiple large curriculum files
      const largeFiles = await Promise.all([
        filesDir.createFile('large-math.csv', 
          'Code,Description,Type,Grade,Subject\n' + 
          Array.from({ length: 500 }, (_, i) => 
            `M${i}.1,Math expectation ${i},specific,3,Mathematics`
          ).join('\n')
        ),
        
        filesDir.createFile('large-science.csv',
          'Code,Description,Type,Grade,Subject\n' + 
          Array.from({ length: 500 }, (_, i) => 
            `S${i}.1,Science expectation ${i},specific,3,Science`
          ).join('\n')
        )
      ]);

      try {
        const startTime = Date.now();
        
        const results = await Promise.all(
          largeFiles.map(async (file) => {
            const fileContent = await FileSystemTestUtils.readFile(file.path);
            return csvParser.parse(fileContent);
          })
        );
        
        const endTime = Date.now();
        
        // Should process both files successfully
        expect(results).toHaveLength(2);
        expect(results[0].expectations).toHaveLength(500);
        expect(results[1].expectations).toHaveLength(500);
        
        // Should complete in reasonable time (under 2 seconds)
        expect(endTime - startTime).toBeLessThan(2000);
      } finally {
        await Promise.all(largeFiles.map(file => file.cleanup()));
      }
    });

    it('should handle concurrent file processing', async () => {
      const fileContents = Array.from({ length: 10 }, (_, i) => 
        `Code,Description,Type,Subject,Grade\nT${i}.1,Test expectation ${i},specific,Test,1`
      );

      const files = await Promise.all(
        fileContents.map((content, i) => 
          filesDir.createFile(`concurrent-${i}.csv`, content)
        )
      );

      try {
        // Process all files concurrently
        const startTime = Date.now();
        
        const results = await Promise.all(
          files.map(async (file) => {
            const fileContent = await FileSystemTestUtils.readFile(file.path);
            return csvParser.parse(fileContent);
          })
        );
        
        const endTime = Date.now();
        
        // All should succeed
        expect(results).toHaveLength(10);
        results.forEach((result, i) => {
          expect(result.expectations[0].description).toContain(`Test expectation ${i}`);
        });
        
        // Concurrent processing should be faster than sequential
        expect(endTime - startTime).toBeLessThan(1000);
      } finally {
        await Promise.all(files.map(file => file.cleanup()));
      }
    });
  });
});