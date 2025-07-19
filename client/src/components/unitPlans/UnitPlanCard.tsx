/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';

import type { UnitPlan } from '../../hooks/useETFOPlanning';

interface UnitPlanCardProps {
  unitPlan: UnitPlan;
  onEdit: (unit: UnitPlan) => void;
}

export const UnitPlanCard: React.FC<UnitPlanCardProps> = memo(({ unitPlan: unit, onEdit }) => {
  // Memoize expensive date formatting
  const dateRange = useMemo(() => {
    const startDate = new Date(unit.startDate).toLocaleDateString();
    const endDate = new Date(unit.endDate).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  }, [unit.startDate, unit.endDate]);

  // Memoize count calculations
  const counts = useMemo(() => ({
    lessons: unit._count?.lessonPlans ?? 0,
    expectations: unit._count?.expectations ?? 0,
    hours: unit.estimatedHours ?? 0,
  }), [unit._count?.lessonPlans, unit._count?.expectations, unit.estimatedHours]);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{unit.title}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {counts.hours} hours
          </span>
        </div>

        {unit.bigIdeas && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Big Ideas</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{unit.bigIdeas}</p>
          </div>
        )}

        <div className="text-sm text-gray-500 mb-4">
          {dateRange}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm text-gray-500">
            <span>{counts.lessons} lessons</span>
            <span>{counts.expectations} expectations</span>
          </div>

          {unit.progress && (
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {unit.progress.percentage}%
              </div>
              <div className="text-xs text-gray-500">complete</div>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
            to={`/planner/units/${unit.id}`}
          >
            View Details
          </Link>
          <button
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={() => {
 onEdit(unit); 
}}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
});

UnitPlanCard.displayName = 'UnitPlanCard';