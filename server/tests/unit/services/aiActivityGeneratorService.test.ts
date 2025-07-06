/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { AIActivityGeneratorService } from '@/services/aiActivityGeneratorService';
import { ExternalActivity } from '@teaching-engine/database';

describe('AIActivityGeneratorService', () => {
  let service: AIActivityGeneratorService;

  beforeEach(() => {
    service = new AIActivityGeneratorService();
  });

  describe('buildGenerationPrompt()', () => {
    test('should build comprehensive prompt with all parameters', () => {
      const params = {
        lessonContext: {
          title: 'Fractions Introduction',
          grade: 3,
          subject: 'Math',
          learningGoals: ['Understand fractions', 'Compare fractions'],
          duration: 45,
          section: 'action' as const,
        },
        specificRequirements: {
          activityType: 'hands-on',
          materials: ['fraction tiles', 'paper'],
          groupSize: 'pairs',
          language: 'fr',
          curriculumExpectations: ['3.NF.1', '3.NF.2'],
        },
        searchResults: [
          {
            id: 1,
            source: 'test',
            externalId: 'test-1',
            url: 'http://example.com/1',
            title: 'Fraction Basics',
            description: 'Introduction to fractions',
            duration: 30,
            activityType: 'worksheet',
            gradeMin: 3,
            gradeMax: 4,
            subject: 'Math',
            language: 'fr',
            materials: ['worksheets'],
            groupSize: 'individual',
            learningGoals: ['Basic fractions'],
            curriculumTags: [],
            isFree: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      const prompt = (service as any)._buildGenerationPrompt(params);

      expect(prompt).toContain('Generate an engaging educational activity');
      expect(prompt).toContain('Title: Fractions Introduction');
      expect(prompt).toContain('Grade: 3');
      expect(prompt).toContain('Subject: Math');
      expect(prompt).toContain('Learning Goals: Understand fractions, Compare fractions');
      expect(prompt).toContain('Duration: 45 minutes');
      expect(prompt).toContain('Section: action');
      expect(prompt).toContain('Activity Type: hands-on');
      expect(prompt).toContain('Materials Available: fraction tiles, paper');
      expect(prompt).toContain('Group Size: pairs');
      expect(prompt).toContain('Language: fr');
      expect(prompt).toContain('Curriculum Expectations: 3.NF.1, 3.NF.2');
      expect(prompt).toContain('Consider these similar activities');
      expect(prompt).toContain('Fraction Basics: Introduction to fractions');
      expect(prompt).toContain('Please provide a complete activity plan in JSON format');
    });

    test('should handle minimal parameters', () => {
      const params = {};

      const prompt = (service as any)._buildGenerationPrompt(params);

      expect(prompt).toContain('Generate an engaging educational activity');
      expect(prompt).toContain('Please provide a complete activity plan in JSON format');
      // The service appears to not add lesson context when params are empty
      // which is the expected behavior for minimal parameters
    });

    test('should limit search results to 3 items', () => {
      const mockSearchResults: ExternalActivity[] = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          source: 'test',
          externalId: `test-${i + 1}`,
          url: `http://example.com/${i + 1}`,
          title: `Activity ${i + 1}`,
          description: `Description ${i + 1}`,
          duration: 30,
          activityType: 'worksheet',
          gradeMin: 3,
          gradeMax: 4,
          subject: 'Math',
          language: 'fr',
          materials: ['worksheets'],
          groupSize: 'individual',
          learningGoals: ['Basic fractions'],
          curriculumTags: [],
          isFree: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

      const params = { searchResults: mockSearchResults };
      const prompt = (service as any)._buildGenerationPrompt(params);

      // Should only include first 3 results
      expect(prompt).toContain('Activity 1: Description 1');
      expect(prompt).toContain('Activity 2: Description 2');
      expect(prompt).toContain('Activity 3: Description 3');
      expect(prompt).not.toContain('Activity 4: Description 4');
    });
  });

  describe('parseGeneratedActivity()', () => {
    test('should parse valid JSON response', () => {
      const mockActivityJSON = {
        title: 'Test Activity',
        description: 'Test description',
        detailedInstructions: ['Step 1', 'Step 2'],
        duration: 30,
        activityType: 'hands-on',
        materials: ['paper', 'pencils'],
        groupSize: 'pairs',
        learningGoals: ['Goal 1', 'Goal 2'],
        assessmentSuggestions: ['Assessment 1'],
        differentiation: {
          support: ['Support 1'],
          extension: ['Extension 1'],
        },
        safetyConsiderations: ['Safety 1'],
        technologyRequirements: ['Tech 1'],
      };

      const response = `Here's the activity: ${JSON.stringify(mockActivityJSON)}`;
      const result = (service as any)._parseGeneratedActivity(response);

      expect(result).toEqual(mockActivityJSON);
    });

    test('should handle missing optional fields', () => {
      const mockActivityJSON = {
        title: 'Test Activity',
        description: 'Test description',
        detailedInstructions: ['Step 1'],
        // Missing other fields
      };

      const response = JSON.stringify(mockActivityJSON);
      const result = (service as any)._parseGeneratedActivity(response);

      expect(result).toEqual({
        title: 'Test Activity',
        description: 'Test description',
        detailedInstructions: ['Step 1'],
        duration: 30,
        activityType: 'handson',
        materials: [],
        groupSize: 'flexible',
        learningGoals: [],
        assessmentSuggestions: [],
        differentiation: {
          support: [],
          extension: [],
        },
        safetyConsiderations: undefined,
        technologyRequirements: undefined,
      });
    });

    test('should throw error for missing required fields', () => {
      const mockActivityJSON = {
        title: 'Test Activity',
        // Missing description and detailedInstructions
      };

      const response = JSON.stringify(mockActivityJSON);

      expect(() => {
        (service as any)._parseGeneratedActivity(response);
      }).toThrow('Failed to parse generated activity');
    });

    test('should throw error for invalid JSON', () => {
      const response = 'Invalid JSON {]';

      expect(() => {
        (service as any)._parseGeneratedActivity(response);
      }).toThrow('Failed to parse generated activity');
    });

    test('should throw error for response without JSON', () => {
      const response = 'No JSON content here';

      expect(() => {
        (service as any)._parseGeneratedActivity(response);
      }).toThrow('Failed to parse generated activity');
    });
  });

  describe('generateTemplateActivity()', () => {
    test('should generate template activity with minimal parameters', () => {
      const params = {
        lessonContext: {
          title: 'Basic Lesson',
          grade: 2,
          subject: 'Science',
        },
      };

      const result = (service as any).generateTemplateActivity(params);

      expect(result).toEqual({
        title: 'Science Activity - Basic Lesson',
        description: 'An engaging science activity designed for Grade 2 students.',
        detailedInstructions: [
          'Introduce the activity and learning goals to students',
          'Provide necessary materials and set up workspace',
          'Guide students through the main activity',
          'Facilitate discussion and reflection',
          'Assess understanding and provide feedback',
        ],
        duration: 30,
        activityType: 'hands-on',
        materials: ['paper', 'pencils', 'whiteboard'],
        groupSize: 'individual or small groups',
        learningGoals: ['Students will explore new concepts'],
        assessmentSuggestions: [
          'Observe student participation and engagement',
          'Ask questions to check understanding',
          'Review completed work for accuracy',
        ],
        differentiation: {
          support: [
            'Provide visual aids',
            'Offer one-on-one assistance',
            'Break tasks into smaller steps',
          ],
          extension: [
            'Provide additional challenges',
            'Encourage peer teaching',
            'Offer independent research opportunities',
          ],
        },
        safetyConsiderations: [
          'Ensure proper use of materials',
          'Maintain safe classroom environment',
        ],
        technologyRequirements: [],
      });
    });

    test('should use specific requirements in template', () => {
      const params = {
        lessonContext: {
          title: 'Advanced Lesson',
          grade: 5,
          subject: 'Math',
          duration: 60,
          learningGoals: ['Solve complex problems'],
        },
        specificRequirements: {
          activityType: 'experiment',
          materials: ['calculators', 'graph paper'],
          groupSize: 'teams of 4',
        },
      };

      const result = (service as any).generateTemplateActivity(params);

      expect(result).toMatchObject({
        title: 'Math Activity - Advanced Lesson',
        description: 'An engaging math activity designed for Grade 5 students.',
        duration: 60,
        activityType: 'experiment',
        materials: ['calculators', 'graph paper'],
        groupSize: 'teams of 4',
        learningGoals: ['Solve complex problems'],
      });
    });

    test('should handle empty parameters gracefully', () => {
      const params = {};

      const result = (service as any).generateTemplateActivity(params);

      expect(result).toMatchObject({
        title: 'Learning Activity - Exploration',
        description: 'An engaging learning activity designed for Grade 1 students.',
        duration: 30,
        activityType: 'hands-on',
        materials: ['paper', 'pencils', 'whiteboard'],
        groupSize: 'individual or small groups',
        learningGoals: ['Students will explore new concepts'],
      });
    });

    test('should respect all provided parameters', () => {
      const params = {
        lessonContext: {
          title: 'Fractions Workshop',
          grade: 4,
          subject: 'Mathematics',
          duration: 75,
          learningGoals: [
            'Understand equivalent fractions',
            'Add fractions with like denominators',
          ],
        },
        specificRequirements: {
          activityType: 'collaborative project',
          materials: ['fraction bars', 'calculators', 'poster paper'],
          groupSize: 'groups of 3-4',
          language: 'fr',
          curriculumExpectations: ['4.NF.1', '4.NF.2'],
        },
      };

      const result = (service as any).generateTemplateActivity(params);

      expect(result).toEqual({
        title: 'Mathematics Activity - Fractions Workshop',
        description: 'An engaging mathematics activity designed for Grade 4 students.',
        detailedInstructions: [
          'Introduce the activity and learning goals to students',
          'Provide necessary materials and set up workspace',
          'Guide students through the main activity',
          'Facilitate discussion and reflection',
          'Assess understanding and provide feedback',
        ],
        duration: 75,
        activityType: 'collaborative project',
        materials: ['fraction bars', 'calculators', 'poster paper'],
        groupSize: 'groups of 3-4',
        learningGoals: ['Understand equivalent fractions', 'Add fractions with like denominators'],
        assessmentSuggestions: [
          'Observe student participation and engagement',
          'Ask questions to check understanding',
          'Review completed work for accuracy',
        ],
        differentiation: {
          support: [
            'Provide visual aids',
            'Offer one-on-one assistance',
            'Break tasks into smaller steps',
          ],
          extension: [
            'Provide additional challenges',
            'Encourage peer teaching',
            'Offer independent research opportunities',
          ],
        },
        safetyConsiderations: [
          'Ensure proper use of materials',
          'Maintain safe classroom environment',
        ],
        technologyRequirements: [],
      });
    });
  });

  describe('Template Quality Validation', () => {
    test('should generate educationally sound activities for different grade levels', () => {
      const gradeLevels = [1, 3, 5, 8];

      gradeLevels.forEach((grade) => {
        const params = {
          lessonContext: {
            title: `Grade ${grade} Activity`,
            grade,
            subject: 'Math',
          },
        };

        const result = (service as any).generateTemplateActivity(params);

        // Should be age-appropriate
        expect(result.title).toContain(`Grade ${grade}`);
        expect(result.description).toContain(`Grade ${grade} students`);

        // Should have educational structure
        expect(result.detailedInstructions).toHaveLength(5);
        expect(result.detailedInstructions[0]).toContain('Introduce');
        expect(result.detailedInstructions[4]).toContain('Assess');

        // Should include differentiation
        expect(result.differentiation.support).toContain('Provide visual aids');
        expect(result.differentiation.extension).toContain('Provide additional challenges');

        // Should include assessment
        expect(result.assessmentSuggestions).toContain(
          'Observe student participation and engagement',
        );

        // Should include safety
        expect(result.safetyConsiderations).toContain('Ensure proper use of materials');
      });
    });

    test('should generate appropriate activities for different subjects', () => {
      const subjects = ['Math', 'Science', 'Language Arts', 'Social Studies', 'Art'];

      subjects.forEach((subject) => {
        const params = {
          lessonContext: {
            title: `${subject} Exploration`,
            grade: 3,
            subject,
          },
        };

        const result = (service as any).generateTemplateActivity(params);

        expect(result.title).toContain(subject);
        expect(result.description.toLowerCase()).toContain(subject.toLowerCase());
        expect(result.description).toContain('Grade 3');
      });
    });

    test('should generate activities with proper educational components', () => {
      const params = {
        lessonContext: {
          title: 'Comprehensive Test',
          grade: 4,
          subject: 'Science',
        },
      };

      const result = (service as any).generateTemplateActivity(params);

      // Check all required educational components are present
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('detailedInstructions');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('activityType');
      expect(result).toHaveProperty('materials');
      expect(result).toHaveProperty('groupSize');
      expect(result).toHaveProperty('learningGoals');
      expect(result).toHaveProperty('assessmentSuggestions');
      expect(result).toHaveProperty('differentiation');
      expect(result).toHaveProperty('safetyConsiderations');
      expect(result).toHaveProperty('technologyRequirements');

      // Check differentiation structure
      expect(result.differentiation).toHaveProperty('support');
      expect(result.differentiation).toHaveProperty('extension');
      expect(Array.isArray(result.differentiation.support)).toBe(true);
      expect(Array.isArray(result.differentiation.extension)).toBe(true);

      // Check arrays are populated
      expect(result.detailedInstructions.length).toBeGreaterThan(0);
      expect(result.materials.length).toBeGreaterThan(0);
      expect(result.learningGoals.length).toBeGreaterThan(0);
      expect(result.assessmentSuggestions.length).toBeGreaterThan(0);
      expect(result.differentiation.support.length).toBeGreaterThan(0);
      expect(result.differentiation.extension.length).toBeGreaterThan(0);
      expect(result.safetyConsiderations.length).toBeGreaterThan(0);
    });
  });

  describe('Prompt Building Quality', () => {
    test('should build comprehensive prompts that include ETFO best practices', () => {
      const params = {
        lessonContext: {
          title: 'ETFO Standards Lesson',
          grade: 3,
          subject: 'Language Arts',
          section: 'action' as const,
        },
        specificRequirements: {
          language: 'fr',
          curriculumExpectations: ['Ontario curriculum'],
        },
      };

      const prompt = (service as any)._buildGenerationPrompt(params);

      // Should reference French language instruction
      expect(prompt).toContain('Language: fr');

      // Should reference Ontario curriculum
      expect(prompt).toContain('Ontario curriculum');

      // Should ask for proper JSON structure
      expect(prompt).toContain('JSON format');
      expect(prompt).toContain('"title"');
      expect(prompt).toContain('"differentiation"');
      expect(prompt).toContain('"assessmentSuggestions"');
    });

    test('should handle curriculum expectations properly', () => {
      const params = {
        specificRequirements: {
          curriculumExpectations: ['3.NF.1', '3.NF.2', '3.OA.1'],
        },
      };

      const prompt = (service as any)._buildGenerationPrompt(params);

      expect(prompt).toContain('Curriculum Expectations: 3.NF.1, 3.NF.2, 3.OA.1');
    });

    test('should include proper JSON schema in prompt', () => {
      const params = {};
      const prompt = (service as any)._buildGenerationPrompt(params);

      // Check that the JSON schema is complete and valid
      expect(prompt).toContain('"title"');
      expect(prompt).toContain('"description"');
      expect(prompt).toContain('"detailedInstructions"');
      expect(prompt).toContain('"duration"');
      expect(prompt).toContain('"activityType"');
      expect(prompt).toContain('"materials"');
      expect(prompt).toContain('"groupSize"');
      expect(prompt).toContain('"learningGoals"');
      expect(prompt).toContain('"assessmentSuggestions"');
      expect(prompt).toContain('"differentiation"');
      expect(prompt).toContain('"support"');
      expect(prompt).toContain('"extension"');
      expect(prompt).toContain('"safetyConsiderations"');
      expect(prompt).toContain('"technologyRequirements"');
    });
  });

  describe('System Prompt Quality', () => {
    test('should include comprehensive system prompt requirements', () => {
      const systemPrompt = (service as any)._getSystemPrompt();

      expect(systemPrompt).toContain('expert elementary school teacher');
      expect(systemPrompt).toContain('French immersion');
      expect(systemPrompt).toContain('Ontario curriculum');
      expect(systemPrompt).toContain('developmentally appropriate');
      expect(systemPrompt).toContain('differentiation');
      expect(systemPrompt).toContain('assessment');
      expect(systemPrompt).toContain('ETFO best practices');
      expect(systemPrompt).toContain('valid JSON');
    });
  });
});
