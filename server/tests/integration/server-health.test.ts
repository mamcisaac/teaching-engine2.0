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
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should handle 404 for non-existent endpoints', async () => {
    const response = await request(app).get('/api/non-existent-endpoint');
    
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Not Found' });
  });

  it('should require authentication for protected endpoints', async () => {
    const response = await request(app).get('/api/activities');
    
    expect(response.status).toBe(401);
    // The response body might be empty or have error message
    expect(response.body).toBeDefined();
  });

  it('should accept authenticated requests', async () => {
    const token = jwt.sign({ userId: '1' }, process.env.JWT_SECRET || 'test-secret');
    
    const response = await request(app)
      .get('/api/subjects')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});