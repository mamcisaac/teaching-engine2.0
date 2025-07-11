import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useModal, useModals } from '../useModal';

describe('useModal', () => {
  describe('single modal', () => {
    it('should initialize with closed state by default', () => {
      const { result } = renderHook(() => useModal());
      
      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should initialize with open state when defaultOpen is true', () => {
      const { result } = renderHook(() => useModal({ defaultOpen: true }));
      
      expect(result.current.isOpen).toBe(true);
    });

    it('should open modal with data', () => {
      const onOpen = vi.fn();
      const { result } = renderHook(() => useModal({ onOpen }));
      
      const testData = { id: 1, name: 'Test' };
      
      act(() => {
        result.current.open(testData);
      });
      
      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toEqual(testData);
      expect(onOpen).toHaveBeenCalledWith(testData);
    });

    it('should close modal and call onClose', () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useModal({ onClose }));
      
      // Open first
      act(() => {
        result.current.open({ test: true });
      });
      
      // Then close
      act(() => {
        result.current.close();
      });
      
      expect(result.current.isOpen).toBe(false);
      expect(onClose).toHaveBeenCalled();
    });

    it('should clear data after close animation', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useModal());
      
      // Open with data
      act(() => {
        result.current.open({ test: true });
      });
      
      expect(result.current.data).toEqual({ test: true });
      
      // Close
      act(() => {
        result.current.close();
      });
      
      // Data should still be there immediately
      expect(result.current.data).toEqual({ test: true });
      
      // Advance timers
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      // Data should be cleared
      expect(result.current.data).toBeUndefined();
      
      vi.useRealTimers();
    });

    it('should toggle modal state', () => {
      const { result } = renderHook(() => useModal());
      
      expect(result.current.isOpen).toBe(false);
      
      // Toggle open
      act(() => {
        result.current.toggle();
      });
      
      expect(result.current.isOpen).toBe(true);
      
      // Toggle close
      act(() => {
        result.current.toggle();
      });
      
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('useModals - multiple modals', () => {
    it('should initialize with provided modal names', () => {
      const { result } = renderHook(() => useModals(['modal1', 'modal2']));
      
      expect(result.current.modals).toEqual({
        modal1: { isOpen: false },
        modal2: { isOpen: false }
      });
    });

    it('should open modal with data', () => {
      const { result } = renderHook(() => useModals(['modal1']));
      
      const testData = { id: 1 };
      
      act(() => {
        result.current.openModal('modal1', testData);
      });
      
      expect(result.current.modals.modal1).toEqual({
        isOpen: true,
        data: testData
      });
    });

    it('should handle opening non-existent modal', () => {
      const { result } = renderHook(() => useModals());
      
      act(() => {
        result.current.openModal('newModal', { test: true });
      });
      
      expect(result.current.modals.newModal).toEqual({
        isOpen: true,
        data: { test: true }
      });
    });

    it('should close modal', () => {
      const { result } = renderHook(() => useModals(['modal1']));
      
      // Open first
      act(() => {
        result.current.openModal('modal1', { test: true });
      });
      
      // Then close
      act(() => {
        result.current.closeModal('modal1');
      });
      
      expect(result.current.modals.modal1.isOpen).toBe(false);
    });

    it('should clear modal data after animation', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useModals(['modal1']));
      
      // Open with data
      act(() => {
        result.current.openModal('modal1', { test: true });
      });
      
      // Close
      act(() => {
        result.current.closeModal('modal1');
      });
      
      // Data should still be there immediately
      expect(result.current.modals.modal1.data).toEqual({ test: true });
      
      // Advance timers
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      // Data should be cleared
      expect(result.current.modals.modal1.data).toBeUndefined();
      
      vi.useRealTimers();
    });

    it('should toggle modal state', () => {
      const { result } = renderHook(() => useModals(['modal1']));
      
      // Toggle open
      act(() => {
        result.current.toggleModal('modal1', { test: true });
      });
      
      expect(result.current.modals.modal1).toEqual({
        isOpen: true,
        data: { test: true }
      });
      
      // Toggle close
      act(() => {
        result.current.toggleModal('modal1');
      });
      
      expect(result.current.modals.modal1.isOpen).toBe(false);
    });

    it('should close all modals', () => {
      const { result } = renderHook(() => useModals(['modal1', 'modal2']));
      
      // Open both modals
      act(() => {
        result.current.openModal('modal1');
        result.current.openModal('modal2');
      });
      
      expect(result.current.modals.modal1.isOpen).toBe(true);
      expect(result.current.modals.modal2.isOpen).toBe(true);
      
      // Close all
      act(() => {
        result.current.closeAllModals();
      });
      
      expect(result.current.modals.modal1.isOpen).toBe(false);
      expect(result.current.modals.modal2.isOpen).toBe(false);
    });

    it('should check if modal is open', () => {
      const { result } = renderHook(() => useModals(['modal1']));
      
      expect(result.current.isModalOpen('modal1')).toBe(false);
      
      act(() => {
        result.current.openModal('modal1');
      });
      
      expect(result.current.isModalOpen('modal1')).toBe(true);
    });

    it('should handle checking non-existent modal', () => {
      const { result } = renderHook(() => useModals());
      
      // This should fail with current implementation
      expect(result.current.isModalOpen('nonExistent')).toBe(false);
    });

    it('should get modal data', () => {
      const { result } = renderHook(() => useModals(['modal1']));
      
      const testData = { id: 1, name: 'Test' };
      
      act(() => {
        result.current.openModal('modal1', testData);
      });
      
      expect(result.current.getModalData('modal1')).toEqual(testData);
    });

    it('should handle getting data from non-existent modal', () => {
      const { result } = renderHook(() => useModals());
      
      // This should fail with current implementation
      expect(result.current.getModalData('nonExistent')).toBeUndefined();
    });
  });
});