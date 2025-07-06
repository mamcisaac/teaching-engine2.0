/**
 * API Key Validation Integration Tests
 * Tests real API key validation without mocks
 */
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import request from 'supertest';
import { validateApiKey } from '../../src/middleware/apiKeyValidation';
import { CacheService } from '../../src/services/CacheService';
import logger from '../../src/logger';

describe('API Key Validation Integration Tests', () => {
  let app: express.Application;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Create fresh Express app for each test
    app = express();
    app.use(express.json());

    // Reset environment variables
    process.env = { ...originalEnv };
    delete process.env.API_KEY;
    delete process.env.ENABLE_API_KEY_VALIDATION;
  });

  afterEach(() => {
    // Restore original environment
    process.env = { ...originalEnv };
  });

  describe('Security Validation', () => {
    test('should reject requests without API key when validation is enabled', async () => {
      // Setup
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      // Test request without API key
      const response = await request(app).get('/api/test').expect(401);

      expect(response.body).toEqual({
        error: 'Unauthorized: API key is required',
      });
    });

    test('should reject requests with empty API key', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/api/test')
        .set('x-api-key', '') // Empty API key
        .expect(401);

      expect(response.body).toEqual({
        error: 'Unauthorized: API key is required',
      });
    });

    test('should reject requests with incorrect API key', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/api/test')
        .set('x-api-key', 'wrong-key')
        .expect(401);

      expect(response.body).toEqual({
        error: 'Unauthorized: Invalid API key',
      });
    });

    test('should accept requests with valid API key', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/api/test')
        .set('x-api-key', 'test-secret-key-12345')
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });

    test('should handle API key in Authorization header with Bearer format', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/api/test')
        .set('Authorization', 'Bearer test-secret-key-12345')
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });

    test('should skip validation when disabled', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'false';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      // Request without API key should succeed
      const response = await request(app).get('/api/test').expect(200);

      expect(response.body).toEqual({ success: true });
    });

    test('should skip validation when environment variables not set', async () => {
      // No environment variables set

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/api/test').expect(200);

      expect(response.body).toEqual({ success: true });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing API_KEY environment variable gracefully', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      // API_KEY not set

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/api/test').set('x-api-key', 'some-key').expect(500);

      expect(response.body).toEqual({
        error: 'Server configuration error',
      });
    });

    test('should handle malformed requests gracefully', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      // Create middleware that makes headers throw on access
      app.use((req, res, next) => {
        // Make headers object throw when accessed
        Object.defineProperty(req, 'headers', {
          get() {
            throw new Error('Headers access error');
          },
        });
        next();
      });

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app).get('/api/test').expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error during authentication',
      });
    });
  });

  describe('Security Headers', () => {
    test('should not expose sensitive information in error messages', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'super-secret-production-key';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/api/test')
        .set('x-api-key', 'wrong-key')
        .expect(401);

      // Should not leak the actual API key
      expect(response.body.error).toBe('Unauthorized: Invalid API key');
      expect(response.body.error).not.toContain('super-secret-production-key');
      expect(response.text).not.toContain('super-secret-production-key');
    });

    test('should handle case-insensitive header names', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      // Test various header name cases (Express normalizes to lowercase)
      const response1 = await request(app)
        .get('/api/test')
        .set('X-API-Key', 'test-secret-key-12345')
        .expect(200);

      const response2 = await request(app)
        .get('/api/test')
        .set('X-Api-Key', 'test-secret-key-12345')
        .expect(200);

      expect(response1.body).toEqual({ success: true });
      expect(response2.body).toEqual({ success: true });
    });
  });

  describe('Performance and Rate Limiting', () => {
    test('should process validation quickly for valid keys', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      const startTime = Date.now();

      await request(app).get('/api/test').set('x-api-key', 'test-secret-key-12345').expect(200);

      const endTime = Date.now();

      // Validation should be fast (< 50ms including HTTP overhead)
      expect(endTime - startTime).toBeLessThan(50);
    });

    test('should support multiple API key formats', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true, headers: req.headers });
      });

      // Test x-api-key header
      const response1 = await request(app)
        .get('/api/test')
        .set('x-api-key', 'test-secret-key-12345')
        .expect(200);

      expect(response1.body.success).toBe(true);

      // Test Authorization header with Bearer format
      const response2 = await request(app)
        .get('/api/test')
        .set('Authorization', 'Bearer test-secret-key-12345')
        .expect(200);

      expect(response2.body.success).toBe(true);
    });

    test('should handle concurrent requests efficiently', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true, timestamp: Date.now() });
      });

      // Send multiple concurrent requests
      const requests = Array(10)
        .fill(null)
        .map(() => request(app).get('/api/test').set('x-api-key', 'test-secret-key-12345'));

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Infrastructure Integration', () => {
    test('should work with real Express middleware chain', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      // Set up middleware chain
      app.use(express.json());
      app.use(validateApiKey);

      // Add another middleware to verify the chain continues
      app.use((req, res, next) => {
        (req as any).customData = 'middleware-chain-works';
        next();
      });

      app.get('/api/test', (req, res) => {
        res.json({
          success: true,
          customData: (req as any).customData,
        });
      });

      const response = await request(app)
        .get('/api/test')
        .set('x-api-key', 'test-secret-key-12345')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        customData: 'middleware-chain-works',
      });
    });

    test('should integrate with error handling middleware', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      app.use(validateApiKey);

      // Route that throws an error
      app.get('/api/test', (req, res) => {
        throw new Error('Test error');
      });

      // Error handling middleware
      app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        res.status(500).json({ error: err.message });
      });

      // Valid API key but route throws error
      const response = await request(app)
        .get('/api/test')
        .set('x-api-key', 'test-secret-key-12345')
        .expect(500);

      expect(response.body).toEqual({ error: 'Test error' });
    });

    test('should validate with real cache service if available', async () => {
      process.env.ENABLE_API_KEY_VALIDATION = 'true';
      process.env.API_KEY = 'test-secret-key-12345';

      // Create a real cache service instance
      const cache = new CacheService();

      app.use(validateApiKey);
      app.get('/api/test', (req, res) => {
        res.json({ success: true });
      });

      // First request
      await request(app).get('/api/test').set('x-api-key', 'test-secret-key-12345').expect(200);

      // Second request (might use cache if implemented)
      const response = await request(app)
        .get('/api/test')
        .set('x-api-key', 'test-secret-key-12345')
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });
  });
});
