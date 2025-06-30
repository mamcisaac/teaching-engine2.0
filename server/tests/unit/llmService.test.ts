import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('llmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateContent', () => {
    it('should generate content using mocked OpenAI response', async () => {
      const prompt = 'Generate a lesson plan for fractions';

      // Import service after mocks are set up
      const { generateContent } = await import('../../src/services/llmService');
      const result = await generateContent(prompt);

      // The mocked OpenAI should return the default mocked response
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should generate content with system message', async () => {
      const prompt = 'Create an activity';
      const systemMessage = 'You are an expert elementary teacher';

      const { generateContent } = await import('../../src/services/llmService');
      const result = await generateContent(prompt, systemMessage);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty prompts', async () => {
      const { generateContent } = await import('../../src/services/llmService');
      const result = await generateContent('');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'A'.repeat(10000);

      const { generateContent } = await import('../../src/services/llmService');
      const result = await generateContent(longPrompt);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle special characters in content', async () => {
      const prompt = 'Generate with special chars émojis 🎉';

      const { generateContent } = await import('../../src/services/llmService');
      const result = await generateContent(prompt);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('generateBilingualContent', () => {
    it('should generate bilingual content successfully', async () => {
      const prompt = 'Create a welcome message';

      const { generateBilingualContent } = await import('../../src/services/llmService');
      const result = await generateBilingualContent(prompt);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');
      expect(typeof result.french).toBe('string');
      expect(typeof result.english).toBe('string');
    });

    it('should handle bilingual content with system message', async () => {
      const prompt = 'Create instructions';
      const systemMessage = 'You are a teacher assistant';

      const { generateBilingualContent } = await import('../../src/services/llmService');
      const result = await generateBilingualContent(prompt, systemMessage);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');
    });

    it('should handle empty prompts in bilingual mode', async () => {
      const { generateBilingualContent } = await import('../../src/services/llmService');
      const result = await generateBilingualContent('');

      expect(result).toBeDefined();
      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');
    });

    it('should handle special characters in bilingual content', async () => {
      const specialPrompt = 'Test with émojis 🎉 and spéçiål çhäracters';

      const { generateBilingualContent } = await import('../../src/services/llmService');
      const result = await generateBilingualContent(specialPrompt);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('french');
      expect(result).toHaveProperty('english');
    });

    it('should handle properly formatted bilingual response', async () => {
      // Test the bilingual parsing logic by passing a mock response through the parser
      const { generateBilingualContent } = await import('../../src/services/llmService');
      const result = await generateBilingualContent('Test prompt');

      // Since we're using mocked services, just verify structure
      expect(result.french).toBeDefined();
      expect(result.english).toBeDefined();
      expect(typeof result.french).toBe('string');
      expect(typeof result.english).toBe('string');
    });
  });

  describe('Rate limiting and concurrency', () => {
    it('should handle concurrent requests', async () => {
      const prompts = ['Prompt 1', 'Prompt 2', 'Prompt 3'];

      const { generateContent } = await import('../../src/services/llmService');
      const results = await Promise.all(
        prompts.map(prompt => generateContent(prompt))
      );

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    it('should handle mixed content and bilingual requests', async () => {
      const { generateContent, generateBilingualContent } = await import('../../src/services/llmService');
      
      const results = await Promise.all([
        generateContent('Content prompt'),
        generateBilingualContent('Bilingual prompt'),
        generateContent('Another content prompt'),
      ]);

      expect(results).toHaveLength(3);
      expect(typeof results[0]).toBe('string');
      expect(results[1]).toHaveProperty('french');
      expect(results[1]).toHaveProperty('english');
      expect(typeof results[2]).toBe('string');
    });
  });

  describe('Integration patterns', () => {
    it('should work with typical workflow', async () => {
      const { generateContent, generateBilingualContent } = await import('../../src/services/llmService');
      
      // Step 1: Generate activity content
      const activityContent = await generateContent('Create a math activity for grade 3');
      expect(activityContent).toBeDefined();

      // Step 2: Generate bilingual instructions
      const instructions = await generateBilingualContent('Create instructions for this activity');
      expect(instructions.french).toBeDefined();
      expect(instructions.english).toBeDefined();

      // Step 3: Generate assessment
      const assessment = await generateContent('Create assessment questions');
      expect(assessment).toBeDefined();
    });

    it('should support chained operations', async () => {
      const { generateContent } = await import('../../src/services/llmService');
      
      const outline = await generateContent('Create a lesson plan outline');
      expect(outline).toBeDefined();

      const detailedPlan = await generateContent(`Expand on this outline: ${outline}`);
      expect(detailedPlan).toBeDefined();
    });
  });

  describe('Error resilience', () => {
    it('should handle rapid successive calls', async () => {
      const { generateContent } = await import('../../src/services/llmService');
      
      const startTime = Date.now();
      const callCount = 10;

      const promises = [];
      for (let i = 0; i < callCount; i++) {
        promises.push(generateContent(`Rapid call ${i}`));
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(callCount);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });

    it('should handle various input types gracefully', async () => {
      const { generateContent } = await import('../../src/services/llmService');
      
      const testCases = [
        '',
        'Normal prompt',
        '   Prompt with spaces   ',
        'Prompt\nwith\nnewlines',
        '🎉 Prompt with emojis 🎉',
        'A'.repeat(1000),
      ];

      for (const testCase of testCases) {
        const result = await generateContent(testCase);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }
    });
  });

  describe('OpenAI service integration', () => {
    it('should utilize mocked OpenAI service', async () => {
      // Verify that the OpenAI service is available and mocked
      const { openai } = await import('../../src/services/llmService');
      
      // In test environment, openai should be available due to mocking
      expect(openai).toBeDefined();
    });

    it('should handle response parsing correctly', async () => {
      const { generateContent } = await import('../../src/services/llmService');
      const result = await generateContent('Test response parsing');

      // Should return a valid string response
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});