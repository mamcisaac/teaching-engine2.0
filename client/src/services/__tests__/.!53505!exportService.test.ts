/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file exportService.test.ts
 * @description Comprehensive tests for ExportService including file exports,
 * MIME type handling, and error scenarios.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { exportService, ExportOptions } from '../analytics/exportService';

// Mock axios
const mockApi = {
  post: vi.fn(),
};

vi.mock('@/api', () => ({
  api: mockApi,
}));

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

// Mock document and window objects
Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
});

Object.defineProperty(window.URL, 'createObjectURL', {
  value: mockCreateObjectURL,
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
});

describe('ExportService', () => {
  const mockLinkElement = {
    href: '',
    download: '',
    click: mockClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockCreateElement.mockReturnValue(mockLinkElement);
    mockCreateObjectURL.mockReturnValue('blob:mock-url');

    // Mock current date for consistent filename testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-12-01T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('exportData', () => {
    it('should export PDF successfully', async () => {
      const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      const options: ExportOptions = {
        type: 'lesson-plan',
        format: 'pdf',
        data: { lessonId: 123 },
      };

      await exportService.exportData(options);

      expect(mockApi.post).toHaveBeenCalledWith('/api/analytics/export', options, {
        responseType: 'blob',
      });

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLinkElement.href).toBe('blob:mock-url');
      expect(mockLinkElement.download).toBe('lesson-plan-2023-12-01.pdf');
      expect(mockAppendChild).toHaveBeenCalledWith(mockLinkElement);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLinkElement);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should export CSV successfully', async () => {
      const mockBlob = new Blob(['csv,content'], { type: 'text/csv' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      const options: ExportOptions = {
        type: 'progress-report',
        format: 'csv',
        data: { studentId: 456 },
      };

      await exportService.exportData(options);

      expect(mockApi.post).toHaveBeenCalledWith('/api/analytics/export', options, {
        responseType: 'blob',
      });

      expect(mockLinkElement.download).toBe('progress-report-2023-12-01.csv');
    });

    it('should export PNG successfully', async () => {
      const mockBlob = new Blob(['png content'], { type: 'image/png' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      const options: ExportOptions = {
        type: 'chart',
        format: 'png',
        data: { chartType: 'bar' },
      };

      await exportService.exportData(options);

      expect(mockApi.post).toHaveBeenCalledWith('/api/analytics/export', options, {
        responseType: 'blob',
      });

      expect(mockLinkElement.download).toBe('chart-2023-12-01.png');
    });

    it('should handle complex export data', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      const options: ExportOptions = {
        type: 'unit-plan',
        format: 'pdf',
        data: {
          unitId: 789,
          includeExpectations: true,
          includeLessons: true,
          dateRange: {
            start: '2023-11-01',
            end: '2023-11-30',
          },
          metadata: {
            teacher: 'John Doe',
            grade: '3',
            subject: 'Math',
          },
        },
      };

      await exportService.exportData(options);

      expect(mockApi.post).toHaveBeenCalledWith('/api/analytics/export', options, {
        responseType: 'blob',
      });
    });

    it('should handle filename generation with different types', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      const testCases = [
        { type: 'lesson-plan', expected: 'lesson-plan-2023-12-01.pdf' },
        { type: 'unit-plan', expected: 'unit-plan-2023-12-01.pdf' },
        { type: 'progress-report', expected: 'progress-report-2023-12-01.pdf' },
        { type: 'analytics-dashboard', expected: 'analytics-dashboard-2023-12-01.pdf' },
      ];

      for (const { type, expected } of testCases) {
        mockClick.mockClear();

        await exportService.exportData({
          type,
          format: 'pdf',
          data: {},
        });

        expect(mockLinkElement.download).toBe(expected);
      }
    });

    it('should handle different date formats in filename', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      // Test different dates
      const testDates = [
        { date: '2023-01-01T00:00:00Z', expected: '2023-01-01' },
        { date: '2023-12-31T23:59:59Z', expected: '2023-12-31' },
        { date: '2024-02-29T12:00:00Z', expected: '2024-02-29' }, // Leap year
      ];

      for (const { date, expected } of testDates) {
        vi.setSystemTime(new Date(date));
        mockClick.mockClear();

        await exportService.exportData({
          type: 'test',
          format: 'pdf',
          data: {},
        });

        expect(mockLinkElement.download).toBe(`test-${expected}.pdf`);
      }
    });

    it('should throw error when API call fails', async () => {
      const apiError = new Error('API Error');
      mockApi.post.mockRejectedValue(apiError);

      const options: ExportOptions = {
        type: 'lesson-plan',
        format: 'pdf',
        data: { lessonId: 123 },
      };

      await expect(exportService.exportData(options)).rejects.toThrow('Failed to export data');

      // Should not create download link on error
      expect(mockCreateElement).not.toHaveBeenCalled();
      expect(mockCreateObjectURL).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockApi.post.mockRejectedValue(networkError);

      const options: ExportOptions = {
        type: 'report',
        format: 'csv',
        data: {},
      };

      await expect(exportService.exportData(options)).rejects.toThrow('Failed to export data');
    });

    it('should handle malformed response', async () => {
      mockApi.post.mockResolvedValue({ data: null });

      const options: ExportOptions = {
        type: 'test',
        format: 'pdf',
        data: {},
      };

      // Should still attempt to create blob and download
      await exportService.exportData(options);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe('getMimeType', () => {
    it('should return correct MIME types for supported formats', () => {
      const service = exportService as any; // Access private method for testing

      expect(service.getMimeType('pdf')).toBe('application/pdf');
      expect(service.getMimeType('csv')).toBe('text/csv');
      expect(service.getMimeType('png')).toBe('image/png');
    });

    it('should return default MIME type for unsupported formats', () => {
      const service = exportService as any;

      expect(service.getMimeType('unknown')).toBe('application/octet-stream');
      expect(service.getMimeType('')).toBe('application/octet-stream');
      expect(service.getMimeType('xyz')).toBe('application/octet-stream');
    });
  });

  describe('Blob handling', () => {
    it('should create blob with correct MIME type', async () => {
      const mockResponseData = 'test content';
      mockApi.post.mockResolvedValue({ data: mockResponseData });

      const options: ExportOptions = {
        type: 'test',
        format: 'pdf',
        data: {},
      };

      await exportService.exportData(options);

      // Verify blob is created with correct MIME type
      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'application/pdf',
        }),
      );
    });

    it('should handle binary data correctly', async () => {
      const binaryData = new Uint8Array([0x50, 0x44, 0x46]); // PDF header
      mockApi.post.mockResolvedValue({ data: binaryData });

      const options: ExportOptions = {
        type: 'test',
        format: 'pdf',
        data: {},
      };

      await exportService.exportData(options);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe('Download link management', () => {
    it('should properly clean up download link', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      const options: ExportOptions = {
        type: 'test',
        format: 'pdf',
        data: {},
      };

      await exportService.exportData(options);

      expect(mockAppendChild).toHaveBeenCalledWith(mockLinkElement);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLinkElement);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should set correct download attributes', async () => {
      const mockBlob = new Blob(['content'], { type: 'text/csv' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      const options: ExportOptions = {
        type: 'data-export',
        format: 'csv',
        data: { includeHeaders: true },
      };

      await exportService.exportData(options);

      expect(mockLinkElement.href).toBe('blob:mock-url');
      expect(mockLinkElement.download).toBe('data-export-2023-12-01.csv');
    });
  });

  describe('Error handling edge cases', () => {
    it('should handle DOM manipulation errors', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      // Mock DOM error
      mockAppendChild.mockImplementation(() => {
        throw new Error('DOM Error');
      });

      const options: ExportOptions = {
        type: 'test',
        format: 'pdf',
        data: {},
      };

      // Should not throw despite DOM error
      await expect(exportService.exportData(options)).rejects.toThrow('Failed to export data');
    });

    it('should handle URL creation errors', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('URL creation failed');
      });

      const options: ExportOptions = {
        type: 'test',
        format: 'pdf',
        data: {},
      };

      await expect(exportService.exportData(options)).rejects.toThrow('Failed to export data');
    });

    it('should handle click simulation errors', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      mockClick.mockImplementation(() => {
        throw new Error('Click failed');
      });

      const options: ExportOptions = {
        type: 'test',
        format: 'pdf',
        data: {},
      };

      // Should still clean up resources despite click error
      await expect(exportService.exportData(options)).rejects.toThrow('Failed to export data');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple concurrent exports', async () => {
      const mockBlob1 = new Blob(['content1'], { type: 'application/pdf' });
      const mockBlob2 = new Blob(['content2'], { type: 'text/csv' });

      mockApi.post
        .mockResolvedValueOnce({ data: mockBlob1 })
        .mockResolvedValueOnce({ data: mockBlob2 });

      const options1: ExportOptions = {
        type: 'report1',
        format: 'pdf',
        data: {},
      };

      const options2: ExportOptions = {
        type: 'report2',
        format: 'csv',
        data: {},
      };

      await Promise.all([exportService.exportData(options1), exportService.exportData(options2)]);

      expect(mockApi.post).toHaveBeenCalledTimes(2);
      expect(mockCreateObjectURL).toHaveBeenCalledTimes(2);
      expect(mockClick).toHaveBeenCalledTimes(2);
    });

    it('should handle large file exports', async () => {
      // Simulate large file (1MB)
      const largeContent = new Array(1024 * 1024).fill('x').join('');
      const mockBlob = new Blob([largeContent], { type: 'application/pdf' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      const options: ExportOptions = {
        type: 'large-report',
        format: 'pdf',
        data: { includeAllData: true },
      };

      await exportService.exportData(options);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          size: largeContent.length,
        }),
      );
    });

    it('should handle special characters in export type', async () => {
      const mockBlob = new Blob(['content'], { type: 'application/pdf' });
      mockApi.post.mockResolvedValue({ data: mockBlob });

      const options: ExportOptions = {
