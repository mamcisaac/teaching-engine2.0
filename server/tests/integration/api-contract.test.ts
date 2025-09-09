/**
 * API Contract Test for ETFO Lesson Plans
 * Ensures API returns only DB-backed fields plus computed fields
 * Prevents fictitious columns from leaking to clients
 */

import request from 'supertest';
import { describe, beforeAll, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import jwt from 'jsonwebtoken';

// Fields that must NEVER appear in API responses
// These represent schema drift or fictitious columns
const FORBIDDEN_FIELDS = [
  'searchContent',          // Never existed in DB
  'substituteNotes',        // Fictitious field
  'behaviorAlerts',         // Fictitious field  
  'statusEnum',             // Schema-only name
  'isCompleted',            // Not in Emily's DB
  'completedDate',          // Not in Emily's DB
  'plannedDuration',        // Not in Emily's DB
  'actualDuration',         // Not in Emily's DB
  'reflectionNotes',        // May exist but shouldn't leak if not used
];

// Fields we know exist in Emily's database
const REQUIRED_DB_FIELDS = [
  'id',
  'userId', 
  'unitPlanId',
  'title',
  'date',
  'duration',
  'lessonNumber',
  'slotNumber',
  'createdAt',
  'updatedAt',
];

// Computed fields added by our view adapter
const COMPUTED_FIELDS = [
  'computedStatus',
];

describe('API Contract: /api/etfo-lesson-plans', () => {
  let authToken: string;

  beforeAll(() => {
    // Create auth token for Emily (userId 23)
    const secret = process.env.JWT_SECRET ?? 'test-jwt-secret';
    authToken = jwt.sign(
      { 
        userId: '23',  // Emily's userId
        id: 23,
        email: 'emily@teaching-engine.test',
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { expiresIn: '1h' }
    );
  });

  it('returns DB fields plus computed status; no fictitious columns', async () => {
    const response = await request(app)
      .get('/api/etfo-lesson-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ limit: 5 });

    // Should get successful response
    expect(response.status).toBe(200);
    
    // Response should be an object with items array
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
    
    // Should have at least one lesson from Emily's data
    const items = response.body.items;
    expect(items.length).toBeGreaterThan(0);

    // Check first item structure
    const firstItem = items[0];

    // Verify all required DB fields are present
    REQUIRED_DB_FIELDS.forEach(field => {
      expect(firstItem).toHaveProperty(field);
    });

    // Verify userId is Emily's
    expect(firstItem.userId).toBe(23);

    // Verify computed fields are present
    COMPUTED_FIELDS.forEach(field => {
      expect(firstItem).toHaveProperty(field);
    });

    // Verify computed status has valid value
    const validStatuses = ['PLANNED', 'SCHEDULED', 'TAUGHT', 'SKIPPED', 'RESCHEDULED'];
    expect(validStatuses).toContain(firstItem.computedStatus);

    // CRITICAL: Ensure NO forbidden fields are present
    FORBIDDEN_FIELDS.forEach(field => {
      expect(firstItem).not.toHaveProperty(field);
    });

    // Check all items follow the same contract
    items.forEach((item: any, index: number) => {
      // Each item should have required fields
      REQUIRED_DB_FIELDS.forEach(field => {
        expect(item).toHaveProperty(field);
      });

      // Each item should NOT have forbidden fields
      FORBIDDEN_FIELDS.forEach(field => {
        expect(item).not.toHaveProperty(field);
      });

      // Each item should belong to Emily
      expect(item.userId).toBe(23);
    });
  });

  it('handles missing or invalid auth gracefully', async () => {
    const response = await request(app)
      .get('/api/etfo-lesson-plans')
      .query({ limit: 5 });

    // Should return 401 unauthorized
    expect(response.status).toBe(401);
  });

  it('returns consistent field structure across different queries', async () => {
    // Query 1: Default query
    const response1 = await request(app)
      .get('/api/etfo-lesson-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ limit: 2 });

    // Query 2: With specific unit
    const response2 = await request(app)
      .get('/api/etfo-lesson-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ limit: 2, sort: 'date', order: 'desc' });

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    // Both should have items
    const items1 = response1.body.items;
    const items2 = response2.body.items;

    // Extract field names from first item of each response
    if (items1.length > 0 && items2.length > 0) {
      const fields1 = Object.keys(items1[0]).sort();
      const fields2 = Object.keys(items2[0]).sort();

      // Field structure should be identical
      expect(fields1).toEqual(fields2);

      // Neither should have forbidden fields
      const allFields = [...fields1, ...fields2];
      FORBIDDEN_FIELDS.forEach(forbidden => {
        expect(allFields).not.toContain(forbidden);
      });
    }
  });

  it('includes proper pagination metadata', async () => {
    const response = await request(app)
      .get('/api/etfo-lesson-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ limit: 10, offset: 0 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('total');
    expect(typeof response.body.total).toBe('number');
  });

  it('respects limit parameter', async () => {
    const limit = 3;
    const response = await request(app)
      .get('/api/etfo-lesson-plans')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ limit });

    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeLessThanOrEqual(limit);
  });
});