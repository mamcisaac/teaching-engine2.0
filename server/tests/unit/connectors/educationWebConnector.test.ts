import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { EducationWebConnector } from '../../../src/services/connectors/educationWebConnector';

// Mock global fetch before importing the connector
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('EducationWebConnector', () => {
  let connector: EducationWebConnector;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
    connector = new EducationWebConnector();
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
    jest.setTimeout(30000); // Increase timeout to 30s

    beforeEach(() => {
      // Ensure fetch is properly mocked
      jest.clearAllMocks();
    });

    it('should implement search method', async () => {
      const mockHtmlResponse = `
        <div class="search-results-list">
          <div class="result">
            <div class="result-title">
              <a href="/activities/science-1">Science Experiment</a>
            </div>
            <div class="result-description">A hands-on science experiment</div>
            <img src="/images/science.jpg" />
          </div>
        </div>
      `;

      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtmlResponse),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const results = await connector.search({ query: 'science', grade: 4 });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Science Experiment');
      expect(results[0].source).toBe('EducationWeb');
      expect(results[0].url).toContain('activities/science-1');
    });

    it('should handle empty search results', async () => {
      const mockHtmlResponse = `<div class="search-results-list"></div>`;

      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtmlResponse),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const results = await connector.search({ query: 'nonexistent', grade: 1 });

      expect(results).toEqual([]);
    });

    it('should transform search results correctly', async () => {
      const mockHtmlResponse = `
        <div class="search-results-list">
          <div class="result">
            <div class="result-title">
              <a href="https://www.khanacademy.org/reading/1">Reading Comprehension</a>
            </div>
            <div class="result-description">A reading activity for grade 2 elementary students. Materials needed: books, worksheets</div>
          </div>
        </div>
      `;

      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtmlResponse),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const results = await connector.search({ query: 'reading', grade: 2 });

      expect(results[0]).toMatchObject({
        title: 'Reading Comprehension',
        description:
          'A reading activity for grade 2 elementary students. Materials needed: books, worksheets',
        url: 'https://www.khanacademy.org/reading/1',
        source: 'EducationWeb',
        gradeMin: 2,
        gradeMax: 2,
      });
    });
  });

  describe('getActivityDetails', () => {
    it('should return null as activity details are not implemented', async () => {
      // The current implementation returns null for all activity details
      const result = await connector.getActivityDetails('edu-detail-1');

      expect(result).toBeNull();
    });

    it('should handle missing activity details', async () => {
      const result = await connector.getActivityDetails('missing-activity');

      expect(result).toBeNull();
    });
  });

  describe('API integration', () => {
    jest.setTimeout(15000); // 15s timeout

    it('should construct correct API URLs', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('<div class="search-results-list"></div>'),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await connector.search({ query: 'test query', grade: 3, subject: 'math' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test%20query'),
        expect.any(Object),
      );
    });

    it('should include proper headers in requests', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('<div class="search-results-list"></div>'),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await connector.search({ query: 'test', grade: 1 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('Teaching Engine'),
          }),
        }),
      );
    });
  });

  describe('error resilience', () => {
    jest.setTimeout(15000); // 15s timeout

    it('should handle API rate limiting', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: jest.fn().mockRejectedValue(new Error('Rate limited')),
      });

      const results = await connector.search({ query: 'test', grade: 1 });

      expect(results).toEqual([]);
    });

    it('should handle server errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockRejectedValue(new Error('Server error')),
      });

      const results = await connector.search({ query: 'test', grade: 1 });

      expect(results).toEqual([]);
    });
  });
});
