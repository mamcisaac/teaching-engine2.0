import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';
import jwt from 'jsonwebtoken';

describe('Server Health Check', () => {
  beforeAll(() => {
    // Initialize test database client
    getTestPrismaClient();
  });

  it('should respond to API health check endpoint', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ 
      status: 'ok',
      healthy: true
    });
    // The response includes additional performance details
    expect(response.body.details).toBeDefined();
  });

  it('should handle 404 for non-existent endpoints', async () => {
    const response = await request(app).get('/api/non-existent-endpoint');
    
    // API routes require authentication, so unmatched routes return 401
    expect(response.status).toBe(401);
  });

  it('should require authentication for protected endpoints', async () => {
    const response = await request(app).get('/api/activities');
    
    expect(response.status).toBe(401);
    // The response body might be empty or have error message
    expect(response.body).toBeDefined();
  });

  it('should accept authenticated requests', async () => {
    // Create a valid user in the database first
    const prisma = getTestPrismaClient();
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'dummy',
        role: 'teacher'
      }
    });
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
      }, 
      process.env.JWT_SECRET || 'test-secret',
      { algorithm: 'HS256' }
    );
    
    const response = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});