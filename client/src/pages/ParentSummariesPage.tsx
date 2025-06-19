import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import ParentSummaryComposer from '../components/ParentSummaryComposer';
import ParentSummaryPreview, { ParentSummaryCard } from '../components/ParentSummaryPreview';
import { useStudents, useDeleteParentSummary } from '../api';
import type { ParentSummary, Student } from '../types';

export default function ParentSummariesPage() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<ParentSummary | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const deleteParentSummary = useDeleteParentSummary();

  // Get all summaries for all students
  const allSummaries = students
    .flatMap((student) =>
      (student.parentSummaries || []).map((summary) => ({
        ...summary,
        student,
      })),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDeleteSummary = async (summary: ParentSummary, student: Student) => {
    if (
      window.confirm(
        `Are you sure you want to delete this summary for ${student.firstName} ${student.lastName}?`,
      )
    ) {
      try {
        await deleteParentSummary.mutateAsync({
          id: summary.id,
          studentId: student.id,
        });
      } catch (error) {
        console.error('Failed to delete summary:', error);
      }
    }
  };

  const handleViewSummary = (summary: ParentSummary) => {
    setSelectedSummary(summary);
    setIsPreviewOpen(true);
  };

  const handleCreateSummary = (studentId?: number) => {
    setSelectedStudentId(studentId || null);
    setIsComposerOpen(true);
  };

  if (studentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading students...</p>
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
              Generate AI-powered progress summaries for parent communication
            </p>
          </div>
          <Button
            onClick={() => handleCreateSummary()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            🧠 Create New Summary
          </Button>
        </div>

        {/* Quick Actions by Student */}
        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions by Student</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleCreateSummary(student.id)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-sm text-gray-500">Grade {student.grade}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {student._count?.parentSummaries || 0} summaries
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Summaries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Summaries ({allSummaries.length})
          </h2>

          {allSummaries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No summaries yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first AI-generated parent summary to get started.
              </p>
              <Button
                onClick={() => handleCreateSummary()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                🧠 Create Your First Summary
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {allSummaries.map((summaryWithStudent) => {
                const { student, ...summary } = summaryWithStudent;
                return (
                  <div key={summary.id} className="relative">
                    <ParentSummaryCard
                      summary={summary}
                      student={student}
                      onClick={() => handleViewSummary(summary)}
                    />

                    {/* Action buttons */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewSummary(summary);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View summary"
                      >
                        👁️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateSummary(student.id);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Create new summary for this student"
                      >
                        ➕
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSummary(summary, student);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete summary"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        {allSummaries.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Summaries</h3>
              <p className="text-2xl font-bold text-gray-900">{allSummaries.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500">Students with Summaries</h3>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(allSummaries.map((s) => s.student.id)).size}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500">Draft Summaries</h3>
              <p className="text-2xl font-bold text-gray-900">
                {allSummaries.filter((s) => s.isDraft).length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Composer Modal */}
      <ParentSummaryComposer
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setSelectedStudentId(null);
        }}
        preselectedStudentId={selectedStudentId || undefined}
      />

      {/* Summary Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedSummary(null);
        }}
        title="Parent Summary"
        size="xl"
      >
        {selectedSummary && (
          <ParentSummaryPreview
            summary={selectedSummary}
            student={
              allSummaries.find((s) => s.id === selectedSummary.id)?.student || {
                id: 0,
                firstName: 'Unknown',
                lastName: 'Student',
                grade: 1,
                userId: 0,
                parentContacts: [],
                createdAt: '',
                updatedAt: '',
              }
            }
            showBothLanguages={true}
          />
        )}
      </Modal>
    </div>
  );
}
