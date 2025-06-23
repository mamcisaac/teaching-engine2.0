import { jest } from '@jest/globals';

const mockChatCompletion = {
  id: 'mock-completion-id',
  object: 'chat.completion',
  created: Date.now(),
  model: 'gpt-3.5-turbo',
  usage: {
    prompt_tokens: 50,
    completion_tokens: 100,
    total_tokens: 150,
  },
  choices: [
    {
      message: {
        role: 'assistant',
        content: 'This is a mock response for testing purposes.',
      },
      index: 0,
      finish_reason: 'stop',
    },
  ],
};

const mockEmbedding = {
  object: 'list',
  data: [
    {
      object: 'embedding',
      embedding: Array(1536)
        .fill(0)
        .map(() => Math.random()),
      index: 0,
    },
  ],
  model: 'text-embedding-ada-002',
  usage: {
    prompt_tokens: 8,
    total_tokens: 8,
  },
};

// Create mock functions with proper typing
const mockChatCreate = jest.fn();
mockChatCreate.mockResolvedValue(mockChatCompletion);

const mockEmbeddingsCreate = jest.fn();
mockEmbeddingsCreate.mockResolvedValue(mockEmbedding);

const mockGenerateContent = jest.fn();
mockGenerateContent.mockResolvedValue('This is a mock response for testing purposes.');

const mockGenerateBilingualContent = jest.fn();
mockGenerateBilingualContent.mockResolvedValue({
  english: 'Mock English content',
  french: 'Mock French content',
});

export const openai = {
  chat: {
    completions: {
      create: mockChatCreate,
    },
  },
  embeddings: {
    create: mockEmbeddingsCreate,
  },
};

export const generateContent = mockGenerateContent;
export const generateBilingualContent = mockGenerateBilingualContent;
