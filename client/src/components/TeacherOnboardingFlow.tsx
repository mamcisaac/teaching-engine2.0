import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
// import { Card } from './ui/card'; // Unused import
import { Progress } from './ui/Progress';
// import { Badge } from './ui/Badge'; // Unused import
import { api } from '../api';
import PreferenceWizard from './onboarding/PreferenceWizard';

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

export default function TeacherOnboardingFlow({ onComplete }: TeacherOnboardingFlowProps) {
  const [visible, setVisible] = useState(() => {
    const onboarded = localStorage.getItem('onboarded');
    const completedSteps = localStorage.getItem('onboarding-completed-steps');
    return onboarded !== 'true' || !completedSteps;
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    const saved = localStorage.getItem('onboarding-completed-steps');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCreatingSampleData, setIsCreatingSampleData] = useState(false);
  const navigate = useNavigate();

  // Define completeOnboarding first
  const completeOnboarding = () => {
    localStorage.setItem('onboarded', 'true');
    setVisible(false);
    onComplete?.();
  };

  // Save completed steps to localStorage
  useEffect(() => {
    localStorage.setItem('onboarding-completed-steps', JSON.stringify(completedSteps));
  }, [completedSteps]);

  // Handle escape key to close wizard
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && visible) {
        completeOnboarding();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [visible]);

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
  };

  const createSampleData = async () => {
    setIsCreatingSampleData(true);
    try {
      // Create sample curriculum expectations
      await api.post('/api/curriculum-expectations', {
        grade: '1',
        subject: 'Mathematics',
        strand: 'Number Sense',
        code: 'M1.NS.1',
        description:
          'demonstrate an understanding of numbers up to 20, including identifying number patterns and skip counting by 2s, 5s, and 10s',
        learningGoals: ['Count to 20', 'Identify patterns', 'Skip count'],
        successCriteria: [
          'I can count from 1 to 20',
          'I can find patterns in numbers',
          'I can skip count by 2s, 5s, and 10s',
        ],
        isSample: true,
      });

      await api.post('/api/curriculum-expectations', {
        grade: '1',
        subject: 'Language Arts',
        strand: 'Reading',
        code: 'LA1.R.1',
        description: 'read simple texts with understanding, using various reading strategies',
        learningGoals: ['Read simple texts', 'Use reading strategies', 'Demonstrate comprehension'],
        successCriteria: [
          'I can read grade-level texts',
          'I can use different strategies when reading',
          'I can answer questions about what I read',
        ],
        isSample: true,
      });

      // Create sample long-range plan
      const _longRangePlan = await api.post('/api/long-range-plans', {
        title: 'Grade 1 Fall Term Sample Plan',
        description: 'A sample long-range plan for Grade 1 covering September to December',
        startDate: new Date('2024-09-01').toISOString(),
        endDate: new Date('2024-12-20').toISOString(),
        grade: '1',
        isSample: true,
      });

      markStepCompleted('sample-data');
    } catch (error) {
      console.error('Error creating sample data:', error);
    } finally {
      setIsCreatingSampleData(false);
    }
  };

  const skipToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Teaching Engine 2.0',
      description:
        'Your comprehensive digital teaching assistant designed to reduce workload by 60%',
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Built for Elementary Teachers</h3>
            <p className="text-gray-600 mb-6">
              Teaching Engine 2.0 follows the ETFO planning workflow to help you create
              comprehensive, curriculum-aligned lesson plans with AI assistance.
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
        label: 'Get Started',
        onClick: () => {
          markStepCompleted('welcome');
          setCurrentStep(1);
        },
      },
    },
    {
      id: 'etfo-workflow',
      title: 'Understanding the ETFO Planning Workflow',
      description: 'Learn the 5-level structured approach to lesson planning',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 mb-6">
            Teaching Engine 2.0 follows the Elementary Teachers&apos; Federation of Ontario (ETFO)
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
        label: 'Continue',
        onClick: () => {
          markStepCompleted('etfo-workflow');
          setCurrentStep(2);
        },
      },
    },
    {
      id: 'sample-data',
      title: 'Set Up Sample Data',
      description: 'Let us create some sample curriculum and plans to help you explore',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sample Content</h3>
            <p className="text-gray-600 mb-6">
              We&apos;ll create sample curriculum expectations and a long-range plan so you can
              immediately explore all features of Teaching Engine 2.0.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium mb-4">Sample data includes:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Grade 1 Mathematics curriculum expectations</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Grade 1 Language Arts curriculum expectations</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Sample long-range plan for Fall term</span>
              </li>
              <li className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Ready-to-use templates and examples</span>
              </li>
            </ul>
          </div>

          {completedSteps.includes('sample-data') && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-800 font-medium">
                  Sample data created successfully!
                </span>
              </div>
            </div>
          )}
        </div>
      ),
      action: {
        label: completedSteps.includes('sample-data') ? 'Continue' : 'Create Sample Data',
        onClick: () => {
          if (completedSteps.includes('sample-data')) {
            setCurrentStep(3);
          } else {
            createSampleData();
          }
        },
      },
    },
    {
      id: 'navigation',
      title: 'Navigate Your Teaching Dashboard',
      description: 'Learn how to use the sidebar and access key features',
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
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
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
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
        label: 'Continue',
        onClick: () => {
          markStepCompleted('navigation');
          setCurrentStep(4);
        },
      },
    },
    {
      id: 'preferences',
      title: 'Customize Your Experience',
      description: 'Set your preferences to personalize Teaching Engine 2.0',
      content: (
        <PreferenceWizard
          onComplete={() => {
            markStepCompleted('preferences');
            setCurrentStep(5);
          }}
          onSkip={() => {
            markStepCompleted('preferences');
            setCurrentStep(5);
          }}
        />
      ),
    },
    {
      id: 'features',
      title: 'Key Features & AI Assistance',
      description: 'Discover the powerful features that will transform your teaching workflow',
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H9.5a2 2 0 01-2-2V5a2 2 0 00-2-2H3a2 2 0 00-2 2v4a2 2 0 002 2h2.5a2 2 0 012 2v2a2 2 0 002 2H17z"
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
              You&apos;re all set! Teaching Engine 2.0 is designed to grow with you. Start with the
              sample data we&apos;ve created, then gradually build your own comprehensive teaching
              plans.
            </p>
            <div className="flex items-center space-x-2 text-sm text-indigo-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Need help? Look for the help tooltips throughout the interface.</span>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Start Teaching!',
        onClick: () => {
          markStepCompleted('features');
          completeOnboarding();
          navigate('/planner/dashboard');
        },
      },
    },
  ];

  if (!visible) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
              <p className="text-gray-600 mt-1">{currentStepData.description}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={completeOnboarding}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip Tour
            </Button>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => skipToStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-indigo-600'
                    : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                }`}
                title={step.title}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{currentStepData.content}</div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <div className="flex items-center space-x-3">
            {currentStepData.action && (
              <Button
                onClick={currentStepData.action.onClick}
                disabled={isCreatingSampleData}
                className="min-w-[120px]"
              >
                {isCreatingSampleData ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  currentStepData.action.label
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
