/**
 * Test Utilities
 *
 * Provides common testing utilities, mock factories, and custom render functions
 * for Testing Engine 2.0 frontend components.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import { createContext, type ComponentType, type FC, type ReactElement, type ReactNode } from 'react';
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
  wrapper?: ComponentType<{ children: ReactNode }>;
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
export const createMockUser = (
  overrides: Partial<User & { token?: string }> = {},
): User & { token?: string } => ({
  id: 'user-123',
  email: 'teacher@example.com',
  name: 'Test Teacher',
  role: 'teacher',
  schoolBoard: 'ETFO',
  gradeLevel: 'Grade 3',
  token: 'mock-jwt-token',
  ...overrides,
});

export interface MockLessonPlan {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  duration: number;
  learningGoals: string[];
  successCriteria: string[];
  activities: {
    id: string;
    name: string;
    duration: number;
    description: string;
  }[];
  materials: string[];
  assessment: string;
  differentiation: string;
  reflection: string;
  createdAt: string;
  updatedAt: string;
}

export const createMockLessonPlan = (overrides: Partial<MockLessonPlan> = {}): MockLessonPlan => ({
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

export interface MockUnitPlan {
  id: string;
  title: string;
  longRangePlanId: string;
  startDate: string;
  endDate: string;
  bigIdeas: string;
  essentialQuestions: string[];
  successCriteria: string[];
  learningSkills: string[];
  keyVocabulary: string[];
  assessmentPlan: string;
  culminatingTask: string;
  lessonPlans: unknown[];
  _count: {
    lessonPlans: number;
    expectations: number;
    resources: number;
  };
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export const createMockUnitPlan = (overrides: Partial<MockUnitPlan> = {}): MockUnitPlan => ({
  id: 'unit-123',
  title: 'Test Unit Plan',
  longRangePlanId: 'lrp-123',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
  bigIdeas: 'Numbers can be represented in different ways',
  essentialQuestions: ['How do we use numbers in everyday life?'],
  successCriteria: ['Can identify place value positions'],
  learningSkills: ['Problem solving'],
  keyVocabulary: ['numerator', 'denominator'],
  assessmentPlan: 'Formative assessment through quizzes',
  culminatingTask: 'Fraction cookbook project',
  lessonPlans: [],
  _count: {
    lessonPlans: 0,
    expectations: 0,
    resources: 0,
  },
  progress: {
    total: 0,
    completed: 0,
    percentage: 0,
  },
  ...overrides,
});

export interface MockCurriculumExpectation {
  id: string;
  code: string;
  description: string;
  strand: string;
  subject: string;
  grade: number;
  keywords: string[];
}

export const createMockCurriculumExpectation = (overrides: Partial<MockCurriculumExpectation> = {}): MockCurriculumExpectation => ({
  id: 'expectation-123',
  code: 'B1.1',
  description: 'demonstrate an understanding of addition and subtraction',
  strand: 'Number',
  subject: 'Mathematics',
  grade: 3,
  keywords: ['addition', 'subtraction', 'number'],
  ...overrides,
});

// Export aliases for backwards compatibility
export const mockUser = createMockUser();
export const mockLessonPlan = createMockLessonPlan();
export const mockUnitPlan = createMockUnitPlan();

export interface MockApiResponses {
  lessonPlans: {
    getAll: MockLessonPlan[];
    getById: MockLessonPlan;
    create: MockLessonPlan;
    update: MockLessonPlan;
    delete: { success: boolean };
  };
  unitPlans: {
    getAll: MockUnitPlan[];
    getById: MockUnitPlan;
    create: MockUnitPlan;
    update: MockUnitPlan;
    delete: { success: boolean };
  };
  curriculumExpectations: {
    search: MockCurriculumExpectation[];
    getById: MockCurriculumExpectation;
  };
  auth: {
    login: { user: User & { token?: string }; token: string };
    logout: { success: boolean };
    profile: User & { token?: string };
  };
}

/**
 * @deprecated Use MSW (Mock Service Worker) for API mocking
 * 
 * These mock responses violate TDD principles.
 * Instead:
 * 1. Use MSW to mock at the network level
 * 2. Test with real API calls in integration tests
 * 3. Keep API mocking close to test files, not global
 */
