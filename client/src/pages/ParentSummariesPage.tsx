import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import ParentSummaryComposer from '../components/ParentSummaryComposer';
import ParentSummaryPreview from '../components/ParentSummaryPreview';
import {
  useStudents,
  useStudentParentSummaries,
  useDeleteParentSummary,
  useUpdateParentSummary,
} from '../api';
import type { ParentSummary } from '../types';

export default function ParentSummariesPage() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<ParentSummary | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // API hooks
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const {
    data: summaries = [],
    isLoading: summariesLoading,
    refetch: refetchSummaries,
  } = useStudentParentSummaries(selectedStudentId || 0);
  const deleteSummary = useDeleteParentSummary();
  const updateSummary = useUpdateParentSummary();

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    setSelectedSummary(null);
    setShowPreview(false);
  };

  const handleViewSummary = (summary: ParentSummary) => {
    setSelectedSummary(summary);
    setShowPreview(true);
  };

  const handleDeleteSummary = async (summaryId: number) => {
    if (!selectedStudentId) return;

    if (window.confirm('Are you sure you want to delete this summary?')) {
      try {
        await deleteSummary.mutateAsync({ id: summaryId, studentId: selectedStudentId });
        refetchSummaries();
        if (selectedSummary?.id === summaryId) {
          setSelectedSummary(null);
          setShowPreview(false);
        }
      } catch (error) {
        console.error('Failed to delete summary:', error);
      }
    }
  };

  const handleToggleDraft = async (summary: ParentSummary) => {
    try {
      await updateSummary.mutateAsync({
        id: summary.id,
        data: { isDraft: !summary.isDraft },
      });
      refetchSummaries();
      if (selectedSummary?.id === summary.id) {
        setSelectedSummary({ ...summary, isDraft: !summary.isDraft });
      }
    } catch (error) {
      console.error('Failed to update summary:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (studentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Parent Summaries</h1>
            <p className="text-gray-600 mt-2">
              AI-generated bilingual summaries for parent communication
            </p>
          </div>
          <Button
            onClick={() => setIsComposerOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            🧠 Generate New Summary
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Students</h2>
              </div>
              <div className="p-4">
                {students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-sm mb-4">No students found</p>
                    <p className="text-xs text-gray-400">Add students in the Students page first</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => handleStudentSelect(student.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedStudentId === student.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">Grade {student.grade}</p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {student._count?.parentSummaries || 0} summaries
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summaries List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedStudent
                    ? `Summaries for ${selectedStudent.firstName}`
                    : 'Select a Student'}
                </h2>
              </div>
              <div className="p-4">
                {!selectedStudentId ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">👤</div>
                    <p className="text-sm">Select a student to view their summaries</p>
                  </div>
                ) : summariesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading summaries...</p>
                  </div>
                ) : summaries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-sm mb-4">No summaries yet</p>
                    <Button
                      onClick={() => setIsComposerOpen(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Generate First Summary
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {summaries.map((summary) => (
                      <div
                        key={summary.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedSummary?.id === summary.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1" onClick={() => handleViewSummary(summary)}>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900">
                                {formatDate(summary.dateFrom)} - {formatDate(summary.dateTo)}
                              </h3>
                              {summary.isDraft && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Draft
                                </span>
                              )}
                            </div>
                            {summary.focus && JSON.parse(summary.focus).length > 0 && (
                              <p className="text-xs text-gray-500">
                                Focus: {JSON.parse(summary.focus).join(', ')}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Created {formatDate(summary.createdAt)}
                            </p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleDraft(summary);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800"
                              title={summary.isDraft ? 'Publish' : 'Mark as draft'}
                            >
                              {summary.isDraft ? '📤' : '📝'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSummary(summary.id);
                              }}
                              className="text-xs text-red-600 hover:text-red-800"
                              title="Delete summary"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Preview */}
          <div className="lg:col-span-1">
            {showPreview && selectedSummary && selectedStudent ? (
              <ParentSummaryPreview summary={selectedSummary} student={selectedStudent} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-8 text-center text-gray-500">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Summary to Preview
                  </h3>
                  <p className="text-sm">
                    Choose a summary from the list to view its content in both languages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Composer Modal */}
        <ParentSummaryComposer
          isOpen={isComposerOpen}
          onClose={() => {
            setIsComposerOpen(false);
            if (selectedStudentId) {
              refetchSummaries();
            }
          }}
          preselectedStudentId={selectedStudentId || undefined}
        />
      </div>
    </div>
  );
}
