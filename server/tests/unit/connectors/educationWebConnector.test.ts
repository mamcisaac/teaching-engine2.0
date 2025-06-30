import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { EducationWebConnector } from '../../../src/services/connectors/educationWebConnector';

// Mock global fetch
global.fetch = jest.fn();

describe('EducationWebConnector', () => {
  let connector: EducationWebConnector;

  beforeEach(() => {
    connector = new EducationWebConnector();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct source name', () => {
      expect(connector['sourceName']).toBe('EducationWeb');
    });
  });

  describe('search functionality', () => {
    it('should implement search method', async () => {
      const mockApiResponse = {
        json: jest.fn().mockResolvedValue({
          activities: [
            {
              id: 'edu-1',
              name: 'Science Experiment',
              description: 'A hands-on science experiment',
              link: 'https://education.com/activities/science-1',
              grade_level: '4',
              subject_area: 'science'
            }
          ]
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockApiResponse);
      
      const results = await connector.search({ query: 'science', grade: 4 });
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Science Experiment');
      expect(results[0].source).toBe('EducationWeb');
    });

    it('should handle empty search results', async () => {
      const mockApiResponse = {
        json: jest.fn().mockResolvedValue({ activities: [] })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockApiResponse);
      
      const results = await connector.search({ query: 'nonexistent', grade: 1 });
      
      expect(results).toEqual([]);
    });

    it('should transform search results correctly', async () => {
      const mockActivity = {
        id: 'edu-transform-test',
        name: 'Reading Comprehension',
        description: 'A reading activity for elementary students',
        link: 'https://education.com/reading/1',
        grade_level: '2',
        subject_area: 'language-arts',
        duration: '30 minutes',
        materials: ['books', 'worksheets']
      };

      const mockApiResponse = {
        json: jest.fn().mockResolvedValue({
          activities: [mockActivity]
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockApiResponse);
      
      const results = await connector.search({ query: 'reading', grade: 2 });
      
      expect(results[0]).toMatchObject({
        externalId: 'edu-transform-test',
        title: 'Reading Comprehension',
        description: 'A reading activity for elementary students',
        url: 'https://education.com/reading/1',
        source: 'EducationWeb'
      });
    });
  });

  describe('getActivityDetails', () => {
    it('should fetch and return detailed activity information', async () => {
      const mockDetailResponse = {
        json: jest.fn().mockResolvedValue({
          id: 'edu-detail-1',
          name: 'Advanced Science Lab',
          description: 'Comprehensive science laboratory activity',
          instructions: 'Step-by-step lab instructions...',
          materials: ['microscope', 'slides', 'specimens'],
          duration: '60 minutes',
          standards: ['NGSS.K-2-ETS1-1', 'NGSS.K-2-ETS1-2']
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockDetailResponse);
      
      const result = await connector.getActivityDetails('edu-detail-1');
      
      expect(result).toBeTruthy();
      expect(result?.title).toBe('Advanced Science Lab');
      expect(result?.source).toBe('EducationWeb');
    });

    it('should handle missing activity details', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(null)
      });
      
      const result = await connector.getActivityDetails('missing-activity');
      
      expect(result).toBeNull();
    });
  });

  describe('API integration', () => {
    it('should construct correct API URLs', async () => {
      const mockApiResponse = {
        json: jest.fn().mockResolvedValue({ activities: [] })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockApiResponse);
      
      await connector.search({ query: 'test query', grade: 3, subject: 'math' });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test query'),
        expect.any(Object)
      );
    });

    it('should include proper headers in requests', async () => {
      const mockApiResponse = {
        json: jest.fn().mockResolvedValue({ activities: [] })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockApiResponse);
      
      await connector.search({ query: 'test', grade: 1 });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('error resilience', () => {
    it('should handle API rate limiting', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 429,
        json: jest.fn().mockResolvedValue({ error: 'Rate limited' })
      });
      
      const results = await connector.search({ query: 'test', grade: 1 });
      
      expect(results).toEqual([]);
    });

    it('should handle server errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('Server error'))
      });
      
      const results = await connector.search({ query: 'test', grade: 1 });
      
      expect(results).toEqual([]);
    });
  });
});