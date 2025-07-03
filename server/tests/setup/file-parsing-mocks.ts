/**
 * File Parsing Mock Setup
 *
 * This file sets up the file parsing mocks for all tests
 */

import { jest } from '@jest/globals';

// Mock pdf-parse
jest.mock('pdf-parse', () => {
  return jest.fn().mockImplementation(async (buffer: Buffer | Uint8Array) => {
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
});

// Mock docx-parser
jest.mock('docx-parser', () => ({
  __esModule: true,
  default: {
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
  },
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
}));

// Mock mammoth
jest.mock('mammoth', () => ({
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
}));

// Export for tests that need direct access
export {};
