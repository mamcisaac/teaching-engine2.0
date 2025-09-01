import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface Expectation {
  description: string;
  subject: string;
}

interface ProgressItem {
  expectation: Expectation;
}

interface ProgressData {
  student: {
    firstName: string;
    lastName: string;
    grade: number;
  };
  strengths: ProgressItem[];
  growthAreas: ProgressItem[];
  recentNotes: Array<{
    note: string;
    date: string;
  }>;
}

export function StudentProgressPage(): React.ReactElement {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cleanup any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check for auth token first
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view student progress');
      setLoading(false);
      return;
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    fetch(`${API_BASE_URL}/api/students/${studentId}/progress-summary`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: abortControllerRef.current.signal
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) throw new Error('Session expired. Please log in again.');
          if (res.status === 403) throw new Error('You don\'t have permission to view this student.');
          if (res.status === 404) throw new Error('Student not found.');
          if (res.status >= 500) throw new Error('Server error. Please try again later.');
          throw new Error('Failed to load student progress.');
        }
        return res.json();
      })
      .then(setData)
      .catch(err => {
        // Ignore abort errors
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [studentId]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6" role="status" aria-live="polite">
        <span className="sr-only">Loading student progress...</span>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !data) {
    return (
      <div className="p-6" role="alert">
        <p className="text-red-600 mb-2">{error || 'No data available'}</p>
        <button 
          onClick={() => navigate('/students')} 
          className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Go back to students list"
        >
          Back to students
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    // Only print the report content
    const reportContent = document.getElementById('progress-report');
    if (!reportContent) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow pop-ups to print the report');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.student.firstName} ${data.student.lastName} - Progress Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            h2 { color: #555; margin-top: 20px; }
            ul { padding-left: 20px; }
            li { margin: 5px 0; }
            .note { border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0; }
            .date { color: #666; font-size: 0.9em; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${reportContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <nav aria-label="Breadcrumb">
        <button 
          onClick={() => navigate('/students')} 
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Back to students list"
        >
          <ArrowLeftIcon className="w-4 h-4" aria-hidden="true" /> Back
        </button>
      </nav>
      
      <div id="progress-report">
        <h1 className="text-2xl font-bold mb-6">
          {data.student.firstName} {data.student.lastName} - Grade {data.student.grade} Progress Report
        </h1>
        
        <section className="mb-8" aria-labelledby="strengths-heading">
          <h2 id="strengths-heading" className="text-xl font-semibold mb-3">
            Strengths ({data.strengths?.length || 0})
          </h2>
          {data.strengths?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {data.strengths.map((item, i) => (
                <li key={i}>
                  {item.expectation?.description || 'No description'} - {item.expectation?.subject || 'Unknown subject'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No strengths recorded yet</p>
          )}
        </section>

        <section className="mb-8" aria-labelledby="growth-heading">
          <h2 id="growth-heading" className="text-xl font-semibold mb-3">
            Areas to Work On ({data.growthAreas?.length || 0})
          </h2>
          {data.growthAreas?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {data.growthAreas.map((item, i) => (
                <li key={i}>
                  {item.expectation?.description || 'No description'} - {item.expectation?.subject || 'Unknown subject'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No growth areas identified yet</p>
          )}
        </section>

        <section className="mb-8" aria-labelledby="notes-heading">
          <h2 id="notes-heading" className="text-xl font-semibold mb-3">Recent Notes</h2>
          {data.recentNotes?.length > 0 ? (
            <div className="space-y-2" role="list">
              {data.recentNotes.map((note, i) => (
                <div key={i} className="border-l-2 border-gray-300 pl-3" role="listitem">
                  <p>{note.note}</p>
                  <p className="text-sm text-gray-500">
                    <time dateTime={note.date}>{formatDate(note.date)}</time>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent notes</p>
          )}
        </section>
      </div>

      <button 
        onClick={handlePrint} 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Print this progress report"
      >
        Print Report
      </button>
    </div>
  );
}