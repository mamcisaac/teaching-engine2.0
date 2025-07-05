import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Draft } from 'immer';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'input' | 'none';
  nextButtonText?: string;
  skipButtonText?: string;
  showSkip?: boolean;
  requiresAction?: boolean;
  highlightPadding?: number;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  completionMessage?: string;
  estimatedTime?: number; // in minutes
}

interface OnboardingState {
  isFirstTimeUser: boolean;
  currentFlow: OnboardingFlow | null;
  currentStepIndex: number;
  completedFlows: string[];
  skippedOnboarding: boolean;
  showOnboarding: boolean;

  // Actions
  startOnboarding: (flowId?: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setShowOnboarding: (show: boolean) => void;

  // Computed values
  isOnboardingActive: boolean;
  currentStep: OnboardingStep | null;
  progress: number;
  canGoBack: boolean;
  canGoForward: boolean;
}

// French Immersion Grade 1 specific onboarding flow
const MAIN_ONBOARDING_FLOW: OnboardingFlow = {
  id: 'main-onboarding',
  name: 'Welcome to Teaching Engine',
  description: 'Get started with your Grade 1 French Immersion planning',
  estimatedTime: 5,
  steps: [
    {
      id: 'welcome',
      title: 'Bienvenue, Marie-Claire!',
      description:
        "Welcome to Teaching Engine 2.0. Let's take 5 minutes to set up your Grade 1 French Immersion classroom and show you how to save hours on lesson planning.",
      position: 'center',
      action: 'none',
      nextButtonText: "Let's Start",
      showSkip: true,
      skipButtonText: "I'll explore on my own",
    },
    {
      id: 'dashboard-overview',
      title: 'Your Planning Dashboard',
      description:
        'This is your home base. From here, you can quickly create lessons, view your weekly plans, and access French Immersion resources.',
      targetElement: '.container.mx-auto',
      position: 'bottom',
      action: 'none',
      nextButtonText: 'Got it',
      showSkip: true,
    },
    {
      id: 'quick-lesson',
      title: 'Create Your First Lesson',
      description:
        'Let\'s start with a quick lesson. Click "Commencer la planification" to create a French Immersion lesson plan in minutes.',
      targetElement: '#start-planning',
      position: 'bottom',
      action: 'click',
      requiresAction: true,
      nextButtonText: 'Click the button above',
      highlightPadding: 10,
    },
    {
      id: 'french-resources',
      title: 'French Immersion Resources',
      description:
        'Access templates, parent communications in both languages, and Grade 1 specific activities. Everything is tailored for your bilingual classroom.',
      targetElement: '.grid.gap-8',
      position: 'top',
      action: 'none',
      nextButtonText: 'Show me more',
    },
    {
      id: 'ai-assistance',
      title: 'Your AI Teaching Assistant',
      description:
        'The AI understands both French and English. It can suggest activities, create bilingual materials, and adapt to Ontario curriculum standards.',
      targetElement: '#ai-help',
      position: 'left',
      action: 'hover',
      nextButtonText: 'Amazing!',
    },
    {
      id: 'help-available',
      title: 'Help is Always Here',
      description:
        'Click the Help button anytime for tutorials, tips, and support. You can also restart this tour from the Help menu.',
      targetElement: 'button:has(.lucide-help-circle)',
      position: 'left',
      action: 'none',
      nextButtonText: "Let's create a lesson!",
    },
  ],
  completionMessage: "You're all set! Let's create your first French Immersion lesson plan.",
};

// Tutorial flows for specific features
export const TUTORIAL_FLOWS: Record<string, OnboardingFlow> = {
  'main-onboarding': MAIN_ONBOARDING_FLOW,
  'lesson-planning': {
    id: 'lesson-planning',
    name: 'Creating a Lesson Plan',
    description: 'Learn how to create an ETFO-aligned lesson plan',
    estimatedTime: 3,
    steps: [
      {
        id: 'lesson-basics',
        title: 'Lesson Planning Basics',
        description:
          'Fill in the lesson title, grade level, and subject. For French Immersion, you can write in either language.',
        position: 'right',
        action: 'input',
        nextButtonText: 'Next',
      },
      {
        id: 'curriculum-alignment',
        title: 'Curriculum Alignment',
        description:
          'Select Ontario curriculum expectations. The system will suggest related expectations automatically.',
        position: 'right',
        action: 'click',
        nextButtonText: 'Continue',
      },
      {
        id: 'ai-suggestions',
        title: 'AI-Powered Suggestions',
        description:
          'Click "Generate with AI" to get activity suggestions tailored to Grade 1 French Immersion.',
        position: 'top',
        action: 'click',
        nextButtonText: 'Try it out',
      },
    ],
  },
  'weekly-planning': {
    id: 'weekly-planning',
    name: 'Weekly Planning View',
    description: 'Organize your week efficiently',
    estimatedTime: 2,
    steps: [
      {
        id: 'week-overview',
        title: 'Your Week at a Glance',
        description:
          'See all your lessons, activities, and assessments in one view. Drag and drop to reorganize.',
        position: 'center',
        nextButtonText: 'Show me',
      },
      {
        id: 'quick-add',
        title: 'Quick Add Activities',
        description:
          'Click any time slot to add a quick activity or lesson. Perfect for those last-minute changes.',
        position: 'right',
        action: 'click',
        nextButtonText: 'Got it',
      },
    ],
  },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    immer<OnboardingState>((set, get) => {
      const updateComputedValues = (state: Draft<OnboardingState>) => {
        state.isOnboardingActive = !!state.currentFlow;
        state.currentStep = state.currentFlow?.steps[state.currentStepIndex] || null;
        state.progress = state.currentFlow
          ? ((state.currentStepIndex + 1) / state.currentFlow.steps.length) * 100
          : 0;
        state.canGoBack = state.currentStepIndex > 0;
        state.canGoForward =
          !!state.currentFlow && state.currentStepIndex < state.currentFlow.steps.length - 1;
      };

      return {
        // Initial state
        isFirstTimeUser: true,
        currentFlow: null,
        currentStepIndex: 0,
        completedFlows: [],
        skippedOnboarding: false,
        showOnboarding: false,
        isOnboardingActive: false,
        currentStep: null,
        progress: 0,
        canGoBack: false,
        canGoForward: false,

        // Actions
        startOnboarding: (flowId: string = 'main-onboarding') => {
          const flow = TUTORIAL_FLOWS[flowId];
          if (flow) {
            set((state) => {
              state.currentFlow = flow;
              state.currentStepIndex = 0;
              state.showOnboarding = true;
              updateComputedValues(state);
            });
          }
        },

        nextStep: () => {
          const state = get();
          if (!state.currentFlow) return;

          if (state.currentStepIndex < state.currentFlow.steps.length - 1) {
            set((draft) => {
              draft.currentStepIndex += 1;
              updateComputedValues(draft);
            });
          } else {
            state.completeOnboarding();
          }
        },

        previousStep: () => {
          const state = get();
          if (state.currentStepIndex > 0) {
            set((draft) => {
              draft.currentStepIndex -= 1;
              updateComputedValues(draft);
            });
          }
        },

        skipOnboarding: () => {
          set((state) => {
            state.currentFlow = null;
            state.currentStepIndex = 0;
            state.skippedOnboarding = true;
            state.showOnboarding = false;
            state.isFirstTimeUser = false;
            updateComputedValues(state);
          });
        },

        completeOnboarding: () => {
          const state = get();
          if (state.currentFlow) {
            set((draft) => {
              if (draft.currentFlow && !draft.completedFlows.includes(draft.currentFlow.id)) {
                draft.completedFlows.push(draft.currentFlow.id);
              }
              draft.currentFlow = null;
              draft.currentStepIndex = 0;
              draft.showOnboarding = false;
              draft.isFirstTimeUser = false;
              updateComputedValues(draft);
            });
          }
        },

        resetOnboarding: () => {
          set((state) => {
            state.isFirstTimeUser = true;
            state.currentFlow = null;
            state.currentStepIndex = 0;
            state.completedFlows = [];
            state.skippedOnboarding = false;
            state.showOnboarding = true;
            updateComputedValues(state);
          });
          get().startOnboarding('main-onboarding');
        },

        setShowOnboarding: (show: boolean) => {
          set((state) => {
            state.showOnboarding = show;
            updateComputedValues(state);
          });
        },
      };
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        completedFlows: state.completedFlows,
        skippedOnboarding: state.skippedOnboarding,
        isFirstTimeUser: state.isFirstTimeUser,
      }),
    },
  ),
);

// Hook to check if a specific flow has been completed
export const useOnboardingComplete = (flowId: string) => {
  return useOnboardingStore((state) => state.completedFlows.includes(flowId));
};

// Selector hooks for performance
export const useOnboardingActive = () => useOnboardingStore((state) => state.isOnboardingActive);
export const useCurrentStep = () => useOnboardingStore((state) => state.currentStep);
export const useOnboardingProgress = () => useOnboardingStore((state) => state.progress);
