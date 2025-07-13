import { formatDistanceToNow } from 'date-fns';
import { Check, Clock, Save, AlertCircle, WifiOff, Cloud, CloudOff } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { isOnline } from '../../utils/serviceWorkerRegistration';

import { Badge } from './Badge';
import { Button } from './Button';
import { Tooltip } from './Tooltip';

interface AutoSaveIndicatorProps {
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onManualSave?: () => void;
  className?: string;
  isOnlineProp?: boolean;
  syncStatus?: 'idle' | 'syncing' | 'error';
  syncError?: string | null;
  pendingChanges?: number;
}

export function AutoSaveIndicator({
  lastSaved,
  isSaving,
  hasUnsavedChanges,
  onManualSave,
  className = '',
  isOnlineProp,
  syncStatus = 'idle',
  syncError = null,
  pendingChanges = 0,
}: AutoSaveIndicatorProps): React.ReactElement {
  const [isOnlineState, setIsOnlineState] = useState(isOnlineProp ?? isOnline());

  useEffect((): (() => void) => {
    const handleOnline = (): void => {
 setIsOnlineState(true); 
};
    const handleOffline = (): void => {
 setIsOnlineState(false); 
};

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getStatus = (): { icon: React.ReactElement; text: string; variant: 'outline' | 'secondary' | 'destructive'; tooltip: string } => {
    // Offline status takes priority
    if (isOnlineState === false) {
      return {
        icon: <WifiOff className="w-3 h-3" />,
        text: pendingChanges > 0 ? `Offline (${pendingChanges} pending)` : 'Offline mode',
        variant: 'outline' as const,
        tooltip: 'You are working offline. Changes will sync when you reconnect.',
      };
    }

    // Syncing status
    if (syncStatus === 'syncing') {
      return {
        icon: <Cloud className="w-3 h-3 animate-pulse" />,
        text: 'Syncing...',
        variant: 'secondary' as const,
        tooltip: 'Syncing your changes with the server.',
      };
    }

    // Sync error
    if (syncStatus === 'error' && syncError !== null && syncError !== undefined && syncError !== '') {
      return {
        icon: <CloudOff className="w-3 h-3" />,
        text: 'Sync failed',
        variant: 'destructive' as const,
        tooltip: `Sync error: ${syncError}. Will retry automatically.`,
      };
    }

    // Regular save states
    if (isSaving === true) {
      return {
        icon: <Clock className="w-3 h-3 animate-spin" />,
        text: 'Saving...',
        variant: 'secondary' as const,
        tooltip: 'Saving your changes...',
      };
    }

    if (hasUnsavedChanges === true) {
      return {
        icon: <AlertCircle className="w-3 h-3" />,
        text: 'Unsaved changes',
        variant: 'destructive' as const,
        tooltip: 'You have unsaved changes. They will be saved automatically.',
      };
    }

    if (lastSaved !== null) {
      return {
        icon: <Check className="w-3 h-3" />,
        text: `Saved ${formatDistanceToNow(lastSaved)} ago`,
        variant: 'secondary' as const,
        tooltip: `Last saved at ${lastSaved.toLocaleTimeString()}`,
      };
    }

    return {
      icon: <Save className="w-3 h-3" />,
      text: 'Not saved',
      variant: 'outline' as const,
      tooltip: 'No changes to save.',
    };
  };

  const status = getStatus();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Tooltip content={status.tooltip}>
        <Badge 
          className={`flex items-center gap-1 transition-all duration-200 ${
            hasUnsavedChanges && isOnlineState ? 'animate-pulse' : ''
          } ${!isOnlineState ? 'opacity-90' : ''}`} 
          variant={status.variant}
        >
          {status.icon}
          <span className="text-xs font-medium">{status.text}</span>
        </Badge>
      </Tooltip>
      
      {/* Connection status indicator */}
      {!isOnlineState && (
        <Badge className="flex items-center gap-1 bg-yellow-50 border-yellow-200" variant="outline">
          <WifiOff className="w-3 h-3 text-yellow-600" />
          <span className="text-xs font-medium text-yellow-700">Offline</span>
        </Badge>
      )}
      
      {/* Manual save button - only show when online */}
      {hasUnsavedChanges && onManualSave && isOnlineState && (
        <Button
          className="h-6 px-2 text-xs bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          disabled={isSaving || syncStatus === 'syncing'}
          size="sm"
          variant="outline"
          onClick={onManualSave}
        >
          <Save className="w-3 h-3 mr-1" />
          Save now
        </Button>
      )}
      
      {/* Progress indicator for auto-save countdown */}
      {hasUnsavedChanges && !isSaving && isOnlineState && (
        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
            style={{ 
              width: '100%',
              animation: 'autoSaveCountdown 30s linear infinite'
            }}
          />
        </div>
      )}
      
      {/* Pending changes indicator for offline mode */}
      {!isOnlineState && pendingChanges > 0 && (
        <Tooltip content={`${pendingChanges} changes will sync when you're back online`}>
          <Badge className="h-5 px-2 text-xs" variant="secondary">
            {pendingChanges}
          </Badge>
        </Tooltip>
      )}
    </div>
  );
}

// CSS for auto-save countdown animation
const autoSaveStyles = `
  @keyframes autoSaveCountdown {
    from { width: 0%; }
    to { width: 100%; }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = autoSaveStyles;
  document.head.appendChild(styleSheet);
}

// Additional component for form headers
export function FormAutoSaveHeader({
  title,
  lastSaved,
  isSaving,
  hasUnsavedChanges,
  onManualSave,
}: {
  title: string;
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onManualSave?: () => void;
}): React.ReactElement {
  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <h3 className="text-lg font-semibold">{title}</h3>
      <AutoSaveIndicator
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onManualSave={onManualSave}
      />
    </div>
  );
}