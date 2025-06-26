import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import plannerStateRouter from '../../src/routes/planner-state';
import { prisma } from '../../src/prisma';

const app = express();
app.use(express.json());

// Mock authenticated user middleware
app.use((req: any, res, next) => {
  req.user = { userId: '1' };
  next();
});

app.use('/api/planner', plannerStateRouter);

describe('State Management Agent Security Tests', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.weeklyPlannerState.deleteMany();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.weeklyPlannerState.deleteMany();
  });

  describe('JSON Injection Prevention', () => {
    it('should reject malicious script injection in draftChanges', async () => {
      const maliciousPayload = {
        defaultView: 'week',
        draftChanges: {
          title: '<script>alert("XSS")</script>',
          content: 'javascript:void(0)',
          changes: {
            '<script>': 'malicious value'
          }
        }
      };

      const response = await request(app)
        .put('/api/planner/state')
        .send(maliciousPayload)
        .expect(200);

      // Verify script tags are sanitized
      expect(response.body.draftChanges.title).not.toContain('<script>');
      expect(response.body.draftChanges.title).not.toContain('alert');
      expect(response.body.draftChanges.content).not.toContain('javascript:');
    });

    it('should enforce size limits on draft changes', async () => {
      const oversizedPayload = {
        defaultView: 'week',
        draftChanges: {
          title: 'A'.repeat(300), // Exceeds 200 char limit
          content: 'B'.repeat(15000), // Exceeds 10000 char limit
        }
      };

      await request(app)
        .put('/api/planner/state')
        .send(oversizedPayload)
        .expect(400); // Should be rejected by validation
    });

    it('should reject prototype pollution attempts', async () => {
      const pollutionPayload = {
        defaultView: 'week',
        '__proto__': { isAdmin: true },
        draftChanges: {
          '__proto__': { polluted: true }
        }
      };

      await request(app)
        .put('/api/planner/state')
        .send(pollutionPayload)
        .expect(400); // Should be rejected by strict schema
    });
  });

  describe('CSRF Protection', () => {
    it('should block requests without proper origin', async () => {
      await request(app)
        .put('/api/planner/state')
        .set('Origin', 'http://evil.com')
        .send({ defaultView: 'week' })
        .expect(403);
    });

    it('should allow requests from allowed origins', async () => {
      await request(app)
        .put('/api/planner/state')
        .set('Origin', 'http://localhost:5173')
        .send({ defaultView: 'week' })
        .expect(200);
    });

    it('should block requests without origin or referer', async () => {
      await request(app)
        .put('/api/planner/state')
        .send({ defaultView: 'week' })
        .expect(403);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on state updates', async () => {
      const payload = { defaultView: 'week' };
      
      // Make rapid requests to test rate limiting
      const requests = Array(110).fill(0).map(() => 
        request(app)
          .put('/api/planner/state')
          .set('Origin', 'http://localhost:5173')
          .send(payload)
      );

      const responses = await Promise.all(requests);
      
      // Should have some rate-limited responses (429 status)
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Data Validation', () => {
    it('should validate enum values strictly', async () => {
      const invalidPayload = {
        defaultView: 'invalid_view',
        timeSlotDuration: 45, // Not in allowed [15, 30, 60]
        theme: 'rainbow'
      };

      await request(app)
        .put('/api/planner/state')
        .set('Origin', 'http://localhost:5173')
        .send(invalidPayload)
        .expect(400);
    });

    it('should validate working hours format', async () => {
      const invalidHours = {
        defaultView: 'week',
        workingHours: {
          start: '25:00', // Invalid time
          end: 'not-a-time'
        }
      };

      await request(app)
        .put('/api/planner/state')
        .set('Origin', 'http://localhost:5173')
        .send(invalidHours)
        .expect(400);
    });

    it('should validate autoSaveInterval bounds', async () => {
      const invalidInterval = {
        defaultView: 'week',
        autoSaveInterval: 500 // Exceeds max of 300
      };

      await request(app)
        .put('/api/planner/state')
        .set('Origin', 'http://localhost:5173')
        .send(invalidInterval)
        .expect(400);
    });
  });

  describe('Memory Limits', () => {
    it('should enforce maxHistorySize limits', async () => {
      const oversizedHistory = {
        defaultView: 'week',
        maxHistorySize: 150 // Exceeds max of 100
      };

      await request(app)
        .put('/api/planner/state')
        .set('Origin', 'http://localhost:5173')
        .send(oversizedHistory)
        .expect(400);
    });

    it('should limit offline data array size', async () => {
      const largeOfflineData = {
        defaultView: 'week',
        offlineData: {
          pendingChanges: Array(60).fill({ // Exceeds max of 50
            planId: 'test',
            title: 'test'
          })
        }
      };

      await request(app)
        .put('/api/planner/state')
        .set('Origin', 'http://localhost:5173')
        .send(largeOfflineData)
        .expect(400);
    });
  });

  describe('Response Security', () => {
    it('should return sanitized data in responses', async () => {
      // First create state with potentially dangerous content
      const payload = {
        defaultView: 'week',
        lastActiveView: '<img src=x onerror=alert(1)>',
        draftChanges: {
          title: '<b>Bold Title</b>',
          content: 'Normal content'
        }
      };

      const response = await request(app)
        .put('/api/planner/state')
        .set('Origin', 'http://localhost:5173')
        .send(payload)
        .expect(200);

      // Verify response is sanitized
      expect(response.body.lastActiveView).not.toContain('<img');
      expect(response.body.lastActiveView).not.toContain('onerror');
      expect(response.body.draftChanges.title).not.toContain('<b>');
    });

    it('should parse JSON fields correctly in responses', async () => {
      const payload = {
        defaultView: 'week',
        workingHours: { start: '09:00', end: '17:00' },
        draftChanges: { title: 'Test Title' }
      };

      const response = await request(app)
        .put('/api/planner/state')
        .set('Origin', 'http://localhost:5173')
        .send(payload)
        .expect(200);

      // Verify JSON fields are properly parsed objects, not strings
      expect(typeof response.body.workingHours).toBe('object');
      expect(response.body.workingHours.start).toBe('09:00');
      expect(typeof response.body.draftChanges).toBe('object');
      expect(response.body.draftChanges.title).toBe('Test Title');
    });
  });

  describe('Database Security', () => {
    it('should store data securely in database', async () => {
      const payload = {
        defaultView: 'week',
        workingHours: { start: '08:00', end: '16:00' },
        draftChanges: { title: 'Secure Title' }
      };

      await request(app)
        .put('/api/planner/state')
        .set('Origin', 'http://localhost:5173')
        .send(payload)
        .expect(200);

      // Verify data is stored as JSON strings in database
      const dbRecord = await prisma.weeklyPlannerState.findFirst({
        where: { userId: 1 }
      });

      expect(typeof dbRecord?.workingHours).toBe('string');
      expect(typeof dbRecord?.draftChanges).toBe('string');
      
      // Verify JSON is valid
      const parsedHours = JSON.parse(dbRecord!.workingHours);
      expect(parsedHours.start).toBe('08:00');
    });
  });
});