import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AIPlanningAssistantService } from '../../src/services/aiPlanningAssistant';

describe('AIPlanningAssistantService', () => {
  let service: AIPlanningAssistantService;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Set environment variable first
    process.env.OPENAI_API_KEY = 'test-api-key';

    service = new AIPlanningAssistantService();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with OpenAI when API key is present', () => {
      expect(service).toBeDefined();
      // Since we're using mocked OpenAI, we just verify the service exists
    });

    it('should handle missing API key gracefully', () => {
      delete process.env.OPENAI_API_KEY;
      
      // Create service without API key
      const serviceWithoutKey = new AIPlanningAssistantService();
      expect(serviceWithoutKey).toBeDefined();
    });
  });

  describe('generateLongRangeGoals', () => {
    const mockContext = {
      subject: 'Mathematics',
      grade: 4,
      termLength: 12,
      focusAreas: ['Problem Solving', 'Number Sense'],
    };

    it('should return goals structure when API key is available', async () => {
      const result = await service.generateLongRangeGoals(mockContext);

      expect(result).toHaveProperty('type', 'goals');
      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should handle missing optional parameters', async () => {
      const contextWithoutFocus = {
        subject: 'Science',
        grade: 3,
        termLength: 10,
      };

      const result = await service.generateLongRangeGoals(contextWithoutFocus);

      expect(result).toHaveProperty('type', 'goals');
      expect(result).toHaveProperty('suggestions');
    });
  });

  describe('generateUnitBigIdeas', () => {
    const mockContext = {
      unitTitle: 'Fractions and Decimals',
      subject: 'Mathematics',
      grade: 5,
      curriculumExpectations: [
        'Represent fractions using models',
        'Compare and order fractions',
        'Convert between fractions and decimals',
      ],
      duration: 3,
    };

    it('should return big ideas structure', async () => {
      const result = await service.generateUnitBigIdeas(mockContext);

      expect(result).toHaveProperty('type', 'bigIdeas');
      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('generateLessonActivities', () => {
    const mockContext = {
      lessonTitle: 'Introduction to Multiplication',
      learningGoals: [
        'Understand multiplication as repeated addition',
        'Use arrays to represent multiplication',
      ],
      subject: 'Mathematics',
      grade: 3,
      duration: 60,
      materials: ['Base-10 blocks', 'Grid paper'],
    };

    it('should return activities structure', async () => {
      const result = await service.generateLessonActivities(mockContext);

      expect(result).toHaveProperty('type', 'activities');
      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should handle missing materials', async () => {
      const contextWithoutMaterials = { ...mockContext };
      delete contextWithoutMaterials.materials;

      const result = await service.generateLessonActivities(contextWithoutMaterials);

      expect(result).toHaveProperty('type', 'activities');
      expect(result).toHaveProperty('suggestions');
    });
  });

  describe('generateMaterialsList', () => {
    const mockContext = {
      activities: [
        'Students work in pairs with base-10 blocks',
        'Groups create posters showing arrays',
        'Individual practice on worksheets',
      ],
      subject: 'Mathematics',
      grade: 3,
      classSize: 24,
    };

    it('should return materials structure', async () => {
      const result = await service.generateMaterialsList(mockContext);

      expect(result).toHaveProperty('type', 'materials');
      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('generateAssessmentStrategies', () => {
    const mockContext = {
      learningGoals: [
        'Students will identify 2D shapes',
        'Students will describe shape properties',
      ],
      activities: [
        'Shape hunt around the classroom',
        'Sort shapes by properties',
        'Create shape artwork',
      ],
      subject: 'Mathematics',
      grade: 2,
    };

    it('should return assessment structure', async () => {
      const result = await service.generateAssessmentStrategies(mockContext);

      expect(result).toHaveProperty('type', 'assessments');
      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('generateReflectionPrompts', () => {
    const mockContext = {
      date: new Date('2024-01-15'),
      activities: [
        'Introduced fractions with pizza models',
        'Students created fraction strips',
        'Played fraction comparison game',
      ],
      subject: 'Mathematics',
      grade: 4,
      previousReflections: [
        'Students struggled with equivalent fractions',
        'Visual models helped understanding',
      ],
    };

    it('should return reflection prompts structure', async () => {
      const result = await service.generateReflectionPrompts(mockContext);

      expect(result).toHaveProperty('type', 'reflections');
      expect(result).toHaveProperty('suggestions');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should handle missing previous reflections', async () => {
      const contextWithoutPrevious = { ...mockContext };
      delete contextWithoutPrevious.previousReflections;

      const result = await service.generateReflectionPrompts(contextWithoutPrevious);

      expect(result).toHaveProperty('type', 'reflections');
      expect(result).toHaveProperty('suggestions');
    });
  });

  describe('getCurriculumAlignedSuggestions', () => {
    it('should handle empty expectation IDs', async () => {
      const result = await service.getCurriculumAlignedSuggestions([], 'activities');
      expect(result).toEqual([]);
    });

    it('should return suggestions array', async () => {
      const expectationIds = ['exp-1', 'exp-2'];
      const mockExpectations = [
        { id: 'exp-1', code: 'MA4.1', description: 'Understand place value' },
        { id: 'exp-2', code: 'MA4.2', description: 'Compare and order numbers' },
      ];

      const prismaModule = await import('../../src/prisma');
      const mockPrisma = prismaModule.prisma as any;
      mockPrisma.curriculumExpectation.findMany.mockResolvedValueOnce(mockExpectations);

      const result = await service.getCurriculumAlignedSuggestions(expectationIds, 'activities');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle database errors', async () => {
      const prismaModule = await import('../../src/prisma');
      const mockPrisma = prismaModule.prisma as any;
      mockPrisma.curriculumExpectation.findMany.mockRejectedValueOnce(new Error('DB Error'));

      const result = await service.getCurriculumAlignedSuggestions(['exp-1'], 'assessments');
      expect(result).toEqual([]);
    });
  });

  describe('getServiceHealth', () => {
    it('should return health status', async () => {
      const result = await service.getServiceHealth();

      expect(result).toHaveProperty('healthy');
      expect(result).toHaveProperty('apiKey');
      expect(result).toHaveProperty('lastCheck');
      expect(typeof result.healthy).toBe('boolean');
      expect(typeof result.apiKey).toBe('boolean');
      expect(typeof result.lastCheck).toBe('string');
    });

    it('should handle service without API key', async () => {
      delete process.env.OPENAI_API_KEY;
      const serviceWithoutAPI = new AIPlanningAssistantService();

      const result = await serviceWithoutAPI.getServiceHealth();

      expect(result).toMatchObject({
        healthy: false,
        apiKey: false,
        lastCheck: expect.any(String),
        error: 'OpenAI API key not configured',
      });
    });
  });

  describe('Prompt generation', () => {
    it('should handle various contexts', async () => {
      const contexts = [
        {
          subject: 'Science',
          grade: 3,
          termLength: 10,
          focusAreas: ['Life Systems', 'Matter'],
        },
        {
          subject: 'Art',
          grade: 1,
          termLength: 8,
        },
        {
          subject: 'French',
          grade: 6,
          termLength: 15,
          focusAreas: ['Speaking', 'Reading'],
        },
      ];

      for (const context of contexts) {
        const result = await service.generateLongRangeGoals(context);
        expect(result).toHaveProperty('type', 'goals');
        expect(result).toHaveProperty('suggestions');
      }
    });
  });

  describe('Rate limiting behavior', () => {
    it('should handle concurrent requests', async () => {
      const context = {
        subject: 'Music',
        grade: 1,
        termLength: 12,
      };

      const promises = Array(5).fill(null).map(() => 
        service.generateLongRangeGoals(context)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toHaveProperty('type', 'goals');
      });
    });
  });

  describe('Integration patterns', () => {
    it('should work with complete planning workflow', async () => {
      // Long-range goals
      const longRangeContext = {
        subject: 'Mathematics',
        grade: 4,
        termLength: 12,
      };
      const goals = await service.generateLongRangeGoals(longRangeContext);
      expect(goals.type).toBe('goals');

      // Unit big ideas
      const unitContext = {
        unitTitle: 'Number Sense',
        subject: 'Mathematics',
        grade: 4,
        curriculumExpectations: ['Count numbers', 'Compare quantities'],
        duration: 4,
      };
      const bigIdeas = await service.generateUnitBigIdeas(unitContext);
      expect(bigIdeas.type).toBe('bigIdeas');

      // Lesson activities
      const lessonContext = {
        lessonTitle: 'Comparing Numbers',
        learningGoals: ['Compare two-digit numbers'],
        subject: 'Mathematics',
        grade: 4,
        duration: 45,
      };
      const activities = await service.generateLessonActivities(lessonContext);
      expect(activities.type).toBe('activities');
    });
  });
});