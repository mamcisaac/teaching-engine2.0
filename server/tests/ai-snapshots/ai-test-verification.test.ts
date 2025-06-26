/**
 * Quick verification test for AI snapshot testing infrastructure
 */

import { describe, test, expect } from '@jest/globals';
import { AITestDataGenerator, AITestMockResponses } from '../utils/ai-testing/aiTestData';
import { AIContentValidator } from '../utils/ai-testing/aiTestUtils';
import { AISnapshotNormalizer } from '../utils/ai-testing/aiSnapshotNormalizer';

describe('AI Testing Infrastructure Verification', () => {
  test('should generate test scenarios correctly', () => {
    const scenarios = AITestDataGenerator.generateTestScenarios();
    
    expect(scenarios).toBeDefined();
    expect(Array.isArray(scenarios)).toBe(true);
    expect(scenarios.length).toBeGreaterThan(0);
    
    // Verify structure of first scenario
    const firstScenario = scenarios[0];
    expect(firstScenario).toHaveProperty('id');
    expect(firstScenario).toHaveProperty('name');
    expect(firstScenario).toHaveProperty('grade');
    expect(firstScenario).toHaveProperty('subject');
    expect(firstScenario).toHaveProperty('complexity');
    expect(firstScenario).toHaveProperty('expectations');
    
    console.log(`✅ Generated ${scenarios.length} test scenarios`);
  });

  test('should validate content correctly', () => {
    const goodContent = {
      title: 'Grade 1 Mathematics Lesson',
      learningGoals: ['Students will count to 10', 'Students will recognize numbers'],
      mindsOnDescription: 'Start with a fun counting game',
      actionDescription: 'Practice counting with manipulatives',
      consolidationDescription: 'Share what we learned about numbers',
    };
    
    const validation = AIContentValidator.validateContent(goodContent, 'lessonPlan');
    
    expect(validation).toHaveProperty('isValid');
    expect(validation).toHaveProperty('score');
    expect(validation).toHaveProperty('issues');
    expect(validation).toHaveProperty('warnings');
    
    expect(validation.isValid).toBe(true);
    expect(validation.score).toBeGreaterThan(0);
    
    console.log(`✅ Content validation working, score: ${validation.score}`);
  });

  test('should normalize snapshots correctly', () => {
    const scenarios = AITestDataGenerator.generateTestScenarios();
    const testScenario = scenarios[0];
    
    const mockResponse = {
      title: 'Test Plan',
      bigIdeas: ['Learning is important'],
      timelineEstimateWeeks: 3,
    };
    
    const mockInput = { grade: 1, subject: 'Mathematics' };
    
    const normalized = AISnapshotNormalizer.normalizeUnitPlan(
      mockResponse, 
      testScenario, 
      mockInput
    );
    
    expect(normalized).toHaveProperty('metadata');
    expect(normalized).toHaveProperty('input');
    expect(normalized).toHaveProperty('response');
    expect(normalized).toHaveProperty('validation');
    
    expect(normalized.metadata.testType).toBe('unit-plan');
    expect(normalized.metadata.scenario).toBe(testScenario.id);
    
    console.log(`✅ Snapshot normalization working`);
  });

  test('should handle mock responses', () => {
    const scenarios = AITestDataGenerator.generateTestScenarios();
    const testScenario = scenarios[0];
    
    const mockPlan = AITestMockResponses.mockLongRangePlan(testScenario);
    
    expect(mockPlan).toHaveProperty('units');
    expect(Array.isArray(mockPlan.units)).toBe(true);
    expect(mockPlan.units.length).toBeGreaterThan(0);
    
    const firstUnit = mockPlan.units[0];
    expect(firstUnit).toHaveProperty('title');
    expect(firstUnit).toHaveProperty('bigIdeas');
    expect(firstUnit).toHaveProperty('linkedExpectations');
    
    console.log(`✅ Mock responses working`);
  });
});