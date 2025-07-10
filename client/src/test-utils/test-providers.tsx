/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Test Providers for Real Component Testing
 * Provides real context providers and utilities for TDD-compliant tests
 *
 * This module supports real implementations by default and provides utilities
 * for migrating from mock-based tests to real implementation tests.
 */

import React, { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { KeyboardShortcutsProvider } from '../contexts/KeyboardShortcutsContext';
import {
  createAuthenticatedTestUser,
  clearAuthState,
  type TestUser,
  type AuthTestContext,
} from './auth-test-utils';

// Test configuration for real implementations
interface TestConfig {
  useRealApi?: boolean;
  enableCache?: boolean;
  networkDelay?: number;
  mockExternalServices?: boolean;
}

// Create a test query client with specific settings for real implementations
export function createTestQueryClient(config: TestConfig = {}) {
  const {
    useRealApi = true,
    enableCache = false,
    networkDelay = 0,
    mockExternalServices = true,
  } = config;

  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry in tests unless specifically testing retry logic
        gcTime: enableCache ? 5 * 60 * 1000 : 0, // 5 minutes if cache enabled, otherwise 0
        staleTime: enableCache ? 30 * 1000 : 0, // 30 seconds if cache enabled, otherwise 0
        networkMode: useRealApi ? 'online' : 'offlineFirst',
      },
      mutations: {
        retry: false,
        networkMode: useRealApi ? 'online' : 'offlineFirst',
      },
    },
  });
}

// Enhanced provider wrapper with full context support
interface RealProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  initialRoute?: string;
  authContext?: AuthTestContext;
  testConfig?: TestConfig;
  useMemoryRouter?: boolean;
  initialEntries?: string[];
  enableAllContexts?: boolean;
}

export function RealProviders({
  children,
  queryClient,
  initialRoute = '/',
  authContext,
  testConfig = {},
  useMemoryRouter = false,
  initialEntries = ['/'],
  enableAllContexts = true,
}: RealProvidersProps) {
  const testQueryClient = queryClient || createTestQueryClient(testConfig);

  // Setup authentication if provided
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (authContext?.cleanup) {
        authContext.cleanup().catch(console.error);
      }
    };
  }, [authContext]);

  // Router component selection
  const RouterComponent = useMemoryRouter ? MemoryRouter : BrowserRouter;
  const routerProps = useMemoryRouter
    ? { initialEntries: initialEntries.length > 0 ? initialEntries : [initialRoute] }
    : {};

  // Handle browser router navigation
  useEffect(() => {
    if (!useMemoryRouter && initialRoute !== '/') {
      window.history.pushState({}, '', initialRoute);
    }
  }, [initialRoute, useMemoryRouter]);

  const providers = (
    <QueryClientProvider client={testQueryClient}>
      <RouterComponent {...routerProps}>
        <AuthProvider>
          <ThemeProvider>
            {enableAllContexts ? (
              <NotificationProvider>
                <KeyboardShortcutsProvider>{children}</KeyboardShortcutsProvider>
              </NotificationProvider>
            ) : (
              children
            )}
          </ThemeProvider>
        </AuthProvider>
      </RouterComponent>
    </QueryClientProvider>
  );

  return providers;
}

// Backward compatibility wrapper
export function RealAuthProviders(props: RealProvidersProps) {
  return <RealProviders {...props} />;
}

// All providers wrapper (backward compatibility - now defaults to real implementations)
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialRoute?: string;
  useRealAuth?: boolean;
  authContext?: AuthTestContext;
  testConfig?: TestConfig;
  useMemoryRouter?: boolean;
  enableAllContexts?: boolean;
  // Legacy prop for gradual migration
  useMockProviders?: boolean;
}

