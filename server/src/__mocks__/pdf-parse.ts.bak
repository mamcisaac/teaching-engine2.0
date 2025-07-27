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

A1.1 Read, represent, compare, and order whole numbers to 50, and use concrete materials to represent fractions and money amounts to 100¢
A1.2 Demonstrate an understanding of magnitude by counting forward to 100 and backwards from 20
A1.3 Solve problems involving the addition and subtraction of single-digit whole numbers, using a variety of strategies

B. Measurement
B1. Demonstrate an understanding of the length, weight, capacity, area, and temperature

Specific Expectations

B1.1 Estimate, measure, and describe length, area, mass, capacity, time, and temperature, using non-standard units
B1.2 Compare and order objects by their linear measurements, using the same non-standard unit

This curriculum document contains many more expectations across different strands including Geometry, Patterning, and Data Management.`,
  };
};

export { pdfParse };
