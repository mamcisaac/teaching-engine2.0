import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CurriculumImportWizard } from '../CurriculumImportWizard';

// Mock fetch
global.fetch = vi.fn();

// Mock toast
const mockToast = vi.fn();
vi.mock('../../ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock logger
vi.mock('../../../utils/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('CurriculumImportWizard', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <CurriculumImportWizard
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
  };

  describe('Upload Step', () => {
    it('should display upload interface initially', () => {
      renderComponent();
      
      expect(screen.getByText('Import Curriculum')).toBeInTheDocument();
      expect(screen.getByText(/Upload your curriculum document/)).toBeInTheDocument();
      expect(screen.getByText('Drop your file here or click to browse')).toBeInTheDocument();
    });

    it('should handle file upload', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ importId: 123 }),
      });

      renderComponent();
      
      const file = new File(['test content'], 'curriculum.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Drop your file here/);
      
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/curriculum/import/upload',
          expect.objectContaining({
            method: 'POST',
            headers: {
              Authorization: 'Bearer test-token',
            },
            body: expect.any(FormData),
          })
        );
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Upload Successful',
        description: 'Your curriculum document is being processed...',
      });
    });

    it('should handle upload failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      renderComponent();
      
      const file = new File(['test content'], 'curriculum.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Drop your file here/);
      
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Upload Failed',
          description: 'Upload failed',
          variant: 'destructive',
        });
      });
    });

    it('should show uploading state', async () => {
      let resolveUpload: any;
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 
        new Promise(resolve => { resolveUpload = resolve; })
      );

      renderComponent();
      
      const file = new File(['test content'], 'curriculum.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Drop your file here/);
      
      await userEvent.upload(input, file);

      expect(screen.getByText('Uploading document...')).toBeInTheDocument();

      resolveUpload({
        ok: true,
        json: async () => ({ importId: 123 }),
      });
    });

    it('should handle no file selected', async () => {
      renderComponent();
      
      const input = screen.getByLabelText(/Drop your file here/) as HTMLInputElement;
      
      // Simulate change event with no files
      fireEvent.change(input, { target: { files: [] } });

      // Should not call fetch
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Processing Step', () => {
    it('should show processing state and poll for status', async () => {
      // Mock upload response
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ importId: 123 }),
      });

      // Mock status check - first processing, then ready
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            status: 'PROCESSING',
            originalName: 'test.pdf'
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ 
            status: 'READY_FOR_REVIEW',
            parsedData: {
              subject: 'Mathematics',
              grade: 5,
              expectations: [
                { code: 'A1.1', description: 'Test expectation', strand: 'Algebra' }
              ]
            },
            originalName: 'test.pdf'
          }),
        });

      renderComponent();
      
      const file = new File(['test content'], 'curriculum.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Drop your file here/);
      
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('Processing Document')).toBeInTheDocument();
      });

      // Wait for polling to complete
      await waitFor(() => {
        expect(screen.getByText('Review Extracted Data')).toBeInTheDocument();
      }, { timeout: 15000 });
    });

    it('should handle processing failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ importId: 123 }),
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          status: 'FAILED',
          errorMessage: 'Processing failed',
          originalName: 'test.pdf'
        }),
      });

      renderComponent();
      
      const file = new File(['test content'], 'curriculum.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Drop your file here/);
      
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Processing Failed',
          description: 'Processing failed',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Review Step', () => {
    const setupReviewStep = async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ importId: 123 }),
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          status: 'READY_FOR_REVIEW',
          parsedData: {
            subject: 'Mathematics',
            grade: 5,
            expectations: [
              { code: 'A1.1', description: 'Test expectation 1', strand: 'Algebra' },
              { code: 'B1.1', description: 'Test expectation 2' }
            ]
          },
          originalName: 'test.pdf'
        }),
      });

      renderComponent();
      
      const file = new File(['test content'], 'curriculum.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Drop your file here/);
      
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('Review Extracted Data')).toBeInTheDocument();
      });
    };

    it('should display parsed data for review', async () => {
      await setupReviewStep();

      expect(screen.getByDisplayValue('Mathematics')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5')).toBeInTheDocument();
      expect(screen.getByText('Curriculum Expectations (2)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('A1.1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test expectation 1')).toBeInTheDocument();
    });

    it('should allow editing of subject and grade', async () => {
      await setupReviewStep();

      const subjectInput = screen.getByDisplayValue('Mathematics');
      const gradeInput = screen.getByDisplayValue('5');

      await userEvent.clear(subjectInput);
      await userEvent.type(subjectInput, 'Science');
      
      await userEvent.clear(gradeInput);
      await userEvent.type(gradeInput, '6');

      expect(screen.getByDisplayValue('Science')).toBeInTheDocument();
      expect(screen.getByDisplayValue('6')).toBeInTheDocument();
    });

    it('should allow editing of expectations', async () => {
      await setupReviewStep();

      const codeInput = screen.getByDisplayValue('A1.1');
      await userEvent.clear(codeInput);
      await userEvent.type(codeInput, 'A2.1');

      expect(screen.getByDisplayValue('A2.1')).toBeInTheDocument();
    });

    it('should handle optional strand field', async () => {
      await setupReviewStep();

      // Find the input with empty strand (second expectation)
      const strandInputs = screen.getAllByPlaceholderText('Optional');
      expect(strandInputs[0]).toHaveValue(''); // B1.1 has no strand

      await userEvent.type(strandInputs[0], 'Geometry');
      expect(strandInputs[0]).toHaveValue('Geometry');
    });
  });

  describe('Confirmation Step', () => {
    it('should confirm import and show success', async () => {
      // Setup through review step
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ importId: 123 }),
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          status: 'READY_FOR_REVIEW',
          parsedData: {
            subject: 'Mathematics',
            grade: 5,
            expectations: [
              { code: 'A1.1', description: 'Test expectation', strand: 'Algebra' }
            ]
          },
          originalName: 'test.pdf'
        }),
      });

      // Mock confirm response
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ expectationsCount: 1 }),
      });

      renderComponent();
      
      const file = new File(['test content'], 'curriculum.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Drop your file here/);
      
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('Review Extracted Data')).toBeInTheDocument();
      });

      const importButton = screen.getByText('Import 1 Expectations');
      await userEvent.click(importButton);

      await waitFor(() => {
        expect(screen.getByText('Import Successful!')).toBeInTheDocument();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Import Successful',
        description: 'Successfully imported 1 curriculum expectations',
      });

      // Should call onSuccess after timeout
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should disable import button when data is invalid', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ importId: 123 }),
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          status: 'READY_FOR_REVIEW',
          parsedData: {
            subject: '',
            grade: 5,
            expectations: []
          },
          originalName: 'test.pdf'
        }),
      });

      renderComponent();
      
      const file = new File(['test content'], 'curriculum.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Drop your file here/);
      
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('Review Extracted Data')).toBeInTheDocument();
      });

      const importButton = screen.getByText('Import 0 Expectations');
      expect(importButton).toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('should close wizard when close button is clicked', () => {
      renderComponent();
      
      const closeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should navigate back to upload from review', async () => {
      // Setup to review step
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ importId: 123 }),
      });

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          status: 'READY_FOR_REVIEW',
          parsedData: {
            subject: 'Mathematics',
            grade: 5,
            expectations: [{ code: 'A1.1', description: 'Test', strand: 'Algebra' }]
          },
          originalName: 'test.pdf'
        }),
      });

      renderComponent();
      
      const file = new File(['test content'], 'curriculum.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Drop your file here/);
      
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('Review Extracted Data')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Upload');
      await userEvent.click(backButton);

      expect(screen.getByText('Import Curriculum')).toBeInTheDocument();
    });
  });

  describe('Progress Indicator', () => {
    it('should show correct progress for each step', async () => {
      renderComponent();
      
      // Initially on upload step
      const steps = screen.getAllByText(/^\d$/);
      expect(steps[0]).toHaveClass('bg-blue-600');
      
      // Upload a file to move to processing
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ importId: 123 }),
      });

      const file = new File(['test content'], 'curriculum.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Drop your file here/);
      
      await userEvent.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('Processing Document')).toBeInTheDocument();
      });
    });
  });
});