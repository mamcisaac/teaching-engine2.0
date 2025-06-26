/**
 * Test Utilities
 * 
 * Provides common testing utilities, mock factories, and custom render functions
 * for Testing Engine 2.0 frontend components.
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
// Import will be handled in individual test files to avoid circular dependencies

// Types for our test utilities
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  withRouter?: boolean;
  withAuth?: boolean;
  withQueryClient?: boolean;
  initialAuthState?: Partial<AuthContextValue>;
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

export interface AuthContextValue {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  getToken: () => string | null;
  setToken: (token: string) => void;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'admin';
  schoolBoard?: string;
  gradeLevel?: string;
}

// Mock data factories
export const createMockUser = (overrides: Partial<User & { token?: string }> = {}): User & { token?: string } => ({
  id: 'user-123',
  email: 'teacher@example.com',
  name: 'Test Teacher',
  role: 'teacher',
  schoolBoard: 'ETFO',
  gradeLevel: 'Grade 3',
  token: 'mock-jwt-token',
  ...overrides,
});

export const createMockLessonPlan = (overrides: Partial<any> = {}) => ({
  id: 'lesson-123',
  title: 'Test Lesson Plan',
  subject: 'Mathematics',
  gradeLevel: 'Grade 3',
  duration: 60,
  learningGoals: ['Students will understand addition'],
  successCriteria: ['Students can solve simple addition problems'],
  activities: [
    {
      id: 'activity-1',
      name: 'Introduction to Addition',
      duration: 15,
      description: 'Teacher-led introduction',
    },
  ],
  materials: ['Whiteboard', 'Worksheets'],
  assessment: 'Observation and exit ticket',
  differentiation: 'Visual aids for visual learners',
  reflection: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockUnitPlan = (overrides: Partial<any> = {}) => ({
  id: 'unit-123',
  title: 'Test Unit Plan',
  subject: 'Mathematics',
  gradeLevel: 'Grade 3',
  duration: '2 weeks',
  bigIdeas: ['Numbers can be represented in different ways'],
  essentialQuestions: ['How do we use numbers in everyday life?'],
  learningGoals: ['Understand place value'],
  successCriteria: ['Can identify place value positions'],
  assessments: ['Formative quizzes', 'Summative test'],
  lessonPlans: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockCurriculumExpectation = (overrides: Partial<any> = {}) => ({
  id: 'expectation-123',
  code: 'B1.1',
  description: 'demonstrate an understanding of addition and subtraction',
  strand: 'Number',
  subject: 'Mathematics',
  gradeLevel: 'Grade 3',
  keywords: ['addition', 'subtraction', 'number'],
  ...overrides,
});

// Export aliases for backwards compatibility
export const mockUser = createMockUser();
export const mockLessonPlan = createMockLessonPlan();
export const mockUnitPlan = createMockUnitPlan();

// Mock API responses
export const mockApiResponses = {
  lessonPlans: {
    getAll: [createMockLessonPlan(), createMockLessonPlan({ id: 'lesson-456', title: 'Second Lesson' })],
    getById: createMockLessonPlan(),
    create: createMockLessonPlan(),
    update: createMockLessonPlan({ title: 'Updated Lesson' }),
    delete: { success: true },
  },
  unitPlans: {
    getAll: [createMockUnitPlan(), createMockUnitPlan({ id: 'unit-456', title: 'Second Unit' })],
    getById: createMockUnitPlan(),
    create: createMockUnitPlan(),
    update: createMockUnitPlan({ title: 'Updated Unit' }),
    delete: { success: true },
  },
  curriculumExpectations: {
    search: [createMockCurriculumExpectation(), createMockCurriculumExpectation({ id: 'expectation-456', code: 'B1.2' })],
    getById: createMockCurriculumExpectation(),
  },
  auth: {
    login: { user: createMockUser(), token: 'mock-jwt-token' },
    logout: { success: true },
    profile: createMockUser(),
  },
};

// Export aliases for backwards compatibility
export const mockApiResponse = mockApiResponses;
export const mockApiError = { message: 'Mock API Error', status: 500 };

// Create a test QueryClient with default options optimized for testing
export const createTestQueryClient = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Don't cache queries in tests
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  // Ensure proper cleanup on test completion
  const originalClear = client.clear.bind(client);
  client.clear = () => {
    originalClear();
    client.getQueryCache().clear();
    client.getMutationCache().clear();
  };

  return client;
};

// Mock AuthContext provider for testing
export const MockAuthProvider: React.FC<{
  children: React.ReactNode;
  value?: Partial<AuthContextValue>;
}> = ({ children, value = {} }) => {
  const defaultAuthValue: AuthContextValue = {
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    checkAuth: vi.fn().mockResolvedValue(undefined),
    getToken: vi.fn().mockReturnValue(null),
    setToken: vi.fn(),
    ...value,
  };

  // Create a mock context provider
  const AuthContext = React.createContext<AuthContextValue>(defaultAuthValue);
  
  return (
    <AuthContext.Provider value={defaultAuthValue}>
      {children}
    </AuthContext.Provider>
  );
};

// All providers wrapper for comprehensive testing
const AllProviders: React.FC<{
  children: React.ReactNode;
  queryClient: QueryClient;
  initialEntries?: string[];
  initialAuthState?: Partial<AuthContextValue>;
}> = ({ children, queryClient, initialEntries, initialAuthState }) => {
  const RouterComponent = initialEntries ? MemoryRouter : BrowserRouter;
  const routerProps = initialEntries ? { initialEntries } : {};

  // If we need auth, wrap with MockAuthProvider
  const content = initialAuthState !== undefined ? (
    <MockAuthProvider value={initialAuthState}>
      {children}
    </MockAuthProvider>
  ) : children;

  return (
    <QueryClientProvider client={queryClient}>
      <RouterComponent {...routerProps}>
        {content}
      </RouterComponent>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that includes providers commonly used in the app
 */
