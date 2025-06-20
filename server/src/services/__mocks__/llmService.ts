import { jest } from '@jest/globals';

export const openai = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
  embeddings: {
    create: jest.fn(),
  },
};
