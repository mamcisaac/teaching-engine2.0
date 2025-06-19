import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import ParentSummaryComposer from '../components/ParentSummaryComposer';
import { useStudents, useCreateStudent, useDeleteStudent } from '../api';
import type { StudentInput } from '../types';

export default function StudentsPage() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState<StudentInput>({
    firstName: '',
    lastName: '',
    grade: 1,
    parentContacts: [],
  });

  const { data: students = [], isLoading } = useStudents();
  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();

  const handleCreateStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName) {
      return;
    }

    try {
      await createStudent.mutateAsync(newStudent);
      setIsAddStudentOpen(false);
      setNewStudent({
        firstName: '',
        lastName: '',
        grade: 1,
        parentContacts: [],
      });
    } catch (error) {
      console.error('Failed to create student:', error);
    }
  };

  const handleDeleteStudent = async (studentId: number, studentName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${studentName}? This will also delete all their summaries and data.`,
      )
    ) {
      try {
        await deleteStudent.mutateAsync(studentId);
      } catch (error) {
        console.error('Failed to delete student:', error);
      }
    }
  };

  const handleGenerateSummary = (studentId: number) => {
    setSelectedStudentId(studentId);
    setIsComposerOpen(true);
  };

  if (isLoading) {
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
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600 mt-2">
              Manage your students and generate AI summaries for parent communication
            </p>
          </div>
          <Button
            onClick={() => setIsAddStudentOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            ➕ Add Student
          </Button>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {students.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
              <p className="text-gray-600 mb-6">
                Add your first student to start generating AI-powered parent summaries.
              </p>
              <Button
                onClick={() => setIsAddStudentOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                ➕ Add Your First Student
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {students.map((student) => (
                <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Grade {student.grade}
                        </span>
                      </div>

                      {/* Parent Contacts */}
                      {student.parentContacts && student.parentContacts.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Parent Contacts:</p>
                          <div className="flex flex-wrap gap-2">
                            {student.parentContacts.map((contact) => (
                              <span
                                key={contact.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {contact.name} ({contact.email})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Statistics */}
                      <div className="flex gap-6 text-sm text-gray-600">
                        <span>📝 {student._count?.parentSummaries || 0} summaries</span>
                        <span>📊 {student._count?.assessmentResults || 0} assessments</span>
                        <span>📁 {student._count?.artifacts || 0} artifacts</span>
                        <span>💭 {student._count?.reflections || 0} reflections</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleGenerateSummary(student.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        🧠 Generate Summary
                      </Button>
                      <Button
                        onClick={() =>
                          handleDeleteStudent(
                            student.id,
                            `${student.firstName} ${student.lastName}`,
                          )
                        }
                        variant="danger"
                        size="sm"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        {students.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Summaries</h3>
              <p className="text-2xl font-bold text-gray-900">
                {students.reduce((sum, s) => sum + (s._count?.parentSummaries || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Assessments</h3>
              <p className="text-2xl font-bold text-gray-900">
                {students.reduce((sum, s) => sum + (s._count?.assessmentResults || 0), 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-500">Average Grade</h3>
              <p className="text-2xl font-bold text-gray-900">
                {students.length > 0
                  ? Math.round(students.reduce((sum, s) => sum + s.grade, 0) / students.length)
                  : 0}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddStudentOpen}
        onClose={() => {
          setIsAddStudentOpen(false);
          setNewStudent({
            firstName: '',
            lastName: '',
            grade: 1,
            parentContacts: [],
          });
        }}
        title="Add New Student"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={newStudent.firstName}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={newStudent.lastName}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
            <select
              value={newStudent.grade}
              onChange={(e) =>
                setNewStudent((prev) => ({ ...prev, grade: parseInt(e.target.value) }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                <option key={grade} value={grade}>
                  Grade {grade}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsAddStudentOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateStudent}
              disabled={!newStudent.firstName || !newStudent.lastName || createStudent.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {createStudent.isPending ? 'Adding...' : 'Add Student'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Summary Composer Modal */}
      <ParentSummaryComposer
        isOpen={isComposerOpen}
        onClose={() => {
          setIsComposerOpen(false);
          setSelectedStudentId(null);
        }}
        preselectedStudentId={selectedStudentId || undefined}
      />
    </div>
  );
}