export function AllProviders({
  children,
  queryClient,
  initialRoute = '/',
  useRealAuth = true, // Default to real implementations
  authContext,
  testConfig = {},
  useMemoryRouter = false,
  enableAllContexts = true,
  useMockProviders = false, // For gradual migration
}: AllProvidersProps) {
  // Move useEffect before conditional return
  useEffect(() => {
    if (useMockProviders && initialRoute !== '/') {
      window.history.pushState({}, '', initialRoute);
    }
  }, [useMockProviders, initialRoute]);

  // If explicitly using mock providers (legacy mode)
  if (useMockProviders) {
    const legacyQueryClient = queryClient || createTestQueryClient({ useRealApi: false });

    return (
      <QueryClientProvider client={legacyQueryClient}>
        <BrowserRouter>
          <ThemeProvider>{children}</ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  // Default to real providers
  return (
    <RealProviders
      queryClient={queryClient}
      initialRoute={initialRoute}
      authContext={useRealAuth ? authContext : undefined}
      testConfig={testConfig}
      useMemoryRouter={useMemoryRouter}
      enableAllContexts={enableAllContexts}
    >
      {children}
    </RealProviders>
  );
}

// Enhanced render function with real implementation support
export interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  authenticated?: boolean;
  initialRoute?: string;
  useRealAuth?: boolean;
  authContext?: AuthTestContext;
  testConfig?: TestConfig;
  useMemoryRouter?: boolean;
  initialEntries?: string[];
  enableAllContexts?: boolean;
  useMockProviders?: boolean; // For migration support
  waitForLoad?: boolean; // Wait for loading states to finish
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient,
    authenticated = false,
    initialRoute = '/',
    useRealAuth = true, // Default to real auth
    authContext,
    testConfig = {},
    useMemoryRouter = false,
    initialEntries = ['/'],
    enableAllContexts = true,
    useMockProviders = false,
    waitForLoad = false,
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <AllProviders
        queryClient={queryClient}
        initialRoute={initialRoute}
        useRealAuth={useRealAuth || authenticated}
        authContext={authContext}
        testConfig={testConfig}
        useMemoryRouter={useMemoryRouter}
        enableAllContexts={enableAllContexts}
        useMockProviders={useMockProviders}
      >
        {children}
      </AllProviders>
    );
  };

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  // If waiting for load states, return extended result
  if (waitForLoad) {
    return {
      ...result,
      waitForLoad: () => waitForLoadingToFinish(),
    };
  }

  return result;
}

// Helper to render with real authentication
export async function renderWithRealAuth(
  ui: React.ReactElement,
  options: Omit<CustomRenderOptions, 'useRealAuth' | 'authenticated'> & {
    createUser?: boolean;
    testUser?: TestUser;
  } = {},
) {
  const { createUser = true, testUser, ...renderOptions } = options;
  let authContext: AuthTestContext | undefined;

  if (createUser && !testUser) {
    authContext = await createAuthenticatedTestUser();
  } else if (testUser) {
    // Use existing test user
    authContext = await createAuthenticatedTestUser();
  }

  const result = renderWithProviders(ui, {
    ...renderOptions,
    useRealAuth: true,
    authContext,
  });

  return {
    ...result,
    authContext,
    cleanup: async () => {
      if (authContext?.cleanup) {
        await authContext.cleanup();
      }
    },
  };
}

