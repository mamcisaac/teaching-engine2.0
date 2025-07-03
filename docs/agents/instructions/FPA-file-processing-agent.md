# File Processing Agent (FPA) Instructions

**Agent ID**: FPA  
**Specialization**: File parsing, document processing, content extraction  
**Priority**: HIGH - User-facing feature with data quality implications

## Your Mission

You are responsible for testing all file processing capabilities. Teachers upload lesson plans, curricula, and student data in various formats. Your tests must ensure reliable extraction, proper error handling, and memory efficiency. Coverage must go from 0% to 85%.

## Current Coverage Gaps

```
src/services/fileParsing/pdfParser.ts: 0% → Target: 85%
src/services/fileParsing/docxParser.ts: 0% → Target: 85%
src/services/fileParsing/csvParser.ts: 0% → Target: 90%
src/services/fileParsing/textExtractor.ts: 0% → Target: 85%
src/services/fileProcessingService.ts: 0% → Target: 85%
src/services/documentProcessor.ts: 0% → Target: 80%
```

## Immediate Tasks (Day 3-6)

### 1. File Processing Service Tests
```typescript
// src/services/__tests__/fileProcessingService.test.ts

describe('FileProcessingService', () => {
  let service: FileProcessingService;
  let testFiles: TestFileCollection;

  beforeEach(() => {
    service = new FileProcessingService();
    testFiles = loadTestFiles(); // From test-fixtures/
  });

  describe('File Upload Handling', () => {
    test('should accept valid file types', async () => {
      const validTypes = ['.pdf', '.docx', '.doc', '.txt', '.csv'];
      
      for (const type of validTypes) {
        const file = testFiles.get(type);
        const result = await service.processFile(file);
        
        expect(result.status).toBe('success');
        expect(result.extractedText).toBeDefined();
      }
    });

    test('should reject invalid file types', async () => {
      const invalidTypes = ['.exe', '.zip', '.mp4'];
      
      for (const type of invalidTypes) {
        const file = createMockFile('test' + type);
        await expect(service.processFile(file))
          .rejects.toThrow('Unsupported file type');
      }
    });

    test('should enforce file size limits', async () => {
      const largeFile = createMockFile('large.pdf', 51 * 1024 * 1024); // 51MB
      
      await expect(service.processFile(largeFile))
        .rejects.toThrow('File size exceeds 50MB limit');
    });

    test('should scan for malicious content', async () => {
      const maliciousFile = testFiles.get('malicious.pdf');
      
      await expect(service.processFile(maliciousFile))
        .rejects.toThrow('Security threat detected');
    });
  });

  describe('Batch Processing', () => {
    test('should process multiple files concurrently', async () => {
      const files = [
        testFiles.get('doc1.pdf'),
        testFiles.get('doc2.docx'),
        testFiles.get('doc3.txt')
      ];
      
      const start = Date.now();
      const results = await service.processBatch(files);
      const duration = Date.now() - start;
      
      expect(results).toHaveLength(3);
      expect(duration).toBeLessThan(5000); // Concurrent, not sequential
    });

    test('should continue on individual failures', async () => {
      const files = [
        testFiles.get('valid.pdf'),
        testFiles.get('corrupt.pdf'),
        testFiles.get('valid.docx')
      ];
      
      const results = await service.processBatch(files);
      
      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('error');
      expect(results[2].status).toBe('success');
    });
  });
});
```

