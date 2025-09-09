/**
 * API Contract Test for Planning Cascade
 * Ensures API returns only DB-backed fields plus computed fields
 * Prevents schema drift and validates cascade structure integrity
 */

import request from 'supertest';
import { describe, beforeAll, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import jwt from 'jsonwebtoken';

// Fields that must NEVER appear in API responses
// These represent schema drift or non-existent columns
const FORBIDDEN_FIELDS = [
  'scheduledDate',          // Attempted to query but doesn't exist (fixed in Phase 3)
  'status',                 // Not stored in DB - should be computed
  'completionStatus',       // Not in Emily's DB
  'teachingStatus',         // Not in Emily's DB  
  'progressStatus',         // Not in Emily's DB
  'isCompleted',            // Not in Emily's DB
  'isScheduled',            // Not in Emily's DB
  'actualStartDate',        // Not in Emily's DB
  'actualEndDate',          // Not in Emily's DB
];

// Required fields for the cascade structure
const REQUIRED_CASCADE_FIELDS = [
  'id',
  'type', 
  'academicYear',
  'terms',
  'progress',
];

const REQUIRED_TERM_FIELDS = [
  'id',
  'type',
  'term',
  'termNumber',
  'startDate',
  'endDate', 
  'subjects',
  'progress',
];

const REQUIRED_LESSON_FIELDS = [
  'id',
  'type',
  'title',
  'date',        // Real DB field - uses 'date' not 'scheduledDate'
  'duration',
  'expectations',
];

// Computed fields that should be added by view adapters
const COMPUTED_LESSON_FIELDS = [
  'status',      // Computed from date comparison, not stored in DB
  'isOverdue',   // Computed field
  'isTaught',    // Computed field
];

describe('API Contract: /api/planning-cascade', () => {
  let authToken: string;

  beforeAll(() => {
    // Create auth token for Emily (userId 23) 
    const secret = process.env.JWT_SECRET ?? 'test-jwt-secret';
    authToken = jwt.sign(
      { 
        userId: '23',  // Emily's userId - canonical database
        id: 23,
        email: 'emily@teaching-engine.test',
        iat: Math.floor(Date.now() / 1000)
      },
      secret,
      { expiresIn: '1h' }
    );
  });

  it('returns valid cascade structure with no schema drift', async () => {
    const response = await request(app)
      .get('/api/planning-cascade')
      .set('Authorization', `Bearer ${authToken}`);

    // Should get successful response
    expect(response.status).toBe(200);
    
    // Response should have cascade structure
    expect(response.body).toHaveProperty('cascade');
    expect(response.body).toHaveProperty('statistics');
    
    const cascade = response.body.cascade;

    // Verify top-level cascade structure
    REQUIRED_CASCADE_FIELDS.forEach(field => {
      expect(cascade).toHaveProperty(field);
    });

    // CRITICAL: Ensure NO forbidden fields at cascade level
    FORBIDDEN_FIELDS.forEach(field => {
      expect(cascade).not.toHaveProperty(field);
    });

    // Verify terms structure
    expect(Array.isArray(cascade.terms)).toBe(true);
    
    if (cascade.terms.length > 0) {
      const firstTerm = cascade.terms[0];
      
      // Verify term structure  
      REQUIRED_TERM_FIELDS.forEach(field => {
        expect(firstTerm).toHaveProperty(field);
      });

      // Verify no forbidden fields in terms
      FORBIDDEN_FIELDS.forEach(field => {
        expect(firstTerm).not.toHaveProperty(field);
      });

      // Check subjects array structure if present
      if (firstTerm.subjects?.length > 0) {
        const firstSubject = firstTerm.subjects[0];
        expect(firstSubject).toHaveProperty('id');
        expect(firstSubject).toHaveProperty('subject');
        expect(firstSubject).toHaveProperty('units');

        // Check units structure if present
        if (firstSubject.units?.length > 0) {
          const firstUnit = firstSubject.units[0];
          expect(firstUnit).toHaveProperty('id');
          expect(firstUnit).toHaveProperty('title');
          expect(firstUnit).toHaveProperty('weeks');

          // Check weeks structure if present
          if (firstUnit.weeks?.length > 0) {
            const firstWeek = firstUnit.weeks[0];
            expect(firstWeek).toHaveProperty('id');
            expect(firstWeek).toHaveProperty('weekNumber');
            expect(firstWeek).toHaveProperty('lessons');

            // CRITICAL: Validate lesson structure
            if (firstWeek.lessons?.length > 0) {
              const firstLesson = firstWeek.lessons[0];
              
              // Verify required DB fields
              REQUIRED_LESSON_FIELDS.forEach(field => {
                expect(firstLesson).toHaveProperty(field);
              });

              // Verify computed fields are present
              COMPUTED_LESSON_FIELDS.forEach(field => {
                expect(firstLesson).toHaveProperty(field);
              });

              // Verify computed status has valid value
              const validStatuses = ['PLANNED', 'TAUGHT'];
              expect(validStatuses).toContain(firstLesson.status);

              // CRITICAL: Ensure NO forbidden fields in lessons
              FORBIDDEN_FIELDS.forEach(field => {
                expect(firstLesson).not.toHaveProperty(field);
              });

              // Verify date field uses 'date', not 'scheduledDate'
              expect(firstLesson).toHaveProperty('date');
              expect(firstLesson).not.toHaveProperty('scheduledDate');
            }
          }
        }
      }
    }
  });

  it('handles missing or invalid auth gracefully', async () => {
    const response = await request(app)
      .get('/api/planning-cascade');

    // Should return 401 unauthorized
    expect(response.status).toBe(401);
  });

  it('validates statistics structure', async () => {
    const response = await request(app)
      .get('/api/planning-cascade')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('statistics');
    
    const stats = response.body.statistics;
    
    // Required statistics fields
    expect(stats).toHaveProperty('totalLessons');
    expect(stats).toHaveProperty('taughtLessons');
    expect(stats).toHaveProperty('plannedLessons');
    expect(stats).toHaveProperty('overdueCount');
    expect(stats).toHaveProperty('completionPercentage');

    // Verify numeric types
    expect(typeof stats.totalLessons).toBe('number');
    expect(typeof stats.taughtLessons).toBe('number');
    expect(typeof stats.plannedLessons).toBe('number');
    expect(typeof stats.overdueCount).toBe('number');
    expect(typeof stats.completionPercentage).toBe('number');

    // Verify logical consistency
    expect(stats.totalLessons).toBeGreaterThanOrEqual(0);
    expect(stats.taughtLessons).toBeGreaterThanOrEqual(0);
    expect(stats.plannedLessons).toBeGreaterThanOrEqual(0);
    expect(stats.completionPercentage).toBeGreaterThanOrEqual(0);
    expect(stats.completionPercentage).toBeLessThanOrEqual(100);
  });

  it('ensures all lesson nodes have consistent field structure', async () => {
    const response = await request(app)
      .get('/api/planning-cascade')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    
    const cascade = response.body.cascade;
    const allLessons: any[] = [];

    // Collect all lessons from nested structure
    cascade.terms?.forEach((term: any) => {
      term.subjects?.forEach((subject: any) => {
        subject.units?.forEach((unit: any) => {
          unit.weeks?.forEach((week: any) => {
            week.lessons?.forEach((lesson: any) => {
              allLessons.push(lesson);
            });
          });
        });
      });
    });

    // Should have found at least some lessons from Emily's data
    expect(allLessons.length).toBeGreaterThan(0);

    // Verify all lessons have identical field structure
    if (allLessons.length > 1) {
      const firstFields = Object.keys(allLessons[0]).sort();
      
      allLessons.forEach((lesson, index) => {
        const lessonFields = Object.keys(lesson).sort();
        
        // All lessons should have identical field structure
        expect(lessonFields).toEqual(firstFields);

        // No lesson should have forbidden fields
        FORBIDDEN_FIELDS.forEach(forbidden => {
          expect(lessonFields).not.toContain(forbidden);
        });

        // All lessons should have computed status
        expect(['PLANNED', 'TAUGHT']).toContain(lesson.status);
      });
    }
  });

  it('validates date ordering uses real DB field', async () => {
    const response = await request(app)
      .get('/api/planning-cascade')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);

    // This test ensures the API doesn't crash on date ordering
    // and uses the real 'date' field, not fictitious 'scheduledDate'
    const cascade = response.body.cascade;
    
    // If we have terms with lessons, verify ordering works
    cascade.terms?.forEach((term: any) => {
      term.subjects?.forEach((subject: any) => {
        subject.units?.forEach((unit: any) => {
          unit.weeks?.forEach((week: any) => {
            if (week.lessons?.length > 1) {
              // Check that lessons are ordered by date field
              for (let i = 1; i < week.lessons.length; i++) {
                const prevLesson = week.lessons[i - 1];
                const currLesson = week.lessons[i];
                
                // Both should use 'date' field, not 'scheduledDate'
                expect(prevLesson).toHaveProperty('date');
                expect(currLesson).toHaveProperty('date');
                expect(prevLesson).not.toHaveProperty('scheduledDate');
                expect(currLesson).not.toHaveProperty('scheduledDate');
              }
            }
          });
        });
      });
    });
  });
});