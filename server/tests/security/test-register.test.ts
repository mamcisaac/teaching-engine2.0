/**
 * Test Registration Endpoint
 * Simple test to check if registration works
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';

// Import the actual app
let app: any;

beforeEach(async () => {
  // Set required environment variables
  process.env.JWT_SECRET = 'test-jwt-secret-registration';
  process.env.NODE_ENV = 'test';

  const appModule = await import('../../src/index');
  app = appModule.app;
});

describe('Registration Test', () => {
  it('should register a new user successfully', async () => {
    const uniqueEmail = `test-register-${Date.now()}@example.com`;

    console.log('Testing registration with email:', uniqueEmail);

    const response = await request(app).post('/api/auth/register').send({
      email: uniqueEmail,
      password: 'TestPassword123!',
      name: 'Test User',
    });

    console.log('Registration response status:', response.status);
    console.log('Registration response body:', response.body);
    console.log('Registration response headers:', response.headers);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('accessToken');
  });
});
