/**
 * CRITICAL SECURITY: Load this FIRST to prevent any real API calls
 * This file MUST be the first setup file loaded by Jest
 */

import { jest } from '@jest/globals';

// IMMEDIATE ENVIRONMENT SECURITY
process.env.NODE_ENV = 'test';

// REMOVE ALL REAL API KEYS IMMEDIATELY
delete process.env.OPENAI_API_KEY;
delete process.env.ANTHROPIC_API_KEY;
delete process.env.COHERE_API_KEY;
delete process.env.GOOGLE_API_KEY;
delete process.env.AZURE_OPENAI_API_KEY;

// Set safe test keys
process.env.TEST_OPENAI_API_KEY = 'test-only-mock-key';

// CRITICAL: Hoist OpenAI mock BEFORE any imports
jest.mock('openai', () => {
  const mockOpenAIInstance = {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          id: 'mock-completion',
          object: 'chat.completion',
          created: Date.now(),
          model: 'gpt-3.5-turbo',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'MOCK RESPONSE - No API call made',
              },
              finish_reason: 'stop',
            },
          ],
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        }),
      },
    },
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [
          {
            object: 'embedding',
            embedding: Array(1536)
              .fill(0)
              .map((_, i) => i * 0.001),
            index: 0,
          },
        ],
        model: 'text-embedding-3-small',
        usage: { prompt_tokens: 10, total_tokens: 10 },
      }),
    },
  };

  const MockOpenAI = jest.fn().mockImplementation((config) => {
    if (config?.apiKey && !config.apiKey.includes('test')) {
      throw new Error(
        `SECURITY: Real API key detected in tests: ${config.apiKey.substring(0, 10)}...`,
      );
    }
    return mockOpenAIInstance;
  });

  return {
    __esModule: true,
    default: MockOpenAI,
    OpenAI: MockOpenAI,
  };
});

// Block network calls to AI services
const blockedHosts = [
  'api.openai.com',
  'api.anthropic.com',
  'api.cohere.ai',
  'generativelanguage.googleapis.com',
  'openai.azure.com',
];

// Override fetch to block API calls
if (typeof global !== 'undefined') {
  const originalFetch = global.fetch || (() => Promise.reject(new Error('Fetch not available')));

  global.fetch = jest.fn().mockImplementation((url, ...args) => {
    const urlString = typeof url === 'string' ? url : url.toString();

    for (const host of blockedHosts) {
      if (urlString.includes(host)) {
        console.error(`[SECURITY] Blocked API call to: ${urlString}`);
        throw new Error(`SECURITY: API call to ${host} blocked in test environment!`);
      }
    }

    // Allow other fetch calls
    return originalFetch(url, ...args);
  });
}

// Override https/http modules to block API calls
jest.mock('https', () => ({
  ...jest.requireActual('https'),
  request: jest.fn((options, callback) => {
    const host = typeof options === 'string' ? options : options.host || options.hostname;
    if (blockedHosts.some((blocked) => host?.includes(blocked))) {
      throw new Error(`SECURITY: HTTPS request to ${host} blocked in tests!`);
    }
    return jest.requireActual('https').request(options, callback);
  }),
}));

// Log security activation
console.log('[SECURITY] Test environment secured - All external AI API calls will be blocked');

// Export marker to verify this was loaded
export const SECURITY_MOCKS_LOADED = true;
