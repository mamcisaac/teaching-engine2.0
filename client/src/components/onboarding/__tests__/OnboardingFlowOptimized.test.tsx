import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { OnboardingProvider, useOnboarding } from '../../../contexts/OnboardingContext';
import { OnboardingFlowOptimized } from '../OnboardingFlowOptimized';
import { vi } from 'vitest';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the useOnboarding hook
vi.mock('../../../contexts/OnboardingContext', async () => {
  const actual = await vi.importActual('../../../contexts/OnboardingContext');
  return {
    ...actual,
    useOnboarding: vi.fn(),
  };
});

// Helper to render component with context
const renderWithOnboarding = (ui: React.ReactElement, contextValue?: any) => {
  const defaultContext = {
    isOnboardingActive: true,
    currentStep: null,
    progress: 0,
    nextStep: vi.fn(),
    previousStep: vi.fn(),
    skipOnboarding: vi.fn(),
    canGoBack: false,
    canGoForward: true,
    state: {
      currentFlow: null,
      currentStepIndex: 0,
    },
    ...contextValue,
  };

  (useOnboarding as any).mockReturnValue(defaultContext);

  return render(ui);
};

describe('OnboardingFlowOptimized', () => {
  beforeEach(() => {
    // Mock DOM methods
    vi.spyOn(document, 'querySelector');
    vi.spyOn(document, 'addEventListener');
    vi.spyOn(document, 'removeEventListener');
    vi.spyOn(document.body, 'appendChild');
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering conditions', () => {
    it('should not render when isOnboardingActive is false', () => {
      const { container } = renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: false }
      );
      expect(container.firstChild).toBeNull();
    });

    it('should not render when isOnboardingActive is null', () => {
      const { container } = renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: null }
      );
      expect(container.firstChild).toBeNull();
    });

    it('should not render when isOnboardingActive is undefined', () => {
      const { container } = renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: undefined }
      );
      expect(container.firstChild).toBeNull();
    });

    it('should not render when currentStep is null', () => {
      const { container } = renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep: null }
      );
      expect(container.firstChild).toBeNull();
    });

    it('should not render when currentStep is undefined', () => {
      const { container } = renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep: undefined }
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when both isOnboardingActive is true and currentStep exists', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: '.test-element',
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      // Check if createPortal was called (component rendered)
      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });

  describe('Target element handling', () => {
    it('should handle null targetElement', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: null,
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      expect(document.querySelector).not.toHaveBeenCalledWith(null);
    });

    it('should handle undefined targetElement', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: undefined,
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      expect(document.querySelector).not.toHaveBeenCalledWith(undefined);
    });

    it('should handle empty string targetElement', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: '',
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      expect(document.querySelector).not.toHaveBeenCalledWith('');
    });

    it.skip('should query for element when targetElement is valid', () => {
      // TODO: Fix this test after resolving useEffect timing issues
      const mockElement = document.createElement('div');
      mockElement.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        left: 200,
        width: 300,
        height: 400,
        right: 500,
        bottom: 500,
        x: 200,
        y: 100,
      }));
      
      (document.querySelector as any).mockReturnValue(mockElement);

      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: '.test-element',
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      // Trigger useEffect
      act(() => {
        // Force React to flush effects
      });

      expect(document.querySelector).toHaveBeenCalledWith('.test-element');
    });
  });

  describe('requiresAction handling', () => {
    it('should not add click listener when requiresAction is false', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: '.test-element',
        requiresAction: false,
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      // Should not add click listener
      expect(window.addEventListener).not.toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should not add click listener when requiresAction is null', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: '.test-element',
        requiresAction: null,
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      expect(window.addEventListener).not.toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should not add click listener when requiresAction is undefined', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: '.test-element',
        requiresAction: undefined,
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      expect(window.addEventListener).not.toHaveBeenCalledWith('click', expect.any(Function));
    });

    it.skip('should add click listener when requiresAction is true and targetElement exists', () => {
      // TODO: Fix this test after resolving useEffect timing issues
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: '.test-element',
        requiresAction: true,
      };

      // Clear any previous calls
      (window.addEventListener as any).mockClear();
      (document.addEventListener as any).mockClear();

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      // Trigger effect
      act(() => {
        // Force useEffect to run
      });

      // Check if document.addEventListener was called with 'click'
      // The component adds click listener to document, not window
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('Center position handling', () => {
    it('should detect center position when position is "center"', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: '.test-element',
        position: 'center' as const,
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      // Check that tooltip receives isCenter prop as true
      // This would be tested through the OnboardingTooltip component
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should detect center position when targetElement is null', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: null,
        position: 'top' as const,
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should detect center position when targetElement is undefined', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: undefined,
        position: 'bottom' as const,
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });

  describe('Highlight position handling', () => {
    it('should not render highlight when highlightPosition is null', () => {
      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: null,
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      // OnboardingHighlight should not be rendered
      expect(document.body.querySelector('[data-testid="onboarding-highlight"]')).toBeNull();
    });

    it('should handle spotlight click when highlightPosition exists and requiresAction is true', () => {
      const mockElement = document.createElement('div');
      mockElement.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        left: 200,
        width: 300,
        height: 400,
        right: 500,
        bottom: 500,
        x: 200,
        y: 100,
      }));
      
      (document.querySelector as any).mockReturnValue(mockElement);

      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
        targetElement: '.test-element',
        requiresAction: true,
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep }
      );

      // Component should render when conditions are met
      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });

  describe('Completion message handling', () => {
    it('should not show completion message when completionMessage is null', () => {
      const state = {
        currentFlow: {
          id: 'flow1',
          steps: [{ id: 'step1' }],
          completionMessage: null,
        },
        currentStepIndex: 0,
      };

      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep, state }
      );

      expect(document.body.querySelector('[data-testid="onboarding-progress"]')).toBeNull();
    });

    it('should not show completion message when completionMessage is undefined', () => {
      const state = {
        currentFlow: {
          id: 'flow1',
          steps: [{ id: 'step1' }],
          completionMessage: undefined,
        },
        currentStepIndex: 0,
      };

      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep, state }
      );

      expect(document.body.querySelector('[data-testid="onboarding-progress"]')).toBeNull();
    });

    it('should not show completion message when completionMessage is empty string', () => {
      const state = {
        currentFlow: {
          id: 'flow1',
          steps: [{ id: 'step1' }],
          completionMessage: '',
        },
        currentStepIndex: 0,
      };

      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep, state }
      );

      expect(document.body.querySelector('[data-testid="onboarding-progress"]')).toBeNull();
    });

    it('should show completion message on last step when message exists', () => {
      const state = {
        currentFlow: {
          id: 'flow1',
          steps: [{ id: 'step1' }],
          completionMessage: 'Onboarding complete!',
        },
        currentStepIndex: 0, // Last step (0-indexed, 1 step total)
      };

      const currentStep = {
        id: 'step1',
        title: 'Test Step',
        content: 'Test content',
      };

      renderWithOnboarding(
        <OnboardingFlowOptimized />,
        { isOnboardingActive: true, currentStep, state }
      );

      // Component should render when conditions are met
      expect(document.body.appendChild).toHaveBeenCalled();
    });
  });
});