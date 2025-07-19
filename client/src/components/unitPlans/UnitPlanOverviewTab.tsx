
import React from 'react';

import type { LongRangePlan } from '../../hooks/useETFOPlanning';
import type { UnitPlanFormData  } from '../../hooks/useUnitPlanForm';
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
          {!longRangePlanId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="unit-lrp-select">
                Long-Range Plan *
              </label>
              <select
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="unit-lrp-select"
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
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="unit-title">
              Unit Title *
            </label>
            <input
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              id="unit-title"
              placeholder="e.g., Living Things in Our Environment"
              type="text"
              value={formData.title}
              onChange={(e) => {
 updateField('title', e.target.value); 
}}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="unit-description">
              Description
            </label>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              id="unit-description"
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
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="unit-start-date">
                Start Date *
              </label>
              <input
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="unit-start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => {
 updateField('startDate', e.target.value); 
}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="unit-end-date">
                End Date *
              </label>
              <input
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="unit-end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => {
 updateField('endDate', e.target.value); 
}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="unit-hours">
                Estimated Hours
              </label>
              <input
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                id="unit-hours"
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
