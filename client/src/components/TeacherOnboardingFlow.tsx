import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiClient as _apiClient } from '../api/core/client';
import { STORAGE_KEYS, CORE_SUBJECTS } from '../constants/subjects';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { logger } from '../utils/logger';
import { safeJsonParse } from '../utils/typeGuards';

import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface TeacherOnboardingFlowProps {
  onComplete?: () => void;
}

export function TeacherOnboardingFlow({ onComplete }: TeacherOnboardingFlowProps): React.ReactElement | null {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { state, isOnboardingActive: _isOnboardingActive } = useOnboarding();

  // Focus on subject selection - show if user is authenticated AND no subjects are selected or onboarding was reset
  const [visible, setVisible] = useState(() => {
    // Don't show if user is not authenticated
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      const subjects = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECTS);
      const parsedSubjects = safeJsonParse<string[]>(subjects, []);
      const firstTimeUser = localStorage.getItem('teachingEngine_firstTimeUser');
      const onboardingState = localStorage.getItem('teachingEngine_onboarding');
      const onboardingData = onboardingState ? safeJsonParse<{skippedOnboarding?: boolean}>(onboardingState, {}) : {};
      
      // Show if no subjects selected AND user hasn't completed or skipped onboarding
      return parsedSubjects.length === 0 && firstTimeUser !== 'false' && !onboardingData.skippedOnboarding;
    } catch (error) {
      // Error in visibility check - default to not showing
      return false;
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('onboarding-completed-steps');
      return (saved !== null && saved !== '') ? safeJsonParse(saved, []) : [];
    } catch {
      return [];
    }
  });
  
  // Track selected teaching subjects
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Français (Immersion)',
    'Mathématiques',
    'Sciences',
    'Études sociales',
    'English Language Arts',
    'Arts'
  ]);

  // Use onboarding context for completion
  const { completeOnboarding: contextCompleteOnboarding } = useOnboarding();
  
  // Define completeOnboarding first
  const completeOnboarding = useCallback((): void => {
    contextCompleteOnboarding(); // Use the context's complete function
    localStorage.setItem('teachingEngine_firstTimeUser', 'false'); // Ensure this is set
    setVisible(false);
    onComplete?.();
  }, [contextCompleteOnboarding, onComplete]);

  // Watch for changes that should trigger subject selection
  useEffect(() => {
    const checkVisibility = () => {
      // Don't show if user is not authenticated
      if (!isAuthenticated || !user) {
        setVisible(false);
        return;
      }

      try {
        const subjects = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECTS);
        const parsedSubjects = safeJsonParse<string[]>(subjects, []);
        const firstTimeUser = localStorage.getItem('teachingEngine_firstTimeUser');
        const onboardingState = localStorage.getItem('teachingEngine_onboarding');
        const onboardingData = onboardingState ? safeJsonParse<{skippedOnboarding?: boolean}>(onboardingState, {}) : {};
        
        // Show if no subjects selected AND user hasn't completed or skipped onboarding  
        const shouldShow = parsedSubjects.length === 0 && firstTimeUser !== 'false' && !onboardingData.skippedOnboarding;
        setVisible(shouldShow);
      } catch (error) {
        // Error in checkVisibility - default to not showing
        setVisible(false);
      }
    };

    checkVisibility();
    
    // Listen for localStorage changes (from other tabs or the resetOnboarding call)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.TEACHER_SUBJECTS || e.key === 'onboarded') {
        checkVisibility();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, user]);

  // Also watch for onboarding context changes (when resetOnboarding is called)
  useEffect(() => {
    // Don't show if user is not authenticated
    if (!isAuthenticated || !user) {
      setVisible(false);
      return;
    }

    if (state.isFirstTimeUser && !state.skippedOnboarding) {
      setVisible(true);
      // Force re-check after context changes
      setTimeout(() => {
        const subjects = localStorage.getItem(STORAGE_KEYS.TEACHER_SUBJECTS);
        const parsedSubjects = safeJsonParse<string[]>(subjects, []);
        if (parsedSubjects.length === 0) {
          setVisible(true);
        }
      }, 100);
    }
  }, [state.isFirstTimeUser, state.skippedOnboarding, isAuthenticated, user]);

  // Save completed steps to localStorage with debouncing to prevent flashing
  useEffect(() => {
    return () => { // Cleanup
    };

    if (completedSteps.length > 0) {
      try {
        localStorage.setItem('onboarding-completed-steps', JSON.stringify(completedSteps));
      } catch (_error) {
        logger.warn('Failed to save onboarding progress:', _error);
      }
    }
  }, [completedSteps]);

  // Handle escape key to close wizard
  useEffect(() => {
    return () => { // Cleanup
    };

    if (!visible) {
return;
}

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        completeOnboarding();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, completeOnboarding]);

  const markStepCompleted = (stepId: string): void => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
  };

  const toggleSubject = (subject: string): void => {
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };


  const skipToStep = (stepIndex: number): void => {
    setCurrentStep(stepIndex);
  };

  const nextStep = (): void => {
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(nextStepIndex);
    }
  };

  const previousStep = (): void => {
    const prevStepIndex = currentStep - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(prevStepIndex);
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: t('welcome_title', 'Welcome to Teaching Engine 2.0'),
      description: t(
        'welcome_description',
        'Your comprehensive digital teaching assistant designed to reduce workload by 60%',
      ),
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('built_for_teachers', 'Built for Elementary Teachers')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t(
                'built_for_teachers_desc',
                'Teaching Engine 2.0 follows the ETFO planning workflow to help you create comprehensive, curriculum-aligned lesson plans with AI assistance.',
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <h4 className="font-medium text-blue-900">ETFO Workflow</h4>
              <p className="text-sm text-blue-700 mt-1">Structured 5-level planning process</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <h4 className="font-medium text-green-900">AI Assistance</h4>
              <p className="text-sm text-green-700 mt-1">Smart suggestions and automation</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <h4 className="font-medium text-purple-900">Curriculum Planning</h4>
              <p className="text-sm text-purple-700 mt-1">
                Track curriculum coverage in your plans
              </p>
            </div>
          </div>
        </div>
      ),
      action: {
        label: t('get_started', 'Get Started'),
        onClick: (): void => {
          markStepCompleted('welcome');
          nextStep();
        },
      },
    },
    {
      id: 'etfo-workflow',
      title: t('etfo_workflow_title', 'Understanding the ETFO Planning Workflow'),
      description: t(
        'etfo_workflow_description',
        'Learn the 5-level structured approach to lesson planning',
      ),
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 mb-6">
            Teaching Engine 2.0 follows the Elementary Teachers' Federation of Ontario (ETFO)
            planning methodology, ensuring your lesson plans are comprehensive and effective.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Curriculum Expectations</h4>
                <p className="text-sm text-blue-700">Define learning goals and success criteria</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Long-Range Plans</h4>
                <p className="text-sm text-green-700">Organize learning across terms and years</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-purple-900">Unit Plans</h4>
                <p className="text-sm text-purple-700">Break down learning into manageable units</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-orange-900">Lesson Plans</h4>
                <p className="text-sm text-orange-700">
                  Design detailed daily learning experiences
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
              <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h4 className="font-semibold text-red-900">Daybook Entries</h4>
                <p className="text-sm text-red-700">Record daily observations and reflections</p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: t('continue', 'Continue'),
        onClick: (): void => {
          markStepCompleted('etfo-workflow');
          nextStep();
        },
      },
    },
    {
      id: 'navigation',
      title: t('navigation_title', 'Navigate Your Teaching Dashboard'),
      description: t(
        'navigation_description',
        'Learn how to use the sidebar and access key features',
      ),
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold mb-4">Sidebar Navigation</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">ETFO Planning Workflow</h4>
                  <p className="text-sm text-gray-600">
                    Follow the structured 5-step planning process with progress tracking
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Planning Dashboard</h4>
                  <p className="text-sm text-gray-600">
                    Overview of your teaching plans and progress
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Curriculum</h4>
                  <p className="text-sm text-gray-600">
                    Manage curriculum expectations and track coverage
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  fillRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800">Pro Tip</h4>
                <p className="text-sm text-yellow-700">
                  You can collapse the sidebar by clicking the arrow icon for more workspace!
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: t('continue', 'Continue'),
        onClick: (): void => {
          markStepCompleted('navigation');
          nextStep();
        },
      },
    },
    {
      id: 'subject-selection',
      title: t('subject_selection_title', 'Select Your Teaching Subjects'),
      description: t(
        'subject_selection_description',
        'Choose which subjects you teach so we can personalize your experience',
      ),
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Your Teaching Subjects</h3>
            <p className="text-gray-600">
              Select all the subjects you teach. Don't worry, you can change this later in settings.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium mb-4">Core Subjects (Usually taught by homeroom teacher):</h4>
            <div className="space-y-3 mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedSubjects.includes('Français (Immersion)')}
                  onChange={() => toggleSubject('Français (Immersion)')}
                />
                <span className="text-gray-700">Français (Immersion) (French Language Arts)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedSubjects.includes('Mathématiques')}
                  onChange={() => toggleSubject('Mathématiques')}
                />
                <span className="text-gray-700">Mathématiques (Mathematics)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedSubjects.includes('Sciences')}
                  onChange={() => toggleSubject('Sciences')}
                />
                <span className="text-gray-700">Sciences</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedSubjects.includes('Études sociales')}
                  onChange={() => toggleSubject('Études sociales')}
                />
                <span className="text-gray-700">Études sociales (Social Studies)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedSubjects.includes('English Language Arts')}
                  onChange={() => toggleSubject('English Language Arts')}
                />
                <span className="text-gray-700">English Language Arts</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedSubjects.includes('Arts')}
                  onChange={() => toggleSubject('Arts')}
                />
                <span className="text-gray-700">Arts visuels et dramatiques (Visual & Drama Arts)</span>
              </label>
            </div>

            <h4 className="font-medium mb-4">Specialist Subjects (Often taught by specialist teachers):</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedSubjects.includes('Éducation physique')}
                  onChange={() => toggleSubject('Éducation physique')}
                />
                <span className="text-gray-700">Éducation physique (Physical Education)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedSubjects.includes('Éducation à la santé')}
                  onChange={() => toggleSubject('Éducation à la santé')}
                />
                <span className="text-gray-700">Éducation à la santé (Health Education)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedSubjects.includes('Musique')}
                  onChange={() => toggleSubject('Musique')}
                />
                <span className="text-gray-700">Musique (Music)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  checked={selectedSubjects.includes('Technologie')}
                  onChange={() => toggleSubject('Technologie')}
                />
                <span className="text-gray-700">Technologie (Technology/Digital Literacy)</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  fillRule="evenodd"
                />
              </svg>
              <div>
                <h4 className="font-medium text-blue-800">Why this matters</h4>
                <p className="text-sm text-blue-700 mt-1">
                  We'll only show curriculum expectations and track progress for the subjects you teach. 
                  This keeps your planning focused and relevant to your actual teaching responsibilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: t('save_subjects', 'Save My Subjects'),
        onClick: (): void => {
          // Validate that at least core subjects are selected
          const hasRequiredSubjects = CORE_SUBJECTS.every(subject => selectedSubjects.includes(subject));
          
          if (selectedSubjects.length === 0) {
            alert('Please select at least one subject to teach.');
            return;
          }
          
          if (!hasRequiredSubjects) {
            const proceed = window.confirm(
              'You haven\'t selected all core subjects (Français and Mathématiques). ' +
              'These are typically required for Grade 1. Do you want to continue anyway?'
            );
            if (!proceed) return;
          }
          
          // Save selected subjects to localStorage for now
          // TODO: Save to user profile in database
          try {
            localStorage.setItem(STORAGE_KEYS.TEACHER_SUBJECTS, JSON.stringify(selectedSubjects));
            markStepCompleted('subject-selection');
            nextStep();
          } catch (error) {
            console.error('Failed to save subject selection:', error);
            alert('Failed to save your subject selection. Please try again.');
          }
        },
      },
    },
    {
      id: 'features',
      title: t('features_title', 'Key Features & AI Assistance'),
      description: t(
        'features_description',
        'Discover the powerful features that will transform your teaching workflow',
      ),
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h4 className="font-medium">AI Planning Assistant</h4>
              </div>
              <p className="text-sm text-gray-600">
                Get intelligent suggestions for lesson activities, assessments, and resources based
                on your curriculum goals.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h4 className="font-medium">Progress Tracking</h4>
              </div>
              <p className="text-sm text-gray-600">
                Automatically track curriculum coverage and identify gaps in your teaching plans.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h4 className="font-medium">Curriculum Import</h4>
              </div>
              <p className="text-sm text-gray-600">
                Import curriculum documents and let AI parse expectations automatically.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H9.5a2 2 0 01-2-2V5a2 2 0 00-2-2H3a2 2 0 00-2 2v4a2 2 0 002 2h2.5a2 2 0 012 2v2a2 2 0 002 2H17z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h4 className="font-medium">Smart Templates</h4>
              </div>
              <p className="text-sm text-gray-600">
                Use AI-generated lesson plan templates that adapt to your teaching style and
                curriculum.
              </p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h4 className="font-medium text-indigo-900 mb-3">Ready to Start Teaching Smarter?</h4>
            <p className="text-sm text-indigo-700 mb-4">
              You're all set! Teaching Engine 2.0 is designed to grow with you. Start by creating
              your own comprehensive teaching plans and explore all the powerful features.
            </p>
            <div className="flex items-center space-x-2 text-sm text-indigo-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  clipRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  fillRule="evenodd"
                />
              </svg>
              <span>Need help? Look for the help tooltips throughout the interface.</span>
            </div>
          </div>
        </div>
      ),
      action: {
        label: t('start_teaching', 'Start Teaching!'),
        onClick: (): void => {
          markStepCompleted('features');
          completeOnboarding();
          navigate('/planner/dashboard');
        },
      },
    },
  ];

  if (!visible) {
    return null;
  }
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
              <p className="text-gray-600 mt-1">{currentStepData.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <Button
                className="text-gray-500 hover:text-gray-700"
                size="sm"
                variant="outline"
                onClick={completeOnboarding}
              >
                {t('skip_tour', 'Skip Tour')}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {t('step_x_of_y', 'Step {0} of {1}', [
                  (currentStep + 1).toString(),
                  steps.length.toString(),
                ])}
              </span>
              <span>
                {t('percent_complete', '{0}% complete', [Math.round(progress).toString()])}
              </span>
            </div>
            <Progress className="h-2" value={progress} />
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  ((): string => {
                    if (index === currentStep) {
return 'bg-indigo-600';
}
                    if (index < currentStep) {
return 'bg-green-500';
}
                    return 'bg-gray-300';
                  })()
                }`}
                title={step.title}
                onClick={() => {
 skipToStep(index); 
}}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{currentStepData.content}</div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 flex justify-between items-center">
          {currentStep > 0 ? (
            <Button aria-label="Click button" onClick={previousStep}>
              {t('previous', 'Previous')}
            </Button>
          ) : (
            <div /> // Empty div to maintain flex layout spacing
          )}

          <div className="flex items-center space-x-3">
            {currentStepData.action ? (
              <Button
                className="min-w-[120px]"
                onClick={currentStepData.action.onClick}
              >
                {currentStepData.action.label}
              </Button>
            ) : (
              currentStep < steps.length - 1 && (
                <Button aria-label="Click button" onClick={nextStep}>
                  {t('next', 'Next')}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
