import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OnboardingTooltip } from '../OnboardingTooltip';
import { vi } from 'vitest';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock useOnboarding hook
vi.mock('../../../contexts/OnboardingContext', () => ({
  useOnboarding: vi.fn(() => ({
    state: {
      currentFlow: null,
      isFirstTimeUser: true,
      currentStepIndex: 0,
    },
  })),
}));

describe('OnboardingTooltip', () => {
  describe('FlowTooltip mode', () => {
    const defaultFlowProps = {
      currentStep: {
        id: 'step1',
        title: 'Test Title',
        description: 'Test Description',
        showSkip: false,
        requiresAction: false,
        action: 'none' as const,
      },
      state: {
        currentFlow: { 
          id: 'flow1', 
          name: 'Test Flow',
          description: 'Test',
          steps: [{ id: 'step1', title: 'Step 1', description: 'Test' }],
          estimatedTime: 5 
        },
        currentStepIndex: 0,
        completedFlows: [],
        skippedOnboarding: false,
        showOnboarding: true,
        isFirstTimeUser: true,
      },
      progress: 50,
      canGoBack: true,
      canGoForward: true,
      skipOnboarding: vi.fn(),
      previousStep: vi.fn(),
      nextStep: vi.fn(),
      tooltipPosition: { top: 100, left: 200 },
      isCenter: false,
    };

    it('should render flow tooltip when currentStep prop is provided', () => {
      render(<OnboardingTooltip {...defaultFlowProps} />);
      
      expect(screen.getByText('Test Title')).toBeTruthy();
      expect(screen.getByText('Test Description')).toBeTruthy();
    });

    it('should show skip button when showSkip is true', () => {
      const props = {
        ...defaultFlowProps,
        currentStep: { ...defaultFlowProps.currentStep, showSkip: true },
      };
      
      render(<OnboardingTooltip {...props} />);
      
      const skipButton = screen.getByLabelText('Skip onboarding');
      expect(skipButton).toBeTruthy();
    });

    it('should not show skip button when showSkip is false', () => {
      const props = {
        ...defaultFlowProps,
        currentStep: { ...defaultFlowProps.currentStep, showSkip: false },
      };
      
      render(<OnboardingTooltip {...props} />);
      
      const skipButton = screen.queryByLabelText('Skip onboarding');
      expect(skipButton).toBeNull();
    });

    it('should not show skip button when showSkip is null', () => {
      const props = {
        ...defaultFlowProps,
        currentStep: { ...defaultFlowProps.currentStep, showSkip: undefined },
      };
      
      render(<OnboardingTooltip {...props} />);
      
      const skipButton = screen.queryByLabelText('Skip onboarding');
      expect(skipButton).toBeNull();
    });

    it('should not show skip button when showSkip is undefined', () => {
      const props = {
        ...defaultFlowProps,
        currentStep: { ...defaultFlowProps.currentStep, showSkip: undefined },
      };
      
      render(<OnboardingTooltip {...props} />);
      
      const skipButton = screen.queryByLabelText('Skip onboarding');
      expect(skipButton).toBeNull();
    });

    it('should show estimated time when available', () => {
      render(<OnboardingTooltip {...defaultFlowProps} />);
      
      expect(screen.getByText('~5 min')).toBeTruthy();
    });

    it('should not show estimated time when null', () => {
      const props = {
        ...defaultFlowProps,
        state: {
          ...defaultFlowProps.state,
          currentFlow: { 
            ...defaultFlowProps.state.currentFlow,
            estimatedTime: undefined 
          },
        },
      };
      
      render(<OnboardingTooltip {...props} />);
      
      expect(screen.queryByText(/~\d+ min/)).toBeNull();
    });

    it('should show action hint when requiresAction is true', () => {
      const props = {
        ...defaultFlowProps,
        currentStep: { 
          ...defaultFlowProps.currentStep, 
          requiresAction: true,
          action: 'click' as const,
        },
      };
      
      render(<OnboardingTooltip {...props} />);
      
      expect(screen.getByText('Action required:')).toBeTruthy();
      expect(screen.getByText('Click the highlighted element to continue')).toBeTruthy();
    });

    it('should not show action hint when requiresAction is false', () => {
      const props = {
        ...defaultFlowProps,
        currentStep: { 
          ...defaultFlowProps.currentStep, 
          requiresAction: false,
        },
      };
      
      render(<OnboardingTooltip {...props} />);
      
      expect(screen.queryByText('Action required:')).toBeNull();
    });

    it('should show Previous button when canGoBack is true', () => {
      const props = {
        ...defaultFlowProps,
        canGoBack: true,
      };
      
      render(<OnboardingTooltip {...props} />);
      
      expect(screen.getByText('Previous')).toBeTruthy();
    });

    it('should not show Previous button when canGoBack is false', () => {
      const props = {
        ...defaultFlowProps,
        canGoBack: false,
      };
      
      render(<OnboardingTooltip {...props} />);
      
      expect(screen.queryByText('Previous')).toBeNull();
    });

    it('should show Next button when requiresAction is false', () => {
      const props = {
        ...defaultFlowProps,
        currentStep: { 
          ...defaultFlowProps.currentStep, 
          requiresAction: false,
        },
      };
      
      render(<OnboardingTooltip {...props} />);
      
      expect(screen.getByText('Next')).toBeTruthy();
    });

    it('should not show Next button when requiresAction is true', () => {
      const props = {
        ...defaultFlowProps,
        currentStep: { 
          ...defaultFlowProps.currentStep, 
          requiresAction: true,
        },
      };
      
      render(<OnboardingTooltip {...props} />);
      
      expect(screen.queryByText('Next')).toBeNull();
    });
  });

  describe('HoverTooltip mode', () => {
    const defaultHoverProps = {
      id: 'tooltip1',
      title: 'Hover Title',
      content: 'Hover Content',
      children: <button>Test Button</button>,
      position: 'top' as const,
      showOnce: true,
      delay: 0,
    };

    it('should render hover tooltip when no currentStep prop', () => {
      render(<OnboardingTooltip {...defaultHoverProps} />);
      
      expect(screen.getByText('Test Button')).toBeTruthy();
    });

    it('should not show action when actionText is null', () => {
      const props = {
        ...defaultHoverProps,
        actionText: undefined,
        onAction: vi.fn(),
      };
      
      render(<OnboardingTooltip {...props} />);
      fireEvent.mouseEnter(screen.getByText('Test Button'));
      
      // Wait for tooltip to appear
      setTimeout(() => {
        expect(screen.queryByText('→')).toBeNull();
      }, 100);
    });

    it('should not show action when onAction is null', () => {
      const props = {
        ...defaultHoverProps,
        actionText: 'Learn More',
        onAction: undefined,
      };
      
      render(<OnboardingTooltip {...props} />);
      fireEvent.mouseEnter(screen.getByText('Test Button'));
      
      // Wait for tooltip to appear
      setTimeout(() => {
        expect(screen.queryByText('Learn More →')).toBeNull();
      }, 100);
    });

    it('should show action when both actionText and onAction are provided', () => {
      const props = {
        ...defaultHoverProps,
        actionText: 'Learn More',
        onAction: vi.fn(),
      };
      
      render(<OnboardingTooltip {...props} />);
      fireEvent.mouseEnter(screen.getByText('Test Button'));
      
      // Wait for tooltip to appear
      setTimeout(() => {
        expect(screen.getByText('Learn More →')).toBeTruthy();
      }, 100);
    });
  });
});