/**
 * TypeScript mock for pdf-parse
 */
const pdfParse = async (buffer: Buffer) => {
  // Return empty text for empty buffer to test error handling
  if (!buffer || buffer.length === 0) {
    return {
      numpages: 0,
      numrender: 0,
      info: {
        PDFFormatVersion: '1.4',
        IsAcroFormPresent: false,
        IsXFAPresent: false,
      },
      metadata: null,
      version: '1.10.100',
      text: '',
    };
  }

  // Return short text for small buffer
  if (buffer.length < 100) {
    return {
      numpages: 1,
      numrender: 1,
      info: {
        PDFFormatVersion: '1.4',
        IsAcroFormPresent: false,
        IsXFAPresent: false,
      },
      metadata: null,
      version: '1.10.100',
      text: 'Too short',
    };
  }

  // Return realistic curriculum content for normal buffers
  return {
    numpages: 10,
    numrender: 10,
    info: {
      PDFFormatVersion: '1.4',
      IsAcroFormPresent: false,
      IsXFAPresent: false,
      Title: 'Ontario Curriculum - Mathematics Grade 1',
      Subject: 'Curriculum',
      Author: 'Ministry of Education',
    },
    metadata: null,
    version: '1.10.100',
    text: `Ontario Curriculum - Mathematics Grade 1
    
Overall Expectations

A. Number Sense and Numeration
A1. Demonstrate an understanding of numbers and make connections to the way numbers are used in everyday life

Specific Expectations

