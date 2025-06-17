import { jest } from '@jest/globals';
import { rewriteNewsletter } from '../services/newsletterLLM.js';

// Mock OpenAI
jest.mock('openai');
const mockOpenAI = jest.mocked(await import('openai')).default;

// Mock logger
jest.mock('../logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock OpenAI instance
const mockOpenAIInstance = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

describe('NewsletterLLM', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockOpenAI.mockImplementation(() => mockOpenAIInstance as unknown);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('rewriteNewsletter', () => {
    const testDraft = 'This is a test newsletter draft.';

    describe('with OpenAI configured', () => {
      beforeEach(() => {
        process.env.OPENAI_API_KEY = 'test-api-key';
      });

      it('should rewrite newsletter using OpenAI', async () => {
        const rewrittenText = 'This is a beautifully rewritten newsletter!';
        mockOpenAIInstance.chat.completions.create.mockResolvedValue({
          choices: [
            {
              message: {
                content: rewrittenText,
              },
            },
          ],
          usage: {
            total_tokens: 150,
          },
        });

        const result = await rewriteNewsletter(testDraft);

        expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Rewrite the classroom newsletter in a warm, engaging tone for parents. Keep length similar.',
            },
            {
              role: 'user',
              content: testDraft,
            },
          ],
          temperature: 0.7,
        });

        expect(result).toBe(rewrittenText);
      });

      it('should log token usage when available', async () => {
        const mockLogger = jest.mocked(await import('../logger')).default;

        mockOpenAIInstance.chat.completions.create.mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Rewritten text',
              },
            },
          ],
          usage: {
            total_tokens: 200,
          },
        });

        await rewriteNewsletter(testDraft);

        expect(mockLogger.info).toHaveBeenCalledWith({ tokens: 200 }, 'llm tokens used');
      });

      it('should handle missing content in response', async () => {
        mockOpenAIInstance.chat.completions.create.mockResolvedValue({
          choices: [
            {
              message: {
                content: null,
              },
            },
          ],
        });

        const result = await rewriteNewsletter(testDraft);

        expect(result).toBe(testDraft);
      });

      it('should handle empty choices array', async () => {
        mockOpenAIInstance.chat.completions.create.mockResolvedValue({
          choices: [],
        });

        const result = await rewriteNewsletter(testDraft);

        expect(result).toBe(testDraft);
      });

      it('should trim whitespace from response', async () => {
        const rewrittenText = '  \n  This is a rewritten newsletter!  \n  ';
        mockOpenAIInstance.chat.completions.create.mockResolvedValue({
          choices: [
            {
              message: {
                content: rewrittenText,
              },
            },
          ],
        });

        const result = await rewriteNewsletter(testDraft);

        expect(result).toBe('This is a rewritten newsletter!');
      });

      it('should handle OpenAI API errors gracefully', async () => {
        const mockLogger = jest.mocked(await import('../logger')).default;
        const apiError = new Error('OpenAI API error');

        mockOpenAIInstance.chat.completions.create.mockRejectedValue(apiError);

        const result = await rewriteNewsletter(testDraft);

        expect(mockLogger.error).toHaveBeenCalledWith({ err: apiError }, 'llm rewrite failed');
        expect(result).toBe(testDraft);
      });

      it('should handle rate limiting errors', async () => {
        const mockLogger = jest.mocked(await import('../logger')).default;
        const rateLimitError = new Error('Rate limit exceeded');

        mockOpenAIInstance.chat.completions.create.mockRejectedValue(rateLimitError);

        const result = await rewriteNewsletter(testDraft);

        expect(mockLogger.error).toHaveBeenCalledWith(
          { err: rateLimitError },
          'llm rewrite failed',
        );
        expect(result).toBe(testDraft);
      });

      it('should handle network timeouts', async () => {
        const mockLogger = jest.mocked(await import('../logger')).default;
        const timeoutError = new Error('Request timeout');

        mockOpenAIInstance.chat.completions.create.mockRejectedValue(timeoutError);

        const result = await rewriteNewsletter(testDraft);

        expect(mockLogger.error).toHaveBeenCalledWith({ err: timeoutError }, 'llm rewrite failed');
        expect(result).toBe(testDraft);
      });

      it('should not log token usage when not available', async () => {
        const mockLogger = jest.mocked(await import('../logger')).default;

        mockOpenAIInstance.chat.completions.create.mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Rewritten text',
              },
            },
          ],
          // No usage property
        });

        await rewriteNewsletter(testDraft);

        expect(mockLogger.info).not.toHaveBeenCalledWith(
          expect.objectContaining({ tokens: expect.any(Number) }),
          'llm tokens used',
        );
      });
    });

    describe('without OpenAI configured', () => {
      beforeEach(() => {
        delete process.env.OPENAI_API_KEY;
      });

      it('should return original draft when OpenAI not configured', async () => {
        const result = await rewriteNewsletter(testDraft);

        expect(result).toBe(testDraft);
        expect(mockOpenAIInstance.chat.completions.create).not.toHaveBeenCalled();
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        process.env.OPENAI_API_KEY = 'test-api-key';
      });

      it('should handle empty draft', async () => {
        mockOpenAIInstance.chat.completions.create.mockResolvedValue({
          choices: [
            {
              message: {
                content: '',
              },
            },
          ],
        });

        const result = await rewriteNewsletter('');

        expect(result).toBe('');
      });

      it('should handle very long drafts', async () => {
        const longDraft = 'A'.repeat(10000);
        const rewrittenText = 'B'.repeat(10000);

        mockOpenAIInstance.chat.completions.create.mockResolvedValue({
          choices: [
            {
              message: {
                content: rewrittenText,
              },
            },
          ],
        });

        const result = await rewriteNewsletter(longDraft);

        expect(result).toBe(rewrittenText);
        expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              expect.objectContaining({
                content: longDraft,
              }),
            ]),
          }),
        );
      });

      it('should handle special characters in draft', async () => {
        const specialCharDraft = 'Newsletter with émojis 🎉 and spëcial chars: @#$%^&*()';
        const rewrittenText = 'Beautiful newsletter with émojis 🎉 and special characters!';

        mockOpenAIInstance.chat.completions.create.mockResolvedValue({
          choices: [
            {
              message: {
                content: rewrittenText,
              },
            },
          ],
        });

        const result = await rewriteNewsletter(specialCharDraft);

        expect(result).toBe(rewrittenText);
      });
    });
  });

  describe('OpenAI client initialization', () => {
    it('should create OpenAI client when API key is provided', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      // Re-import to trigger client creation
      jest.resetModules();

      expect(mockOpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
      });
    });

    it('should not create OpenAI client when API key is missing', () => {
      delete process.env.OPENAI_API_KEY;

      // Re-import to trigger client creation
      jest.resetModules();

      expect(mockOpenAI).not.toHaveBeenCalled();
    });
  });
});
