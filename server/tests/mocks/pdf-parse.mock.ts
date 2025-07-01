/**
 * PDF Parse Mock
 */

import { jest } from '@jest/globals';

const mockPdfParse = jest.fn().mockImplementation(async (buffer: Buffer | Uint8Array) => {
  return {
    numpages: 1,
    numrender: 1,
    info: {
      PDFFormatVersion: '1.4',
      Title: 'Mock PDF Document',
    },
    text: 'Mock PDF Content\nCurriculum Expectations:\nM1.1 Count to 100 by 1s, 2s, 5s, and 10s - Mathematics Grade 1',
  };
});

export default mockPdfParse;
