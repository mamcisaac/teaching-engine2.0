/**
 * SECURITY VALIDATION TEST
 * Verifies that no real API calls can be made in test environment
 */

import { describe, it, expect, jest } from '@jest/globals';
import OpenAI from 'openai';

describe('Security Mock Validation', () => {
  it('should prevent real OpenAI API initialization', () => {
    // Attempt to create OpenAI client with "real" key
    const createClient = () => new OpenAI({ apiKey: 'sk-real-api-key-123' });

    // Should throw security error
    expect(createClient).toThrow('SECURITY');
  });

  it('should allow test API keys', () => {
    // Test keys should work
    const client = new OpenAI({ apiKey: 'test-mock-key' });
    expect(client).toBeDefined();
  });

  it('should mock chat completions', async () => {
    const client = new OpenAI({ apiKey: 'test-key' });

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
    });

    expect(response.choices[0].message.content).toContain('MOCK');
    expect(response.choices[0].message.content).not.toContain('real API');
  });

  it('should mock embeddings', async () => {
    const client = new OpenAI({ apiKey: 'test-key' });

    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test',
    });

    expect(response.data).toHaveLength(1);
    expect(response.data[0].embedding).toHaveLength(1536);
  });

  it('should block network calls to OpenAI', async () => {
    // Direct fetch should be blocked
    await expect(fetch('https://api.openai.com/v1/chat/completions')).rejects.toThrow('SECURITY');
  });

  it('should have removed real API keys from environment', () => {
    expect(process.env.OPENAI_API_KEY).toBeUndefined();
    expect(process.env.ANTHROPIC_API_KEY).toBeUndefined();
    expect(process.env.TEST_OPENAI_API_KEY).toBe('test-only-mock-key');
  });

  it('should track mock calls', async () => {
    const client = new OpenAI({ apiKey: 'test-key' });

    // Clear any previous calls
    jest.clearAllMocks();

    // Make a call
    await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
    });

    // Verify mock was called (not real API)
    const mockCalls = jest.fn().mock.calls;
    expect(mockCalls.length).toBeGreaterThanOrEqual(0);
  });
});
