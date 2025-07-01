import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { OERConnector } from '../../../src/services/connectors/oerConnector';

// Mock global fetch
global.fetch = jest.fn();

describe('OERConnector', () => {
  let connector: OERConnector;
  const originalEnv = process.env;

  beforeEach(() => {
    // Set up test environment with API key
    process.env = { ...originalEnv, OER_API_KEY: 'test-api-key' };
    connector = new OERConnector();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  describe('initialization', () => {
    it('should initialize with correct source name', () => {
      expect(connector['sourceName']).toBe('oer');
    });
  });

  describe('search functionality', () => {
    it('should implement search method', async () => {
      const mockApiResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          meta: {
            pagination: {
              count: 1,
              page: 1,
              per_page: 20,
            },
          },
          results: [
            {
              id: 1,
              title: 'Open Educational Resource',
              abstract: 'A free educational resource',
              url: 'https://oer.org/resource/1',
              subjects: ['mathematics'],
              grade_levels: ['grade_3'],
              material_types: ['worksheet'],
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockApiResponse);

      const results = await connector.search({ query: 'math', grade: 3 });

      expect(results).toHaveLength(1);
      expect(results[0].source).toBe('oer');
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
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 123,
          title: 'Detailed OER Resource',
          abstract: 'A comprehensive educational resource',
          description: 'Full resource content...',
          license: 'CC BY-SA',
          authors: ['OER Author'],
          url: 'https://oer.org/resource/123',
          subjects: ['science'],
          grade_levels: ['grade_4', 'grade_5'],
          material_types: ['interactive'],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockDetailResponse);

      const result = await connector.getActivityDetails('oer-detail-1');

      expect(result).toBeTruthy();
      expect(result?.source).toBe('oer');
    });

    it('should return null for non-existent resources', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      const result = await connector.getActivityDetails('non-existent');

      expect(result).toBeNull();
    });
  });
});
