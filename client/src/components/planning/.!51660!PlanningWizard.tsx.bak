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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { ETFOLevel } from '../../hooks/useWorkflowState';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

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
}: PlanningWizardProps): React.ReactElement {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const currentStepData = WIZARD_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const isStepCompleted = completedLevels.includes(currentStepData.id);

  const handleNext = (): void => {
    if (isLastStep) {
      onClose?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = (): void => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartStep = (): void => {
    navigate(currentStepData.route);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <CardHeader className="relative">
          <div className="absolute right-4 top-4">
            <Button
              className="text-gray-500 hover:text-gray-700"
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
