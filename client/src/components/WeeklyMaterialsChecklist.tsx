import React, { useState } from 'react';
import { SmartMaterialsChecklist } from './SmartMaterialsChecklist';
import { useMaterialDetails } from '../api';

interface MaterialChecklistData {
  items: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  prepared?: boolean;
}

interface Props {
  weekStart: string;
  useSmartVersion?: boolean;
}

export default function WeeklyMaterialsChecklist({ weekStart, useSmartVersion = true }: Props) {
  const { data } = useMaterialDetails(weekStart) as { data?: MaterialChecklistData };
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  // Use smart version if enabled
  if (useSmartVersion) {
    return <SmartMaterialsChecklist weekStart={weekStart} />;
  }

  // Fallback to original simple version
  // If no data or no items, don't render anything
  if (!data?.items?.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Weekly Materials</h3>
      <ul className="pl-5 space-y-1 list-disc">
        {data.items.map((item, index) => {
          const key = `material-${index}`;
          return (
            <li key={key}>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!checked[key]}
                  onChange={() => toggle(key)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                {item.name}
              </label>
            </li>
          );
        })}
      </ul>
      {data.prepared && (
        <div className="mt-2 text-sm text-green-600">
          Materials have been prepared for this week
        </div>
      )}
    </div>
  );
}
