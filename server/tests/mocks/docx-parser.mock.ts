/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DOCX Parser Mock
 */

import { jest } from '@jest/globals';

const mockDocxParser = {
  parseAsync: jest.fn().mockImplementation(async (buffer: Buffer | ArrayBuffer) => {
    return {
      text: 'Mock DOCX Content\nM1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1',
      paragraphs: [
        { text: 'Mock DOCX Content' },
        { text: 'M1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1' },
      ],
    };
  }),
};

export { mockDocxParser };
