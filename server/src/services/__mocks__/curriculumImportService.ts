import { jest } from '@jest/globals';

export class CurriculumImportService {
  importCurriculum = jest.fn();
  parseCurriculumData = jest.fn();
  validateImportData = jest.fn();
  processImportChunk = jest.fn();
  getImportStatus = jest.fn();
  getImportDetails = jest.fn();
  cancelImport = jest.fn();
  deleteImport = jest.fn();
}

export const curriculumImportService = new CurriculumImportService();
