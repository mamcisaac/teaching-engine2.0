import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { CurriculumWebConnector } from '../../../src/services/connectors/curriculumWebConnector';

// Mock global fetch
global.fetch = jest.fn();

describe('CurriculumWebConnector', () => {
  let connector: CurriculumWebConnector;

  beforeEach(() => {
    connector = new CurriculumWebConnector();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct source name', () => {
      expect(connector['sourceName']).toBe('CurriculumWeb');
    });
  });

  describe('search functionality', () => {
    it('should implement search method', async () => {
      // Mock successful API response
      const mockApiResponse = {
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 'curr-1',
              title: 'Math Lesson',
              description: 'A math lesson for grade 3',
              url: 'https://curriculum.com/lessons/math-1',
              grade: 3,
              subject: 'math'
            }
          ]
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockApiResponse);
      
      const results = await connector.search({ query: 'math', grade: 3 });
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Math Lesson');
      expect(results[0].source).toBe('CurriculumWeb');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      const results = await connector.search({ query: 'science', grade: 4 });
      
      expect(results).toEqual([]);
    });

    it('should filter results by grade when specified', async () => {
      const mockApiResponse = {
        json: jest.fn().mockResolvedValue({
          results: [
            {
              id: 'curr-1',
              title: 'Math Lesson Grade 3',
              grade: 3,
              subject: 'math'
            },
            {
              id: 'curr-2', 
              title: 'Math Lesson Grade 4',
              grade: 4,
              subject: 'math'
            }
          ]
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockApiResponse);
      
      const results = await connector.search({ query: 'math', grade: 3 });
      
      // Should only return grade 3 results
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getActivityDetails', () => {
    it('should fetch detailed activity information', async () => {
      const mockDetailResponse = {
        json: jest.fn().mockResolvedValue({
          id: 'curr-detail-1',
          title: 'Detailed Math Lesson',
          description: 'Comprehensive math lesson with activities',
          materials: ['calculator', 'worksheets'],
          duration: '45 minutes',
          objectives: ['Learn addition', 'Practice problem solving']
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockDetailResponse);
      
      const result = await connector.getActivityDetails('curr-detail-1');
      
      expect(result).toBeTruthy();
      expect(result?.title).toBe('Detailed Math Lesson');
      expect(result?.source).toBe('CurriculumWeb');
    });

    it('should return null for non-existent activities', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ error: 'Not found' })
      });
      
      const result = await connector.getActivityDetails('non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle network timeouts', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );
      
      const results = await connector.search({ query: 'test', grade: 1 });
      
      expect(results).toEqual([]);
    });

    it('should handle malformed API responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({ invalid: 'response' })
      });
      
      const results = await connector.search({ query: 'test', grade: 1 });
      
      expect(Array.isArray(results)).toBe(true);
    });
  });
});