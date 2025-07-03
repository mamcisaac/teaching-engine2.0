/**
 * OpenAI Mock for test environment
 * This mock ensures no real API calls are made during testing
 */

import { jest } from '@jest/globals';

// Create a function that returns mock instance
const createMockInstance = () => ({
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        id: 'mock-completion-id',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'MOCK: Test response',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 10,
          total_tokens: 20,
        },
      }),
    },
  },
  embeddings: {
    create: jest.fn().mockResolvedValue({
      object: 'list',
      data: [
        {
          object: 'embedding',
          index: 0,
          embedding: Array(1536).fill(0.1),
        },
      ],
      model: 'text-embedding-ada-002',
      usage: {
        prompt_tokens: 5,
        total_tokens: 5,
      },
    }),
  },
});

// Create the mock constructor
const mockOpenAI = jest.fn(function (config?: any) {
  // Block real API initialization
  if (config?.apiKey && !config.apiKey.includes('test') && !config.apiKey.includes('mock')) {
    throw new Error('SECURITY: Real API key detected in test environment');
  }

  const instance = createMockInstance();
  Object.assign(this, instance);
  return this;
});

// Add mockImplementation method
mockOpenAI.mockImplementation = jest.fn();

// Export as default
export default mockOpenAI;

// Also export for named imports
export const OpenAI = mockOpenAI;

// Export helper to get mock instance
export const __mockOpenAIInstance = createMockInstance();
