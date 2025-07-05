/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * File Parsing Mock Setup - ONLY for binary format parsers
 *
 * These mocks are necessary because:
 * 1. PDF/DOCX parsing requires binary format handling not available in Node.js test environment
 * 2. These libraries often have native dependencies that don't work in test environments
 * 
 * For TDD compliance:
 * - These mocks should return realistic data structures
 * - Tests should also be written to handle real file parsing when possible
 * - Consider integration tests that use real files and parsers
 * 
 * CONDITIONAL MOCKING:
 * - Only mock when USE_REAL_FILE_PARSERS !== 'true'
 * - Support both mocked and real file parsing modes
 * - Real file operations use actual temporary files
 */

import { jest } from '@jest/globals';

// Only mock if not explicitly using real parsers or real file operations
const useRealParsers = process.env.USE_REAL_FILE_PARSERS === 'true';
const useRealFiles = process.env.USE_REAL_FILE_OPERATIONS === 'true';
const disableMocks = process.env.DISABLE_FS_MOCKS === 'true';

if (!useRealParsers && !useRealFiles && !disableMocks) {
  console.log('📝 Using mocked file parsers (set USE_REAL_FILE_PARSERS=true for real parsing)');
} else {
  console.log('🔧 Using real file parsers and operations');
}

// Only setup mocks when not using real implementations
if (!useRealParsers && !useRealFiles && !disableMocks) {
  // Mock pdf-parse - binary PDF parsing not available in test environment
  jest.mock('pdf-parse', () => {
    return jest.fn().mockImplementation(async (buffer: Buffer | Uint8Array) => {
      // Return realistic PDF parsing result structure
      return {
        numpages: 1,
        numrender: 1,
        info: {
          PDFFormatVersion: '1.4',
          Title: 'Test PDF Document',
          CreationDate: new Date(),
          ModDate: new Date(),
        },
        metadata: null,
        version: '1.4',
        text: 'PDF content would be extracted here',
      };
    });
  });

  // Mock mammoth - DOCX binary parsing
  jest.mock('mammoth', () => ({
    __esModule: true,
    extractRawText: jest.fn().mockImplementation(async (options: { buffer: Buffer }) => ({
      value: 'DOCX content would be extracted here',
      messages: [],
    })),
    convertToHtml: jest.fn().mockImplementation(async (options: { buffer: Buffer }) => ({
      value: '<p>DOCX HTML content would be here</p>',
      messages: [],
    })),
  }));
} else {
  // When using real file operations, don't mock anything
  console.log('✅ File parsing mocks disabled - using real implementations');
}

/**
 * NOTE: These mocks are minimal and only for binary format parsing.
 * 
 * Tests should:
 * 1. Use real parsers when possible (integration tests)
 * 2. Mock parsing results explicitly in unit tests
 * 3. Not rely on global mock data - provide test-specific data
 * 4. Use FileSystemTestUtils for real file operations when enabled
 * 
 * REAL FILE TESTING:
 * - Set USE_REAL_FILE_OPERATIONS=true for actual file I/O
 * - Set USE_REAL_FILE_PARSERS=true for actual PDF/DOCX parsing
 * - Use jest.real-files.config.js for comprehensive real file testing
 */