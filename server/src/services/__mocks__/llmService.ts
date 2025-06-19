import { jest } from '@jest/globals';

export const openai = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateContent(prompt: string, systemMessage?: string): Promise<string> {
  return 'Mocked content';
}

export async function generateBilingualContent(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prompt: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  systemMessage?: string,
): Promise<{ french: string; english: string }> {
  return {
    french: 'Contenu simulé',
    english: 'Mocked content',
  };
}
