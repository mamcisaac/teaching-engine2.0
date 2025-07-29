/**
 * Client Logger Integration Tests
 * 
 * Tests the real client logger functionality without mocks
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import { JSDOM } from 'jsdom';
import { performance } from 'perf_hooks';

// We'll dynamically import the logger to ensure clean state
let ClientLogger: any;
let logger: any;

describe('Client Logger Functionality', () => {
  let dom: JSDOM;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let performanceMarkSpy: jest.SpyInstance;
  let performanceMeasureSpy: jest.SpyInstance;

  beforeAll(async () => {
    // Setup DOM environment
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost:3000',
      pretendToBeVisual: true,
      resources: 'usable'
    });
    
    // Setup globals
    global.window = dom.window as any;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.performance = dom.window.performance;
    
    // Mock import.meta.env for Vite
    (global as any).import = {
      meta: {
        env: {
          DEV: true,
          MODE: 'test',
          VITE_ENABLE_LOGGING: 'true'
        }
      }
    };
    
    // Dynamically import logger
    const loggerModule = await import('../../client/src/utils/logger');
    ClientLogger = loggerModule.ClientLogger;
    logger = loggerModule.logger;
  });

  beforeEach(() => {
    // Setup console spies
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Setup performance spies
    performanceMarkSpy = jest.spyOn(global.performance, 'mark').mockImplementation();
    performanceMeasureSpy = jest.spyOn(global.performance, 'measure').mockImplementation();
    
    // Clear logger history
    logger.clearHistory();
  });

  afterEach(() => {
    // Restore all spies
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleLogSpy.mockRestore();
    performanceMarkSpy.mockRestore();
    performanceMeasureSpy.mockRestore();
  });

  describe('Log Level Methods', () => {
    it('should log errors with proper formatting', () => {
      const error = new Error('Test error');
      const additionalData = { userId: 123, action: 'test' };
      
      logger.error('Test error message', error, additionalData);
      
      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] Test error message',
        error,
        additionalData
      );
      
      // Verify history entry
      const history = logger.getHistory('error');
      expect(history).toHaveLength(1);
      expect(history[0].level).toBe('error');
      expect(history[0].message).toBe('Test error message');
      expect(history[0].data).toHaveProperty('error');
      expect(history[0].data).toHaveProperty('userId', 123);
    });

    it('should log warnings in development mode', () => {
      const data = { warningType: 'validation', field: 'email' };
      
      logger.warn('Validation warning', data);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Validation warning', data);
      
      const history = logger.getHistory('warn');
      expect(history).toHaveLength(1);
      expect(history[0].data).toEqual(data);
    });

    it('should log info messages in development mode', () => {
      logger.info('User logged in', { userId: 456 });
      
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] User logged in', { userId: 456 });
    });

    it('should log debug messages in development mode', () => {
      logger.debug('Debug information', { state: 'loading' });
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Debug information', { state: 'loading' });
    });

    it('should log trace messages in development mode', () => {
      logger.trace('Trace details', { step: 1 });
      
      expect(consoleLogSpy).toHaveBeenCalledWith('[TRACE] Trace details', { step: 1 });
    });
  });

  describe('Environment-Aware Logging', () => {
    it('should respect development mode settings', () => {
      // Already in dev mode from beforeAll
      logger.debug('Should appear in dev');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should add context information to all logs', () => {
      logger.info('Test message');
      
      const history = logger.getHistory();
      expect(history[0].context).toHaveProperty('userAgent');
      expect(history[0].context).toHaveProperty('url', 'http://localhost:3000/');
      expect(history[0].context).toHaveProperty('environment', 'test');
    });
  });

  describe('Performance Logging', () => {
    it('should track performance timing', () => {
      // Mock performance entries
      const mockEntry = { duration: 123.45 };
      jest.spyOn(global.performance, 'getEntriesByName').mockReturnValue([mockEntry as any]);
      
      logger.time('operation');
      expect(performanceMarkSpy).toHaveBeenCalledWith('logger-operation-start');
      
      logger.timeEnd('operation');
      expect(performanceMarkSpy).toHaveBeenCalledWith('logger-operation-end');
      expect(performanceMeasureSpy).toHaveBeenCalledWith(
        'logger-operation',
        'logger-operation-start',
        'logger-operation-end'
      );
      
      // Check debug log for duration
      const debugCalls = consoleLogSpy.mock.calls.filter(call => 
        call[0].includes('Performance: operation')
      );
      expect(debugCalls).toHaveLength(1);
    });

    it('should handle performance measurement errors gracefully', () => {
      // Make measure throw an error
      performanceMeasureSpy.mockImplementation(() => {
        throw new Error('Performance API error');
      });
      
      logger.time('failing-operation');
      logger.timeEnd('failing-operation');
      
      // Should log a warning instead of crashing
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to measure performance'),
        expect.any(Error)
      );
    });
  });

  describe('API Logging', () => {
    it('should log API requests and responses', () => {
      const request = { method: 'POST', url: '/api/users' };
      const requestData = { name: 'Test User' };
      const response = {
        status: 201,
        statusText: 'Created',
        data: { id: 789, name: 'Test User' }
      };
      
      logger.api('POST', '/api/users', requestData, response);
      
      const history = logger.getHistory('info');
      expect(history).toHaveLength(1);
      expect(history[0].message).toBe('API POST /api/users');
      expect(history[0].data).toHaveProperty('request', requestData);
      expect(history[0].data).toHaveProperty('response');
      expect(history[0].data.response).toMatchObject({
        status: 201,
        statusText: 'Created',
        data: response.data
      });
    });

    it('should handle non-standard response objects', () => {
      logger.api('GET', '/api/health', null, { healthy: true });
      
      const history = logger.getHistory('info');
      expect(history[0].data.response).toEqual({ healthy: true });
    });
  });

  describe('User Action Logging', () => {
    it('should log user actions with details', () => {
      logger.userAction('button_click', {
        buttonId: 'submit-form',
        formData: { email: 'test@example.com' }
      });
      
      const history = logger.getHistory('info');
      expect(history).toHaveLength(1);
      expect(history[0].message).toBe('User Action: button_click');
      expect(history[0].data).toEqual({
        buttonId: 'submit-form',
        formData: { email: 'test@example.com' }
      });
    });
  });

  describe('Log History Management', () => {
    it('should maintain log history', () => {
      logger.error('Error 1');
      logger.warn('Warning 1');
      logger.info('Info 1');
      logger.debug('Debug 1');
      
      const allHistory = logger.getHistory();
      expect(allHistory).toHaveLength(4);
      
      const errorHistory = logger.getHistory('error');
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0].message).toBe('Error 1');
    });

    it('should enforce max history size', () => {
      // Create a new logger instance with small history size
      const testLogger = new ClientLogger();
      (testLogger as any).maxHistorySize = 5;
      
      // Add more than max entries
      for (let i = 0; i < 10; i++) {
        testLogger.info(`Message ${i}`);
      }
      
      const history = testLogger.getHistory();
      expect(history).toHaveLength(5);
      expect(history[0].message).toBe('Message 5'); // Oldest should be removed
      expect(history[4].message).toBe('Message 9'); // Newest should be kept
    });

    it('should clear history', () => {
      logger.info('Test 1');
      logger.info('Test 2');
      
      expect(logger.getHistory()).toHaveLength(2);
      
      logger.clearHistory();
      
      expect(logger.getHistory()).toHaveLength(0);
    });
  });

  describe('Log Export and Download', () => {
    it('should export logs as JSON', () => {
      logger.error('Export test error', { code: 'E001' });
      logger.info('Export test info', { userId: 123 });
      
      const exported = logger.exportLogs();
      const parsed = JSON.parse(exported);
      
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].level).toBe('error');
      expect(parsed[0].message).toBe('Export test error');
      expect(parsed[1].level).toBe('info');
    });

    it('should trigger file download', () => {
      // Mock DOM methods
      const createElementSpy = jest.spyOn(document, 'createElement');
      const clickSpy = jest.fn();
      const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation();
      
      const mockAnchor = {
        href: '',
        download: '',
        click: clickSpy
      };
      
      createElementSpy.mockReturnValue(mockAnchor as any);
      
      logger.info('Download test');
      logger.downloadLogs();
      
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockAnchor.download).toMatch(/^teaching-engine-logs-.*\.json$/);
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
      
      createElementSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });

  describe('Error Reporting Integration', () => {
    it('should send errors to error reporter in production mode', () => {
      // Create a new logger instance with production settings
      const originalEnv = (global as any).import.meta.env;
      (global as any).import.meta.env = {
        DEV: false,
        MODE: 'production',
        VITE_ENABLE_LOGGING: 'false'
      };
      
      // Mock error reporter
      const mockErrorReporter = {
        report: jest.fn()
      };
      (global.window as any).errorReporter = mockErrorReporter;
      
      // Create new logger instance
      const prodLogger = new ClientLogger();
      
      // Log an error
      const error = new Error('Production error');
      prodLogger.error('Critical error occurred', error);
      
      // Verify error reporter was called
      expect(mockErrorReporter.report).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Critical error occurred',
          data: expect.objectContaining({
            error: error.stack
          })
        })
      );
      
      // Restore environment
      (global as any).import.meta.env = originalEnv;
      delete (global.window as any).errorReporter;
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle circular references in logged data', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      // Should not throw when logging circular references
      expect(() => {
        logger.info('Circular reference test', circularObj);
      }).not.toThrow();
    });

    it('should handle logging without data parameter', () => {
      logger.info('Simple message');
      logger.error('Simple error');
      logger.warn('Simple warning');
      
      const history = logger.getHistory();
      expect(history).toHaveLength(3);
      expect(history[0].data).toBeUndefined();
    });

    it('should handle invalid log levels in getHistory', () => {
      logger.info('Test');
      
      const invalidHistory = logger.getHistory('invalid' as any);
      expect(invalidHistory).toEqual([]);
    });
  });
});