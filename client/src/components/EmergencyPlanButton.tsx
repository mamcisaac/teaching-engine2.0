import { useState } from 'react';
import SubPlanGenerator from './SubPlanGenerator';

export default function EmergencyPlanButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="px-2 py-1 bg-red-600 text-white" onClick={() => setOpen(true)}>
        Emergency Plan
      </button>
      {open && <SubPlanGenerator onClose={() => setOpen(false)} />}
    </>
  );
}
