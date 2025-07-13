import { useEffect, useRef, useState } from 'react';

import { useToast } from '../components/ui/use-toast';
import logger from '../utils/logger';
interface UseAutoSaveOptions<T> {
  data: T;
  saveFn: (data: T) => Promise<void>;
  delay?: number; // milliseconds
  enabled?: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave<T>({
  data,
  saveFn,
  delay = 30000, // 30 seconds default
  enabled = true,
  onSaveSuccess,
  onSaveError
}: UseAutoSaveOptions<T>): {
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveNow: () => Promise<void>;
} {
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<T>(data);

  // Track changes
  useEffect(() => {
    const dataString = JSON.stringify(data);
    const lastDataString = JSON.stringify(lastDataRef.current);
    
    if (dataString !== lastDataString && lastSaved !== null) {
      setHasUnsavedChanges(true);
    }
    
    lastDataRef.current = data as Record<string, unknown>;
  }, [data, lastSaved]);

  // Auto-save logic
  useEffect(() => {
    if (enabled === false || hasUnsavedChanges === false || isSaving === true) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await saveFn(data);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        
        toast({
          title: 'Auto-saved',
          description: 'Your changes have been automatically saved.',
          duration: 2000,
        });

        onSaveSuccess?.();
      } catch (_error) {
        logger.error('Auto-save failed:', _error);
        
        toast({
          title: 'Auto-save failed',
          description: 'Failed to save automatically. Please save manually.',
          variant: 'destructive',
          duration: 5000,
        });

        onSaveError?.(_error as Error);
      } finally {
        setIsSaving(false);
      }
    }, delay);

    return (): void => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, hasUnsavedChanges, enabled, delay, isSaving, saveFn, toast, onSaveSuccess, onSaveError]);

  // Manual save function
  const saveNow = async (): Promise<void> => {
    if (isSaving === true) {
return;
}
    
    try {
      setIsSaving(true);
      await saveFn(data);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      toast({
        title: 'Saved',
        description: 'Your changes have been saved.',
        duration: 2000,
      });

      onSaveSuccess?.();
    } catch (_error) {
      logger.error('Manual save failed:', _error);
      
      toast({
        title: 'Save failed',
        description: 'Failed to save your changes. Please try again.',
        variant: 'destructive',
      });

      onSaveError?.(_error as Error);
      throw _error;
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => (): void => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    }, []);

  return {
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    saveNow,
  };
}

// Hook for warning about unsaved changes before leaving
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean): void {
  useEffect(() => {

    const handleBeforeUnload = (e: BeforeUnloadEvent): string | undefined => {
      if (hasUnsavedChanges === true) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return (): void => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}