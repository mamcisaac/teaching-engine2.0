import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useUnitPlanStore } from '../unitPlanStore';
import type { UnitPlan } from '../unitPlanStore';

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

describe('unitPlanStore - nullish coalescing behavior', () => {
  beforeEach(() => {
    // Clear the store before each test
    useUnitPlanStore.setState({
      unitPlans: [],
      currentPlan: null,
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

  describe('fallback to empty array for cached data', () => {
    it('should use empty array when cachedPlans is null', async () => {
      const { offlineStorage } = await import('../../services/offlineStorage');
      
      vi.mocked(offlineStorage.getCachedData).mockResolvedValue(null);
      
      const { result } = renderHook(() => useUnitPlanStore());
      
      // Set offline mode
      act(() => {
        result.current.setOnlineStatus(false);
      });
      
      await act(async () => {
        await result.current.loadUnitPlans();
      });

      // Should have empty array when cache returns null
      expect(result.current.unitPlans).toEqual([]);
    });

    it('should use empty array when cachedPlans is undefined', async () => {
      const { offlineStorage } = await import('../../services/offlineStorage');
      
      vi.mocked(offlineStorage.getCachedData).mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useUnitPlanStore());
      
      // Set offline mode
      act(() => {
        result.current.setOnlineStatus(false);
      });
      
      await act(async () => {
        await result.current.loadUnitPlans();
      });

      // Should have empty array when cache returns undefined
      expect(result.current.unitPlans).toEqual([]);
    });

    it('should preserve empty array from cache with nullish coalescing', async () => {
      const { offlineStorage } = await import('../../services/offlineStorage');
      
      // Return empty array from cache
      const emptyArray: UnitPlan[] = [];
      vi.mocked(offlineStorage.getCachedData).mockResolvedValue(emptyArray);
      
      const { result } = renderHook(() => useUnitPlanStore());
      
      // Set offline mode
      act(() => {
        result.current.setOnlineStatus(false);
      });
      
      await act(async () => {
        await result.current.loadUnitPlans();
      });

      // With ||, empty array (falsy) would be replaced with new []
      // With ??, empty array should be preserved
      expect(result.current.unitPlans).toEqual([]);
      expect(result.current.unitPlans).toBe(emptyArray);
    });
  });

  describe('lastSyncedAt timestamp comparison', () => {
    it('should compare against empty string when lastSyncedAt is null', () => {
      const plan: UnitPlan = {
        id: '1',
        title: 'Test Unit',
        description: 'Test Description',
        grade: '3',
        subject: 'Math',
        duration: '4 weeks',
        expectations: [],
        resources: [],
        assessments: [],
        lessons: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T01:00:00Z',
      };

      const data: { lastSyncedAt: Date | null; unitPlans: UnitPlan[] } = { lastSyncedAt: null, unitPlans: [plan] };
      
      // Test the comparison logic
      const comparison = plan.updatedAt > ((data.lastSyncedAt && data.lastSyncedAt.toISOString()) || '');
      expect(comparison).toBe(true);
      
      // With ??, null would remain null and comparison would fail
      const comparisonNullish = plan.updatedAt > ((data.lastSyncedAt && data.lastSyncedAt.toISOString()) ?? '');
      expect(comparisonNullish).toBe(true); // Both should work the same for null
    });

    it('should handle undefined lastSyncedAt correctly', () => {
      const plan: UnitPlan = {
        id: '1',
        title: 'Test Unit',
        description: 'Test Description',
        grade: '3',
        subject: 'Math',
        duration: '4 weeks',
        expectations: [],
        resources: [],
        assessments: [],
        lessons: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T01:00:00Z',
      };

      const data: { unitPlans: UnitPlan[]; lastSyncedAt?: Date } = { unitPlans: [plan] };
      
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
      
      const { result } = renderHook(() => useUnitPlanStore());
      
      await act(async () => {
        await result.current.loadUnitPlans();
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error instances correctly', async () => {
      const { apiClient } = await import('../../api/core/client');
      
      vi.mocked(apiClient.get).mockRejectedValue('String error');
      
      const { result } = renderHook(() => useUnitPlanStore());
      
      await act(async () => {
        await result.current.loadUnitPlans();
      });

      expect(result.current.error).toBe('Failed to load plans');
    });

    it('should handle null/undefined errors correctly', async () => {
      const { apiClient } = await import('../../api/core/client');
      
      vi.mocked(apiClient.get).mockRejectedValue(null);
      
      const { result } = renderHook(() => useUnitPlanStore());
      
      await act(async () => {
        await result.current.loadUnitPlans();
      });

      expect(result.current.error).toBe('Failed to load plans');
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
});