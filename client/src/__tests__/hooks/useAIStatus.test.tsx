/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { apiClient } from '../../api/core/client';
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useAIStatus,
  useAIFeature,
  useAIQuota,
  AIStatusProvider,
  useAIStatusContext,
  AIStatusIndicator,
} from '../../hooks/useAIStatus';
import { createTestQueryClient, renderWithProviders } from '../../test-utils';

// Mock the api modules
vi.mock('../../api/core/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('../../api/legacy/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
  getWeekStartISO: vi.fn(),
}));

describe('useAIStatus hooks', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
    // Clear session storage
    sessionStorage.clear();
    // Reset fake timers if they were used
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('useAIStatus', () => {
    it('returns default AI status when no data is available', async () => {
      // Mock API to never resolve
      vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useAIStatus(), { wrapper });

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
      expect(result.current.isAIEnabled).toBe(false);
      expect(result.current.canUseAI).toBe(false);
    });

    it('fetches AI status successfully', async () => {
      const mockStatus = {
        available: true,
        hasApiKey: true,
        apiKeyConfigured: true,
        serviceHealth: 'healthy',
        features: {
          planGeneration: true,
          contentSuggestions: true,
          curriculumAnalysis: true,
          resourceRecommendations: false,
        },
        limitations: {
          requestsPerHour: 100,
          requestsRemaining: 95,
          quotaUsed: 50,
          quotaLimit: 1000,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatus });

      const { result } = renderHook(() => useAIStatus(), { wrapper });

      await waitFor(() => {
        expect(result.current.aiStatus.available).toBe(true);
      });

      expect(result.current.isAIEnabled).toBe(true);
      expect(result.current.canUseAI).toBe(true);
      expect(result.current.aiDisabledReason).toBeUndefined();
      expect(apiClient.get).toHaveBeenCalledWith('/api/ai/status');
    });

    it('handles service unavailable error (503)', async () => {
      const error = new Error('Service Unavailable') as any;
      error.response = { status: 503 };
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAIStatus(), { wrapper });

      await waitFor(() => {
        expect(result.current.aiStatus.serviceHealth).toBe('unavailable');
      });

      expect(result.current.aiStatus.error).toBe('AI service is temporarily unavailable');
      expect(result.current.canUseAI).toBe(false);
    });

    it('handles authentication error (401)', async () => {
      const error = new Error('Unauthorized') as any;
      error.response = { status: 401 };
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAIStatus(), { wrapper });

      await waitFor(() => {
        expect(result.current.aiStatus.hasApiKey).toBe(false);
      });

      expect(result.current.aiStatus.apiKeyConfigured).toBe(false);
      expect(result.current.aiStatus.error).toBe('API key not configured or invalid');
      expect(result.current.aiDisabledReason).toBe('OpenAI API key is not configured');
    });

    it('handles rate limit error (429)', async () => {
      const error = new Error('Rate Limited') as any;
      error.response = { status: 429 };
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAIStatus(), { wrapper });

      await waitFor(() => {
        expect(result.current.aiStatus.serviceHealth).toBe('degraded');
      });

      expect(result.current.aiStatus.error).toBe('Rate limit exceeded');
    });

    it('handles network errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAIStatus(), { wrapper });

      await waitFor(() => {
        expect(result.current.aiStatus.serviceHealth).toBe('unavailable');
      });

      expect(result.current.aiStatus.error).toBe('Unable to check AI service status');
    });

    it('allows user to manually disable AI', async () => {
      const mockStatus = {
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
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatus });

      const { result } = renderHook(() => useAIStatus(), { wrapper });

      await waitFor(() => {
        expect(result.current.aiStatus.available).toBe(true);
      });

      act(() => {
        result.current.disableAI();
      });

      expect(result.current.isAIEnabled).toBe(false);
      expect(result.current.canUseAI).toBe(false);
      expect(result.current.aiDisabledReason).toBe('AI features have been manually disabled');
      expect(sessionStorage.getItem('ai_disabled')).toBe('true');
    });

    it('allows user to manually enable AI', async () => {
      // Start with AI disabled
      sessionStorage.setItem('ai_disabled', 'true');

      const mockStatus = {
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
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStatus });

      const { result } = renderHook(() => useAIStatus(), { wrapper });

      // Initially disabled
      expect(result.current.isAIEnabled).toBe(false);

      act(() => {
        result.current.enableAI();
      });

      await waitFor(() => {
        expect(result.current.isAIEnabled).toBe(true);
      });

      expect(result.current.canUseAI).toBe(true);
      expect(sessionStorage.getItem('ai_disabled')).toBeNull();
      expect(apiClient.get).toHaveBeenCalledTimes(2); // Initial call + refetch after enable
    });

    it('persists disabled state from session storage', () => {
      sessionStorage.setItem('ai_disabled', 'true');

      const { result } = renderHook(() => useAIStatus(), { wrapper });

      expect(result.current.isAIEnabled).toBe(false);
      expect(result.current.aiDisabledReason).toBe('AI features have been manually disabled');
    });

    it('refetches status at regular intervals', async () => {
      vi.useFakeTimers();

      const mockStatus = {
        available: true,
        hasApiKey: true,
        serviceHealth: 'healthy',
        features: {},
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStatus });

      const { unmount } = renderHook(() => useAIStatus(), { wrapper });

      // Initial call
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(1);
      });

      // Fast forward 10 minutes (refetch interval)
      act(() => {
        vi.advanceTimersByTime(10 * 60 * 1000);
      });

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(2);
      });

      // Cleanup
      unmount();
      vi.useRealTimers();
    });
  });

  describe('useAIFeature', () => {
    it('returns feature availability based on AI status', async () => {
      const mockStatus = {
        available: true,
        hasApiKey: true,
        apiKeyConfigured: true,
        serviceHealth: 'healthy',
        features: {
          planGeneration: true,
          contentSuggestions: false,
          curriculumAnalysis: true,
          resourceRecommendations: true,
        },
        limitations: {
          requestsRemaining: 50,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatus });

      const { result } = renderHook(() => useAIFeature('planGeneration'), { wrapper });

      await waitFor(() => {
        expect(result.current.available).toBe(true);
      });

      expect(result.current.status).toBe('healthy');
      expect(result.current.limitations).toEqual({
        requestsRemaining: 50,
      });
    });

    it('returns false when feature is disabled', async () => {
      const mockStatus = {
        available: true,
        hasApiKey: true,
        apiKeyConfigured: true,
        serviceHealth: 'healthy',
        features: {
          planGeneration: false,
          contentSuggestions: false,
          curriculumAnalysis: false,
          resourceRecommendations: false,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatus });

      const { result } = renderHook(() => useAIFeature('planGeneration'), { wrapper });

      await waitFor(() => {
        expect(result.current.available).toBe(false);
      });
    });
  });

  describe('useAIQuota', () => {
    it('calculates quota percentage correctly', async () => {
      const mockStatus = {
        available: true,
        limitations: {
          quotaUsed: 750,
          quotaLimit: 1000,
          requestsRemaining: 25,
          requestsPerHour: 100,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatus });

      const { result } = renderHook(() => useAIQuota(), { wrapper });

      await waitFor(() => {
        expect(result.current.quotaUsed).toBe(750);
      });

      expect(result.current.quotaLimit).toBe(1000);
      expect(result.current.quotaPercentage).toBe(75);
      expect(result.current.isNearQuotaLimit).toBe(false);
      expect(result.current.isQuotaExceeded).toBe(false);
    });

    it('detects near quota limit', async () => {
      const mockStatus = {
        available: true,
        limitations: {
          quotaUsed: 850,
          quotaLimit: 1000,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatus });

      const { result } = renderHook(() => useAIQuota(), { wrapper });

      await waitFor(() => {
        expect(result.current.quotaPercentage).toBe(85);
      });

      expect(result.current.isNearQuotaLimit).toBe(true);
      expect(result.current.isQuotaExceeded).toBe(false);
    });

    it('detects quota exceeded', async () => {
      const mockStatus = {
        available: true,
        limitations: {
          quotaUsed: 1000,
          quotaLimit: 1000,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatus });

      const { result } = renderHook(() => useAIQuota(), { wrapper });

      await waitFor(() => {
        expect(result.current.quotaPercentage).toBe(100);
      });

      expect(result.current.isNearQuotaLimit).toBe(true);
      expect(result.current.isQuotaExceeded).toBe(true);
    });
  });

  describe('AIStatusProvider and useAIStatusContext', () => {
    it('provides AI status through context', async () => {
      const mockStatus = {
        available: true,
        hasApiKey: true,
        serviceHealth: 'healthy',
        features: {},
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatus });

      const TestComponent = () => {
        const { aiStatus } = useAIStatusContext();
        return <div>{aiStatus.available ? 'Available' : 'Unavailable'}</div>;
      };

      const { getByText } = renderWithProviders(
        <AIStatusProvider>
          <TestComponent />
        </AIStatusProvider>
      );

      await waitFor(() => {
        expect(getByText('Available')).toBeInTheDocument();
      });
    });

    it('throws error when used outside provider', () => {
      const TestComponent = () => {
        useAIStatusContext();
        return <div>Test</div>;
      };

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderWithProviders(<TestComponent />);
      }).toThrow('useAIStatusContext must be used within AIStatusProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('AIStatusIndicator', () => {
    it('renders compact indicator correctly', async () => {
      const mockStatus = {
        available: true,
        hasApiKey: true,
        serviceHealth: 'healthy',
        features: {},
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatus });

      const { getByText } = renderWithProviders(
        <AIStatusIndicator compact={true} />,
        { wrapper }
      );

      await waitFor(() => {
        expect(getByText('AI Available')).toBeInTheDocument();
      });
    });

    it('renders detailed indicator with features', async () => {
      const mockStatus = {
        available: true,
        hasApiKey: true,
        serviceHealth: 'healthy',
        features: {
          planGeneration: true,
          contentSuggestions: true,
          curriculumAnalysis: false,
          resourceRecommendations: false,
        },
        limitations: {
          requestsRemaining: 50,
        },
        lastChecked: new Date('2024-01-15T10:00:00Z'),
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatus });

      const { getByText } = renderWithProviders(
        <AIStatusIndicator showDetails={true} />,
        { wrapper }
      );

      await waitFor(() => {
        expect(getByText('AI Assistant: Available')).toBeInTheDocument();
      });

      expect(getByText(/planGeneration, contentSuggestions/)).toBeInTheDocument();
      expect(getByText('Requests remaining: 50')).toBeInTheDocument();
    });

    it('shows disabled reason when AI is unavailable', async () => {
      sessionStorage.setItem('ai_disabled', 'true');

      const { getByText } = renderWithProviders(
        <AIStatusIndicator showDetails={true} />,
        { wrapper }
      );

      await waitFor(() => {
        expect(getByText('AI features have been manually disabled')).toBeInTheDocument();
      });
    });

    it('applies custom className', () => {
      const { container } = renderWithProviders(
        <AIStatusIndicator className="custom-class" />,
        { wrapper }
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});