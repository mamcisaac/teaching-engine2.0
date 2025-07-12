import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DownloadPrintablesButton from '../DownloadPrintablesButton';
import { planningApi } from '../../api/domains/planning';

// Mock the planning API
jest.mock('../../api/domains/planning', () => ({
  planningApi: {
    downloadPrintables: jest.fn(),
  },
}));

// Mock URL methods
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe('DownloadPrintablesButton', () => {
  const mockBlob = new Blob(['test content'], { type: 'application/zip' });
  const mockUrl = 'blob:mock-url';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue(mockUrl);
    (planningApi.downloadPrintables as jest.Mock).mockResolvedValue(mockBlob);
  });

  describe('strict boolean expressions', () => {
    it('should handle async function properly without implicit boolean checks', async () => {
      render(<DownloadPrintablesButton weekStart="2024-01-01" />);
      
      const button = screen.getByText('Download Printables');
      
      // Create a spy on document.createElement to track the anchor element
      const createElementSpy = jest.spyOn(document, 'createElement');
      const mockClick = jest.fn();
      
      // Mock the anchor element
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
      };
      createElementSpy.mockReturnValue(mockAnchor as any);
      
      // Click the button
      fireEvent.click(button);
      
      // Wait for async operations
      await waitFor(() => {
        expect(planningApi.downloadPrintables).toHaveBeenCalledWith('2024-01-01');
        expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
        expect(mockAnchor.href).toBe(mockUrl);
        expect(mockAnchor.download).toBe('printables.zip');
        expect(mockClick).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockUrl);
      });
      
      createElementSpy.mockRestore();
    });

    it('should handle weekStart prop correctly', () => {
      const { rerender } = render(<DownloadPrintablesButton weekStart="2024-01-01" />);
      
      const button = screen.getByText('Download Printables');
      expect(button).toBeInTheDocument();
      
      // Test with different weekStart value
      rerender(<DownloadPrintablesButton weekStart="2024-02-01" />);
      expect(button).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      // Mock API to reject
      const mockError = new Error('Download failed');
      (planningApi.downloadPrintables as jest.Mock).mockRejectedValue(mockError);
      
      // Spy on console.error to suppress error output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<DownloadPrintablesButton weekStart="2024-01-01" />);
      
      const button = screen.getByText('Download Printables');
      
      // Click should not throw
      expect(() => fireEvent.click(button)).not.toThrow();
      
      // Wait for the promise to reject
      await waitFor(() => {
        expect(planningApi.downloadPrintables).toHaveBeenCalled();
      });
      
      // Cleanup should not have been called due to error
      expect(mockRevokeObjectURL).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('component behavior', () => {
    it('should render download button', () => {
      render(<DownloadPrintablesButton weekStart="2024-01-01" />);
      
      expect(screen.getByText('Download Printables')).toBeInTheDocument();
    });

    it('should trigger download on click', async () => {
      render(<DownloadPrintablesButton weekStart="2024-01-01" />);
      
      const button = screen.getByText('Download Printables');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(planningApi.downloadPrintables).toHaveBeenCalledWith('2024-01-01');
      });
    });

    it('should clean up object URL after download', async () => {
      render(<DownloadPrintablesButton weekStart="2024-01-01" />);
      
      const button = screen.getByText('Download Printables');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockUrl);
      });
    });
  });
});