// Enhanced test utilities for real implementation testing
export const testUtils = {
  // Render with real authenticated user
  renderAuthenticated: async (ui: React.ReactElement, options?: CustomRenderOptions) =>
    await renderWithRealAuth(ui, options),

  // Render with specific route (real implementation by default)
  renderWithRoute: (ui: React.ReactElement, route: string, options?: CustomRenderOptions) =>
    renderWithProviders(ui, {
      ...options,
      initialRoute: route,
      useMemoryRouter: true,
      initialEntries: [route],
    }),

  // Render with real auth and specific route
  renderAuthenticatedWithRoute: async (
    ui: React.ReactElement,
    route: string,
    options?: CustomRenderOptions,
  ) =>
    await renderWithRealAuth(ui, {
      ...options,
      initialRoute: route,
      useMemoryRouter: true,
      initialEntries: [route],
    }),

  // Create test query client with real implementation config
  createQueryClient: (config?: TestConfig) => createTestQueryClient(config),

  // Render with real providers and wait for loading
  renderAndWaitForLoad: async (ui: React.ReactElement, options?: CustomRenderOptions) => {
    const result = renderWithProviders(ui, { ...options, waitForLoad: true });
    if ('waitForLoad' in result) {
      await result.waitForLoad();
    }
    return result;
  },

  // Performance testing utilities
  measureRenderPerformance: async (ui: React.ReactElement, options?: CustomRenderOptions) => {
    const start = performance.now();
    const result = renderWithProviders(ui, options);
    const renderTime = performance.now() - start;

    return {
      ...result,
      renderTime,
      performance: {
        renderTime,
        isAcceptable: renderTime < 100, // Less than 100ms is acceptable
      },
    };
  },

  // Test with large datasets
  renderWithLargeDataset: (
    ui: React.ReactElement,
    dataSize: number,
    options?: CustomRenderOptions,
  ) => {
    const testConfig: TestConfig = {
      ...options?.testConfig,
      enableCache: true, // Enable caching for large datasets
    };

    return renderWithProviders(ui, {
      ...options,
      testConfig,
    });
  },

  // Migration utilities for existing tests
  migration: {
    // Gradually migrate from mock to real providers
    renderWithMigration: (
      ui: React.ReactElement,
      useReal: boolean,
      options?: CustomRenderOptions,
    ) =>
      renderWithProviders(ui, {
        ...options,
        useMockProviders: !useReal,
      }),

    // Test both mock and real implementations side by side
    testBothImplementations: async (
      ui: React.ReactElement,
      testFn: (result: unknown) => void | Promise<void>,
      options?: CustomRenderOptions,
    ) => {
      // Test with mock providers
      const mockResult = renderWithProviders(ui, {
        ...options,
        useMockProviders: true,
      });
      await testFn(mockResult);
      mockResult.unmount();

      // Test with real providers
      const realResult = renderWithProviders(ui, {
        ...options,
        useMockProviders: false,
      });
      await testFn(realResult);
      realResult.unmount();
    },
  },

  // Clear all auth state for clean tests
  clearAuth: clearAuthState,

  // Setup and teardown utilities
  setup: {
    // Setup real test environment
    setupRealEnvironment: async () => {
      clearAuthState();
      // Additional real environment setup
    },

    // Create test data for real implementations
    createTestData: async (dataConfig: any) => {
      // Implementation for creating real test data
      return dataConfig;
    },

    // Cleanup test environment
    cleanup: async () => {
      clearAuthState();
      // Additional cleanup for real implementations
    },
  },
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };

// Custom vitest matchers for common assertions
interface ViAssertion<T = unknown> {
  toBeInTheDocument(): T;
  toHaveClass(className: string): T;
  toBeVisible(): T;
  toBeDisabled(): T;
  toBeEnabled(): T;
  toHaveValue(value: string | string[] | number): T;
  toHaveTextContent(text: string | RegExp): T;
}

declare global {
  interface Vi {
    JestAssertion: ViAssertion;
  }
}

// Enhanced console handling for real implementations
const originalError = console.error;
const originalWarn = console.warn;

// Only mock console in specific scenarios - preserve real console for debugging
export function mockConsole() {
  console.error = vi.fn();
  console.warn = vi.fn();
}

export function restoreConsole() {
  console.error = originalError;
  console.warn = originalWarn;
}

// Conditional console mocking - useful for migration
export function conditionalConsoleMock(useMocks: boolean = false) {
  if (useMocks) {
    mockConsole();
  }

  return () => {
    if (useMocks) {
      restoreConsole();
    }
  };
}

