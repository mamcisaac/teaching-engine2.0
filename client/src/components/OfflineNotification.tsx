// Offline Notification Component
// Shows a persistent notification when the app is offline

import React, { useState, useEffect } from 'react';
import { WifiOff, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';
import { isOnline } from '../utils/serviceWorkerRegistration';

export function OfflineNotification() {
  const [isOnlineState, setIsOnlineState] = useState(isOnline());
  const [dismissed, setDismissed] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnlineState(true);
      setDismissed(false);
    };
    
    const handleOffline = () => {
      setIsOnlineState(false);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    
    // Try to fetch a small resource to check connectivity
    try {
      await fetch('/api/health', { method: 'HEAD' });
      setIsOnlineState(true);
    } catch {
      setIsOnlineState(false);
    } finally {
      setRetrying(false);
    }
  };

  // Don't show if online or dismissed
  if (isOnlineState || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <WifiOff className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              You&apos;re offline
            </h3>
            <div className="mt-1 text-sm text-yellow-700">
              <p>You can continue working. Your changes will sync when you&apos;re back online.</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={retrying}
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                {retrying ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="text-yellow-700 hover:bg-yellow-100"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={() => setDismissed(true)}
              className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Conflict Resolution Modal Component
interface ConflictResolutionModalProps {
  conflict: {
    localData: unknown;
    remoteData: unknown;
    entity: string;
    entityId: string;
  };
  onResolve: (resolution: 'local' | 'remote' | 'merge', mergedData?: unknown) => void;
  onCancel: () => void;
}

export function ConflictResolutionModal({ 
  conflict, 
  onResolve, 
  onCancel 
}: ConflictResolutionModalProps) {
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'remote' | 'merge'>('local');
  const [_mergedData, _setMergedData] = useState<unknown>(null);

  const handleResolve = () => {
    if (selectedResolution === 'merge' && _mergedData) {
      onResolve('merge', _mergedData);
    } else {
      onResolve(selectedResolution);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Sync Conflict Detected
            </h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Your offline changes conflict with updates from the server. Please choose how to resolve this conflict.
          </p>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
          <div className="space-y-4">
            {/* Local version */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="local"
                  checked={selectedResolution === 'local'}
                  onChange={(e) => setSelectedResolution(e.target.value as 'local')}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Keep your version</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Use the changes you made while offline
                  </div>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
                    {JSON.stringify(conflict.localData, null, 2)}
                  </div>
                </div>
              </label>
            </div>

            {/* Remote version */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="remote"
                  checked={selectedResolution === 'remote'}
                  onChange={(e) => setSelectedResolution(e.target.value as 'remote')}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Keep server version</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Discard your offline changes and use the server version
                  </div>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono overflow-x-auto">
                    {JSON.stringify(conflict.remoteData, null, 2)}
                  </div>
                </div>
              </label>
            </div>

            {/* Merge option (if applicable) */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="merge"
                  checked={selectedResolution === 'merge'}
                  onChange={(e) => setSelectedResolution(e.target.value as 'merge')}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Merge changes</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Combine both versions (recommended for non-conflicting changes)
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleResolve}>
            Resolve Conflict
          </Button>
        </div>
      </div>
    </div>
  );
}

// CSS for animations
const styles = `
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}