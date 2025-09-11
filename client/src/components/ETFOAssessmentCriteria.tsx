import { CheckCircleIcon, EyeIcon, FlagIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface AssessmentCriteria {
  observables?: string[];
  checkpoints?: string[];
}

interface ETFOAssessmentCriteriaProps {
  criteria: AssessmentCriteria;
  onCriteriaSelect?: (type: 'observable' | 'checkpoint', value: string, checked: boolean) => void;
  selectedCriteria?: Set<string>;
}

export function ETFOAssessmentCriteria({ 
  criteria, 
  onCriteriaSelect,
  selectedCriteria = new Set()
}: ETFOAssessmentCriteriaProps): React.ReactElement | null {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(selectedCriteria);

  const handleCheck = (type: 'observable' | 'checkpoint', value: string, checked: boolean) => {
    const newChecked = new Set(checkedItems);
    const key = `${type}:${value}`;
    
    if (checked) {
      newChecked.add(key);
    } else {
      newChecked.delete(key);
    }
    
    setCheckedItems(newChecked);
    onCriteriaSelect?.(type, value, checked);
  };

  if (!criteria.observables?.length && !criteria.checkpoints?.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Observable Behaviors */}
      {criteria.observables && criteria.observables.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <EyeIcon className="w-5 h-5" />
            Comportements observables
          </h4>
          <ul className="space-y-2">
            {criteria.observables.map((observable, idx) => {
              const key = `observable:${observable}`;
              const isChecked = checkedItems.has(key);
              
              return (
                <li key={idx} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={`obs-${idx}`}
                    checked={isChecked}
                    onChange={(e) => handleCheck('observable', observable, e.target.checked)}
                    className="mt-0.5 rounded border-green-300 text-green-600 focus:ring-green-500"
                  />
                  <label 
                    htmlFor={`obs-${idx}`} 
                    className={`cursor-pointer text-sm ${
                      isChecked ? 'text-green-900 font-medium' : 'text-green-800'
                    }`}
                  >
                    {observable}
                  </label>
                  {isChecked && (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 ml-auto" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Checkpoints */}
      {criteria.checkpoints && criteria.checkpoints.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <FlagIcon className="w-5 h-5" />
            Points de contrôle
          </h4>
          <ul className="space-y-2">
            {criteria.checkpoints.map((checkpoint, idx) => {
              const key = `checkpoint:${checkpoint}`;
              const isChecked = checkedItems.has(key);
              
              return (
                <li key={idx} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={`check-${idx}`}
                    checked={isChecked}
                    onChange={(e) => handleCheck('checkpoint', checkpoint, e.target.checked)}
                    className="mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label 
                    htmlFor={`check-${idx}`} 
                    className={`cursor-pointer text-sm ${
                      isChecked ? 'text-purple-900 font-medium' : 'text-purple-800'
                    }`}
                  >
                    {checkpoint}
                  </label>
                  {isChecked && (
                    <CheckCircleIcon className="w-4 h-4 text-purple-600 ml-auto" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ETFOAssessmentCriteria;