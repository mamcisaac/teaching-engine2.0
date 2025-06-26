import React from 'react';
import { CollapsibleSection } from '../ui/MobileOptimizedForm';
import { UnitPlanFormData } from '../../hooks/useUnitPlanForm';
import { LongRangePlan } from '../../hooks/useETFOPlanning';

interface UnitPlanOverviewTabProps {
  formData: UnitPlanFormData;
  updateField: <K extends keyof UnitPlanFormData>(field: K, value: UnitPlanFormData[K]) => void;
  longRangePlanId?: string;
  allLongRangePlans?: LongRangePlan[];
}

export const UnitPlanOverviewTab: React.FC<UnitPlanOverviewTabProps> = ({
  formData,
  updateField,
  longRangePlanId,
  allLongRangePlans = [],
}) => {
  return (
    <div className="space-y-6">
      <CollapsibleSection title="Basic Information" required defaultExpanded>
        <div className="space-y-4">
          {!longRangePlanId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Long-Range Plan *
              </label>
              <select
                required
                value={formData.longRangePlanId}
                onChange={(e) => updateField('longRangePlanId', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a long-range plan...</option>
                {allLongRangePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.title} - {plan.subject} Grade {plan.grade}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Living Things in Our Environment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Brief overview of the unit..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => updateField('estimatedHours', Number(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="1"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};