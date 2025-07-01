import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { generateNewsletterContent, NewsletterTone } from '../../src/services/newsletterService';
import {
  Student,
  DaybookEntry,
  StudentArtifact,
  StudentReflection,
} from '@teaching-engine/database';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');

describe('NewsletterService', () => {
  const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate = jest.fn();

    mockOpenAI.mockImplementation(
      () =>
        ({
          chat: {
            completions: { create: mockCreate },
          },
        }) as any,
    );

    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateNewsletterContent', () => {
    const baseOptions = {
      students: [] as (Student & {
        artifacts: StudentArtifact[];
        reflections: StudentReflection[];
      })[],
      daybookEntries: [] as DaybookEntry[],
      fromDate: new Date('2024-01-01'),
      toDate: new Date('2024-01-31'),
      tone: 'friendly' as NewsletterTone,
      focusAreas: [],
      options: {
        includeArtifacts: true,
        includeReflections: true,
        includeLearningGoals: true,
        includeUpcomingEvents: true,
      },
    };

    describe('successful generation', () => {
      it('should generate newsletter with all sections when all options enabled', async () => {
        const mockStudents = [
          {
            id: 1,
            firstName: 'Emma',
            lastName: 'Johnson',
            userId: 1,
            gradeLevel: 3,
            artifacts: [
              {
                id: 1,
                studentId: 1,
                title: 'Math Project',
                description: 'Fraction poster',
                fileUrl: 'file1.jpg',
                createdAt: new Date('2024-01-15'),
                updatedAt: new Date('2024-01-15'),
              },
            ],
            reflections: [
              {
                id: 1,
                studentId: 1,
                content: 'I learned about fractions today',
                date: new Date('2024-01-20'),
                createdAt: new Date('2024-01-20'),
                updatedAt: new Date('2024-01-20'),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const mockDaybookEntries = [
          {
            id: 1,
            userId: 1,
            date: new Date('2024-01-10'),
            notes: 'Great math lesson on fractions',
            whatWorked: 'Visual aids helped understanding',
            studentEngagement: 'High engagement with manipulatives',
            studentSuccesses: 'Emma mastered comparing fractions',
            challenges: null,
            tomorrowPlan: null,
            reflections: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  sections: [
                    {
                      title: 'Welcome to Our January Newsletter',
                      titleFr: 'Bienvenue à notre bulletin de janvier',
                      content: '<p>Dear families, what a wonderful month!</p>',
                      contentFr: '<p>Chères familles, quel mois merveilleux!</p>',
                    },
                    {
                      title: 'Academic Highlights',
                      titleFr: 'Points saillants académiques',
                      content: '<p>Students excelled in mathematics.</p>',
                      contentFr: '<p>Les élèves ont excellé en mathématiques.</p>',
                    },
                  ],
                }),
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const result = await generateNewsletterContent({
          ...baseOptions,
          students: mockStudents,
          daybookEntries: mockDaybookEntries,
        });

        expect(result.sections).toHaveLength(2);
        expect(result.sections[0]).toEqual({
          id: expect.stringContaining('section-'),
          title: 'Welcome to Our January Newsletter',
          titleFr: 'Bienvenue à notre bulletin de janvier',
          content: '<p>Dear families, what a wonderful month!</p>',
          contentFr: '<p>Chères familles, quel mois merveilleux!</p>',
          isEditable: true,
          order: 0,
        });

        // Verify API was called with correct prompts
        const callArgs = mockCreate.mock.calls[0][0];
        expect(callArgs.model).toBe('gpt-4o-mini');
        expect(callArgs.messages[0].content).toContain('elementary school teacher');
        expect(callArgs.messages[0].content).toContain('warm, approachable, and conversational');
        expect(callArgs.messages[1].content).toContain('Emma');
        expect(callArgs.messages[1].content).toContain('1/1/2024 to 1/31/2024');
        expect(callArgs.temperature).toBe(0.8); // friendly tone
        expect(callArgs.response_format).toEqual({ type: 'json_object' });
      });

      it('should handle different tones appropriately', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({ sections: [] }),
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        // Test formal tone
        await generateNewsletterContent({
          ...baseOptions,
          tone: 'formal',
        });

        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            temperature: 0.5,
            messages: expect.arrayContaining([
              expect.objectContaining({
                content: expect.stringContaining('professional, structured, and detailed'),
              }),
            ]),
          }),
        );

        // Test informative tone
        await generateNewsletterContent({
          ...baseOptions,
          tone: 'informative',
        });

        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            temperature: 0.6,
            messages: expect.arrayContaining([
              expect.objectContaining({
                content: expect.stringContaining('clear, factual, and educational'),
              }),
            ]),
          }),
        );
      });

      it('should include only requested sections based on options', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({ sections: [] }),
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        await generateNewsletterContent({
          ...baseOptions,
          options: {
            includeArtifacts: false,
            includeReflections: false,
            includeLearningGoals: true,
            includeUpcomingEvents: false,
          },
        });

        const userPrompt = mockCreate.mock.calls[0][0].messages[1].content;
        expect(userPrompt).not.toContain('4. Student Work Showcase');
        expect(userPrompt).not.toContain('5. Student Reflections');
        expect(userPrompt).toContain('6. Upcoming Learning Goals');
        expect(userPrompt).not.toContain('7. Important Dates & Events');
      });

      it('should handle focus areas', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({ sections: [] }),
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        await generateNewsletterContent({
          ...baseOptions,
          focusAreas: ['Mathematics', 'Social Skills', 'Reading Progress'],
        });

        const systemPrompt = mockCreate.mock.calls[0][0].messages[0].content;
        expect(systemPrompt).toContain('Mathematics, Social Skills, Reading Progress');
      });

      it('should handle multiple students', async () => {
        const mockStudents = [
          {
            id: 1,
            firstName: 'Emma',
            lastName: 'Johnson',
            userId: 1,
            gradeLevel: 3,
            artifacts: [],
            reflections: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            firstName: 'Liam',
            lastName: 'Smith',
            userId: 1,
            gradeLevel: 3,
            artifacts: [],
            reflections: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({ sections: [] }),
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        await generateNewsletterContent({
          ...baseOptions,
          students: mockStudents,
        });

        const userPrompt = mockCreate.mock.calls[0][0].messages[1].content;
        expect(userPrompt).toContain('Emma, Liam');
      });
    });

    describe('error handling', () => {
      it('should fall back to template when OpenAI fails', async () => {
        const error = new Error('API rate limit exceeded');
        mockCreate.mockRejectedValue(error);

        const result = await generateNewsletterContent(baseOptions);

        expect(console.error).toHaveBeenCalledWith('Error generating newsletter content:', error);

        // Should return fallback newsletter
        expect(result.sections).toBeDefined();
        expect(result.sections.length).toBeGreaterThan(0);
        expect(result.sections[0].title).toContain('Newsletter');
      });

      it('should handle empty response from OpenAI', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: null,
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const result = await generateNewsletterContent(baseOptions);

        expect(console.error).toHaveBeenCalledWith(
          'Error generating newsletter content:',
          expect.any(Error),
        );

        // Should return fallback
        expect(result.sections).toBeDefined();
      });

      it('should handle invalid JSON response', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: 'Invalid JSON content',
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const result = await generateNewsletterContent(baseOptions);

        expect(console.error).toHaveBeenCalled();
        expect(result.sections).toBeDefined();
      });

      it('should handle missing sections in response', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({}), // No sections property
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const result = await generateNewsletterContent(baseOptions);

        expect(result.sections).toEqual([]);
      });

      it('should handle incomplete section data', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  sections: [
                    {
                      // Missing required fields
                    },
                    {
                      title: 'Complete Section',
                      titleFr: 'Section Complète',
                      content: 'Content',
                      contentFr: 'Contenu',
                    },
                  ],
                }),
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        const result = await generateNewsletterContent(baseOptions);

        expect(result.sections).toHaveLength(2);
        expect(result.sections[0]).toEqual({
          id: expect.stringContaining('section-'),
          title: 'Section',
          titleFr: 'Section',
          content: '',
          contentFr: '',
          isEditable: true,
          order: 0,
        });
      });
    });

    describe('content generation with complex data', () => {
      it('should handle rich daybook entries', async () => {
        const mockDaybookEntries = [
          {
            id: 1,
            userId: 1,
            date: new Date('2024-01-10'),
            notes: 'Introduced fractions using pizza examples',
            whatWorked: 'Visual aids and real-world examples',
            studentEngagement: 'Very high - students loved the pizza activity',
            studentSuccesses: 'All students could identify halves and quarters',
            challenges: 'Some struggled with thirds',
            tomorrowPlan: 'Continue with fraction addition',
            reflections: 'Need more manipulatives for kinesthetic learners',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            userId: 1,
            date: new Date('2024-01-11'),
            notes: 'Fraction addition with like denominators',
            whatWorked: 'Peer teaching was effective',
            studentEngagement: 'Good engagement in pairs',
            studentSuccesses: 'Most mastered adding halves',
            challenges: null,
            tomorrowPlan: null,
            reflections: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({ sections: [] }),
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        await generateNewsletterContent({
          ...baseOptions,
          daybookEntries: mockDaybookEntries,
        });

        const userPrompt = mockCreate.mock.calls[0][0].messages[1].content;
        expect(userPrompt).toContain('pizza examples');
        expect(userPrompt).toContain('Visual aids and real-world examples');
        expect(userPrompt).toContain('students loved the pizza activity');
      });

      it('should handle students with multiple artifacts and reflections', async () => {
        const mockStudents = [
          {
            id: 1,
            firstName: 'Sophie',
            lastName: 'Chen',
            userId: 1,
            gradeLevel: 4,
            artifacts: [
              {
                id: 1,
                studentId: 1,
                title: 'Science Fair Project',
                description: 'Volcano experiment',
                fileUrl: 'volcano.jpg',
                createdAt: new Date('2024-01-10'),
                updatedAt: new Date('2024-01-10'),
              },
              {
                id: 2,
                studentId: 1,
                title: 'Math Portfolio',
                description: 'Problem solving strategies',
                fileUrl: 'math-portfolio.pdf',
                createdAt: new Date('2024-01-20'),
                updatedAt: new Date('2024-01-20'),
              },
            ],
            reflections: [
              {
                id: 1,
                studentId: 1,
                content: 'I enjoyed working with my group on the volcano',
                date: new Date('2024-01-12'),
                createdAt: new Date('2024-01-12'),
                updatedAt: new Date('2024-01-12'),
              },
              {
                id: 2,
                studentId: 1,
                content: 'Math is getting easier when I draw pictures',
                date: new Date('2024-01-22'),
                createdAt: new Date('2024-01-22'),
                updatedAt: new Date('2024-01-22'),
              },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({ sections: [] }),
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        await generateNewsletterContent({
          ...baseOptions,
          students: mockStudents,
        });

        const userPrompt = mockCreate.mock.calls[0][0].messages[1].content;
        expect(userPrompt).toContain('Science Fair Project');
        expect(userPrompt).toContain('Volcano experiment');
        expect(userPrompt).toContain('Math Portfolio');
        expect(userPrompt).toContain('enjoyed working with my group');
        expect(userPrompt).toContain('Math is getting easier');
      });
    });

    describe('fallback newsletter generation', () => {
      it('should generate appropriate fallback content', async () => {
        // Force fallback by making OpenAI fail
        mockCreate.mockRejectedValue(new Error('API error'));

        const result = await generateNewsletterContent({
          ...baseOptions,
          focusAreas: ['Reading', 'Writing'],
        });

        expect(result.sections).toBeDefined();
        expect(result.sections.length).toBeGreaterThan(0);

        const introSection = result.sections.find(
          (s) =>
            s.title.toLowerCase().includes('newsletter') ||
            s.title.toLowerCase().includes('introduction'),
        );
        expect(introSection).toBeDefined();
        expect(introSection?.content).toContain('1/1/2024 to 1/31/2024');

        // Should have bilingual content
        expect(introSection?.titleFr).toBeDefined();
        expect(introSection?.contentFr).toBeDefined();

        // Should respect options
        if (baseOptions.options.includeUpcomingEvents) {
          const eventsSection = result.sections.find(
            (s) =>
              s.title.toLowerCase().includes('event') || s.title.toLowerCase().includes('date'),
          );
          expect(eventsSection).toBeDefined();
        }
      });

      it('should include focus areas in fallback', async () => {
        mockCreate.mockRejectedValue(new Error('API error'));

        const result = await generateNewsletterContent({
          ...baseOptions,
          focusAreas: ['STEM Activities', 'Art Projects'],
        });

        const academicSection = result.sections.find(
          (s) =>
            s.title.toLowerCase().includes('academic') ||
            s.title.toLowerCase().includes('learning'),
        );

        expect(academicSection?.content).toContain('STEM Activities');
        expect(academicSection?.content).toContain('Art Projects');
      });
    });

    describe('API configuration', () => {
      it('should handle missing API key gracefully', async () => {
        // Simulate missing API key
        const originalEnv = process.env.OPENAI_API_KEY;
        delete process.env.OPENAI_API_KEY;

        // Re-import to test initialization without key
        jest.resetModules();
        const { generateNewsletterContent: generateNewsletter } = await import(
          '../../src/services/newsletterService'
        );

        const result = await generateNewsletter(baseOptions);

        // Should fall back gracefully
        expect(result.sections).toBeDefined();

        // Restore
        process.env.OPENAI_API_KEY = originalEnv;
      });
    });

    describe('date formatting', () => {
      it('should format dates appropriately for different locales', async () => {
        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({ sections: [] }),
              },
            },
          ],
        };

        mockCreate.mockResolvedValue(mockResponse);

        await generateNewsletterContent({
          ...baseOptions,
          fromDate: new Date('2024-03-15'),
          toDate: new Date('2024-04-15'),
        });

        const userPrompt = mockCreate.mock.calls[0][0].messages[1].content;
        // Should contain formatted dates
        expect(userPrompt).toMatch(/3\/15\/2024|15\/3\/2024|March 15|15 March/);
        expect(userPrompt).toMatch(/4\/15\/2024|15\/4\/2024|April 15|15 April/);
      });
    });
  });
});
