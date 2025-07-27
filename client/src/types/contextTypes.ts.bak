// Type definitions for context data

export interface HelpContextData {
  userProgress?: {
    viewedTutorials?: string[];
    completedActions?: string[];
  };
}

export interface KeyboardShortcutsData {
  enabled?: boolean;
  shortcuts?: Record<string, string>;
}

export interface OnboardingContextData {
  completedFlows?: string[];
  skippedOnboarding?: boolean;
  currentStep?: number;
}

export interface ErrorReportingData {
  message?: string;
  extra?: Record<string, unknown>;
  request?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
  user?: {
    id?: string;
    email?: string;
  };
  contexts?: Record<string, unknown>;
  tags?: Record<string, string>;
  type?: string;
}
