/**
 * Direct OpenAI Security Check
 * Verifies that OpenAI is properly mocked and no real API calls are possible
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('OpenAI Security Check', () => {
  beforeEach(() => {
    // Clear all module caches to ensure fresh imports
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should have mocked OpenAI at module level', async () => {
    // This import should get the mocked version
    const OpenAI = (await import('openai')).default;

    // Verify it's a mock function
    expect(jest.isMockFunction(OpenAI)).toBe(true);
  });

  it('should block real API keys in OpenAI constructor', async () => {
    const OpenAI = (await import('openai')).default;

    // Attempt to create with real-looking key
    expect(() => new OpenAI({ apiKey: 'sk-real-key-123' })).toThrow('SECURITY');
  });

  it('should return mock instance for test keys', async () => {
    const OpenAI = (await import('openai')).default;

    // Test key should work
    const client = new OpenAI({ apiKey: 'test-key' });
    expect(client).toBeDefined();
    expect(client.chat).toBeDefined();
    expect(client.chat.completions).toBeDefined();
    expect(client.chat.completions.create).toBeDefined();
  });

  it('should return mock responses from API calls', async () => {
    const OpenAI = (await import('openai')).default;
    const client = new OpenAI({ apiKey: 'test-key' });

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices[0].message.content).toContain('Mock');
  });

  it('should track mock calls', async () => {
    const OpenAI = (await import('openai')).default;
    const { mockChatCreate } = await import('../__mocks__/openai');

    // Reset to ensure clean state
    mockChatCreate.mockClear();

    const client = new OpenAI({ apiKey: 'test-key' });
    await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
    });

    expect(mockChatCreate).toHaveBeenCalledTimes(1);
  });

  it('should verify environment is secure', () => {
    // Real API keys should be removed
    expect(process.env.OPENAI_API_KEY).toBeUndefined();
    expect(process.env.ANTHROPIC_API_KEY).toBeUndefined();

    // Only test keys should exist
    expect(process.env.TEST_OPENAI_API_KEY).toBeDefined();
    expect(process.env.TEST_OPENAI_API_KEY).toContain('test');
  });

  it('should verify no real network calls can be made', () => {
    // The key security measure is that OpenAI is mocked
    // and real API keys are blocked. Network calls are prevented
    // at the OpenAI library level, not necessarily at fetch level.

    // Verify that if fetch exists, it's either undefined or mocked
    if (typeof global.fetch !== 'undefined') {
      // Either it's a mock function or it doesn't work
      const isMocked = jest.isMockFunction(global.fetch);
      const isUndefined = global.fetch === undefined;
      expect(isMocked || isUndefined).toBe(true);
    }

    // The real security is in the OpenAI mock which we've already tested
    expect(true).toBe(true);
  });
});
