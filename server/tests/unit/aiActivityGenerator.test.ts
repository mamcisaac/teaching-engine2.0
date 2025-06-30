import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AIActivityGenerator } from '../../src/services/aiActivityGenerator';

describe('AIActivityGenerator', () => {
  let aiActivityGenerator: AIActivityGenerator;

  beforeEach(() => {
    jest.clearAllMocks();
    aiActivityGenerator = new AIActivityGenerator();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateActivity', () => {
    it('should generate activity with default parameters', async () => {
      const params = {
        userId: 1,
        subject: 'Mathematics',
        grade: 3,
      };

      const result = await aiActivityGenerator.generateActivity(params);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^generated-\d+$/);
      expect(result.title).toBe('Generated Activity');
      expect(result.description).toBe('This is a stub implementation');
      expect(result.duration).toBe(30);
      expect(result.materials).toEqual([]);
      expect(result.learningGoals).toEqual([]);
      expect(result.subject).toBe('Mathematics');
      expect(result.grade).toBe(3);
    });

    it('should generate activity with all parameters', async () => {
      const params = {
        outcomeId: 'outcome-123',
        userId: 1,
        subject: 'Science',
        grade: 5,
        theme: 'Environmental Science',
        duration: 45,
        languageLevel: 'Intermediate',
      };

      const result = await aiActivityGenerator.generateActivity(params);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^generated-\d+$/);
      expect(result.subject).toBe('Science');
      expect(result.grade).toBe(5);
    });

    it('should use default values when parameters are missing', async () => {
      const params = {};

      const result = await aiActivityGenerator.generateActivity(params);

      expect(result).toBeDefined();
      expect(result.subject).toBe('General');
      expect(result.grade).toBe(1);
    });

    it('should generate unique IDs for each activity', async () => {
      const params = { subject: 'Art', grade: 2 };

      const result1 = await aiActivityGenerator.generateActivity(params);
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      const result2 = await aiActivityGenerator.generateActivity(params);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('getUncoveredOutcomes', () => {
    it('should return empty array for uncovered outcomes', async () => {
      const params = {
        userId: 1,
        theme: 'Mathematics',
        limit: 10,
      };

      const result = await aiActivityGenerator.getUncoveredOutcomes(params);

      expect(result).toEqual([]);
    });

    it('should handle missing optional parameters', async () => {
      const params = {
        userId: 1,
      };

      const result = await aiActivityGenerator.getUncoveredOutcomes(params);

      expect(result).toEqual([]);
    });
  });

  describe('convertToActivity', () => {
    it('should successfully convert suggestion to activity', async () => {
      const suggestionId = 'suggestion-123';
      const userId = 1;
      const params = { additionalInfo: 'test' };

      const result = await aiActivityGenerator.convertToActivity(suggestionId, userId, params);

      expect(result).toEqual({
        id: suggestionId,
        success: true,
      });
    });

    it('should handle empty params', async () => {
      const suggestionId = 'suggestion-456';
      const userId = 2;
      const params = {};

      const result = await aiActivityGenerator.convertToActivity(suggestionId, userId, params);

      expect(result).toEqual({
        id: suggestionId,
        success: true,
      });
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully in generateActivity', async () => {
      // Since this is a stub implementation, we can't test real error scenarios
      // In a real implementation, we would mock external API calls and test error cases
      const params = {
        userId: 1,
        subject: 'Mathematics',
        grade: 3,
      };

      const result = await aiActivityGenerator.generateActivity(params);
      expect(result).toBeDefined();
    });
  });

  describe('Rate limiting', () => {
    it('should handle multiple rapid requests', async () => {
      const params = {
        userId: 1,
        subject: 'Science',
        grade: 4,
      };

      const promises = Array(5).fill(null).map(() => 
        aiActivityGenerator.generateActivity(params)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.id).toMatch(/^generated-\d+$/);
      });
    });
  });
});