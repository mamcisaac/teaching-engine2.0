/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Debug test for authentication in validation tests
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createTestApp } from './test-app';
import './jest-setup';
import { setupSecurityTestEnv, restoreOriginalEnv } from './test-env';
import { secureFetchMock } from '../mocks/fetch-secure.mock';

// Replace global fetch with secure mock
(global as unknown).fetch = secureFetchMock;

describe('Authentication Debug', () => {
  let app: unknown;
  let mockUsers: unknown;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    // Setup security test environment
    originalEnv = setupSecurityTestEnv();

    const testApp = createTestApp();
    app = testApp.app;
    mockUsers = testApp.mockUsers;

    // Clear rate limiter state
    const { resetRateLimiterState } = await import('../../src/middleware/rateLimiter');
    resetRateLimiterState();

    // Reset secure fetch mock
    secureFetchMock.clearMockResponses();
    secureFetchMock.resetRateLimits();
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv) {
      restoreOriginalEnv(originalEnv);
    }
  });

  it('should debug authentication flow', async () => {
    const testUser = {
      email: 'test@example.com',
      password: 'SecureTestPassword123!',
      name: 'Test User',
      role: 'teacher',
    };

    // Create test user and get auth token
    const hashedPassword = await bcrypt.hash(testUser.password, 12);

    // Add user to mock database (use lowercase email to match login logic)
    mockUsers.set(testUser.email.toLowerCase(), {
      id: 1,
      email: testUser.email.toLowerCase(),
      password: hashedPassword,
      name: testUser.name,
      role: testUser.role,
    });

    console.log('Mock users:', Array.from(mockUsers.keys()));
    console.log('User data:', mockUsers.get(testUser.email.toLowerCase()));

    const loginResponse = await request(app).post('/api/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers);
    console.log('Login response body:', loginResponse.body);

    expect(loginResponse.status).toBe(200);

    const authToken = loginResponse.body.accessToken || '';

    console.log('Auth token from response body:', authToken);

    // Try using the token
    const testResponse = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Test',
        lastName: 'Student',
        grade: 5,
      });

    console.log('Test response status:', testResponse.status);
    console.log('Test response body:', testResponse.body);
  });
});
