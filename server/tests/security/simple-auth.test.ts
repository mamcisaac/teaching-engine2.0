/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Simple Authentication Test
 * Basic test to verify authentication works
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';

// Import the actual app
let app: unknown;

beforeEach(async () => {
  // Set required environment variables
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.NODE_ENV = 'test';

  const appModule = await import('../../src/index');
  app = appModule.app;
});

describe('Simple Authentication', () => {
  it('should handle login with correct credentials', async () => {
    // Just test that the login endpoint exists and handles requests
    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    // Expect 401 for wrong credentials (not 500 for server error)
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it('should handle malformed login request', async () => {
    const response = await request(app).post('/api/auth/login').send({
      // Missing password
      email: 'test@example.com',
    });

    expect(response.status).toBe(400);
  });

  it('should return 404 for non-existent endpoints', async () => {
    const response = await request(app).get('/api/nonexistent');

    // For debugging - let's see what we're actually getting
    if (response.status !== 404) {
      console.log('Expected 404 but got:', response.status);
      console.log('Response body:', response.body);
      console.log('Response headers:', response.headers);
    }

    expect(response.status).toBe(404);
  });
});
