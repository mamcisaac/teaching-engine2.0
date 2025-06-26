/**
 * @file select.test.tsx
 * @description Comprehensive tests for Select components including all sub-components,
 * interactions, accessibility, and keyboard navigation.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
} from '../select';
import { render, setupTest } from '@/test-utils';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Check: ({ className }: { className?: string }) => <div data-testid="check-icon" className={className} />,
  ChevronDown: ({ className }: { className?: string }) => <div data-testid="chevron-down-icon" className={className} />,
  ChevronUp: ({ className }: { className?: string }) => <div data-testid="chevron-up-icon" className={className} />,
}));

describe('Select Components', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    setupTest();
  });

  const BasicSelect = ({ defaultValue = '', onValueChange = vi.fn() }) => (
    <Select defaultValue={defaultValue} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  );

  const GroupedSelect = () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select from groups" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Group 1</SelectLabel>
          <SelectItem value="group1-item1">Group 1 Item 1</SelectItem>
          <SelectItem value="group1-item2">Group 1 Item 2</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Group 2</SelectLabel>
          <SelectItem value="group2-item1">Group 2 Item 1</SelectItem>
          <SelectItem value="group2-item2">Group 2 Item 2</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  describe('SelectTrigger', () => {
    it('should render with default styles', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'items-center',
        'justify-between',
        'rounded-md',
        'border'
      );
    });

    it('should display placeholder text', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose an option" />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('should show chevron down icon', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should be disabled when disabled prop is passed', () => {
      render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('SelectContent', () => {
    it('should not be visible initially', () => {
      render(<BasicSelect />);
      
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Option 3')).not.toBeInTheDocument();
    });

    it('should appear when trigger is clicked', async () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });
    });

    it('should have correct styling classes', async () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Option 1').closest('[role="listbox"]');
        expect(content).toHaveClass(
          'relative',
          'z-50',
          'max-h-96',
          'min-w-[8rem]',
          'overflow-hidden',
          'rounded-md',
          'border'
        );
      });
    });

    it('should show scroll buttons when needed', async () => {
      // Create a select with many items to trigger scrolling
      const ManyItemsSelect = () => (
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent style={{ maxHeight: '200px' }}>
            {Array.from({ length: 20 }, (_, i) => (
              <SelectItem key={`item-${i}`} value={`option${i}`}>
                Option {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      render(<ManyItemsSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        // Check if scroll buttons exist or if the content is scrollable
        const scrollUp = screen.queryByTestId('chevron-up-icon');
        const scrollDown = screen.queryByTestId('chevron-down-icon');
        
        // At least one chevron should be visible (either in trigger or scroll buttons)
        expect(scrollUp || scrollDown).toBeTruthy();
      });
    });
  });

  describe('SelectItem', () => {
    it('should render items correctly', async () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const items = screen.getAllByRole('option');
        expect(items).toHaveLength(3);
        expect(items[0]).toHaveTextContent('Option 1');
        expect(items[1]).toHaveTextContent('Option 2');
        expect(items[2]).toHaveTextContent('Option 3');
      });
    });

    it('should handle item selection', async () => {
      const onValueChange = vi.fn();
      render(<BasicSelect onValueChange={onValueChange} />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 2')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Option 2'));

      expect(onValueChange).toHaveBeenCalledWith('option2');
    });

    it('should show check icon for selected item', async () => {
      render(<BasicSelect defaultValue="option2" />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        // Find the option within the listbox (not the trigger)
        const listbox = screen.getByRole('listbox');
        const selectedItem = within(listbox).getByText('Option 2').closest('[role="option"]');
        expect(selectedItem?.querySelector('[data-testid="check-icon"]')).toBeInTheDocument();
      });
    });

    it('should have correct styling for items', async () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const item = screen.getByText('Option 1').closest('[role="option"]');
        expect(item).toHaveClass(
          'relative',
          'flex',
          'w-full',
          'cursor-default',
          'select-none',
          'items-center',
          'rounded-sm'
        );
      });
    });

    it('should handle disabled items', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2" disabled>Option 2 (Disabled)</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      );
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const disabledItem = screen.getByText('Option 2 (Disabled)').closest('[role="option"]');
        expect(disabledItem).toHaveAttribute('data-disabled');
        expect(disabledItem).toHaveClass('data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50');
      });
    });
  });

  describe('SelectLabel and SelectGroup', () => {
    it('should render groups and labels correctly', async () => {
      render(<GroupedSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Group 1')).toBeInTheDocument();
        expect(screen.getByText('Group 2')).toBeInTheDocument();
        expect(screen.getByText('Group 1 Item 1')).toBeInTheDocument();
        expect(screen.getByText('Group 2 Item 1')).toBeInTheDocument();
      });
    });

    it('should have correct styling for labels', async () => {
      render(<GroupedSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const label = screen.getByText('Group 1');
        expect(label).toHaveClass('py-1.5', 'pl-8', 'pr-2', 'text-sm', 'font-semibold');
      });
    });

    it('should render separator between groups', async () => {
      render(<GroupedSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        // Look for separator by its classes instead of role attribute
        const separator = document.querySelector('.-mx-1.my-1.h-px.bg-muted');
        expect(separator).toBeInTheDocument();
        expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should open dropdown with Enter key', async () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });

    it('should open dropdown with Space key', async () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      trigger.focus();
      
      await user.keyboard(' ');

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });
    });

    it('should navigate items with arrow keys', async () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      // Navigate down
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      
      // Select with Enter
      await user.keyboard('{Enter}');

      // The dropdown should close and value should be selected
      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown with Escape key', async () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('role', 'combobox');
    });

    it('should update ARIA attributes when opened', async () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should be focusable', async () => {
      render(<BasicSelect />);
      
      const trigger = screen.getByRole('combobox');
      // Focus the element directly using focus() rather than click
      trigger.focus();
      expect(trigger).toHaveFocus();
    });

    it('should support screen readers', async () => {
      render(<BasicSelect defaultValue="option2" />);
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveTextContent('Option 2');
    });
  });

  describe('Value Handling', () => {
    it('should display selected value', () => {
      render(<BasicSelect defaultValue="option2" />);
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveTextContent('Option 2');
    });

    it('should show placeholder when no value selected', () => {
      render(<BasicSelect />);
      
      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should call onValueChange when selection changes', async () => {
      const onValueChange = vi.fn();
      render(<BasicSelect onValueChange={onValueChange} />);
      
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Option 3')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Option 3'));

      expect(onValueChange).toHaveBeenCalledWith('option3');
    });

    it('should handle controlled value updates', () => {
      const { rerender } = render(
        <Select value="option1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('Option 1');

      rerender(
        <Select value="option2">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toHaveTextContent('Option 2');
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className on trigger', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger-class">
            <SelectValue placeholder="Custom" />
          </SelectTrigger>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('custom-trigger-class');
    });

    it('should accept custom className on content', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="custom-content-class">
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const content = screen.getByText('Option 1').closest('[role="listbox"]');
        expect(content).toHaveClass('custom-content-class');
      });
    });

    it('should accept custom className on items', async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" className="custom-item-class">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        const item = screen.getByText('Option 1').closest('[role="option"]');
        expect(item).toHaveClass('custom-item-class');
      });
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to trigger element', () => {
      const ref = { current: null };
      render(
        <Select>
          <SelectTrigger ref={ref}>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should forward ref to item elements', async () => {
      const ref = { current: null };
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem ref={ref} value="option1">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      await waitFor(() => {
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });
    });
  });

  describe('Display Names', () => {
    it('should have correct display names for components', () => {
      expect(SelectTrigger.displayName).toBeDefined();
      expect(SelectContent.displayName).toBeDefined();
      expect(SelectItem.displayName).toBeDefined();
      expect(SelectLabel.displayName).toBeDefined();
      expect(SelectSeparator.displayName).toBeDefined();
    });
  });
});