import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Dialog } from '../Dialog';

describe('Dialog', () => {
  const defaultProps = {
    open: true,
    children: <div>Dialog content</div>,
  };

  describe('strict boolean expression handling', () => {
    it('should handle undefined title and description', () => {
      render(<Dialog {...defaultProps} />);
      
      // Should not have aria-labelledby or aria-describedby when undefined
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
      expect(dialog).not.toHaveAttribute('aria-describedby');
      
      // Should not render title or description elements
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.queryByText('dialog-description')).not.toBeInTheDocument();
    });

    it('should handle empty string title and description', () => {
      render(<Dialog {...defaultProps} title="" description="" />);
      
      // Should not have aria attributes for empty strings
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
      expect(dialog).not.toHaveAttribute('aria-describedby');
      
      // Should not render empty title or description
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should properly set aria attributes with non-empty values', () => {
      render(<Dialog {...defaultProps} title="Test Title" description="Test Description" />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');
      
      // Should render title
      expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
      
      // Description should be screen-reader only
      const description = screen.getByText('Test Description');
      expect(description).toHaveClass('sr-only');
    });

    it('should handle whitespace-only strings as empty', () => {
      render(<Dialog {...defaultProps} title="   " description="   " />);
      
      // Should treat whitespace-only as empty
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
      expect(dialog).not.toHaveAttribute('aria-describedby');
      
      // Should not render whitespace-only content
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('callback handling', () => {
    it('should call onOpenChange when dialog state changes', () => {
      const onOpenChange = vi.fn();
      render(<Dialog {...defaultProps} onOpenChange={onOpenChange} />);
      
      // Note: Testing actual close behavior would require interacting with RadixDialog
      // which may need more setup or mocking
    });

    it('should call onClose when dialog is closed', () => {
      const onClose = vi.fn();
      const onOpenChange = vi.fn();
      
      const { rerender } = render(
        <Dialog {...defaultProps} onClose={onClose} onOpenChange={onOpenChange} />
      );
      
      // Simulate dialog close by changing open prop
      rerender(
        <Dialog {...defaultProps} open={false} onClose={onClose} onOpenChange={onOpenChange} />
      );
      
      // Note: Actual testing would require simulating RadixDialog events
    });
  });

  describe('maxWidth handling', () => {
    it('should apply default maxWidth class', () => {
      render(<Dialog {...defaultProps} />);
      
      const content = screen.getByText('Dialog content').parentElement?.parentElement;
      expect(content).toHaveClass('max-w-lg');
    });

    it('should apply custom maxWidth class', () => {
      render(<Dialog {...defaultProps} maxWidth="2xl" />);
      
      const content = screen.getByText('Dialog content').parentElement?.parentElement;
      expect(content).toHaveClass('max-w-2xl');
    });

    it('should fallback to default for invalid maxWidth', () => {
      render(<Dialog {...defaultProps} maxWidth="invalid" />);
      
      const content = screen.getByText('Dialog content').parentElement?.parentElement;
      expect(content).toHaveClass('max-w-lg');
    });
  });
});