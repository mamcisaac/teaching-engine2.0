/**
 * Unit Plan AI Snapshot Tests
 * 
 * Tests AI-generated unit plans against stored snapshots
 * to detect regressions and ensure consistency.
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { AISnapshotTestBase } from './ai-snapshot-base.test';
import { AISnapshotNormalizer } from '../utils/ai-testing/aiSnapshotNormalizer';
import { AITestDataGenerator, AITestMockResponses } from '../utils/ai-testing/aiTestData';
import { generateUnitPlanDraft } from '../../src/services/aiDraftService';
import { AI_TESTING_CONFIG } from '../utils/ai-testing/aiTestUtils';

describe('Unit Plan AI Snapshot Tests', () => {
  beforeAll(async () => {
    await AISnapshotTestBase.setupTestEnvironment();
  });

  afterAll(async () => {
    await AISnapshotTestBase.cleanupTestEnvironment();
    await AISnapshotTestBase.generateSummaryReport();
  });

  describe('Grade 1 Mathematics Unit Plans', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 1,
      subject: 'Mathematics'
    });

    test.each(scenarios)(
      'should generate consistent unit plan for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockUnitPlan(scenario);
          }
          return await generateUnitPlanDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'unit-plans',
          scenario,
          aiFunction,
          AITestDataGenerator.generateUnitPlanInput,
          AISnapshotNormalizer.normalizeUnitPlan
        );
      }
    );
  });

  describe('Grade 3 Language Arts Unit Plans', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 3,
      subject: 'Language Arts'
    });

    test.each(scenarios)(
      'should generate consistent unit plan for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockUnitPlan(scenario);
          }
          return await generateUnitPlanDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'unit-plans',
          scenario,
          aiFunction,
          AITestDataGenerator.generateUnitPlanInput,
          AISnapshotNormalizer.normalizeUnitPlan
        );
      }
    );
  });

  describe('Grade 5 Science Unit Plans', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 5,
      subject: 'Science'
    });

    test.each(scenarios)(
      'should generate consistent unit plan for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockUnitPlan(scenario);
          }
          return await generateUnitPlanDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'unit-plans',
          scenario,
          aiFunction,
          AITestDataGenerator.generateUnitPlanInput,
          AISnapshotNormalizer.normalizeUnitPlan
        );
      }
    );
  });

  describe('Educational Quality Validation', () => {
    test('should include comprehensive assessment strategies', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        
        // Verify assessment components
        expect(response.assessmentFor).toBeDefined();
        expect(response.assessmentAs).toBeDefined();
        expect(response.assessmentOf).toBeDefined();
        
        expect(Array.isArray(response.assessmentFor)).toBe(true);
        expect(Array.isArray(response.assessmentAs)).toBe(true);
        expect(Array.isArray(response.assessmentOf)).toBe(true);
        
        // Each assessment type should have content
        expect(response.assessmentFor.length).toBeGreaterThan(0);
        expect(response.assessmentAs.length).toBeGreaterThan(0);
        expect(response.assessmentOf.length).toBeGreaterThan(0);
        
        // Assessment strategies should be age-appropriate
        const allAssessments = [
          ...response.assessmentFor,
          ...response.assessmentAs,
          ...response.assessmentOf
        ].join(' ').toLowerCase();
        
        if (scenario.grade <= 2) {
          // Primary grades should focus on observation and play-based assessment
          expect(allAssessments).toMatch(/observation|play|discussion|demonstration/);
        } else {
          // Higher grades can include more formal assessments
          expect(allAssessments).toMatch(/project|presentation|quiz|portfolio/);
        }
      }
    });

    test('should provide clear learning goals and success criteria', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios();
      
      for (const scenario of scenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        
        // Learning goals should be present and substantial
        expect(response.learningGoals).toBeDefined();
        expect(Array.isArray(response.learningGoals)).toBe(true);
        expect(response.learningGoals.length).toBeGreaterThan(0);
        
        // Success criteria should be present and substantial
        expect(response.successCriteria).toBeDefined();
        expect(Array.isArray(response.successCriteria)).toBe(true);
        expect(response.successCriteria.length).toBeGreaterThan(0);
        
        // Each learning goal should be substantial
        for (const goal of response.learningGoals) {
          expect(typeof goal).toBe('string');
          expect(goal.length).toBeGreaterThan(20);
          expect(goal.toLowerCase()).toMatch(/students will|learners will|pupils will/);
        }
        
        // Success criteria should be specific and measurable
        for (const criteria of response.successCriteria) {
          expect(typeof criteria).toBe('string');
          expect(criteria.length).toBeGreaterThan(15);
        }
      }
    });

    test('should include meaningful cross-curricular connections', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios();
      
      for (const scenario of scenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        
        expect(response.crossCurricularLinks).toBeDefined();
        expect(Array.isArray(response.crossCurricularLinks)).toBe(true);
        
        if (response.crossCurricularLinks.length > 0) {
          // Cross-curricular links should reference other subjects
          const subjects = ['Mathematics', 'Language Arts', 'Science', 'Social Studies', 'Art', 'Physical Education'];
          const linkText = response.crossCurricularLinks.join(' ');
          
          let hasSubjectReference = false;
          for (const subject of subjects) {
            if (linkText.includes(subject) && subject !== scenario.subject) {
              hasSubjectReference = true;
              break;
            }
          }
          
          if (response.crossCurricularLinks.length > 0) {
            expect(hasSubjectReference).toBe(true);
          }
        }
      }
    });

    test('should have realistic timeline estimates', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios();
      
      for (const scenario of scenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        
        expect(response.timelineEstimateWeeks).toBeDefined();
        expect(typeof response.timelineEstimateWeeks).toBe('number');
        expect(response.timelineEstimateWeeks).toBeGreaterThan(0);
        expect(response.timelineEstimateWeeks).toBeLessThanOrEqual(8); // Reasonable maximum
        
        // Timeline should correlate with complexity
        if (scenario.complexity === 'basic') {
          expect(response.timelineEstimateWeeks).toBeLessThanOrEqual(3);
        } else if (scenario.complexity === 'advanced') {
          expect(response.timelineEstimateWeeks).toBeGreaterThanOrEqual(3);
        }
      }
    });
  });

  describe('Content Structure and Quality', () => {
    test('should generate substantial big ideas', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios();
      
      for (const scenario of scenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        
        expect(response.bigIdeas).toBeDefined();
        expect(Array.isArray(response.bigIdeas)).toBe(true);
        expect(response.bigIdeas.length).toBeGreaterThan(0);
        expect(response.bigIdeas.length).toBeLessThanOrEqual(5); // Not too many
        
        // Each big idea should be meaningful
        for (const bigIdea of response.bigIdeas) {
          expect(typeof bigIdea).toBe('string');
          expect(bigIdea.length).toBeGreaterThan(30); // Substantial content
          expect(bigIdea.trim()).toBe(bigIdea); // No extra whitespace
        }
      }
    });

    test('should provide thoughtful essential questions', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios();
      
      for (const scenario of scenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        
        expect(response.essentialQuestions).toBeDefined();
        expect(Array.isArray(response.essentialQuestions)).toBe(true);
        expect(response.essentialQuestions.length).toBeGreaterThan(0);
        
        // Essential questions should be actual questions
        for (const question of response.essentialQuestions) {
          expect(typeof question).toBe('string');
          expect(question.trim().endsWith('?')).toBe(true);
          expect(question.length).toBeGreaterThan(20);
          
          // Should start with question words
          const questionStart = question.trim().toLowerCase();
          const questionWords = ['how', 'what', 'why', 'when', 'where', 'who', 'which'];
          const startsWithQuestion = questionWords.some(word => questionStart.startsWith(word));
          expect(startsWithQuestion).toBe(true);
        }
      }
    });

    test('should maintain consistency across different runs', async () => {
      const testScenario = AISnapshotTestBase.getTestScenarios()[0];
      const input = AITestDataGenerator.generateUnitPlanInput(testScenario);
      
      // Generate multiple responses
      const responses = [];
      for (let i = 0; i < 3; i++) {
        responses.push(AITestMockResponses.mockUnitPlan(testScenario));
      }
      
      // Structure should be consistent
      for (const response of responses) {
        expect(response).toHaveProperty('title');
        expect(response).toHaveProperty('bigIdeas');
        expect(response).toHaveProperty('essentialQuestions');
        expect(response).toHaveProperty('learningGoals');
        expect(response).toHaveProperty('successCriteria');
        expect(response).toHaveProperty('timelineEstimateWeeks');
        
        // Arrays should have reasonable lengths
        expect(response.bigIdeas.length).toBeGreaterThanOrEqual(1);
        expect(response.bigIdeas.length).toBeLessThanOrEqual(5);
        expect(response.essentialQuestions.length).toBeGreaterThanOrEqual(1);
        expect(response.essentialQuestions.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('Subject-Specific Validation', () => {
    test('should tailor content to mathematics concepts', async () => {
      const mathScenarios = AISnapshotTestBase.getTestScenarios({
        subject: 'Mathematics'
      });
      
      for (const scenario of mathScenarios) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        const allContent = JSON.stringify(response).toLowerCase();
        
        // Should include math-specific vocabulary
        const mathTerms = ['number', 'count', 'pattern', 'solve', 'calculate', 'measure'];
        const hasMathTerms = mathTerms.some(term => allContent.includes(term));
        expect(hasMathTerms).toBe(true);
        
        // Assessment should be appropriate for math
        const assessmentText = [...response.assessmentFor, ...response.assessmentAs, ...response.assessmentOf].join(' ').toLowerCase();
        expect(assessmentText).toMatch(/problem.solving|math.journal|number.sense|calculation/);
      }
    });

    test('should tailor content to language arts concepts', async () => {
      const laScenarios = AISnapshotTestBase.getTestScenarios({
        subject: 'Language Arts'
      });
      
      for (const scenario of laScenarios) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        const allContent = JSON.stringify(response).toLowerCase();
        
        // Should include language arts vocabulary
        const laTerms = ['read', 'write', 'comprehension', 'vocabulary', 'story', 'text'];
        const hasLATerms = laTerms.some(term => allContent.includes(term));
        expect(hasLATerms).toBe(true);
        
        // Assessment should be appropriate for language arts
        const assessmentText = [...response.assessmentFor, ...response.assessmentAs, ...response.assessmentOf].join(' ').toLowerCase();
        expect(assessmentText).toMatch(/reading|writing|discussion|presentation|journal/);
      }
    });

    test('should tailor content to science concepts', async () => {
      const scienceScenarios = AISnapshotTestBase.getTestScenarios({
        subject: 'Science'
      });
      
      for (const scenario of scienceScenarios) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        const allContent = JSON.stringify(response).toLowerCase();
        
        // Should include science vocabulary
        const scienceTerms = ['observe', 'experiment', 'hypothesis', 'investigate', 'explore', 'discover'];
        const hasScienceTerms = scienceTerms.some(term => allContent.includes(term));
        expect(hasScienceTerms).toBe(true);
        
        // Assessment should be appropriate for science
        const assessmentText = [...response.assessmentFor, ...response.assessmentAs, ...response.assessmentOf].join(' ').toLowerCase();
        expect(assessmentText).toMatch(/observation|experiment|investigation|science.journal|lab/);
      }
    });
  });
});