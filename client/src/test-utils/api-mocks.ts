/**
 * API Mock Setup for Tests
 * 
 * Provides a centralized way to mock API calls without triggering
 * navigation issues in the test environment.
 */

import { vi } from 'vitest';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create a mock axios instance that prevents navigation
export const createMockAxiosInstance = (): AxiosInstance => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    head: vi.fn(),
    options: vi.fn(),
    request: vi.fn(),
    getUri: vi.fn(() => ''),
    defaults: {
      headers: {
        common: {},
        delete: {},
        get: {},
        head: {},
        post: {},
        put: {},
        patch: {},
      },
      baseURL: 'http://localhost:3000',
      withCredentials: true,
    },
    interceptors: {
      request: {
        use: vi.fn((onFulfilled, onRejected) => {
          // Return a mock interceptor ID
          return 0;
        }),
        eject: vi.fn(),
        clear: vi.fn(),
      },
      response: {
        use: vi.fn((onFulfilled, onRejected) => {
          // Store the error handler but don't execute it automatically
          // This prevents the navigation issue in tests
          return 0;
        }),
        eject: vi.fn(),
        clear: vi.fn(),
      },
    },
  } as unknown as AxiosInstance;

  // Make all HTTP methods return resolved promises by default
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'request'];
  methods.forEach(method => {
    (mockInstance as any)[method].mockResolvedValue({ 
      data: {}, 
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as AxiosRequestConfig,
    });
  });

  return mockInstance;
};

// Helper to create a mock response
export const createMockResponse = <T = any>(data: T, status = 200): AxiosResponse<T> => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {},
  config: {} as AxiosRequestConfig,
});

// Helper to create a mock error response
export const createMockErrorResponse = (status: number, message?: string) => {
  const error = new Error(message || `Request failed with status ${status}`) as any;
  error.response = {
    status,
    statusText: message || 'Error',
    data: { message: message || `Request failed with status ${status}` },
    headers: {},
    config: {} as AxiosRequestConfig,
  };
  error.isAxiosError = true;
  return error;
};

// Mock the entire api module for tests that need it
export const mockApiModule = () => {
  const mockAxios = createMockAxiosInstance();
  
  vi.mock('../api/legacy/api', () => ({
    api: mockAxios,
    getWeekStartISO: vi.fn((date: Date) => {
      const d = new Date(date);
      const day = d.getUTCDay();
      const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setUTCDate(diff));
      return monday.toISOString().split('T')[0];
    }),
  }));

  vi.mock('../api/core/client', () => ({
    apiClient: mockAxios,
    API_BASE_URL: 'http://localhost:3000',
  }));

  return mockAxios;
};

// Setup function to be called in test files
export const setupApiMocks = () => {
  // Clear any existing mocks
  vi.clearAllMocks();
  
  // Return the mock instance for test-specific configuration
  return mockApiModule();
};