/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * File Parsing Library Mocks
 *
 * Provides stable mocking for PDF and DOCX parsing libraries to prevent
 * "pdf is not a function" and similar errors in tests.
 */

import { jest } from '@jest/globals';

/**
 * Mock PDF Parse Library
 */
export const mockPdfParse = jest.fn().mockImplementation(async (buffer: Buffer | Uint8Array) => {
  // Simulate successful PDF parsing
  return {
    numpages: 1,
    numrender: 1,
    info: {
      PDFFormatVersion: '1.4',
      IsAcroFormPresent: false,
      IsXFAPresent: false,
      Title: 'Mock PDF Document',
      Author: 'Test Author',
      Creator: 'Test Creator',
      Producer: 'Test Producer',
      CreationDate: new Date(),
      ModDate: new Date(),
    },
    metadata: null,
    version: '1.4',
    text: `Mock PDF Content
Curriculum Expectations:
M1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1
M1.2 Represent and compare whole numbers to 50 - Mathematics Grade 1
L1.1 Listen actively and respond appropriately - Language Grade 1`,
  };
});

/**
 * Mock DOCX Parser
 */
export const mockDocxParser = {
  parseAsync: jest.fn().mockImplementation(async (buffer: Buffer | ArrayBuffer) => {
    return {
      paragraphs: [
        { text: 'Mock DOCX Content' },
        { text: 'Curriculum Expectations:' },
        { text: 'M1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1' },
        { text: 'M1.2 Represent and compare whole numbers to 50 - Mathematics Grade 1' },
        { text: 'L1.1 Listen actively and respond appropriately - Language Grade 1' },
      ],
      text: 'Mock DOCX Content\nCurriculum Expectations:\nM1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1\nM1.2 Represent and compare whole numbers to 50 - Mathematics Grade 1\nL1.1 Listen actively and respond appropriately - Language Grade 1',
    };
  }),
};

/**
 * Mock Mammoth (DOCX to HTML converter)
 */
export const mockMammoth = {
  extractRawText: jest.fn().mockImplementation(async (options: any) => {
    return {
      value:
        'Mock DOCX Content\nCurriculum Expectations:\nM1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1\nM1.2 Represent and compare whole numbers to 50 - Mathematics Grade 1\nL1.1 Listen actively and respond appropriately - Language Grade 1',
      messages: [],
    };
  }),
  convertToHtml: jest.fn().mockImplementation(async (options: any) => {
    return {
      value:
        '<p>Mock DOCX Content</p><p>Curriculum Expectations:</p><p>M1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1</p><p>M1.2 Represent and compare whole numbers to 50 - Mathematics Grade 1</p><p>L1.1 Listen actively and respond appropriately - Language Grade 1</p>',
      messages: [],
    };
  }),
};

/**
 * Mock Office Parser
 */
export const mockOfficeParser = {
  parseOfficeAsync: jest.fn().mockImplementation(async (buffer: Buffer | ArrayBuffer) => {
    return 'Mock Office Document Content\nCurriculum Expectations:\nM1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1\nM1.2 Represent and compare whole numbers to 50 - Mathematics Grade 1\nL1.1 Listen actively and respond appropriately - Language Grade 1';
  }),
};

/**
 * Helper to reset all file parsing mocks
 */
export const resetFileParsingMocks = () => {
  mockPdfParse.mockClear();
  mockDocxParser.parseAsync.mockClear();
  mockMammoth.extractRawText.mockClear();
  mockMammoth.convertToHtml.mockClear();
  mockOfficeParser.parseOfficeAsync.mockClear();
};

/**
 * Helper to setup file parsing errors for testing
 */
export const setupFileParsingError = (
  library: 'pdf' | 'docx' | 'mammoth' | 'office',
  error: Error,
) => {
  switch (library) {
    case 'pdf':
      mockPdfParse.mockRejectedValueOnce(error);
      break;
    case 'docx':
      mockDocxParser.parseAsync.mockRejectedValueOnce(error);
      break;
    case 'mammoth':
      mockMammoth.extractRawText.mockRejectedValueOnce(error);
      mockMammoth.convertToHtml.mockRejectedValueOnce(error);
      break;
    case 'office':
      mockOfficeParser.parseOfficeAsync.mockRejectedValueOnce(error);
      break;
  }
};

/**
 * Helper to create mock file buffers for testing
 */
export const createMockFileBuffer = (type: 'pdf' | 'docx' | 'txt', content?: string): Buffer => {
  const defaultContent = content || 'Mock file content for testing';

  switch (type) {
    case 'pdf':
      // Simplified PDF header
      return Buffer.from(
        `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n${defaultContent}`,
      );
    case 'docx':
      // Simplified DOCX structure (ZIP with XML)
      return Buffer.from(defaultContent);
    case 'txt':
      return Buffer.from(defaultContent, 'utf-8');
    default:
      return Buffer.from(defaultContent, 'utf-8');
  }
};

/**
 * Export all mocks for module mocking
 */
// Export as default for pdf-parse module\nexport default mockPdfParse;\n\n// Named exports for mammoth module\nexport const extractRawText = mockMammoth.extractRawText;\nexport const convertToHtml = mockMammoth.convertToHtml;\n\n// Named exports for docx-parser\nexport const parseAsync = mockDocxParser.parseAsync;\n\n// Named exports for office-text-extractor\nexport const parseOfficeAsync = mockOfficeParser.parseOfficeAsync;\n\n/**\n * Export all mocks for test utility access\n */\nexport const fileParsing = {\n  pdfParse: mockPdfParse,\n  docxParser: mockDocxParser,\n  mammoth: mockMammoth,\n  officeParser: mockOfficeParser,\n  reset: resetFileParsingMocks,\n  setupError: setupFileParsingError,\n  createBuffer: createMockFileBuffer,\n};
