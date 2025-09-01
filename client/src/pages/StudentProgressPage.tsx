import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface ProgressData {
  student: { firstName: string; lastName: string; grade: number };
  strengths: Array<{ expectation: { description: string; subject: string } }>;
  growthAreas: Array<{ expectation: { description: string; subject: string } }>;
  recentNotes: Array<{ note: string; date: string }>;
}

export function StudentProgressPage(): React.ReactElement {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/students/${studentId}/progress-summary`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Student not found' : 'Failed to load');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="p-6">Loading student progress...</div>;
  
  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-red-600 mb-2">{error || 'No data available'}</p>
        <button onClick={() => navigate('/students')} className="text-blue-600 underline">
          Back to students
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString(); } 
    catch { return dateStr; }
  };

  const renderList = (items: any[], emptyMsg: string) => (
    items?.length > 0 ? (
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item, i) => (
          <li key={i}>
            {item.expectation?.description} - {item.expectation?.subject}
          </li>
        ))}
      </ul>
    ) : <p className="text-gray-500">{emptyMsg}</p>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/students')} className="mb-4 flex items-center gap-2 text-gray-600">
        <ArrowLeftIcon className="w-4 h-4" /> Back
      </button>
      
      <h1 className="text-2xl font-bold mb-6">
        {data.student.firstName} {data.student.lastName} - Grade {data.student.grade} Progress
      </h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          Strengths ({data.strengths?.length || 0})
        </h2>
        {renderList(data.strengths, 'No strengths recorded yet')}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          Areas to Work On ({data.growthAreas?.length || 0})
        </h2>
        {renderList(data.growthAreas, 'No growth areas identified yet')}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Recent Notes</h2>
        {data.recentNotes?.length > 0 ? (
          <ul className="space-y-2">
            {data.recentNotes.map((note, i) => (
              <li key={i} className="border-l-2 border-gray-300 pl-3">
                <p>{note.note}</p>
                <p className="text-sm text-gray-500">{formatDate(note.date)}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-gray-500">No recent notes</p>}
      </section>

      <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Print Report
      </button>
    </div>
  );
}