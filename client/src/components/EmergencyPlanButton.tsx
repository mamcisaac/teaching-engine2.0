import axios from 'axios';

export default function EmergencyPlanButton() {
  const handleClick = async () => {
    const payload = {
      today: [
        { time: '09:00', activity: 'Math' },
        { time: '10:00', activity: 'Reading' },
      ],
      upcoming: [
        { date: new Date().toISOString().slice(0, 10), summary: 'Continue units' },
        { date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), summary: 'Group work' },
        {
          date: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
          summary: 'Projects',
        },
      ],
      procedures: 'See binder for routines.',
      studentNotes: 'Seating chart on desk.',
      emergencyContacts: 'Principal: 555-1234',
    };

    const res = await axios.post('/api/subplan', payload, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sub-plan.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button className="px-2 py-1 bg-red-600 text-white" onClick={handleClick}>
      Emergency Plan
    </button>
  );
}
