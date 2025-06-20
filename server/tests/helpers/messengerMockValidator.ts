/**
 * Mock Validator for Messenger Agent
 * 
 * This utility helps ensure that mocks used in unit tests
 * match the actual API behavior verified in integration tests.
 */

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  contentFr: string;
  contentEn: string;
  variables: string; // JSON string
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReport {
  studentName: string;
  period: string;
  sections: ReportSection[];
  overallComments: string;
  nextSteps: string[];
}

export interface ReportSection {
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

export interface BulkEmailResponse {
  results: EmailDeliveryResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface EmailDeliveryResult {
  email: string;
  status: 'sent' | 'failed' | 'pending';
  messageId?: string;
  error?: string;
  timestamp: string;
}

export interface DeliveryStatusResponse {
  recent: EmailDeliveryResult[];
  summary: {
    last24Hours: number;
    last7Days: number;
    totalSent: number;
    averageDeliveryTime: number;
  };
}

/**
 * Validates that a mock EmailTemplate matches the real API structure
 */
export function validateEmailTemplateMock(mock: unknown): asserts mock is EmailTemplate {
  const requiredFields = ['id', 'name', 'subject', 'contentFr', 'contentEn', 'variables', 'userId', 'createdAt', 'updatedAt'];
  
  for (const field of requiredFields) {
    if (!(field in mock)) {
      throw new Error(`Mock EmailTemplate missing required field: ${field}`);
    }
  }

  if (typeof mock.id !== 'number') {
    throw new Error('EmailTemplate.id must be a number');
  }

  if (typeof mock.name !== 'string' || mock.name.length === 0) {
    throw new Error('EmailTemplate.name must be a non-empty string');
  }

  if (typeof mock.subject !== 'string') {
    throw new Error('EmailTemplate.subject must be a string');
  }

  if (typeof mock.variables === 'string') {
    try {
      JSON.parse(mock.variables);
    } catch {
      throw new Error('EmailTemplate.variables must be a valid JSON string');
    }
  } else {
    throw new Error('EmailTemplate.variables must be a JSON string');
  }
}

/**
 * Validates that a mock GeneratedReport matches the real API structure
 */
export function validateGeneratedReportMock(mock: unknown): asserts mock is GeneratedReport {
  const requiredFields = ['studentName', 'period', 'sections', 'overallComments', 'nextSteps'];
  
  for (const field of requiredFields) {
    if (!(field in mock)) {
      throw new Error(`Mock GeneratedReport missing required field: ${field}`);
    }
  }

  if (typeof mock.studentName !== 'string' || mock.studentName.length === 0) {
    throw new Error('GeneratedReport.studentName must be a non-empty string');
  }

  if (!Array.isArray(mock.sections)) {
    throw new Error('GeneratedReport.sections must be an array');
  }

  if (!Array.isArray(mock.nextSteps)) {
    throw new Error('GeneratedReport.nextSteps must be an array');
  }

  // Validate each section
  mock.sections.forEach((section: unknown, index: number) => {
    if (!section.title || typeof section.title !== 'string') {
      throw new Error(`GeneratedReport.sections[${index}].title must be a non-empty string`);
    }
    if (!section.content || typeof section.content !== 'string') {
      throw new Error(`GeneratedReport.sections[${index}].content must be a non-empty string`);
    }
  });
}

/**
 * Validates that a mock BulkEmailResponse matches the real API structure
 */
export function validateBulkEmailResponseMock(mock: unknown): asserts mock is BulkEmailResponse {
  if (!mock.results || !Array.isArray(mock.results)) {
    throw new Error('BulkEmailResponse.results must be an array');
  }

  if (!mock.summary || typeof mock.summary !== 'object') {
    throw new Error('BulkEmailResponse.summary must be an object');
  }

  const summaryFields = ['total', 'successful', 'failed'];
  for (const field of summaryFields) {
    if (typeof mock.summary[field] !== 'number') {
      throw new Error(`BulkEmailResponse.summary.${field} must be a number`);
    }
  }

  // Validate each result
  mock.results.forEach((result: unknown, index: number) => {
    if (!result.email || typeof result.email !== 'string') {
      throw new Error(`BulkEmailResponse.results[${index}].email must be a string`);
    }
    if (!['sent', 'failed', 'pending'].includes(result.status)) {
      throw new Error(`BulkEmailResponse.results[${index}].status must be 'sent', 'failed', or 'pending'`);
    }
    if (!result.timestamp || typeof result.timestamp !== 'string') {
      throw new Error(`BulkEmailResponse.results[${index}].timestamp must be a string`);
    }
  });

  // Validate summary matches results
  const totalResults = mock.results.length;
  const successfulResults = mock.results.filter((r: Record<string, unknown>) => r.status === 'sent').length;
  const failedResults = mock.results.filter((r: Record<string, unknown>) => r.status === 'failed').length;

  if (mock.summary.total !== totalResults) {
    throw new Error(`BulkEmailResponse.summary.total (${mock.summary.total}) doesn't match results length (${totalResults})`);
  }

  if (mock.summary.successful !== successfulResults) {
    throw new Error(`BulkEmailResponse.summary.successful (${mock.summary.successful}) doesn't match successful results count (${successfulResults})`);
  }

  if (mock.summary.failed !== failedResults) {
    throw new Error(`BulkEmailResponse.summary.failed (${mock.summary.failed}) doesn't match failed results count (${failedResults})`);
  }
}

/**
 * Creates a valid mock EmailTemplate for testing
 */
export function createMockEmailTemplate(overrides: Partial<EmailTemplate> = {}): EmailTemplate {
  const baseTemplate: EmailTemplate = {
    id: 1,
    name: 'Mock Newsletter Template',
    subject: 'Weekly Update - {studentName}',
    contentFr: 'Bonjour {parentName}, voici les nouvelles de {studentName}...',
    contentEn: 'Hello {parentName}, here are the updates for {studentName}...',
    variables: JSON.stringify(['parentName', 'studentName', 'weekDate']),
    userId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };

  validateEmailTemplateMock(baseTemplate);
  return baseTemplate;
}

/**
 * Creates a valid mock GeneratedReport for testing
 */
export function createMockGeneratedReport(overrides: Partial<GeneratedReport> = {}): GeneratedReport {
  const baseReport: GeneratedReport = {
    studentName: 'Mock Student',
    period: '2024-01-01 - 2024-01-31',
    sections: [
      {
        title: 'Academic Progress',
        content: 'The student has shown good progress in all areas...',
        data: { averageScore: 85 }
      },
      {
        title: 'Goals',
        content: 'Working towards achieving set learning objectives...'
      }
    ],
    overallComments: 'Overall, the student is performing well and making steady progress.',
    nextSteps: [
      'Continue practicing reading comprehension',
      'Focus on math problem-solving strategies',
      'Develop creative writing skills'
    ],
    ...overrides
  };

  validateGeneratedReportMock(baseReport);
  return baseReport;
}

/**
 * Creates a valid mock BulkEmailResponse for testing
 */
export function createMockBulkEmailResponse(
  recipientCount: number = 2,
  successfulCount?: number,
  failedCount?: number
): BulkEmailResponse {
  const actualSuccessful = successfulCount ?? Math.floor(recipientCount * 0.8);
  const actualFailed = failedCount ?? (recipientCount - actualSuccessful);
  
  const results: EmailDeliveryResult[] = [];
  
  // Add successful results
  for (let i = 0; i < actualSuccessful; i++) {
    results.push({
      email: `success${i}@example.com`,
      status: 'sent',
      messageId: `msg-${Date.now()}-${i}`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Add failed results
  for (let i = 0; i < actualFailed; i++) {
    results.push({
      email: `failed${i}@example.com`,
      status: 'failed',
      error: 'Invalid email address',
      timestamp: new Date().toISOString()
    });
  }

  const response: BulkEmailResponse = {
    results,
    summary: {
      total: recipientCount,
      successful: actualSuccessful,
      failed: actualFailed
    }
  };

  validateBulkEmailResponseMock(response);
  return response;
}

/**
 * Creates a valid mock DeliveryStatusResponse for testing
 */
export function createMockDeliveryStatusResponse(overrides: Partial<DeliveryStatusResponse> = {}): DeliveryStatusResponse {
  const baseResponse: DeliveryStatusResponse = {
    recent: [
      {
        email: 'recent1@example.com',
        status: 'sent',
        messageId: 'msg-recent-1',
        timestamp: new Date(Date.now() - 60000).toISOString() // 1 minute ago
      },
      {
        email: 'recent2@example.com',
        status: 'sent',
        messageId: 'msg-recent-2',
        timestamp: new Date(Date.now() - 120000).toISOString() // 2 minutes ago
      }
    ],
    summary: {
      last24Hours: 15,
      last7Days: 87,
      totalSent: 1234,
      averageDeliveryTime: 2.3
    },
    ...overrides
  };

  return baseResponse;
}

/**
 * Helper to compare mock data with actual API response
 */
export function compareMockWithActual(mockData: unknown, actualData: unknown, path: string = ''): string[] {
  const differences: string[] = [];

  if (typeof mockData !== typeof actualData) {
    differences.push(`${path}: Type mismatch - mock is ${typeof mockData}, actual is ${typeof actualData}`);
    return differences;
  }

  if (mockData === null || actualData === null) {
    if (mockData !== actualData) {
      differences.push(`${path}: Null mismatch - mock is ${mockData}, actual is ${actualData}`);
    }
    return differences;
  }

  if (Array.isArray(mockData) && Array.isArray(actualData)) {
    if (mockData.length !== actualData.length) {
      differences.push(`${path}: Array length mismatch - mock has ${mockData.length}, actual has ${actualData.length}`);
    }
    
    const minLength = Math.min(mockData.length, actualData.length);
    for (let i = 0; i < minLength; i++) {
      differences.push(...compareMockWithActual(mockData[i], actualData[i], `${path}[${i}]`));
    }
    return differences;
  }

  if (typeof mockData === 'object') {
    const mockKeys = Object.keys(mockData);
    const actualKeys = Object.keys(actualData);
    
    // Check for missing keys in mock
    for (const key of actualKeys) {
      if (!(key in mockData)) {
        differences.push(`${path}.${key}: Missing in mock`);
      }
    }
    
    // Check for extra keys in mock
    for (const key of mockKeys) {
      if (!(key in actualData)) {
        differences.push(`${path}.${key}: Extra key in mock`);
      }
    }
    
    // Compare common keys
    for (const key of mockKeys) {
      if (key in actualData) {
        differences.push(...compareMockWithActual(mockData[key], actualData[key], `${path}.${key}`));
      }
    }
    return differences;
  }

  if (mockData !== actualData) {
    differences.push(`${path}: Value mismatch - mock is ${mockData}, actual is ${actualData}`);
  }

  return differences;
}

/**
 * Test helper to validate that unit test mocks match integration test results
 */
export class MockValidationTestSuite {
  private integrationResults: Map<string, unknown> = new Map();
  
  recordIntegrationResult(testName: string, result: unknown) {
    this.integrationResults.set(testName, result);
  }
  
  validateUnitTestMock(testName: string, mockData: unknown): void {
    const integrationResult = this.integrationResults.get(testName);
    if (!integrationResult) {
      throw new Error(`No integration result recorded for test: ${testName}`);
    }
    
    const differences = compareMockWithActual(mockData, integrationResult);
    if (differences.length > 0) {
      throw new Error(`Mock validation failed for ${testName}:\n${differences.join('\n')}`);
    }
  }
  
  generateMockFromIntegrationResult(testName: string): unknown {
    const result = this.integrationResults.get(testName);
    if (!result) {
      throw new Error(`No integration result available for: ${testName}`);
    }
    
    // Deep clone to avoid mutation
    return JSON.parse(JSON.stringify(result));
  }
}

export const mockValidator = new MockValidationTestSuite();