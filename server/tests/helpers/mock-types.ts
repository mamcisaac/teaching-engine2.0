/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Mock Types Helper for Teaching Engine 2.0
 * Provides proper TypeScript interfaces for Jest mocks
 * Resolves "mockImplementation is not a function" errors
 */

import { jest } from '@jest/globals';

/**
 * Proper Jest Mock Function Type
 * Ensures all Jest mock methods are available
 */
export type MockFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;

/**
 * OpenAI API Response Types for Mocking
 */
export interface MockEmbeddingResponse {
  data: Array<{
    object: 'embedding';
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface MockChatResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant' | 'user' | 'system';
      content: string;
    };
    finish_reason: 'stop' | 'length' | 'content_filter' | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Mock OpenAI Instance Interface
 * Properly typed for Jest mocks
 */
export interface MockOpenAIInstance {
  embeddings: {
    create: MockFunction<(params: any) => Promise<MockEmbeddingResponse>>;
  };
  chat: {
    completions: {
      create: MockFunction<(params: any) => Promise<MockChatResponse>>;
    };
  };
}

/**
 * Database Mock Types
 */
export interface MockPrismaModel<T = any> {
  findUnique: MockFunction<(args: any) => Promise<T | null>>;
  findFirst: MockFunction<(args: any) => Promise<T | null>>;
  findMany: MockFunction<(args: any) => Promise<T[]>>;
  create: MockFunction<(args: any) => Promise<T>>;
  createMany: MockFunction<(args: any) => Promise<{ count: number }>>;
  update: MockFunction<(args: any) => Promise<T>>;
  updateMany: MockFunction<(args: any) => Promise<{ count: number }>>;
  upsert: MockFunction<(args: any) => Promise<T>>;
  delete: MockFunction<(args: any) => Promise<T>>;
  deleteMany: MockFunction<(args: any) => Promise<{ count: number }>>;
  count: MockFunction<(args: any) => Promise<number>>;
  aggregate: MockFunction<(args: any) => Promise<any>>;
  groupBy: MockFunction<(args: any) => Promise<any[]>>;
}

export interface MockPrismaClient {
  curriculumExpectation: MockPrismaModel;
  curriculumExpectationEmbedding: MockPrismaModel;
  outcomeEmbedding: MockPrismaModel;
  learningOutcome: MockPrismaModel;
  lessonPlan: MockPrismaModel;
  user: MockPrismaModel;
  newsletter: MockPrismaModel;
  $connect: MockFunction<() => Promise<void>>;
  $disconnect: MockFunction<() => Promise<void>>;
  $transaction: MockFunction<(fn: any) => Promise<any>>;
  $executeRaw: MockFunction<(query: any, ...args: any[]) => Promise<any>>;
  $queryRaw: MockFunction<(query: any, ...args: any[]) => Promise<any>>;
}

/**
 * Service Mock Types
 */
export interface MockEmbeddingService {
  generateEmbedding: MockFunction<(text: string) => Promise<number[]>>;
  generateEmbeddings: MockFunction<(texts: string[]) => Promise<number[][]>>;
  findSimilarOutcomes: MockFunction<(embedding: number[], threshold?: number) => Promise<any[]>>;
  ensureEmbeddingExists: MockFunction<(outcomeId: string) => Promise<void>>;
}

export interface MockLLMService {
  generateContent: MockFunction<(prompt: string, context?: any) => Promise<string>>;
  generateBilingualContent: MockFunction<
    (prompt: string) => Promise<{ english: string; french: string }>
  >;
  generateLessonPlan: MockFunction<(params: any) => Promise<any>>;
  generateAssessment: MockFunction<(params: any) => Promise<any>>;
}

export interface MockNewsletterService {
  generateNewsletter: MockFunction<(params: any) => Promise<any>>;
  sendNewsletter: MockFunction<(newsletterId: string) => Promise<void>>;
}

export interface MockServices {
  embeddingService: MockEmbeddingService;
  llmService: MockLLMService;
  newsletterService: MockNewsletterService;
}

/**
 * Mock Validation Types
 */
export interface MockValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Utility Functions for Mock Type Validation
 */
export const validateMockFunction = <T extends (...args: any[]) => any>(
  mockFn: any,
  functionName: string,
): MockFunction<T> => {
  if (!jest.isMockFunction(mockFn)) {
    throw new Error(
      `${functionName} is not a properly configured Jest mock function. Use jest.fn() to create it.`,
    );
  }
  return mockFn as MockFunction<T>;
};

export const ensureMockFunction = <T extends (...args: any[]) => any>(
  mockFn: any,
  functionName: string,
): MockFunction<T> => {
  if (!mockFn) {
    throw new Error(`${functionName} is undefined. Ensure the mock is properly imported.`);
  }

  if (!jest.isMockFunction(mockFn)) {
    throw new Error(`${functionName} is not a Jest mock function. Current type: ${typeof mockFn}`);
  }

  // Verify essential mock methods exist
  const requiredMethods = [
    'mockImplementation',
    'mockResolvedValue',
    'mockRejectedValue',
    'mockClear',
  ];
  for (const method of requiredMethods) {
    if (typeof mockFn[method] !== 'function') {
      throw new Error(`${functionName} is missing required mock method: ${method}`);
    }
  }

  return mockFn as MockFunction<T>;
};

/**
 * Mock Creation Helpers
 */
export const createTypedMockFunction = <T extends (...args: any[]) => any>(): MockFunction<T> => {
  return jest.fn() as MockFunction<T>;
};

export const createMockOpenAI = (): MockOpenAIInstance => {
  return {
    embeddings: {
      create: createTypedMockFunction<(params: any) => Promise<MockEmbeddingResponse>>(),
    },
    chat: {
      completions: {
        create: createTypedMockFunction<(params: any) => Promise<MockChatResponse>>(),
      },
    },
  };
};

/**
 * Mock Reset Utilities
 */
export const resetMockFunction = (mockFn: MockFunction<any>) => {
  if (jest.isMockFunction(mockFn)) {
    mockFn.mockClear();
    mockFn.mockReset();
  }
};

export const resetAllMockProperties = (mockObject: Record<string, any>) => {
  Object.values(mockObject).forEach((value) => {
    if (jest.isMockFunction(value)) {
      resetMockFunction(value);
    } else if (typeof value === 'object' && value !== null) {
      resetAllMockProperties(value);
    }
  });
};

/**
 * Export commonly used types
 */
export type { MockFunction };
export { jest };