### 2. PDF Parser Tests
```typescript
// src/services/fileParsing/__tests__/pdfParser.test.ts

describe('PDFParser', () => {
  describe('Text Extraction', () => {
    test('should extract text from simple PDF', async () => {
      const pdf = await loadTestFile('simple-text.pdf');
      const result = await pdfParser.parse(pdf);
      
      expect(result.text).toContain('This is a simple PDF');
      expect(result.pageCount).toBe(1);
      expect(result.metadata.title).toBe('Simple Text Document');
    });

    test('should handle multi-page documents', async () => {
      const pdf = await loadTestFile('multi-page.pdf');
      const result = await pdfParser.parse(pdf);
      
      expect(result.pages).toHaveLength(10);
      expect(result.text).toContain('Page 1 content');
      expect(result.text).toContain('Page 10 content');
    });

    test('should extract from scanned PDFs (OCR)', async () => {
      const pdf = await loadTestFile('scanned-document.pdf');
      const result = await pdfParser.parse(pdf);
      
      expect(result.wasOCR).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.text).toContain('Scanned text content');
    });

    test('should handle encrypted PDFs', async () => {
      const pdf = await loadTestFile('encrypted.pdf');
      
      // Without password
      await expect(pdfParser.parse(pdf))
        .rejects.toThrow('PDF is password protected');
      
      // With password
      const result = await pdfParser.parse(pdf, { password: 'test123' });
      expect(result.text).toBeDefined();
    });
  });

  describe('Content Structure', () => {
    test('should preserve formatting', async () => {
      const pdf = await loadTestFile('formatted.pdf');
      const result = await pdfParser.parse(pdf);
      
      expect(result.structure).toMatchObject({
        headings: ['Chapter 1', 'Section 1.1'],
        lists: expect.arrayContaining([
          { type: 'bullet', items: expect.any(Array) }
        ]),
        tables: expect.arrayContaining([
          { rows: expect.any(Number), cols: expect.any(Number) }
        ])
      });
    });

    test('should extract embedded images', async () => {
      const pdf = await loadTestFile('with-images.pdf');
      const result = await pdfParser.parse(pdf, { extractImages: true });
      
      expect(result.images).toHaveLength(3);
      expect(result.images[0]).toMatchObject({
        page: 1,
        data: expect.any(Buffer),
        mimeType: 'image/jpeg'
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle corrupt PDFs gracefully', async () => {
      const corrupt = await loadTestFile('corrupt.pdf');
      const result = await pdfParser.parse(corrupt);
      
      expect(result.status).toBe('partial');
      expect(result.errors).toContain('Page 3 could not be parsed');
      expect(result.text).toContain('Page 1'); // Partial success
    });

    test('should handle memory efficiently for large PDFs', async () => {
      const largePDF = await loadTestFile('large-100mb.pdf');
      const initialMemory = process.memoryUsage().heapUsed;
      
      const result = await pdfParser.parse(largePDF, { 
        streaming: true,
        maxMemory: 100 * 1024 * 1024 // 100MB limit
      });
      
      const peakMemory = process.memoryUsage().heapUsed;
      expect(peakMemory - initialMemory).toBeLessThan(150 * 1024 * 1024);
      expect(result.chunks).toBeDefined(); // Chunked output
    });
  });
});
```

### 3. DOCX Parser Tests
```typescript
// src/services/fileParsing/__tests__/docxParser.test.ts

describe('DOCXParser', () => {
  describe('Document Parsing', () => {
    test('should extract text with formatting', async () => {
      const docx = await loadTestFile('formatted.docx');
      const result = await docxParser.parse(docx);
      
      expect(result.content).toMatchObject({
        paragraphs: expect.any(Array),
        headings: expect.any(Array),
        lists: expect.any(Array),
        tables: expect.any(Array)
      });
    });

    test('should preserve styles', async () => {
      const result = await docxParser.parse(testFiles.styled);
      
      expect(result.styles).toContain('bold');
      expect(result.styles).toContain('italic');
      expect(result.formattedText).toMatchObject({
        bold: ['Important text'],
        italic: ['Emphasized text'],
        underline: ['Underlined text']
      });
    });

    test('should extract comments and track changes', async () => {
      const docx = await loadTestFile('with-comments.docx');
      const result = await docxParser.parse(docx);
      
      expect(result.comments).toHaveLength(3);
      expect(result.comments[0]).toMatchObject({
        author: 'Teacher Name',
        text: 'Review this section',
        timestamp: expect.any(Date)
      });
      
      expect(result.revisions).toHaveLength(2);
    });

    test('should handle embedded objects', async () => {
      const docx = await loadTestFile('with-objects.docx');
      const result = await docxParser.parse(docx);
      
      expect(result.embeddedObjects).toMatchObject({
        images: expect.any(Array),
        charts: expect.any(Array),
        equations: expect.any(Array)
      });
    });
  });

  describe('Complex Documents', () => {
    test('should parse lesson plan template', async () => {
      const template = await loadTestFile('lesson-plan-template.docx');
      const result = await docxParser.parse(template);
      
      expect(result.fields).toMatchObject({
        title: expect.any(String),
        objectives: expect.any(Array),
        materials: expect.any(Array),
        activities: expect.any(Array)
      });
    });

    test('should handle forms and fields', async () => {
      const form = await loadTestFile('student-form.docx');
      const result = await docxParser.parse(form);
      
      expect(result.formFields).toContain('studentName');
      expect(result.formFields).toContain('grade');
      expect(result.checkboxes).toHaveLength(5);
    });
  });
});
```

