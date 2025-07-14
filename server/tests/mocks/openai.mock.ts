/**
 * Standardized OpenAI Mock for Testing Infrastructure
 * This provides a consistent mock across all test types with proper Jest typing
 */

// Type definitions for OpenAI API
interface OpenAIEmbeddingParams {
  input: string | string[];
  model: string;
  encoding_format?: string;
  dimensions?: number;
  user?: string;
}

interface OpenAIChatParams {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  [key: string]: unknown;
}

type OpenAIErrorObject = {
  status: number;
  response: {
    status: number;
    data: {
      error: {
        message: string;
        type: string;
        code: string;
      };
    };
  };
} & Error;

import { jest } from '@jest/globals';
import {
  MockFunction,
  MockEmbeddingResponse,
  MockChatResponse,
  MockOpenAIInstance,
  createTypedMockFunction,
  ensureMockFunction,
} from '../helpers/mock-types.js';

// Standard mock embedding data - simpler for unit tests
export const MOCK_EMBEDDING_DATA = [0.1, 0.2, 0.3, 0.4, 0.5];

// Full-size embedding for integration tests
export const MOCK_EMBEDDING_DATA_FULL = Array(1536)
  .fill(0)
  .map((_, i) => Math.sin(i * 0.01));

// Standard mock responses with proper typing
export const createMockEmbeddingResponse = (count: number = 1): MockEmbeddingResponse => ({
  data: Array(count)
    .fill(null)
    .map((_, index) => ({
      object: 'embedding',
      embedding: MOCK_EMBEDDING_DATA,
      index,
    })),
  model: 'text-embedding-3-small',
  usage: {
    prompt_tokens: count * 10,
    total_tokens: count * 10,
  },
});

export const createMockChatResponse = (content: string = 'Mock AI response'): MockChatResponse => ({
  id: 'mock-completion-' + Date.now(),
  object: 'chat.completion',
  created: Math.floor(Date.now() / 1000),
  model: 'gpt-3.5-turbo',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant' as const,
        content,
      },
      finish_reason: 'stop' as const,
    },
  ],
  usage: {
    prompt_tokens: 50,
    completion_tokens: 20,
    total_tokens: 70,
  },
});

// Mock OpenAI instance with proper Jest typing
export const createMockOpenAIInstance = (): MockOpenAIInstance => {
  const mockInstance: MockOpenAIInstance = {
    embeddings: {
      create: createTypedMockFunction<(params: OpenAIEmbeddingParams) => Promise<MockEmbeddingResponse>>(),
    },
    chat: {
      completions: {
        create: createTypedMockFunction<(params: OpenAIChatParams) => Promise<MockChatResponse>>(),
      },
    },
  };

  // Set default resolved values
  mockInstance.embeddings.create.mockResolvedValue(createMockEmbeddingResponse(1));
  mockInstance.chat.completions.create.mockResolvedValue(createMockChatResponse());

  return mockInstance;
};

// Global mock instance that can be imported by tests
export const mockOpenAI = createMockOpenAIInstance();

// Mock constructor with proper typing
export const MockOpenAIConstructor = jest.fn().mockImplementation(() => mockOpenAI);

// Export as default for module mocking
export { MockOpenAIConstructor };

// Helper functions for test setup with proper typing
export const setupEmbeddingMock = (
  responses: MockEmbeddingResponse[] = [createMockEmbeddingResponse()],
): MockFunction<(params: OpenAIEmbeddingParams) => Promise<MockEmbeddingResponse>> => {
  const mockFn = ensureMockFunction(mockOpenAI.embeddings.create, 'mockOpenAI.embeddings.create');
  mockFn.mockClear();
  responses.forEach((response) => {
    mockFn.mockResolvedValueOnce(response);
  });
  return mockFn;
};

export const setupChatMock = (
  responses: MockChatResponse[] = [createMockChatResponse()],
): MockFunction<(params: OpenAIChatParams) => Promise<MockChatResponse>> => {
  const mockFn = ensureMockFunction(
    mockOpenAI.chat.completions.create,
    'mockOpenAI.chat.completions.create',
  );
  mockFn.mockClear();
  responses.forEach((response) => {
    mockFn.mockResolvedValueOnce(response);
  });
  return mockFn;
};

export const resetOpenAIMocks = () => {
  ensureMockFunction(mockOpenAI.embeddings.create, 'mockOpenAI.embeddings.create').mockClear();
  ensureMockFunction(
    mockOpenAI.chat.completions.create,
    'mockOpenAI.chat.completions.create',
  ).mockClear();
};

// Error response helpers
export const createMockErrorResponse = (status: number = 401, message: string = 'API Error'): OpenAIErrorObject => {
  const error = new Error(message) as OpenAIErrorObject;
  error.status = status;
  error.response = {
    status,
    data: {
      error: {
        message,
        type: 'invalid_request_error',
        code: status === 401 ? 'invalid_api_key' : 'rate_limit_exceeded',
      },
    },
  };
  return error;
};

export const setupEmbeddingError = (
  error = createMockErrorResponse(),
): MockFunction<(params: OpenAIEmbeddingParams) => Promise<MockEmbeddingResponse>> => {
  const mockFn = ensureMockFunction(mockOpenAI.embeddings.create, 'mockOpenAI.embeddings.create');
  mockFn.mockRejectedValueOnce(error);
  return mockFn;
};

export const setupChatError = (
  error = createMockErrorResponse(),
): MockFunction<(params: OpenAIChatParams) => Promise<MockChatResponse>> => {
  const mockFn = ensureMockFunction(
    mockOpenAI.chat.completions.create,
    'mockOpenAI.chat.completions.create',
  );
  mockFn.mockRejectedValueOnce(error);
  return mockFn;
};

// Enhanced mock creation function for complex test scenarios
export const createOpenAIMock = () => {
  const client = createMockOpenAIInstance();
  
  const utilities = {
    mockRateLimit: () => {
      ensureMockFunction(client.chat.completions.create, 'client.chat.completions.create')
        .mockRejectedValueOnce(createMockErrorResponse(429, 'Rate limit exceeded'));
    },
    mockTimeout: () => {
      ensureMockFunction(client.chat.completions.create, 'client.chat.completions.create')
        .mockRejectedValueOnce(new Error('Request timeout'));
    },
    mockInvalidAPIKey: () => {
      ensureMockFunction(client.chat.completions.create, 'client.chat.completions.create')
        .mockRejectedValueOnce(createMockErrorResponse(401, 'Invalid API key'));
    },
  };
  
  return { client, utilities };
};
