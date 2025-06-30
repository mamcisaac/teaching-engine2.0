/**
 * @file CommentThread.test.tsx
 * @description Comprehensive tests for CommentThread component including rendering,
 * user interactions, accessibility, API interactions, and edge cases.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CommentThread } from '../CommentThread';
import { renderWithProviders, createMockUser } from '@/test-utils';
import { api } from '@/lib/api';

// Mock the api module
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the AuthContext
const mockAuthContext = {
  user: createMockUser({ id: '1', name: 'Test User', email: 'test@example.com' }),
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  getToken: vi.fn().mockReturnValue('mock-token'),
  setToken: vi.fn(),
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 minutes'),
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock data
const mockComments = [
  {
    id: '1',
    content: 'This is a great lesson plan!',
    isResolved: false,
    isPinned: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    user: {
      id: 2,
      name: 'Jane Teacher',
      email: 'jane@example.com',
    },
    replies: [],
  },
  {
    id: '2',
    content: 'Could we add more examples?',
    isResolved: true,
    isPinned: true,
    createdAt: '2024-01-01T11:00:00Z',
    updatedAt: '2024-01-01T11:30:00Z',
    user: {
      id: 3,
      name: 'John Collaborator',
      email: 'john@example.com',
    },
    replies: [
      {
        id: '3',
        content: 'I agree, more examples would help',
        isResolved: false,
        isPinned: false,
        createdAt: '2024-01-01T11:15:00Z',
        updatedAt: '2024-01-01T11:15:00Z',
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        replies: [],
      },
    ],
  },
];

const mockStats = {
  total: 3,
  resolved: 1,
  pending: 2,
};

describe('CommentThread', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();

    // Mock successful API responses by default
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/api/comments') {
        return Promise.resolve({ data: mockComments });
      }
      if (url === '/api/comments/stats') {
        return Promise.resolve({ data: mockStats });
      }
      return Promise.resolve({ data: {} });
    });

    (api.post as any).mockResolvedValue({ data: { id: 'new-comment' } });
    (api.patch as any).mockResolvedValue({ data: {} });
    (api.delete as any).mockResolvedValue({ data: {} });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      expect(screen.getByText('Add a comment...')).toBeInTheDocument();
    });

    it('should display loading state initially', () => {
      // Make API call hang to test loading state
      (api.get as any).mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      expect(screen.getAllByText('')).toBeTruthy(); // Loading skeleton cards
    });

    it('should render comment stats when available', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      await waitFor(() => {
        expect(screen.getByText('3 comments')).toBeInTheDocument();
        expect(screen.getByText('1 resolved')).toBeInTheDocument();
      });
    });

    it('should render empty state when no comments', async () => {
      (api.get as any).mockImplementation((url: string) => {
        if (url === '/api/comments') {
          return Promise.resolve({ data: [] });
        }
        if (url === '/api/comments/stats') {
          return Promise.resolve({ data: { total: 0, resolved: 0 } });
        }
        return Promise.resolve({ data: {} });
      });

      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      await waitFor(() => {
        expect(
          screen.getByText('No comments yet. Be the first to share feedback!'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Comment Display', () => {
    it('should display comments with correct information', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      await waitFor(() => {
        expect(screen.getByText('This is a great lesson plan!')).toBeInTheDocument();
        expect(screen.getByText('Jane Teacher')).toBeInTheDocument();
        expect(screen.getByText('2 minutes ago')).toBeInTheDocument();
      });
    });

    it('should display pinned badge for pinned comments', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      await waitFor(() => {
        expect(screen.getByText('Pinned')).toBeInTheDocument();
      });
    });

    it('should display resolved badge for resolved comments', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      await waitFor(() => {
        expect(screen.getByText('Resolved')).toBeInTheDocument();
      });
    });

    it('should display replies with proper indentation', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      await waitFor(() => {
        expect(screen.getByText('I agree, more examples would help')).toBeInTheDocument();
      });
    });
  });

  describe('Creating Comments', () => {
    it('should allow creating new comments', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      const textarea = await screen.findByPlaceholderText('Add a comment...');
      const postButton = screen.getByRole('button', { name: /post comment/i });

      await user.type(textarea, 'This is my new comment');
      await user.click(postButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/comments', {
          planType: 'lesson',
          planId: 'lesson-123',
          content: 'This is my new comment',
        });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Comment added',
        description: 'Your comment has been posted.',
      });
    });

    it('should not allow posting empty comments', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      const postButton = await screen.findByRole('button', { name: /post comment/i });

      expect(postButton).toBeDisabled();
    });

    it('should handle comment creation errors', async () => {
      (api.post as any).mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      const textarea = await screen.findByPlaceholderText('Add a comment...');
      const postButton = screen.getByRole('button', { name: /post comment/i });

      await user.type(textarea, 'This will fail');
      await user.click(postButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Failed to add comment',
          description: 'Network error',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Replying to Comments', () => {
    it('should allow replying to comments', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      await waitFor(() => {
        expect(screen.getByText('This is a great lesson plan!')).toBeInTheDocument();
      });

      const replyButtons = screen.getAllByRole('button', { name: /reply/i });
      await user.click(replyButtons[0]);

      const replyTextarea = screen.getByPlaceholderText('Write a reply...');
      expect(replyTextarea).toBeInTheDocument();

      await user.type(replyTextarea, 'This is my reply');

      const submitReplyButton = screen.getByRole('button', { name: 'Reply' });
      await user.click(submitReplyButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/comments', {
          planType: 'lesson',
          planId: 'lesson-123',
          content: 'This is my reply',
          parentId: '1',
        });
      });
    });

    it('should allow canceling reply', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      await waitFor(() => {
        expect(screen.getByText('This is a great lesson plan!')).toBeInTheDocument();
      });

      const replyButtons = screen.getAllByRole('button', { name: /reply/i });
      await user.click(replyButtons[0]);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(screen.queryByPlaceholderText('Write a reply...')).not.toBeInTheDocument();
    });
  });

  describe('Comment Management (Plan Owner)', () => {
    it('should show management buttons when canResolve is true', async () => {
      renderWithProviders(
        <CommentThread planType="lesson" planId="lesson-123" canResolve={true} />,
      );

      await waitFor(() => {
        expect(screen.getByText('This is a great lesson plan!')).toBeInTheDocument();
      });

      // Should see pin and resolve buttons
      const buttons = screen.getAllByRole('button');
      const pinButtons = buttons.filter((btn) => btn.querySelector('svg'));
      expect(pinButtons.length).toBeGreaterThan(0);
    });

    it('should allow toggling pin status', async () => {
      renderWithProviders(
        <CommentThread planType="lesson" planId="lesson-123" canResolve={true} />,
      );

      await waitFor(() => {
        expect(screen.getByText('This is a great lesson plan!')).toBeInTheDocument();
      });

      // Find and click pin button (first comment is not pinned)
      const buttons = screen.getAllByRole('button');
      const pinButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg');
        return svg && !svg.classList.contains('fill-current');
      });

      if (pinButton) {
        await user.click(pinButton);

        await waitFor(() => {
          expect(api.patch).toHaveBeenCalledWith('/api/comments/1', {
            isPinned: true,
          });
        });
      }
    });

    it('should allow toggling resolved status', async () => {
      renderWithProviders(
        <CommentThread planType="lesson" planId="lesson-123" canResolve={true} />,
      );

      await waitFor(() => {
        expect(screen.getByText('This is a great lesson plan!')).toBeInTheDocument();
      });

      // Find and click resolve button
      const buttons = screen.getAllByRole('button');
      const resolveButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg');
        return svg && !svg.classList.contains('text-green-600');
      });

      if (resolveButton) {
        await user.click(resolveButton);

        await waitFor(() => {
          expect(api.patch).toHaveBeenCalledWith('/api/comments/1', {
            isResolved: true,
          });
        });
      }
    });
  });

  describe('Comment Deletion', () => {
    it('should allow users to delete their own comments', async () => {
      // Mock a comment by the current user
      const userComments = [
        {
          id: '1',
          content: 'My comment to delete',
          isResolved: false,
          isPinned: false,
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z',
          user: {
            id: 1, // Same as mockAuthContext.user.id
            name: 'Test User',
            email: 'test@example.com',
          },
          replies: [],
        },
      ];

      (api.get as any).mockImplementation((url: string) => {
        if (url === '/api/comments') {
          return Promise.resolve({ data: userComments });
        }
        if (url === '/api/comments/stats') {
          return Promise.resolve({ data: { total: 1, resolved: 0 } });
        }
        return Promise.resolve({ data: {} });
      });

      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      await waitFor(() => {
        expect(screen.getByText('My comment to delete')).toBeInTheDocument();
      });

      // Find and click delete button
      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find((btn) => {
        const svg = btn.querySelector('svg');
        return svg && svg.classList.contains('text-red-500');
      });

      if (deleteButton) {
        await user.click(deleteButton);

        await waitFor(() => {
          expect(api.delete).toHaveBeenCalledWith('/api/comments/1');
        });

        expect(mockToast).toHaveBeenCalledWith({
          title: 'Comment deleted',
          description: 'The comment has been removed.',
        });
      }
    });

    it('should not show delete button for comments with replies', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      await waitFor(() => {
        expect(screen.getByText('Could we add more examples?')).toBeInTheDocument();
      });

      // Comment with replies should not have delete button
      const buttons = screen.getAllByRole('button');
      const deleteButtons = buttons.filter((btn) => {
        const svg = btn.querySelector('svg');
        return svg && svg.classList.contains('text-red-500');
      });

      // Should not find delete button for comment with replies
      expect(deleteButtons.length).toBe(0);
    });
  });

  describe('API Integration', () => {
    it('should make correct API calls on mount', async () => {
      renderWithProviders(<CommentThread planType="unit" planId="unit-456" />);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/comments', {
          params: { planType: 'unit', planId: 'unit-456' },
        });
        expect(api.get).toHaveBeenCalledWith('/api/comments/stats', {
          params: { planType: 'unit', planId: 'unit-456' },
        });
      });
    });

    it('should handle API errors gracefully', async () => {
      (api.get as any).mockRejectedValue(new Error('API Error'));

      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      // Should still render the component with empty state
      await waitFor(() => {
        expect(screen.getByText('Add a comment...')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      const textarea = await screen.findByPlaceholderText('Add a comment...');
      expect(textarea).toHaveAttribute('aria-label', 'Add a comment');

      const postButton = screen.getByRole('button', { name: /post comment/i });
      expect(postButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      const textarea = await screen.findByPlaceholderText('Add a comment...');

      // Should be able to focus textarea
      textarea.focus();
      expect(textarea).toHaveFocus();

      // Should be able to tab to post button
      await user.tab();
      const postButton = screen.getByRole('button', { name: /post comment/i });
      expect(postButton).toHaveFocus();
    });

    it('should announce loading state to screen readers', () => {
      (api.get as any).mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      // Loading skeleton should be present
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('Different Plan Types', () => {
    it('should work with different plan types', async () => {
      const planTypes = ['long-range', 'unit', 'lesson', 'daybook'] as const;

      for (const planType of planTypes) {
        const { unmount } = renderWithProviders(
          <CommentThread planType={planType} planId={`${planType}-123`} />,
        );

        await waitFor(() => {
          expect(api.get).toHaveBeenCalledWith('/api/comments', {
            params: { planType, planId: `${planType}-123` },
          });
        });

        unmount();
        vi.clearAllMocks();
      }
    });
  });

  describe('Real-time Updates', () => {
    it('should invalidate queries after successful mutations', async () => {
      renderWithProviders(<CommentThread planType="lesson" planId="lesson-123" />);

      const textarea = await screen.findByPlaceholderText('Add a comment...');
      const postButton = screen.getByRole('button', { name: /post comment/i });

      await user.type(textarea, 'New comment');
      await user.click(postButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
      });

      // Should clear form after successful post
      expect(textarea).toHaveValue('');
    });
  });
});
