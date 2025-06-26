/**
 * Optimized Service Mocks
 * Lightweight mocks for all services to speed up unit tests
 */

import { jest } from '@jest/globals';

// Mock all services as a catch-all
const createServiceMock = (serviceName: string) => {
  return new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        return jest.fn().mockResolvedValue(`Mocked ${serviceName}.${prop} response`);
      }
      return undefined;
    }
  });
};

// Export common service mocks
export const emailService = {
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  sendBulkEmails: jest.fn().mockResolvedValue({ sent: [], failed: [] }),
};

export const embeddingService = {
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  calculateSimilarity: jest.fn().mockReturnValue(0.85),
  findSimilarOutcomes: jest.fn().mockResolvedValue([]),
};

export const llmService = {
  generateContent: jest.fn().mockResolvedValue('Mocked AI content'),
  generateBilingualContent: jest.fn().mockResolvedValue({
    english: 'Mock English',
    french: 'Mock French',
  }),
};

export const clusteringService = {
  generateClusters: jest.fn().mockResolvedValue([]),
  clusterOutcomes: jest.fn().mockResolvedValue([]),
};

export const materialGenerator = {
  generateMaterial: jest.fn().mockResolvedValue('Mocked material'),
  generateBulkMaterials: jest.fn().mockResolvedValue([]),
};

export const aiPlanningAssistant = {
  generateLessonPlan: jest.fn().mockResolvedValue({ plan: 'Mocked plan' }),
  suggestActivities: jest.fn().mockResolvedValue([]),
  analyzeOutcomes: jest.fn().mockResolvedValue({ analysis: 'Mocked' }),
};

export const reportGeneratorService = {
  generateCurriculumCoverageReport: jest.fn().mockResolvedValue({
    totalExpectations: 0,
    coveredExpectations: 0,
    coveragePercentage: 0,
    coverageByStrand: {},
    uncoveredExpectations: [],
  }),
  generatePlanningProgressReport: jest.fn().mockResolvedValue({
    longRangePlans: { total: 0, complete: 0, percentage: 0 },
    unitPlans: { total: 0, complete: 0, percentage: 0 },
    lessonPlans: { total: 0, complete: 0, percentage: 0 },
    daybookEntries: { total: 0, withReflection: 0, percentage: 0 },
  }),
  generateLessonPlanReport: jest.fn().mockResolvedValue({
    lesson: {},
    coverageAnalysis: {},
    materialsUsed: [],
  }),
  generateSubstitutePlanReport: jest.fn().mockResolvedValue({
    title: '',
    classInfo: {},
    schedule: [],
    materials: [],
    emergencyInfo: {},
  }),
  generateUnitOverviewReport: jest.fn().mockResolvedValue({
    unit: {},
    expectationsCovered: [],
    lessonProgression: [],
    assessmentSummary: {},
  }),
};

// Default export for dynamic imports
export default createServiceMock;