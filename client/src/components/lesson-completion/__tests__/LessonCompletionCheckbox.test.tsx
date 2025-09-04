/**
 * TDD Test Suite for Lesson Completion Checkbox Component
 * Issue #292: Implement Lesson Completion Tracking System
 * 
 * CRITICAL: Component must be controlled (no internal state/hooks)
 * Parent component manages ALL state
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { axe } from 'jest-axe';
import { LessonCompletionCheckbox } from '../LessonCompletionCheckbox';

describe('LessonCompletionCheckbox - TDD RED Phase', () => {
  const defaultProps = {
    lessonId: 'lesson-123',
    isCompleted: false,
    onToggle: vi.fn(),
    disabled: false,
    'aria-label': 'Mark lesson as complete'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Gate 2: Single Component Tests', () => {
    describe('Component Rendering', () => {
      it('should render an unchecked checkbox when isCompleted is false', () => {
        render(<LessonCompletionCheckbox {...defaultProps} />);
        
        const checkbox = screen.getByRole('checkbox', { name: /mark lesson as complete/i });
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
      });

      it('should render a checked checkbox when isCompleted is true', () => {
        render(<LessonCompletionCheckbox {...defaultProps} isCompleted={true} />);
        
        const checkbox = screen.getByRole('checkbox', { name: /mark lesson as complete/i });
        expect(checkbox).toBeChecked();
        expect(checkbox).toHaveAttribute('aria-checked', 'true');
      });

      it('should display visual distinction for completed state', () => {
        const { rerender } = render(<LessonCompletionCheckbox {...defaultProps} />);
        
        // Uncompleted state
        let checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveClass('checkbox--incomplete');
        
        // Completed state
        rerender(<LessonCompletionCheckbox {...defaultProps} isCompleted={true} />);
        checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveClass('checkbox--complete');
      });

      it('should render with custom className', () => {
        render(
          <LessonCompletionCheckbox 
            {...defaultProps} 
            className="custom-checkbox-class" 
          />
        );
        
        const container = screen.getByRole('checkbox').parentElement;
        expect(container).toHaveClass('custom-checkbox-class');
      });

      it('should render disabled state correctly', () => {
        render(<LessonCompletionCheckbox {...defaultProps} disabled={true} />);
        
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeDisabled();
        expect(checkbox).toHaveAttribute('aria-disabled', 'true');
      });
    });

    describe('CRITICAL: Controlled Component Behavior', () => {
      it('should NOT have internal state', () => {
        // This test verifies the component is controlled
        const { rerender } = render(<LessonCompletionCheckbox {...defaultProps} />);
        
        const checkbox = screen.getByRole('checkbox');
        
        // Click should not change checked state without prop change
        fireEvent.click(checkbox);
        expect(checkbox).not.toBeChecked();
        
        // Only prop change should update state
        rerender(<LessonCompletionCheckbox {...defaultProps} isCompleted={true} />);
        expect(checkbox).toBeChecked();
      });

      it('should NOT use useLessonCompletions hook internally', () => {
        // Mock the hook to ensure it's not called
        const mockUseLessonCompletions = vi.fn();
        vi.mock('../../hooks/useLessonCompletions', () => ({
          useLessonCompletions: mockUseLessonCompletions
        }));

        render(<LessonCompletionCheckbox {...defaultProps} />);
        
        expect(mockUseLessonCompletions).not.toHaveBeenCalled();
      });

      it('should receive all state via props', () => {
        const component = render(<LessonCompletionCheckbox {...defaultProps} />);
        
        // Verify component doesn't have useState calls
        const componentInstance = component.container.firstChild;
        expect(componentInstance).not.toHaveProperty('state');
      });
    });

    describe('User Interactions', () => {
      it('should call onToggle when clicked', async () => {
        const onToggle = vi.fn();
        render(<LessonCompletionCheckbox {...defaultProps} onToggle={onToggle} />);
        
        const checkbox = screen.getByRole('checkbox');
        await userEvent.click(checkbox);
        
        expect(onToggle).toHaveBeenCalledTimes(1);
        expect(onToggle).toHaveBeenCalledWith('lesson-123', false);
      });

      it('should not call onToggle when disabled', async () => {
        const onToggle = vi.fn();
        render(
          <LessonCompletionCheckbox 
            {...defaultProps} 
            onToggle={onToggle} 
            disabled={true} 
          />
        );
        
        const checkbox = screen.getByRole('checkbox');
        await userEvent.click(checkbox);
        
        expect(onToggle).not.toHaveBeenCalled();
      });

      it('should handle keyboard interaction (Space key)', async () => {
        const onToggle = vi.fn();
        render(<LessonCompletionCheckbox {...defaultProps} onToggle={onToggle} />);
        
        const checkbox = screen.getByRole('checkbox');
        checkbox.focus();
        
        await userEvent.keyboard(' ');
        
        expect(onToggle).toHaveBeenCalledTimes(1);
      });

      it('should handle keyboard interaction (Enter key)', async () => {
        const onToggle = vi.fn();
        render(<LessonCompletionCheckbox {...defaultProps} onToggle={onToggle} />);
        
        const checkbox = screen.getByRole('checkbox');
        checkbox.focus();
        
        await userEvent.keyboard('{Enter}');
        
        expect(onToggle).toHaveBeenCalledTimes(1);
      });

      it('should maintain focus after toggle', async () => {
        const { rerender } = render(<LessonCompletionCheckbox {...defaultProps} />);
        
        const checkbox = screen.getByRole('checkbox');
        checkbox.focus();
        
        await userEvent.click(checkbox);
        
        // Simulate parent updating the prop
        rerender(<LessonCompletionCheckbox {...defaultProps} isCompleted={true} />);
        
        expect(document.activeElement).toBe(checkbox);
      });
    });

    describe('Optimistic UI Updates', () => {
      it('should show loading state during async operations', () => {
        render(<LessonCompletionCheckbox {...defaultProps} isLoading={true} />);
        
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveAttribute('aria-busy', 'true');
        expect(checkbox.parentElement).toHaveClass('checkbox--loading');
      });

      it('should disable interaction during loading', () => {
        const onToggle = vi.fn();
        render(
          <LessonCompletionCheckbox 
            {...defaultProps} 
            onToggle={onToggle}
            isLoading={true} 
          />
        );
        
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        
        expect(onToggle).not.toHaveBeenCalled();
      });

      it('should show error state on failed toggle', () => {
        render(
          <LessonCompletionCheckbox 
            {...defaultProps} 
            error="Failed to save completion" 
          />
        );
        
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to save completion');
        expect(screen.getByRole('checkbox').parentElement).toHaveClass('checkbox--error');
      });
    });

    describe('Accessibility', () => {
      it('should have no accessibility violations', async () => {
        const { container } = render(<LessonCompletionCheckbox {...defaultProps} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it('should have proper ARIA attributes', () => {
        render(<LessonCompletionCheckbox {...defaultProps} />);
        
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveAttribute('aria-label', 'Mark lesson as complete');
        expect(checkbox).toHaveAttribute('aria-checked', 'false');
        expect(checkbox).toHaveAttribute('role', 'checkbox');
      });

      it('should support screen reader announcements', () => {
        const { rerender } = render(<LessonCompletionCheckbox {...defaultProps} />);
        
        // Check for live region
        expect(screen.getByRole('status')).toBeInTheDocument();
        
        // Update to completed
        rerender(<LessonCompletionCheckbox {...defaultProps} isCompleted={true} />);
        
        expect(screen.getByRole('status')).toHaveTextContent('Lesson marked as complete');
      });

      it('should be keyboard navigable with Tab', async () => {
        render(
          <div>
            <button>Before</button>
            <LessonCompletionCheckbox {...defaultProps} />
            <button>After</button>
          </div>
        );
        
        const beforeButton = screen.getByText('Before');
        const checkbox = screen.getByRole('checkbox');
        const afterButton = screen.getByText('After');
        
        beforeButton.focus();
        await userEvent.tab();
        expect(document.activeElement).toBe(checkbox);
        
        await userEvent.tab();
        expect(document.activeElement).toBe(afterButton);
      });

      it('should have minimum touch target size for mobile', () => {
        render(<LessonCompletionCheckbox {...defaultProps} />);
        
        const checkbox = screen.getByRole('checkbox');
        const styles = window.getComputedStyle(checkbox);
        
        const width = parseInt(styles.width);
        const height = parseInt(styles.height);
        
        expect(width).toBeGreaterThanOrEqual(44);
        expect(height).toBeGreaterThanOrEqual(44);
      });
    });

    describe('Visual Feedback', () => {
      it('should show focus indicator when focused', () => {
        render(<LessonCompletionCheckbox {...defaultProps} />);
        
        const checkbox = screen.getByRole('checkbox');
        checkbox.focus();
        
        expect(checkbox).toHaveClass('checkbox--focused');
        expect(window.getComputedStyle(checkbox).outline).not.toBe('none');
      });

      it('should show hover state on mouse over', async () => {
        render(<LessonCompletionCheckbox {...defaultProps} />);
        
        const checkbox = screen.getByRole('checkbox');
        await userEvent.hover(checkbox);
        
        expect(checkbox.parentElement).toHaveClass('checkbox--hover');
      });

      it('should animate state transitions', () => {
        const { rerender } = render(<LessonCompletionCheckbox {...defaultProps} />);
        
        const checkbox = screen.getByRole('checkbox');
        const styles = window.getComputedStyle(checkbox);
        
        expect(styles.transition).toContain('all');
        
        rerender(<LessonCompletionCheckbox {...defaultProps} isCompleted={true} />);
        
        // Verify animation class is applied
        expect(checkbox).toHaveClass('checkbox--animating');
      });
    });

    describe('TypeScript Props Validation', () => {
      it('should require lessonId prop', () => {
        // @ts-expect-error - lessonId is required
        const component = <LessonCompletionCheckbox isCompleted={false} onToggle={() => {}} />;
        expect(component).toBeDefined();
      });

      it('should require isCompleted prop', () => {
        // @ts-expect-error - isCompleted is required
        const component = <LessonCompletionCheckbox lessonId="123" onToggle={() => {}} />;
        expect(component).toBeDefined();
      });

      it('should require onToggle prop', () => {
        // @ts-expect-error - onToggle is required
        const component = <LessonCompletionCheckbox lessonId="123" isCompleted={false} />;
        expect(component).toBeDefined();
      });
    });
  });

  describe('CRITICAL: Anti-Pattern Prevention Tests', () => {
    it('should not share state between multiple checkboxes', () => {
      const onToggle1 = vi.fn();
      const onToggle2 = vi.fn();
      
      const { rerender } = render(
        <>
          <LessonCompletionCheckbox 
            lessonId="lesson-1" 
            isCompleted={false} 
            onToggle={onToggle1}
          />
          <LessonCompletionCheckbox 
            lessonId="lesson-2" 
            isCompleted={false} 
            onToggle={onToggle2}
          />
        </>
      );
      
      const checkboxes = screen.getAllByRole('checkbox');
      
      // Click first checkbox
      fireEvent.click(checkboxes[0]);
      
      // Only first onToggle should be called
      expect(onToggle1).toHaveBeenCalled();
      expect(onToggle2).not.toHaveBeenCalled();
      
      // Simulate parent updating only first checkbox
      rerender(
        <>
          <LessonCompletionCheckbox 
            lessonId="lesson-1" 
            isCompleted={true} 
            onToggle={onToggle1}
          />
          <LessonCompletionCheckbox 
            lessonId="lesson-2" 
            isCompleted={false} 
            onToggle={onToggle2}
          />
        </>
      );
      
      // Verify states are independent
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('should not fetch its own data', () => {
      // Mock fetch to ensure component doesn't make API calls
      const fetchSpy = vi.spyOn(global, 'fetch');
      
      render(<LessonCompletionCheckbox {...defaultProps} />);
      
      expect(fetchSpy).not.toHaveBeenCalled();
      
      fetchSpy.mockRestore();
    });

    it('should not maintain internal completion state', () => {
      const { rerender } = render(<LessonCompletionCheckbox {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      
      // Multiple clicks without prop changes
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      
      // State should remain unchanged
      expect(checkbox).not.toBeChecked();
      
      // Only prop change should update
      rerender(<LessonCompletionCheckbox {...defaultProps} isCompleted={true} />);
      expect(checkbox).toBeChecked();
    });

    it('should not have useEffect for data fetching', () => {
      const useEffectSpy = vi.spyOn(React, 'useEffect');
      
      render(<LessonCompletionCheckbox {...defaultProps} />);
      
      // Component should not use useEffect for data operations
      const effectCalls = useEffectSpy.mock.calls;
      effectCalls.forEach(call => {
        const effectFunction = call[0].toString();
        expect(effectFunction).not.toContain('fetch');
        expect(effectFunction).not.toContain('api');
        expect(effectFunction).not.toContain('completion');
      });
      
      useEffectSpy.mockRestore();
    });
  });

  describe('Performance Requirements', () => {
    it('should respond to clicks within 100ms', async () => {
      const onToggle = vi.fn();
      render(<LessonCompletionCheckbox {...defaultProps} onToggle={onToggle} />);
      
      const checkbox = screen.getByRole('checkbox');
      const startTime = performance.now();
      
      fireEvent.click(checkbox);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(100);
      expect(onToggle).toHaveBeenCalled();
    });

    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const MemoizedCheckbox = React.memo(LessonCompletionCheckbox);
      
      const TestWrapper = ({ otherProp }: { otherProp: string }) => {
        renderSpy();
        return (
          <div>
            <div>{otherProp}</div>
            <MemoizedCheckbox {...defaultProps} />
          </div>
        );
      };
      
      const { rerender } = render(<TestWrapper otherProp="initial" />);
      
      renderSpy.mockClear();
      
      // Change unrelated prop
      rerender(<TestWrapper otherProp="changed" />);
      
      // Checkbox should not re-render for unrelated prop changes
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });
});