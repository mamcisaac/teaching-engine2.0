import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PDFParser } from '../pdfParser';
import { createMockFile, MemoryMonitor } from '../../../../tests/utils/sharedTestUtils';
import fs from 'fs/promises';
import path from 'path';

describe('PDFParser', () => {
  let pdfParser: PDFParser;
  let mockPdfParse: jest.Mock;

  beforeEach(() => {
    mockPdfParse = jest.fn();
    pdfParser = new PDFParser({
      pdfParse: mockPdfParse
    });
    jest.clearAllMocks();
  });

  describe('Text Extraction', () => {
    test('should extract text from simple PDF', async () => {
      const mockPdfContent = {
        text: 'This is a simple PDF document with basic text content.',
        numpages: 1,
        info: {
          Title: 'Simple Text Document',
          Author: 'Test Author',
          CreationDate: new Date('2024-01-01')
        }
      };

      mockPdfParse.mockResolvedValue(mockPdfContent);

      const pdfBuffer = Buffer.from('mock pdf content');
      const result = await pdfParser.parse(pdfBuffer);

      expect(result).toMatchObject({
        text: 'This is a simple PDF document with basic text content.',
        pageCount: 1,
        metadata: {
          title: 'Simple Text Document',
          author: 'Test Author',
          creationDate: expect.any(Date)
        },
        status: 'success'
      });

      expect(mockPdfParse).toHaveBeenCalledWith(pdfBuffer);
    });

    test('should handle multi-page documents', async () => {
      const pages = Array(10).fill(null).map((_, i) => ({
        pageNumber: i + 1,
        text: `Page ${i + 1} content with various text and formatting.`
      }));

      const mockPdfContent = {
        text: pages.map(p => p.text).join('\n'),
        numpages: 10,
        pages
      };

      mockPdfParse.mockResolvedValue(mockPdfContent);

      const result = await pdfParser.parse(Buffer.from('multi-page pdf'));

      expect(result.pageCount).toBe(10);
      expect(result.pages).toHaveLength(10);
      expect(result.text).toContain('Page 1 content');
      expect(result.text).toContain('Page 10 content');
      
      result.pages.forEach((page, index) => {
        expect(page.pageNumber).toBe(index + 1);
        expect(page.text).toContain(`Page ${index + 1}`);
      });
    });

    test('should extract text from scanned PDFs using OCR', async () => {
      // Mock OCR functionality
      const mockOCR = jest.fn().mockResolvedValue({
        text: 'Scanned text content extracted via OCR',
        confidence: 0.85,
        language: 'en'
      });

      pdfParser.setOCRProvider(mockOCR);

      // PDF parse returns no text (scanned document)
      mockPdfParse.mockResolvedValue({
        text: '',
        numpages: 1,
        isScanned: true
      });

      const result = await pdfParser.parse(Buffer.from('scanned pdf'));

      expect(result).toMatchObject({
        text: 'Scanned text content extracted via OCR',
        wasOCR: true,
        confidence: 0.85,
        pageCount: 1
      });

      expect(mockOCR).toHaveBeenCalled();
    });

    test('should handle encrypted PDFs', async () => {
      mockPdfParse.mockRejectedValue({
        message: 'PDF is encrypted',
        needPassword: true
      });

      // Without password
      await expect(pdfParser.parse(Buffer.from('encrypted pdf')))
        .rejects.toThrow('PDF is password protected');

      // With correct password
      mockPdfParse.mockImplementation((buffer, options) => {
        if (options?.password === 'correct123') {
          return Promise.resolve({
            text: 'Decrypted content',
            numpages: 1
          });
        }
        throw new Error('Invalid password');
      });

      const result = await pdfParser.parse(
        Buffer.from('encrypted pdf'),
        { password: 'correct123' }
      );

      expect(result.text).toBe('Decrypted content');
      expect(result.wasEncrypted).toBe(true);
    });
  });

  describe('Content Structure Extraction', () => {
    test('should preserve document formatting and structure', async () => {
      const mockPdfContent = {
        text: 'Chapter 1: Introduction\n\nThis is the introduction.\n\nSection 1.1: Overview\n\nHere is the overview.',
        numpages: 1,
        structure: {
          headings: [
            { level: 1, text: 'Chapter 1: Introduction', page: 1 },
            { level: 2, text: 'Section 1.1: Overview', page: 1 }
          ],
          paragraphs: [
            { text: 'This is the introduction.', page: 1 },
            { text: 'Here is the overview.', page: 1 }
          ]
        }
      };

      mockPdfParse.mockResolvedValue(mockPdfContent);

      const result = await pdfParser.parse(Buffer.from('structured pdf'));

      expect(result.structure).toMatchObject({
        headings: [
          { level: 1, text: 'Chapter 1: Introduction', page: 1 },
          { level: 2, text: 'Section 1.1: Overview', page: 1 }
        ],
        paragraphs: expect.any(Array)
      });
    });

    test('should extract tables from PDF', async () => {
      const mockPdfContent = {
        text: 'Table content',
        tables: [
          {
            page: 1,
            rows: 3,
            cols: 4,
            data: [
              ['Header 1', 'Header 2', 'Header 3', 'Header 4'],
              ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4'],
              ['Cell 5', 'Cell 6', 'Cell 7', 'Cell 8']
            ]
          }
        ]
      };

      mockPdfParse.mockResolvedValue(mockPdfContent);

      const result = await pdfParser.parse(Buffer.from('pdf with tables'));

      expect(result.tables).toHaveLength(1);
      expect(result.tables[0]).toMatchObject({
        page: 1,
        rows: 3,
        cols: 4,
        data: expect.any(Array)
      });
    });

    test('should extract lists and bullet points', async () => {
      const mockPdfContent = {
        text: 'List content',
        lists: [
          {
            type: 'bullet',
            page: 1,
            items: [
              'First bullet point',
              'Second bullet point',
              'Third bullet point'
            ]
          },
          {
            type: 'numbered',
            page: 2,
            items: [
              '1. First numbered item',
              '2. Second numbered item',
              '3. Third numbered item'
            ]
          }
        ]
      };

      mockPdfParse.mockResolvedValue(mockPdfContent);

      const result = await pdfParser.parse(Buffer.from('pdf with lists'));

      expect(result.lists).toHaveLength(2);
      expect(result.lists[0].type).toBe('bullet');
      expect(result.lists[1].type).toBe('numbered');
    });

    test('should extract embedded images', async () => {
      const mockPdfContent = {
        text: 'Document with images',
        images: [
          {
            page: 1,
            index: 0,
            width: 200,
            height: 150,
            data: Buffer.from('image data'),
            mimeType: 'image/jpeg'
          },
          {
            page: 2,
            index: 1,
            width: 300,
            height: 200,
            data: Buffer.from('image data 2'),
            mimeType: 'image/png'
          }
        ]
      };

      mockPdfParse.mockResolvedValue(mockPdfContent);

      const result = await pdfParser.parse(
        Buffer.from('pdf with images'),
        { extractImages: true }
      );

      expect(result.images).toHaveLength(2);
      expect(result.images[0]).toMatchObject({
        page: 1,
        width: 200,
        height: 150,
        mimeType: 'image/jpeg'
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle corrupt PDFs gracefully', async () => {
      mockPdfParse.mockImplementation(() => {
        // Simulate partial success
        return {
          text: 'Page 1 content successfully extracted',
          numpages: 3,
          pages: [
            { pageNumber: 1, text: 'Page 1 content successfully extracted' },
            { pageNumber: 2, text: '', error: 'Page corrupted' },
            { pageNumber: 3, text: 'Page 3 content successfully extracted' }
          ]
        };
      });

      const result = await pdfParser.parse(Buffer.from('corrupt pdf'));

      expect(result.status).toBe('partial');
      expect(result.errors).toContain('Page 2 could not be parsed');
      expect(result.text).toContain('Page 1 content');
      expect(result.text).toContain('Page 3 content');
      expect(result.pageCount).toBe(3);
      expect(result.successfulPages).toBe(2);
    });

    test('should handle completely unreadable PDFs', async () => {
      mockPdfParse.mockRejectedValue(new Error('Invalid PDF structure'));

      await expect(pdfParser.parse(Buffer.from('invalid pdf')))
        .rejects.toThrow('Failed to parse PDF: Invalid PDF structure');
    });

    test('should validate PDF headers', async () => {
      const invalidBuffer = Buffer.from('Not a PDF file');

      const result = await pdfParser.parse(invalidBuffer);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid PDF format');
    });
  });

  describe('Memory and Performance', () => {
    test('should handle large PDFs efficiently with streaming', async () => {
      const memoryMonitor = new MemoryMonitor();
      memoryMonitor.start();

      // Mock a large PDF (100MB)
      const largePdfSize = 100 * 1024 * 1024;
      const largePdfBuffer = Buffer.alloc(largePdfSize);

      // Mock streaming parse
      let chunksProcessed = 0;
      mockPdfParse.mockImplementation(async (buffer, options) => {
        if (options?.streaming) {
          // Simulate chunked processing
          const chunks = [];
          const chunkSize = 10 * 1024 * 1024; // 10MB chunks
          
          for (let i = 0; i < buffer.length; i += chunkSize) {
            chunks.push({
              text: `Chunk ${++chunksProcessed} content`,
              startByte: i,
              endByte: Math.min(i + chunkSize, buffer.length)
            });
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 10));
          }

          return {
            chunks,
            text: chunks.map(c => c.text).join('\n'),
            numpages: 500
          };
        }
        
        throw new Error('Out of memory');
      });

      const result = await pdfParser.parse(largePdfBuffer, {
        streaming: true,
        maxMemory: 100 * 1024 * 1024 // 100MB limit
      });

      memoryMonitor.stop();

      expect(result.chunks).toBeDefined();
      expect(result.chunks.length).toBe(10); // 100MB / 10MB
      expect(memoryMonitor.getPeakUsage()).toBeLessThan(150 * 1024 * 1024);
    });

    test('should optimize memory for image extraction', async () => {
      const mockPdfWithLargeImages = {
        text: 'Document text',
        images: Array(50).fill(null).map((_, i) => ({
          page: Math.floor(i / 10) + 1,
          data: Buffer.alloc(5 * 1024 * 1024), // 5MB each
          mimeType: 'image/jpeg'
        }))
      };

      mockPdfParse.mockResolvedValue(mockPdfWithLargeImages);

      const result = await pdfParser.parse(
        Buffer.from('pdf with many images'),
        {
          extractImages: true,
          imageOptions: {
            maxSize: 1024 * 1024, // 1MB max per image
            quality: 80,
            format: 'jpeg'
          }
        }
      );

      // Should compress images
      result.images.forEach(img => {
        expect(img.data.length).toBeLessThanOrEqual(1024 * 1024);
      });
    });

    test('should handle concurrent parsing efficiently', async () => {
      mockPdfParse.mockResolvedValue({
        text: 'Concurrent parse result',
        numpages: 1
      });

      const startTime = Date.now();
      
      // Parse 10 PDFs concurrently
      const promises = Array(10).fill(null).map(() => 
        pdfParser.parse(Buffer.from('test pdf'))
      );

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
      
      // Verify all successful
      results.forEach(result => {
        expect(result.status).toBe('success');
        expect(result.text).toBe('Concurrent parse result');
      });
    });
  });

  describe('Educational Content Detection', () => {
    test('should identify lesson plan PDFs', async () => {
      const lessonPlanContent = {
        text: `Lesson Plan: Introduction to Fractions
        Grade: 3
        Duration: 45 minutes
        Objectives:
        - Students will understand fractions
        - Students will identify parts of a whole
        
        Materials: Fraction circles, worksheets
        
        Activities:
        1. Introduction (10 min)
        2. Hands-on practice (20 min)
        3. Assessment (15 min)`,
        metadata: {
          title: 'Grade 3 Math Lesson Plan'
        }
      };

      mockPdfParse.mockResolvedValue(lessonPlanContent);

      const result = await pdfParser.parse(Buffer.from('lesson plan pdf'));

      expect(result.documentType).toBe('lesson_plan');
      expect(result.educationalMetadata).toMatchObject({
        grade: '3',
        subject: 'Math',
        duration: 45,
        hasObjectives: true,
        hasActivities: true,
        hasMaterials: true
      });
    });

    test('should extract curriculum standards', async () => {
      const curriculumContent = {
        text: `Mathematics Standards
        
        3.NF.1: Understand a fraction 1/b as the quantity formed by 1 part
        3.NF.2: Understand a fraction as a number on the number line
        3.NF.3: Explain equivalence of fractions`,
        structure: {
          standards: [
            { code: '3.NF.1', description: 'Understand a fraction 1/b...' },
            { code: '3.NF.2', description: 'Understand a fraction as...' },
            { code: '3.NF.3', description: 'Explain equivalence...' }
          ]
        }
      };

      mockPdfParse.mockResolvedValue(curriculumContent);

      const result = await pdfParser.parse(Buffer.from('curriculum pdf'));

      expect(result.standards).toHaveLength(3);
      expect(result.standards[0].code).toBe('3.NF.1');
    });

    test('should detect student worksheets', async () => {
      const worksheetContent = {
        text: `Name: _____________ Date: _____________
        
        Fraction Worksheet
        
        1. Circle 3/4 of the shapes: ○○○○
        2. Write the fraction: [  ]/[  ]
        3. Draw 2/3 of a pizza:`,
        hasFormFields: true,
        formFields: [
          { name: 'student_name', type: 'text' },
          { name: 'date', type: 'text' },
          { name: 'answer_1', type: 'checkbox' },
          { name: 'answer_2', type: 'text' }
        ]
      };

      mockPdfParse.mockResolvedValue(worksheetContent);

      const result = await pdfParser.parse(Buffer.from('worksheet pdf'));

      expect(result.documentType).toBe('worksheet');
      expect(result.hasFormFields).toBe(true);
      expect(result.isInteractive).toBe(true);
      expect(result.formFields).toHaveLength(4);
    });
  });
});