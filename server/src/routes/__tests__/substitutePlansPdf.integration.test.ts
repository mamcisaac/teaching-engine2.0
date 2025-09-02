/**
 * Integration test for substitute plan PDF generation endpoint
 */

import request from 'supertest';
import express from 'express';
import { SubstitutePlansRouteHandler } from '../SubstitutePlansRouteHandler';
import { prisma } from '../../prisma';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.mock('../../prisma', () => ({
  prisma: {
    substitutePlan: {
      findFirst: jest.fn(),
    },
    classRoutine: {
      findMany: jest.fn(),
    },
    daybookEntry: {
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    student: {
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

// Mock Puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn(() => Promise.resolve({
    newPage: jest.fn(() => Promise.resolve({
      setContent: jest.fn(),
      pdf: jest.fn(() => Promise.resolve(Buffer.from('%PDF-1.4\nmock pdf content'))),
    })),
    close: jest.fn(),
  })),
}));

describe('Substitute Plan PDF Endpoint', () => {
  let app: express.Application;
  let authToken: string;
  const userId = 1;
  const planId = 'test-plan-123';

  beforeEach(() => {
    // Create Express app with route handler
    app = express();
    app.use(express.json());
    
    // Add mock authentication middleware
    app.use((req: any, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token === 'valid-token') {
        req.userId = userId;
        next();
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    });
    
    // Mount the routes
    const routeHandler = new SubstitutePlansRouteHandler();
    app.use('/api/substitute-plans', routeHandler.getRouter());
    
    authToken = 'valid-token';
    
    // Setup default mock responses
    (prisma.substitutePlan.findFirst as jest.Mock).mockResolvedValue({
      id: planId,
      userId,
      title: 'Test Plan',
      dateFor: new Date('2025-09-15'),
      schedule: [{ time: '9:00 AM', activity: 'Math' }],
      emergencyInfo: { evacuationProcedure: 'Exit to playground' },
      generalNotes: 'Test notes',
    });
    
    (prisma.classRoutine.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.daybookEntry.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      name: 'Test Teacher',
      email: 'test@example.com',
      grade: 'Grade 1',
      program: 'Test Program',
    });
    (prisma.student.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.auditLog.create as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/substitute-plans/:id/pdf', () => {
    it('should return PDF when authenticated and plan exists', async () => {
      const response = await request(app)
        .get(`/api/substitute-plans/${planId}/pdf`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toMatch(/attachment; filename=/);
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.toString().startsWith('%PDF')).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get(`/api/substitute-plans/${planId}/pdf`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 404 when plan not found', async () => {
      (prisma.substitutePlan.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/substitute-plans/${planId}/pdf`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Substitute plan not found or access denied');
    });

    it('should return 400 for invalid plan ID format', async () => {
      const response = await request(app)
        .get('/api/substitute-plans/invalid-id/pdf')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid plan ID format');
    });

    it('should validate date is not too far in past or future', async () => {
      (prisma.substitutePlan.findFirst as jest.Mock).mockResolvedValue({
        id: planId,
        userId,
        title: 'Old Plan',
        dateFor: new Date('2020-01-01'), // Very old date
      });

      const response = await request(app)
        .get(`/api/substitute-plans/${planId}/pdf`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Plan date is too far from current date');
    });

    it('should include security headers in response', async () => {
      const response = await request(app)
        .get(`/api/substitute-plans/${planId}/pdf`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['cache-control']).toContain('no-cache');
      expect(response.headers['pragma']).toBe('no-cache');
    });
  });
});