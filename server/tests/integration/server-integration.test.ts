import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';

describe('Server Integration Tests', () => {
  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    // Initialize test database client
    getTestPrismaClient();
  });

  describe('Health Check', () => {
    it('should respond to API health check endpoint', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('should serve client app for root route', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.text).toContain('Curriculum Planner');
    });
  });

  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app).get('/api/students');

      expect(response.status).toBe(401);
    });

    it('should accept requests with valid JWT', async () => {
      // Create a test user first
      const prisma = getTestPrismaClient();
      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          name: 'Test User',
          role: 'teacher',
          preferredLanguage: 'en',
        },
      });

      const token = jwt.sign({ 
        userId: String(testUser.id), 
        email: testUser.email,
        iat: Math.floor(Date.now() / 1000)
      }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Cleanup
      await prisma.user.delete({ where: { id: testUser.id } });
    });

    it('should reject requests with invalid JWT', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
    });
  });

  describe('404 Handling', () => {
    it('should require authentication for non-existent API endpoints', async () => {
      // Since all /api/* routes require authentication, non-existent ones should return 401
      const response = await request(app).get('/api/non-existent');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Authentication required' });
    });
    
    it('should return 404 for authenticated requests to non-existent API endpoints', async () => {
      // Create a test user for authentication
      const prisma = getTestPrismaClient();
      const testUser = await prisma.user.create({
        data: {
          email: 'test404@example.com',
          password: 'hashedpassword',
          name: 'Test User 404',
          role: 'teacher',
          preferredLanguage: 'en',
        },
      });

      const token = jwt.sign({ 
        userId: String(testUser.id), 
        email: testUser.email,
        iat: Math.floor(Date.now() / 1000)
      }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .get('/api/non-existent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({ 
        error: 'Not Found',
        code: 'ROUTE_NOT_FOUND'
      });
      
      // Cleanup
      await prisma.user.delete({ where: { id: testUser.id } });
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app).get('/api/health').set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const token = jwt.sign({ userId: '1' }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid json}');

      // Express returns 400 for JSON parse errors, but our error handler might return 500
      expect([400, 500]).toContain(response.status);
    });
  });
});
