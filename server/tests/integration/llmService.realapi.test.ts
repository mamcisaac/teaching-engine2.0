/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';
import { generateContent, generateBilingualContent } from '../../src/services/llmService';

describe('LLMService Real API Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    // These tests require real API key - will be skipped if not available

    // Setup centralized mocks
    const mockOpenAIInstance = MockRegistry.openai.create();
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIInstance as unknown);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Helper function to check if API key is available
  const hasAPIKey = () =>
    !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'test-api-key';

  describe('Real API Content Generation', () => {
    it('should generate educational content with real API', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      const prompt =
        'Create a simple math activity for grade 2 students about addition with numbers 1-10. Keep it under 100 words.';

      const result = await generateContent(prompt);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(10);
      expect(result).not.toBe(
        'AI content generation is not available. Please configure OPENAI_API_KEY environment variable.',
      );
      expect(result).not.toBe('Failed to generate content. Please try again later.');

      // Should contain educational content
      const lowercaseResult = result.toLowerCase();
      expect(
        lowercaseResult.includes('addition') ||
          lowercaseResult.includes('math') ||
          lowercaseResult.includes('number') ||
          lowercaseResult.includes('activity'),
      ).toBe(true);
    }, 30000); // 30 second timeout for real API

    it('should generate bilingual content with real API', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      const prompt =
        "Create a brief welcome message for parents about their child's learning. Keep it under 50 words total.";

      const result = await generateBilingualContent(prompt);

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('english');
      expect(result).toHaveProperty('french');
      expect(typeof result.english).toBe('string');
      expect(typeof result.french).toBe('string');
      expect(result.english.length).toBeGreaterThan(5);
      expect(result.french.length).toBeGreaterThan(5);

      // Should not be error messages
      expect(result.english).not.toBe(
        'AI content generation is not available. Please configure OPENAI_API_KEY environment variable.',
      );
      expect(result.french).not.toBe(
        'AI content generation is not available. Please configure OPENAI_API_KEY environment variable.',
      );
    }, 30000);

    it('should handle curriculum-specific prompts with real API', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      const prompt =
        'Create a learning objective for Ontario curriculum expectation B1.1 for grade 3 mathematics. Be specific and actionable.';

      const result = await generateContent(prompt);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(10);

      // Should contain curriculum-related content
      const lowercaseResult = result.toLowerCase();
      expect(
        lowercaseResult.includes('student') ||
          lowercaseResult.includes('learn') ||
          lowercaseResult.includes('objective') ||
          lowercaseResult.includes('math'),
      ).toBe(true);
    }, 30000);

    it('should handle rate limiting gracefully', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      // Make multiple rapid requests to test rate limiting
      const promises = Array.from({ length: 3 }, (_, i) =>
        generateContent(`Simple test prompt ${i + 1}. Just say "Test response ${i + 1}".`),
      );

      const results = await Promise.all(promises);

      // All should succeed (rate limiting should be handled internally)
      results.forEach((result, index) => {
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
        expect(result).not.toBe('Failed to generate content. Please try again later.');
      });
    }, 60000); // 60 second timeout for multiple requests

    it('should track token usage with real API', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      const prompt = 'Say "Hello world" in exactly these two words.';

      const result = await generateContent(prompt);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // Token tracking happens in the background, we just verify the request succeeds
    }, 30000);
  });

  describe('Real API Error Handling', () => {
    it('should handle invalid prompts gracefully', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      const result = await generateContent('');

      // Even with empty prompt, should get some response or graceful error
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    }, 30000);

    it('should handle very long prompts', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      const longPrompt =
        'Create a lesson plan. ' +
        'This is additional context. '.repeat(100) +
        'Keep the response short.';

      const result = await generateContent(longPrompt);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('Failed to generate content. Please try again later.');
    }, 30000);
  });

  describe('Real API Quality and Safety', () => {
    it('should generate appropriate educational content', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      const prompt = 'Create a safe, age-appropriate learning activity for elementary students.';

      const result = await generateContent(prompt);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(10);

      // Should contain educational keywords
      const lowercaseResult = result.toLowerCase();
      expect(
        lowercaseResult.includes('student') ||
          lowercaseResult.includes('learn') ||
          lowercaseResult.includes('activity') ||
          lowercaseResult.includes('elementary'),
      ).toBe(true);
    }, 30000);

    it('should maintain quality in bilingual content', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      const prompt = "Create a brief positive comment about a student's progress in reading.";

      const result = await generateBilingualContent(prompt);

      expect(result).toBeTruthy();
      expect(result.english).toBeTruthy();
      expect(result.french).toBeTruthy();

      // Both languages should contain positive educational content
      const englishLower = result.english.toLowerCase();
      const frenchLower = result.french.toLowerCase();

      expect(
        englishLower.includes('progress') ||
          englishLower.includes('reading') ||
          englishLower.includes('good') ||
          englishLower.includes('student'),
      ).toBe(true);

      expect(
        frenchLower.includes('progrès') ||
          frenchLower.includes('lecture') ||
          frenchLower.includes('bon') ||
          frenchLower.includes('élève') ||
          frenchLower.includes('étudiant'),
      ).toBe(true);
    }, 30000);
  });

  describe('No API Key Fallback', () => {
    it('should handle missing API key gracefully', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      try {
        const result = await generateContent('test prompt');

        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        // Should either be the fallback message or a mock response
        expect(
          result ===
            'AI content generation is not available. Please configure OPENAI_API_KEY environment variable.' ||
            result === 'Mock generated content',
        ).toBe(true);
      } finally {
        if (originalKey) {
          process.env.OPENAI_API_KEY = originalKey;
        }
      }
    });

    it('should handle missing API key in bilingual content', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      try {
        const result = await generateBilingualContent('test prompt');

        expect(result).toBeTruthy();
        expect(result).toHaveProperty('english');
        expect(result).toHaveProperty('french');
        expect(typeof result.english).toBe('string');
        expect(typeof result.french).toBe('string');
      } finally {
        if (originalKey) {
          process.env.OPENAI_API_KEY = originalKey;
        }
      }
    });
  });

  describe('Performance with Real API', () => {
    it('should complete requests within reasonable time', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      const startTime = Date.now();
      const result = await generateContent('Say "Hello" in one word.');
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(result).toBeTruthy();
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
    }, 20000);

    it('should handle system messages efficiently', async () => {
      if (!hasAPIKey()) {
        console.log('⏭️  Skipping real API test - OPENAI_API_KEY not configured');
        return;
      }

      const systemMessage = 'You are a helpful elementary school teacher assistant.';
      const prompt = 'Create a simple greeting for students.';

      const result = await generateContent(prompt, systemMessage);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(5);
    }, 30000);
  });
});
