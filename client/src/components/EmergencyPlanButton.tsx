import axios from 'axios';

export default function EmergencyPlanButton() {
  const handleClick = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await axios.get(`/api/subplan?date=${today}`, { responseType: 'blob' });
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
