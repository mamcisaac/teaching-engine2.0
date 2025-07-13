import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useParams } from 'react-router-dom';
import { PlanAccessTracker } from '../PlanAccessTracker';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

// Mock the hook
vi.mock('../../../hooks/useRecentPlans', () => ({
  useTrackPlanAccess: vi.fn(),
}));

describe('PlanAccessTracker', () => {
  const mockUseParams = useParams as ReturnType<typeof vi.fn>;
  const mockMutate = vi.fn();
  const mockUseTrackPlanAccess = require('../../../hooks/useRecentPlans').useTrackPlanAccess;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTrackPlanAccess.mockReturnValue({ mutate: mockMutate });
  });

  const renderTracker = (planType: 'long-range' | 'unit' | 'lesson' | 'daybook') => {
    return render(
      <PlanAccessTracker planType={planType}>
        <div>Test Content</div>
      </PlanAccessTracker>
    );
  };

  it('should render children', () => {
    mockUseParams.mockReturnValue({});
    
    renderTracker('unit');
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  describe('Plan ID Detection', () => {
    it('should track access with unitId when available', async () => {
      mockUseParams.mockReturnValue({ unitId: 'unit-123' });
      
      renderTracker('unit');
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          planType: 'unit',
          planId: 'unit-123',
        });
      });
    });

    it('should track access with lessonId when available', async () => {
      mockUseParams.mockReturnValue({ lessonId: 'lesson-456' });
      
      renderTracker('lesson');
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          planType: 'lesson',
          planId: 'lesson-456',
        });
      });
    });

    it('should track access with longRangePlanId when available', async () => {
      mockUseParams.mockReturnValue({ longRangePlanId: 'lr-789' });
      
      renderTracker('long-range');
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          planType: 'long-range',
          planId: 'lr-789',
        });
      });
    });

    it('should track access with generic id when available', async () => {
      mockUseParams.mockReturnValue({ id: 'daybook-321' });
      
      renderTracker('daybook');
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          planType: 'daybook',
          planId: 'daybook-321',
        });
      });
    });

    it('should use first available ID in priority order', async () => {
      mockUseParams.mockReturnValue({
        unitId: 'unit-1',
        lessonId: 'lesson-1',
        longRangePlanId: 'lr-1',
        id: 'generic-1',
      });
      
      renderTracker('unit');
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          planType: 'unit',
          planId: 'unit-1', // Should use unitId first
        });
      });
    });
  });

  describe('No Plan ID Scenarios', () => {
    it('should not track access when no plan ID is available', () => {
      mockUseParams.mockReturnValue({});
      
      renderTracker('unit');
      
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should not track access when all IDs are undefined', () => {
      mockUseParams.mockReturnValue({
        unitId: undefined,
        lessonId: undefined,
        longRangePlanId: undefined,
        id: undefined,
      });
      
      renderTracker('lesson');
      
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should not track access when all IDs are null', () => {
      mockUseParams.mockReturnValue({
        unitId: null,
        lessonId: null,
        longRangePlanId: null,
        id: null,
      });
      
      renderTracker('long-range');
      
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('Effect Cleanup', () => {
    it('should re-track when planId changes', async () => {
      const { rerender } = render(
        <PlanAccessTracker planType="unit">
          <div>Test Content</div>
        </PlanAccessTracker>
      );
      
      // Initial render with no ID
      mockUseParams.mockReturnValue({});
      rerender(
        <PlanAccessTracker planType="unit">
          <div>Test Content</div>
        </PlanAccessTracker>
      );
      
      expect(mockMutate).not.toHaveBeenCalled();
      
      // Update with a unit ID
      mockUseParams.mockReturnValue({ unitId: 'unit-new' });
      rerender(
        <PlanAccessTracker planType="unit">
          <div>Test Content</div>
        </PlanAccessTracker>
      );
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          planType: 'unit',
          planId: 'unit-new',
        });
      });
    });

    it('should re-track when planType changes', async () => {
      mockUseParams.mockReturnValue({ id: 'plan-123' });
      
      const { rerender } = render(
        <PlanAccessTracker planType="unit">
          <div>Test Content</div>
        </PlanAccessTracker>
      );
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          planType: 'unit',
          planId: 'plan-123',
        });
      });
      
      // Change plan type
      rerender(
        <PlanAccessTracker planType="lesson">
          <div>Test Content</div>
        </PlanAccessTracker>
      );
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          planType: 'lesson',
          planId: 'plan-123',
        });
      });
      
      expect(mockMutate).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string IDs as no ID', () => {
      mockUseParams.mockReturnValue({
        unitId: '',
        lessonId: '',
        longRangePlanId: '',
        id: '',
      });
      
      renderTracker('unit');
      
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only IDs', async () => {
      mockUseParams.mockReturnValue({
        unitId: '   ',
        lessonId: '  ',
        id: ' ',
      });
      
      renderTracker('unit');
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          planType: 'unit',
          planId: '   ', // Should still use the whitespace ID
        });
      });
    });
  });
});