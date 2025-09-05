/**
 * Student Progress Dashboard Component
 * Text-based progress summary for parent communication
 */

import React, { useEffect, useState } from 'react';
import {
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PrinterIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import {
  useQuickProgress,
  useStudentProgress,
  useStudentAssessments,
  useParentCommunications,
  useGenerateParentReport,
  useSaveParentCommunication
} from '../../hooks/useStudentProgress';
import { generateParentSummary, formatDateForParents } from '../../utils/studentProgress';
import type { Student } from '../../services/api/students';

interface StudentProgressDashboardProps {
  student: Student;
  onClose?: () => void;
}

export function StudentProgressDashboard({ 
  student, 
  onClose 
}: StudentProgressDashboardProps): React.ReactElement {
  const [privacyMode, setPrivacyMode] = useState<'public' | 'private'>('private'); // Default to private for safety
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [communicationNote, setCommunicationNote] = useState('');
  
  // Fetch progress data
  const { data: quickProgress, isLoading: quickLoading } = useQuickProgress(student.id);
  const { data: fullProgress, isLoading: fullLoading } = useStudentProgress(student.id, {
    includePrivate: privacyMode === 'private'
  });
  const { data: assessments } = useStudentAssessments(student.id);
  const { data: communications } = useParentCommunications(student.id);
  
  // Mutations
  const generateReport = useGenerateParentReport();
  const saveCommunication = useSaveParentCommunication();
  
  // Track load time for performance requirement
  useEffect(() => {
    if (quickProgress?.loadTimeMs && quickProgress.loadTimeMs > 2000) {
      console.warn(`Slow load time: ${quickProgress.loadTimeMs}ms`);
    }
  }, [quickProgress]);
  
  const handleGenerateReport = async () => {
    try {
      await generateReport.mutateAsync({
        studentId: student.id,
        includePrivate: privacyMode === 'private'
      });
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    }
  };
  
  const handleSaveCommunication = async () => {
    if (!communicationNote.trim()) {
      toast.error('Please enter a communication note');
      return;
    }
    
    try {
      await saveCommunication.mutateAsync({
        studentId: student.id,
        summary: communicationNote,
        type: 'verbal',
        sharedWith: 'Parent'
      });
      toast.success('Communication recorded');
      setCommunicationNote('');
      setShowCommunicationModal(false);
    } catch (error) {
      toast.error('Failed to save communication');
      console.error(error);
    }
  };
  
  if (quickLoading) {
    return (
      <div className="p-6 text-center">
        <ClockIcon className="h-8 w-8 mx-auto text-gray-400 animate-spin" />
        <p className="mt-2 text-sm text-gray-500">Loading progress...</p>
      </div>
    );
  }
  
  const studentName = `${student.firstName} ${student.lastName}`;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with Privacy Toggle */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{studentName}'s Progress</h2>
          {quickProgress && (
            <p className="mt-1 text-sm text-gray-500">
              Load time: {quickProgress.loadTimeMs}ms
              {quickProgress.loadTimeMs < 2000 && (
                <span className="ml-2 text-green-600">✓ Fast</span>
              )}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPrivacyMode(mode => mode === 'public' ? 'private' : 'public')}
            className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${
              privacyMode === 'private'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {privacyMode === 'private' ? (
              <>
                <LockClosedIcon className="h-4 w-4 mr-1" />
                Private Mode
              </>
            ) : (
              <>
                <LockOpenIcon className="h-4 w-4 mr-1" />
                Public Mode
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>
      
      {/* Quick Summary (for parent ambush scenarios) */}
      {quickProgress && (
        <div className={`mb-6 p-4 rounded-lg ${
          quickProgress.safeToShare ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Quick Summary (Safe to Share)
          </h3>
          <p className="text-gray-700">{quickProgress.oneLiner}</p>
          {!quickProgress.safeToShare && (
            <p className="mt-2 text-sm text-yellow-700 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              Contains sensitive information - request private meeting
            </p>
          )}
        </div>
      )}
      
      {/* Strengths Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
          Strengths
        </h3>
        {fullProgress?.strengths && fullProgress.strengths.length > 0 ? (
          <ul className="space-y-2">
            {fullProgress.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <div>
                  <span className="text-gray-700">{strength.expectation}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({strength.subject})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Assessment in progress</p>
        )}
      </div>
      
      {/* Growth Areas Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-blue-600" />
          Areas for Growth
        </h3>
        {fullProgress?.growthAreas && fullProgress.growthAreas.length > 0 ? (
          <ul className="space-y-2">
            {fullProgress.growthAreas.map((area, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <div>
                  <span className="text-gray-700">{area.expectation}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({area.subject})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Meeting all assessed expectations</p>
        )}
      </div>
      
      {/* Recent Notes Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
          Recent Observations
        </h3>
        {fullProgress?.recentNotes && fullProgress.recentNotes.length > 0 ? (
          <ul className="space-y-2">
            {fullProgress.recentNotes.map((note, index) => (
              <li key={index} className="text-gray-700">
                <span className="font-medium">"</span>
                {note.note}
                <span className="font-medium">"</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({formatDateForParents(note.date)})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No recent notes</p>
        )}
      </div>
      
      {/* Previous Communications (Private Mode Only) */}
      {privacyMode === 'private' && communications && communications.previousReports.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            Previous Communications
          </h3>
          <div className="space-y-2">
            {communications.previousReports.slice(0, 3).map((report, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-gray-700">
                  {formatDateForParents(report.date)}:
                </span>
                <span className="text-gray-600 ml-2">{report.summary}</span>
              </div>
            ))}
          </div>
          {communications.contradictions.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-100 rounded">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Note: Current assessment differs from previous report
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* IEP/Special Needs Notice (Private Mode Only) */}
      {privacyMode === 'private' && student.hasIEP && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>IEP Active:</strong> This student has an Individual Education Plan.
            Please refer to IEP documentation for specific goals and accommodations.
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGenerateReport}
          disabled={generateReport.isPending}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <PrinterIcon className="h-5 w-5 mr-2" />
          {generateReport.isPending ? 'Generating...' : 'Generate Parent Report'}
        </button>
        
        <button
          onClick={() => setShowCommunicationModal(true)}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Record Communication
        </button>
      </div>
      
      {/* Communication Modal */}
      {showCommunicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Record Parent Communication</h3>
            <textarea
              value={communicationNote}
              onChange={(e) => setCommunicationNote(e.target.value)}
              placeholder="What was discussed with the parent?"
              className="w-full h-32 p-3 border rounded-md"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCommunicationModal(false);
                  setCommunicationNote('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCommunication}
                disabled={saveCommunication.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saveCommunication.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}