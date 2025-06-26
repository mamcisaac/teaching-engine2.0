import { useEffect } from 'react';
import { useOnboarding, TUTORIAL_FLOWS } from '../contexts/OnboardingContext';
import { useLocation } from 'react-router-dom';

/**
 * Hook to automatically start feature-specific tutorials when navigating to new pages
 */
export function useFeatureTutorial() {
  const { state, startOnboarding } = useOnboarding();
  const location = useLocation();

  useEffect(() => {
    // Don't start tutorials if main onboarding is active or user has skipped
    if (state.currentFlow || state.skippedOnboarding || !state.isFirstTimeUser) {
      return;
    }

    // Map routes to tutorial flows
    const routeTutorials: Record<string, string> = {
      '/planner/quick-lesson': 'lesson-planning',
      '/planner/calendar': 'weekly-planning',
    };

    const tutorialId = routeTutorials[location.pathname];
    
    // Start tutorial if available and not already completed
    if (tutorialId && !state.completedFlows.includes(tutorialId)) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        startOnboarding(tutorialId);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, state, startOnboarding]);
}

/**
 * Hook to check if we should show contextual hints on a page
 */
export function useShowContextualHints() {
  const { state } = useOnboarding();
  
  // Show hints if:
  // - User is first time user
  // - Main onboarding is complete
  // - No active tutorial
  // - User hasn't skipped onboarding
  return state.isFirstTimeUser && 
         state.completedFlows.includes('main-onboarding') && 
         !state.currentFlow && 
         !state.skippedOnboarding;
}