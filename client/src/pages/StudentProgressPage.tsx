import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export function StudentProgressPage(): React.ReactElement {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/students/${studentId}/progress-summary`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.ok ? res.json() : null)
      .then(setData)
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">No data available. <button onClick={() => navigate('/students')} className="text-blue-600 underline">Back to students</button></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/students')} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>
      
      <h1 className="text-2xl font-bold mb-6">{data.student.firstName} {data.student.lastName} - Progress Report</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Strengths ({data.strengths.length})</h2>
        {data.strengths.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {data.strengths.map((item: any, i: number) => (
              <li key={i}>{item.expectation.description} - {item.expectation.subject}</li>
            ))}
          </ul>
        ) : <p className="text-gray-500">No strengths recorded yet</p>}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Areas to Work On ({data.growthAreas.length})</h2>
        {data.growthAreas.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {data.growthAreas.map((item: any, i: number) => (
              <li key={i}>{item.expectation.description} - {item.expectation.subject}</li>
            ))}
          </ul>
        ) : <p className="text-gray-500">No growth areas identified yet</p>}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Recent Notes</h2>
        {data.recentNotes.length > 0 ? (
          <ul className="space-y-2">
            {data.recentNotes.map((note: any, i: number) => (
              <li key={i} className="border-l-2 border-gray-300 pl-3">
                <p>{note.note}</p>
                <p className="text-sm text-gray-500">{new Date(note.date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-gray-500">No recent notes</p>}
      </div>

      <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Print Report
      </button>
    </div>
  );
}