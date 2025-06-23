import { useState } from 'react';
import SubPlanComposer from './SubPlanComposer';

export default function EmergencyPlanButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => setOpen(true)}>
        Emergency Sub Plan
      </button>
      {open && <SubPlanComposer onClose={() => setOpen(false)} />}
    </>
  );
}
