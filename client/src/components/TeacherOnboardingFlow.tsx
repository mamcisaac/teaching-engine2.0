import { useState } from 'react';

export default function TeacherOnboardingFlow() {
  const [visible, setVisible] = useState(() => localStorage.getItem('onboarded') !== 'true');
  const dismiss = () => {
    localStorage.setItem('onboarded', 'true');
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 space-y-2 max-w-sm">
        <h2 className="text-lg font-bold">Welcome to Teaching Engine</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Auto-fill your week plan.</li>
          <li>Prepare materials.</li>
          <li>Send a newsletter.</li>
        </ol>
        <button className="px-2 py-1 bg-blue-600 text-white" onClick={dismiss}>
          Got it
        </button>
      </div>
    </div>
  );
}
