import { jest } from '@jest/globals';

export class ReportGeneratorService {
  generateCurriculumCoverageReport = jest.fn();
  generatePlanningProgressReport = jest.fn();
  generateLessonPlanReport = jest.fn();
  generateSubstitutePlanReport = jest.fn();
  generateUnitOverviewReport = jest.fn();
  generateProgressReport = jest.fn();
  calculateProgressStatistics = jest.fn();
  generateProgressChart = jest.fn();
  generatePDF = jest.fn();
  exportReport = jest.fn();
  markImportAsFailed = jest.fn();
}

export const reportGeneratorService = new ReportGeneratorService();