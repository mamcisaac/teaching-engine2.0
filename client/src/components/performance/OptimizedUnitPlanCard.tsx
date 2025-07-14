
import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { UnitPlan } from '../../hooks/useETFOPlanning';
import { cn } from '../../lib/utils';

interface OptimizedUnitPlanCardProps {
  unitPlan: UnitPlan;
  onEdit: (unit: UnitPlan) => void;
  className?: string;
  compact?: boolean;
}

// Memoized component with optimized re-rendering
export const OptimizedUnitPlanCard = memo(({ 
  unitPlan: unit, 
  onEdit,
  className,
  compact = false,
}: OptimizedUnitPlanCardProps) => {
  // Memoize expensive date formatting
  const dateRange = useMemo(() => {
    try {
      const startDate = new Date(unit.startDate).toLocaleDateString();
      const endDate = new Date(unit.endDate).toLocaleDateString();
      return `${startDate} - ${endDate}`;
    } catch {
      return 'Invalid date range';
    }
  }, [unit.startDate, unit.endDate]);

  // Memoize count calculations
  const counts = useMemo(() => ({
    lessons: unit._count?.lessonPlans || 0,
    expectations: unit._count?.expectations || 0,
    hours: unit.estimatedHours || 0,
  }), [unit._count?.lessonPlans, unit._count?.expectations, unit.estimatedHours]);

  // Memoize progress calculation
  const progressData = useMemo(() => {
    if (!unit.progress) {
return null;
}
    
    return {
      percentage: Math.min(100, Math.max(0, unit.progress.percentage)),
      completed: unit.progress.completed,
      total: unit.progress.total,
    };
  }, [unit.progress]);

  // Memoized edit handler to prevent unnecessary re-renders
  const handleEdit = useMemo(() => 
    (): void => {
 onEdit(unit); 
},
    [onEdit, unit]
  );

  return (
    <div 
      className={cn(
        'bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 border border-gray-200',
        'transform hover:-translate-y-1',
        compact ? 'p-4' : 'p-6',
        className
      )}
    >
      <div className={cn('space-y-4', compact && 'space-y-3')}>
        {/* Header */}
        <div className="flex justify-between items-start">
          <h3 className={cn(
            'font-semibold text-gray-900 line-clamp-2',
            compact ? 'text-base' : 'text-lg'
          )}>
            {unit.title}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 flex-shrink-0 ml-2">
            {counts.hours}h
          </span>
        </div>

        {/* Big Ideas - only show if not compact and exists */}
        {!compact && unit.bigIdeas && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Big Ideas</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{unit.bigIdeas}</p>
          </div>
        )}

        {/* Date Range */}
        <div className="text-sm text-gray-500">
          {dateRange}
        </div>

        {/* Metrics */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm text-gray-500">
            <span className="flex items-center">
              <span className="font-medium">{counts.lessons}</span>
              <span className="ml-1">lesson{counts.lessons !== 1 ? 's' : ''}</span>
            </span>
            <span className="flex items-center">
              <span className="font-medium">{counts.expectations}</span>
              <span className="ml-1">expectation{counts.expectations !== 1 ? 's' : ''}</span>
            </span>
          </div>

          {/* Progress */}
          {progressData && (
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {progressData.percentage}%
              </div>
              <div className="text-xs text-gray-500">complete</div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progressData && !compact && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressData.percentage}%` }}
            />
          </div>
        )}

        {/* Actions */}
        <div className={cn(
          'flex gap-2',
          compact ? 'flex-col space-y-1' : 'flex-row'
        )}>
          <Link
            className={cn(
              'text-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors',
              compact ? 'flex-1' : 'flex-1'
            )}
            to={`/planner/units/${unit.id}`}
          >
            View Details
          </Link>
          <button
            className={cn(
              'px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors',
              compact ? 'flex-1' : ''
            )}
            onClick={handleEdit}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => 
  // Custom comparison function to optimize re-renders
   (
    prevProps.unitPlan.id === nextProps.unitPlan.id &&
    prevProps.unitPlan.title === nextProps.unitPlan.title &&
    prevProps.unitPlan.startDate === nextProps.unitPlan.startDate &&
    prevProps.unitPlan.endDate === nextProps.unitPlan.endDate &&
    prevProps.unitPlan.estimatedHours === nextProps.unitPlan.estimatedHours &&
    prevProps.unitPlan._count?.lessonPlans === nextProps.unitPlan._count?.lessonPlans &&
    prevProps.unitPlan._count?.expectations === nextProps.unitPlan._count?.expectations &&
    prevProps.unitPlan.progress?.percentage === nextProps.unitPlan.progress?.percentage &&
    prevProps.compact === nextProps.compact &&
    prevProps.className === nextProps.className
  )
);

OptimizedUnitPlanCard.displayName = 'OptimizedUnitPlanCard';