import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { OERConnector } from '../../../src/services/connectors/oerConnector';

// Mock global fetch
global.fetch = jest.fn();

describe('OERConnector', () => {
  let connector: OERConnector;

  beforeEach(() => {
    connector = new OERConnector();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct source name', () => {
      expect(connector['sourceName']).toBe('OER');
    });
  });

  describe('search functionality', () => {
    it('should implement search method', async () => {
      const mockApiResponse = {
        json: jest.fn().mockResolvedValue({
          data: [
            {
              id: 'oer-1',
              title: 'Open Educational Resource',
              description: 'A free educational resource',
              url: 'https://oer.org/resource/1',
              subject: 'mathematics',
              grade: '3'
            }
          ]
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockApiResponse);
      
      const results = await connector.search({ query: 'math', grade: 3 });
      
      expect(results).toHaveLength(1);
      expect(results[0].source).toBe('OER');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const results = await connector.search({ query: 'test', grade: 1 });
      
      expect(results).toEqual([]);
    });
  });

  describe('getActivityDetails', () => {
    it('should fetch activity details', async () => {
      const mockDetailResponse = {
        json: jest.fn().mockResolvedValue({
          id: 'oer-detail-1',
          title: 'Detailed OER Resource',
          description: 'A comprehensive educational resource',
          content: 'Full resource content...',
          license: 'CC BY-SA',
          author: 'OER Author'
        })
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockDetailResponse);
      
      const result = await connector.getActivityDetails('oer-detail-1');
      
      expect(result).toBeTruthy();
      expect(result?.source).toBe('OER');
    });

    it('should return null for non-existent resources', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(null)
      });
      
      const result = await connector.getActivityDetails('non-existent');
      
      expect(result).toBeNull();
    });
  });
});