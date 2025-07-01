/**
 * Mock Registry for centralized mock management
 * This file provides a central registry for all mocks to ensure consistency
 */

import { jest } from '@jest/globals';

// OpenAI mock instance
export const mockOpenAIInstance = {
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
};

// Mock OpenAI constructor
export const mockOpenAI = jest.fn(() => mockOpenAIInstance);

// Add mockImplementation method to the mock
mockOpenAI.mockImplementation = jest.fn(() => mockOpenAIInstance);

// Mock registry for tracking all mocks
export const mockRegistry = {
  openai: mockOpenAI,
  openaiInstance: mockOpenAIInstance,

  // Reset all mocks
  resetAll: () => {
    mockOpenAI.mockClear();
    mockOpenAIInstance.chat.completions.create.mockClear();
    mockOpenAIInstance.embeddings.create.mockClear();
  },

  // Setup default responses
  setupDefaults: () => {
    mockOpenAIInstance.chat.completions.create.mockResolvedValue({
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
    });

    mockOpenAIInstance.embeddings.create.mockResolvedValue({
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
    });
  },
};

export default mockRegistry;
