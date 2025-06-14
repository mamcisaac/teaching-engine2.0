import { useState } from 'react';
import Dialog from './Dialog';
import { generateSubPlan } from '../api';

interface Props {
  onClose: () => void;
}

export default function SubPlanGenerator({ onClose }: Props) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(1);
  const [url, setUrl] = useState<string>();

  const generate = async () => {
    const res = await generateSubPlan(date, days);
    const blob = new Blob([res.data], { type: 'application/pdf' });
    setUrl(URL.createObjectURL(blob));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <div className="space-y-2 w-80">
        <h2 className="text-lg">Generate Sub Plan</h2>
        <input
          type="date"
          className="border p-1 w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <select
          className="border p-1 w-full"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={1}>1 day</option>
          <option value={2}>2 days</option>
          <option value={3}>3 days</option>
        </select>
        <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={generate}>
          Generate
        </button>
        {url && <iframe src={url} className="w-full h-64 border" />}
      </div>
    </Dialog>
  );
}