export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    initialEntries,
    withRouter = true,
    withAuth = true,
    withQueryClient = true,
    initialAuthState,
    ...renderOptions
  } = options;

  const queryClient = createTestQueryClient();

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!withRouter && !withAuth && !withQueryClient) {
      return <>{children}</>;
    }

    return (
      <AllProviders
        queryClient={queryClient}
        initialEntries={initialEntries}
        initialAuthState={initialAuthState}
      >
        {children}
      </AllProviders>
    );
  };

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  // Enhanced cleanup function
  const originalUnmount = result.unmount;
  result.unmount = () => {
    // Clear QueryClient cache
    queryClient.clear();
    // Call original unmount
    originalUnmount();
  };

  return {
    queryClient,
    ...result,
  };
};

/**
 * Render with only Router (no Auth or QueryClient)
 */
export const renderWithRouter = (ui: ReactElement, initialEntries?: string[]) => {
  const RouterComponent = initialEntries ? MemoryRouter : BrowserRouter;
  const routerProps = initialEntries ? { initialEntries } : {};

  return render(
    <RouterComponent {...routerProps}>
      {ui}
    </RouterComponent>
  );
};

/**
 * Render with only QueryClient (no Router or Auth)
 */
export const renderWithQueryClient = (ui: ReactElement) => {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    ),
  };
};

/**
 * Render with authentication context (authenticated user)
 */
export const renderWithAuth = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const authenticatedUser = createMockUser();
  return renderWithProviders(ui, {
    ...options,
    initialAuthState: {
      user: authenticatedUser,
      isAuthenticated: true,
      getToken: vi.fn().mockReturnValue('mock-token'),
      ...options.initialAuthState,
    },
  });
};

/**
 * Render without authentication context (unauthenticated)
 */
export const renderWithoutAuth = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  return renderWithProviders(ui, {
    ...options,
    initialAuthState: {
      user: null,
      isAuthenticated: false,
      getToken: vi.fn().mockReturnValue(null),
      ...options.initialAuthState,
    },
  });
};

// Mock localStorage for tests
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: Object.keys(store).length,
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
};

// Common test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const mockScrollIntoView = () => {
  Element.prototype.scrollIntoView = vi.fn();
};

// Setup function for common test preparations
export const setupTest = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage(),
  });

  // Mock scrollIntoView
  mockScrollIntoView();

  // Reset all mocks before each test
  vi.clearAllMocks();

  // Clear any existing timers
  vi.clearAllTimers();
};

// Export everything for easy importing
export * from '@testing-library/react';
export { vi, expect } from 'vitest';
// Export userEvent - removed as it's imported directly in tests