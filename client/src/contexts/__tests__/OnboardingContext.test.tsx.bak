/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file OnboardingContext.test.tsx
 * @description Comprehensive tests for OnboardingContext including onboarding flows,
 * step navigation, localStorage persistence, and tutorial management.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import {
  OnboardingProvider,
  useOnboarding,
  useOnboardingComplete,
  TUTORIAL_FLOWS,
} from '../OnboardingContext';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test wrapper
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <OnboardingProvider>{children}</OnboardingProvider>
  );
};

describe('OnboardingContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Provider initialization', () => {
    it('should provide onboarding context', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('state');
      expect(result.current).toHaveProperty('startOnboarding');
      expect(result.current).toHaveProperty('nextStep');
      expect(result.current).toHaveProperty('previousStep');
      expect(result.current).toHaveProperty('skipOnboarding');
      expect(result.current).toHaveProperty('completeOnboarding');
      expect(result.current).toHaveProperty('resetOnboarding');
      expect(result.current).toHaveProperty('isOnboardingActive');
      expect(result.current).toHaveProperty('currentStep');
      expect(result.current).toHaveProperty('progress');
      expect(result.current).toHaveProperty('canGoBack');
      expect(result.current).toHaveProperty('canGoForward');
    });

    it('should initialize with default state for first-time user', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce('true') // FIRST_TIME_KEY returns 'true' (not 'false')
        .mockReturnValueOnce(null); // ONBOARDING_KEY returns null

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.isFirstTimeUser).toBe(true);
      expect(result.current.state.showOnboarding).toBe(true);
      expect(result.current.state.skippedOnboarding).toBe(false);
      expect(result.current.state.completedFlows).toEqual([]);
    });

    it('should initialize with returning user state', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce('false') // FIRST_TIME_KEY
        .mockReturnValueOnce(
          JSON.stringify({
            completedFlows: ['main-onboarding'],
            skippedOnboarding: false,
          }),
        ); // ONBOARDING_KEY

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.isFirstTimeUser).toBe(false);
      expect(result.current.state.showOnboarding).toBe(false);
      expect(result.current.state.completedFlows).toEqual(['main-onboarding']);
    });

    it('should auto-start main onboarding for first-time users', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isOnboardingActive).toBe(true);
        expect(result.current.state.currentFlow?.id).toBe('main-onboarding');
      });
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => {
        renderHook(() => useOnboarding(), {
          wrapper: createWrapper(),
        });
      }).not.toThrow();
    });
  });

  describe('Flow management', () => {
    it('should start specified onboarding flow', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('lesson-planning');
      });

      expect(result.current.state.currentFlow?.id).toBe('lesson-planning');
      expect(result.current.state.currentStepIndex).toBe(0);
      expect(result.current.isOnboardingActive).toBe(true);
    });

    it('should default to main onboarding when no flow specified', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding();
      });

      expect(result.current.state.currentFlow?.id).toBe('main-onboarding');
    });

    it('should handle invalid flow IDs gracefully', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('invalid-flow');
      });

      expect(result.current.state.currentFlow).toBeNull();
      expect(result.current.isOnboardingActive).toBe(false);
    });
  });

  describe('Step navigation', () => {
    it('should navigate to next step', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
      });

      const initialStep = result.current.state.currentStepIndex;

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.state.currentStepIndex).toBe(initialStep + 1);
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
        result.current.nextStep();
        result.current.nextStep();
      });

      const currentStep = result.current.state.currentStepIndex;

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.state.currentStepIndex).toBe(currentStep - 1);
    });

    it('should not go to previous step when at first step', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
      });

      expect(result.current.state.currentStepIndex).toBe(0);

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.state.currentStepIndex).toBe(0);
    });

    it('should complete onboarding when reaching last step', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
      });

      const totalSteps = result.current.state.currentFlow!.steps.length;

      // Navigate to last step
      act(() => {
        for (let i = 0; i < totalSteps - 1; i++) {
          result.current.nextStep();
        }
      });

      expect(result.current.state.currentStepIndex).toBe(totalSteps - 1);

      // Next step should complete onboarding
      act(() => {
        result.current.nextStep();
      });

      expect(result.current.isOnboardingActive).toBe(false);
      expect(result.current.state.completedFlows).toContain('main-onboarding');
    });
  });

  describe('Progress tracking', () => {
    it('should calculate progress correctly', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
      });

      const totalSteps = result.current.state.currentFlow!.steps.length;
      expect(result.current.progress).toBe((1 / totalSteps) * 100);

      act(() => {
        result.current.nextStep();
      });

      expect(result.current.progress).toBe((2 / totalSteps) * 100);
    });

    it('should return 0 progress when no flow active', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.progress).toBe(0);
    });

    it('should track canGoBack and canGoForward correctly', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
      });

      // At first step
      expect(result.current.canGoBack).toBe(false);
      expect(result.current.canGoForward).toBe(true);

      // Move to middle step
      act(() => {
        result.current.nextStep();
      });

      expect(result.current.canGoBack).toBe(true);
      expect(result.current.canGoForward).toBe(true);

      // Move to last step
      const totalSteps = result.current.state.currentFlow!.steps.length;
      act(() => {
        for (let i = result.current.state.currentStepIndex; i < totalSteps - 1; i++) {
          result.current.nextStep();
        }
      });

      expect(result.current.canGoBack).toBe(true);
      expect(result.current.canGoForward).toBe(false);
    });
  });

  describe('Skip and complete functionality', () => {
    it('should skip onboarding', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
      });

      expect(result.current.isOnboardingActive).toBe(true);

      act(() => {
        result.current.skipOnboarding();
      });

      expect(result.current.isOnboardingActive).toBe(false);
      expect(result.current.state.skippedOnboarding).toBe(true);
      expect(result.current.state.isFirstTimeUser).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'teachingEngine_firstTimeUser',
        'false',
      );
    });

    it('should complete onboarding', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('lesson-planning');
      });

      expect(result.current.isOnboardingActive).toBe(true);

      act(() => {
        result.current.completeOnboarding();
      });

      expect(result.current.isOnboardingActive).toBe(false);
      expect(result.current.state.completedFlows).toContain('lesson-planning');
      expect(result.current.state.isFirstTimeUser).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'teachingEngine_firstTimeUser',
        'false',
      );
    });

    it('should reset onboarding', () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({
          completedFlows: ['main-onboarding'],
          skippedOnboarding: true,
        }),
      );

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.resetOnboarding();
      });

      expect(result.current.state.isFirstTimeUser).toBe(true);
      expect(result.current.state.completedFlows).toEqual([]);
      expect(result.current.state.skippedOnboarding).toBe(false);
      expect(result.current.state.showOnboarding).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('teachingEngine_onboarding');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('teachingEngine_firstTimeUser');
    });
  });

  describe('Current step handling', () => {
    it('should return current step when flow is active', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
      });

      expect(result.current.currentStep).toBeTruthy();
      expect(result.current.currentStep?.id).toBe('welcome');
    });

    it('should return null when no flow is active', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.currentStep).toBeNull();
    });

    it('should update current step on navigation', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
      });

      const firstStep = result.current.currentStep;

      act(() => {
        result.current.nextStep();
      });

      const secondStep = result.current.currentStep;

      expect(firstStep?.id).not.toBe(secondStep?.id);
    });
  });

  describe('localStorage persistence', () => {
    it('should save state to localStorage', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
        result.current.completeOnboarding();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'teachingEngine_onboarding',
        expect.stringContaining('main-onboarding'),
      );
    });

    it('should load state from localStorage on mount', () => {
      const savedState = {
        completedFlows: ['main-onboarding', 'lesson-planning'],
        skippedOnboarding: false,
      };

      mockLocalStorage.getItem
        .mockReturnValueOnce('false') // FIRST_TIME_KEY
        .mockReturnValueOnce(JSON.stringify(savedState)); // ONBOARDING_KEY

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.completedFlows).toEqual(['main-onboarding', 'lesson-planning']);
      expect(result.current.state.skippedOnboarding).toBe(false);
    });

    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('false').mockReturnValueOnce('invalid-json');

      expect(() => {
        renderHook(() => useOnboarding(), {
          wrapper: createWrapper(),
        });
      }).not.toThrow();
    });
  });

  describe('useOnboardingComplete hook', () => {
    it('should return true for completed flows', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('false').mockReturnValueOnce(
        JSON.stringify({
          completedFlows: ['main-onboarding'],
          skippedOnboarding: false,
        }),
      );

      const { result } = renderHook(
        () => {
          return {
            onboarding: useOnboarding(),
            isMainComplete: useOnboardingComplete('main-onboarding'),
            isLessonComplete: useOnboardingComplete('lesson-planning'),
          };
        },
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.isMainComplete).toBe(true);
      expect(result.current.isLessonComplete).toBe(false);
    });

    it('should return false for non-completed flows', () => {
      const { result } = renderHook(() => useOnboardingComplete('main-onboarding'), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle localStorage setItem errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(() => {
        act(() => {
          result.current.startOnboarding('main-onboarding');
          result.current.completeOnboarding();
        });
      }).not.toThrow();
    });

    it('should handle multiple rapid state changes', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startOnboarding('main-onboarding');
        result.current.nextStep();
        result.current.previousStep();
        result.current.nextStep();
        result.current.skipOnboarding();
      });

      expect(result.current.state.skippedOnboarding).toBe(true);
      expect(result.current.isOnboardingActive).toBe(false);
    });

    it('should handle nextStep when no flow is active', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(() => {
        act(() => {
          result.current.nextStep();
        });
      }).not.toThrow();
    });

    it('should handle completeOnboarding when no flow is active', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(() => {
        act(() => {
          result.current.completeOnboarding();
        });
      }).not.toThrow();
    });
  });

  describe('Tutorial flows', () => {
    it('should have valid tutorial flows', () => {
      expect(TUTORIAL_FLOWS['main-onboarding']).toBeDefined();
      expect(TUTORIAL_FLOWS['lesson-planning']).toBeDefined();
      expect(TUTORIAL_FLOWS['weekly-planning']).toBeDefined();
    });

    it('should support different tutorial flows', () => {
      const { result } = renderHook(() => useOnboarding(), {
        wrapper: createWrapper(),
      });

      // Test lesson planning flow
      act(() => {
        result.current.startOnboarding('lesson-planning');
      });

      expect(result.current.state.currentFlow?.id).toBe('lesson-planning');
      expect(result.current.state.currentFlow?.name).toBe('Creating a Lesson Plan');

      // Test weekly planning flow
      act(() => {
        result.current.startOnboarding('weekly-planning');
      });

      expect(result.current.state.currentFlow?.id).toBe('weekly-planning');
      expect(result.current.state.currentFlow?.name).toBe('Weekly Planning View');
    });
  });

  describe('Hook error handling', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useOnboarding());
      }).toThrow('useOnboarding must be used within OnboardingProvider');
    });

    it('should throw error for useOnboardingComplete when used outside provider', () => {
      expect(() => {
        renderHook(() => useOnboardingComplete('main-onboarding'));
      }).toThrow('useOnboarding must be used within OnboardingProvider');
    });
  });
});
