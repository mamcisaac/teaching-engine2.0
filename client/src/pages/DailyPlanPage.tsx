import { useState } from 'react';
import { useDailyPlan, useGenerateDailyPlan, useUpdateDailyPlan, DailyPlanItem } from '../api';
import DailyNotesEditor from '../components/DailyNotesEditor';

export default function DailyPlanPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const plan = useDailyPlan(date);
  const generate = useGenerateDailyPlan();
  const update = useUpdateDailyPlan();

  const handleGenerate = () => generate.mutate(date);

  const handleSave = () => {
    if (!plan.data) return;
    const items: Omit<DailyPlanItem, 'id'>[] = plan.data.items.map((i) => ({
      startMin: i.startMin,
      endMin: i.endMin,
      slotId: i.slotId ?? undefined,
      activityId: i.activityId ?? undefined,
      notes: i.notes ?? undefined,
    }));
    update.mutate({ id: plan.data.id, items });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-1"
        />
        <button
          className="px-2 py-1 bg-blue-600 text-white"
          onClick={handleGenerate}
          disabled={generate.isPending}
        >
          Generate
        </button>
        {plan.data && (
          <button
            className="px-2 py-1 bg-blue-600 text-white"
            onClick={handleSave}
            disabled={update.isPending}
          >
            Save
          </button>
        )}
      </div>
      {plan.data ? (
        <>
          <table className="w-full text-sm border">
            <thead>
              <tr>
                <th>Time</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {plan.data.items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td>
                    {it.startMin}-{it.endMin}
                  </td>
                  <td>{it.activity?.title ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <DailyNotesEditor dailyPlanId={plan.data.id} />
        </>
      ) : (
        <p>No plan for this day.</p>
      )}
    </div>
  );
}
