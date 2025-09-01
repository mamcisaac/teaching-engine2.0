import React, { useCallback, useEffect } from 'react';
import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface UndoRedoProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function UndoRedo({ canUndo, canRedo, onUndo, onRedo }: UndoRedoProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) onUndo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) onRedo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);
  
  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="p-2"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        className="p-2"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}