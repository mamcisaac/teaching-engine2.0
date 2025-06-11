import { useEffect } from 'react';

interface Props {
  filters: Record<string, boolean>;
  onChange: (f: Record<string, boolean>) => void;
}

const TAGS = ['HandsOn', 'Worksheet', 'Video'];
const STORAGE_KEY = 'te:planner:filters';

export default function PlannerFilters({ filters, onChange }: Props) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  return (
    <div className="flex gap-2" title="Filter suggested activities">
      {TAGS.map((t) => (
        <label key={t} className="inline-flex items-center gap-1" title={`Show ${t} activities`}>
          <input
            type="checkbox"
            checked={filters[t] ?? true}
            onChange={(e) => onChange({ ...filters, [t]: e.target.checked })}
          />
          {t}
        </label>
      ))}
    </div>
  );
}

export function loadPlannerFilters(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
}
