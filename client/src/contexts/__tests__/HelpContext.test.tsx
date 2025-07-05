/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file HelpContext.test.tsx
 * @description Comprehensive tests for HelpContext including help state management,
 * tutorial progress tracking, search functionality, and localStorage persistence.
 */

import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { HelpProvider, useHelp, useTutorialProgress, useHelpAnalytics } from '../HelpContext';

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
  return ({ children }: { children: React.ReactNode }) => <HelpProvider>{children}</HelpProvider>;
};

describe('HelpContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Provider initialization', () => {
    it('should provide help context', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toHaveProperty('state');
      expect(result.current).toHaveProperty('setCurrentSection');
      expect(result.current).toHaveProperty('setSearchQuery');
      expect(result.current).toHaveProperty('addFilter');
      expect(result.current).toHaveProperty('removeFilter');
      expect(result.current).toHaveProperty('clearFilters');
      expect(result.current).toHaveProperty('startTutorial');
      expect(result.current).toHaveProperty('nextTutorialStep');
      expect(result.current).toHaveProperty('completeTutorial');
      expect(result.current).toHaveProperty('markHelpPageViewed');
      expect(result.current).toHaveProperty('toggleOnboarding');
      expect(result.current).toHaveProperty('toggleContextualHints');
    });

    it('should initialize with default state', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.currentSection).toBeNull();
      expect(result.current.state.searchQuery).toBe('');
      expect(result.current.state.activeFilters).toEqual([]);
      expect(result.current.state.tutorialProgress).toEqual({});
      expect(result.current.state.completedTutorials).toEqual([]);
      expect(result.current.state.showOnboarding).toBe(false);
      expect(result.current.state.contextualHints).toBe(true);
      expect(result.current.state.userProgress.helpPagesViewed).toEqual([]);
      expect(result.current.state.userProgress.tutorialsCompleted).toEqual([]);
      expect(result.current.state.userProgress.totalTimeSpent).toBe(0);
    });

    it('should load saved state from localStorage', () => {
      const savedState = {
        currentSection: 'getting-started',
        searchQuery: 'lesson plan',
        activeFilters: ['beginner'],
        completedTutorials: ['tutorial-1'],
        contextualHints: false,
        userProgress: {
          helpPagesViewed: ['page-1', 'page-2'],
          tutorialsCompleted: ['tutorial-1'],
          totalTimeSpent: 120,
          lastVisited: '2023-01-01T00:00:00.000Z',
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.currentSection).toBe('getting-started');
      expect(result.current.state.searchQuery).toBe('lesson plan');
      expect(result.current.state.activeFilters).toEqual(['beginner']);
      expect(result.current.state.completedTutorials).toEqual(['tutorial-1']);
      expect(result.current.state.contextualHints).toBe(false);
      expect(result.current.state.userProgress.helpPagesViewed).toEqual(['page-1', 'page-2']);
      expect(result.current.state.userProgress.lastVisited).toBeInstanceOf(Date);
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      // Should still initialize with default state
      expect(result.current.state.currentSection).toBeNull();
      expect(result.current.state.searchQuery).toBe('');
    });

    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      expect(() => {
        renderHook(() => useHelp(), {
          wrapper: createWrapper(),
        });
      }).not.toThrow();
    });
  });

  describe('Section management', () => {
    it('should set current section', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setCurrentSection('planning');
      });

      expect(result.current.state.currentSection).toBe('planning');
    });

    it('should clear current section', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setCurrentSection('planning');
        result.current.setCurrentSection(null);
      });

      expect(result.current.state.currentSection).toBeNull();
    });
  });

  describe('Search functionality', () => {
    it('should set search query', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearchQuery('lesson planning');
      });

      expect(result.current.state.searchQuery).toBe('lesson planning');
    });

    it('should clear search query', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setSearchQuery('test query');
        result.current.setSearchQuery('');
      });

      expect(result.current.state.searchQuery).toBe('');
    });
  });

  describe('Filter management', () => {
    it('should add filter', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.addFilter('beginner');
      });

      expect(result.current.state.activeFilters).toContain('beginner');
    });

    it('should add multiple filters', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.addFilter('beginner');
        result.current.addFilter('planning');
        result.current.addFilter('ai-features');
      });

      expect(result.current.state.activeFilters).toEqual(['beginner', 'planning', 'ai-features']);
    });

    it('should not add duplicate filters', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.addFilter('beginner');
        result.current.addFilter('beginner');
      });

      expect(result.current.state.activeFilters).toEqual(['beginner']);
    });

    it('should remove filter', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.addFilter('beginner');
        result.current.addFilter('planning');
        result.current.removeFilter('beginner');
      });

      expect(result.current.state.activeFilters).toEqual(['planning']);
    });

    it('should handle removing non-existent filter', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.addFilter('beginner');
        result.current.removeFilter('non-existent');
      });

      expect(result.current.state.activeFilters).toEqual(['beginner']);
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.addFilter('beginner');
        result.current.addFilter('planning');
        result.current.addFilter('ai-features');
        result.current.clearFilters();
      });

      expect(result.current.state.activeFilters).toEqual([]);
    });
  });

  describe('Tutorial management', () => {
    it('should start tutorial', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startTutorial('tutorial-1');
      });

      expect(result.current.state.tutorialProgress['tutorial-1']).toBe(0);
    });

    it('should advance tutorial step', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startTutorial('tutorial-1');
        result.current.nextTutorialStep('tutorial-1');
      });

      expect(result.current.state.tutorialProgress['tutorial-1']).toBe(1);
    });

    it('should advance multiple steps', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startTutorial('tutorial-1');
        result.current.nextTutorialStep('tutorial-1');
        result.current.nextTutorialStep('tutorial-1');
        result.current.nextTutorialStep('tutorial-1');
      });

      expect(result.current.state.tutorialProgress['tutorial-1']).toBe(3);
    });

    it('should handle next step for non-started tutorial', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.nextTutorialStep('tutorial-1');
      });

      expect(result.current.state.tutorialProgress['tutorial-1']).toBe(1);
    });

    it('should complete tutorial', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startTutorial('tutorial-1');
        result.current.nextTutorialStep('tutorial-1');
        result.current.completeTutorial('tutorial-1');
      });

      expect(result.current.state.tutorialProgress['tutorial-1']).toBeUndefined();
      expect(result.current.state.completedTutorials).toContain('tutorial-1');
      expect(result.current.state.userProgress.tutorialsCompleted).toContain('tutorial-1');
    });

    it('should handle multiple tutorials', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.startTutorial('tutorial-1');
        result.current.startTutorial('tutorial-2');
        result.current.nextTutorialStep('tutorial-1');
        result.current.nextTutorialStep('tutorial-2');
        result.current.nextTutorialStep('tutorial-2');
      });

      expect(result.current.state.tutorialProgress['tutorial-1']).toBe(1);
      expect(result.current.state.tutorialProgress['tutorial-2']).toBe(2);
    });
  });

  describe('Help page tracking', () => {
    it('should mark help page as viewed', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.markHelpPageViewed('page-1');
      });

      expect(result.current.state.userProgress.helpPagesViewed).toContain('page-1');
      expect(result.current.state.userProgress.lastVisited).toBeInstanceOf(Date);
    });

    it('should not duplicate viewed pages', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.markHelpPageViewed('page-1');
        result.current.markHelpPageViewed('page-1');
      });

      expect(result.current.state.userProgress.helpPagesViewed).toEqual(['page-1']);
    });

    it('should track multiple viewed pages', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.markHelpPageViewed('page-1');
        result.current.markHelpPageViewed('page-2');
        result.current.markHelpPageViewed('page-3');
      });

      expect(result.current.state.userProgress.helpPagesViewed).toEqual([
        'page-1',
        'page-2',
        'page-3',
      ]);
    });
  });

  describe('Settings toggles', () => {
    it('should toggle onboarding', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.showOnboarding).toBe(false);

      act(() => {
        result.current.toggleOnboarding();
      });

      expect(result.current.state.showOnboarding).toBe(true);

      act(() => {
        result.current.toggleOnboarding();
      });

      expect(result.current.state.showOnboarding).toBe(false);
    });

    it('should toggle contextual hints', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.contextualHints).toBe(true);

      act(() => {
        result.current.toggleContextualHints();
      });

      expect(result.current.state.contextualHints).toBe(false);

      act(() => {
        result.current.toggleContextualHints();
      });

      expect(result.current.state.contextualHints).toBe(true);
    });
  });

  describe('localStorage persistence', () => {
    it('should save state to localStorage on changes', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setCurrentSection('planning');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'teachingEngine_helpState',
        expect.stringContaining('planning'),
      );
    });

    it('should handle localStorage setItem errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      expect(() => {
        act(() => {
          result.current.setCurrentSection('planning');
        });
      }).not.toThrow();
    });
  });

  describe('useTutorialProgress hook', () => {
    it('should return tutorial progress', () => {
      const { result } = renderHook(
        () => {
          const help = useHelp();
          const progress = useTutorialProgress('tutorial-1');
          return { help, progress };
        },
        {
          wrapper: createWrapper(),
        },
      );

      // Initially not started
      expect(result.current.progress.currentStep).toBe(0);
      expect(result.current.progress.isActive).toBe(false);
      expect(result.current.progress.isCompleted).toBe(false);

      // Start tutorial
      act(() => {
        result.current.help.startTutorial('tutorial-1');
      });

      expect(result.current.progress.currentStep).toBe(0);
      expect(result.current.progress.isActive).toBe(true);
      expect(result.current.progress.isCompleted).toBe(false);

      // Advance step
      act(() => {
        result.current.help.nextTutorialStep('tutorial-1');
      });

      expect(result.current.progress.currentStep).toBe(1);
      expect(result.current.progress.isActive).toBe(true);
      expect(result.current.progress.isCompleted).toBe(false);

      // Complete tutorial
      act(() => {
        result.current.help.completeTutorial('tutorial-1');
      });

      expect(result.current.progress.currentStep).toBe(0);
      expect(result.current.progress.isActive).toBe(false);
      expect(result.current.progress.isCompleted).toBe(true);
    });
  });

  describe('useHelpAnalytics hook', () => {
    it('should return analytics data', () => {
      const { result } = renderHook(
        () => {
          const help = useHelp();
          const analytics = useHelpAnalytics();
          return { help, analytics };
        },
        {
          wrapper: createWrapper(),
        },
      );

      // Initial analytics
      expect(result.current.analytics.totalPagesViewed).toBe(0);
      expect(result.current.analytics.totalTutorialsCompleted).toBe(0);
      expect(result.current.analytics.totalTimeSpent).toBe(0);
      expect(result.current.analytics.completionRate).toBe(0);

      // Add some activity
      act(() => {
        result.current.help.markHelpPageViewed('page-1');
        result.current.help.markHelpPageViewed('page-2');
        result.current.help.completeTutorial('tutorial-1');
      });

      expect(result.current.analytics.totalPagesViewed).toBe(2);
      expect(result.current.analytics.totalTutorialsCompleted).toBe(1);
      expect(result.current.analytics.completionRate).toBe(0.1); // 1/10
    });

    it('should track last visited date', () => {
      const { result } = renderHook(
        () => {
          const help = useHelp();
          const analytics = useHelpAnalytics();
          return { help, analytics };
        },
        {
          wrapper: createWrapper(),
        },
      );

      const beforeTime = new Date();

      act(() => {
        result.current.help.markHelpPageViewed('page-1');
      });

      const afterTime = new Date();

      expect(result.current.analytics.lastVisited.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(result.current.analytics.lastVisited.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });
  });

  describe('Hook error handling', () => {
    it('should throw error when useHelp used outside provider', () => {
      expect(() => {
        renderHook(() => useHelp());
      }).toThrow('useHelp must be used within a HelpProvider');
    });

    it('should throw error when useTutorialProgress used outside provider', () => {
      expect(() => {
        renderHook(() => useTutorialProgress('tutorial-1'));
      }).toThrow('useHelp must be used within a HelpProvider');
    });

    it('should throw error when useHelpAnalytics used outside provider', () => {
      expect(() => {
        renderHook(() => useHelpAnalytics());
      }).toThrow('useHelp must be used within a HelpProvider');
    });
  });

  describe('Complex interaction scenarios', () => {
    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setCurrentSection('planning');
        result.current.setSearchQuery('lesson');
        result.current.addFilter('beginner');
        result.current.addFilter('intermediate');
        result.current.startTutorial('tutorial-1');
        result.current.nextTutorialStep('tutorial-1');
        result.current.markHelpPageViewed('page-1');
        result.current.toggleContextualHints();
      });

      expect(result.current.state.currentSection).toBe('planning');
      expect(result.current.state.searchQuery).toBe('lesson');
      expect(result.current.state.activeFilters).toEqual(['beginner', 'intermediate']);
      expect(result.current.state.tutorialProgress['tutorial-1']).toBe(1);
      expect(result.current.state.userProgress.helpPagesViewed).toContain('page-1');
      expect(result.current.state.contextualHints).toBe(false);
    });

    it('should maintain state consistency across operations', () => {
      const { result } = renderHook(() => useHelp(), {
        wrapper: createWrapper(),
      });

      // Simulate a complex user journey
      act(() => {
        // Start with search and filters
        result.current.setSearchQuery('planning workflow');
        result.current.addFilter('planning');
        result.current.addFilter('beginner');

        // Navigate to a section
        result.current.setCurrentSection('planning');
        result.current.markHelpPageViewed('planning-overview');

        // Start a tutorial
        result.current.startTutorial('planning-tutorial');
        result.current.nextTutorialStep('planning-tutorial');
        result.current.nextTutorialStep('planning-tutorial');

        // Change search
        result.current.setSearchQuery('lesson creation');
        result.current.removeFilter('beginner');
        result.current.addFilter('intermediate');

        // Complete tutorial
        result.current.completeTutorial('planning-tutorial');
      });

      // Verify final state
      expect(result.current.state.searchQuery).toBe('lesson creation');
      expect(result.current.state.activeFilters).toEqual(['planning', 'intermediate']);
      expect(result.current.state.currentSection).toBe('planning');
      expect(result.current.state.completedTutorials).toContain('planning-tutorial');
      expect(result.current.state.userProgress.helpPagesViewed).toContain('planning-overview');
      expect(result.current.state.userProgress.tutorialsCompleted).toContain('planning-tutorial');
    });
  });
});
