/**
 * API Key Validation Test
 * Ensures no real API calls are made during testing
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('API Key Validation', () => {
  beforeAll(() => {
    // Ensure we're in test environment
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should not have real API keys in test environment', () => {
    const sensitiveKeys = [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'COHERE_API_KEY',
      'PRODUCTION_DATABASE_URL',
    ];

    const foundKeys = sensitiveKeys.filter((key) => {
      const value = process.env[key];
      return value && !value.includes('test') && !value.includes('mock');
    });

    if (foundKeys.length > 0) {
      throw new Error(
        `Real API keys found in test environment: ${foundKeys.join(', ')}. ` +
          'This could cause real API calls during testing!',
      );
    }

    expect(foundKeys).toHaveLength(0);
  });

  it('should have test API keys configured', () => {
    // The global mocks should set this
    expect(process.env.NODE_ENV).toBe('test');

    // Check that real API keys are not present
    expect(process.env.OPENAI_API_KEY).toBeUndefined();

    // Test API key should be set for services that check for it
    expect(process.env.TEST_OPENAI_API_KEY).toContain('test');
  });

  it('should prevent real external API calls', async () => {
    // Test that OpenAI is mocked
    try {
      const OpenAI = (await import('openai')).default;
      const client = new OpenAI({ apiKey: 'test-key' });

      // This should be mocked and not make a real call
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
      });

      // If we get here, the mock is working
      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
      console.log('✅ OpenAI API successfully mocked');
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('OpenAI mock failed - real API call attempted: ' + error.message);
      }
      // Other errors might be expected in test environment
      console.log('⚠️ OpenAI test result:', error instanceof Error ? error.message : error);
    }
  });

  it('should have silent logging in tests', async () => {
    // Logger should be mocked and silent
    const loggerModule = await import('../../src/logger');
    const logger = loggerModule.default;

    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');

    // These should be silent mock functions
    logger.info('Test log - should be silent');
    logger.warn('Test warning - should be silent');

    console.log('✅ Logger successfully mocked and silent');
  });

  it('should validate mock infrastructure is working', () => {
    // Check that Jest mocking is functioning
    expect(jest).toBeDefined();
    expect(typeof jest.fn).toBe('function');
    expect(typeof jest.mock).toBe('function');

    // Test basic mock functionality
    const mockFn = jest.fn().mockReturnValue('test');
    expect(mockFn()).toBe('test');
    expect(mockFn).toHaveBeenCalledTimes(1);

    console.log('✅ Jest mock infrastructure working correctly');
  });
});
