import { AIActivityGenerator } from '../../src/services/aiActivityGenerator';
import { MockRegistry } from '../mocks/registry';

describe('AIActivityGenerator', () => {
  let generator: AIActivityGenerator;

  beforeEach(() => {
    generator = new AIActivityGenerator();

    // Setup centralized mocks
    const mockOpenAIInstance = MockRegistry.openai.create();
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIInstance as any);
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(generator).toBeInstanceOf(AIActivityGenerator);
    });
  });

  describe('generateActivity', () => {
    it('should generate activity with all parameters', async () => {
      const params = {
        outcomeId: 'outcome-123',
        userId: 456,
        subject: 'Mathematics',
        grade: 3,
        theme: 'Number Sense',
        duration: 45,
        languageLevel: 'Beginner',
      };

      const result = await generator.generateActivity(params);

      expect(result).toMatchObject({
        id: expect.stringContaining('generated-'),
        title: 'Generated Activity',
        description: 'This is a stub implementation',
        duration: 30,
        materials: [],
        learningGoals: [],
        subject: 'Mathematics',
        grade: 3,
      });
    });

    it('should generate activity with minimal parameters', async () => {
      const params = {};

      const result = await generator.generateActivity(params);

      expect(result).toMatchObject({
        id: expect.stringContaining('generated-'),
        title: 'Generated Activity',
        description: 'This is a stub implementation',
        duration: 30,
        materials: [],
        learningGoals: [],
        subject: 'General',
        grade: 1,
      });
    });

    it('should generate unique IDs for different calls', async () => {
      const result1 = await generator.generateActivity({});
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 1));
      const result2 = await generator.generateActivity({});

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toMatch(/^generated-\d+$/);
      expect(result2.id).toMatch(/^generated-\d+$/);
    });

    it('should use provided subject and grade', async () => {
      const params = {
        subject: 'Science',
        grade: 5,
      };

      const result = await generator.generateActivity(params);

      expect(result.subject).toBe('Science');
      expect(result.grade).toBe(5);
    });

    it('should handle edge case grade values', async () => {
      const testCases = [
        { grade: 0, expected: 0 },
        { grade: 8, expected: 8 },
        { grade: -1, expected: -1 },
        { grade: 13, expected: 13 },
      ];

      for (const testCase of testCases) {
        const result = await generator.generateActivity({ grade: testCase.grade });
        expect(result.grade).toBe(testCase.expected);
      }
    });

    it('should handle various subject types', async () => {
      const subjects = [
        'Mathematics',
        'Science',
        'Language Arts',
        'Social Studies',
        'Physical Education',
        'Art',
        'Music',
        'French',
        '',
        'Very Long Subject Name That Might Cause Issues',
      ];

      for (const subject of subjects) {
        const result = await generator.generateActivity({ subject });
        expect(result.subject).toBe(subject || 'General');
      }
    });

    it('should handle various duration values', async () => {
      const durations = [15, 30, 45, 60, 90, 120];

      for (const duration of durations) {
        const result = await generator.generateActivity({ duration });
        // Note: Current implementation ignores duration parameter
        expect(result.duration).toBe(30);
      }
    });

    it('should handle null and undefined parameters', async () => {
      const params = {
        outcomeId: null,
        userId: undefined,
        subject: null,
        grade: undefined,
        theme: null,
        duration: undefined,
        languageLevel: null,
      };

      const result = await generator.generateActivity(params as any);

      expect(result).toMatchObject({
        id: expect.stringContaining('generated-'),
        title: 'Generated Activity',
        description: 'This is a stub implementation',
        duration: 30,
        materials: [],
        learningGoals: [],
        subject: 'General',
        grade: 1,
      });
    });

    it('should return consistent structure regardless of input', async () => {
      const inputs = [
        {},
        { grade: 2 },
        { subject: 'Math', grade: 3, theme: 'Algebra' },
        { userId: 123, outcomeId: 'abc', languageLevel: 'Advanced' },
      ];

      for (const input of inputs) {
        const result = await generator.generateActivity(input);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('description');
        expect(result).toHaveProperty('duration');
        expect(result).toHaveProperty('materials');
        expect(result).toHaveProperty('learningGoals');
        expect(result).toHaveProperty('subject');
        expect(result).toHaveProperty('grade');

        expect(typeof result.id).toBe('string');
        expect(typeof result.title).toBe('string');
        expect(typeof result.description).toBe('string');
        expect(typeof result.duration).toBe('number');
        expect(Array.isArray(result.materials) || typeof result.materials === 'string').toBe(true);
        expect(Array.isArray(result.learningGoals)).toBe(true);
        expect(typeof result.subject).toBe('string');
        expect(typeof result.grade).toBe('number');
      }
    });
  });

  describe('getUncoveredOutcomes', () => {
    it('should return empty array for any parameters', async () => {
      const params = {
        userId: 123,
        theme: 'Test Theme',
        limit: 10,
      };

      const result = await generator.getUncoveredOutcomes(params);

      expect(result).toEqual([]);
    });

    it('should handle missing optional parameters', async () => {
      const params = {
        userId: 456,
      };

      const result = await generator.getUncoveredOutcomes(params);

      expect(result).toEqual([]);
    });

    it('should handle edge case user IDs', async () => {
      const userIds = [0, -1, 999999];

      for (const userId of userIds) {
        const result = await generator.getUncoveredOutcomes({ userId });
        expect(result).toEqual([]);
      }
    });

    it('should handle various theme values', async () => {
      const themes = [
        'Mathematics',
        '',
        'Very Long Theme Name That Might Cause Issues',
        'Theme with Special Characters !@#$%^&*()',
        null,
        undefined,
      ];

      for (const theme of themes) {
        const result = await generator.getUncoveredOutcomes({
          userId: 1,
          theme: theme as any,
        });
        expect(result).toEqual([]);
      }
    });

    it('should handle various limit values', async () => {
      const limits = [1, 5, 10, 50, 100, 0, -1];

      for (const limit of limits) {
        const result = await generator.getUncoveredOutcomes({
          userId: 1,
          limit,
        });
        expect(result).toEqual([]);
      }
    });

    it('should return correct structure type', async () => {
      const result = await generator.getUncoveredOutcomes({ userId: 1 });

      expect(Array.isArray(result)).toBe(true);

      // If there were results, they would have this structure:
      // Each item should have:
      // - outcome: { id, expectationCode, expectation, strand }
      // - suggestion?: { id, title, description, duration, materials, learningGoals, subject, grade } | null
    });
  });

  describe('convertToActivity', () => {
    it('should convert suggestion to activity successfully', async () => {
      const suggestionId = 'suggestion-123';
      const userId = 456;
      const params = { customParam: 'value' };

      const result = await generator.convertToActivity(suggestionId, userId, params);

      expect(result).toEqual({
        id: suggestionId,
        success: true,
      });
    });

    it('should handle different suggestion IDs', async () => {
      const suggestionIds = [
        'suggestion-1',
        'long-suggestion-id-with-many-characters',
        '',
        '123',
        'suggestion-with-special-chars-!@#',
      ];

      for (const suggestionId of suggestionIds) {
        const result = await generator.convertToActivity(suggestionId, 1, {});
        expect(result.id).toBe(suggestionId);
        expect(result.success).toBe(true);
      }
    });

    it('should handle different user IDs', async () => {
      const userIds = [1, 0, -1, 999999];

      for (const userId of userIds) {
        const result = await generator.convertToActivity('test-id', userId, {});
        expect(result).toEqual({
          id: 'test-id',
          success: true,
        });
      }
    });

    it('should handle various parameter objects', async () => {
      const parameterSets = [
        {},
        { simple: 'value' },
        { nested: { object: 'value' } },
        { array: [1, 2, 3] },
        { multiple: 'params', number: 42, boolean: true },
        null,
        undefined,
      ];

      for (const params of parameterSets) {
        const result = await generator.convertToActivity('test-id', 1, params as any);
        expect(result.success).toBe(true);
      }
    });

    it('should return consistent structure', async () => {
      const result = await generator.convertToActivity('test', 1, {});

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('success');
      expect(typeof result.id).toBe('string');
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow simulation', async () => {
      // Step 1: Get uncovered outcomes
      const outcomes = await generator.getUncoveredOutcomes({
        userId: 123,
        theme: 'Mathematics',
        limit: 5,
      });
      expect(outcomes).toEqual([]);

      // Step 2: Generate activity
      const activity = await generator.generateActivity({
        userId: 123,
        subject: 'Mathematics',
        grade: 4,
        theme: 'Number Sense',
        duration: 45,
      });
      expect(activity.id).toBeDefined();

      // Step 3: Convert suggestion to activity
      const conversion = await generator.convertToActivity(activity.id, 123, {
        activityType: 'hands-on',
        materials: ['manipulatives', 'worksheets'],
      });
      expect(conversion.success).toBe(true);
    });

    it('should handle concurrent operations', async () => {
      const promises = [
        generator.generateActivity({ grade: 1, subject: 'Math' }),
        generator.generateActivity({ grade: 2, subject: 'Science' }),
        generator.getUncoveredOutcomes({ userId: 1 }),
        generator.convertToActivity('test-1', 1, {}),
        generator.convertToActivity('test-2', 2, {}),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(results[0]).toMatchObject({ grade: 1, subject: 'Math' });
      expect(results[1]).toMatchObject({ grade: 2, subject: 'Science' });
      expect(results[2]).toEqual([]);
      expect(results[3]).toEqual({ id: 'test-1', success: true });
      expect(results[4]).toEqual({ id: 'test-2', success: true });
    });

    it('should maintain state independence between instances', async () => {
      const generator1 = new AIActivityGenerator();
      const generator2 = new AIActivityGenerator();

      const activity1 = await generator1.generateActivity({ subject: 'Math' });
      const activity2 = await generator2.generateActivity({ subject: 'Science' });

      expect(activity1.subject).toBe('Math');
      expect(activity2.subject).toBe('Science');
      expect(activity1.id).not.toBe(activity2.id);
    });
  });

  describe('error handling', () => {
    it('should handle malformed input gracefully', async () => {
      const malformedInputs = [
        { grade: 'not-a-number' },
        { userId: 'string-instead-of-number' },
        { duration: 'invalid' },
        { subject: { nested: 'object' } },
      ];

      for (const input of malformedInputs) {
        const result = await generator.generateActivity(input as any);
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
      }
    });

    it('should not throw errors for any input combination', async () => {
      const extremeInputs = [
        { grade: Infinity },
        { grade: -Infinity },
        { grade: NaN },
        { userId: Number.MAX_SAFE_INTEGER },
        { subject: 'x'.repeat(10000) },
        { theme: null },
        { duration: -100 },
      ];

      for (const input of extremeInputs) {
        await expect(generator.generateActivity(input as any)).resolves.toBeDefined();
      }
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', async () => {
      const { aiActivityGenerator } = await import('../../src/services/aiActivityGenerator');

      expect(aiActivityGenerator).toBeInstanceOf(AIActivityGenerator);

      // Test that it works the same as a new instance
      const result = await aiActivityGenerator.generateActivity({ grade: 5 });
      expect(result.grade).toBe(5);
    });
  });
});
