import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { generateContent, generateBilingualContent } from '../../src/services/llmService';
import OpenAI from 'openai';
import logger from '../../src/logger';

// Mock dependencies
jest.mock('openai');
jest.mock('../../src/logger');

describe('LLMService', () => {
  const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;
  const mockLogger = logger as jest.Mocked<typeof logger>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.OPENAI_API_KEY;
  });

  describe('generateContent', () => {
    describe('when OpenAI API key is not configured', () => {
      it('should return placeholder content and log warning', async () => {
        const result = await generateContent('Test prompt');

        expect(result).toBe(
          'AI content generation is not available. Please configure OPENAI_API_KEY environment variable.',
        );
        expect(mockLogger.warn).toHaveBeenCalledWith(
          'OpenAI API key not configured, returning placeholder content',
        );
      });
    });

    describe('when OpenAI API key is configured', () => {
      let mockCreate: jest.Mock;
      let mockChatCompletions: any;

      beforeEach(() => {
        process.env.OPENAI_API_KEY = 'test-api-key';

        mockCreate = jest.fn();
        mockChatCompletions = {
          create: mockCreate,
        };

        // Mock OpenAI instance
        mockOpenAI.mockImplementation(
          () =>
            ({
              chat: {
                completions: mockChatCompletions,
              },
            }) as any,
        );

        // Re-import to trigger initialization with API key
        jest.resetModules();
      });

      it('should generate content with user prompt only', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: '  Generated content  ',
              },
            },
          ],
          usage: {
            total_tokens: 150,
          },
        };

        mockCreate.mockResolvedValue(mockResponse);

        const { generateContent: genContent } = await import('../../src/services/llmService');
        const result = await genContent('Test prompt');

        expect(result).toBe('Generated content');
        expect(mockCreate).toHaveBeenCalledWith({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: 'Test prompt',
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });
      });

      it('should generate content with system message', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: 'Generated with system context',
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const { generateContent: genContent } = await import('../../src/services/llmService');
        const result = await genContent('User prompt', 'System message');

        expect(result).toBe('Generated with system context');
        expect(mockCreate).toHaveBeenCalledWith({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'System message',
            },
            {
              role: 'user',
              content: 'User prompt',
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });
      });

      it('should log token usage when available', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: 'Content',
              },
            },
          ],
          usage: {
            total_tokens: 250,
          },
        };

        mockCreate.mockResolvedValue(mockResponse);

        const { generateContent: genContent } = await import('../../src/services/llmService');
        await genContent('Prompt');

        expect(mockLogger.info).toHaveBeenCalledWith(
          { tokens: 250 },
          'LLM tokens used for content generation',
        );
      });

      it('should handle missing content gracefully', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: null,
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const { generateContent: genContent } = await import('../../src/services/llmService');
        const result = await genContent('Prompt');

        expect(result).toBe('No content generated');
      });

      it('should handle API errors gracefully', async () => {
        const error = new Error('API rate limit exceeded');
        mockCreate.mockRejectedValue(error);

        const { generateContent: genContent } = await import('../../src/services/llmService');
        const result = await genContent('Prompt');

        expect(result).toBe('Failed to generate content. Please try again later.');
        expect(mockLogger.error).toHaveBeenCalledWith(
          { err: error },
          'LLM content generation failed',
        );
      });

      it('should handle network timeouts', async () => {
        const error = new Error('Request timeout');
        error.name = 'TimeoutError';
        mockCreate.mockRejectedValue(error);

        const { generateContent: genContent } = await import('../../src/services/llmService');
        const result = await genContent('Prompt');

        expect(result).toBe('Failed to generate content. Please try again later.');
      });

      it('should handle invalid API responses', async () => {
        mockCreate.mockResolvedValue({});

        const { generateContent: genContent } = await import('../../src/services/llmService');
        const result = await genContent('Prompt');

        expect(result).toBe('No content generated');
      });
    });
  });

  describe('generateBilingualContent', () => {
    describe('when OpenAI API key is not configured', () => {
      it('should return placeholder content in both languages', async () => {
        const result = await generateBilingualContent('Test prompt');

        const expectedContent =
          'AI content generation is not available. Please configure OPENAI_API_KEY environment variable.';

        expect(result).toEqual({
          french: expectedContent,
          english: expectedContent,
        });
      });
    });

    describe('when OpenAI API key is configured', () => {
      let mockCreate: jest.Mock;

      beforeEach(() => {
        process.env.OPENAI_API_KEY = 'test-api-key';

        mockCreate = jest.fn();
        const mockChatCompletions = {
          create: mockCreate,
        };

        mockOpenAI.mockImplementation(
          () =>
            ({
              chat: {
                completions: mockChatCompletions,
              },
            }) as any,
        );

        jest.resetModules();
      });

      it('should generate and parse bilingual content correctly', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: `
FRENCH:
Contenu en français

ENGLISH:
Content in English
                `,
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const { generateBilingualContent: genBilingual } = await import(
          '../../src/services/llmService'
        );
        const result = await genBilingual('Test prompt', 'System context');

        expect(result).toEqual({
          french: 'Contenu en français',
          english: 'Content in English',
        });

        // Verify the system message includes bilingual instructions
        const callArgs = mockCreate.mock.calls[0][0];
        expect(callArgs.messages[0].content).toContain(
          'Please respond with content in both French and English',
        );
        expect(callArgs.messages[0].content).toContain('System context');
      });

      it('should handle case-insensitive language markers', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: `
french:
Le contenu

English:
The content
                `,
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const { generateBilingualContent: genBilingual } = await import(
          '../../src/services/llmService'
        );
        const result = await genBilingual('Test prompt');

        expect(result).toEqual({
          french: 'Le contenu',
          english: 'The content',
        });
      });

      it('should handle missing language sections', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: 'Content without language markers',
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const { generateBilingualContent: genBilingual } = await import(
          '../../src/services/llmService'
        );
        const result = await genBilingual('Test prompt');

        expect(result).toEqual({
          french: 'Content without language markers',
          english: 'Content without language markers',
        });
      });

      it('should handle only French section present', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: `
FRENCH:
Seulement en français
                `,
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const { generateBilingualContent: genBilingual } = await import(
          '../../src/services/llmService'
        );
        const result = await genBilingual('Test prompt');

        expect(result).toEqual({
          french: 'Seulement en français',
          english: 'FRENCH:\nSeulement en français',
        });
      });

      it('should handle API errors gracefully', async () => {
        const error = new Error('API error');
        mockCreate.mockRejectedValue(error);

        const { generateBilingualContent: genBilingual } = await import(
          '../../src/services/llmService'
        );
        const result = await genBilingual('Test prompt');

        const expectedContent = 'Failed to generate content. Please try again later.';
        expect(result).toEqual({
          french: expectedContent,
          english: expectedContent,
        });
      });
    });
  });

  describe('Token limit handling', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      jest.resetModules();
    });

    it('should respect max_tokens parameter', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Short' } }],
      });

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      const { generateContent } = await import('../../src/services/llmService');
      await generateContent('Long prompt requiring many tokens');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 1000,
        }),
      );
    });

    it('should handle token limit exceeded errors', async () => {
      const error = new Error('Token limit exceeded');
      const mockCreate = jest.fn().mockRejectedValue(error);

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      const { generateContent } = await import('../../src/services/llmService');
      const result = await generateContent('Very long prompt');

      expect(result).toBe('Failed to generate content. Please try again later.');
      expect(mockLogger.error).toHaveBeenCalledWith(
        { err: error },
        'LLM content generation failed',
      );
    });
  });

  describe('Prompt validation', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      jest.resetModules();
    });

    it('should handle empty prompts', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
      });

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      const { generateContent } = await import('../../src/services/llmService');
      await generateContent('');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: '' }],
        }),
      );
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'a'.repeat(10000);
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
      });

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      const { generateContent } = await import('../../src/services/llmService');
      await generateContent(longPrompt);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: longPrompt }],
        }),
      );
    });

    it('should handle special characters in prompts', async () => {
      const specialPrompt = 'Test with "quotes" and \'apostrophes\' and \n newlines';
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
      });

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      const { generateContent } = await import('../../src/services/llmService');
      await generateContent(specialPrompt);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: specialPrompt }],
        }),
      );
    });
  });
});
