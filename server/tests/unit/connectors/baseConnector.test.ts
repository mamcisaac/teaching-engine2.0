import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { BaseConnector } from '../../../src/services/connectors/baseConnector';
import { SearchParams } from '../../../src/services/activityDiscoveryService';

// Mock global fetch
global.fetch = jest.fn();

// Create a concrete implementation of BaseConnector for testing
class TestConnector extends BaseConnector {
  constructor() {
    super('test');
  }

  async search(params: SearchParams) {
    return [
      this.transformToExternalActivity({
        externalId: 'test-1',
        title: 'Test Activity',
        description: 'A test activity',
      }, {
        externalId: 'test-1',
        url: 'https://test.com/activity/1',
        title: 'Test Activity',
        description: 'A test activity',
      }),
    ];
  }

  async getActivityDetails(externalId: string) {
    if (externalId === 'test-1') {
      return this.transformToExternalActivity({
        externalId: 'test-1',
        title: 'Test Activity Detailed',
        description: 'A detailed test activity',
      }, {
        externalId: 'test-1',
        url: 'https://test.com/activity/1',
        title: 'Test Activity Detailed',
        description: 'A detailed test activity',
      });
    }
    return null;
  }
}

describe('BaseConnector', () => {
  let connector: TestConnector;

  beforeEach(() => {
    connector = new TestConnector();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with correct source name', () => {
      expect(connector.sourceName).toBe('test');
    });

    it('should be able to create multiple instances', () => {
      const connector1 = new TestConnector();
      const connector2 = new TestConnector();
      
      expect(connector1).not.toBe(connector2);
      expect(connector1.sourceName).toBe('test');
      expect(connector2.sourceName).toBe('test');
    });
  });

  describe('transformToExternalActivity', () => {
    it('should transform activity data correctly', () => {
      const activityData = {
        externalId: 'test-activity',
        title: 'Test Activity',
        description: 'A test activity description',
      };

      const rawData = {
        externalId: 'test-activity',
        url: 'https://example.com/activity',
        title: 'Test Activity',
        description: 'A test activity description',
      };

      const result = connector.transformToExternalActivity(activityData, rawData);

      expect(result).toEqual({
        externalId: 'test-activity',
        source: 'test',
        title: 'Test Activity',
        description: 'A test activity description',
        url: 'https://example.com/activity',
        rawData,
      });
    });

    it('should handle missing optional fields', () => {
      const activityData = {
        externalId: 'test-activity',
        title: 'Test Activity',
      };

      const rawData = {
        externalId: 'test-activity',
        url: 'https://example.com/activity',
        title: 'Test Activity',
      };

      const result = connector.transformToExternalActivity(activityData, rawData);

      expect(result.externalId).toBe('test-activity');
      expect(result.title).toBe('Test Activity');
      expect(result.source).toBe('test');
      expect(result.url).toBe('https://example.com/activity');
    });
  });

  describe('fetchWithTimeout', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should make successful HTTP request', async () => {
      const mockResponse = { json: jest.fn().mockResolvedValue({ data: 'test' }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const promise = connector['fetchWithTimeout']('https://example.com', {}, 5000);
      const result = await promise;

      expect(global.fetch).toHaveBeenCalledWith('https://example.com', {});
      expect(result).toBe(mockResponse);
    });

    it('should timeout after specified duration', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      const promise = connector['fetchWithTimeout']('https://example.com', {}, 1000);
      
      // Fast-forward time to trigger timeout
      setTimeout(() => {
        jest.advanceTimersByTime(1000);
      }, 0);
      
      await expect(promise).rejects.toThrow('Request timeout');
    }, 2000);

    it('should use default timeout when not specified', async () => {
      const mockResponse = { json: jest.fn().mockResolvedValue({ data: 'test' }) };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await connector['fetchWithTimeout']('https://example.com', {});
      expect(result).toBe(mockResponse);
    });
  });

  describe('delay', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(global, 'setTimeout');
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should delay for specified milliseconds', async () => {
      const promise = connector['delay'](1000);
      
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
      
      jest.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    });

    it('should resolve immediately for zero delay', async () => {
      const promise = connector['delay'](0);
      
      jest.advanceTimersByTime(0);
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('search method', () => {
    it('should implement search method', async () => {
      const results = await connector.search({ query: 'test', grade: 1 });
      
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        externalId: 'test-1',
        source: 'test',
        title: 'Test Activity',
        description: 'A test activity',
        url: 'https://test.com/activity/1',
        rawData: {
          externalId: 'test-1',
          url: 'https://test.com/activity/1',
          title: 'Test Activity',
          description: 'A test activity',
        },
      });
    });
  });

  describe('getActivityDetails method', () => {
    it('should get activity details by external ID', async () => {
      const result = await connector.getActivityDetails('test-1');
      
      expect(result).toEqual({
        externalId: 'test-1',
        source: 'test',
        title: 'Test Activity Detailed',
        description: 'A detailed test activity', 
        url: 'https://test.com/activity/1',
        rawData: {
          externalId: 'test-1',
          url: 'https://test.com/activity/1',
          title: 'Test Activity Detailed',
          description: 'A detailed test activity',
        },
      });
    });

    it('should return null for non-existent activity', async () => {
      const result = await connector.getActivityDetails('non-existent');
      expect(result).toBeNull();
    });
  });
});