/**
 * Mammoth Mock
 */

import { jest } from '@jest/globals';

export const extractRawText = jest.fn().mockImplementation(async (options: any) => {
  return {
    value:
      'Mock DOCX Content\nCurriculum Expectations:\nM1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1',
    messages: [],
  };
});

export const convertToHtml = jest.fn().mockImplementation(async (options: any) => {
  return {
    value:
      '<p>Mock DOCX Content</p><p>M1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1</p>',
    messages: [],
  };
});

// Default export for compatibility
export default {
  extractRawText,
  convertToHtml,
};
