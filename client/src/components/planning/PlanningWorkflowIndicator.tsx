import React from 'react';
import { Link } from 'react-router-dom';
import { ETFOLevel, ETFO_LEVEL_PATHS, LevelProgress } from '../../hooks/useWorkflowState';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/Badge';

interface PlanningWorkflowIndicatorProps {
  progress: LevelProgress[];
  currentLevel: ETFOLevel;
  className?: string;
}

const _LEVEL_DISPLAY_NAMES: Record<ETFOLevel, string> = {
  [ETFOLevel.CURRICULUM_EXPECTATIONS]: 'Curriculum',
  [ETFOLevel.LONG_RANGE_PLANS]: 'Long-Range',
  [ETFOLevel.UNIT_PLANS]: 'Unit Plans',
  [ETFOLevel.LESSON_PLANS]: 'Lessons',
  [ETFOLevel.DAYBOOK_ENTRIES]: 'Daybook',
};

const _LEVEL_DESCRIPTIONS: Record<ETFOLevel, string> = {
  [ETFOLevel.CURRICULUM_EXPECTATIONS]: 'Import and organize curriculum expectations',
  [ETFOLevel.LONG_RANGE_PLANS]: 'Create yearly overview with themes and timing',
  [ETFOLevel.UNIT_PLANS]: 'Design detailed unit plans with activities',
  [ETFOLevel.LESSON_PLANS]: 'Plan individual lessons with three-part structure',
  [ETFOLevel.DAYBOOK_ENTRIES]: 'Reflect on lessons and note teaching observations',
};

export function PlanningWorkflowIndicator({
  progress,
  currentLevel,
  className,
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
          const stepContent = (
            <>
              <div className="flex-shrink-0 mt-0.5">{getStepIcon(level)}</div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900">{level.title}</h4>
                <p className="text-sm text-gray-600">{level.description}</p>

                {level.requiredFields && level.requiredFields.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Required:</p>
                    <div className="flex flex-wrap gap-1">
                      {level.requiredFields.map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                {level.isComplete ? (
                  <Badge variant="default" className="bg-green-600">
                    Complete
                  </Badge>
                ) : level.isAccessible ? (
                  <Badge variant="outline">Available</Badge>
                ) : (
                  <Badge variant="secondary">Locked</Badge>
                )}
              </div>
            </>
          );

          return (
            <div key={level.level} className="relative">
              {canNavigate(level) ? (
                <Link
                  to={ETFO_LEVEL_PATHS[level.level] as string}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border-2 transition-all',
                    getStepStyles(level),
                    'cursor-pointer',
                  )}
                >
                  {stepContent}
                </Link>
              ) : (
                <div
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border-2 transition-all',
                    getStepStyles(level),
                  )}
                >
                  {stepContent}
                </div>
              )}

              {!isLast && (
                <div className="absolute left-7 top-full h-3 w-0.5 bg-gray-300 -translate-x-1/2" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Pro tip:</strong> Follow the ETFO planning workflow from top to bottom. Each level
          builds on the previous one, ensuring comprehensive planning coverage.
        </p>
      </div>
    </div>
  );
}
