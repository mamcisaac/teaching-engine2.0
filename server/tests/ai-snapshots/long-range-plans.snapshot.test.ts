/**
 * Long-Range Plan AI Snapshot Tests
 * 
 * Tests AI-generated long-range plans against stored snapshots
 * to detect regressions and ensure consistency.
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { AISnapshotTestBase } from './ai-snapshot-base.test';
import { AISnapshotNormalizer } from '../utils/ai-testing/aiSnapshotNormalizer';
import { AITestDataGenerator, AITestMockResponses } from '../utils/ai-testing/aiTestData';
import { generateLongRangePlanDraft } from '../../src/services/aiDraftService';
import { AI_TESTING_CONFIG } from '../utils/ai-testing/aiTestUtils';

describe('Long-Range Plan AI Snapshot Tests', () => {
  beforeAll(async () => {
    await AISnapshotTestBase.setupTestEnvironment();
  });

  afterAll(async () => {
    await AISnapshotTestBase.cleanupTestEnvironment();
    await AISnapshotTestBase.generateSummaryReport();
  });

  describe('Grade 1 Mathematics', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 1,
      subject: 'Mathematics'
    });

    test.each(scenarios)(
      'should generate consistent long-range plan for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          // Use mock responses in test environment
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockLongRangePlan(scenario);
          }
          
          // Use real AI service if API key is available
          return await generateLongRangePlanDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'long-range-plans',
          scenario,
          aiFunction,
          AITestDataGenerator.generateLongRangePlanInput,
          AISnapshotNormalizer.normalizeLongRangePlan
        );
      }
    );
  });

  describe('Grade 3 Language Arts', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 3,
      subject: 'Language Arts'
    });

    test.each(scenarios)(
      'should generate consistent long-range plan for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockLongRangePlan(scenario);
          }
          return await generateLongRangePlanDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'long-range-plans',
          scenario,
          aiFunction,
          AITestDataGenerator.generateLongRangePlanInput,
          AISnapshotNormalizer.normalizeLongRangePlan
        );
      }
    );
  });

  describe('Grade 5 Science', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 5,
      subject: 'Science'
    });

    test.each(scenarios)(
      'should generate consistent long-range plan for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockLongRangePlan(scenario);
          }
          return await generateLongRangePlanDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'long-range-plans',
          scenario,
          aiFunction,
          AITestDataGenerator.generateLongRangePlanInput,
          AISnapshotNormalizer.normalizeLongRangePlan
        );
      }
    );
  });

  describe('Cross-Grade Complexity Analysis', () => {
    test('should show appropriate complexity progression across grades', async () => {
      const allScenarios = AISnapshotTestBase.getTestScenarios();
      const complexityAnalysis = {
        basic: [] as any[],
        intermediate: [] as any[],
        advanced: [] as any[],
      };

      // Generate responses for complexity analysis
      for (const scenario of allScenarios.slice(0, 6)) { // Test subset for performance
        const input = AITestDataGenerator.generateLongRangePlanInput(scenario);
        const response = AITestMockResponses.mockLongRangePlan(scenario);
        const normalized = AISnapshotNormalizer.normalizeLongRangePlan(response, scenario, input);

        complexityAnalysis[scenario.complexity].push({
          grade: scenario.grade,
          subject: scenario.subject,
          unitCount: response.units.length,
          averageDuration: response.units.reduce((sum: number, unit: any) => sum + unit.expectedDurationWeeks, 0) / response.units.length,
          bigIdeasCount: response.units.reduce((sum: number, unit: any) => sum + unit.bigIdeas.length, 0),
          qualityScore: normalized.validation.contentScore,
        });
      }

      // Verify complexity progression
      for (const complexity of ['basic', 'intermediate', 'advanced'] as const) {
        const scenarios = complexityAnalysis[complexity];
        if (scenarios.length > 0) {
          const avgQuality = scenarios.reduce((sum, s) => sum + s.qualityScore, 0) / scenarios.length;
          expect(avgQuality).toBeGreaterThanOrEqual(70);
          
          // Advanced scenarios should generally have higher quality scores
          if (complexity === 'advanced') {
            expect(avgQuality).toBeGreaterThanOrEqual(80);
          }
        }
      }

      // Save complexity analysis
      const analysisPath = require('path').join(
        AISnapshotTestBase['SNAPSHOTS_DIR'],
        'validation-reports',
        'long-range-plan-complexity-analysis.json'
      );
      
      await require('fs/promises').writeFile(
        analysisPath,
        JSON.stringify(complexityAnalysis, null, 2),
        'utf-8'
      );
    });
  });

  describe('Content Validation', () => {
    test('should ensure curriculum alignment in all long-range plans', async () => {
      const testScenario = AISnapshotTestBase.getTestScenarios()[0];
      const input = AITestDataGenerator.generateLongRangePlanInput(testScenario);
      const response = AITestMockResponses.mockLongRangePlan(testScenario);
      
      // Verify curriculum expectations are properly linked
      expect(response.units).toBeDefined();
      expect(response.units.length).toBeGreaterThan(0);
      
      for (const unit of response.units) {
        expect(unit.linkedExpectations).toBeDefined();
        expect(unit.linkedExpectations.length).toBeGreaterThan(0);
        
        // Ensure all linked expectations have valid codes
        for (const expectation of unit.linkedExpectations) {
          expect(expectation.code).toMatch(/^[A-Z]+\d+\.[A-Z]+\.[A-Z0-9]+$/);
          expect(['overall', 'specific']).toContain(expectation.type);
        }
      }
    });

    test('should maintain appropriate timeline estimates', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockLongRangePlan(scenario);
        
        for (const unit of response.units) {
          expect(unit.expectedDurationWeeks).toBeGreaterThan(0);
          expect(unit.expectedDurationWeeks).toBeLessThanOrEqual(12); // Reasonable maximum
          
          // Basic complexity should have shorter durations
          if (scenario.complexity === 'basic') {
            expect(unit.expectedDurationWeeks).toBeLessThanOrEqual(6);
          }
        }
      }
    });

    test('should include age-appropriate content', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios();
      
      for (const scenario of scenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockLongRangePlan(scenario);
        const contentText = JSON.stringify(response).toLowerCase();
        
        // Check for inappropriate content patterns
        const inappropriatePatterns = [
          /violence|violent/,
          /inappropriate|adult/,
          /dangerous|unsafe/,
        ];
        
        for (const pattern of inappropriatePatterns) {
          expect(contentText).not.toMatch(pattern);
        }
        
        // Ensure grade-appropriate vocabulary
        if (scenario.grade <= 2) {
          // Primary grades should use simpler language
          expect(contentText).not.toMatch(/complex|sophisticated|intricate/);
        }
      }
    });
  });

  describe('Performance and Consistency', () => {
    test('should generate responses within reasonable time limits', async () => {
      const testScenario = AISnapshotTestBase.getTestScenarios()[0];
      const input = AITestDataGenerator.generateLongRangePlanInput(testScenario);
      
      const startTime = Date.now();
      const response = AITestMockResponses.mockLongRangePlan(testScenario);
      const endTime = Date.now();
      
      expect(response).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds for mock response
    });

    test('should produce consistent structure across multiple runs', async () => {
      const testScenario = AISnapshotTestBase.getTestScenarios()[0];
      const input = AITestDataGenerator.generateLongRangePlanInput(testScenario);
      
      // Generate multiple responses
      const responses = [];
      for (let i = 0; i < 3; i++) {
        responses.push(AITestMockResponses.mockLongRangePlan(testScenario));
      }
      
      // All responses should have the same structure
      for (const response of responses) {
        expect(response).toHaveProperty('units');
        expect(Array.isArray(response.units)).toBe(true);
        expect(response.units.length).toBeGreaterThan(0);
        
        for (const unit of response.units) {
          expect(unit).toHaveProperty('title');
          expect(unit).toHaveProperty('bigIdeas');
          expect(unit).toHaveProperty('linkedExpectations');
          expect(Array.isArray(unit.bigIdeas)).toBe(true);
          expect(Array.isArray(unit.linkedExpectations)).toBe(true);
        }
      }
    });
  });
});