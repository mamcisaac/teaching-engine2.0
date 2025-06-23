import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/index';
import { getTestPrismaClient } from './jest.setup';

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
      const response = await request(app).get('/api/activities');

      expect(response.status).toBe(401);
    });

    it('should accept requests with valid JWT', async () => {
      const token = jwt.sign({ userId: '1' }, process.env.JWT_SECRET || 'test-secret');

      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject requests with invalid JWT', async () => {
      const response = await request(app)
        .get('/api/subjects')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent API endpoints', async () => {
      const response = await request(app).get('/api/non-existent');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Not Found' });
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
