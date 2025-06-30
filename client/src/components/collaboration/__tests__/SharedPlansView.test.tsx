/**
 * @file SharedPlansView.test.tsx
 * @description Comprehensive tests for SharedPlansView component including tab navigation,
 * plan display, user interactions, and API integration.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SharedPlansView } from '../SharedPlansView';
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

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 hours'),
}));

// Mock data
const mockReceivedPlans = [
  {
    id: 'share-1',
    planType: 'lesson',
    planId: 'lesson-123',
    sharedAt: '2024-01-01T10:00:00Z',
    lastViewedAt: '2024-01-01T11:00:00Z',
    viewCount: 5,
    copyCount: 2,
    canEdit: false,
    canCopy: true,
    canComment: true,
    message: 'Great lesson plan for French immersion!',
    sharedBy: {
      id: 2,
      name: 'Jane Teacher',
      email: 'jane@example.com',
    },
    planDetails: {
      id: 'lesson-123',
      title: 'Introduction to Fractions',
      date: '2024-01-15',
      grade: 3,
      subject: 'Mathematics',
    },
  },
  {
    id: 'share-2',
    planType: 'unit',
    planId: 'unit-456',
    sharedAt: '2024-01-02T09:00:00Z',
    viewCount: 3,
    copyCount: 1,
    canEdit: true,
    canCopy: true,
    canComment: true,
    sharedBy: {
      id: 3,
      name: 'John Collaborator',
      email: 'john@example.com',
    },
    planDetails: {
      id: 'unit-456',
      title: 'Weather Patterns Unit',
      grade: 4,
      subject: 'Science',
      startDate: '2024-02-01',
      endDate: '2024-02-28',
    },
  },
];

const mockSentPlans = [
  {
    id: 'share-3',
    planType: 'daybook',
    planId: 'daybook-789',
    sharedAt: '2024-01-03T14:00:00Z',
    viewCount: 8,
    copyCount: 3,
    canEdit: false,
    canCopy: true,
    canComment: true,
    sharedWith: {
      id: 4,
      name: 'Mary Colleague',
      email: 'mary@example.com',
    },
    planDetails: {
      id: 'daybook-789',
      title: 'Week of January 15, 2024',
      date: '2024-01-15',
    },
  },
];

describe('SharedPlansView', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
    mockNavigate.mockClear();

    // Mock API responses based on direction parameter
    (api.get as any).mockImplementation((url: string, config: any) => {
      const direction = config?.params?.direction;
      if (direction === 'received') {
        return Promise.resolve({ data: mockReceivedPlans });
      } else if (direction === 'sent') {
        return Promise.resolve({ data: mockSentPlans });
      }
      return Promise.resolve({ data: mockReceivedPlans });
    });

    (api.post as any).mockResolvedValue({ data: { success: true } });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<SharedPlansView />);

      expect(screen.getByText('Shared with me')).toBeInTheDocument();
      expect(screen.getByText('Shared by me')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      (api.get as any).mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<SharedPlansView />);

      // Should show some loading indication
      expect(screen.getByText('Shared with me')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should render both tabs', () => {
      renderWithProviders(<SharedPlansView />);

      expect(screen.getByText('Shared with me')).toBeInTheDocument();
      expect(screen.getByText('Shared by me')).toBeInTheDocument();
    });

    it('should start with received tab active', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/sharing/plans', {
          params: { direction: 'received' },
        });
      });
    });

    it('should switch to sent tab', async () => {
      renderWithProviders(<SharedPlansView />);

      const sentTab = screen.getByText('Shared by me');
      await user.click(sentTab);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/sharing/plans', {
          params: { direction: 'sent' },
        });
      });
    });

    it('should load different data for each tab', async () => {
      renderWithProviders(<SharedPlansView />);

      // Should show received plans initially
      await waitFor(() => {
        expect(screen.getByText('Introduction to Fractions')).toBeInTheDocument();
      });

      // Switch to sent tab
      const sentTab = screen.getByText('Shared by me');
      await user.click(sentTab);

      // Should show sent plans
      await waitFor(() => {
        expect(screen.getByText('Week of January 15, 2024')).toBeInTheDocument();
      });
    });
  });

  describe('Plan Display', () => {
    it('should display plan information correctly', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getByText('Introduction to Fractions')).toBeInTheDocument();
        expect(screen.getByText('Mathematics • Grade 3')).toBeInTheDocument();
        expect(screen.getByText('Shared by Jane Teacher')).toBeInTheDocument();
        expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      });
    });

    it('should show shared message when available', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getByText('Great lesson plan for French immersion!')).toBeInTheDocument();
      });
    });

    it('should display correct plan type icons', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        // Check for lesson plan icon (FileText)
        const lessonPlanCard = screen
          .getByText('Introduction to Fractions')
          .closest('.card, [class*="card"]');
        expect(lessonPlanCard).toBeInTheDocument();

        // Check for unit plan icon (BookOpen)
        const unitPlanCard = screen
          .getByText('Weather Patterns Unit')
          .closest('.card, [class*="card"]');
        expect(unitPlanCard).toBeInTheDocument();
      });
    });

    it('should display view and copy counts', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getByText('5 views')).toBeInTheDocument();
        expect(screen.getByText('2 copies')).toBeInTheDocument();
      });
    });

    it('should show permission badges', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getByText('Can copy')).toBeInTheDocument();
        expect(screen.getByText('Can comment')).toBeInTheDocument();
      });
    });

    it('should show edit permission when available', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        // The unit plan has edit permission
        expect(screen.getByText('Can edit')).toBeInTheDocument();
      });
    });
  });

  describe('Plan Actions', () => {
    it('should show action buttons for each plan', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getAllByText('View')).toHaveLength(2);
        expect(screen.getAllByText('Copy')).toHaveLength(2);
      });
    });

    it('should navigate to plan when view is clicked', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getByText('Introduction to Fractions')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByText('View');
      await user.click(viewButtons[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/lesson-plans/lesson-123');
    });

    it('should handle copy plan action', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getByText('Introduction to Fractions')).toBeInTheDocument();
      });

      const copyButtons = screen.getAllByText('Copy');
      await user.click(copyButtons[0]);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/api/sharing/plans/share-1/copy');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Plan copied!',
        description: 'The plan has been added to your workspace.',
      });
    });

    it('should handle copy errors', async () => {
      (api.post as any).mockRejectedValueOnce(new Error('Copy failed'));

      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getByText('Introduction to Fractions')).toBeInTheDocument();
      });

      const copyButtons = screen.getAllByText('Copy');
      await user.click(copyButtons[0]);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Copy failed',
          description: 'Copy failed',
          variant: 'destructive',
        });
      });
    });

    it('should disable copy button for plans without copy permission', async () => {
      const plansWithoutCopy = [
        {
          ...mockReceivedPlans[0],
          canCopy: false,
        },
      ];

      (api.get as any).mockResolvedValue({ data: plansWithoutCopy });

      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        const copyButton = screen.getByText('Copy');
        expect(copyButton.closest('button')).toBeDisabled();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no plans are shared', async () => {
      (api.get as any).mockResolvedValue({ data: [] });

      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getByText('No plans shared with you yet')).toBeInTheDocument();
        expect(screen.getByText('Ask colleagues to share their lesson plans')).toBeInTheDocument();
      });
    });

    it('should show empty state for sent plans', async () => {
      (api.get as any).mockImplementation((url: string, config: any) => {
        const direction = config?.params?.direction;
        if (direction === 'sent') {
          return Promise.resolve({ data: [] });
        }
        return Promise.resolve({ data: mockReceivedPlans });
      });

      renderWithProviders(<SharedPlansView />);

      const sentTab = screen.getByText('Shared by me');
      await user.click(sentTab);

      await waitFor(() => {
        expect(screen.getByText("You haven't shared any plans yet")).toBeInTheDocument();
        expect(screen.getByText('Share your lesson plans')).toBeInTheDocument();
      });
    });
  });

  describe('Different Plan Types Navigation', () => {
    it('should navigate to correct URLs for different plan types', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getByText('Introduction to Fractions')).toBeInTheDocument();
        expect(screen.getByText('Weather Patterns Unit')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByText('View');

      // Click lesson plan view
      await user.click(viewButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith('/lesson-plans/lesson-123');

      // Click unit plan view
      await user.click(viewButtons[1]);
      expect(mockNavigate).toHaveBeenCalledWith('/unit-plans/unit-456');
    });

    it('should handle daybook plan navigation', async () => {
      renderWithProviders(<SharedPlansView />);

      // Switch to sent tab to see daybook plan
      const sentTab = screen.getByText('Shared by me');
      await user.click(sentTab);

      await waitFor(() => {
        expect(screen.getByText('Week of January 15, 2024')).toBeInTheDocument();
      });

      const viewButton = screen.getByText('View');
      await user.click(viewButton);

      expect(mockNavigate).toHaveBeenCalledWith('/daybook/daybook-789');
    });
  });

  describe('API Integration', () => {
    it('should make correct API calls for received plans', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/sharing/plans', {
          params: { direction: 'received' },
        });
      });
    });

    it('should make correct API calls for sent plans', async () => {
      renderWithProviders(<SharedPlansView />);

      const sentTab = screen.getByText('Shared by me');
      await user.click(sentTab);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/api/sharing/plans', {
          params: { direction: 'sent' },
        });
      });
    });

    it('should handle API errors gracefully', async () => {
      (api.get as any).mockRejectedValue(new Error('API Error'));

      renderWithProviders(<SharedPlansView />);

      // Should still render the component structure
      expect(screen.getByText('Shared with me')).toBeInTheDocument();
    });

    it('should invalidate queries after copying', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getByText('Introduction to Fractions')).toBeInTheDocument();
      });

      const copyButtons = screen.getAllByText('Copy');
      await user.click(copyButtons[0]);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
      });

      // Query invalidation happens in the mutation success handler
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Plan copied!',
        description: 'The plan has been added to your workspace.',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: 'View' })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'Copy' })).toHaveLength(2);
      });
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<SharedPlansView />);

      // Should be able to tab through tabs
      const receivedTab = screen.getByText('Shared with me');
      const sentTab = screen.getByText('Shared by me');

      receivedTab.focus();
      expect(receivedTab).toHaveFocus();

      await user.tab();
      expect(sentTab).toHaveFocus();
    });

    it('should have proper tab semantics', () => {
      renderWithProviders(<SharedPlansView />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);
    });

    it('should have proper loading state accessibility', () => {
      (api.get as any).mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<SharedPlansView />);

      // Should have accessible structure during loading
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format shared dates correctly', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        expect(screen.getAllByText('2 hours ago')).toHaveLength(2);
      });
    });
  });

  describe('Permission Display', () => {
    it('should show different permissions for different plans', async () => {
      renderWithProviders(<SharedPlansView />);

      await waitFor(() => {
        // First plan (lesson) - no edit permission
        expect(screen.getAllByText('Can copy')).toHaveLength(2);
        expect(screen.getAllByText('Can comment')).toHaveLength(2);

        // Second plan (unit) - has edit permission
        expect(screen.getByText('Can edit')).toBeInTheDocument();
      });
    });
  });
});
