import { useState } from 'react';
import { useMaterialDetails } from '../api';

interface Props {
  weekStart: string;
}

export default function WeeklyMaterialsChecklist({ weekStart }: Props) {
  const { data = [] } = useMaterialDetails(weekStart);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  if (!data.length) return null;
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.activityId}>
          <h4 className="font-medium">{item.title}</h4>
          <ul className="pl-5 space-y-1 list-disc">
            {item.materials.map((m) => {
              const key = `${item.activityId}-${m}`;
              return (
                <li key={key}>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)} />
                    {m}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
