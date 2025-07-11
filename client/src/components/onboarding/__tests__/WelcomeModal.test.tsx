import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WelcomeModal } from '../WelcomeModal';
import { vi } from 'vitest';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock useOnboarding hook
const mockStartOnboarding = vi.fn();
const mockSkipOnboarding = vi.fn();

vi.mock('../../../contexts/OnboardingContext', () => ({
  useOnboarding: vi.fn(),
}));

import { useOnboarding } from '../../../contexts/OnboardingContext';

describe('WelcomeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering conditions', () => {
    it('should not render when isFirstTimeUser is false', () => {
      (useOnboarding as any).mockReturnValue({
        state: {
          isFirstTimeUser: false,
          skippedOnboarding: false,
          currentFlow: null,
        },
        startOnboarding: mockStartOnboarding,
        skipOnboarding: mockSkipOnboarding,
      });

      const { container } = render(<WelcomeModal />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when isFirstTimeUser is null', () => {
      (useOnboarding as any).mockReturnValue({
        state: {
          isFirstTimeUser: null,
          skippedOnboarding: false,
          currentFlow: null,
        },
        startOnboarding: mockStartOnboarding,
        skipOnboarding: mockSkipOnboarding,
      });

      const { container } = render(<WelcomeModal />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when isFirstTimeUser is undefined', () => {
      (useOnboarding as any).mockReturnValue({
        state: {
          isFirstTimeUser: undefined,
          skippedOnboarding: false,
          currentFlow: null,
        },
        startOnboarding: mockStartOnboarding,
        skipOnboarding: mockSkipOnboarding,
      });

      const { container } = render(<WelcomeModal />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when skippedOnboarding is true', () => {
      (useOnboarding as any).mockReturnValue({
        state: {
          isFirstTimeUser: true,
          skippedOnboarding: true,
          currentFlow: null,
        },
        startOnboarding: mockStartOnboarding,
        skipOnboarding: mockSkipOnboarding,
      });

      const { container } = render(<WelcomeModal />);
      expect(container.firstChild).toBeNull();
    });

    it('should not render when currentFlow exists', () => {
      (useOnboarding as any).mockReturnValue({
        state: {
          isFirstTimeUser: true,
          skippedOnboarding: false,
          currentFlow: { id: 'test-flow', name: 'Test', description: 'Test', steps: [] },
        },
        startOnboarding: mockStartOnboarding,
        skipOnboarding: mockSkipOnboarding,
      });

      const { container } = render(<WelcomeModal />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when isFirstTimeUser is true, skippedOnboarding is false, and currentFlow is null', () => {
      (useOnboarding as any).mockReturnValue({
        state: {
          isFirstTimeUser: true,
          skippedOnboarding: false,
          currentFlow: null,
        },
        startOnboarding: mockStartOnboarding,
        skipOnboarding: mockSkipOnboarding,
      });

      render(<WelcomeModal />);
      
      expect(screen.getByText('Welcome to Teaching Engine 2.0')).toBeTruthy();
      expect(screen.getByText('Your intelligent planning assistant for Grade 1 French Immersion')).toBeTruthy();
    });
  });

  describe('Feature display', () => {
    beforeEach(() => {
      (useOnboarding as any).mockReturnValue({
        state: {
          isFirstTimeUser: true,
          skippedOnboarding: false,
          currentFlow: null,
        },
        startOnboarding: mockStartOnboarding,
        skipOnboarding: mockSkipOnboarding,
      });
    });

    it('should display all three features', () => {
      render(<WelcomeModal />);
      
      expect(screen.getByText('Save 3+ hours per week')).toBeTruthy();
      expect(screen.getByText('ETFO-aligned planning')).toBeTruthy();
      expect(screen.getByText('French Immersion ready')).toBeTruthy();
    });

    it('should display feature descriptions', () => {
      render(<WelcomeModal />);
      
      expect(screen.getByText('Automated lesson planning and report generation')).toBeTruthy();
      expect(screen.getByText('Built specifically for Ontario teachers')).toBeTruthy();
      expect(screen.getByText('Bilingual templates and resources for Grade 1')).toBeTruthy();
    });
  });

  describe('User interactions', () => {
    beforeEach(() => {
      (useOnboarding as any).mockReturnValue({
        state: {
          isFirstTimeUser: true,
          skippedOnboarding: false,
          currentFlow: null,
        },
        startOnboarding: mockStartOnboarding,
        skipOnboarding: mockSkipOnboarding,
      });
    });

    it('should call startOnboarding with main-onboarding when tour button is clicked', () => {
      render(<WelcomeModal />);
      
      const tourButton = screen.getByText('Take the 5-minute tour');
      fireEvent.click(tourButton);
      
      expect(mockStartOnboarding).toHaveBeenCalledTimes(1);
      expect(mockStartOnboarding).toHaveBeenCalledWith('main-onboarding');
    });

    it('should call skipOnboarding when skip button is clicked', () => {
      render(<WelcomeModal />);
      
      const skipButton = screen.getByText("I'll explore on my own");
      fireEvent.click(skipButton);
      
      expect(mockSkipOnboarding).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content display', () => {
    beforeEach(() => {
      (useOnboarding as any).mockReturnValue({
        state: {
          isFirstTimeUser: true,
          skippedOnboarding: false,
          currentFlow: null,
        },
        startOnboarding: mockStartOnboarding,
        skipOnboarding: mockSkipOnboarding,
      });
    });

    it('should display welcome message', () => {
      render(<WelcomeModal />);
      
      expect(screen.getByText("Bonjour! Let's get you started")).toBeTruthy();
    });

    it('should display description text', () => {
      render(<WelcomeModal />);
      
      expect(screen.getByText(/Teaching Engine adapts to your Grade 1 French Immersion classroom/)).toBeTruthy();
    });

    it('should display trust indicator', () => {
      render(<WelcomeModal />);
      
      expect(screen.getByText(/Trusted by 500\+ PEI teachers/)).toBeTruthy();
    });
  });
});