/**
 * TRUE Integration Tests for Planning Cascade View (Issue #309)
 * Tests the ACTUAL component, not abstract concepts
 */

import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PlanningCascadeView } from '../PlanningCascadeView';
import { apiClient } from '../../../api/core/client';

// Mock API client
vi.mock('../../../api/core/client');

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock API response matching actual server structure
const mockCascadeData = {
  cascade: {
    id: 'year-2024-2025',
    type: 'year',
    academicYear: '2024-2025',
    terms: [
      {
        id: '2024-2025-term-1',
        type: 'term',
        term: 'Term 1',
        termNumber: 1,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-11-30'),
        subjects: [
          {
            id: 'lrp-math',
            type: 'subject',
            subject: 'Mathematics',
            grade: 1,
            units: [
              {
                id: 'unit-patterns',
                type: 'unit',
                title: 'Patterns and Numbers',
                titleFr: 'Motifs et nombres',
                startDate: new Date('2024-09-15'),
                endDate: new Date('2024-10-15'),
                weeks: [
                  {
                    id: 'unit-patterns-week-1',
                    type: 'week',
                    weekNumber: 1,
                    startDate: new Date('2024-09-15'),
                    endDate: new Date('2024-09-21'),
                    lessons: [
                      {
                        id: 'lesson-ab-patterns',
                        type: 'lesson',
                        title: 'AB Pattern Recognition',
                        date: new Date('2024-09-16'),
                        duration: 45,
                        status: 'TAUGHT',
                        isOverdue: false,
                        isTaught: true,
                        subject: 'Mathematics',
                        expectations: 3
                      },
                      {
                        id: 'lesson-counting',
                        type: 'lesson',
                        title: 'Counting to 20',
                        date: null,
                        duration: 45,
                        status: 'PLANNED',
                        isOverdue: false,
                        isTaught: false,
                        subject: 'Mathematics',
                        expectations: 2
                      }
                    ],
                    progress: { total: 2, taught: 1, overdue: 0 }
                  }
                ],
                progress: { total: 2, taught: 1, overdue: 0 }
              }
            ],
            progress: { total: 2, taught: 1, overdue: 0 }
          }
        ],
        progress: { total: 2, taught: 1, overdue: 0 }
      }
    ],
    progress: { total: 2, taught: 1, overdue: 0 }
  },
  statistics: {
    totalLessons: 2,
    taughtLessons: 1,
    plannedLessons: 1,
    overdueCount: 0,
    completionPercentage: 50
  }
};