### 4. CSV Parser Tests
```typescript
// src/services/fileParsing/__tests__/csvParser.test.ts

describe('CSVParser', () => {
  describe('Student Data Import', () => {
    test('should parse standard student roster', async () => {
      const csv = `Name,Email,Grade,Section
John Doe,john@school.com,3,A
Jane Smith,jane@school.com,3,B`;
      
      const result = await csvParser.parse(csv);
      
      expect(result.rows).toHaveLength(2);
      expect(result.headers).toEqual(['Name', 'Email', 'Grade', 'Section']);
      expect(result.data[0].Name).toBe('John Doe');
    });

    test('should handle various delimiters', async () => {
      const files = {
        comma: 'data,with,commas',
        tab: 'data\twith\ttabs',
        pipe: 'data|with|pipes'
      };
      
      for (const [delimiter, content] of Object.entries(files)) {
        const result = await csvParser.parse(content, { 
          delimiter: delimiter === 'tab' ? '\t' : delimiter === 'pipe' ? '|' : ','
        });
        expect(result.headers).toHaveLength(3);
      }
    });

    test('should validate data types', async () => {
      const csv = `Name,Age,Grade,Score
John,eight,3,95.5
Jane,9,three,invalid`;
      
      const result = await csvParser.parse(csv, {
        schema: {
          Age: 'number',
          Grade: 'number',
          Score: 'number'
        }
      });
      
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0]).toMatchObject({
        row: 1,
        column: 'Age',
        value: 'eight',
        expected: 'number'
      });
    });

    test('should handle large files efficiently', async () => {
      const largeCSV = generateLargeCSV(100000); // 100k rows
      
      const result = await csvParser.parseStream(largeCSV, {
        chunkSize: 1000,
        onChunk: (chunk) => {
          expect(chunk.rows).toBeLessThanOrEqual(1000);
        }
      });
      
      expect(result.totalRows).toBe(100000);
      expect(result.memoryUsage).toBeLessThan(50 * 1024 * 1024); // <50MB
    });
  });

  describe('Grade Export', () => {
    test('should export grades in standard format', async () => {
      const grades = [
        { student: 'John', assignment: 'Quiz 1', score: 85 },
        { student: 'Jane', assignment: 'Quiz 1', score: 92 }
      ];
      
      const csv = await csvParser.export(grades);
      
      expect(csv).toContain('Student,Assignment,Score');
      expect(csv).toContain('John,Quiz 1,85');
    });

    test('should handle special characters', async () => {
      const data = [
        { name: 'O\'Brien, John', notes: 'Good "progress"' }
      ];
      
      const csv = await csvParser.export(data);
      
      expect(csv).toContain('"O\'Brien, John"');
      expect(csv).toContain('"Good ""progress"""');
    });
  });
});
```

