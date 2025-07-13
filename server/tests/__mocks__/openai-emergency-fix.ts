/**
 * EMERGENCY FIX: Prevent ALL Real OpenAI API Calls
 * This mock MUST be loaded before any OpenAI imports to prevent real API calls
 */

import { jest } from '@jest/globals';

// CRITICAL: Block network calls at the module level
const BLOCKED_ERROR = new Error(
  'SECURITY: Real OpenAI API call attempted in test environment! This is blocked for security.',
);

// Create comprehensive mock responses
const mockChatResponse = {
  id: 'mock-chat-completion',
  object: 'chat.completion',
  created: Date.now(),
  model: 'gpt-3.5-turbo',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'MOCK RESPONSE - No real API call made',
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 20,
    total_tokens: 30,
  },
};

const mockEmbeddingResponse = {
  data: [
    {
      object: 'embedding',
      embedding: Array(1536)
        .fill(0)
        .map((_, i) => Math.sin(i * 0.01)),
      index: 0,
    },
  ],
  model: 'text-embedding-3-small',
  usage: {
    prompt_tokens: 10,
    total_tokens: 10,
  },
};

// Create mock functions with security checks
export const mockChatCreate = jest.fn().mockImplementation((params) => {
  // Security check - ensure no real API key is being used
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('test')) {
    throw new Error('SECURITY VIOLATION: Real API key detected in test environment!');
  }
  return Promise.resolve(mockChatResponse);
});

export const mockEmbeddingCreate = jest.fn().mockImplementation((params) => {
  // Security check - ensure no real API key is being used
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('test')) {
    throw new Error('SECURITY VIOLATION: Real API key detected in test environment!');
  }
  return Promise.resolve(mockEmbeddingResponse);
});

// Mock OpenAI instance
export const mockOpenAIInstance = {
  chat: {
    completions: {
      create: mockChatCreate,
    },
  },
  embeddings: {
    create: mockEmbeddingCreate,
  },
};

// Mock OpenAI constructor that prevents real API initialization
export const MockOpenAI = jest.fn().mockImplementation((config) => {
  // CRITICAL SECURITY CHECK
  if (config?.apiKey && !config.apiKey.includes('test') && !config.apiKey.includes('mock')) {
    console.error(`[SECURITY] Real API key detected: ${config.apiKey.substring(0, 10)}...`);
    throw new Error('SECURITY VIOLATION: Attempting to use real API key in test environment!');
  }

  // Log mock activation
  console.log('[OPENAI MOCK] Activated - All API calls will be mocked');

  return mockOpenAIInstance;
});

// Network intercept as final safety net
if (typeof global !== 'undefined' && global.fetch) {
  const originalFetch = global.fetch;
  global.fetch = jest.fn().mockImplementation((url, ...args) => {
    if (typeof url === 'string' && url.includes('api.openai.com')) {
      console.error('[SECURITY] Blocked real API call to:', url);
      throw new Error('SECURITY: Network call to OpenAI blocked in test environment!');
    }
    return originalFetch(url, ...args);
  });
}

// Export everything needed
export { MockOpenAI };
export { mockOpenAIInstance, mockChatResponse, mockEmbeddingResponse };
