/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file MainLayout.test.tsx
 * @description Comprehensive tests for MainLayout component including navigation,
 * responsive behavior, accessibility, keyboard shortcuts, and user interactions.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MainLayout } from '../MainLayout';
import { renderWithProviders, createMockUser } from '@/test-utils';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock the context and hooks
const mockAuthContext = {
  user: createMockUser() as any,
  logout: vi.fn(),
  isAuthenticated: true,
  login: vi.fn(),
  checkAuth: vi.fn(),
  getToken: vi.fn().mockReturnValue('mock-token'),
  setToken: vi.fn(),
  isLoading: false,
  isInitialized: true,
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock onboarding context to prevent errors
vi.mock('../../contexts/OnboardingContext', () => ({
  useOnboarding: () => ({
    isOnboardingComplete: true,
    currentStep: null,
    completeStep: vi.fn(),
    resetOnboarding: vi.fn(),
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/planner/dashboard' }),
  };
});

// Mock the ETFO progress hook
const mockETFOLevels = [
  {
    id: 1,
    name: 'Curriculum Expectations',
    path: '/curriculum/import',
    description: 'Import curriculum',
