/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Real AI Service Tests - Testing actual OpenAI integration
 * These tests use real API calls when OPENAI_API_KEY is available,
 * otherwise they skip to avoid failures in CI/CD environments
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import OpenAI from 'openai';
import { AIService } from '../aiService';
import logger from '../../../logger';

// Test configuration
const REAL_API_KEY = process.env.OPENAI_API_KEY;
const ENABLE_REAL_TESTS = process.env.ENABLE_REAL_AI_TESTS === 'true' || !!REAL_API_KEY;
const TEST_TIMEOUT = 30000; // 30 seconds for real API calls

describe('AIService - Real Implementation Tests', () => {
  let aiService: AIService;
  let openAIClient: OpenAI;

  beforeAll(() => {
    if (!ENABLE_REAL_TESTS) {
      console.log('🔕 Skipping real AI tests - set ENABLE_REAL_AI_TESTS=true and provide OPENAI_API_KEY to run');
    }
  });

  beforeEach(() => {
    if (!ENABLE_REAL_TESTS) return;

    openAIClient = new OpenAI({
      apiKey: REAL_API_KEY || 'test-key',
      timeout: 30000,
    });

    aiService = new AIService({
      openAIClient,
      apiKey: REAL_API_KEY || 'test-key',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000, // Lower for tests to save costs
    });
  });

  afterEach(() => {
    // Clean up any resources if needed
  });

  describe('Real Lesson Generation', () => {
    test('should generate a real lesson plan for Grade 3 Math', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const input = {
        grade: '3',
        subject: 'Math',
        topic: 'Addition and Subtraction',
        duration: 45,
        standards: ['3.NBT.2'],
        objectives: ['Students will add and subtract within 1000'],
        learningStyle: 'visual',
        classSize: 20,
      };

      const result = await aiService.generateLesson(input);

      // Validate structure
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('objectives');
      expect(result).toHaveProperty('activities');
      expect(result).toHaveProperty('materials');
      expect(result).toHaveProperty('duration');

      // Validate content quality
      expect(result.title).toContain('Grade 3');
      expect(result.title.toLowerCase()).toContain('math');
      expect(result.objectives).toHaveLength(1);
      expect(result.activities).toHaveLength.greaterThan(0);
      expect(result.duration).toBe(45);

      // Validate activities have proper structure
      result.activities.forEach((activity: any) => {
        expect(activity).toHaveProperty('name');
        expect(activity).toHaveProperty('duration');
        expect(activity).toHaveProperty('materials');
        expect(activity).toHaveProperty('description');
        expect(typeof activity.duration).toBe('number');
        expect(Array.isArray(activity.materials)).toBe(true);
      });

      // Log for manual inspection
      logger.info('Generated lesson plan:', { title: result.title, activities: result.activities.length });
    }, TEST_TIMEOUT);

    test('should generate lesson for different subjects', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const inputs = [
        { grade: '2', subject: 'Science', topic: 'Plants and Animals', duration: 30 },
        { grade: '4', subject: 'English', topic: 'Creative Writing', duration: 60 },
        { grade: '1', subject: 'Social Studies', topic: 'Community Helpers', duration: 45 },
      ];

      for (const input of inputs) {
        const result = await aiService.generateLesson(input);
        
        expect(result.title.toLowerCase()).toContain(input.subject.toLowerCase());
        expect(result.title).toContain(`Grade ${input.grade}`);
        expect(result.duration).toBe(input.duration);
        expect(result.activities).toHaveLength.greaterThan(0);

        // Activities should sum to approximately the lesson duration
        const totalActivityTime = result.activities.reduce(
          (sum: number, activity: any) => sum + activity.duration, 0
        );
        expect(totalActivityTime).toBeLessThanOrEqual(input.duration + 5); // Allow 5min buffer
      }
    }, TEST_TIMEOUT * 3);

    test('should handle special learning needs', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const input = {
        grade: '3',
        subject: 'Math',
        topic: 'Fractions',
        duration: 45,
        specialNeeds: ['visual impairment', 'ADHD'],
        learningStyle: 'kinesthetic',
      };

      const result = await aiService.generateLesson(input);

      expect(result).toHaveProperty('title');
      expect(result.activities).toHaveLength.greaterThan(0);
      
      // Should include accommodations in activities or materials
      const hasAccommodations = result.activities.some((activity: any) => 
        activity.description.toLowerCase().includes('visual') ||
        activity.description.toLowerCase().includes('hands-on') ||
        activity.description.toLowerCase().includes('kinesthetic')
      );
      
      expect(hasAccommodations).toBe(true);
    }, TEST_TIMEOUT);
  });

  describe('Real Activity Generation', () => {
    test('should generate hands-on science activity', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const input = {
        topic: 'States of Matter',
        grade: '4',
        subject: 'Science',
        type: 'hands-on',
        duration: 30,
      };

      const result = await aiService.generateActivity(input);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('instructions');
      expect(result).toHaveProperty('materials');
      expect(result).toHaveProperty('learningObjectives');

      expect(result.type).toBe('hands-on');
      expect(result.duration).toBe(30);
      expect(Array.isArray(result.instructions)).toBe(true);
      expect(Array.isArray(result.materials)).toBe(true);
      expect(Array.isArray(result.learningObjectives)).toBe(true);

      // Should have meaningful content
      expect(result.instructions).toHaveLength.greaterThan(1);
      expect(result.materials).toHaveLength.greaterThan(0);
    }, TEST_TIMEOUT);

    test('should generate different activity types', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const activityTypes = ['hands-on', 'discussion', 'creative', 'assessment'];
      
      for (const type of activityTypes) {
        const input = {
          topic: 'Weather Patterns',
          grade: '3',
          subject: 'Science',
          type,
          duration: 25,
        };

        const result = await aiService.generateActivity(input);
        
        expect(result.type).toBe(type);
        expect(result.name.toLowerCase()).toContain(type.toLowerCase());
        expect(result.instructions).toHaveLength.greaterThan(0);
      }
    }, TEST_TIMEOUT * 4);
  });

  describe('Real Substitute Plan Generation', () => {
    test('should generate comprehensive substitute plan', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const input = {
        date: new Date('2024-03-15'),
        grade: '2',
        subjects: ['Math', 'Reading', 'Science'],
        duration: 180, // 3 hours
        notes: 'Students have been working on addition facts',
      };

      const result = await aiService.generateSubstitutePlan(input);

      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('grade');
      expect(result).toHaveProperty('subjects');
      expect(result).toHaveProperty('schedule');
      expect(result).toHaveProperty('generalNotes');
      expect(result).toHaveProperty('emergencyContacts');

      expect(result.grade).toBe('2');
      expect(result.subjects).toEqual(['Math', 'Reading', 'Science']);
      expect(Array.isArray(result.schedule)).toBe(true);
      expect(result.schedule).toHaveLength(3); // One per subject

      // Validate schedule structure
      result.schedule.forEach((item: any) => {
        expect(item).toHaveProperty('time');
        expect(item).toHaveProperty('subject');
        expect(item).toHaveProperty('activity');
        expect(item).toHaveProperty('materials');
        expect(item).toHaveProperty('notes');
      });

      expect(Array.isArray(result.emergencyContacts)).toBe(true);
      expect(result.emergencyContacts).toHaveLength.greaterThan(0);
    }, TEST_TIMEOUT);
  });

  describe('Real Newsletter Generation', () => {
    test('should generate weekly classroom newsletter', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const input = {
        classroom: 'Grade 4A',
        dateRange: {
          start: new Date('2024-03-11'),
          end: new Date('2024-03-15'),
        },
        highlights: [
          'Completed science fair projects',
          'Started new reading unit on mystery stories',
          'Math assessment on fractions',
        ],
        upcomingEvents: ['Parent-teacher conferences', 'Field trip to science museum'],
        reminders: ['Bring water bottles', 'Library books due Friday'],
      };

      const result = await aiService.generateNewsletter(input);

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('dateRange');
      expect(result).toHaveProperty('sections');
      expect(result).toHaveProperty('footer');

      expect(result.title).toContain('Grade 4A');
      expect(result.dateRange).toEqual(input.dateRange);
      expect(Array.isArray(result.sections)).toBe(true);
      expect(result.sections).toHaveLength.greaterThan(0);

      // Should include all provided content
      const allContent = result.sections.map((s: any) => s.content).join(' ');
      expect(allContent).toContain('science fair');
      expect(allContent).toContain('mystery stories');
      expect(allContent).toContain('fractions');
    }, TEST_TIMEOUT);
  });

  describe('Real Curriculum Analysis', () => {
    test('should analyze curriculum content', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const curriculumContent = `
        Grade 3 Mathematics Curriculum
        Number Sense and Numeration:
        - Count to 1000 by 1s, 2s, 5s, 10s, and 100s
        - Read and write numbers to 1000
        - Compare and order numbers to 1000
        - Understand place value to thousands
        
        Measurement:
        - Measure length using standard units
        - Tell time to the nearest minute
        - Count money amounts to $10
      `;

      const result = await aiService.analyzeCurriculum(curriculumContent);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(50);
      
      // Should identify key curriculum elements
      expect(result.toLowerCase()).toContain('number');
      expect(result.toLowerCase()).toContain('measurement');
      expect(result.toLowerCase()).toMatch(/objective|skill|assess/);
    }, TEST_TIMEOUT);
  });

  describe('Real Question Generation', () => {
    test('should generate assessment questions', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const input = {
        topic: 'Multiplication facts',
        difficulty: 'medium',
        count: 3,
      };

      const result = await aiService.generateQuestions(input);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(50);
      expect(result.toLowerCase()).toContain('multiplication');
    }, TEST_TIMEOUT);
  });

  describe('Real Health Check', () => {
    test('should perform real API health check', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const isHealthy = await aiService.checkHealth();
      expect(typeof isHealthy).toBe('boolean');
      expect(isHealthy).toBe(true);
    }, TEST_TIMEOUT);

    test('should fail health check with invalid API key', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const invalidService = new AIService({
        apiKey: 'invalid-key-12345',
        model: 'gpt-3.5-turbo',
      });

      const isHealthy = await invalidService.checkHealth();
      expect(isHealthy).toBe(false);
    }, TEST_TIMEOUT);
  });

  describe('Real Error Handling', () => {
    test('should handle rate limiting gracefully', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      // This test might fail if not hitting rate limits, but should handle them gracefully
      const promises = Array(5).fill(0).map(() => 
        aiService.generateLesson({
          grade: '1',
          subject: 'Math',
          topic: `Test ${Math.random()}`,
          duration: 30,
        })
      );

      const results = await Promise.allSettled(promises);
      
      // All should resolve (with fallbacks if rate limited)
      results.forEach((result, index) => {
        expect(result.status).toBe('fulfilled');
        if (result.status === 'fulfilled') {
          expect(result.value).toHaveProperty('title');
          expect(result.value).toHaveProperty('activities');
        }
      });
    }, TEST_TIMEOUT * 2);

    test('should provide meaningful fallbacks on API errors', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      // Create service with very low timeout to force errors
      const timeoutService = new AIService({
        apiKey: REAL_API_KEY || 'test-key',
        model: 'gpt-3.5-turbo',
        timeout: 1, // 1ms - will timeout
      });

      const result = await timeoutService.generateLesson({
        grade: '3',
        subject: 'Math',
        topic: 'Addition',
        duration: 45,
      });

      // Should get a fallback response
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('activities');
      expect(result).toHaveProperty('fallback');
      expect(result.fallback).toBe(true);
      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
    }, TEST_TIMEOUT);
  });

  describe('Real Caching', () => {
    test('should cache identical requests', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const input = {
        grade: '2',
        subject: 'Reading',
        topic: 'Phonics',
        duration: 30,
      };

      const start1 = Date.now();
      const result1 = await aiService.generateLesson(input);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      const result2 = await aiService.generateLesson(input);
      const time2 = Date.now() - start2;

      // Second call should be much faster (cached)
      expect(time2).toBeLessThan(time1 / 2);
      expect(result2).toEqual(result1);
    }, TEST_TIMEOUT);
  });

  describe('Real Performance', () => {
    test('should generate lesson within reasonable time', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const input = {
        grade: '4',
        subject: 'Science',
        topic: 'Solar System',
        duration: 45,
      };

      const startTime = Date.now();
      const result = await aiService.generateLesson(input);
      const duration = Date.now() - startTime;

      expect(result).toHaveProperty('title');
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
    }, TEST_TIMEOUT);

    test('should handle concurrent requests efficiently', async () => {
      if (!ENABLE_REAL_TESTS) {
        test.skip();
        return;
      }

      const inputs = [
        { grade: '1', subject: 'Math', topic: 'Counting', duration: 30 },
        { grade: '2', subject: 'Science', topic: 'Weather', duration: 45 },
        { grade: '3', subject: 'Reading', topic: 'Comprehension', duration: 60 },
      ];

      const startTime = Date.now();
      const promises = inputs.map(input => aiService.generateLesson(input));
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.title).toContain(`Grade ${inputs[index].grade}`);
        expect(result.duration).toBe(inputs[index].duration);
      });

      // Should complete all within reasonable time
      expect(totalTime).toBeLessThan(30000); // 30 seconds for 3 concurrent requests
    }, TEST_TIMEOUT * 2);
  });
});