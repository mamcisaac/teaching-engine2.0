import { useState, useEffect } from 'react';

import { substituteApi } from '../api/domains/substitute';

import { Dialog } from './Dialog';

interface Props {
  onClose: () => void;
}

export function SubPlanGenerator({ onClose }: Props): React.ReactElement {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(1);
  const [url, setUrl] = useState<string>();

  const generate = async (): Promise<void> => {
    const blob = await substituteApi.generateSubPlanPDF(date, days);

    // Clean up previous URL if it exists
    if (url != null) {
      URL.revokeObjectURL(url);
    }

    setUrl(URL.createObjectURL(blob));
  };

  // Clean up URL when component unmounts
  useEffect(() => () => {
      if (url != null) {
        URL.revokeObjectURL(url);
      }
    }, [url]);

  return (
    <Dialog open onOpenChange={onClose}>
      <div className="space-y-2 w-80">
        <h2 className="text-lg">Generate Sub Plan</h2>
        <input
          className="border p-1 w-full"
          type="date"
          value={date}
          onChange={(e) => {
 setDate(e.target.value); 
}}
        />
        <select
          className="border p-1 w-full"
          value={days}
          onChange={(e) => {
 setDays(Number(e.target.value)); 
}}
        >
          <option value={1}>1 day</option>
          <option value={2}>2 days</option>
          <option value={3}>3 days</option>
        </select>
        <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => {
 void generate(); 
}}>
          Generate
        </button>
        {url != null && <iframe className="w-full h-64 border" src={url} title="Generated substitute plan PDF preview" />}
      </div>
    </Dialog>
  );
}
