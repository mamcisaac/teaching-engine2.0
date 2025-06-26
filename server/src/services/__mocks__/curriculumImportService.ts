import { jest } from '@jest/globals';

export class CurriculumImportService {
  startImport = jest.fn();
  parseCSV = jest.fn();
  processImport = jest.fn();
  getImportProgress = jest.fn();
  cancelImport = jest.fn();
  getImportHistory = jest.fn();
  importCurriculum = jest.fn();
  parseCurriculumData = jest.fn();
  validateImportData = jest.fn();
  processImportChunk = jest.fn();
  getImportStatus = jest.fn();
  getImportDetails = jest.fn();
  deleteImport = jest.fn();
  storeUploadedFile = jest.fn();
  parseUploadedFile = jest.fn();
  loadPresetCurriculum = jest.fn();
  confirmImport = jest.fn();
  finalizeImport = jest.fn();
}

export const curriculumImportService = new CurriculumImportService();
