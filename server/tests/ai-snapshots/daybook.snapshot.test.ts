/**
 * Daybook AI Snapshot Tests
 * 
 * Tests AI-generated daybook entries against stored snapshots
 * to detect regressions and ensure consistency.
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { AISnapshotTestBase } from './ai-snapshot-base.test';
import { AISnapshotNormalizer } from '../utils/ai-testing/aiSnapshotNormalizer';
import { AITestDataGenerator, AITestMockResponses } from '../utils/ai-testing/aiTestData';
import { generateDaybookDraft } from '../../src/services/aiDraftService';
import { AI_TESTING_CONFIG } from '../utils/ai-testing/aiTestUtils';

describe('Daybook AI Snapshot Tests', () => {
  beforeAll(async () => {
    await AISnapshotTestBase.setupTestEnvironment();
  });

  afterAll(async () => {
    await AISnapshotTestBase.cleanupTestEnvironment();
    await AISnapshotTestBase.generateSummaryReport();
  });

  describe('Grade 1 Mathematics Daybook', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 1,
      subject: 'Mathematics'
    });

    test.each(scenarios)(
      'should generate consistent daybook entry for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockDaybook(scenario);
          }
          return await generateDaybookDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'daybook',
          scenario,
          aiFunction,
          AITestDataGenerator.generateDaybookInput,
          AISnapshotNormalizer.normalizeDaybook
        );
      }
    );
  });

  describe('Grade 3 Language Arts Daybook', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 3,
      subject: 'Language Arts'
    });

    test.each(scenarios)(
      'should generate consistent daybook entry for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockDaybook(scenario);
          }
          return await generateDaybookDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'daybook',
          scenario,
          aiFunction,
          AITestDataGenerator.generateDaybookInput,
          AISnapshotNormalizer.normalizeDaybook
        );
      }
    );
  });

  describe('Grade 5 Science Daybook', () => {
    const scenarios = AISnapshotTestBase.getTestScenarios({
      grade: 5,
      subject: 'Science'
    });

    test.each(scenarios)(
      'should generate consistent daybook entry for $name',
      async (scenario) => {
        const aiFunction = async (input: any) => {
          if (!AI_TESTING_CONFIG.testApiKey) {
            return AITestMockResponses.mockDaybook(scenario);
          }
          return await generateDaybookDraft(input);
        };

        await AISnapshotTestBase.runSnapshotTest(
          'daybook',
          scenario,
          aiFunction,
          AITestDataGenerator.generateDaybookInput,
          AISnapshotNormalizer.normalizeDaybook
        );
      }
    );
  });

  describe('Weekly Big Ideas Validation', () => {
    test('should generate meaningful weekly big ideas', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockDaybook(scenario);
        
        expect(response.weeklyBigIdeas).toBeDefined();
        expect(Array.isArray(response.weeklyBigIdeas)).toBe(true);
        expect(response.weeklyBigIdeas.length).toBeGreaterThan(0);
        expect(response.weeklyBigIdeas.length).toBeLessThanOrEqual(5);
        
        for (const bigIdea of response.weeklyBigIdeas) {
          expect(typeof bigIdea).toBe('string');
          expect(bigIdea.length).toBeGreaterThan(30);
          expect(bigIdea.trim()).toBe(bigIdea);
          
          // Should reference the subject area
          expect(bigIdea.toLowerCase()).toMatch(
            new RegExp(scenario.subject.toLowerCase().replace(' ', '|'))
          );
          
          // Should indicate learning or growth
          expect(bigIdea.toLowerCase()).toMatch(/learn|understand|explore|discover|develop|build/);
        }
      }
    });

    test('should connect big ideas to lesson content', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const input = AITestDataGenerator.generateDaybookInput(scenario);
        const response = AITestMockResponses.mockDaybook(scenario);
        
        // Big ideas should relate to the lessons taught
        const bigIdeasText = response.weeklyBigIdeas.join(' ').toLowerCase();
        const subjectLower = scenario.subject.toLowerCase();
        
        expect(bigIdeasText).toContain(subjectLower.replace(' ', ''));
        
        // Should reference student learning
        expect(bigIdeasText).toMatch(/student|learn|understand|practice/);
      }
    });
  });

  describe('Daily Reflection Prompts', () => {
    test('should provide thoughtful reflection questions', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockDaybook(scenario);
        
        expect(response.dailyReflectionPrompts).toBeDefined();
        expect(Array.isArray(response.dailyReflectionPrompts)).toBe(true);
        expect(response.dailyReflectionPrompts.length).toBeGreaterThan(2);
        expect(response.dailyReflectionPrompts.length).toBeLessThanOrEqual(7);
        
        for (const prompt of response.dailyReflectionPrompts) {
          expect(typeof prompt).toBe('string');
          expect(prompt.length).toBeGreaterThan(15);
          expect(prompt.trim().endsWith('?')).toBe(true);
          
          // Should start with question words
          const promptLower = prompt.toLowerCase().trim();
          const questionStarters = ['what', 'how', 'why', 'when', 'where', 'which', 'who'];
          const startsWithQuestion = questionStarters.some(word => promptLower.startsWith(word));
          expect(startsWithQuestion).toBe(true);
        }
      }
    });

    test('should vary question types for comprehensive reflection', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockDaybook(scenario);
        const allPrompts = response.dailyReflectionPrompts.join(' ').toLowerCase();
        
        // Should include different types of reflection
        const reflectionTypes = [
          /what.*learn/,  // Learning reflection
          /how.*help/,    // Strategy reflection
          /connect/,      // Connection making
          /question/,     // Inquiry
          /next/,         // Forward thinking
        ];
        
        let typesFound = 0;
        for (const type of reflectionTypes) {
          if (type.test(allPrompts)) {
            typesFound++;
          }
        }
        
        expect(typesFound).toBeGreaterThanOrEqual(2); // At least 2 different types
      }
    });

    test('should be age-appropriate for different grades', async () => {
      const primaryScenarios = AISnapshotTestBase.getTestScenarios().filter(s => s.grade <= 2);
      const intermediateScenarios = AISnapshotTestBase.getTestScenarios().filter(s => s.grade >= 4);
      
      for (const scenario of primaryScenarios.slice(0, 1)) {
        const response = AITestMockResponses.mockDaybook(scenario);
        const promptsText = response.dailyReflectionPrompts.join(' ').toLowerCase();
        
        // Primary grades should use simpler language
        expect(promptsText).toMatch(/like|fun|easy|hard|help|friend/);
        expect(promptsText).not.toMatch(/analyze|evaluate|synthesize|critical/);
      }
      
      for (const scenario of intermediateScenarios.slice(0, 1)) {
        const response = AITestMockResponses.mockDaybook(scenario);
        const promptsText = response.dailyReflectionPrompts.join(' ').toLowerCase();
        
        // Intermediate grades can handle more complex reflection
        expect(promptsText).toMatch(/understand|explain|compare|apply|connect/);
      }
    });
  });

  describe('Substitute Teacher Notes', () => {
    test('should provide clear and helpful substitute notes', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockDaybook(scenario);
        
        expect(response.substituteNotes).toBeDefined();
        expect(typeof response.substituteNotes).toBe('string');
        expect(response.substituteNotes.length).toBeGreaterThan(100);
        
        const notesLower = response.substituteNotes.toLowerCase();
        
        // Should include key information
        expect(notesLower).toMatch(/student|class|grade|subject/);
        expect(notesLower).toMatch(/material|resource|activity/);
        expect(notesLower).toMatch(/routine|schedule|time/);
        
        // Should provide helpful guidance
        expect(notesLower).toMatch(/help|support|need|assistance|contact/);
      }
    });

    test('should include practical classroom management information', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockDaybook(scenario);
        const notesLower = response.substituteNotes.toLowerCase();
        
        // Should mention routines or procedures
        expect(notesLower).toMatch(/routine|procedure|schedule|time|break|morning/);
        
        // Should mention materials or resources
        expect(notesLower).toMatch(/material|resource|bin|located|find/);
        
        // Should mention student support
        expect(notesLower).toMatch(/support|help|accommodation|student.*need/);
      }
    });

    test('should reference specific subject content appropriately', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios();
      
      for (const scenario of scenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockDaybook(scenario);
        const notesLower = response.substituteNotes.toLowerCase();
        
        // Should reference the subject being taught
        const subjectLower = scenario.subject.toLowerCase();
        expect(notesLower).toMatch(new RegExp(subjectLower.replace(' ', '|')));
        
        // Should reference grade level
        expect(notesLower).toMatch(new RegExp(`grade ${scenario.grade}|grade.${scenario.grade}`));
      }
    });
  });

  describe('Weekly Insights', () => {
    test('should provide meaningful pedagogical insights', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockDaybook(scenario);
        
        expect(response.weeklyInsights).toBeDefined();
        expect(typeof response.weeklyInsights).toBe('string');
        expect(response.weeklyInsights.length).toBeGreaterThan(80);
        
        const insightsLower = response.weeklyInsights.toLowerCase();
        
        // Should reference students and learning
        expect(insightsLower).toMatch(/student|learn|engage|understand|progress/);
        
        // Should provide forward-looking suggestions
        expect(insightsLower).toMatch(/next|continue|consider|need|practice|benefit/);
        
        // Should reference the subject area
        expect(insightsLower).toMatch(
          new RegExp(scenario.subject.toLowerCase().replace(' ', '|'))
        );
      }
    });

    test('should reflect complexity level appropriately', async () => {
      const basicScenarios = AISnapshotTestBase.getTestScenarios().filter(s => s.complexity === 'basic');
      const advancedScenarios = AISnapshotTestBase.getTestScenarios().filter(s => s.complexity === 'advanced');
      
      for (const scenario of basicScenarios.slice(0, 1)) {
        const response = AITestMockResponses.mockDaybook(scenario);
        const insightsLower = response.weeklyInsights.toLowerCase();
        
        // Basic scenarios should focus on foundational skills
        expect(insightsLower).toMatch(/foundation|basic|practice|build|skill/);
      }
      
      for (const scenario of advancedScenarios.slice(0, 1)) {
        const response = AITestMockResponses.mockDaybook(scenario);
        const insightsLower = response.weeklyInsights.toLowerCase();
        
        // Advanced scenarios should mention higher-order thinking
        expect(insightsLower).toMatch(/challenge|extension|advanced|critical|problem/);
      }
    });

    test('should provide actionable next steps', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockDaybook(scenario);
        const insightsLower = response.weeklyInsights.toLowerCase();
        
        // Should include actionable language
        expect(insightsLower).toMatch(/consider|try|implement|focus|provide|continue/);
        
        // Should suggest specific strategies
        expect(insightsLower).toMatch(/activity|practice|support|material|strategy/);
      }
    });
  });

  describe('Content Integration and Coherence', () => {
    test('should maintain coherence across all daybook components', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockDaybook(scenario);
        
        // All components should reference the same subject
        const allContent = [
          ...response.weeklyBigIdeas,
          ...response.dailyReflectionPrompts,
          response.substituteNotes,
          response.weeklyInsights
        ].join(' ').toLowerCase();
        
        const subjectLower = scenario.subject.toLowerCase();
        const subjectReferences = (allContent.match(new RegExp(subjectLower.replace(' ', '|'), 'g')) || []).length;
        expect(subjectReferences).toBeGreaterThan(2); // Multiple references ensure coherence
        
        // Should reference learning and students consistently
        expect(allContent).toMatch(/student.*learn|learn.*student/);
      }
    });

    test('should reflect special events when provided', async () => {
      const advancedScenarios = AISnapshotTestBase.getTestScenarios().filter(s => s.complexity === 'advanced');
      
      for (const scenario of advancedScenarios.slice(0, 1)) {
        const input = AITestDataGenerator.generateDaybookInput(scenario);
        const response = AITestMockResponses.mockDaybook(scenario);
        
        if (input.specialEvents && input.specialEvents.length > 0) {
          const allContent = [
            ...response.weeklyBigIdeas,
            response.substituteNotes,
            response.weeklyInsights
          ].join(' ').toLowerCase();
          
          // Should reference special events
          expect(allContent).toMatch(/library|science.*fair|special|event|visit/);
        }
      }
    });
  });

  describe('Consistency and Quality Assurance', () => {
    test('should maintain consistent quality across multiple generations', async () => {
      const testScenario = AISnapshotTestBase.getTestScenarios()[0];
      
      const responses = [];
      for (let i = 0; i < 3; i++) {
        responses.push(AITestMockResponses.mockDaybook(testScenario));
      }
      
      // All responses should have required structure
      for (const response of responses) {
        expect(response).toHaveProperty('weeklyBigIdeas');
        expect(response).toHaveProperty('dailyReflectionPrompts');
        expect(response).toHaveProperty('substituteNotes');
        expect(response).toHaveProperty('weeklyInsights');
        
        expect(Array.isArray(response.weeklyBigIdeas)).toBe(true);
        expect(Array.isArray(response.dailyReflectionPrompts)).toBe(true);
        expect(typeof response.substituteNotes).toBe('string');
        expect(typeof response.weeklyInsights).toBe('string');
        
        // Quality metrics should be consistent
        expect(response.weeklyBigIdeas.length).toBeGreaterThan(0);
        expect(response.dailyReflectionPrompts.length).toBeGreaterThan(2);
        expect(response.substituteNotes.length).toBeGreaterThan(50);
        expect(response.weeklyInsights.length).toBeGreaterThan(50);
      }
    });

    test('should avoid repetitive content within components', async () => {
      const scenarios = AISnapshotTestBase.getTestScenarios().slice(0, 3);
      
      for (const scenario of scenarios) {
        const response = AITestMockResponses.mockDaybook(scenario);
        
        // Check for repetition in big ideas
        const bigIdeasSet = new Set(response.weeklyBigIdeas.map(idea => idea.toLowerCase()));
        expect(bigIdeasSet.size).toBe(response.weeklyBigIdeas.length);
        
        // Check for repetition in reflection prompts
        const promptsSet = new Set(response.dailyReflectionPrompts.map(prompt => prompt.toLowerCase()));
        expect(promptsSet.size).toBe(response.dailyReflectionPrompts.length);
      }
    });
  });
});