// Enhanced helpers for real implementation testing
export async function waitForLoadingToFinish(timeout: number = 5000) {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(
    () => {
      const loadingElements = [
        document.querySelector('[data-testid="loading"]'),
        document.querySelector('.loading'),
        document.querySelector('[aria-label="Loading"]'),
      ].filter(Boolean);

      expect(loadingElements).toHaveLength(0);
    },
    { timeout },
  );
}

// Helper for waiting for error states with real error handling
export async function waitForError(errorMessage?: string, timeout: number = 5000) {
  const { waitFor, screen } = await import('@testing-library/react');
  await waitFor(
    () => {
      if (errorMessage) {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      } else {
        const errorElements = [
          document.querySelector('[data-testid="error"]'),
          document.querySelector('.error'),
          document.querySelector('[role="alert"]'),
        ].filter(Boolean);

        expect(errorElements.length).toBeGreaterThan(0);
      }
    },
    { timeout },
  );
}

// Enhanced form filling with real user interactions
export async function fillForm(
  form: Record<string, string>,
  options: {
    waitForValidation?: boolean;
    submitForm?: boolean;
  } = {},
) {
  const { screen, waitFor } = await import('@testing-library/react');
  const userEvent = await import('@testing-library/user-event');

  const user = userEvent.default.setup();

  for (const [fieldName, value] of Object.entries(form)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
    await user.clear(field);
    await user.type(field, value);

    // Wait for validation if requested
    if (options.waitForValidation) {
      await waitFor(() => {
        // Wait for validation messages to appear/disappear
        const validationMessage = field.getAttribute('aria-describedby');
        if (validationMessage) {
          const messageElement = document.getElementById(validationMessage);
          // Validation has processed if message element exists
          expect(messageElement).toBeInTheDocument();
        }
      });
    }
  }

  // Submit form if requested
  if (options.submitForm) {
    const submitButton = screen.getByRole('button', { name: /submit|save|create/i });
    await user.click(submitButton);
  }
}

// Real data utilities for testing
export const realDataUtils = {
  // Create realistic test data
  createRealisticUser: () => ({
    id: Date.now(),
    email: `test-${Math.random().toString(36).substring(7)}@example.com`,
    name: 'Test User',
    role: 'USER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),

  // Create realistic curriculum data
  createRealisticCurriculum: () => ({
    id: `curr-${Date.now()}`,
    title: 'Test Curriculum',
    subject: 'Mathematics',
    grade: 5,
    expectations: [{ code: 'M5.1', description: 'Test expectation' }],
  }),

  // Generate large realistic datasets
  generateLargeDataset: function generateLargeDatasetImpl<T>(
    createItem: (index: number) => T,
    count: number,
  ): T[] {
    return Array.from({ length: count }, (_, i) => createItem(i));
  },
};

// Performance testing utilities for real implementations
export const performanceUtils = {
  // Measure component render time with real data
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    return end - start;
  },

  // Test with realistic large datasets
  createLargeDataSet: (count: number, template: unknown) =>
    Array.from({ length: count }, (_, i) => ({
      ...(template as any),
      id: `item-${i}`,
      createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    })),

  // Measure real API response times
  measureApiResponseTime: async (apiCall: () => Promise<unknown>) => {
    const start = performance.now();
    try {
      await apiCall();
      return performance.now() - start;
    } catch (error) {
      const responseTime = performance.now() - start;
      return { error, responseTime };
    }
  },

  // Test component performance with real data loading
  testComponentPerformance: async (
    component: React.ReactElement,
    dataSize: number,
    options?: CustomRenderOptions,
  ) => {
    const renderStart = performance.now();
    const result = renderWithProviders(component, {
      ...options,
      testConfig: { enableCache: true },
    });
    const renderTime = performance.now() - renderStart;

    // Wait for any async loading to complete
    await waitForLoadingToFinish();
    const totalTime = performance.now() - renderStart;

    return {
      ...result,
      performance: {
        renderTime,
        totalTime,
        dataSize,
        acceptable: totalTime < 1000, // Less than 1 second for any data size
      },
    };
  },
};
