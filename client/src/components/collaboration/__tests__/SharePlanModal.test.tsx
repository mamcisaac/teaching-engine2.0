/**
 * @file SharePlanModal.test.tsx
 * @description Comprehensive tests for SharePlanModal component including sharing methods,
 * permissions, export features, accessibility, and API integration.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SharePlanModal } from '../SharePlanModal';
import { renderWithProviders } from '@/test-utils';
import { api } from '@/lib/api';

// Mock the api module
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://example.com',
  },
  writable: true,
});

// Mock data
const mockTeams = [
  {
    id: 'team-1',
    name: 'Grade 3 Math Team',
    _count: { members: 5 },
  },
  {
    id: 'team-2',
    name: 'French Immersion Teachers',
    _count: { members: 8 },
  },
];

describe('SharePlanModal', () => {
  const user = userEvent.setup();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    planType: 'lesson' as const,
    planId: 'lesson-123',
    planTitle: 'Test Lesson Plan',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();

    // Mock successful API responses
    (api.get as any).mockResolvedValue({ data: mockTeams });
    (api.post as any).mockResolvedValue({
      data: { shareCode: 'abc123', id: 'share-123' },
    });
  });

  describe('Modal Behavior', () => {
    it('should render when isOpen is true', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      expect(screen.getByText('Test Lesson Plan')).toBeInTheDocument();
      expect(screen.getByText('Share & Collaborate')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Test Lesson Plan')).not.toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when cancel button is clicked', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tab Navigation', () => {
    it('should render both share and export tabs', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      expect(screen.getByText('Share & Collaborate')).toBeInTheDocument();
      expect(screen.getByText('Export & Print')).toBeInTheDocument();
    });

    it('should switch between tabs', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      // Should start on share tab
      expect(screen.getByText('Share via')).toBeInTheDocument();

      // Switch to export tab
      const exportTab = screen.getByText('Export & Print');
      await user.click(exportTab);

      expect(screen.getByText('Export your lesson plan in various formats')).toBeInTheDocument();
    });
  });

  describe('Share Methods', () => {
    it('should render all share method options', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Team')).toBeInTheDocument();
      expect(screen.getByText('Link')).toBeInTheDocument();
    });

    it('should switch between share methods', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      // Should start with email method
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();

      // Switch to team method
      const teamButton = screen.getByText('Team');
      await user.click(teamButton);

      expect(screen.getByLabelText('Select team')).toBeInTheDocument();

      // Switch to link method
      const linkButton = screen.getByText('Link');
      await user.click(linkButton);

      expect(screen.getByLabelText('Link expires in')).toBeInTheDocument();
    });

    it('should highlight selected share method', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const emailButton = screen.getByText('Email').closest('button');
      const teamButton = screen.getByText('Team').closest('button');

      // Email should be selected by default
      expect(emailButton).toHaveClass('border-blue-500', 'bg-blue-50');
      expect(teamButton).not.toHaveClass('border-blue-500');

      // Click team button
      await user.click(teamButton!);

      expect(teamButton).toHaveClass('border-blue-500', 'bg-blue-50');
      expect(emailButton).not.toHaveClass('border-blue-500');
    });
  });

  describe('Email Sharing', () => {
    it('should show email input field when email method is selected', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('colleague@school.edu')).toBeInTheDocument();
    });

    it('should update email input value', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email address');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should validate email before sharing', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const shareButton = screen.getByRole('button', { name: 'Share' });
      await user.click(shareButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Email required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });

      expect(api.post).not.toHaveBeenCalled();
    });

    it('should share via email with valid data', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email address');
      await user.type(emailInput, 'colleague@example.com');

      const shareButton = screen.getByRole('button', { name: 'Share' });
      await user.click(shareButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/sharing/plans', {
          planType: 'lesson',
          planId: 'lesson-123',
          permissions: {
            canEdit: false,
            canCopy: true,
            canComment: true,
            canReshare: false,
          },
          shareWith: {
            type: 'user',
            email: 'colleague@example.com',
          },
        });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Plan shared successfully!',
        description: 'The plan has been shared with colleague@example.com',
      });
    });
  });

  describe('Team Sharing', () => {
    it('should load teams when modal opens', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/teams');
      });
    });

    it('should show team selection when team method is selected', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const teamButton = screen.getByText('Team');
      await user.click(teamButton);

      expect(screen.getByLabelText('Select team')).toBeInTheDocument();
    });

    it('should populate team options', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const teamButton = screen.getByText('Team');
      await user.click(teamButton);

      await waitFor(() => {
        expect(screen.getByText('Grade 3 Math Team (5 members)')).toBeInTheDocument();
        expect(screen.getByText('French Immersion Teachers (8 members)')).toBeInTheDocument();
      });
    });

    it('should show message when no teams available', async () => {
      (api.get as any).mockResolvedValue({ data: [] });

      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const teamButton = screen.getByText('Team');
      await user.click(teamButton);

      await waitFor(() => {
        expect(screen.getByText("You're not part of any teams yet.")).toBeInTheDocument();
        expect(screen.getByText('Create or join a team')).toBeInTheDocument();
      });
    });

    it('should validate team selection before sharing', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const teamButton = screen.getByText('Team');
      await user.click(teamButton);

      const shareButton = screen.getByRole('button', { name: 'Share' });
      await user.click(shareButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Team required',
        description: 'Please select a team',
        variant: 'destructive',
      });
    });

    it('should share with team when valid team is selected', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const teamButton = screen.getByText('Team');
      await user.click(teamButton);

      await waitFor(() => {
        expect(screen.getByText('Grade 3 Math Team (5 members)')).toBeInTheDocument();
      });

      const teamSelect = screen.getByLabelText('Select team');
      await user.selectOptions(teamSelect, 'team-1');

      const shareButton = screen.getByRole('button', { name: 'Share' });
      await user.click(shareButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/sharing/plans', {
          planType: 'lesson',
          planId: 'lesson-123',
          permissions: {
            canEdit: false,
            canCopy: true,
            canComment: true,
            canReshare: false,
          },
          shareWith: {
            type: 'team',
            teamId: 'team-1',
          },
        });
      });
    });
  });

  describe('Link Sharing', () => {
    it('should show link options when link method is selected', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const linkButton = screen.getByText('Link');
      await user.click(linkButton);

      expect(screen.getByLabelText('Link expires in')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Link' })).toBeInTheDocument();
    });

    it('should show expiry options', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const linkButton = screen.getByText('Link');
      await user.click(linkButton);

      const expirySelect = screen.getByLabelText('Link expires in');
      const options = expirySelect.querySelectorAll('option');

      expect(options).toHaveLength(5);
      expect(options[0]).toHaveTextContent('1 day');
      expect(options[1]).toHaveTextContent('7 days');
      expect(options[4]).toHaveTextContent('1 year');
    });

    it('should create and copy share link', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const linkButton = screen.getByText('Link');
      await user.click(linkButton);

      const createLinkButton = screen.getByRole('button', { name: 'Create Link' });
      await user.click(createLinkButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/sharing/plans', {
          planType: 'lesson',
          planId: 'lesson-123',
          permissions: {
            canEdit: false,
            canCopy: true,
            canComment: true,
            canReshare: false,
          },
          shareWith: {
            type: 'link',
            expiresInDays: 7,
          },
        });
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://example.com/shared/abc123',
      );

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Share link created!',
        description: 'The link has been copied to your clipboard.',
      });
    });

    it('should show copied state after creating link', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const linkButton = screen.getByText('Link');
      await user.click(linkButton);

      const createLinkButton = screen.getByRole('button', { name: 'Create Link' });
      await user.click(createLinkButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('should hide edit and reshare permissions for link sharing', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      // Check permissions are visible for email method
      expect(screen.getByText('Can edit')).toBeInTheDocument();
      expect(screen.getByText('Can reshare')).toBeInTheDocument();

      // Switch to link method
      const linkButton = screen.getByText('Link');
      await user.click(linkButton);

      // Edit and reshare permissions should be hidden
      expect(screen.queryByText('Can edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Can reshare')).not.toBeInTheDocument();

      // But copy and comment should still be visible
      expect(screen.getByText('Can make a copy')).toBeInTheDocument();
      expect(screen.getByText('Can comment')).toBeInTheDocument();
    });
  });

  describe('Permissions', () => {
    it('should render all permission switches', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      expect(screen.getByText('Can make a copy')).toBeInTheDocument();
      expect(screen.getByText('Can comment')).toBeInTheDocument();
      expect(screen.getByText('Can edit')).toBeInTheDocument();
      expect(screen.getByText('Can reshare')).toBeInTheDocument();
    });

    it('should have correct default permission states', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const copySwitch = screen.getByRole('switch', { name: /can make a copy/i });
      const commentSwitch = screen.getByRole('switch', { name: /can comment/i });
      const editSwitch = screen.getByRole('switch', { name: /can edit/i });
      const reshareSwitch = screen.getByRole('switch', { name: /can reshare/i });

      expect(copySwitch).toBeChecked();
      expect(commentSwitch).toBeChecked();
      expect(editSwitch).not.toBeChecked();
      expect(reshareSwitch).not.toBeChecked();
    });

    it('should toggle permission switches', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const editSwitch = screen.getByRole('switch', { name: /can edit/i });
      expect(editSwitch).not.toBeChecked();

      await user.click(editSwitch);
      expect(editSwitch).toBeChecked();

      await user.click(editSwitch);
      expect(editSwitch).not.toBeChecked();
    });

    it('should include permissions in share request', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      // Toggle some permissions
      const editSwitch = screen.getByRole('switch', { name: /can edit/i });
      const copySwitch = screen.getByRole('switch', { name: /can make a copy/i });

      await user.click(editSwitch);
      await user.click(copySwitch);

      // Enter email and share
      const emailInput = screen.getByLabelText('Email address');
      await user.type(emailInput, 'test@example.com');

      const shareButton = screen.getByRole('button', { name: 'Share' });
      await user.click(shareButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/sharing/plans', {
          planType: 'lesson',
          planId: 'lesson-123',
          permissions: {
            canEdit: true,
            canCopy: false,
            canComment: true,
            canReshare: false,
          },
          shareWith: {
            type: 'user',
            email: 'test@example.com',
          },
        });
      });
    });
  });

  describe('Optional Message', () => {
    it('should render message textarea', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      expect(screen.getByLabelText('Add a message (optional)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Hey! I thought you might find/)).toBeInTheDocument();
    });

    it('should update message value', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const messageInput = screen.getByLabelText('Add a message (optional)');
      await user.type(messageInput, 'This is a test message');

      expect(messageInput).toHaveValue('This is a test message');
    });

    it('should include message in share request', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const messageInput = screen.getByLabelText('Add a message (optional)');
      await user.type(messageInput, 'Check out this lesson plan!');

      const emailInput = screen.getByLabelText('Email address');
      await user.type(emailInput, 'test@example.com');

      const shareButton = screen.getByRole('button', { name: 'Share' });
      await user.click(shareButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/api/sharing/plans',
          expect.objectContaining({
            message: 'Check out this lesson plan!',
          }),
        );
      });
    });

    it('should not include empty message in request', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email address');
      await user.type(emailInput, 'test@example.com');

      const shareButton = screen.getByRole('button', { name: 'Share' });
      await user.click(shareButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/api/sharing/plans',
          expect.objectContaining({
            message: undefined,
          }),
        );
      });
    });
  });

  describe('Export Tab', () => {
    it('should render export options', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const exportTab = screen.getByText('Export & Print');
      await user.click(exportTab);

      expect(screen.getByText('Export as PDF')).toBeInTheDocument();
      expect(screen.getByText('Export as Word Document')).toBeInTheDocument();
      expect(screen.getByText('Print Plan')).toBeInTheDocument();
    });

    it('should show export option descriptions', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const exportTab = screen.getByText('Export & Print');
      await user.click(exportTab);

      expect(screen.getByText('Best for printing')).toBeInTheDocument();
      expect(screen.getByText('For editing')).toBeInTheDocument();
      expect(screen.getByText('Direct to printer')).toBeInTheDocument();
    });

    it('should show export options checkboxes', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const exportTab = screen.getByText('Export & Print');
      await user.click(exportTab);

      expect(screen.getByText('Include curriculum expectations')).toBeInTheDocument();
      expect(screen.getByText('Include materials list')).toBeInTheDocument();
      expect(screen.getByText('Include assessment notes')).toBeInTheDocument();
    });

    it('should show placeholder messages for export features', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const exportTab = screen.getByText('Export & Print');
      await user.click(exportTab);

      const pdfButton = screen.getByText('Export as PDF');
      await user.click(pdfButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export to PDF',
        description: 'This feature will be available soon.',
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during sharing', async () => {
      (api.post as any).mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email address');
      await user.type(emailInput, 'test@example.com');

      const shareButton = screen.getByRole('button', { name: 'Share' });
      await user.click(shareButton);

      expect(screen.getByText('Sharing...')).toBeInTheDocument();
      expect(shareButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should handle sharing errors', async () => {
      (api.post as any).mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email address');
      await user.type(emailInput, 'test@example.com');

      const shareButton = screen.getByRole('button', { name: 'Share' });
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Sharing failed',
          description: 'Network error',
          variant: 'destructive',
        });
      });
    });

    it('should handle unknown errors', async () => {
      (api.post as any).mockRejectedValueOnce('Unknown error');

      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email address');
      await user.type(emailInput, 'test@example.com');

      const shareButton = screen.getByRole('button', { name: 'Share' });
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Sharing failed',
          description: 'Failed to share the plan',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Add a message (optional)')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const emailInput = screen.getByLabelText('Email address');
      emailInput.focus();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Add a message (optional)')).toHaveFocus();
    });

    it('should have proper ARIA attributes for switches', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const copySwitch = screen.getByRole('switch', { name: /can make a copy/i });
      expect(copySwitch).toHaveAttribute('aria-checked', 'true');
    });

    it('should have proper modal semantics', () => {
      renderWithProviders(<SharePlanModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Different Plan Types', () => {
    it('should work with different plan types', async () => {
      const planTypes = ['long-range', 'unit', 'lesson', 'daybook'] as const;

      for (const planType of planTypes) {
        const { unmount } = renderWithProviders(
          <SharePlanModal {...defaultProps} planType={planType} planId={`${planType}-123`} />,
        );

        const emailInput = screen.getByLabelText('Email address');
        await user.type(emailInput, 'test@example.com');

        const shareButton = screen.getByRole('button', { name: 'Share' });
        await user.click(shareButton);

        await waitFor(() => {
          expect(api.post).toHaveBeenCalledWith(
            '/api/sharing/plans',
            expect.objectContaining({
              planType,
              planId: `${planType}-123`,
            }),
          );
        });

        unmount();
        vi.clearAllMocks();
      }
    });
  });
});
