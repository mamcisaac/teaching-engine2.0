import { useState } from 'react';
import YearAtAGlanceComponent from '../components/YearAtAGlanceComponent';
import { useShareYearPlan } from '../api';

export default function YearAtAGlancePage() {
  const year = new Date().getUTCFullYear();
  const [shareUrl, setShareUrl] = useState('');
  const share = useShareYearPlan();

  const generateShare = async () => {
    const res = await share.mutateAsync({ teacherId: 1, year });
    setShareUrl(`${window.location.origin}/share/${res.shareToken}`);
  };

  return (
    <div className="p-4 space-y-2">
      <div>
        <button onClick={generateShare} className="px-2 py-1 bg-blue-500 text-white rounded">
          Share
        </button>
        {shareUrl && <div className="mt-2 text-sm break-all">Share Link: {shareUrl}</div>}
      </div>
      <YearAtAGlanceComponent teacherId={1} year={year} />
    </div>
  );
}
