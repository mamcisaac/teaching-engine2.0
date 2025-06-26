import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api';

export interface AIStatusInfo {
  available: boolean;
  hasApiKey: boolean;
  apiKeyConfigured: boolean;
  serviceHealth: 'healthy' | 'degraded' | 'unavailable';
  features: {
    planGeneration: boolean;
    contentSuggestions: boolean;
    curriculumAnalysis: boolean;
    resourceRecommendations: boolean;
  };
  limitations?: {
    requestsPerHour?: number;
    requestsRemaining?: number;
    quotaUsed?: number;
    quotaLimit?: number;
  };
  lastChecked?: Date;
  error?: string;
}

export interface AIStatusHookReturn {
  aiStatus: AIStatusInfo;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isAIEnabled: boolean;
  canUseAI: boolean;
  aiDisabledReason?: string;
  enableAI: () => void;
  disableAI: () => void;
}

const DEFAULT_AI_STATUS: AIStatusInfo = {
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
};

export function useAIStatus(): AIStatusHookReturn {
  const [userDisabledAI, setUserDisabledAI] = useState(() => {
    // Check if user has manually disabled AI for this session
    return sessionStorage.getItem('ai_disabled') === 'true';
  });

  // Query AI service status
  const {
    data: aiStatus = DEFAULT_AI_STATUS,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AIStatusInfo>({
    queryKey: ['ai-status'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/ai/status');
        return {
          ...response.data,
          lastChecked: new Date(),
        };
      } catch (error: unknown) {
        // Handle different types of errors
        if (error.response?.status === 503) {
          return {
            ...DEFAULT_AI_STATUS,
            error: 'AI service is temporarily unavailable',
            serviceHealth: 'unavailable' as const,
          };
        } else if (error.response?.status === 401) {
          return {
            ...DEFAULT_AI_STATUS,
            error: 'API key not configured or invalid',
            hasApiKey: false,
            apiKeyConfigured: false,
          };
        } else if (error.response?.status === 429) {
          return {
            ...DEFAULT_AI_STATUS,
            error: 'Rate limit exceeded',
            serviceHealth: 'degraded' as const,
          };
        }
        
        // Network or other errors
        return {
          ...DEFAULT_AI_STATUS,
          error: 'Unable to check AI service status',
          serviceHealth: 'unavailable' as const,
        };
      }
    },
    retry: (failureCount, error: unknown) => {
      // Don't retry on auth errors or client errors
      if (error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });

  const isAIEnabled = !userDisabledAI && aiStatus.available;
  const canUseAI = isAIEnabled && aiStatus.hasApiKey && aiStatus.serviceHealth !== 'unavailable';

  const getAIDisabledReason = (): string | undefined => {
    if (userDisabledAI) {
      return 'AI features have been manually disabled';
    }
    if (!aiStatus.available) {
      return 'AI service is not available';
    }
    if (!aiStatus.hasApiKey) {
      return 'OpenAI API key is not configured';
    }
    if (aiStatus.serviceHealth === 'unavailable') {
      return 'AI service is currently unavailable';
    }
    return undefined;
  };

  const enableAI = () => {
    setUserDisabledAI(false);
    sessionStorage.removeItem('ai_disabled');
    // Refetch status to get current availability
    refetch();
  };

  const disableAI = () => {
    setUserDisabledAI(true);
    sessionStorage.setItem('ai_disabled', 'true');
  };

  return {
    aiStatus,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    isAIEnabled,
    canUseAI,
    aiDisabledReason: getAIDisabledReason(),
    enableAI,
    disableAI,
  };
}

// Hook for checking specific AI features
export function useAIFeature(feature: keyof AIStatusInfo['features']) {
  const { aiStatus, canUseAI } = useAIStatus();
  
  return {
    available: canUseAI && aiStatus.features[feature],
    status: aiStatus.serviceHealth,
    limitations: aiStatus.limitations,
  };
}

// Hook for AI quota management
export function useAIQuota() {
  const { aiStatus } = useAIStatus();
  
  const quotaPercentage = aiStatus.limitations?.quotaLimit 
    ? (aiStatus.limitations.quotaUsed || 0) / aiStatus.limitations.quotaLimit * 100
    : 0;

  const isNearQuotaLimit = quotaPercentage > 80;
  const isQuotaExceeded = quotaPercentage >= 100;

  return {
    quotaUsed: aiStatus.limitations?.quotaUsed || 0,
    quotaLimit: aiStatus.limitations?.quotaLimit || 0,
    quotaPercentage,
    requestsRemaining: aiStatus.limitations?.requestsRemaining || 0,
    requestsPerHour: aiStatus.limitations?.requestsPerHour || 0,
    isNearQuotaLimit,
    isQuotaExceeded,
  };
}

// Component for displaying AI status
interface AIStatusIndicatorProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export function AIStatusIndicator({ 
  showDetails = false, 
  compact = false,
  className = '' 
}: AIStatusIndicatorProps) {
  const { aiStatus, canUseAI, aiDisabledReason } = useAIStatus();

  const getStatusColor = () => {
    if (!canUseAI) return 'text-red-500 bg-red-100';
    if (aiStatus.serviceHealth === 'degraded') return 'text-yellow-500 bg-yellow-100';
    return 'text-green-500 bg-green-100';
  };

  const getStatusText = () => {
    if (!canUseAI) return 'Unavailable';
    if (aiStatus.serviceHealth === 'degraded') return 'Limited';
    return 'Available';
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor()} ${className}`}>
        <div className="w-2 h-2 rounded-full bg-current" />
        AI {getStatusText()}
      </div>
    );
  }

  return (
    <div className={`p-3 border rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor().split(' ')[1]}`} />
        <span className="font-medium">AI Assistant: {getStatusText()}</span>
      </div>
      
      {aiDisabledReason && (
        <p className="text-sm text-gray-600 mb-2">{aiDisabledReason}</p>
      )}

      {showDetails && canUseAI && (
        <div className="text-sm text-gray-600">
          <div>Features: {Object.entries(aiStatus.features)
            .filter(([, enabled]) => enabled)
            .map(([feature]) => feature)
            .join(', ') || 'None'}</div>
          {aiStatus.limitations?.requestsRemaining && (
            <div>Requests remaining: {aiStatus.limitations.requestsRemaining}</div>
          )}
          {aiStatus.lastChecked && (
            <div>Last checked: {aiStatus.lastChecked.toLocaleTimeString()}</div>
          )}
        </div>
      )}
    </div>
  );
}

// Provider for AI status context
import React, { createContext, useContext, ReactNode } from 'react';

const AIStatusContext = createContext<AIStatusHookReturn | null>(null);

interface AIStatusProviderProps {
  children: ReactNode;
}

export function AIStatusProvider({ children }: AIStatusProviderProps) {
  const aiStatusData = useAIStatus();
  
  return (
    <AIStatusContext.Provider value={aiStatusData}>
      {children}
    </AIStatusContext.Provider>
  );
}

export function useAIStatusContext() {
  const context = useContext(AIStatusContext);
  if (!context) {
    throw new Error('useAIStatusContext must be used within AIStatusProvider');
  }
  return context;
}