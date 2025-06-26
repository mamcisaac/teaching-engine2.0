/**
 * @file Button.test.tsx
 * @description Comprehensive tests for Button component including variants, sizes,
 * states, accessibility, and interaction behaviors.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button, buttonVariants } from '../Button';
import { render, setupTest } from '@/test-utils';

describe('Button', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    setupTest();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-md',
        'transition-colors',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2'
      );
    });

    it('should render children correctly', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('should render with complex children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700', 'focus:ring-blue-500');
    });

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200', 'text-gray-900', 'hover:bg-gray-300', 'focus:ring-gray-500');
    });

    it('should render danger variant', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white', 'hover:bg-red-700', 'focus:ring-red-500');
    });

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'text-gray-700', 'hover:bg-gray-100', 'focus:ring-gray-500');
    });

    it('should render outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-gray-300', 'bg-white', 'text-gray-700', 'hover:bg-gray-50', 'focus:ring-blue-500');
    });
  });

  describe('Sizes', () => {
    it('should render medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base');
    });

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should show loading state', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Loading Button')).not.toBeInTheDocument();
      
      // Check for loading spinner
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should be disabled when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when both disabled and loading', () => {
      render(<Button disabled loading>Both</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Full Width', () => {
    it('should render full width when fullWidth prop is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('should not render full width by default', () => {
      render(<Button>Normal Width</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Custom Styling', () => {
    it('should accept custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      render(<Button className="custom-class" variant="primary">Custom Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class', 'bg-blue-600', 'text-white');
    });
  });

  describe('Event Handling', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not handle click events when disabled', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not handle click events when loading', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} loading>Loading</Button>);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle multiple event types', async () => {
      const handleClick = vi.fn();
      const handleMouseEnter = vi.fn();
      const handleMouseLeave = vi.fn();
      
      render(
        <Button 
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Event Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      
      await user.hover(button);
      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
      
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await user.unhover(button);
      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  describe('HTML Attributes', () => {
    it('should accept HTML button attributes', () => {
      render(
        <Button 
          type="submit" 
          form="test-form"
          name="test-button"
          value="test-value"
          aria-label="Test button"
          data-testid="test-button"
        >
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('name', 'test-button');
      expect(button).toHaveAttribute('value', 'test-value');
      expect(button).toHaveAttribute('aria-label', 'Test button');
      expect(button).toHaveAttribute('data-testid', 'test-button');
    });

    it('should accept tabIndex attribute', () => {
      render(<Button tabIndex={0}>Focusable</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable by default', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('tabIndex', '-1'); // Should be focusable (no negative tabIndex)
    });

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should have proper focus styles', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
    });

    it('should handle keyboard navigation', async () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard Test</Button>);
      
      const button = screen.getByRole('button');
      
      // Focus the button
      button.focus();
      expect(button).toHaveFocus();
      
      // Activate with Enter key
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Activate with Space key
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should support ARIA attributes', () => {
      render(
        <Button 
          aria-describedby="help-text"
          aria-pressed="false"
          role="button"
        >
          ARIA Button
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('role', 'button');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to button element', () => {
      const ref = { current: null };
      render(<Button ref={ref}>Ref Test</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should allow ref-based operations', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Operations</Button>);
      
      expect(ref.current).not.toBeNull();
      if (ref.current) {
        expect(ref.current.tagName).toBe('BUTTON');
        expect(ref.current.textContent).toBe('Ref Operations');
      }
    });
  });

  describe('Variant Combinations', () => {
    it('should combine variant and size correctly', () => {
      render(<Button variant="danger" size="lg">Large Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white', 'px-6', 'py-3', 'text-lg');
    });

    it('should combine all props correctly', () => {
      render(
        <Button 
          variant="outline" 
          size="sm" 
          fullWidth 
          className="extra-class"
        >
          Combined
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'border',
        'border-gray-300',
        'bg-white',
        'text-gray-700',
        'px-3',
        'py-1.5',
        'text-sm',
        'w-full',
        'extra-class'
      );
    });
  });

  describe('Loading Spinner', () => {
    it('should show loading spinner with correct classes', () => {
      render(<Button loading>Loading</Button>);
      
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin', '-ml-1', 'mr-2', 'h-4', 'w-4');
    });

    it('should have proper SVG structure for loading spinner', () => {
      render(<Button loading>Loading</Button>);
      
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
      expect(spinner).toHaveAttribute('fill', 'none');
      expect(spinner).toHaveAttribute('viewBox', '0 0 24 24');
      
      const circle = spinner?.querySelector('circle');
      const path = spinner?.querySelector('path');
      
      expect(circle).toBeInTheDocument();
      expect(path).toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('should have correct display name', () => {
      expect(Button.displayName).toBe('Button');
    });
  });
});

describe('buttonVariants', () => {
  it('should return default classes when no props provided', () => {
    const classes = buttonVariants();
    expect(classes).toContain('inline-flex');
    expect(classes).toContain('bg-blue-600'); // primary variant
    expect(classes).toContain('px-4'); // medium size
  });

  it('should return correct classes for variant', () => {
    const classes = buttonVariants({ variant: 'danger' });
    expect(classes).toContain('bg-red-600');
    expect(classes).toContain('text-white');
    expect(classes).toContain('hover:bg-red-700');
  });

  it('should return correct classes for size', () => {
    const classes = buttonVariants({ size: 'lg' });
    expect(classes).toContain('px-6');
    expect(classes).toContain('py-3');
    expect(classes).toContain('text-lg');
  });

  it('should return correct classes for variant and size combination', () => {
    const classes = buttonVariants({ variant: 'outline', size: 'sm' });
    expect(classes).toContain('border');
    expect(classes).toContain('border-gray-300');
    expect(classes).toContain('px-3');
    expect(classes).toContain('py-1.5');
    expect(classes).toContain('text-sm');
  });
});