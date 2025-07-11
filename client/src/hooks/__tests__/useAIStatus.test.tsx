import { renderHook, act, waitFor, render } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAIStatus, useAIFeature, useAIQuota, AIStatusProvider, useAIStatusContext } from '../useAIStatus';
import { apiClient } from '../../api/core/client';

// Mock the API client
vi.mock('../../api/core/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

// Create a wrapper with QueryClient for testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAIStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('should return default status when loading', () => {
    const { result } = renderHook(() => useAIStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.aiStatus).toEqual({
      available: false,
      hasApiKey: false,
      apiKeyConfigured: false,
      serviceHealth: 'unavailable',
      features: {
        planGeneration: false,
        contentSuggestions: false,
        curriculumAnalysis: false,
        resourceRecommendations: false,
      },
    });
  });

  it('should fetch AI status successfully', async () => {
    const mockResponse = {
      data: {
        available: true,
        hasApiKey: true,
        apiKeyConfigured: true,
        serviceHealth: 'healthy',
        features: {
          planGeneration: true,
          contentSuggestions: true,
          curriculumAnalysis: true,
          resourceRecommendations: true,
        },
        limitations: {
          requestsPerHour: 100,
          requestsRemaining: 75,
        },
      },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.aiStatus.available).toBe(true);
    expect(result.current.aiStatus.hasApiKey).toBe(true);
    expect(result.current.aiStatus.serviceHealth).toBe('healthy');
    expect(result.current.canUseAI).toBe(true);
    expect(result.current.isAIEnabled).toBe(true);
  });

  it('should handle 503 service unavailable error', async () => {
    const error = {
      response: {
        status: 503,
      },
    };

    vi.mocked(apiClient.get).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.aiStatus.error).toBe('AI service is temporarily unavailable');
    expect(result.current.aiStatus.serviceHealth).toBe('unavailable');
    expect(result.current.canUseAI).toBe(false);
  });

  it('should handle 401 unauthorized error', async () => {
    const error = {
      response: {
        status: 401,
      },
    };

    vi.mocked(apiClient.get).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.aiStatus.error).toBe('API key not configured or invalid');
    expect(result.current.aiStatus.hasApiKey).toBe(false);
    expect(result.current.aiStatus.apiKeyConfigured).toBe(false);
  });

  it('should handle 429 rate limit error', async () => {
    const error = {
      response: {
        status: 429,
      },
    };

    vi.mocked(apiClient.get).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.aiStatus.error).toBe('Rate limit exceeded');
    expect(result.current.aiStatus.serviceHealth).toBe('degraded');
  });

  it('should handle network errors without response', async () => {
    const error = new Error('Network error');

    vi.mocked(apiClient.get).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.aiStatus.error).toBe('Unable to check AI service status');
    expect(result.current.aiStatus.serviceHealth).toBe('unavailable');
  });

  it('should handle errors with undefined response', async () => {
    const error = {
      response: undefined,
    };

    vi.mocked(apiClient.get).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.aiStatus.error).toBe('Unable to check AI service status');
    expect(result.current.aiStatus.serviceHealth).toBe('unavailable');
  });

  it('should handle errors with undefined status', async () => {
    const error = {
      response: {
        status: undefined,
      },
    };

    vi.mocked(apiClient.get).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.aiStatus.error).toBe('Unable to check AI service status');
    expect(result.current.aiStatus.serviceHealth).toBe('unavailable');
  });

  it('should respect user disabled AI setting', () => {
    sessionStorage.setItem('ai_disabled', 'true');

    const { result } = renderHook(() => useAIStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isAIEnabled).toBe(false);
    expect(result.current.aiDisabledReason).toBe('AI features have been manually disabled');
  });

  it('should enable and disable AI', async () => {
    const mockResponse = {
      data: {
        available: true,
        hasApiKey: true,
        apiKeyConfigured: true,
        serviceHealth: 'healthy',
        features: {
          planGeneration: true,
          contentSuggestions: true,
          curriculumAnalysis: true,
          resourceRecommendations: true,
        },
      },
    };

    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAIStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Disable AI
    act(() => {
      result.current.disableAI();
    });

    expect(result.current.isAIEnabled).toBe(false);
    expect(sessionStorage.getItem('ai_disabled')).toBe('true');

    // Enable AI
    act(() => {
      result.current.enableAI();
    });

    expect(result.current.isAIEnabled).toBe(true);
    expect(sessionStorage.getItem('ai_disabled')).toBeNull();
  });

  it('should not retry on client errors', async () => {
    const error = {
      response: {
        status: 400,
      },
    };

    const mockGet = vi.mocked(apiClient.get).mockRejectedValue(error);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: (failureCount, err) => {
            const axiosError = err as { response?: { status?: number } };
            if (axiosError.response?.status && axiosError.response.status < 500) {
              return false;
            }
            return failureCount < 3;
          },
        },
      },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    renderHook(() => useAIStatus(), { wrapper });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(1); // Should not retry
    });
  });
});

describe('useAIFeature', () => {
  it('should return feature availability', async () => {
    const mockResponse = {
      data: {
        available: true,
        hasApiKey: true,
        apiKeyConfigured: true,
        serviceHealth: 'healthy',
        features: {
          planGeneration: true,
          contentSuggestions: false,
          curriculumAnalysis: true,
          resourceRecommendations: false,
        },
      },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAIFeature('planGeneration'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.available).toBe(true);
    });

    expect(result.current.status).toBe('healthy');
  });
});

describe('useAIQuota', () => {
  it('should calculate quota usage correctly', async () => {
    const mockResponse = {
      data: {
        available: true,
        hasApiKey: true,
        apiKeyConfigured: true,
        serviceHealth: 'healthy',
        features: {
          planGeneration: true,
          contentSuggestions: true,
          curriculumAnalysis: true,
          resourceRecommendations: true,
        },
        limitations: {
          quotaUsed: 80,
          quotaLimit: 100,
          requestsRemaining: 20,
          requestsPerHour: 100,
        },
      },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAIQuota(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.quotaUsed).toBe(80);
    });

    expect(result.current.quotaLimit).toBe(100);
    expect(result.current.quotaPercentage).toBe(80);
    expect(result.current.isNearQuotaLimit).toBe(false);
    expect(result.current.isQuotaExceeded).toBe(false);
  });

  it('should detect when near quota limit', async () => {
    const mockResponse = {
      data: {
        available: true,
        hasApiKey: true,
        apiKeyConfigured: true,
        serviceHealth: 'healthy',
        features: {
          planGeneration: true,
          contentSuggestions: true,
          curriculumAnalysis: true,
          resourceRecommendations: true,
        },
        limitations: {
          quotaUsed: 85,
          quotaLimit: 100,
        },
      },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useAIQuota(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isNearQuotaLimit).toBe(true);
    });
  });
});

describe('AIStatusProvider', () => {
  it('should provide AI status context', async () => {
    const mockResponse = {
      data: {
        available: true,
        hasApiKey: true,
        apiKeyConfigured: true,
        serviceHealth: 'healthy',
        features: {
          planGeneration: true,
          contentSuggestions: true,
          curriculumAnalysis: true,
          resourceRecommendations: true,
        },
      },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

    const TestComponent = () => {
      const status = useAIStatusContext();
      return <div>{status.canUseAI ? 'AI Available' : 'AI Unavailable'}</div>;
    };

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <AIStatusProvider>
          <TestComponent />
        </AIStatusProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(getByText('AI Available')).toBeInTheDocument();
    });
  });

  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      useAIStatusContext();
      return null;
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAIStatusContext must be used within AIStatusProvider');

    consoleSpy.mockRestore();
  });
});