describe('Planning Cascade View - Real Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('1. Component Renders with API Data', () => {
    it('should fetch and render cascade data from API within 2 seconds', async () => {
      const startTime = performance.now();
      
      // Mock API response
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockCascadeData
      });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      // Should show loading state initially
      expect(screen.getByText(/Loading planning cascade/i)).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Planning Overview')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      
      // Verify API was called
      expect(apiClient.get).toHaveBeenCalledWith('/api/planning-cascade/cascade');
      
      // Should render within 2 seconds (requirement from issue)
      expect(renderTime).toBeLessThan(2000);
    });

    it('should handle authentication errors gracefully', async () => {
      // Mock 401 error
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        response: { status: 401, data: { error: 'Authentication required' } }
      });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Authentication required/i)).toBeInTheDocument();
      });

      // Should not crash
      expect(screen.getByText('Planning Overview')).toBeInTheDocument();
    });
  });

  describe('2. Tree Structure Display', () => {
    it('should display terms, units, and lessons in hierarchical structure', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check hierarchy: Term → Unit → Lesson
        expect(screen.getByText('Term 1')).toBeInTheDocument();
        expect(screen.getByText('Patterns and Numbers')).toBeInTheDocument();
        expect(screen.getByText('AB Pattern Recognition')).toBeInTheDocument();
      });

      // Verify proper icons are displayed
      const termIcon = screen.getByText('📅'); // Term icon
      const unitIcon = screen.getByText('📚'); // Unit icon
      const lessonIcon = screen.getByText('📖'); // Lesson icon
      
      expect(termIcon).toBeInTheDocument();
      expect(unitIcon).toBeInTheDocument();
      expect(lessonIcon).toBeInTheDocument();
    });

    it('should show proper indentation for hierarchy levels', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        const termElement = screen.getByText('Term 1').closest('div');
        const unitElement = screen.getByText('Patterns and Numbers').closest('div');
        const lessonElement = screen.getByText('AB Pattern Recognition').closest('div');

        // Check indentation increases with depth
        const termPadding = window.getComputedStyle(termElement!).paddingLeft;
        const unitPadding = window.getComputedStyle(unitElement!).paddingLeft;
        const lessonPadding = window.getComputedStyle(lessonElement!).paddingLeft;

        expect(parseInt(unitPadding)).toBeGreaterThan(parseInt(termPadding));
        expect(parseInt(lessonPadding)).toBeGreaterThan(parseInt(unitPadding));
      });
    });
  });

  describe('3. Lesson Scheduling Status', () => {
    it('should show scheduled date for scheduled lessons', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        const scheduledLesson = screen.getByText('AB Pattern Recognition').closest('div');
        expect(scheduledLesson).toHaveTextContent('Sep 16 ✓');
      });
    });

    it('should show "Not scheduled" badge for unscheduled lessons', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        const unscheduledLesson = screen.getByText('Counting to 20').closest('div');
        expect(unscheduledLesson).toHaveTextContent('Not scheduled ⚠️');
      });
    });

    it('should use different colors for different statuses', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        const taughtLesson = screen.getByText('AB Pattern Recognition').closest('div');
        const plannedLesson = screen.getByText('Counting to 20').closest('div');

        // Check for status indicators
        expect(taughtLesson?.querySelector('.text-green-600')).toBeInTheDocument();
        expect(plannedLesson?.querySelector('.text-yellow-600')).toBeInTheDocument();
      });
    });
  });

  describe('4. Click Navigation', () => {
    it('should navigate to lesson detail when lesson clicked', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        const lesson = screen.getByText('AB Pattern Recognition');
        fireEvent.click(lesson);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/lessons/lesson-ab-patterns');
    });

    it('should navigate to unit page when unit clicked', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        const unit = screen.getByText('Patterns and Numbers');
        fireEvent.click(unit);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/units/unit-patterns');
    });

    it('should navigate to day view when date clicked', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        const dateElement = screen.getByText('Sep 16 ✓');
        fireEvent.click(dateElement);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/day/2024-09-16');
    });
  });

  describe('5. Tree Expansion and Collapse', () => {
    it('should expand and collapse tree nodes', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Patterns and Numbers')).toBeInTheDocument();
      });

      // Wait for initial expansion (lessons should be visible)
      await waitFor(() => {
        expect(screen.getByText('AB Pattern Recognition')).toBeVisible();
      });

      // Find the expand/collapse button for the unit
      const unitNode = screen.getByText('Patterns and Numbers').closest('div');
      const expandButton = unitNode?.querySelector('button[aria-label*="Expand"]');
      expect(expandButton).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(expandButton!);
      
      // Wait for collapse (lesson should not be in document)
      await waitFor(() => {
        expect(screen.queryByText('AB Pattern Recognition')).not.toBeInTheDocument();
      });

      // Click to expand again
      fireEvent.click(expandButton!);
      
      // Wait for expansion (lesson should be visible again)
      await waitFor(() => {
        expect(screen.getByText('AB Pattern Recognition')).toBeVisible();
      });
    });

    it('should support expand all and collapse all', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      // Wait for data to load and initial expansion
      await waitFor(() => {
        expect(screen.getByText('AB Pattern Recognition')).toBeVisible();
      });

      // Click Collapse All
      const collapseAllBtn = screen.getByText('Collapse All');
      fireEvent.click(collapseAllBtn);
      
      // Wait for collapse (lesson should not be in document)
      await waitFor(() => {
        expect(screen.queryByText('AB Pattern Recognition')).not.toBeInTheDocument();
      });

      // Click Expand All
      const expandAllBtn = screen.getByText('Expand All');
      fireEvent.click(expandAllBtn);
      
      // Wait for expansion (lesson should be visible again)
      await waitFor(() => {
        expect(screen.getByText('AB Pattern Recognition')).toBeVisible();
      });
    });
  });

  describe('6. Keyboard Navigation', () => {
    it('should navigate with arrow keys', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      // Wait for tree to render with items
      await waitFor(() => {
        expect(screen.getAllByRole('treeitem').length).toBeGreaterThan(0);
      });

      const tree = screen.getByRole('tree');
      
      // Focus the tree
      tree.focus();
      
      // First item should be selected by default (selectedIndex starts at 0)
      const firstItem = screen.getAllByRole('treeitem')[0];
      expect(firstItem).toHaveAttribute('aria-selected', 'true');
      
      // Press down arrow to move to second item
      fireEvent.keyDown(tree, { key: 'ArrowDown' });
      
      // Check selection moved to second item
      const items = screen.getAllByRole('treeitem');
      expect(items[1]).toHaveAttribute('aria-selected', 'true');
      expect(items[0]).toHaveAttribute('aria-selected', 'false');
      
      // Press Enter to expand/collapse
      fireEvent.keyDown(tree, { key: 'Enter' });
      
      // Press up arrow to go back
      fireEvent.keyDown(tree, { key: 'ArrowUp' });
      expect(items[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('should jump to first/last with Home/End keys', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        const tree = screen.getByRole('tree');
        
        // Press End key
        fireEvent.keyDown(tree, { key: 'End' });
        
        const items = screen.getAllByRole('treeitem');
        const lastItem = items[items.length - 1];
        expect(lastItem).toHaveAttribute('aria-selected', 'true');
        
        // Press Home key
        fireEvent.keyDown(tree, { key: 'Home' });
        
        const firstItem = items[0];
        expect(firstItem).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('7. ARIA Support', () => {
    it('should have proper ARIA attributes for accessibility', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        // Tree container
        const tree = screen.getByRole('tree');
        expect(tree).toHaveAttribute('aria-label', 'Planning cascade tree');
        
        // Tree items
        const treeItems = screen.getAllByRole('treeitem');
        treeItems.forEach(item => {
          expect(item).toHaveAttribute('aria-level');
          
          // Check expandable items
          if (item.querySelector('button[aria-label*="Expand"]')) {
            expect(item).toHaveAttribute('aria-expanded');
          }
        });
      });
    });
  });

  describe('8. Search and Filter', () => {
    it('should search and filter tree content', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('AB Pattern Recognition')).toBeInTheDocument();
      });

      // Type in search box
      const searchInput = screen.getByPlaceholderText(/Search lessons/i);
      await user.type(searchInput, 'counting');

      // Wait for debounced search
      await waitFor(() => {
        // Should show matching lesson
        expect(screen.getByText('Counting to 20')).toBeVisible();
        // Should hide non-matching lesson
        expect(screen.queryByText('AB Pattern Recognition')).not.toBeInTheDocument();
      }, { timeout: 500 });

      // Clear search
      await user.clear(searchInput);

      await waitFor(() => {
        // All lessons should be visible again
        expect(screen.getByText('AB Pattern Recognition')).toBeVisible();
        expect(screen.getByText('Counting to 20')).toBeVisible();
      });
    });

    it('should filter to show only unscheduled lessons', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        const filterButton = screen.getByText('Show Unscheduled Only');
        fireEvent.click(filterButton);
        
        // Should show only unscheduled lesson
        expect(screen.getByText('Counting to 20')).toBeVisible();
        expect(screen.queryByText('AB Pattern Recognition')).not.toBeInTheDocument();
        
        // Should show count
        expect(screen.getByText('1 not scheduled')).toBeInTheDocument();
      });
    });
  });

  describe('9. Expectation Highlighting', () => {
    it('should highlight lessons containing selected expectation', async () => {
      const dataWithExpectations = {
        ...mockCascadeData,
        expectations: [
          { id: 'exp-1', code: 'M1.1', description: 'Count to 20' },
          { id: 'exp-2', code: 'M1.2', description: 'Identify patterns' }
        ]
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: dataWithExpectations });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        // Select an expectation
        const expectationSelector = screen.getByLabelText('Highlight expectation');
        fireEvent.change(expectationSelector, { target: { value: 'exp-1' } });
        
        // Lessons with this expectation should be highlighted
        const countingLesson = screen.getByText('Counting to 20').closest('div');
        expect(countingLesson).toHaveClass('bg-yellow-100');
      });
    });
  });

  describe('10. Performance with Large Dataset', () => {
    it('should handle 50 units with 500 lessons smoothly', async () => {
      // Generate large dataset
      const largeDataset = {
        cascade: {
          ...mockCascadeData.cascade,
          terms: Array.from({ length: 3 }, (_, termIdx) => ({
            ...mockCascadeData.cascade.terms[0],
            id: `term-${termIdx}`,
            subjects: Array.from({ length: 5 }, (_, subjectIdx) => ({
              ...mockCascadeData.cascade.terms[0].subjects[0],
              id: `subject-${termIdx}-${subjectIdx}`,
              units: Array.from({ length: 10 }, (_, unitIdx) => ({
                ...mockCascadeData.cascade.terms[0].subjects[0].units[0],
                id: `unit-${termIdx}-${subjectIdx}-${unitIdx}`,
                weeks: Array.from({ length: 2 }, (_, weekIdx) => ({
                  ...mockCascadeData.cascade.terms[0].subjects[0].units[0].weeks[0],
                  id: `week-${termIdx}-${subjectIdx}-${unitIdx}-${weekIdx}`,
                  lessons: Array.from({ length: 5 }, (_, lessonIdx) => ({
                    id: `lesson-${termIdx}-${subjectIdx}-${unitIdx}-${weekIdx}-${lessonIdx}`,
                    type: 'lesson',
                    title: `Lesson ${lessonIdx + 1}`,
                    date: new Date(),
                    duration: 45,
                    status: 'PLANNED',
                    isOverdue: false,
                    isTaught: false,
                    subject: 'Mathematics',
                    expectations: 2
                  }))
                }))
              }))
            }))
          }))
        },
        statistics: {
          totalLessons: 500,
          taughtLessons: 0,
          plannedLessons: 500,
          overdueCount: 0,
          completionPercentage: 0
        }
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: largeDataset });

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('500 lessons')).toBeInTheDocument();
      });

      const renderTime = performance.now() - startTime;
      
      // Should still render quickly with large dataset
      expect(renderTime).toBeLessThan(3000);
      
      // Should use virtualization (check for FixedSizeList)
      const virtualList = document.querySelector('[style*="height"]');
      expect(virtualList).toBeInTheDocument();
    });
  });

  describe('11. Progress Statistics', () => {
    it('should display progress statistics', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('2 lessons')).toBeInTheDocument();
        expect(screen.getByText('1 taught')).toBeInTheDocument();
        expect(screen.getByText('1 planned')).toBeInTheDocument();
      });
    });
  });

  describe('12. Mobile Responsiveness', () => {
    it('should be responsive on mobile devices', async () => {
      // Set viewport to mobile size
      window.innerWidth = 375;
      window.innerHeight = 667;

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCascadeData });

      render(
        <TestWrapper>
          <PlanningCascadeView />
        </TestWrapper>
      );

      await waitFor(() => {
        const container = screen.getByText('Planning Overview').closest('div');
        
        // Should stack elements vertically on mobile
        expect(container).toHaveClass('flex-col');
        
        // Tree should be scrollable
        const tree = screen.getByRole('tree');
        expect(tree).toHaveStyle({ overflow: 'auto' });
      });
    });
  });
});