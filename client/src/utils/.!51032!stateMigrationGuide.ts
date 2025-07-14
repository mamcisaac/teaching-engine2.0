/**
 * State Management Migration Guide
 *
 * This file provides guidance and utilities for migrating from the old context-based
 * state management to the new standardized Zustand + React Query approach.
 */

// Migration mappings for Context API → Zustand Store conversions
export const CONTEXT_TO_STORE_MAPPINGS = {
  // Onboarding Context → Onboarding Store
  useOnboarding: 'useOnboardingStore',
  OnboardingProvider: 'remove - use store directly',
  useOnboardingComplete: 'useOnboardingComplete (from store)',

