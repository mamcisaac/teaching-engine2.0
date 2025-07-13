import { lazy } from 'react';

// Lazy load onboarding components
export const OnboardingTooltip = lazy(() => 
  import('./OnboardingTooltip').then(module => ({
    default: module.OnboardingTooltip
  }))
);

export const OnboardingHighlight = lazy(() =>
  import('./OnboardingHighlight').then(module => ({
    default: module.OnboardingHighlight
  }))
);

export const OnboardingProgress = lazy(() =>
  import('./OnboardingProgress').then(module => ({
    default: module.OnboardingProgress
  }))
);

// Export motion components for use
export const loadMotionComponents = async (): Promise<{
  motion: typeof import('framer-motion').motion;
  AnimatePresence: typeof import('framer-motion').AnimatePresence;
}> => {
  const { motion, AnimatePresence } = await import('framer-motion');
  return { motion, AnimatePresence };
};