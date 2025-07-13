import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useLessonPlanStore } from '../lessonPlanStore';
import type { LessonPlan } from '../lessonPlanStore';

// Mock dependencies
vi.mock('../../api/core/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../services/offlineStorage', () => ({
  offlineStorage: {
    getCachedData: vi.fn(),
    cacheData: vi.fn(),
    saveOfflineChange: vi.fn(),
  },
}));

vi.mock('../../utils/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('lessonPlanStore - nullish coalescing behavior', () => {
  beforeEach(() => {
    // Clear the store before each test
    useLessonPlanStore.setState({
      lessonPlans: [],
      currentLesson: null,
      isLoading: false,
      isSaving: false,
      error: null,
      isOnline: true,
      lastSyncedAt: null,
      hasOfflineChanges: false,
      pendingChanges: 0,
      syncStatus: 'idle',
      syncError: null,
    });
    vi.clearAllMocks();
  });

  describe('cache key generation with date parameters', () => {
    it('should use "all" when startDate is undefined', async () => {
      const { apiClient } = await import('../../api/core/client');
      const { offlineStorage } = await import('../../services/offlineStorage');
      
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
      
      const { result } = renderHook(() => useLessonPlanStore());
      
      await act(async () => {
        await result.current.loadLessonPlans(undefined, '2024-01-31');
      });

      // With ||, undefined becomes 'all'
      expect(offlineStorage.cacheData).toHaveBeenCalledWith(
        'lesson-plans-all-2024-01-31',
        [],
        60
      );
    });

    it('should use "all" when startDate is null', async () => {
      const { apiClient } = await import('../../api/core/client');
      const { offlineStorage } = await import('../../services/offlineStorage');
      
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
      
      const { result } = renderHook(() => useLessonPlanStore());
      
      await act(async () => {
        await result.current.loadLessonPlans(null as any, '2024-01-31');
      });

      // With ??, null should still become 'all'
      expect(offlineStorage.cacheData).toHaveBeenCalledWith(
        'lesson-plans-all-2024-01-31',
        [],
        60
      );
    });

    it('should preserve empty string dates with nullish coalescing', async () => {
      const { apiClient } = await import('../../api/core/client');
      const { offlineStorage } = await import('../../services/offlineStorage');
      
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });
      
      const { result } = renderHook(() => useLessonPlanStore());
      
      await act(async () => {
        await result.current.loadLessonPlans('', '');
      });

      // With ||, empty strings would become 'all'
      // With ??, empty strings should be preserved
      // This test shows the current behavior with ||
      expect(offlineStorage.cacheData).toHaveBeenCalledWith(
        'lesson-plans-all-all',
        [],
        60
      );
    });
  });

  describe('fallback to empty array for cached data', () => {
    it('should use empty array when cachedPlans is null', async () => {
      const { offlineStorage } = await import('../../services/offlineStorage');
      
      vi.mocked(offlineStorage.getCachedData).mockResolvedValue(null);
      
      const { result } = renderHook(() => useLessonPlanStore());
      
      // Set offline mode
      act(() => {
        result.current.setOnlineStatus(false);
      });
      
      await act(async () => {
        await result.current.loadLessonPlans();
      });

      // Should have empty array when cache returns null
      expect(result.current.lessonPlans).toEqual([]);
    });

    it('should use empty array when cachedPlans is undefined', async () => {
      const { offlineStorage } = await import('../../services/offlineStorage');
      
      vi.mocked(offlineStorage.getCachedData).mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useLessonPlanStore());
      
      // Set offline mode
      act(() => {
        result.current.setOnlineStatus(false);
      });
      
      await act(async () => {
        await result.current.loadLessonPlans();
      });

      // Should have empty array when cache returns undefined
      expect(result.current.lessonPlans).toEqual([]);
    });

    it('should preserve empty array from cache with nullish coalescing', async () => {
      const { offlineStorage } = await import('../../services/offlineStorage');
      
      // Return empty array from cache
      vi.mocked(offlineStorage.getCachedData).mockResolvedValue([]);
      
      const { result } = renderHook(() => useLessonPlanStore());
      
      // Set offline mode
      act(() => {
        result.current.setOnlineStatus(false);
      });
      
      await act(async () => {
        await result.current.loadLessonPlans();
      });

      // With ||, empty array (falsy) would be replaced with new []
      // With ??, empty array should be preserved
      expect(result.current.lessonPlans).toEqual([]);
      expect(result.current.lessonPlans).toBe(
        await offlineStorage.getCachedData('lesson-plans-all-all')
      );
    });
  });

  describe('lastSyncedAt timestamp comparison', () => {
    it('should compare against empty string when lastSyncedAt is null', () => {
      const plan: LessonPlan = {
        id: '1',
        title: 'Test',
        date: '2024-01-01',
        grade: '3',
        subject: 'Math',
        duration: 60,
        expectations: [],
        learningGoals: [],
        successCriteria: [],
        materials: [],
        openingActivity: '',
        mainActivity: '',
        closingActivity: '',
        assessment: '',
        differentiation: '',
        notes: '',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T01:00:00Z',
      };

      const data: { lastSyncedAt: Date | null; lessonPlans: LessonPlan[] } = { lastSyncedAt: null, lessonPlans: [plan] };
      
      // Test the comparison logic
      const comparison = plan.updatedAt > ((data.lastSyncedAt && data.lastSyncedAt.toISOString()) || '');
      expect(comparison).toBe(true);
      
      // With ??, null would remain null and comparison would fail
      const comparisonNullish = plan.updatedAt > ((data.lastSyncedAt && data.lastSyncedAt.toISOString()) ?? '');
      expect(comparisonNullish).toBe(true); // Both should work the same for null
    });

    it('should handle undefined lastSyncedAt correctly', () => {
      const plan: LessonPlan = {
        id: '1',
        title: 'Test',
        date: '2024-01-01',
        grade: '3',
        subject: 'Math',
        duration: 60,
        expectations: [],
        learningGoals: [],
        successCriteria: [],
        materials: [],
        openingActivity: '',
        mainActivity: '',
        closingActivity: '',
        assessment: '',
        differentiation: '',
        notes: '',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T01:00:00Z',
      };

      const data: { lessonPlans: LessonPlan[]; lastSyncedAt?: Date } = { lessonPlans: [plan] };
      
      // Test the comparison logic
      const comparison = plan.updatedAt > (data.lastSyncedAt?.toISOString() || '');
      expect(comparison).toBe(true);
    });
  });

  describe('error message handling', () => {
    it('should handle Error instances correctly', async () => {
      const { apiClient } = await import('../../api/core/client');
      const testError = new Error('Network error');
      
      vi.mocked(apiClient.get).mockRejectedValue(testError);
      
      const { result } = renderHook(() => useLessonPlanStore());
      
      await act(async () => {
        await result.current.loadLessonPlans();
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error instances correctly', async () => {
      const { apiClient } = await import('../../api/core/client');
      
      vi.mocked(apiClient.get).mockRejectedValue('String error');
      
      const { result } = renderHook(() => useLessonPlanStore());
      
      await act(async () => {
        await result.current.loadLessonPlans();
      });

      expect(result.current.error).toBe('Failed to load plans');
    });

    it('should handle null/undefined errors correctly', async () => {
      const { apiClient } = await import('../../api/core/client');
      
      vi.mocked(apiClient.get).mockRejectedValue(null);
      
      const { result } = renderHook(() => useLessonPlanStore());
      
      await act(async () => {
        await result.current.loadLessonPlans();
      });

      expect(result.current.error).toBe('Failed to load plans');
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
});