import { useEffect, useRef, useCallback, useState } from 'react';
import { useKeyboardShortcut } from './useKeyboardShortcut';

interface GridPosition {
  row: number;
  col: number;
}

interface UseWeeklyPlanAccessibilityProps {
  rows: number; // Number of time slots
  cols: number; // Number of days
  onCellSelect?: (row: number, col: number) => void;
  onCellActivate?: (row: number, col: number) => void;
  onQuickAdd?: (row: number, col: number) => void;
  onEscape?: () => void;
  disabled?: boolean;
}

export function useWeeklyPlanAccessibility({
  rows,
  cols,
  onCellSelect,
  onCellActivate,
  onQuickAdd,
  onEscape,
  disabled = false
}: UseWeeklyPlanAccessibilityProps) {
  const [currentPosition, setCurrentPosition] = useState<GridPosition>({ row: 0, col: 0 });
  const [isNavigating, setIsNavigating] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLElement>>(new Map());
  
  // Generate cell key
  const getCellKey = (row: number, col: number) => `${row}-${col}`;
  
  // Register cell ref
  const registerCell = useCallback((row: number, col: number, element: HTMLElement | null) => {
    const key = getCellKey(row, col);
    if (element) {
      cellRefs.current.set(key, element);
    } else {
      cellRefs.current.delete(key);
    }
  }, []);
  
  // Focus on current cell
  const focusCurrentCell = useCallback(() => {
    const key = getCellKey(currentPosition.row, currentPosition.col);
    const cell = cellRefs.current.get(key);
    if (cell) {
      cell.focus();
      cell.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      
      // Announce to screen reader
      const timeSlot = cell.getAttribute('data-time') || '';
      const day = cell.getAttribute('data-day') || '';
      const hasLesson = cell.getAttribute('data-has-lesson') === 'true';
      
      const announcement = `${day}, ${timeSlot}. ${hasLesson ? 'Has lesson. Press Enter to edit.' : 'Empty. Press Space to add lesson.'}`;
      announceToScreenReader(announcement);
    }
  }, [currentPosition]);
  
  // Move focus
  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (disabled || !isNavigating) return;
    
    setCurrentPosition(prev => {
      let newRow = prev.row;
      let newCol = prev.col;
      
      switch (direction) {
        case 'up':
          newRow = Math.max(0, prev.row - 1);
          break;
        case 'down':
          newRow = Math.min(rows - 1, prev.row + 1);
          break;
        case 'left':
          newCol = Math.max(0, prev.col - 1);
          break;
        case 'right':
          newCol = Math.min(cols - 1, prev.col + 1);
          break;
      }
      
      if (newRow !== prev.row || newCol !== prev.col) {
        onCellSelect?.(newRow, newCol);
      }
      
      return { row: newRow, col: newCol };
    });
  }, [disabled, isNavigating, rows, cols, onCellSelect]);
  
  // Jump to specific positions
  const jumpToToday = useCallback(() => {
    const todayCol = new Date().getDay() - 1; // Monday = 0
    if (todayCol >= 0 && todayCol < cols) {
      setCurrentPosition({ row: 0, col: todayCol });
      setIsNavigating(true);
    }
  }, [cols]);
  
  const jumpToFirstEmpty = useCallback(() => {
    // Find first empty cell
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const key = getCellKey(row, col);
        const cell = cellRefs.current.get(key);
        if (cell && cell.getAttribute('data-has-lesson') !== 'true') {
          setCurrentPosition({ row, col });
          setIsNavigating(true);
          return;
        }
      }
    }
  }, [rows, cols]);
  
  // Keyboard shortcuts
  useKeyboardShortcut(
    () => moveFocus('up'),
    {
      key: 'ArrowUp',
      description: 'Move up in schedule grid',
      category: 'navigation',
      preventDefault: true
    }
  );
  
  useKeyboardShortcut(
    () => moveFocus('down'),
    {
      key: 'ArrowDown',
      description: 'Move down in schedule grid',
      category: 'navigation',
      preventDefault: true
    }
  );
  
  useKeyboardShortcut(
    () => moveFocus('left'),
    {
      key: 'ArrowLeft',
      description: 'Move left in schedule grid',
      category: 'navigation',
      preventDefault: true
    }
  );
  
  useKeyboardShortcut(
    () => moveFocus('right'),
    {
      key: 'ArrowRight',
      description: 'Move right in schedule grid',
      category: 'navigation',
      preventDefault: true
    }
  );
  
  useKeyboardShortcut(
    () => {
      if (isNavigating) {
        onCellActivate?.(currentPosition.row, currentPosition.col);
      }
    },
    {
      key: 'Enter',
      description: 'Activate selected cell',
      category: 'navigation',
      preventDefault: true
    }
  );
  
  useKeyboardShortcut(
    () => {
      if (isNavigating) {
        onQuickAdd?.(currentPosition.row, currentPosition.col);
      }
    },
    {
      key: ' ', // Space
      description: 'Quick add lesson to selected cell',
      category: 'navigation',
      preventDefault: true
    }
  );
  
  useKeyboardShortcut(
    () => {
      setIsNavigating(false);
      onEscape?.();
    },
    {
      key: 'Escape',
      description: 'Exit grid navigation',
      category: 'navigation'
    }
  );
  
  useKeyboardShortcut(
    () => setIsNavigating(true),
    {
      key: 'g',
      ctrl: true,
      description: 'Start grid navigation',
      category: 'navigation'
    }
  );
  
  useKeyboardShortcut(
    jumpToToday,
    {
      key: 't',
      alt: true,
      description: 'Jump to today',
      category: 'navigation'
    }
  );
  
  useKeyboardShortcut(
    jumpToFirstEmpty,
    {
      key: 'e',
      alt: true,
      description: 'Jump to first empty slot',
      category: 'navigation'
    }
  );
  
  // Focus current cell when position changes
  useEffect(() => {
    if (isNavigating) {
      focusCurrentCell();
    }
  }, [currentPosition, isNavigating, focusCurrentCell]);
  
  // Handle Tab key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      
      if (e.key === 'Tab') {
        if (isNavigating) {
          e.preventDefault();
          if (e.shiftKey) {
            moveFocus(currentPosition.col === 0 ? 'up' : 'left');
            if (currentPosition.col === 0 && currentPosition.row > 0) {
              setCurrentPosition(prev => ({ row: prev.row - 1, col: cols - 1 }));
            }
          } else {
            moveFocus(currentPosition.col === cols - 1 ? 'down' : 'right');
            if (currentPosition.col === cols - 1 && currentPosition.row < rows - 1) {
              setCurrentPosition(prev => ({ row: prev.row + 1, col: 0 }));
            }
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isNavigating, currentPosition, rows, cols, moveFocus]);
  
  return {
    gridRef,
    registerCell,
    currentPosition,
    isNavigating,
    setIsNavigating,
    moveFocus,
    jumpToToday,
    jumpToFirstEmpty,
    focusCurrentCell
  };
}

// Helper function to announce to screen readers
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Hook for skip navigation links
export function useSkipNavigation() {
  const skipToContent = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  }, []);
  
  const skipToNavigation = useCallback(() => {
    const navigation = document.getElementById('main-navigation');
    if (navigation) {
      navigation.focus();
    }
  }, []);
  
  const skipToSchedule = useCallback(() => {
    const schedule = document.getElementById('weekly-schedule');
    if (schedule) {
      schedule.focus();
      schedule.scrollIntoView();
    }
  }, []);
  
  return {
    skipToContent,
    skipToNavigation,
    skipToSchedule
  };
}