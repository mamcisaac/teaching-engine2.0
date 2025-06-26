/**
 * Lesson Plan AI Snapshot Tests
 * 
 * Tests AI-generated lesson plans against stored snapshots
 * to detect regressions and ensure consistency.
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { AISnapshotTestBase } from './ai-snapshot-base.test';
import { AISnapshotNormalizer } from '../utils/ai-testing/aiSnapshotNormalizer';
import { AITestDataGenerator, AITestMockResponses } from '../utils/ai-testing/aiTestData';
import { generateLessonPlanDraft } from '../../src/services/aiDraftService';
import { AI_TESTING_CONFIG } from '../utils/ai-testing/aiTestUtils';

describe('Lesson Plan AI Snapshot Tests', () => {
  beforeAll(async () => {
    await AISnapshotTestBase.setupTestEnvironment();
  });

  afterAll(async () => {
    await AISnapshotTestBase.cleanupTestEnvironment();
    await AISnapshotTestBase.generateSummaryReport();
  });

  describe('Grade 1 Mathematics Lessons', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 1,
      subject: 'Mathematics'
    });

    test.each(scenarios)(
      'should generate consistent lesson plan for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockLessonPlan(scenario);
          }
          return await generateLessonPlanDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'lesson-plans',
          scenario,
          aiFunction,
          AITestDataGenerator.generateLessonPlanInput,
          AISnapshotNormalizer.normalizeLessonPlan
        );
      }
    );
  });

  describe('Grade 3 Language Arts Lessons', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 3,
      subject: 'Language Arts'
    });

    test.each(scenarios)(
      'should generate consistent lesson plan for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockLessonPlan(scenario);
          }
          return await generateLessonPlanDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'lesson-plans',
          scenario,
          aiFunction,
          AITestDataGenerator.generateLessonPlanInput,
          AISnapshotNormalizer.normalizeLessonPlan
        );
      }
    );
  });

  describe('Grade 5 Science Lessons', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 5,
      subject: 'Science'
    });

    test.each(scenarios)(
      'should generate consistent lesson plan for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockLessonPlan(scenario);
          }
          return await generateLessonPlanDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'lesson-plans',
          scenario,
          aiFunction,
          AITestDataGenerator.generateLessonPlanInput,
          AISnapshotNormalizer.normalizeLessonPlan
        );
      }
    );
  });

  describe('Three-Part Lesson Structure Validation', () => {
    test('should maintain proper minds-on, action, consolidation structure', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        // Verify three-part structure exists
        expect(response.mindsOn).toBeDefined();
        expect(response.action).toBeDefined();
        expect(response.consolidation).toBeDefined();
        
        // Each part should have description and duration
        expect(response.mindsOn.description).toBeDefined();
        expect(response.mindsOn.duration).toBeDefined();
        expect(response.action.description).toBeDefined();
        expect(response.action.duration).toBeDefined();
        expect(response.consolidation.description).toBeDefined();
        expect(response.consolidation.duration).toBeDefined();
        
        // Durations should be reasonable
        expect(response.mindsOn.duration).toBeGreaterThan(0);
        expect(response.action.duration).toBeGreaterThan(0);
        expect(response.consolidation.duration).toBeGreaterThan(0);
        
        // Action should be the longest part
        expect(response.action.duration).toBeGreaterThan(response.mindsOn.duration);
        expect(response.action.duration).toBeGreaterThan(response.consolidation.duration);
        
        // Total should match input duration (approximately)
        const totalDuration = response.mindsOn.duration + response.action.duration + response.consolidation.duration;
        const expectedDuration = scenario.context?.duration || 45;
        expect(totalDuration).toBeGreaterThanOrEqual(expectedDuration * 0.9);
        expect(totalDuration).toBeLessThanOrEqual(expectedDuration * 1.1);
      }
    });

    test('should provide meaningful descriptions for each lesson phase', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        // Minds-on should be engaging and activating
        expect(response.mindsOn.description.length).toBeGreaterThan(30);
        expect(response.mindsOn.description.toLowerCase()).toMatch(/warm.up|activate|introduce|review|engage/);
        
        // Action should describe main activities
        expect(response.action.description.length).toBeGreaterThan(50);
        expect(response.action.description.toLowerCase()).toMatch(/activity|practice|explore|learn|work|collaborate/);
        
        // Consolidation should focus on reflection and sharing
        expect(response.consolidation.description.length).toBeGreaterThan(30);
        expect(response.consolidation.description.toLowerCase()).toMatch(/reflect|share|discuss|summarize|conclude/);
      }
    });
  });

  describe('Learning Goals and Success Criteria', () => {
    test('should provide clear, measurable learning goals', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        expect(response.learningGoals).toBeDefined();
        expect(Array.isArray(response.learningGoals)).toBe(true);
        expect(response.learningGoals.length).toBeGreaterThan(0);
        expect(response.learningGoals.length).toBeLessThanOrEqual(5); // Not too many
        
        for (const goal of response.learningGoals) {
          expect(typeof goal).toBe('string');
          expect(goal.length).toBeGreaterThan(25);
          
          // Should start with "Students will" or similar
          expect(goal.toLowerCase()).toMatch(/students will|learners will|pupils will/);
          
          // Should contain action verbs appropriate for the grade
          if (scenario.grade <= 2) {
            expect(goal.toLowerCase()).toMatch(/identify|name|show|tell|use|practice/);
          } else {
            expect(goal.toLowerCase()).toMatch(/analyze|explain|compare|demonstrate|apply|create/);
          }
        }
      }
    });

    test('should align success criteria with learning goals', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        expect(response.successCriteria).toBeDefined();
        expect(Array.isArray(response.successCriteria)).toBe(true);
        expect(response.successCriteria.length).toBeGreaterThan(0);
        
        for (const criteria of response.successCriteria) {
          expect(typeof criteria).toBe('string');
          expect(criteria.length).toBeGreaterThan(20);
          
          // Success criteria should be observable
          expect(criteria.toLowerCase()).toMatch(/can|will|able to|demonstrate|show|explain/);
        }
        
        // Number of success criteria should be reasonable relative to learning goals
        expect(response.successCriteria.length).toBeLessThanOrEqual(response.learningGoals.length + 2);
      }
    });
  });

  describe('Resources and Materials', () => {
    test('should provide appropriate and realistic resource lists', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        expect(response.resources).toBeDefined();
        expect(Array.isArray(response.resources)).toBe(true);
        expect(response.resources.length).toBeGreaterThan(0);
        
        // Resources should be realistic and available in classrooms
        const commonResources = [
          'whiteboard', 'markers', 'paper', 'pencils', 'books',
          'worksheets', 'manipulatives', 'charts', 'materials'
        ];
        
        const resourceText = response.resources.join(' ').toLowerCase();
        const hasCommonResources = commonResources.some(resource => resourceText.includes(resource));
        expect(hasCommonResources).toBe(true);
        
        // Should not include expensive or unrealistic resources for most lessons
        const unrealisticResources = ['laptop for each student', 'smart board', 'virtual reality'];
        for (const resource of unrealisticResources) {
          expect(resourceText).not.toContain(resource.toLowerCase());
        }
      }
    });

    test('should tailor resources to subject and grade level', async () => {
      const mathScenario = AISnapshotTestBase.getTestScenarios({
        subject: 'Mathematics'
      })[0];
      const mathResponse = AITestMockResponses.mockLessonPlan(mathScenario);
      
      const mathResourceText = mathResponse.resources.join(' ').toLowerCase();
      expect(mathResourceText).toMatch(/manipulatives|counters|blocks|number|calculator|math/);
      
      // Primary grades should include more concrete materials
      if (mathScenario.grade <= 2) {
        expect(mathResourceText).toMatch(/bears|blocks|counters|manipulatives/);
      }
    });
  });

  describe('Accommodations and Assessment', () => {
    test('should provide meaningful accommodations', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        expect(response.accommodations).toBeDefined();
        expect(typeof response.accommodations).toBe('string');
        expect(response.accommodations.length).toBeGreaterThan(30);
        
        // Should include common accommodation strategies
        expect(response.accommodations.toLowerCase()).toMatch(
          /visual|support|time|extended|multiple|ways|demonstrate|understand/
        );
        
        // Advanced lessons should include more sophisticated accommodations
        if (scenario.complexity === 'advanced') {
          expect(response.accommodations.toLowerCase()).toMatch(/extension|challenge|additional/);
        }
      }
    });

    test('should include appropriate assessment strategies', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        expect(response.assessmentStrategy).toBeDefined();
        expect(typeof response.assessmentStrategy).toBe('string');
        expect(response.assessmentStrategy.length).toBeGreaterThan(25);
        
        // Assessment should be appropriate for grade level
        if (scenario.grade <= 2) {
          expect(response.assessmentStrategy.toLowerCase()).toMatch(
            /observation|checklist|discussion|demonstration/
          );
        } else {
          expect(response.assessmentStrategy.toLowerCase()).toMatch(
            /assessment|evaluation|rubric|performance|portfolio/
          );
        }
      }
    });
  });

  describe('Age and Grade Appropriateness', () => {
    test('should use age-appropriate language and concepts', async () => {
      const primaryScenarios = AISnapshotTestBase.getTestScenarios().filter(s => s.grade <= 2);
      const intermediateScenarios = AISnapshotTestBase.getTestScenarios().filter(s => s.grade >= 4);
      
      for (const scenario of primaryScenarios.slice(0, 2)) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        const allText = JSON.stringify(response).toLowerCase();
        
        // Primary should use simpler language
        expect(allText).toMatch(/play|fun|explore|discover|hands.on/);
        expect(allText).not.toMatch(/analyze|synthesize|evaluate|critique/);
      }
      
      for (const scenario of intermediateScenarios.slice(0, 2)) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        const allText = JSON.stringify(response).toLowerCase();
        
        // Intermediate can use more complex language
        expect(allText).toMatch(/analyze|compare|investigate|explain|demonstrate/);
      }
    });

    test('should provide appropriate time allocations for different grades', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios();
      
      for (const scenario of scenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        // Younger students should have shorter activity segments
        if (scenario.grade <= 2) {
          expect(response.action.duration).toBeLessThanOrEqual(25);
          expect(response.mindsOn.duration).toBeLessThanOrEqual(10);
        } else {
          // Older students can handle longer segments
          expect(response.action.duration).toBeGreaterThanOrEqual(15);
        }
      }
    });
  });

  describe('Consistency and Structure', () => {
    test('should maintain consistent structure across multiple generations', async () => {
      const testScenario = AISnapshotTestBase.getTestScenarios()[0];
      
      const responses = [];
      for (let i = 0; i < 3; i++) {
        responses.push(AITestMockResponses.mockLessonPlan(testScenario));
      }
      
      // All responses should have the same required fields
      const requiredFields = [
        'title', 'learningGoals', 'successCriteria',
        'mindsOn', 'action', 'consolidation',
        'resources', 'accommodations', 'assessmentStrategy'
      ];
      
      for (const response of responses) {
        for (const field of requiredFields) {
          expect(response).toHaveProperty(field);
        }
        
        // Three-part structure should always be present
        expect(response.mindsOn).toHaveProperty('description');
        expect(response.mindsOn).toHaveProperty('duration');
        expect(response.action).toHaveProperty('description');
        expect(response.action).toHaveProperty('duration');
        expect(response.consolidation).toHaveProperty('description');
        expect(response.consolidation).toHaveProperty('duration');
      }
    });

    test('should generate titles that reflect lesson content', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        expect(response.title).toBeDefined();
        expect(typeof response.title).toBe('string');
        expect(response.title.length).toBeGreaterThan(10);
        expect(response.title.length).toBeLessThan(100);
        
        // Title should relate to the subject
        expect(response.title.toLowerCase()).toMatch(
          new RegExp(scenario.subject.toLowerCase().replace(' ', '|'))
        );
      }
    });
  });
});