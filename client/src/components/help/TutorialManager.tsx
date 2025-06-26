import React, { useState, useEffect, useCallback } from 'react';
import { useHelp } from '../../contexts/HelpContext';
import { useTutorials } from '../../hooks/useHelp';
import { TutorialOverlay } from './TutorialOverlay';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface TutorialManagerProps {
  children: React.ReactNode;
}

export const TutorialManager: React.FC<TutorialManagerProps> = ({ children }) => {
  const { state, startTutorial, nextTutorialStep, completeTutorial } = useHelp();
  const { getTutorial, getTutorialProgress } = useTutorials();
  const [showTutorialMenu, setShowTutorialMenu] = useState(false);

  // Get currently active tutorial
  const activeTutorialId = Object.keys(state.tutorialProgress)[0];
  const activeTutorial = activeTutorialId ? getTutorial(activeTutorialId) : null;
  const currentStepIndex = activeTutorialId ? state.tutorialProgress[activeTutorialId] : 0;
  const currentStep = activeTutorial?.steps[currentStepIndex] || null;
  const progress = activeTutorialId ? getTutorialProgress(activeTutorialId) : 0;

  // Handle tutorial completion
  const handleCompleteTutorial = useCallback(() => {
    if (activeTutorialId) {
      completeTutorial(activeTutorialId);

      // Show completion message
      if (activeTutorial?.completionMessage) {
        alert(activeTutorial.completionMessage); // In production, use a proper notification system
      }
    }
  }, [activeTutorialId, completeTutorial, activeTutorial?.completionMessage]);

  // Handle skipping tutorial
  const handleSkipTutorial = () => {
    if (activeTutorialId) {
      completeTutorial(activeTutorialId);
    }
  };

  // Handle next step
  const handleNextStep = useCallback(() => {
    if (activeTutorialId) {
      if (currentStepIndex >= (activeTutorial?.steps.length || 0) - 1) {
        handleCompleteTutorial();
      } else {
        nextTutorialStep(activeTutorialId);
      }
    }
  }, [
    activeTutorialId,
    currentStepIndex,
    activeTutorial?.steps.length,
    nextTutorialStep,
    handleCompleteTutorial,
  ]);

  // Handle previous step
  const handlePreviousStep = () => {
    if (activeTutorialId && currentStepIndex > 0) {
      // For simplicity, we'll just skip to previous step
      // In a real implementation, you might want to track step history
      nextTutorialStep(activeTutorialId);
    }
  };

  // Auto-advance tutorial based on user actions
  useEffect(() => {
    if (currentStep?.validation && currentStep.validation()) {
      // Auto-advance if validation passes
      setTimeout(() => {
        handleNextStep();
      }, 1000);
    }
  }, [currentStep, handleNextStep]);

  const TutorialMenuModal = () => {
    const { availableTutorials, completedTutorials } = useTutorials();

    return (
      <Modal
        isOpen={showTutorialMenu}
        onClose={() => setShowTutorialMenu(false)}
        title="Interactive Tutorials"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Learn Teaching Engine 2.0 features through hands-on, interactive tutorials.
          </p>

          {/* Available Tutorials */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Tutorials</h3>
            <div className="space-y-3">
              {availableTutorials.map((tutorial) => {
                const isCompleted = completedTutorials.includes(tutorial.id);
                const isActive = activeTutorialId === tutorial.id;

                return (
                  <div
                    key={tutorial.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{tutorial.title}</h4>
                          {isCompleted && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          )}
                          {isActive && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{tutorial.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                          <span>📊 {tutorial.difficulty}</span>
                          <span>⏱️ {tutorial.estimatedTime} min</span>
                          <span>🎯 {tutorial.category}</span>
                        </div>
                        {tutorial.prerequisites.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">
                              Prerequisites: {tutorial.prerequisites.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {isCompleted ? (
                          <Button variant="secondary" size="sm" disabled>
                            ✓ Completed
                          </Button>
                        ) : isActive ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setShowTutorialMenu(false);
                              // Resume tutorial - overlay will show automatically
                            }}
                          >
                            Resume
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              startTutorial(tutorial.id);
                              setShowTutorialMenu(false);
                            }}
                          >
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed Tutorials */}
          {completedTutorials.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Completed Tutorials ({completedTutorials.length})
              </h3>
              <div className="text-sm text-gray-600">
                <p>Great job! You&apos;ve completed {completedTutorials.length} tutorial(s).</p>
                {completedTutorials.length >= availableTutorials.length && (
                  <p className="mt-2 text-green-600 font-medium">
                    🎉 You&apos;ve completed all available tutorials! You&apos;re a Teaching Engine
                    2.0 expert.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <>
      {children}

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isActive={!!activeTutorial}
        currentStep={currentStep}
        tutorial={activeTutorial || null}
        onNext={handleNextStep}
        onPrevious={handlePreviousStep}
        onSkip={handleSkipTutorial}
        onComplete={handleCompleteTutorial}
        progress={progress}
      />

      {/* Floating Tutorial Button */}
      {!activeTutorial && (
        <button
          onClick={() => setShowTutorialMenu(true)}
          className="fixed bottom-20 right-6 bg-green-600 text-white rounded-full p-3 shadow-lg hover:bg-green-700 transition-colors z-40"
          title="Start Interactive Tutorial"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </button>
      )}

      {/* Tutorial Menu Modal */}
      <TutorialMenuModal />
    </>
  );
};
