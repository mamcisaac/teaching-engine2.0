import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { CSVParser } from '../csvParser';
import { Readable } from 'stream';

describe('CSVParser', () => {
  let csvParser: CSVParser;

  beforeEach(() => {
    csvParser = new CSVParser();
    jest.clearAllMocks();
  });

  describe('Student Data Import', () => {
    test('should parse standard student roster CSV', async () => {
      const csvContent = `Name,Email,Grade,Section,Guardian Email,Guardian Phone
John Doe,john.doe@school.com,3,A,parent.doe@email.com,555-1234
Jane Smith,jane.smith@school.com,3,B,parent.smith@email.com,555-5678
Bob Johnson,bob.j@school.com,4,A,guardian.johnson@email.com,555-9012`;

      const result = await csvParser.parse(csvContent);

      expect(result).toMatchObject({
        headers: ['Name', 'Email', 'Grade', 'Section', 'Guardian Email', 'Guardian Phone'],
        rows: 3,
        data: [
          {
            Name: 'John Doe',
            Email: 'john.doe@school.com',
            Grade: '3',
            Section: 'A',
            'Guardian Email': 'parent.doe@email.com',
            'Guardian Phone': '555-1234'
          },
          {
            Name: 'Jane Smith',
            Email: 'jane.smith@school.com',
            Grade: '3',
            Section: 'B',
            'Guardian Email': 'parent.smith@email.com',
            'Guardian Phone': '555-5678'
          },
          {
            Name: 'Bob Johnson',
            Email: 'bob.j@school.com',
            Grade: '4',
            Section: 'A',
            'Guardian Email': 'guardian.johnson@email.com',
            'Guardian Phone': '555-9012'
          }
        ],
        errors: [],
        warnings: []
      });
    });

    test('should handle various delimiters', async () => {
      const testCases = [
        {
          name: 'comma',
          content: 'Name,Grade\nJohn,3',
          delimiter: ',',
          expected: { Name: 'John', Grade: '3' }
        },
        {
          name: 'tab',
          content: 'Name\tGrade\nJohn\t3',
          delimiter: '\t',
          expected: { Name: 'John', Grade: '3' }
        },
        {
          name: 'pipe',
          content: 'Name|Grade\nJohn|3',
          delimiter: '|',
          expected: { Name: 'John', Grade: '3' }
        },
        {
          name: 'semicolon',
          content: 'Name;Grade\nJohn;3',
          delimiter: ';',
          expected: { Name: 'John', Grade: '3' }
        }
      ];

      for (const testCase of testCases) {
        const result = await csvParser.parse(testCase.content, {
          delimiter: testCase.delimiter
        });

        expect(result.data[0]).toEqual(testCase.expected);
      }
    });

    test('should auto-detect delimiter when not specified', async () => {
      const csvContent = 'Name;Email;Grade\nJohn;john@test.com;3';
      
      const result = await csvParser.parse(csvContent);

      expect(result.detectedDelimiter).toBe(';');
      expect(result.data[0]).toEqual({
        Name: 'John',
        Email: 'john@test.com',
        Grade: '3'
      });
    });

    test('should handle quoted fields with embedded delimiters', async () => {
      const csvContent = `Name,Address,Notes
"Doe, John","123 Main St, Apt 4","Good student, very attentive"
"Smith, Jane","456 Oak Ave","Needs help with math"`;

      const result = await csvParser.parse(csvContent);

      expect(result.data[0]).toEqual({
        Name: 'Doe, John',
        Address: '123 Main St, Apt 4',
        Notes: 'Good student, very attentive'
      });
    });

    test('should handle escaped quotes in fields', async () => {
      const csvContent = `Name,Quote
"John ""Johnny"" Doe","He said ""Hello!"""`;

      const result = await csvParser.parse(csvContent);

      expect(result.data[0]).toEqual({
        Name: 'John "Johnny" Doe',
        Quote: 'He said "Hello!"'
      });
    });
  });

  describe('Data Type Validation', () => {
    test('should validate data types according to schema', async () => {
      const csvContent = `Name,Age,Grade,Score,Active
John Doe,8,3,95.5,true
Jane Smith,nine,3,92.0,yes
Bob Johnson,10,three,invalid,false`;

      const schema = {
        Name: 'string',
        Age: 'number',
        Grade: 'number',
        Score: 'number',
        Active: 'boolean'
      };

      const result = await csvParser.parse(csvContent, { schema });

      expect(result.errors).toContainEqual({
        row: 2,
        column: 'Age',
        value: 'nine',
        expected: 'number',
        message: 'Invalid number format'
      });

      expect(result.errors).toContainEqual({
        row: 3,
        column: 'Grade',
        value: 'three',
        expected: 'number',
        message: 'Invalid number format'
      });

      expect(result.errors).toContainEqual({
        row: 3,
        column: 'Score',
        value: 'invalid',
        expected: 'number',
        message: 'Invalid number format'
      });

      expect(result.validRows).toBe(1);
      expect(result.invalidRows).toBe(2);
    });

    test('should validate email formats', async () => {
      const csvContent = `Name,Email
John Doe,john.doe@school.com
Jane Smith,invalid-email
Bob Johnson,bob@`;

      const schema = {
        Name: 'string',
        Email: 'email'
      };

      const result = await csvParser.parse(csvContent, { schema });

      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toMatchObject({
        row: 2,
        column: 'Email',
        value: 'invalid-email',
        message: 'Invalid email format'
      });
    });

    test('should validate date formats', async () => {
      const csvContent = `Name,Birth Date,Enrollment Date
John Doe,2015-03-15,2023-09-01
Jane Smith,03/15/2015,September 1st
Bob Johnson,2015-13-45,2023-09-01`;

      const schema = {
        'Birth Date': { type: 'date', format: 'YYYY-MM-DD' },
        'Enrollment Date': { type: 'date', format: 'YYYY-MM-DD' }
      };

      const result = await csvParser.parse(csvContent, { schema });

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          row: 2,
          column: 'Birth Date',
          message: 'Invalid date format. Expected: YYYY-MM-DD'
        })
      );
    });

    test('should validate required fields', async () => {
      const csvContent = `Name,Email,Grade
John Doe,john@school.com,3
,jane@school.com,3
Bob Johnson,,4`;

      const schema = {
        Name: { type: 'string', required: true },
        Email: { type: 'email', required: true },
        Grade: { type: 'number', required: true }
      };

      const result = await csvParser.parse(csvContent, { schema });

      expect(result.errors).toContainEqual({
        row: 2,
        column: 'Name',
        value: '',
        message: 'Required field is empty'
      });

      expect(result.errors).toContainEqual({
        row: 3,
        column: 'Email',
        value: '',
        message: 'Required field is empty'
      });
    });
  });

  describe('Large File Handling', () => {
    test('should parse large files in streaming mode', async () => {
      // Generate large CSV data (100k rows)
      const headers = ['ID', 'Name', 'Email', 'Grade', 'Score'];
      const rows = 100000;
      
      let processedChunks = 0;
      let totalRows = 0;

      const result = await csvParser.parseStream(
        createLargeCSVStream(headers, rows),
        {
          chunkSize: 1000,
          onChunk: (chunk) => {
            processedChunks++;
            totalRows += chunk.rows.length;
            
            expect(chunk.rows.length).toBeLessThanOrEqual(1000);
            expect(chunk.startRow).toBe((processedChunks - 1) * 1000 + 1);
          }
        }
      );

      expect(processedChunks).toBe(100); // 100k rows / 1k chunk size
      expect(totalRows).toBe(rows);
      expect(result.totalRows).toBe(rows);
      expect(result.memoryUsage).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    test('should handle memory efficiently with backpressure', async () => {
      const rows = 1000000; // 1 million rows
      let peakMemory = 0;
      let currentMemory = process.memoryUsage().heapUsed;

      await csvParser.parseStream(
        createLargeCSVStream(['A', 'B', 'C'], rows),
        {
          chunkSize: 5000,
          onChunk: async (chunk) => {
            // Simulate slow processing
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const memory = process.memoryUsage().heapUsed;
            peakMemory = Math.max(peakMemory, memory - currentMemory);
          }
        }
      );

      // Peak memory should stay reasonable despite large file
      expect(peakMemory).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });

    test('should support progress tracking for large files', async () => {
      const totalRows = 10000;
      const progressUpdates: number[] = [];

      await csvParser.parseStream(
        createLargeCSVStream(['A', 'B'], totalRows),
        {
          chunkSize: 1000,
          onProgress: (progress) => {
            progressUpdates.push(progress.percentage);
          }
        }
      );

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0]).toBeLessThan(progressUpdates[progressUpdates.length - 1]);
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
    });
  });

  describe('Export Functionality', () => {
    test('should export data to CSV format', async () => {
      const data = [
        { student: 'John Doe', assignment: 'Quiz 1', score: 85, date: '2024-01-15' },
        { student: 'Jane Smith', assignment: 'Quiz 1', score: 92, date: '2024-01-15' }
      ];

      const csv = await csvParser.export(data);

      expect(csv).toBe(
        'student,assignment,score,date\n' +
        'John Doe,Quiz 1,85,2024-01-15\n' +
        'Jane Smith,Quiz 1,92,2024-01-15'
      );
    });

    test('should handle special characters in export', async () => {
      const data = [
        { name: 'O\'Brien, John', notes: 'Good "progress" in math', grade: 'A+' },
        { name: 'Smith, Jane', notes: 'Needs help\nwith reading', grade: 'B' }
      ];

      const csv = await csvParser.export(data);

      expect(csv).toContain('"O\'Brien, John"');
      expect(csv).toContain('"Good ""progress"" in math"');
      expect(csv).toContain('"Needs help\nwith reading"');
    });

    test('should support custom headers in export', async () => {
      const data = [
        { firstName: 'John', lastName: 'Doe', gradeLevel: 3 }
      ];

      const csv = await csvParser.export(data, {
        headers: {
          firstName: 'First Name',
          lastName: 'Last Name',
          gradeLevel: 'Grade'
        }
      });

      expect(csv.split('\n')[0]).toBe('First Name,Last Name,Grade');
    });

    test('should support column ordering in export', async () => {
      const data = [
        { score: 85, name: 'John', date: '2024-01-15' }
      ];

      const csv = await csvParser.export(data, {
        columns: ['name', 'date', 'score']
      });

      expect(csv.split('\n')[0]).toBe('name,date,score');
      expect(csv.split('\n')[1]).toBe('John,2024-01-15,85');
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle malformed CSV gracefully', async () => {
      const malformedCSV = `Name,Email,Grade
John Doe,john@test.com,3
"Jane Smith,jane@test.com
Bob Johnson,bob@test.com,4,Extra Field
Mike`;

      const result = await csvParser.parse(malformedCSV);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          row: 2,
          message: expect.stringContaining('Unclosed quote')
        })
      );

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          row: 3,
          message: expect.stringContaining('Column count mismatch')
        })
      );

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          row: 4,
          message: expect.stringContaining('Column count mismatch')
        })
      );

      // Should still parse valid rows
      expect(result.data).toContainEqual(
        expect.arrayContaining([
          { Name: 'John Doe', Email: 'john@test.com', Grade: '3' }
        ])
      );
    });

    test('should handle empty files', async () => {
      const result = await csvParser.parse('');

      expect(result.rows).toBe(0);
      expect(result.data).toEqual([]);
      expect(result.errors).toContainEqual({
        message: 'Empty CSV file'
      });
    });

    test('should handle files with only headers', async () => {
      const result = await csvParser.parse('Name,Email,Grade');

      expect(result.headers).toEqual(['Name', 'Email', 'Grade']);
      expect(result.rows).toBe(0);
      expect(result.data).toEqual([]);
      expect(result.warnings).toContainEqual({
        message: 'CSV contains only headers, no data rows'
      });
    });

    test('should handle encoding issues', async () => {
      // CSV with BOM and special characters
      const csvWithBOM = '\ufeffName,Grade\nJosé,3\nMüller,4';

      const result = await csvParser.parse(csvWithBOM);

      expect(result.headers).toEqual(['Name', 'Grade']);
      expect(result.data[0].Name).toBe('José');
      expect(result.data[1].Name).toBe('Müller');
    });
  });

  describe('Educational Data Specific Features', () => {
    test('should detect and validate grade levels', async () => {
      const csvContent = `Name,Grade
John,3
Jane,K
Bob,13
Alice,Pre-K`;

      const result = await csvParser.parse(csvContent, {
        schema: {
          Grade: { 
            type: 'grade',
            validGrades: ['K', 'Pre-K', '1', '2', '3', '4', '5', '6']
          }
        }
      });

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          row: 3,
          column: 'Grade',
          value: '13',
          message: 'Invalid grade level'
        })
      );
    });

    test('should parse attendance data', async () => {
      const csvContent = `Student,Date,Status,Notes
John Doe,2024-01-15,Present,
Jane Smith,2024-01-15,Absent,Sick
Bob Johnson,2024-01-15,Late,Arrived at 9:15`;

      const result = await csvParser.parse(csvContent, {
        schema: {
          Date: { type: 'date' },
          Status: { 
            type: 'enum',
            values: ['Present', 'Absent', 'Late', 'Excused']
          }
        }
      });

      expect(result.data).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });

    test('should parse grade reports with calculations', async () => {
      const csvContent = `Student,Quiz1,Quiz2,Quiz3,Homework,Final,Average
John Doe,85,90,88,95,87,
Jane Smith,92,88,95,90,93,`;

      const result = await csvParser.parse(csvContent, {
        calculateFields: {
          Average: {
            formula: 'mean',
            fields: ['Quiz1', 'Quiz2', 'Quiz3', 'Homework', 'Final']
          }
        }
      });

      expect(result.data[0].Average).toBe('89');
      expect(result.data[1].Average).toBe('91.6');
    });
  });
});

// Helper function to create large CSV stream
function createLargeCSVStream(headers: string[], rows: number): Readable {
  let currentRow = 0;
  
  return new Readable({
    read() {
      if (currentRow === 0) {
        this.push(headers.join(',') + '\n');
        currentRow++;
      } else if (currentRow <= rows) {
        // Generate batch of rows
        const batchSize = Math.min(1000, rows - currentRow + 1);
        let batch = '';
        
        for (let i = 0; i < batchSize; i++) {
          const row = headers.map((_, idx) => {
            if (idx === 0) return currentRow;
            if (idx === 1) return `Student${currentRow}`;
            if (idx === 2) return `student${currentRow}@school.com`;
            if (idx === 3) return Math.floor(Math.random() * 6) + 1;
            return Math.floor(Math.random() * 100);
          });
          
          batch += row.join(',') + '\n';
          currentRow++;
        }
        
        this.push(batch);
      } else {
        this.push(null); // End stream
      }
    }
  });
}