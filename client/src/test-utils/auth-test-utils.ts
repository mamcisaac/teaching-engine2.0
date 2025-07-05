/**
 * Authentication test utilities for tests
 */

import { vi } from 'vitest';

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'teacher' as const,
  schoolId: 'school-123',
  boardId: 'board-123',
  boardName: 'Test Board',
  boardRegion: 'Test Region',
  onboardingStatus: 'completed' as const,
  apiKey: 'test-api-key',
  preferences: {
    theme: 'light' as const,
    notifications: true,
    keyboardShortcuts: true,
    language: 'en' as const
  }
};

/**
 * Mock teacher data for testing
 */
export const mockTeacher = {
  id: 'teacher-123',
  userId: mockUser.id,
  name: mockUser.name,
  email: mockUser.email,
  schoolId: mockUser.schoolId,
  boardId: mockUser.boardId,
  grades: ['Grade 1', 'Grade 2'],
  subjects: ['Mathematics', 'Language Arts'],
  specializations: [],
  hasCompletedOnboarding: true,
  preferences: {
    theme: 'light' as const,
    notifications: true,
    keyboardShortcuts: true,
    language: 'en' as const
  }
};

/**
 * Mock auth token for testing
 */
export const mockAuthToken = 'mock-jwt-token';

/**
 * Mock auth headers
 */
export const mockAuthHeaders = {
  Authorization: `Bearer ${mockAuthToken}`,
  'Content-Type': 'application/json'
};

/**
 * Setup authenticated user for tests
 */
export function setupAuthenticatedUser() {
  // Set up localStorage
  localStorage.setItem('authToken', mockAuthToken);
  localStorage.setItem('user', JSON.stringify(mockUser));
  
  return {
    user: mockUser,
    token: mockAuthToken,
    headers: mockAuthHeaders
  };
}

/**
 * Clear auth data from localStorage
 */
export function clearAuthData() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.clear();
}

/**
 * Mock authentication context value
 */
export const mockAuthContextValue = {
  user: mockUser,
  teacher: mockTeacher,
  login: vi.fn().mockResolvedValue({ user: mockUser, token: mockAuthToken }),
  logout: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue({ user: mockUser, token: mockAuthToken }),
  updateUser: vi.fn().mockResolvedValue(mockUser),
  isLoading: false,
  isAuthenticated: true,
  error: null,
  clearError: vi.fn()
};

/**
 * Mock unauthenticated context value
 */
export const mockUnauthenticatedContextValue = {
  user: null,
  teacher: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  updateUser: vi.fn(),
  isLoading: false,
  isAuthenticated: false,
  error: null,
  clearError: vi.fn()
};

/**
 * Create a custom auth context value
 */
export function createAuthContextValue(overrides?: Partial<typeof mockAuthContextValue>) {
  return {
    ...mockAuthContextValue,
    ...overrides
  };
}

/**
 * Create an authenticated test user (alias for setupAuthenticatedUser)
 */
export const createAuthenticatedTestUser = setupAuthenticatedUser;

/**
 * Clear auth state (alias for clearAuthData)
 */
export const clearAuthState = clearAuthData;

/**
 * Test user interface
 */
export interface TestUser {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
}

/**
 * Auth test context interface
 */
export interface AuthTestContext {
  user: typeof mockUser;
  token: string;
  headers: typeof mockAuthHeaders;
  cleanup?: () => void;
}

/**
 * Mock login response
 */
export const mockLoginResponse = {
  data: {
    user: mockUser,
    token: mockAuthToken
  }
};

/**
 * Mock register response
 */
export const mockRegisterResponse = {
  data: {
    user: mockUser,
    token: mockAuthToken
  }
};

/**
 * Wait for authentication to complete
 */
export async function waitForAuth() {
  // Wait for next tick
  await new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Create mock auth API handlers
 */
export function createMockAuthHandlers() {
  return {
    login: vi.fn().mockResolvedValue(mockLoginResponse),
    register: vi.fn().mockResolvedValue(mockRegisterResponse),
    logout: vi.fn().mockResolvedValue({ data: { success: true } }),
    getCurrentUser: vi.fn().mockResolvedValue({ data: mockUser }),
    updateProfile: vi.fn().mockResolvedValue({ data: mockUser })
  };
}