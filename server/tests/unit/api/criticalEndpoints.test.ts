/**
 * Critical API Endpoints - Comprehensive Test Coverage
 * Addresses Issue #264: API endpoint test coverage
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import { PrismaClient } from '@teaching-engine/database';
import { createTestApp } from '@/app';
import { rateLimiter } from '@/middleware/rateLimiter';

// Mock dependencies
jest.mock('@teaching-engine/database');
jest.mock('@/middleware/rateLimiter');

describe('Critical API Endpoints', () => {
  let app: Express;
  let mockPrisma: jest.Mocked<PrismaClient>;
  
  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    app = await createTestApp(mockPrisma);
  });
  
  afterEach(() => {
    jest.resetModules();
  });

  describe('POST /api/auth/login', () => {
    test('successful login returns token and user data', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        password: '$2a$10$hashedPassword',
        name: 'Test User',
        role: 'USER',
      };
      
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'ValidPass123!' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    test('validates required fields', async () => {
      const invalidRequests = [
        {},
        { email: 'test@example.com' },
        { password: 'password' },
        { email: '', password: 'password' },
        { email: 'test@example.com', password: '' },
      ];
      
      for (const invalidBody of invalidRequests) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(invalidBody);
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      }
    });
    
    test('validates email format', async () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
      ];
      
      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email, password: 'ValidPass123!' });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('email');
      }
    });
    
    test('prevents SQL injection attempts', async () => {
      const maliciousInputs = [
        { email: "' OR '1'='1", password: 'any' },
        { email: "admin'--", password: 'any' },
        { email: "1; DROP TABLE users;--", password: 'any' },
      ];
      
      for (const input of maliciousInputs) {
        mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);
        
        const response = await request(app)
          .post('/api/auth/login')
          .send(input);
        
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid credentials');
        
        // Verify the query was made safely
        expect(mockPrisma.user.findUnique).toHaveBeenCalled();
      }
    });
    
    test('rate limits login attempts', async () => {
      // Mock rate limiter to trigger after 5 requests
      let requestCount = 0;
      (rateLimiter as jest.Mock).mockImplementation((req, res, next) => {
        requestCount++;
        if (requestCount > 5) {
          res.status(429).json({ error: 'Too many requests' });
        } else {
          next();
        }
      });
      
      // Make 10 rapid requests
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'wrong' })
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
      expect(rateLimited[0].body.error).toBe('Too many requests');
    });
    
    test('logs failed login attempts', async () => {
      const mockLogger = jest.spyOn(console, 'warn').mockImplementation();
      
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        password: '$2a$10$wrongHash',
      });
      
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });
      
      expect(mockLogger).toHaveBeenCalledWith(
        expect.stringContaining('Failed login attempt')
      );
      
      mockLogger.mockRestore();
    });
  });

  describe('POST /api/auth/register', () => {
    test('creates new user with valid data', async () => {
      const newUser = {
        email: 'new@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      };
      
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);
      mockPrisma.user.create = jest.fn().mockResolvedValue({
        id: '456',
        ...newUser,
        password: '$2a$10$hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });
    
    test('prevents duplicate email registration', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        id: '123',
        email: 'existing@example.com',
      });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'SecurePass123!',
          name: 'Duplicate User',
        });
      
      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already exists');
    });
    
    test('validates password strength', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'short',
        'nouppercase1!',
        'NOLOWERCASE1!',
        'NoNumbers!',
        'NoSpecial123',
      ];
      
      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
            password,
            name: 'Test User',
          });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('password');
      }
    });
  });

  describe('GET /api/user/profile', () => {
    test('returns user profile for authenticated user', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer valid.jwt.token');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
      });
    });
    
    test('requires authentication', async () => {
      const response = await request(app)
        .get('/api/user/profile');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('authentication');
    });
    
    test('handles invalid tokens', async () => {
      const invalidTokens = [
        'invalid.token',
        'Bearer',
        'Bearer ',
        'malformed',
      ];
      
      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/user/profile')
          .set('Authorization', token);
        
        expect(response.status).toBe(401);
      }
    });
  });

  describe('PUT /api/user/password', () => {
    test('updates password with valid current password', async () => {
      const mockUser = {
        id: '123',
        password: '$2a$10$currentHashedPassword',
      };
      
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      mockPrisma.user.update = jest.fn().mockResolvedValue({
        ...mockUser,
        password: '$2a$10$newHashedPassword',
      });
      
      const response = await request(app)
        .put('/api/user/password')
        .set('Authorization', 'Bearer valid.jwt.token')
        .send({
          currentPassword: 'CurrentPass123!',
          newPassword: 'NewSecurePass123!',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('updated');
    });
    
    test('rejects incorrect current password', async () => {
      const mockUser = {
        id: '123',
        password: '$2a$10$currentHashedPassword',
      };
      
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      
      const response = await request(app)
        .put('/api/user/password')
        .set('Authorization', 'Bearer valid.jwt.token')
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewSecurePass123!',
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('incorrect');
    });
    
    test('validates new password strength', async () => {
      const response = await request(app)
        .put('/api/user/password')
        .set('Authorization', 'Bearer valid.jwt.token')
        .send({
          currentPassword: 'CurrentPass123!',
          newPassword: 'weak',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('password requirements');
    });
  });

  describe('Data Validation', () => {
    test('sanitizes user input to prevent XSS', async () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror="alert(\'xss\')">',
        '<svg onload="alert(\'xss\')">',
      ];
      
      for (const xssPayload of xssAttempts) {
        mockPrisma.user.create = jest.fn().mockImplementation(({ data }) => {
          // Verify data is sanitized
          expect(data.name).not.toContain('<script>');
          expect(data.name).not.toContain('javascript:');
          expect(data.name).not.toContain('onerror=');
          expect(data.name).not.toContain('onload=');
          
          return Promise.resolve({
            id: '123',
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
        
        const response = await request(app)
          .post('/api/user/create')
          .set('Authorization', 'Bearer admin.token')
          .send({
            email: 'test@example.com',
            name: xssPayload,
            role: 'USER',
          });
        
        expect(response.status).toBe(201);
      }
    });
    
    test('validates data types', async () => {
      const invalidDataTypes = [
        { age: 'not-a-number' },
        { active: 'not-a-boolean' },
        { tags: 'not-an-array' },
        { metadata: 'not-an-object' },
      ];
      
      for (const invalidData of invalidDataTypes) {
        const response = await request(app)
          .post('/api/data/validate')
          .send(invalidData);
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Invalid data type');
      }
    });
  });

  describe('Error Handling', () => {
    test('handles database connection errors', async () => {
      mockPrisma.user.findUnique = jest.fn().mockRejectedValue(
        new Error('Database connection failed')
      );
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer valid.token');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(response.body).not.toHaveProperty('stack');
    });
    
    test('handles unexpected errors gracefully', async () => {
      mockPrisma.user.findUnique = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer valid.token');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
    
    test('provides detailed errors in development mode', async () => {
      process.env.NODE_ENV = 'development';
      
      mockPrisma.user.findUnique = jest.fn().mockRejectedValue(
        new Error('Detailed error message')
      );
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer valid.token');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Detailed error message');
      expect(response.body).toHaveProperty('stack');
      
      process.env.NODE_ENV = 'test';
    });
  });
});