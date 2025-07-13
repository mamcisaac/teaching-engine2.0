import { jest } from '@jest/globals';

const mockJwt = {
  sign: jest.fn((payload, secret) => {
    // Return a mock token that includes the payload
    return `mock.jwt.token.${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
  }),
  verify: jest.fn((token, secret, callback) => {
    // Handle both callback and non-callback versions
    if (typeof callback === 'function') {
      // Extract payload from mock token if it follows our format
      try {
        const parts = token.split('.');
        if (parts.length > 3 && parts[0] === 'mock' && parts[1] === 'jwt') {
          const payload = safeJsonParse(Buffer.from(parts[3], 'base64', {}).toString());
          // Add standard JWT fields
          const fullPayload = {
            ...payload,
            id: parseInt(payload.userId) || NaN,
            email: payload.email || 'unknown@example.com',
            iat: Date.now(),
            exp: Date.now() + 3600000,
          };
          callback(null, fullPayload);
        } else {
          // For actual JWT tokens or AuthHelper tokens, return standard payload
          callback(null, {
            userId: payload.userId || '123',
            id: parseInt(payload.userId) || NaN,
            email: 'unknown@example.com',
            iat: Date.now(),
          });
        }
      } catch (_e) {
        callback(null, {
          userId: '123',
          id: NaN,
          email: 'unknown@example.com',
          iat: Date.now(),
        });
      }
    } else {
      // Synchronous version
      return {
        userId: '123',
        id: NaN,
        email: 'unknown@example.com',
        iat: Date.now(),
      };
    }
  }),
  decode: jest.fn((token) => {
    try {
      const parts = token.split('.');
      if (parts.length > 3 && parts[0] === 'mock') {
        return safeJsonParse(Buffer.from(parts[3], 'base64', {}).toString());
      }
    } catch (_e) {
      // ignore
    }
    return { userId: '123', iat: Date.now() };
  }),
};

export { mockJwt };