export const mockApiResponses: MockApiResponses = {
  lessonPlans: {
    getAll: [
      createMockLessonPlan(),
      createMockLessonPlan({ id: 'lesson-456', title: 'Second Lesson' }),
    ],
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
    search: [
      createMockCurriculumExpectation(),
      createMockCurriculumExpectation({ id: 'expectation-456', code: 'B1.2' }),
    ],
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
export const createTestQueryClient = (): QueryClient => {
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
  client.clear = (): void => {
    originalClear();
    client.getQueryCache().clear();
    client.getMutationCache().clear();
  };

  return client;
};

/**
 * @deprecated Use real AuthProvider from contexts/AuthContext
 * 
 * MockAuthProvider violates TDD principles.
 * Tests should:
 * 1. Use the real AuthProvider with test data
 * 2. Mock API calls explicitly when needed
 * 3. Test authentication flows with real implementations
 */
export const MockAuthProvider: FC<{
  children: ReactNode;
  value?: Partial<AuthContextValue>;
}> = ({ children, value = {} }) => {
  console.warn(
    'MockAuthProvider is deprecated. Use real AuthProvider with test data instead.'
  );
  
  const loginMock = (_user: User): void => {};
  const logoutMock = (): void => {};
  const checkAuthMock = (): Promise<void> => Promise.resolve();
  const getTokenMock = (): string | null => null;
  const setTokenMock = (_token: string): void => {};
  
  const defaultAuthValue: AuthContextValue = {
    user: null,
    login: loginMock,
    logout: logoutMock,
    isAuthenticated: false,
    checkAuth: checkAuthMock,
    getToken: getTokenMock,
    setToken: setTokenMock,
    ...value,
  };

  // Create a mock context provider
  const AuthContext = createContext<AuthContextValue>(defaultAuthValue);

  return <AuthContext.Provider value={defaultAuthValue}>{children}</AuthContext.Provider>;
};

// All providers wrapper for comprehensive testing
const AllProviders: FC<{
  children: ReactNode;
  queryClient: QueryClient;
  initialEntries?: string[];
  initialAuthState?: Partial<AuthContextValue>;
}> = ({ children, queryClient, initialEntries, initialAuthState }) => {
  const RouterComponent = initialEntries ? MemoryRouter : BrowserRouter;
  const routerProps = initialEntries ? { initialEntries } : {};

  // If we need auth, wrap with MockAuthProvider
  const content =
    initialAuthState != undefined ? (
      <MockAuthProvider value={initialAuthState}>{children}</MockAuthProvider>
    ) : (
      children
    );

  return (
    <QueryClientProvider client={queryClient}>
      <RouterComponent {...routerProps}>{content}</RouterComponent>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that includes providers commonly used in the app
 * 
 * For TDD compliance:
 * - Consider using real providers instead of mocked ones
 * - Mock API calls at the network level (MSW) instead of context level
 * - Test complete user flows with real implementations
 */
export const renderWithProviders = (ui: ReactElement, options: CustomRenderOptions = {}): RenderResult & { queryClient: QueryClient } => {
  const {
    initialEntries,
    withRouter = true,
    withAuth = true,
    withQueryClient = true,
    initialAuthState,
    ...renderOptions
  } = options;

  const queryClient = createTestQueryClient();

  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => {
    if (!withRouter && !withAuth && !withQueryClient) {
      return <>{children}</>;
    }

    return (
      <AllProviders
        initialAuthState={initialAuthState}
        initialEntries={initialEntries}
        queryClient={queryClient}
      >
        {children}
      </AllProviders>
    );
  };

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  // Enhanced cleanup function
  const originalUnmount = result.unmount;
  result.unmount = (): void => {
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
export const renderWithRouter = (ui: ReactElement, initialEntries?: string[]): RenderResult => {
  const RouterComponent = initialEntries ? MemoryRouter : BrowserRouter;
  const routerProps = initialEntries ? { initialEntries } : {};

  return render(<RouterComponent {...routerProps}>{ui}</RouterComponent>);
};

/**
 * Render with only QueryClient (no Router or Auth)
 */
export const renderWithQueryClient = (ui: ReactElement): RenderResult & { queryClient: QueryClient } => {
  const queryClient = createTestQueryClient();

  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  };
};

/**
 * Render with authentication context (authenticated user)
 */
export const renderWithAuth = (ui: ReactElement, options: CustomRenderOptions = {}): RenderResult & { queryClient: QueryClient } => {
  const authenticatedUser = createMockUser();
  return renderWithProviders(ui, {
    ...options,
    initialAuthState: {
      user: authenticatedUser,
      isAuthenticated: true,
      getToken: ((): (() => string | null) => (): string | null => 'mock-token')(),
      ...options.initialAuthState,
    },
  });
};

/**
 * Render without authentication context (unauthenticated)
 */
export const renderWithoutAuth = (ui: ReactElement, options: CustomRenderOptions = {}): RenderResult & { queryClient: QueryClient } => renderWithProviders(ui, {
    ...options,
    initialAuthState: {
      user: null,
      isAuthenticated: false,
      getToken: (): string | null => null,
      ...options.initialAuthState,
    },
  });

// Mock localStorage for tests
export const mockLocalStorage = (): Storage => {
  const store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    length: Object.keys(store).length,
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  } as Storage;
};

// Common test helpers
export const waitForLoadingToFinish = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

export const mockScrollIntoView = (): void => {
  Element.prototype.scrollIntoView = (_options?: ScrollIntoViewOptions): void => {};
};

// Setup function for common test preparations
export const setupTest = (): void => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage(),
  });

  // Mock scrollIntoView
  mockScrollIntoView();

  // Reset all mocks before each test
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  vi.clearAllMocks();

  // Clear any existing timers
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  vi.clearAllTimers();
};

// Export everything for easy importing
export * from '@testing-library/react';
export { vi, expect } from 'vitest';
// Export userEvent - removed as it's imported directly in tests
