import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { HelpState, HelpContextType } from '../types/help';

// Initial state
const initialState: HelpState = {
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
  }
};

// Action types
type HelpAction =
  | { type: 'SET_CURRENT_SECTION'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_FILTER'; payload: string }
  | { type: 'REMOVE_FILTER'; payload: string }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'START_TUTORIAL'; payload: string }
  | { type: 'NEXT_TUTORIAL_STEP'; payload: string }
  | { type: 'COMPLETE_TUTORIAL'; payload: string }
  | { type: 'MARK_HELP_PAGE_VIEWED'; payload: string }
  | { type: 'TOGGLE_ONBOARDING' }
  | { type: 'TOGGLE_CONTEXTUAL_HINTS' }
  | { type: 'LOAD_STATE'; payload: Partial<HelpState> };

// Reducer
function helpReducer(state: HelpState, action: HelpAction): HelpState {
  switch (action.type) {
    case 'SET_CURRENT_SECTION':
      return { ...state, currentSection: action.payload };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'ADD_FILTER':
      if (state.activeFilters.includes(action.payload)) {
        return state;
      }
      return { ...state, activeFilters: [...state.activeFilters, action.payload] };

    case 'REMOVE_FILTER':
      return {
        ...state,
        activeFilters: state.activeFilters.filter(filter => filter !== action.payload)
      };

    case 'CLEAR_FILTERS':
      return { ...state, activeFilters: [] };

    case 'START_TUTORIAL':
      return {
        ...state,
        tutorialProgress: { ...state.tutorialProgress, [action.payload]: 0 }
      };

    case 'NEXT_TUTORIAL_STEP': {
      const currentStep = state.tutorialProgress[action.payload] || 0;
      return {
        ...state,
        tutorialProgress: { ...state.tutorialProgress, [action.payload]: currentStep + 1 }
      };
    }

    case 'COMPLETE_TUTORIAL': {
      const { [action.payload]: _, ...remainingProgress } = state.tutorialProgress;
      return {
        ...state,
        tutorialProgress: remainingProgress,
        completedTutorials: [...state.completedTutorials, action.payload],
        userProgress: {
          ...state.userProgress,
          tutorialsCompleted: [...state.userProgress.tutorialsCompleted, action.payload]
        }
      };
    }

    case 'MARK_HELP_PAGE_VIEWED':
      if (state.userProgress.helpPagesViewed.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          helpPagesViewed: [...state.userProgress.helpPagesViewed, action.payload],
          lastVisited: new Date()
        }
      };

    case 'TOGGLE_ONBOARDING':
      return { ...state, showOnboarding: !state.showOnboarding };

    case 'TOGGLE_CONTEXTUAL_HINTS':
      return { ...state, contextualHints: !state.contextualHints };

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// Context
const HelpContext = createContext<HelpContextType | undefined>(undefined);

// Local storage key
const HELP_STATE_KEY = 'teachingEngine_helpState';

// Provider component
export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(helpReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(HELP_STATE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Convert date strings back to Date objects
        if (parsedState.userProgress?.lastVisited) {
          parsedState.userProgress.lastVisited = new Date(parsedState.userProgress.lastVisited);
        }
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      }
    } catch (error) {
      console.warn('Failed to load help state from localStorage:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HELP_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save help state to localStorage:', error);
    }
  }, [state]);

  // Context value
  const contextValue: HelpContextType = {
    state,
    setCurrentSection: (section: string | null) => {
      dispatch({ type: 'SET_CURRENT_SECTION', payload: section });
    },
    setSearchQuery: (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    },
    addFilter: (filter: string) => {
      dispatch({ type: 'ADD_FILTER', payload: filter });
    },
    removeFilter: (filter: string) => {
      dispatch({ type: 'REMOVE_FILTER', payload: filter });
    },
    clearFilters: () => {
      dispatch({ type: 'CLEAR_FILTERS' });
    },
    startTutorial: (tutorialId: string) => {
      dispatch({ type: 'START_TUTORIAL', payload: tutorialId });
    },
    nextTutorialStep: (tutorialId: string) => {
      dispatch({ type: 'NEXT_TUTORIAL_STEP', payload: tutorialId });
    },
    completeTutorial: (tutorialId: string) => {
      dispatch({ type: 'COMPLETE_TUTORIAL', payload: tutorialId });
    },
    markHelpPageViewed: (pageId: string) => {
      dispatch({ type: 'MARK_HELP_PAGE_VIEWED', payload: pageId });
    },
    toggleOnboarding: () => {
      dispatch({ type: 'TOGGLE_ONBOARDING' });
    },
    toggleContextualHints: () => {
      dispatch({ type: 'TOGGLE_CONTEXTUAL_HINTS' });
    }
  };

  return (
    <HelpContext.Provider value={contextValue}>
      {children}
    </HelpContext.Provider>
  );
}

// Hook to use the help context
export function useHelp(): HelpContextType {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}

// Hook for checking tutorial progress
export function useTutorialProgress(tutorialId: string) {
  const { state } = useHelp();
  
  return {
    currentStep: state.tutorialProgress[tutorialId] || 0,
    isActive: tutorialId in state.tutorialProgress,
    isCompleted: state.completedTutorials.includes(tutorialId)
  };
}

// Hook for help analytics
export function useHelpAnalytics() {
  const { state } = useHelp();
  
  return {
    totalPagesViewed: state.userProgress.helpPagesViewed.length,
    totalTutorialsCompleted: state.userProgress.tutorialsCompleted.length,
    totalTimeSpent: state.userProgress.totalTimeSpent,
    lastVisited: state.userProgress.lastVisited,
    completionRate: state.userProgress.tutorialsCompleted.length / 10 // Assuming 10 total tutorials
  };
}