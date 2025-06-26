/**
 * AI Content Validation Tests
 * 
 * Comprehensive validation of AI-generated educational content
 * for appropriateness, quality, and curriculum alignment.
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { AITestDataGenerator, AITestMockResponses } from '../utils/ai-testing/aiTestData';
import { AIContentValidator, AITestScenario } from '../utils/ai-testing/aiTestUtils';

describe('AI Content Validation Tests', () => {
  let testScenarios: AITestScenario[];
  
  beforeAll(() => {
    testScenarios = AITestDataGenerator.generateTestScenarios();
  });

  describe('Educational Appropriateness Validation', () => {
    test('should detect and flag inappropriate content', async () => {
      // Test with inappropriate content injection
      const testContent = {
        title: 'Math Lesson with Violence',
        learningGoals: ['Students will learn to solve problems using violent methods'],
        activities: ['Use weapons to count objects', 'Fight to determine who is correct'],
      };
      
      const validation = AIContentValidator.validateContent(testContent, 'lessonPlan');
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.issues.some(issue => issue.includes('Inappropriate content'))).toBe(true);
    });

    test('should validate age-appropriate vocabulary for different grades', async () => {
      const grade1Scenario = testScenarios.find(s => s.grade === 1)!;
      const grade5Scenario = testScenarios.find(s => s.grade === 5)!;
      
      const grade1Response = AITestMockResponses.mockLessonPlan(grade1Scenario);
      const grade5Response = AITestMockResponses.mockLessonPlan(grade5Scenario);
      
      const grade1Validation = AIContentValidator.validateContent(grade1Response, 'lessonPlan');
      const grade5Validation = AIContentValidator.validateContent(grade5Response, 'lessonPlan');
      
      // Both should be valid, but grade 1 might have warnings about complexity
      expect(grade1Validation.isValid).toBe(true);
      expect(grade5Validation.isValid).toBe(true);
      
      // Grade 1 content should avoid complex terminology
      const grade1Content = JSON.stringify(grade1Response).toLowerCase();
      expect(grade1Content).not.toMatch(/synthesize|analyze|evaluate|critique/);
    });

    test('should ensure curriculum alignment indicators are present', async () => {
      for (const scenario of testScenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockLongRangePlan(scenario);
        const validation = AIContentValidator.validateContent(response, 'longRangePlan');
        
        expect(validation.isValid).toBe(true);
        
        // Should have high curriculum alignment score
        expect(validation.score).toBeGreaterThanOrEqual(70);
        
        // Content should reference curriculum concepts
        const contentText = JSON.stringify(response).toLowerCase();
        const curriculumIndicators = [
          'expectation', 'curriculum', 'learning', 'goal', 'objective', 'outcome'
        ];
        
        const hasIndicators = curriculumIndicators.some(indicator => 
          contentText.includes(indicator)
        );
        expect(hasIndicators).toBe(true);
      }
    });
  });

  describe('Content Quality Standards', () => {
    test('should maintain minimum quality thresholds', async () => {
      for (const scenario of testScenarios.slice(0, 5)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        const validation = AIContentValidator.validateContent(response, 'unitPlan');
        
        // Quality score should meet minimum standards
        expect(validation.score).toBeGreaterThanOrEqual(60);
        
        // Should have substantive content
        const contentLength = JSON.stringify(response).length;
        expect(contentLength).toBeGreaterThan(500); // Minimum content length
        
        // Should not have excessive warnings
        expect(validation.warnings.length).toBeLessThanOrEqual(3);
      }
    });

    test('should detect and flag repetitive content', async () => {
      // Create artificially repetitive content
      const repetitiveContent = {
        title: 'Repetitive Lesson Plan',
        learningGoals: [
          'Students will count numbers repeatedly and count again',
          'Students will count numbers repeatedly and count again',
          'Students will count numbers repeatedly and count again',
        ],
        activities: 'Count count count count count count count count count',
      };
      
      const validation = AIContentValidator.validateContent(repetitiveContent, 'lessonPlan');
      
      expect(validation.warnings.some(warning => 
        warning.includes('repetition') || warning.includes('repetitive')
      )).toBe(true);
    });

    test('should validate required educational elements', async () => {
      // Test with missing required elements
      const incompleteContent = {
        title: 'Incomplete Lesson',
        // Missing learningGoals, activities, etc.
      };
      
      const validation = AIContentValidator.validateContent(incompleteContent, 'lessonPlan');
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some(issue => 
        issue.includes('Missing required element')
      )).toBe(true);
    });
  });

  describe('Subject-Specific Validation', () => {
    test('should validate mathematics content appropriately', async () => {
      const mathScenarios = testScenarios.filter(s => s.subject === 'Mathematics');
      
      for (const scenario of mathScenarios.slice(0, 2)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        const validation = AIContentValidator.validateContent(response, 'unitPlan');
        
        expect(validation.isValid).toBe(true);
        
        const contentText = JSON.stringify(response).toLowerCase();
        
        // Should include mathematical vocabulary
        const mathTerms = ['number', 'count', 'calculate', 'solve', 'pattern', 'measure'];
        const hasMathTerms = mathTerms.some(term => contentText.includes(term));
        expect(hasMathTerms).toBe(true);
        
        // Should not include inappropriate mathematical concepts for grade level
        if (scenario.grade <= 2) {
          expect(contentText).not.toMatch(/algebra|calculus|trigonometry|logarithm/);
        }
      }
    });

    test('should validate language arts content appropriately', async () => {
      const laScenarios = testScenarios.filter(s => s.subject === 'Language Arts');
      
      for (const scenario of laScenarios.slice(0, 2)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        const validation = AIContentValidator.validateContent(response, 'unitPlan');
        
        expect(validation.isValid).toBe(true);
        
        const contentText = JSON.stringify(response).toLowerCase();
        
        // Should include language arts vocabulary
        const laTerms = ['read', 'write', 'story', 'text', 'comprehension', 'vocabulary'];
        const hasLATerms = laTerms.some(term => contentText.includes(term));
        expect(hasLATerms).toBe(true);
        
        // Should promote positive reading experiences
        expect(contentText).not.toMatch(/boring|difficult|hard.*read|hate.*reading/);
      }
    });

    test('should validate science content appropriately', async () => {
      const scienceScenarios = testScenarios.filter(s => s.subject === 'Science');
      
      for (const scenario of scienceScenarios.slice(0, 2)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        const validation = AIContentValidator.validateContent(response, 'unitPlan');
        
        expect(validation.isValid).toBe(true);
        
        const contentText = JSON.stringify(response).toLowerCase();
        
        // Should include scientific vocabulary
        const scienceTerms = ['observe', 'experiment', 'investigate', 'discover', 'explore'];
        const hasScienceTerms = scienceTerms.some(term => contentText.includes(term));
        expect(hasScienceTerms).toBe(true);
        
        // Should promote safe science practices
        expect(contentText).not.toMatch(/dangerous|unsafe|risky.*experiment/);
      }
    });
  });

  describe('Accessibility and Inclusion', () => {
    test('should use inclusive language', async () => {
      for (const scenario of testScenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        const contentText = JSON.stringify(response).toLowerCase();
        
        // Should avoid exclusive language
        expect(contentText).not.toMatch(/boys.*better|girls.*worse|only.*smart.*students/);
        
        // Should use inclusive pronouns and examples
        expect(contentText).toMatch(/students|learners|everyone|all.*students/);
      }
    });

    test('should consider diverse learning needs', async () => {
      for (const scenario of testScenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        // Should include accommodations
        expect(response.accommodations).toBeDefined();
        expect(response.accommodations.length).toBeGreaterThan(20);
        
        const accommodationText = response.accommodations.toLowerCase();
        expect(accommodationText).toMatch(/visual|support|multiple.*ways|different.*needs/);
      }
    });

    test('should promote positive classroom culture', async () => {
      for (const scenario of testScenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockDaybook(scenario);
        const allContent = [
          ...response.weeklyBigIdeas,
          ...response.dailyReflectionPrompts,
          response.weeklyInsights
        ].join(' ').toLowerCase();
        
        // Should promote positive language
        expect(allContent).toMatch(/support|encourage|celebrate|success|growth/);
        
        // Should avoid negative language
        expect(allContent).not.toMatch(/fail|stupid|wrong|bad.*student|can't.*do/);
      }
    });
  });

  describe('Assessment Appropriateness', () => {
    test('should recommend age-appropriate assessment strategies', async () => {
      const primaryScenarios = testScenarios.filter(s => s.grade <= 2);
      const intermediateScenarios = testScenarios.filter(s => s.grade >= 4);
      
      for (const scenario of primaryScenarios.slice(0, 1)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        const assessmentText = [
          ...response.assessmentFor,
          ...response.assessmentAs,
          ...response.assessmentOf
        ].join(' ').toLowerCase();
        
        // Primary should emphasize observation and play-based assessment
        expect(assessmentText).toMatch(/observation|play|discussion|show.*tell/);
        expect(assessmentText).not.toMatch(/test|exam|quiz|formal.*assessment/);
      }
      
      for (const scenario of intermediateScenarios.slice(0, 1)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        const assessmentText = [
          ...response.assessmentFor,
          ...response.assessmentAs,
          ...response.assessmentOf
        ].join(' ').toLowerCase();
        
        // Intermediate can include more formal assessments
        expect(assessmentText).toMatch(/project|presentation|portfolio|rubric/);
      }
    });

    test('should balance formative and summative assessment', async () => {
      for (const scenario of testScenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        
        // Should have multiple assessment types
        expect(response.assessmentFor.length).toBeGreaterThan(0);
        expect(response.assessmentAs.length).toBeGreaterThan(0);
        expect(response.assessmentOf.length).toBeGreaterThan(0);
        
        const allAssessments = [
          ...response.assessmentFor,
          ...response.assessmentAs,
          ...response.assessmentOf
        ].join(' ').toLowerCase();
        
        // Should include both ongoing and final assessments
        expect(allAssessments).toMatch(/ongoing|continuous|daily|formative/);
        expect(allAssessments).toMatch(/final|summary|culminating|summative/);
      }
    });
  });

  describe('Professional Standards Compliance', () => {
    test('should align with ETFO teaching standards', async () => {
      for (const scenario of testScenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockLongRangePlan(scenario);
        const validation = AIContentValidator.validateContent(response, 'longRangePlan');
        
        expect(validation.isValid).toBe(true);
        
        // Should include professional teaching elements
        const contentText = JSON.stringify(response).toLowerCase();
        expect(contentText).toMatch(/learning|teaching|curriculum|student.*need/);
        
        // Should demonstrate planning and reflection
        expect(contentText).toMatch(/plan|goal|objective|assessment|reflection/);
      }
    });

    test('should demonstrate pedagogical knowledge', async () => {
      for (const scenario of testScenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockLessonPlan(scenario);
        
        // Should follow three-part lesson structure
        expect(response.mindsOn).toBeDefined();
        expect(response.action).toBeDefined();
        expect(response.consolidation).toBeDefined();
        
        // Should include differentiation strategies
        expect(response.accommodations).toBeDefined();
        expect(response.accommodations.length).toBeGreaterThan(0);
        
        // Should connect to curriculum expectations
        expect(response.learningGoals).toBeDefined();
        expect(response.learningGoals.length).toBeGreaterThan(0);
      }
    });

    test('should promote evidence-based practices', async () => {
      for (const scenario of testScenarios.slice(0, 3)) {
        const response = AITestMockResponses.mockUnitPlan(scenario);
        const contentText = JSON.stringify(response).toLowerCase();
        
        // Should include research-based strategies
        expect(contentText).toMatch(/hands.on|collaborative|inquiry|scaffolding|differentiat/);
        
        // Should promote student engagement
        expect(contentText).toMatch(/engage|motivat|interest|active.*learning/);
      }
    });
  });

  describe('Content Validation Reporting', () => {
    test('should generate comprehensive validation reports', async () => {
      const scenario = testScenarios[0];
      const response = AITestMockResponses.mockUnitPlan(scenario);
      const validation = AIContentValidator.validateContent(response, 'unitPlan');
      
      // Report should include all required fields
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('issues');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('score');
      
      // Score should be numerical and within range
      expect(typeof validation.score).toBe('number');
      expect(validation.score).toBeGreaterThanOrEqual(0);
      expect(validation.score).toBeLessThanOrEqual(100);
      
      // Issues and warnings should be arrays
      expect(Array.isArray(validation.issues)).toBe(true);
      expect(Array.isArray(validation.warnings)).toBe(true);
    });

    test('should provide actionable feedback in validation messages', async () => {
      // Create content with known issues
      const problematicContent = {
        title: 'Short',
        learningGoals: ['Vague goal'],
        // Missing required fields
      };
      
      const validation = AIContentValidator.validateContent(problematicContent, 'unitPlan');
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      
      // Issues should be descriptive and actionable
      for (const issue of validation.issues) {
        expect(typeof issue).toBe('string');
        expect(issue.length).toBeGreaterThan(10);
        expect(issue).toMatch(/Missing|Invalid|Required|Expected/);
      }
    });
  });
});