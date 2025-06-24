import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AIPlanningAssistantService } from '../services/aiPlanningAssistant';
import { prisma } from '../prisma';

// Mock OpenAI
jest.mock('openai');

// Mock Prisma - already mocked in setup-all-mocks.ts

describe('AIPlanningAssistantService', () => {
  let service: AIPlanningAssistantService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AIPlanningAssistantService();
  });

  describe('generateLongRangeGoals', () => {
    it('should generate SMART goals for long-range planning', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'By the end of Term 1, 80% of students will demonstrate proficiency in counting to 100',
                  'Students will develop problem-solving strategies for addition and subtraction within 20',
                  'All students will show growth in mathematical communication and reasoning skills',
                ],
                rationale:
                  'These goals align with Grade 1 mathematics curriculum and are measurable',
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.generateLongRangeGoals({
        subject: 'Mathematics',
        grade: 1,
        termLength: 20,
        focusAreas: ['Number Sense', 'Problem Solving'],
      });

      expect(result.type).toBe('goals');
      expect(result.suggestions).toHaveLength(3);
      expect(result.rationale).toBeDefined();
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: expect.any(Array),
        temperature: 0.7,
        max_tokens: 1000,
      });
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const result = await service.generateLongRangeGoals({
        subject: 'Mathematics',
        grade: 1,
        termLength: 20,
      });

      expect(result.type).toBe('goals');
      expect(result.suggestions).toEqual([]);
      expect(result.rationale).toBeUndefined();
    });
  });

  describe('generateUnitBigIdeas', () => {
    it('should generate conceptual big ideas for units', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'Numbers are all around us and help us understand our world',
                  'We can use different strategies to solve number problems',
                  'Patterns help us predict and understand relationships',
                ],
                rationale:
                  'These big ideas connect multiple expectations and promote deep understanding',
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.generateUnitBigIdeas({
        unitTitle: 'Exploring Numbers',
        subject: 'Mathematics',
        grade: 1,
        curriculumExpectations: ['M1.1: Count to 100', 'M1.2: Compare numbers to 20'],
        duration: 4,
      });

      expect(result.type).toBe('bigIdeas');
      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions[0]).toContain('Numbers');
    });
  });

  describe('generateLessonActivities', () => {
    it('should generate engaging activities for lessons', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'Activity 1: Number Hunt Game - Students find and count objects (10 minutes)',
                  'Activity 2: Partner Counting Practice with manipulatives (15 minutes)',
                  'Activity 3: Number Line Hopscotch - Physical counting activity (10 minutes)',
                  'Activity 4: Exit Card - Draw and label a number collection (5 minutes)',
                ],
                rationale: 'Activities progress from engagement to practice to assessment',
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.generateLessonActivities({
        lessonTitle: 'Counting to 20',
        learningGoals: ['Count objects to 20', 'Represent numbers using materials'],
        subject: 'Mathematics',
        grade: 1,
        duration: 40,
      });

      expect(result.type).toBe('activities');
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain('minutes');
    });
  });

  describe('generateMaterialsList', () => {
    it('should generate appropriate materials list', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'Counting bears (30 sets of 20)',
                  'Number cards 1-20 (15 sets)',
                  'Ten frames (15 laminated)',
                  'Whiteboards and markers (1 per student)',
                ],
                rationale: 'Materials support hands-on learning for 30 students',
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.generateMaterialsList({
        activities: ['Counting practice', 'Number representation'],
        subject: 'Mathematics',
        grade: 1,
        classSize: 30,
      });

      expect(result.type).toBe('materials');
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain('30');
    });
  });

  describe('getCurriculumAlignedSuggestions', () => {
    it('should generate suggestions based on curriculum expectations', async () => {
      const mockExpectations = [
        {
          id: 'exp-1',
          code: 'M1.1',
          description: 'Count to 100 by 1s and 10s',
        },
        {
          id: 'exp-2',
          code: 'M1.2',
          description: 'Read and represent whole numbers to 50',
        },
      ];

      (prisma.curriculumExpectation.findMany as jest.Mock).mockResolvedValue(mockExpectations);

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                'Counting Collections: Students count various objects and record totals',
                'Number Building: Use base-10 blocks to build and represent numbers',
                'Skip Counting Songs: Musical activities for counting by 10s',
              ]),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.getCurriculumAlignedSuggestions(
        ['exp-1', 'exp-2'],
        'activities',
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toContain('Counting');
      expect(prisma.curriculumExpectation.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['exp-1', 'exp-2'] } },
      });
    });

    it('should return empty array if no expectations provided', async () => {
      const result = await service.getCurriculumAlignedSuggestions([], 'activities');
      expect(result).toEqual([]);
    });
  });

  describe('generateReflectionPrompts', () => {
    it('should generate thoughtful reflection prompts', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'How did students demonstrate understanding of counting strategies today?',
                  'Which students need additional support with number recognition?',
                  'What modifications could improve the manipulatives activity?',
                  'How effectively did the exit cards capture student learning?',
                ],
                rationale:
                  'Prompts focus on student learning, differentiation, and instructional improvement',
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.generateReflectionPrompts({
        date: new Date('2024-01-15'),
        activities: ['Counting practice', 'Number games', 'Exit cards'],
        subject: 'Mathematics',
        grade: 1,
      });

      expect(result.type).toBe('reflections');
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain('?');
    });
  });

  describe('No API Key Handling', () => {
    it('should handle missing API key gracefully', async () => {
      // Create service without API key
      delete process.env.OPENAI_API_KEY;
      const serviceNoKey = new AIPlanningAssistantService();

      const result = await serviceNoKey.generateLongRangeGoals({
        subject: 'Mathematics',
        grade: 1,
        termLength: 20,
      });

      expect(result.type).toBe('goals');
      expect(result.suggestions).toEqual([]);
    });
  });
});
