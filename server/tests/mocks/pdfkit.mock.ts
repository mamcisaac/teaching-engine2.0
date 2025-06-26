/**
 * PDFKit Mock
 * Lightweight mock for pdfkit package
 */

import { jest } from '@jest/globals';

class MockPDFDocument {
  pipe = jest.fn().mockReturnThis();
  fontSize = jest.fn().mockReturnThis();
  font = jest.fn().mockReturnThis();
  text = jest.fn().mockReturnThis();
  image = jest.fn().mockReturnThis();
  addPage = jest.fn().mockReturnThis();
  save = jest.fn().mockReturnThis();
  restore = jest.fn().mockReturnThis();
  end = jest.fn();
  
  on = jest.fn((event, callback) => {
    if (event === 'end') {
      setTimeout(callback, 0);
    }
    return this;
  });
}

export default MockPDFDocument;