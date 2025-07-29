import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../utils/logger';
import { safeJsonParse } from '../utils/typeGuards';

interface UserProgress {
  helpPagesViewed: string[];
  tutorialsCompleted: string[];
  totalTimeSpent: number;
  lastVisited: Date;
}

interface HelpState {
  currentSection: string | null;
  searchQuery: string;
  activeFilters: string[];
  tutorialProgress: Record<string, number>;
  completedTutorials: string[];
  showOnboarding: boolean;
  contextualHints: boolean;
  userProgress: UserProgress;
  
  // Actions
  setCurrentSection: (section: string | null) => void;
  setSearchQuery: (query: string) => void;
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
  clearFilters: () => void;
  startTutorial: (tutorialId: string) => void;
  nextTutorialStep: (tutorialId: string) => void;
  completeTutorial: (tutorialId: string) => void;
  markHelpPageViewed: (pageId: string) => void;
  toggleOnboarding: () => void;
  toggleContextualHints: () => void;
  updateTimeSpent: (seconds: number) => void;
  
  // Computed values
  getTutorialProgress: (tutorialId: string) => {
    currentStep: number;
    isActive: boolean;
    isCompleted: boolean;
  };
  getAnalytics: () => {
    totalPagesViewed: number;
    totalTutorialsCompleted: number;
    totalTimeSpent: number;
    lastVisited: Date;
    completionRate: number;
  };
}

export const useHelpStore = create<HelpState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      currentSection: null,
      searchQuery: '',
      activeFilters: [],
      tutorialProgress: {},
      completedTutorials: [],
      showOnboarding: false,
      contextualHints: true,
      userProgress: {
        helpPagesViewed: [],
        tutorialsCompleted: [],
        totalTimeSpent: 0,
        lastVisited: new Date()
      },
      
      // Actions
      setCurrentSection: (section: string | null): void => {
        set((state) => {
          state.currentSection = section;
        });
      },
      
      setSearchQuery: (query: string): void => {
        set((state) => {
          state.searchQuery = query;
        });
      },
      
      addFilter: (filter: string): void => {
        set((state) => {
          if (!state.activeFilters.includes(filter)) {
            state.activeFilters.push(filter);
          }
        });
      },
      
      removeFilter: (filter: string): void => {
        set((state) => {
          state.activeFilters = state.activeFilters.filter(f => f !== filter);
        });
      },
      
      clearFilters: (): void => {
        set((state) => {
          state.activeFilters = [];
        });
      },
      
      startTutorial: (tutorialId: string): void => {
        set((state) => {
          state.tutorialProgress[tutorialId] = 0;
        });
      },
      
      nextTutorialStep: (tutorialId: string): void => {
        set((state) => {
          const currentStep = state.tutorialProgress[tutorialId] ?? 0;
          state.tutorialProgress[tutorialId] = currentStep + 1;
        });
      },
      
      completeTutorial: (tutorialId: string): void => {
        set((state) => {
          delete state.tutorialProgress[tutorialId];
          if (!state.completedTutorials.includes(tutorialId)) {
            state.completedTutorials.push(tutorialId);
            state.userProgress.tutorialsCompleted.push(tutorialId);
          }
        });
      },
      
      markHelpPageViewed: (pageId: string): void => {
        set((state) => {
          if (!state.userProgress.helpPagesViewed.includes(pageId)) {
            state.userProgress.helpPagesViewed.push(pageId);
            state.userProgress.lastVisited = new Date();
          }
        });
      },
      
      toggleOnboarding: (): void => {
        set((state) => {
          state.showOnboarding = !state.showOnboarding;
        });
      },
      
      toggleContextualHints: (): void => {
        set((state) => {
          state.contextualHints = !state.contextualHints;
        });
      },
      
      updateTimeSpent: (seconds: number): void => {
        set((state) => {
          state.userProgress.totalTimeSpent += seconds;
        });
      },
      
      // Computed values
      getTutorialProgress: (tutorialId: string): { currentStep: number; isActive: boolean; isCompleted: boolean } => {
        const state = get();
        return {
          currentStep: state.tutorialProgress[tutorialId] ?? 0,
          isActive: tutorialId in state.tutorialProgress,
          isCompleted: state.completedTutorials.includes(tutorialId)
        };
      },
      
      getAnalytics: (): { totalPagesViewed: number; totalTutorialsCompleted: number; totalTimeSpent: number; lastVisited: Date; completionRate: number } => {
        const state = get();
        return {
          totalPagesViewed: state.userProgress.helpPagesViewed.length,
          totalTutorialsCompleted: state.userProgress.tutorialsCompleted.length,
          totalTimeSpent: state.userProgress.totalTimeSpent,
          lastVisited: state.userProgress.lastVisited,
          completionRate: state.userProgress.tutorialsCompleted.length / 10 // Assuming 10 total tutorials
        };
      }
    })),
    {
      name: 'help-storage',
      partialize: (state) => ({
        completedTutorials: state.completedTutorials,
        contextualHints: state.contextualHints,
        userProgress: state.userProgress,
        tutorialProgress: state.tutorialProgress,
      }),
      // Handle Date serialization/deserialization
      serialize: (state) => JSON.stringify(state, (key, value: unknown) => {
          if (key === 'lastVisited' && value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }),
      deserialize: (str) => {
        try {
          const defaultValue = { state: {}, version: 0 };
          const parsed = safeJsonParse(str, defaultValue) as { state: Partial<HelpState>; version: number };
          if (parsed.state.userProgress?.lastVisited) {
            parsed.state.userProgress.lastVisited = new Date(parsed.state.userProgress.lastVisited);
          }
          return parsed;
        } catch (error) {
          logger.warn('Failed to deserialize help state:', error);
          return { state: {}, version: 0 };
        }
      },
    }
  )
);

// Selector hooks for performance
export const useCurrentSection = (): string | null => useHelpStore(state => state.currentSection);
export const useSearchQuery = (): string => useHelpStore(state => state.searchQuery);
export const useActiveFilters = (): string[] => useHelpStore(state => state.activeFilters);
export const useContextualHints = (): boolean => useHelpStore(state => state.contextualHints);

// Tutorial progress hook
export const useTutorialProgress = (tutorialId: string): { currentStep: number; isActive: boolean; isCompleted: boolean } => useHelpStore(state => state.getTutorialProgress(tutorialId));

// Analytics hook
export const useHelpAnalytics = (): { totalPagesViewed: number; totalTutorialsCompleted: number; totalTimeSpent: number; lastVisited: Date; completionRate: number } => useHelpStore(state => state.getAnalytics());