import { render } from '@testing-library/react';
import React from 'react';
import { OnboardingHighlight } from '../OnboardingHighlight';
import { vi } from 'vitest';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('OnboardingHighlight', () => {
  describe('Rendering conditions', () => {
    it('should not render when highlightPosition is null', () => {
      const { container } = render(
        <OnboardingHighlight highlightPosition={null} />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should render when highlightPosition is provided', () => {
      const highlightPosition = {
        top: 100,
        left: 200,
        width: 300,
        height: 400,
      };
      
      const { container } = render(
        <OnboardingHighlight highlightPosition={highlightPosition} />
      );
      
      const highlight = container.firstChild as HTMLElement;
      expect(highlight).toBeTruthy();
      expect(highlight.style.top).toBe('100px');
      expect(highlight.style.left).toBe('200px');
      expect(highlight.style.width).toBe('300px');
      expect(highlight.style.height).toBe('400px');
    });
  });

  describe('Click handling', () => {
    it('should call onClick when provided and clicked', () => {
      const onClick = vi.fn();
      const highlightPosition = {
        top: 100,
        left: 200,
        width: 300,
        height: 400,
      };
      
      const { container } = render(
        <OnboardingHighlight 
          highlightPosition={highlightPosition} 
          onClick={onClick}
        />
      );
      
      const highlight = container.firstChild as HTMLElement;
      highlight.click();
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle click without onClick handler', () => {
      const highlightPosition = {
        top: 100,
        left: 200,
        width: 300,
        height: 400,
      };
      
      const { container } = render(
        <OnboardingHighlight highlightPosition={highlightPosition} />
      );
      
      const highlight = container.firstChild as HTMLElement;
      
      // Should not throw error when clicked without handler
      expect(() => highlight.click()).not.toThrow();
    });
  });
});