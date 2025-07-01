import { AIPlanningAssistantService } from '../../src/services/aiPlanningAssistant';
import OpenAI from 'openai';
import { prisma } from '../../src/prisma';
import logger from '../../src/logger';

// Mock dependencies
jest.mock('openai');
jest.mock('../../src/prisma');
jest.mock('../../src/logger');

describe('AIPlanningAssistantService', () => {
  let service: AIPlanningAssistantService;
  const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;
  const mockLogger = logger as jest.Mocked<typeof logger>;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;
  let mockOpenAIInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variable
    delete process.env.OPENAI_API_KEY;

    // Setup mock OpenAI instance
    mockOpenAIInstance = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };
    mockOpenAI.mockImplementation(() => mockOpenAIInstance as any);
  });

  describe('initialization', () => {
    it('should initialize without OpenAI API key', () => {
      service = new AIPlanningAssistantService();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'OpenAI API key not found - AI planning assistance will be disabled',
      );
    });

    it('should initialize with OpenAI API key', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      service = new AIPlanningAssistantService();
      expect(mockOpenAI).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
    });
  });

  describe('generateLongRangeGoals', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      service = new AIPlanningAssistantService();

      // Setup centralized mocks
      const mockOpenAIInstance = MockRegistry.openai.create();
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
        () => mockOpenAIInstance as any,
      );
    });

    it('should generate long-range goals successfully', async () => {
      const mockResponse = JSON.stringify({
        suggestions: [
          'Students will improve reading comprehension by 2 levels',
          'Students will master multiplication facts 0-10',
          'Students will write 3-paragraph essays independently',
        ],
        rationale: 'These goals align with Grade 3 standards',
      });

      // Configure mock to return our response
      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateLongRangeGoals({
        subject: 'Mathematics',
        grade: 3,
        termLength: 10,
        focusAreas: ['Number Sense', 'Problem Solving'],
      });

      expect(result).toEqual({
        type: 'goals',
        suggestions: [
          'Students will improve reading comprehension by 2 levels',
          'Students will master multiplication facts 0-10',
          'Students will write 3-paragraph essays independently',
        ],
        rationale: 'These goals align with Grade 3 standards',
      });

      // Verify prompt includes context
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.model).toBe('gpt-4');
      expect(callArgs.messages[1].content).toContain('Grade 3 Mathematics');
      expect(callArgs.messages[1].content).toContain('10 weeks');
      expect(callArgs.messages[1].content).toContain('Number Sense, Problem Solving');
    });

    it('should handle missing focus areas', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: ['Goal 1', 'Goal 2'],
                rationale: 'General goals',
              }),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateLongRangeGoals({
        subject: 'Science',
        grade: 5,
        termLength: 12,
      });

      expect(result.type).toBe('goals');
      expect(result.suggestions).toHaveLength(2);

      // Verify prompt doesn't include focus areas
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[1].content).not.toContain('Focus areas:');
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API rate limit exceeded');
      mockCreate.mockRejectedValue(error);

      const result = await service.generateLongRangeGoals({
        subject: 'Math',
        grade: 4,
        termLength: 10,
      });

      expect(result).toEqual({
        type: 'goals',
        suggestions: [],
      });
      expect(mockLogger.error).toHaveBeenCalledWith(
        { error },
        'Failed to generate long-range goals',
      );
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

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateLongRangeGoals({
        subject: 'Math',
        grade: 2,
        termLength: 8,
      });

      expect(result).toEqual({
        type: 'goals',
        suggestions: [],
      });
    });

    it('should handle missing API key', async () => {
      delete process.env.OPENAI_API_KEY;
      service = new AIPlanningAssistantService();

      const result = await service.generateLongRangeGoals({
        subject: 'Math',
        grade: 3,
        termLength: 10,
      });

      expect(result).toEqual({
        type: 'goals',
        suggestions: [],
      });
    });

    it('should handle empty response content', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateLongRangeGoals({
        subject: 'Math',
        grade: 3,
        termLength: 10,
      });

      expect(result).toEqual({
        type: 'goals',
        suggestions: [],
      });
    });
  });

  describe('generateUnitBigIdeas', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      service = new AIPlanningAssistantService();
    });

    it('should generate unit big ideas successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'Patterns help us make predictions',
                  'Numbers can be represented in multiple ways',
                  'Mathematical relationships exist in nature',
                ],
                rationale: 'These big ideas connect the curriculum expectations',
              }),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateUnitBigIdeas({
        unitTitle: 'Patterns and Algebra',
        subject: 'Mathematics',
        grade: 4,
        curriculumExpectations: [
          'Identify and describe patterns',
          'Create and extend patterns',
          'Use patterns to solve problems',
        ],
        duration: 3,
      });

      expect(result).toEqual({
        type: 'bigIdeas',
        suggestions: [
          'Patterns help us make predictions',
          'Numbers can be represented in multiple ways',
          'Mathematical relationships exist in nature',
        ],
        rationale: 'These big ideas connect the curriculum expectations',
      });

      // Verify prompt includes all context
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[1].content).toContain('Patterns and Algebra');
      expect(callArgs.messages[1].content).toContain('Grade 4 Mathematics');
      expect(callArgs.messages[1].content).toContain('3 weeks');
      expect(callArgs.messages[1].content).toContain('Identify and describe patterns');
    });

    it('should handle empty curriculum expectations', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: ['Big idea 1'],
                rationale: 'General big idea',
              }),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateUnitBigIdeas({
        unitTitle: 'Science Unit',
        subject: 'Science',
        grade: 2,
        curriculumExpectations: [],
        duration: 2,
      });

      expect(result.type).toBe('bigIdeas');
      expect(result.suggestions).toHaveLength(1);
    });
  });

  describe('generateLessonActivities', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      service = new AIPlanningAssistantService();
    });

    it('should generate lesson activities with materials', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'Activity 1: Number Talk warm-up (5 minutes)',
                  'Activity 2: Hands-on manipulative exploration (15 minutes)',
                  'Activity 3: Partner problem solving (10 minutes)',
                  'Activity 4: Exit ticket reflection (5 minutes)',
                ],
                rationale: 'Progressive sequence from activation to consolidation',
              }),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateLessonActivities({
        lessonTitle: 'Introduction to Fractions',
        learningGoals: ['Understand fractions as parts of a whole', 'Compare simple fractions'],
        subject: 'Mathematics',
        grade: 3,
        duration: 40,
        materials: ['fraction strips', 'pattern blocks'],
      });

      expect(result.type).toBe('activities');
      expect(result.suggestions).toHaveLength(4);
      expect(result.suggestions[0]).toContain('5 minutes');

      // Verify materials are included in prompt
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[1].content).toContain('fraction strips, pattern blocks');
      expect(callArgs.temperature).toBe(0.8); // Higher temperature for creativity
    });

    it('should generate activities without materials', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: ['Activity 1', 'Activity 2'],
                rationale: 'Simple activities',
              }),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateLessonActivities({
        lessonTitle: 'Poetry Writing',
        learningGoals: ['Write simple poems'],
        subject: 'Language Arts',
        grade: 2,
        duration: 30,
      });

      expect(result.type).toBe('activities');

      // Verify materials not in prompt
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[1].content).not.toContain('Available materials:');
    });
  });

  describe('generateMaterialsList', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      service = new AIPlanningAssistantService();
    });

    it('should generate materials list for activities', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'Chart paper (2 sheets)',
                  'Markers (1 set per group of 4)',
                  'Base-10 blocks (1 set per pair)',
                  'Student whiteboards (1 per student)',
                  'Dry erase markers (1 per student)',
                ],
                rationale: 'Materials support hands-on learning and collaboration',
              }),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateMaterialsList({
        activities: [
          'Group brainstorming on chart paper',
          'Hands-on place value with base-10 blocks',
          'Individual practice on whiteboards',
        ],
        subject: 'Mathematics',
        grade: 2,
        classSize: 24,
      });

      expect(result.type).toBe('materials');
      expect(result.suggestions).toHaveLength(5);
      expect(result.suggestions[0]).toContain('2 sheets');
      expect(result.suggestions[1]).toContain('per group of 4');

      // Verify class size is considered
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[1].content).toContain('24 students');
      expect(callArgs.temperature).toBe(0.6); // Lower temperature for practical suggestions
    });
  });

  describe('generateAssessmentStrategies', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      service = new AIPlanningAssistantService();
    });

    it('should generate varied assessment strategies', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'Exit ticket: Students draw and label a fraction',
                  'Observation checklist for group work focusing on collaboration',
                  'Student self-assessment using thumbs up/down for understanding',
                  'Quick oral check-in with struggling students',
                ],
                rationale: 'Mix of formative assessments to gauge understanding',
              }),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateAssessmentStrategies({
        learningGoals: ['Understand fractions', 'Work collaboratively'],
        activities: ['Group work with manipulatives', 'Individual practice'],
        subject: 'Mathematics',
        grade: 3,
      });

      expect(result.type).toBe('assessments');
      expect(result.suggestions).toHaveLength(4);
      expect(result.suggestions[0]).toContain('Exit ticket');
      expect(result.suggestions[1]).toContain('Observation');
      expect(result.suggestions[2]).toContain('self-assessment');
    });
  });

  describe('generateReflectionPrompts', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      service = new AIPlanningAssistantService();
    });

    it('should generate reflection prompts with previous reflections context', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'How did students demonstrate understanding of fractions today?',
                  'What adjustments could improve the manipulative activity?',
                  'Which students need additional support with comparing fractions?',
                  'How effective was the exit ticket in assessing learning?',
                ],
                rationale: 'Prompts focus on student learning and instructional effectiveness',
              }),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateReflectionPrompts({
        date: new Date('2024-01-15'),
        activities: ['Fraction introduction', 'Manipulative exploration', 'Exit ticket'],
        subject: 'Mathematics',
        grade: 3,
        previousReflections: [
          'Students struggled with equivalent fractions',
          'Need more visual representations',
        ],
      });

      expect(result.type).toBe('reflections');
      expect(result.suggestions).toHaveLength(4);

      // Verify previous reflections are included
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[1].content).toContain(
        'Students struggled with equivalent fractions',
      );
    });

    it('should generate prompts without previous reflections', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: ['Reflection 1', 'Reflection 2'],
                rationale: 'General reflections',
              }),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.generateReflectionPrompts({
        date: new Date(),
        activities: ['Activity 1'],
        subject: 'Science',
        grade: 4,
      });

      expect(result.type).toBe('reflections');

      // Verify no previous reflections in prompt
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[1].content).not.toContain('Recent reflection themes:');
    });
  });

  describe('getCurriculumAlignedSuggestions', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      service = new AIPlanningAssistantService();
    });

    it('should generate curriculum-aligned activities', async () => {
      const mockExpectations = [
        {
          id: 'exp1',
          code: 'MA3.NS.1',
          description: 'Represent and compare whole numbers up to 1000',
        },
        {
          id: 'exp2',
          code: 'MA3.NS.2',
          description: 'Add and subtract three-digit numbers',
        },
      ];

      (prisma.curriculumExpectation.findMany as jest.Mock).mockResolvedValue(mockExpectations);

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                'Number line hopscotch to compare three-digit numbers',
                'Base-10 block trading game for place value',
                'Mental math relay race for addition strategies',
              ]),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.getCurriculumAlignedSuggestions(['exp1', 'exp2'], 'activities');

      expect(result).toEqual([
        'Number line hopscotch to compare three-digit numbers',
        'Base-10 block trading game for place value',
        'Mental math relay race for addition strategies',
      ]);

      // Verify database query
      expect(prisma.curriculumExpectation.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['exp1', 'exp2'] } },
      });

      // Verify prompt includes expectation details
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[1].content).toContain('MA3.NS.1');
      expect(callArgs.messages[1].content).toContain('MA3.NS.2');
    });

    it('should generate assessments when requested', async () => {
      const mockExpectations = [
        {
          id: 'exp1',
          code: 'SC4.1',
          description: 'Identify properties of matter',
        },
      ];

      (prisma.curriculumExpectation.findMany as jest.Mock).mockResolvedValue(mockExpectations);

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                'Lab report on material properties',
                'Exit ticket sorting materials by state',
              ]),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.getCurriculumAlignedSuggestions(['exp1'], 'assessments');

      expect(result).toHaveLength(2);
      expect(result[0]).toContain('Lab report');

      // Verify correct prompt for assessments
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.messages[1].content).toContain('assessment strategies');
    });

    it('should generate resources when requested', async () => {
      const mockExpectations = [
        {
          id: 'exp1',
          code: 'LA2.R.1',
          description: 'Read grade-appropriate texts',
        },
      ];

      (prisma.curriculumExpectation.findMany as jest.Mock).mockResolvedValue(mockExpectations);

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                'Leveled reading library books',
                'Online reading comprehension games',
              ]),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.getCurriculumAlignedSuggestions(['exp1'], 'resources');

      expect(result).toHaveLength(2);
      expect(result[0]).toContain('reading library');
    });

    it('should handle empty expectation IDs', async () => {
      const result = await service.getCurriculumAlignedSuggestions([], 'activities');
      expect(result).toEqual([]);
      expect(prisma.curriculumExpectation.findMany).not.toHaveBeenCalled();
    });

    it('should handle no expectations found', async () => {
      (prisma.curriculumExpectation.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getCurriculumAlignedSuggestions(['exp1'], 'activities');
      expect(result).toEqual([]);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON response', async () => {
      const mockExpectations = [
        {
          id: 'exp1',
          code: 'MA1.1',
          description: 'Count to 100',
        },
      ];

      (prisma.curriculumExpectation.findMany as jest.Mock).mockResolvedValue(mockExpectations);

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Not valid JSON',
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.getCurriculumAlignedSuggestions(['exp1'], 'activities');
      expect(result).toEqual([]);
    });

    it('should handle non-array JSON response', async () => {
      const mockExpectations = [
        {
          id: 'exp1',
          code: 'MA1.1',
          description: 'Count to 100',
        },
      ];

      (prisma.curriculumExpectation.findMany as jest.Mock).mockResolvedValue(mockExpectations);

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ suggestion: 'Not an array' }),
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      const result = await service.getCurriculumAlignedSuggestions(['exp1'], 'activities');
      expect(result).toEqual([]);
    });
  });

  describe('getServiceHealth', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      // Setup centralized mocks
      const mockOpenAIInstance = MockRegistry.openai.create();
      (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
        () => mockOpenAIInstance as any,
      );
    });

    it('should report unhealthy when API key is missing', async () => {
      delete process.env.OPENAI_API_KEY;
      service = new AIPlanningAssistantService();

      const health = await service.getServiceHealth();

      expect(health).toEqual({
        healthy: false,
        apiKey: false,
        lastCheck: expect.any(String),
        error: 'OpenAI API key not configured',
      });
    });

    it('should report healthy when API test succeeds', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Test response',
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      service = new AIPlanningAssistantService();

      const health = await service.getServiceHealth();

      expect(health).toEqual({
        healthy: true,
        apiKey: true,
        lastCheck: expect.any(String),
      });

      // Verify minimal test request
      expect(mockCreate).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });
    });

    it('should report unhealthy when API test fails', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      const error = new Error('API connection failed');
      mockCreate.mockRejectedValue(error);

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      service = new AIPlanningAssistantService();

      const health = await service.getServiceHealth();

      expect(health).toEqual({
        healthy: false,
        apiKey: true,
        lastCheck: expect.any(String),
        error: 'API connection failed',
      });

      expect(mockLogger.error).toHaveBeenCalledWith({ error }, 'AI service health check failed');
    });

    it('should handle non-Error exceptions in health check', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      mockCreate.mockRejectedValue('String error');

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      service = new AIPlanningAssistantService();

      const health = await service.getServiceHealth();

      expect(health).toEqual({
        healthy: false,
        apiKey: true,
        lastCheck: expect.any(String),
        error: 'Unknown error',
      });
    });

    it('should report unhealthy when API returns empty content', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';

      const mockResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      mockOpenAIInstance.chat.completions.create.mockResolvedValue(
        MockRegistry.openai.chat(mockResponse),
      );

      mockOpenAI.mockImplementation(
        () =>
          ({
            chat: {
              completions: { create: mockCreate },
            },
          }) as any,
      );

      service = new AIPlanningAssistantService();

      const health = await service.getServiceHealth();

      expect(health).toEqual({
        healthy: false,
        apiKey: true,
        lastCheck: expect.any(String),
      });
    });
  });
});
