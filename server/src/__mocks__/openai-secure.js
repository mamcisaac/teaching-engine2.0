/**
 * Secure mock implementation of OpenAI for security testing
 * This mock validates API key and security configurations
 */
import { jest } from '@jest/globals';

// Store the original mocks so they can be accessed from tests
const createMock = jest.fn();
const embeddingsMock = jest.fn();

// Security validation flags
let securityChecksEnabled = true;
let validApiKeys = new Set(['test-api-key', 'sk-test-valid-key']);

// Error responses for security failures
const SECURITY_ERRORS = {
  INVALID_API_KEY: {
    error: {
      message: 'Invalid API Key provided',
      type: 'invalid_request_error',
      code: 'invalid_api_key',
    },
  },
  MISSING_API_KEY: {
    error: {
      message: "You didn't provide an API key",
      type: 'invalid_request_error',
      code: 'missing_api_key',
    },
  },
  RATE_LIMIT: {
    error: {
      message: 'Rate limit exceeded',
      type: 'rate_limit_error',
      code: 'rate_limit_exceeded',
    },
  },
};

const mockChatCompletion = {
  id: 'mock-completion-id',
  object: 'chat.completion',
  created: Date.now(),
  model: 'gpt-3.5-turbo',
  usage: {
    prompt_tokens: 50,
    completion_tokens: 100,
    total_tokens: 150,
  },
  choices: [
    {
      message: {
        role: 'assistant',
        content: 'Mock generated content with security validation',
      },
      index: 0,
      finish_reason: 'stop',
    },
  ],
};

const mockEmbedding = {
  object: 'list',
  data: [
    {
      object: 'embedding',
      embedding: Array(1536)
        .fill(0)
        .map(() => Math.random()),
      index: 0,
    },
  ],
  model: 'text-embedding-ada-002',
  usage: {
    prompt_tokens: 8,
    total_tokens: 8,
  },
};

// Request tracking for rate limiting
const requestTracker = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10;

function checkRateLimit(apiKey) {
  if (!securityChecksEnabled) return true;

  const now = Date.now();
  const requests = requestTracker.get(apiKey) || [];

  // Clean old requests
  const recentRequests = requests.filter((time) => now - time < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }

  recentRequests.push(now);
  requestTracker.set(apiKey, recentRequests);
  return true;
}

// Enhanced mock implementations with security checks
const secureCreateMock = jest.fn(async function (params) {
  // Validate API key exists
  if (!this || !this.apiKey) {
    throw new Error(JSON.stringify(SECURITY_ERRORS.MISSING_API_KEY));
  }

  // Validate API key format
  if (securityChecksEnabled && !validApiKeys.has(this.apiKey)) {
    throw new Error(JSON.stringify(SECURITY_ERRORS.INVALID_API_KEY));
  }

  // Check rate limits
  if (!checkRateLimit(this.apiKey)) {
    throw new Error(JSON.stringify(SECURITY_ERRORS.RATE_LIMIT));
  }

  // Return success response
  return mockChatCompletion;
});

const secureEmbeddingsMock = jest.fn(async function (params) {
  // Validate API key exists
  if (!this || !this.apiKey) {
    throw new Error(JSON.stringify(SECURITY_ERRORS.MISSING_API_KEY));
  }

  // Validate API key format
  if (securityChecksEnabled && !validApiKeys.has(this.apiKey)) {
    throw new Error(JSON.stringify(SECURITY_ERRORS.INVALID_API_KEY));
  }

  // Check rate limits
  if (!checkRateLimit(this.apiKey)) {
    throw new Error(JSON.stringify(SECURITY_ERRORS.RATE_LIMIT));
  }

  // Return success response
  return mockEmbedding;
});

// Create a mock constructor that validates configuration
function MockOpenAI(config = {}) {
  // Validate configuration
  if (!config.apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const instance = {
    apiKey: config.apiKey,
    chat: {
      completions: {
        create: secureCreateMock.bind({ apiKey: config.apiKey }),
      },
    },
    embeddings: {
      create: secureEmbeddingsMock.bind({ apiKey: config.apiKey }),
    },
  };

  return instance;
}

// Utility methods for test configuration
MockOpenAI.setSecurityChecksEnabled = (enabled) => {
  securityChecksEnabled = enabled;
};

MockOpenAI.addValidApiKey = (key) => {
  validApiKeys.add(key);
};

MockOpenAI.removeValidApiKey = (key) => {
  validApiKeys.delete(key);
};

MockOpenAI.clearRateLimitTracker = () => {
  requestTracker.clear();
};

MockOpenAI.getRequestCount = (apiKey) => {
  const requests = requestTracker.get(apiKey) || [];
  const now = Date.now();
  return requests.filter((time) => now - time < RATE_LIMIT_WINDOW).length;
};

// Add static properties for access from tests
MockOpenAI.mockCreate = secureCreateMock;
MockOpenAI.mockEmbeddings = secureEmbeddingsMock;

// Export default and named export for compatibility
export { MockOpenAI };
export { MockOpenAI as OpenAI };
