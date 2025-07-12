import React from 'react';

import type { LongRangePlan } from '../../hooks/useETFOPlanning';
import type { UnitPlanFormData } from '../../hooks/useUnitPlanForm';
import { CollapsibleSection } from '../ui/MobileOptimizedForm';

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
}) => (
    <div className="space-y-6">
      <CollapsibleSection defaultExpanded required title="Basic Information">
        <div className="space-y-4">
          {(longRangePlanId === null || longRangePlanId === undefined || longRangePlanId === '') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Long-Range Plan *
              </label>
              <select
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.longRangePlanId}
                onChange={(e) => {
 updateField('longRangePlanId', e.target.value); 
}}
              >
                <option value="">Select a long-range plan...</option>
                {allLongRangePlans.map((plan, _index) => (
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
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Living Things in Our Environment"
              type="text"
              value={formData.title}
              onChange={(e) => {
 updateField('title', e.target.value); 
}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Brief overview of the unit..."
              rows={3}
              value={formData.description}
              onChange={(e) => {
 updateField('description', e.target.value); 
}}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                type="date"
                value={formData.startDate}
                onChange={(e) => {
 updateField('startDate', e.target.value); 
}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                type="date"
                value={formData.endDate}
                onChange={(e) => {
 updateField('endDate', e.target.value); 
}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="1"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => {
 updateField('estimatedHours', Number(e.target.value)); 
}}
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
