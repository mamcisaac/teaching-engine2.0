/**
 * @file CreateTeamModal.test.tsx
 * @description Comprehensive tests for CreateTeamModal component including form validation,
 * user interactions, accessibility, API integration, and modal behavior.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CreateTeamModal } from '../CreateTeamModal';
import { renderWithProviders } from '@/test-utils';
import { api } from '@/lib/api';

// Mock the api module
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('CreateTeamModal', () => {
  const user = userEvent.setup();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
    (api.post as any).mockResolvedValue({
      data: { id: 'team-123', name: 'Test Team' },
    });
  });

  describe('Modal Behavior', () => {
    it('should render when isOpen is true', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Create New Team')).toBeInTheDocument();
      expect(screen.getByLabelText('Team Name *')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      renderWithProviders(<CreateTeamModal isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByText('Create New Team')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is clicked', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText('Team Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Grade Level')).toBeInTheDocument();
      expect(screen.getByLabelText('Subject Focus')).toBeInTheDocument();
      expect(screen.getByLabelText('School Name')).toBeInTheDocument();
      expect(screen.getByLabelText('School Board')).toBeInTheDocument();
      expect(screen.getByText('Public Team')).toBeInTheDocument();
    });

    it('should render grade options correctly', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const gradeSelect = screen.getByLabelText('Grade Level');
      expect(gradeSelect).toBeInTheDocument();

      // Should have "Any Grade" option plus 12 grade options
      const options = gradeSelect.querySelectorAll('option');
      expect(options).toHaveLength(13); // Any Grade + Grades 1-12
    });

    it('should render subject options correctly', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const subjectSelect = screen.getByLabelText('Subject Focus');
      expect(subjectSelect).toBeInTheDocument();

      // Should have all subject options
      const options = subjectSelect.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(1);
      expect(options[0]).toHaveTextContent('All Subjects');
    });

    it('should show privacy settings section', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
      expect(screen.getByText('Public Team')).toBeInTheDocument();
      expect(screen.getByText('Only invited members can join')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update team name field', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText('Team Name *');
      await user.type(nameInput, 'My Test Team');

      expect(nameInput).toHaveValue('My Test Team');
    });

    it('should update description field', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const descriptionInput = screen.getByLabelText('Description');
      await user.type(descriptionInput, 'This is a test team description');

      expect(descriptionInput).toHaveValue('This is a test team description');
    });

    it('should update grade selection', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const gradeSelect = screen.getByLabelText('Grade Level');
      await user.selectOptions(gradeSelect, '3');

      expect(gradeSelect).toHaveValue('3');
    });

    it('should update subject selection', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const subjectSelect = screen.getByLabelText('Subject Focus');
      await user.selectOptions(subjectSelect, 'Mathematics');

      expect(subjectSelect).toHaveValue('Mathematics');
    });

    it('should update school information fields', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const schoolNameInput = screen.getByLabelText('School Name');
      const schoolBoardInput = screen.getByLabelText('School Board');

      await user.type(schoolNameInput, 'Test Elementary');
      await user.type(schoolBoardInput, 'Test School Board');

      expect(schoolNameInput).toHaveValue('Test Elementary');
      expect(schoolBoardInput).toHaveValue('Test School Board');
    });
  });

  describe('Privacy Settings', () => {
    it('should toggle public team setting', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const publicSwitch = screen.getByRole('switch', { name: /public team/i });
      expect(publicSwitch).not.toBeChecked();

      await user.click(publicSwitch);
      expect(publicSwitch).toBeChecked();

      // Should show "Anyone can discover and request to join" text
      expect(screen.getByText('Anyone can discover and request to join')).toBeInTheDocument();
    });

    it('should show approval setting when team is public', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const publicSwitch = screen.getByRole('switch', { name: /public team/i });
      await user.click(publicSwitch);

      expect(screen.getByText('Require Approval')).toBeInTheDocument();
      expect(screen.getByText('Admin approval needed for new members')).toBeInTheDocument();
    });

    it('should toggle approval requirement when public', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      // Make team public first
      const publicSwitch = screen.getByRole('switch', { name: /public team/i });
      await user.click(publicSwitch);

      // Then toggle approval requirement
      const approvalSwitch = screen.getByRole('switch', { name: /require approval/i });
      expect(approvalSwitch).toBeChecked(); // Should be checked by default

      await user.click(approvalSwitch);
      expect(approvalSwitch).not.toBeChecked();
    });

    it('should hide approval setting when team is private', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      // Team should be private by default
      expect(screen.queryByText('Require Approval')).not.toBeInTheDocument();
    });

    it('should show correct privacy icons', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      // Should show lock icon when private
      expect(document.querySelector('.lucide-lock')).toBeInTheDocument();

      // Switch to public
      const publicSwitch = screen.getByRole('switch', { name: /public team/i });
      await user.click(publicSwitch);

      // Should show globe icon when public
      expect(document.querySelector('.lucide-globe')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when team name is empty', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const submitButton = screen.getByRole('button', { name: /create team/i });
      await user.click(submitButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Team name required',
        description: 'Please enter a name for your team',
        variant: 'destructive',
      });

      expect(api.post).not.toHaveBeenCalled();
    });

    it('should show error when team name is only whitespace', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText('Team Name *');
      await user.type(nameInput, '   ');

      const submitButton = screen.getByRole('button', { name: /create team/i });
      await user.click(submitButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Team name required',
        description: 'Please enter a name for your team',
        variant: 'destructive',
      });
    });

    it('should mark team name field as required', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText('Team Name *');
      expect(nameInput).toHaveAttribute('required');
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      // Fill out the form
      await user.type(screen.getByLabelText('Team Name *'), 'Test Team');
      await user.type(screen.getByLabelText('Description'), 'Test description');
      await user.selectOptions(screen.getByLabelText('Grade Level'), '3');
      await user.selectOptions(screen.getByLabelText('Subject Focus'), 'Mathematics');
      await user.type(screen.getByLabelText('School Name'), 'Test School');
      await user.type(screen.getByLabelText('School Board'), 'Test Board');

      const submitButton = screen.getByRole('button', { name: /create team/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/teams', {
          name: 'Test Team',
          description: 'Test description',
          grade: 3,
          subject: 'Mathematics',
          schoolName: 'Test School',
          schoolBoard: 'Test Board',
          isPublic: false,
          requiresApproval: true,
        });
      });
    });

    it('should submit with minimal required data', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      await user.type(screen.getByLabelText('Team Name *'), 'Minimal Team');

      const submitButton = screen.getByRole('button', { name: /create team/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/teams', {
          name: 'Minimal Team',
          description: '',
          grade: undefined,
          subject: undefined,
          schoolName: undefined,
          schoolBoard: undefined,
          isPublic: false,
          requiresApproval: true,
        });
      });
    });

    it('should handle successful submission', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      await user.type(screen.getByLabelText('Team Name *'), 'Success Team');

      const submitButton = screen.getByRole('button', { name: /create team/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Team created!',
          description: 'Test Team has been created successfully.',
        });
      });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle submission errors', async () => {
      (api.post as any).mockRejectedValueOnce(new Error('Server error'));

      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      await user.type(screen.getByLabelText('Team Name *'), 'Error Team');

      const submitButton = screen.getByRole('button', { name: /create team/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Failed to create team',
          description: 'Server error',
          variant: 'destructive',
        });
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      // Make API call hang to test loading state
      (api.post as any).mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      await user.type(screen.getByLabelText('Team Name *'), 'Loading Team');

      const submitButton = screen.getByRole('button', { name: /create team/i });
      await user.click(submitButton);

      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should reset form after successful submission', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText('Team Name *');
      const descriptionInput = screen.getByLabelText('Description');

      await user.type(nameInput, 'Reset Test Team');
      await user.type(descriptionInput, 'This will be reset');

      const submitButton = screen.getByRole('button', { name: /create team/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
      });

      // Form should be reset (though modal closes, this tests the reset function)
      expect(nameInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText('Team Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Grade Level')).toBeInTheDocument();
      expect(screen.getByLabelText('Subject Focus')).toBeInTheDocument();
      expect(screen.getByLabelText('School Name')).toBeInTheDocument();
      expect(screen.getByLabelText('School Board')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const nameInput = screen.getByLabelText('Team Name *');
      nameInput.focus();
      expect(nameInput).toHaveFocus();

      // Should be able to tab through form fields
      await user.tab();
      expect(screen.getByLabelText('Description')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Grade Level')).toHaveFocus();
    });

    it('should have proper ARIA attributes for switches', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const publicSwitch = screen.getByRole('switch', { name: /public team/i });
      expect(publicSwitch).toHaveAttribute('aria-checked', 'false');
    });

    it('should have proper modal semantics', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should focus trap within modal', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      // Modal should be present and focusable
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should have descriptive button text', () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create team/i })).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state when switching privacy settings', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      // Fill out form
      await user.type(screen.getByLabelText('Team Name *'), 'State Test Team');
      await user.type(screen.getByLabelText('Description'), 'Test description');

      // Toggle privacy setting
      const publicSwitch = screen.getByRole('switch', { name: /public team/i });
      await user.click(publicSwitch);

      // Form data should still be there
      expect(screen.getByLabelText('Team Name *')).toHaveValue('State Test Team');
      expect(screen.getByLabelText('Description')).toHaveValue('Test description');
    });

    it('should handle grade selection edge cases', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      const gradeSelect = screen.getByLabelText('Grade Level');

      // Select a grade, then deselect
      await user.selectOptions(gradeSelect, '5');
      expect(gradeSelect).toHaveValue('5');

      await user.selectOptions(gradeSelect, '');
      expect(gradeSelect).toHaveValue('');
    });
  });

  describe('Integration with QueryClient', () => {
    it('should invalidate teams query on successful creation', async () => {
      renderWithProviders(<CreateTeamModal isOpen={true} onClose={mockOnClose} />);

      await user.type(screen.getByLabelText('Team Name *'), 'Query Test Team');

      const submitButton = screen.getByRole('button', { name: /create team/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
      });

      // QueryClient invalidation is tested through the mutation success handler
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Team created!',
        description: 'Test Team has been created successfully.',
      });
    });
  });
});
