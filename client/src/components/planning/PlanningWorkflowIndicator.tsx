import React from 'react';
import { Link } from 'react-router-dom';
import { ETFOLevel, ETFO_LEVEL_PATHS, LevelProgress } from '../../hooks/useWorkflowState';
import { CheckCircle2, Circle, Lock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanningWorkflowIndicatorProps {
  progress: LevelProgress[];
  currentLevel: ETFOLevel;
  className?: string;
}

const LEVEL_DISPLAY_NAMES: Record<ETFOLevel, string> = {
  [ETFOLevel.CURRICULUM_EXPECTATIONS]: 'Curriculum',
  [ETFOLevel.LONG_RANGE_PLANS]: 'Long-Range',
  [ETFOLevel.UNIT_PLANS]: 'Unit Plans',
  [ETFOLevel.LESSON_PLANS]: 'Lessons',
  [ETFOLevel.DAYBOOK_ENTRIES]: 'Daybook',
};

const LEVEL_DESCRIPTIONS: Record<ETFOLevel, string> = {
  [ETFOLevel.CURRICULUM_EXPECTATIONS]: 'Import and organize curriculum expectations',
  [ETFOLevel.LONG_RANGE_PLANS]: 'Create yearly overview with themes and timing',
  [ETFOLevel.UNIT_PLANS]: 'Design detailed unit plans with activities',
  [ETFOLevel.LESSON_PLANS]: 'Plan individual lessons with three-part structure',
  [ETFOLevel.DAYBOOK_ENTRIES]: 'Reflect on lessons and note teaching observations',
};

export function PlanningWorkflowIndicator({ 
  progress, 
  currentLevel, 
  className 
}: PlanningWorkflowIndicatorProps) {
  const getStepIcon = (level: LevelProgress) => {
    if (level.isComplete) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    } else if (!level.isAccessible) {
      return <Lock className="h-5 w-5 text-gray-400" />;
    } else if (level.level === currentLevel) {
      return <Circle className="h-5 w-5 text-indigo-600 animate-pulse" />;
    } else {
      return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepStyles = (level: LevelProgress) => {
    if (level.isComplete) {
      return 'border-green-600 bg-green-50';
    } else if (!level.isAccessible) {
      return 'border-gray-300 bg-gray-50';
    } else if (level.level === currentLevel) {
      return 'border-indigo-600 bg-indigo-50';
    } else {
      return 'border-gray-300 bg-white hover:bg-gray-50';
    }
  };

  const canNavigate = (level: LevelProgress) => {
    return level.isAccessible || level.isComplete;
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-sm p-6', className)}>
      <h3 className="text-lg font-semibold mb-4">Planning Workflow Progress</h3>
      
      <div className="space-y-3">
        {progress.map((level, index) => {
          const isLast = index === progress.length - 1;
          const StepWrapper = canNavigate(level) ? Link : 'div';
          const wrapperProps = canNavigate(level) 
            ? { to: ETFO_LEVEL_PATHS[level.level] } 
            : {};

          return (
            <div key={level.level} className="relative">
              <StepWrapper
                {...wrapperProps}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2 transition-all',
                  getStepStyles(level),
                  canNavigate(level) && 'cursor-pointer'
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(level)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {LEVEL_DISPLAY_NAMES[level.level]}
                    </h4>
                    {level.progressPercentage > 0 && (
                      <span className="text-sm text-gray-600">
                        {level.progressPercentage}%
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {LEVEL_DESCRIPTIONS[level.level]}
                  </p>
                  
                  {level.totalItems > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{level.completedItems} of {level.totalItems} completed</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${level.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {level.blockedReason && (
                    <p className="text-xs text-red-600 mt-2">
                      {level.blockedReason}
                    </p>
                  )}
                </div>

                {canNavigate(level) && (
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                )}
              </StepWrapper>
              
              {!isLast && (
                <div className="absolute left-7 top-full h-3 w-0.5 bg-gray-300 -translate-x-1/2" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Pro tip:</strong> Follow the ETFO planning workflow from top to bottom. 
          Each level builds on the previous one, ensuring comprehensive planning coverage.
        </p>
      </div>
    </div>
  );
}