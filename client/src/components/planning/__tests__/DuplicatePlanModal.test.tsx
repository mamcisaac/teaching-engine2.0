import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DuplicatePlanModal } from '../DuplicatePlanModal';
import { api } from '../../../api';

// Mock API
vi.mock('../../../api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('DuplicatePlanModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = (props: Partial<Parameters<typeof DuplicatePlanModal>[0]> = {}) => {
    return renderWithQueryClient(
      <DuplicatePlanModal
        isOpen={true}
        onClose={mockOnClose}
        {...props}
      />
    );
  };

  describe('Initial State', () => {
    it('should display modal header and description', () => {
      renderModal();
      
      expect(screen.getByText('Duplicate Plan')).toBeInTheDocument();
      expect(screen.getByText('Create a copy of an existing plan to save time')).toBeInTheDocument();
    });

    it('should show plan type selector when no planType is provided', () => {
      renderModal();
      
      expect(screen.getByLabelText('Plan Type')).toBeInTheDocument();
      expect(screen.getByText('Select plan type')).toBeInTheDocument();
    });

    it('should not show plan type selector when planType is provided', () => {
      renderModal({ planType: 'lesson' });
      
      expect(screen.queryByLabelText('Plan Type')).not.toBeInTheDocument();
    });

    it('should show plan selector when type is selected but no planId', () => {
      renderModal({ planType: 'unit' });
      
      expect(screen.getByLabelText('Select Plan to Duplicate')).toBeInTheDocument();
    });

    it('should show plan title when provided', () => {
      renderModal({ 
        planType: 'lesson',
        planId: '123',
        planTitle: 'Introduction to Algebra'
      });
      
      expect(screen.getByText('Duplicating:')).toBeInTheDocument();
      expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should allow selecting plan type', async () => {
      renderModal();
      
      const select = screen.getByText('Select plan type');
      fireEvent.click(select);
      
      const unitOption = screen.getByText('Unit Plan');
      fireEvent.click(unitOption);
      
      expect(screen.getByLabelText('Select Plan to Duplicate')).toBeInTheDocument();
    });

    it('should show available plans for selected type', async () => {
      renderModal({ planType: 'unit' });
      
      const select = screen.getByText('Choose a plan');
      fireEvent.click(select);
      
      expect(screen.getByText('Fractions and Decimals')).toBeInTheDocument();
      expect(screen.getByText('Forces and Motion')).toBeInTheDocument();
    });

    it('should allow entering new title', async () => {
      renderModal({ planType: 'lesson', planId: '1' });
      
      const titleInput = screen.getByLabelText('New Plan Title');
      await userEvent.type(titleInput, 'My New Lesson Plan');
      
      expect(titleInput).toHaveValue('My New Lesson Plan');
    });

    it('should show placeholder based on original title', () => {
      renderModal({ 
        planType: 'lesson',
        planId: '1',
        planTitle: 'Original Lesson'
      });
      
      const titleInput = screen.getByLabelText('New Plan Title');
      expect(titleInput).toHaveAttribute('placeholder', 'Copy of Original Lesson');
    });

    it('should allow entering notes', async () => {
      renderModal({ planType: 'lesson', planId: '1' });
      
      const notesInput = screen.getByLabelText('Notes (Optional)');
      await userEvent.type(notesInput, 'This is a duplicate for next semester');
      
      expect(notesInput).toHaveValue('This is a duplicate for next semester');
    });

    it('should show sub-items checkbox for long-range and unit plans', () => {
      renderModal({ planType: 'long-range' });
      
      expect(screen.getByLabelText(/Include all units from the original plan/)).toBeInTheDocument();
    });

    it('should not show sub-items checkbox for lesson plans', () => {
      renderModal({ planType: 'lesson' });
      
      expect(screen.queryByLabelText(/Include all/)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should disable submit button when form is incomplete', () => {
      renderModal();
      
      const submitButton = screen.getByText('Duplicate Plan');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is complete', async () => {
      renderModal({ planType: 'lesson', planId: '1' });
      
      const titleInput = screen.getByLabelText('New Plan Title');
      await userEvent.type(titleInput, 'New Title');
      
      const submitButton = screen.getByText('Duplicate Plan');
      expect(submitButton).toBeEnabled();
    });

    it('should submit with correct data', async () => {
      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: 'new-123' } });
      
      renderModal({ planType: 'unit', planId: '1' });
      
      const titleInput = screen.getByLabelText('New Plan Title');
      await userEvent.type(titleInput, 'New Unit Plan');
      
      const notesInput = screen.getByLabelText('Notes (Optional)');
      await userEvent.type(notesInput, 'Test notes');
      
      const submitButton = screen.getByText('Duplicate Plan');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/unit-plans/duplicate', {
          sourceId: '1',
          title: 'New Unit Plan',
          notes: 'Test notes',
          includeSubItems: true,
        });
      });
    });

    it('should show loading state during submission', async () => {
      let resolvePost: any;
      (api.post as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 
        new Promise(resolve => { resolvePost = resolve; })
      );
      
      renderModal({ planType: 'lesson', planId: '1' });
      
      const titleInput = screen.getByLabelText('New Plan Title');
      await userEvent.type(titleInput, 'New Title');
      
      const submitButton = screen.getByText('Duplicate Plan');
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Duplicating...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      resolvePost({ data: { id: 'new-123' } });
    });

    it('should close modal and redirect on success', async () => {
      const originalLocation = window.location;
      delete (window as any).location;
      (window as any).location = { ...originalLocation, href: '' };
      
      (api.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { id: 'new-123' } });
      
      renderModal({ planType: 'lesson', planId: '1' });
      
      const titleInput = screen.getByLabelText('New Plan Title');
      await userEvent.type(titleInput, 'New Title');
      
      const submitButton = screen.getByText('Duplicate Plan');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
        expect(window.location.href).toBe('/planner/etfo-lessons/new-123');
      });
      
      (window as any).location = originalLocation;
    });
  });

  describe('Cancel Action', () => {
    it('should close modal when cancel is clicked', () => {
      renderModal();
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Plan Type Icons', () => {
    it('should show correct icon for each plan type', async () => {
      renderModal();
      
      const select = screen.getByText('Select plan type');
      fireEvent.click(select);
      
      // Check that plan type options have icons
      expect(screen.getByText('Long-Range Plan')).toBeInTheDocument();
      expect(screen.getByText('Unit Plan')).toBeInTheDocument();
      expect(screen.getByText('Lesson Plan')).toBeInTheDocument();
    });
  });

  describe('Information Panel', () => {
    it('should display what gets copied information', () => {
      renderModal();
      
      expect(screen.getByText('What gets copied:')).toBeInTheDocument();
      expect(screen.getByText('• All content and structure')).toBeInTheDocument();
      expect(screen.getByText('• Learning goals and expectations')).toBeInTheDocument();
      expect(screen.getByText('• Resources and materials')).toBeInTheDocument();
      expect(screen.getByText('• Dates will be adjusted to current period')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined planType gracefully', () => {
      renderModal({ planType: undefined });
      
      expect(screen.getByText('Select plan type')).toBeInTheDocument();
    });

    it('should handle undefined planId gracefully', () => {
      renderModal({ planType: 'lesson', planId: undefined });
      
      expect(screen.getByText('Choose a plan')).toBeInTheDocument();
    });

    it('should handle undefined planTitle gracefully', () => {
      renderModal({ 
        planType: 'lesson',
        planId: '1',
        planTitle: undefined
      });
      
      expect(screen.queryByText('Duplicating:')).not.toBeInTheDocument();
      expect(screen.getByLabelText('New Plan Title')).toHaveAttribute('placeholder', 'Enter new title');
    });
  });
});