### 5. Text Extractor Tests
```typescript
// src/services/fileParsing/__tests__/textExtractor.test.ts

describe('TextExtractor', () => {
  describe('Content Extraction', () => {
    test('should extract from multiple formats', async () => {
      const formats = ['pdf', 'docx', 'txt', 'rtf'];
      
      for (const format of formats) {
        const file = await loadTestFile(`sample.${format}`);
        const text = await textExtractor.extract(file);
        
        expect(text).toContain('Sample content');
        expect(text.length).toBeGreaterThan(0);
      }
    });

    test('should clean extracted text', async () => {
      const messy = 'Text  with   extra    spaces\n\n\nand lines';
      const cleaned = await textExtractor.clean(messy);
      
      expect(cleaned).toBe('Text with extra spaces\nand lines');
    });

    test('should detect language', async () => {
      const texts = {
        en: 'This is English text',
        es: 'Este es texto en español',
        fr: 'Ceci est un texte français'
      };
      
      for (const [lang, text] of Object.entries(texts)) {
        const detected = await textExtractor.detectLanguage(text);
        expect(detected.language).toBe(lang);
        expect(detected.confidence).toBeGreaterThan(0.9);
      }
    });
  });

  describe('Content Analysis', () => {
    test('should extract key phrases', async () => {
      const text = `Students will learn about photosynthesis. 
                    Photosynthesis is how plants make food.
                    The process of photosynthesis uses sunlight.`;
      
      const phrases = await textExtractor.extractKeyPhrases(text);
      
      expect(phrases).toContain('photosynthesis');
      expect(phrases).toContain('plants');
      expect(phrases).toContain('sunlight');
    });

    test('should identify document sections', async () => {
      const document = await loadTestFile('structured-doc.pdf');
      const sections = await textExtractor.identifySections(document);
      
      expect(sections).toMatchObject({
        introduction: expect.any(String),
        objectives: expect.any(Array),
        activities: expect.any(Array),
        assessment: expect.any(String)
      });
    });
  });
});
```

## Test File Repository

Create comprehensive test files:

```
test-fixtures/
├── pdf/
│   ├── simple.pdf (1 page, basic text)
│   ├── complex.pdf (tables, images, forms)
│   ├── scanned.pdf (requires OCR)
│   ├── encrypted.pdf (password: test123)
│   ├── corrupt.pdf (damaged file)
│   └── large.pdf (100MB, 500 pages)
├── docx/
│   ├── lesson-plan.docx
│   ├── student-roster.docx
│   ├── with-comments.docx
│   └── template.docx
├── csv/
│   ├── students.csv
│   ├── grades.csv
│   ├── attendance.csv
│   └── malformed.csv
└── edge-cases/
    ├── empty.pdf
    ├── password-protected.docx
    ├── macro-enabled.docm
    └── unicode-heavy.txt
```

## Memory and Performance Tests

```typescript
describe('Performance', () => {
  test('should not exceed memory limits', async () => {
    const monitor = new MemoryMonitor();
    monitor.start();
    
    await fileProcessor.processLargeFile('100mb.pdf');
    
    const peak = monitor.getPeakUsage();
    expect(peak).toBeLessThan(200 * 1024 * 1024); // 200MB max
  });

  test('should process files in parallel efficiently', async () => {
    const files = Array(10).fill('test.pdf');
    
    const start = Date.now();
    await Promise.all(files.map(f => fileProcessor.process(f)));
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(5000); // <5s for 10 files
  });
});
```

## Dependencies

### From TIA
- File system mocks
- Stream helpers
- Memory monitoring utilities

### You Provide
- File format validators
- Content extractors
- Parsing utilities

## Success Metrics

1. **Coverage**: 85% on all parsers
2. **Reliability**: Handle corrupt files gracefully
3. **Performance**: <5s for files up to 50MB
4. **Memory**: Never exceed 200MB heap
5. **Accuracy**: 95%+ text extraction accuracy

## Daily Checklist

- [ ] Test all supported formats
- [ ] Verify memory efficiency
- [ ] Test error scenarios
- [ ] Validate extraction accuracy
- [ ] Document format limitations

Remember: Teachers depend on reliable file processing. Poor parsing means lost lesson plans and corrupted student data.