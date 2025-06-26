import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  FileText, 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  PenTool,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ETFOLevel } from '../../hooks/useWorkflowState';

interface WizardStep {
  id: ETFOLevel;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  tips: string[];
  estimatedTime: string;
  isAIAssisted?: boolean;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: ETFOLevel.CURRICULUM_EXPECTATIONS,
    title: 'Import Curriculum Expectations',
    description: 'Start by importing Ontario curriculum expectations for your grade and subjects.',
    icon: <FileText className="h-6 w-6" />,
    route: '/curriculum/import',
    tips: [
      'You can upload PDF or DOCX curriculum documents',
      'Our AI will automatically extract and organize expectations',
      'You can also manually add or edit expectations'
    ],
    estimatedTime: '10-15 minutes',
    isAIAssisted: true
  },
  {
    id: ETFOLevel.LONG_RANGE_PLANS,
    title: 'Create Long-Range Plans',
    description: 'Map out your entire school year with themes, units, and timing.',
    icon: <Calendar className="h-6 w-6" />,
    route: '/planner/long-range',
    tips: [
      'Break your year into manageable themes or units',
      'Consider holidays, assessments, and special events',
      'Aim for balanced coverage across strands'
    ],
    estimatedTime: '30-45 minutes'
  },
  {
    id: ETFOLevel.UNIT_PLANS,
    title: 'Design Unit Plans',
    description: 'Create detailed unit plans with learning goals, activities, and assessments.',
    icon: <BookOpen className="h-6 w-6" />,
    route: '/planner/units',
    tips: [
      'Start with big ideas and essential questions',
      'Use AI suggestions for activities and vocabulary',
      'Include differentiation strategies for diverse learners'
    ],
    estimatedTime: '45-60 minutes per unit',
    isAIAssisted: true
  },
  {
    id: ETFOLevel.LESSON_PLANS,
    title: 'Plan Individual Lessons',
    description: 'Create engaging three-part lessons aligned with ETFO best practices.',
    icon: <GraduationCap className="h-6 w-6" />,
    route: '/planner/etfo-lessons',
    tips: [
      'Use the Minds On, Action, and Consolidation structure',
      'Include clear learning goals and success criteria',
      'Plan for assessment and differentiation'
    ],
    estimatedTime: '20-30 minutes per lesson',
    isAIAssisted: true
  },
  {
    id: ETFOLevel.DAYBOOK_ENTRIES,
    title: 'Track & Reflect',
    description: 'Record observations and reflections to improve your teaching practice.',
    icon: <PenTool className="h-6 w-6" />,
    route: '/planner/daybook',
    tips: [
      'Note what worked well and what to improve',
      'Note teaching observations and reflections',
      'Use insights to refine future lessons'
    ],
    estimatedTime: '5-10 minutes daily'
  }
];

interface PlanningWizardProps {
  currentLevel?: ETFOLevel;
  completedLevels?: ETFOLevel[];
  onClose?: () => void;
}

export function PlanningWizard({ 
  currentLevel: _currentLevel, 
  completedLevels = [], 
  onClose 
}: PlanningWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const currentStepData = WIZARD_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const isStepCompleted = completedLevels.includes(currentStepData.id);

  const handleNext = () => {
    if (isLastStep) {
      onClose?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartStep = () => {
    navigate(currentStepData.route);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="relative">
          <div className="absolute right-4 top-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
          
          <CardTitle className="text-2xl">Planning Wizard</CardTitle>
          <CardDescription>
            Let&apos;s walk through the ETFO planning process step by step
          </CardDescription>
          
          {/* Progress indicators */}
          <div className="flex items-center gap-2 mt-4">
            {WIZARD_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex-1 h-2 rounded-full transition-colors',
                  index === currentStep 
                    ? 'bg-indigo-600' 
                    : index < currentStep || completedLevels.includes(step.id)
                    ? 'bg-green-600'
                    : 'bg-gray-200'
                )}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step content */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={cn(
                'p-3 rounded-lg flex-shrink-0',
                isStepCompleted ? 'bg-green-100' : 'bg-indigo-100'
              )}>
                {isStepCompleted ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <div className={isStepCompleted ? 'text-green-700' : 'text-indigo-700'}>
                    {currentStepData.icon}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">
                    Step {currentStep + 1}: {currentStepData.title}
                  </h3>
                  {currentStepData.isAIAssisted && (
                    <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3" />
                      AI-Assisted
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4">{currentStepData.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Tips for this step:</h4>
                  <ul className="space-y-2">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-indigo-600 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      ⏱ Estimated time: {currentStepData.estimatedTime}
                    </p>
                  </div>
                </div>
                
                {isStepCompleted && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800">
                      You&apos;ve completed this step! Feel free to revisit it anytime.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              onClick={handleStartStep}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {isStepCompleted ? 'Revisit' : 'Start'} This Step
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              onClick={handleNext}
              className="gap-2"
            >
              {isLastStep ? 'Finish' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}