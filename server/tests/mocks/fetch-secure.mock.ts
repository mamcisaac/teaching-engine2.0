/**
 * Secure Fetch Mock Implementation
 * Validates security headers, protocols, and request patterns
 */

import { jest } from '@jest/globals';

// Security configuration
const SECURITY_CONFIG = {
  allowedProtocols: ['https:', 'http:'], // http allowed only for localhost
  requiredHeaders: ['user-agent'],
  blockedDomains: ['malicious.com', 'phishing.site'],
  rateLimitWindow: 60000, // 1 minute
  rateLimitMax: 100,
};

// Track requests for rate limiting
const requestTracker = new Map<string, number[]>();

// Mock response data
const mockResponses = new Map<string, any>();

// Security validation functions
function validateProtocol(url: string): void {
  const parsedUrl = new URL(url);

  // Allow HTTP only for localhost
  if (parsedUrl.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) {
    throw new Error('Insecure HTTP protocol not allowed for external domains');
  }

  if (!SECURITY_CONFIG.allowedProtocols.includes(parsedUrl.protocol)) {
    throw new Error(`Protocol ${parsedUrl.protocol} not allowed`);
  }
}

function validateDomain(url: string): void {
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.toLowerCase();

  for (const blocked of SECURITY_CONFIG.blockedDomains) {
    if (hostname.includes(blocked)) {
      throw new Error(`Blocked domain: ${hostname}`);
    }
  }
}

function validateHeaders(headers: any): void {
  const headerMap = new Map();

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      headerMap.set(key.toLowerCase(), value);
    });
  } else if (typeof headers === 'object') {
    Object.entries(headers).forEach(([key, value]) => {
      headerMap.set(key.toLowerCase(), value);
    });
  }

  // Check for required security headers
  for (const required of SECURITY_CONFIG.requiredHeaders) {
    if (!headerMap.has(required)) {
      throw new Error(`Missing required header: ${required}`);
    }
  }

  // Validate authorization header if present
  if (headerMap.has('authorization')) {
    const auth = headerMap.get('authorization');
    if (!auth.startsWith('Bearer ') && !auth.startsWith('Basic ')) {
      throw new Error('Invalid authorization header format');
    }
  }
}

function checkRateLimit(clientId: string): void {
  const now = Date.now();
  const requests = requestTracker.get(clientId) || [];

  // Clean old requests
  const recentRequests = requests.filter((time) => now - time < SECURITY_CONFIG.rateLimitWindow);

  if (recentRequests.length >= SECURITY_CONFIG.rateLimitMax) {
    throw new Error('Rate limit exceeded');
  }

  recentRequests.push(now);
  requestTracker.set(clientId, recentRequests);
}

// Create secure fetch mock
export const createSecureFetchMock = () => {
  const fetchMock = jest.fn().mockImplementation(async (url: string, options: any = {}) => {
    try {
      // Extract client identifier (from headers or default)
      const clientId = options.headers?.['x-client-id'] || 'default-client';

      // Security validations
      validateProtocol(url);
      validateDomain(url);

      if (options.headers) {
        validateHeaders(options.headers);
      }

      checkRateLimit(clientId);

      // Check for mocked responses
      const mockKey = `${options.method || 'GET'}:${url}`;
      if (mockResponses.has(mockKey)) {
        const mockData = mockResponses.get(mockKey);
        return createMockResponse(mockData.data, mockData.status || 200);
      }

      // Default responses based on URL patterns
      if (url.includes('/api/auth')) {
        return createMockResponse({
          authenticated: true,
          user: { id: 1, email: 'test@example.com' },
        });
      }

      if (url.includes('/api/validate')) {
        return createMockResponse({ valid: true });
      }

      if (url.includes('/api/openai')) {
        // Validate API key in headers
        if (!options.headers?.['authorization']) {
          return createMockResponse({ error: 'Missing API key' }, 401);
        }
        return createMockResponse({
          choices: [{ text: 'Mock OpenAI response' }],
        });
      }

      // Default success response
      return createMockResponse({
        success: true,
        message: 'Mock response',
        url,
        method: options.method || 'GET',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      // Return error responses for security violations
      return createMockResponse(
        { error: error.message },
        error.message.includes('Rate limit') ? 429 : 403,
      );
    }
  });

  // Utility methods for testing
  fetchMock.setMockResponse = (method: string, url: string, data: any, status = 200) => {
    mockResponses.set(`${method}:${url}`, { data, status });
  };

  fetchMock.clearMockResponses = () => {
    mockResponses.clear();
  };

  fetchMock.resetRateLimits = () => {
    requestTracker.clear();
  };

  fetchMock.getRequestCount = (clientId = 'default-client') => {
    const requests = requestTracker.get(clientId) || [];
    const now = Date.now();
    return requests.filter((time) => now - time < SECURITY_CONFIG.rateLimitWindow).length;
  };

  return fetchMock;
};

// Helper to create mock response objects
function createMockResponse(data: any, status = 200) {
  const response = {
    ok: status >= 200 && status < 300,
    status,
    statusText: getStatusText(status),
    headers: new Headers({
      'content-type': 'application/json',
      'x-powered-by': 'secure-fetch-mock',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'x-xss-protection': '1; mode=block',
    }),
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    blob: jest.fn().mockResolvedValue(new Blob([JSON.stringify(data)])),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
    clone: jest.fn().mockReturnThis(),
  };

  return Promise.resolve(response);
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };

  return statusTexts[status] || 'Unknown';
}

// Export for use in tests
export const secureFetchMock = createSecureFetchMock();

// Set up global fetch if needed
if (typeof global !== 'undefined' && !(global as any).fetch) {
  (global as any).fetch = secureFetchMock;
}
