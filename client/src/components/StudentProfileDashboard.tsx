import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStudentProfile, useStudentOutcomeSummary, useOutcomes } from '../api';
import {
  Student,
  StudentArtifact,
  Outcome,
  StudentAssessmentResult,
  ReflectionJournalEntry,
} from '../types';
import { Button } from './ui/Button';
import UploadStudentArtifactModal from './UploadStudentArtifactModal';

interface StudentProfileDashboardProps {
  studentId?: number;
}

const StudentProfileDashboard: React.FC<StudentProfileDashboardProps> = ({
  studentId: propStudentId,
}) => {
  const { id } = useParams<{ id: string }>();
  const studentId = propStudentId || parseInt(id || '0', 10);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'outcomes' | 'assessments' | 'artifacts' | 'reflections' | 'timeline'
  >('overview');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const {
    data: studentProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useStudentProfile(studentId);
  const { data: outcomeSummary, isLoading: summaryLoading } = useStudentOutcomeSummary(studentId);
  const { data: allOutcomes } = useOutcomes();

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading student profile...</div>
      </div>
    );
  }

  if (profileError || !studentProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Failed to load student profile.</div>
      </div>
    );
  }

  const student = studentProfile as Student & {
    artifacts: StudentArtifact[];
    assessmentResults: StudentAssessmentResult[];
    reflectionTags: ReflectionJournalEntry[];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getOutcomeById = (outcomeId: string): Outcome | undefined => {
    return allOutcomes?.find((outcome: Outcome) => outcome.id === outcomeId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1">
                    {student.firstName} {student.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grade</label>
                  <p className="mt-1">{student.grade || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parent Email</label>
                  <p className="mt-1">{student.parentEmail || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enrolled Since</label>
                  <p className="mt-1">{formatDate(student.createdAt)}</p>
                </div>
              </div>
              {student.notes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="mt-1 text-gray-600">{student.notes}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-800">Artifacts</h4>
                <p className="text-3xl font-bold text-blue-600">{student.artifacts.length}</p>
                <p className="text-sm text-blue-600">Total uploaded</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-green-800">Assessments</h4>
                <p className="text-3xl font-bold text-green-600">
                  {student.assessmentResults.length}
                </p>
                <p className="text-sm text-green-600">Completed</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-purple-800">Outcomes Covered</h4>
                <p className="text-3xl font-bold text-purple-600">
                  {summaryLoading ? '...' : outcomeSummary?.totalOutcomesCovered || 0}
                </p>
                <p className="text-sm text-purple-600">Learning objectives</p>
              </div>
            </div>
          </div>
        );

      case 'outcomes':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Outcome Coverage Summary</h3>
              {summaryLoading ? (
                <div className="text-center py-8">Loading outcome summary...</div>
              ) : outcomeSummary?.outcomeSummary.length ? (
                <div className="space-y-4">
                  {outcomeSummary.outcomeSummary.map(
                    ({
                      outcome,
                      coverage,
                    }: {
                      outcome: Outcome;
                      coverage: { count: number; lastActivity: string | null; sources: string[] };
                    }) => (
                      <div key={outcome.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{outcome.code}</h4>
                            <p className="text-sm text-gray-600 mt-1">{outcome.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                Subject: {outcome.subject} | Grade: {outcome.grade}
                              </span>
                              {outcome.domain && (
                                <span className="text-sm text-gray-500">
                                  Domain: {outcome.domain}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-semibold text-blue-600">
                              {coverage.count}
                            </div>
                            <div className="text-xs text-gray-500">activities</div>
                            {coverage.lastActivity && (
                              <div className="text-xs text-gray-500 mt-1">
                                Last: {formatDate(coverage.lastActivity)}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {coverage.sources.map((source: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                                >
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No outcome coverage recorded yet.
                </div>
              )}
            </div>
          </div>
        );

      case 'assessments':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Assessment History</h3>
              {student.assessmentResults.length ? (
                <div className="space-y-4">
                  {student.assessmentResults.map((result: StudentAssessmentResult) => (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {result.assessmentResult?.template?.title || 'Assessment'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Type: {result.assessmentResult?.template?.type || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Date: {formatDate(result.createdAt)}
                          </p>
                          {result.notes && (
                            <p className="text-sm text-gray-600 mt-2">{result.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {result.score !== null && (
                            <div className="text-lg font-semibold text-green-600">
                              {result.score}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No assessment results recorded yet.
                </div>
              )}
            </div>
          </div>
        );

      case 'artifacts':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Student Artifacts</h3>
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Upload Artifact
                </Button>
              </div>
              {student.artifacts.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {student.artifacts.map((artifact: StudentArtifact) => (
                    <div key={artifact.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium truncate">{artifact.title}</h4>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {artifact.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{formatDate(artifact.date)}</p>
                      {artifact.notes && (
                        <p className="text-sm text-gray-600 mb-3">{artifact.notes}</p>
                      )}
                      {artifact.outcomeIds.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-700">Linked Outcomes:</p>
                          <div className="flex flex-wrap gap-1">
                            {artifact.outcomeIds.map((outcomeId: string) => {
                              const outcome = getOutcomeById(outcomeId);
                              return outcome ? (
                                <span
                                  key={outcomeId}
                                  className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700"
                                  title={outcome.description}
                                >
                                  {outcome.code}
                                </span>
                              ) : (
                                <span
                                  key={outcomeId}
                                  className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-700"
                                >
                                  {outcomeId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No artifacts uploaded yet.
                  <div className="mt-2">
                    <Button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Upload First Artifact
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'reflections':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Teacher Reflections</h3>
              {student.reflectionTags.length ? (
                <div className="space-y-4">
                  {student.reflectionTags.map((reflection: ReflectionJournalEntry) => (
                    <div key={reflection.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-gray-500">{formatDate(reflection.date)}</p>
                        {reflection.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {reflection.tags.map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700">{reflection.content}</p>
                      {reflection.outcomeIds.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Related Outcomes:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {reflection.outcomeIds.map((outcomeId: string) => {
                              const outcome = getOutcomeById(outcomeId);
                              return outcome ? (
                                <span
                                  key={outcomeId}
                                  className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700"
                                  title={outcome.description}
                                >
                                  {outcome.code}
                                </span>
                              ) : (
                                <span
                                  key={outcomeId}
                                  className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-700"
                                >
                                  {outcomeId}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No reflections tagged with this student yet.
                </div>
              )}
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
              <div className="text-center py-8 text-gray-500">Timeline view coming soon...</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'outcomes', label: 'Outcomes' },
    { id: 'assessments', label: 'Assessments' },
    { id: 'artifacts', label: 'Artifacts' },
    { id: 'reflections', label: 'Reflections' },
    { id: 'timeline', label: 'Timeline' },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {student.firstName} {student.lastName}
        </h1>
        <p className="text-gray-600">Student Profile Dashboard</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadStudentArtifactModal
          studentId={studentId}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
};

export default StudentProfileDashboard;
