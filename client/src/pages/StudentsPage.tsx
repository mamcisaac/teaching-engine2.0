import { useState } from 'react';
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '../api';
import StudentGoals from '../components/StudentGoals';
import StudentReflectionJournal from '../components/StudentReflectionJournal';
import { Modal } from '../components/ui/Modal';
import type { Student, StudentInput } from '../types';

export default function StudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'goals' | 'reflections'>('goals');
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState<StudentInput>({
    firstName: '',
    lastName: '',
    grade: 1,
  });

  // Fetch data
  const { data: students = [], isLoading } = useStudents();

  // Mutations
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const handleCreateStudent = () => {
    createStudent.mutate(studentForm, {
      onSuccess: () => {
        setIsAddStudentModalOpen(false);
        setStudentForm({ firstName: '', lastName: '', grade: 1 });
      },
    });
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      firstName: student.firstName,
      lastName: student.lastName,
      grade: student.grade,
    });
    setIsEditStudentModalOpen(true);
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    updateStudent.mutate(
      { id: editingStudent.id, data: studentForm },
      {
        onSuccess: (updatedStudent) => {
          setIsEditStudentModalOpen(false);
          setEditingStudent(null);
          setStudentForm({ firstName: '', lastName: '', grade: 1 });
          // Update selected student if it was being edited
          if (selectedStudent?.id === updatedStudent.id) {
            setSelectedStudent(updatedStudent);
          }
        },
      },
    );
  };

  const handleDeleteStudent = (student: Student) => {
    if (
      confirm(
        `Are you sure you want to delete ${student.firstName} ${student.lastName}? This will also delete all their goals and reflections.`,
      )
    ) {
      deleteStudent.mutate(student.id, {
        onSuccess: () => {
          // Clear selected student if it was deleted
          if (selectedStudent?.id === student.id) {
            setSelectedStudent(null);
          }
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
              <p className="text-gray-600 mt-1">
                Manage student goals and reflections for Grade 1 French Immersion
              </p>
            </div>
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ➕ Add Student
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Students ({students.length})
                </h2>
              </div>
              <div className="p-4">
                {students.length > 0 ? (
                  <div className="space-y-2">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedStudent?.id === student.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditStudent(student);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="Edit student"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteStudent(student);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                              title="Delete student"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Added: {new Date(student.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-sm mb-4">No students added yet</p>
                    <button
                      onClick={() => setIsAddStudentModalOpen(true)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      Add First Student
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedStudent.name}</h2>
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => setActiveTab('goals')}
                      className={`px-3 py-1 rounded-md text-sm ${
                        activeTab === 'goals'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      🎯 Goals
                    </button>
                    <button
                      onClick={() => setActiveTab('reflections')}
                      className={`px-3 py-1 rounded-md text-sm ${
                        activeTab === 'reflections'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      🧠 Reflections
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {activeTab === 'goals' ? (
                    <StudentGoals
                      studentId={selectedStudent.id}
                      studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    />
                  ) : (
                    <StudentReflectionJournal
                      studentId={selectedStudent.id}
                      studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="p-8 text-center text-gray-500">
                  <div className="text-6xl mb-4">👤</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                  <p className="text-sm">
                    Choose a student from the list to view their goals and reflections
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Student Modal */}
        <Modal
          isOpen={isAddStudentModalOpen}
          onClose={() => {
            setIsAddStudentModalOpen(false);
            setStudentForm({ firstName: '', lastName: '', grade: 1 });
          }}
          title="Add New Student"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={studentForm.firstName}
                  onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="First name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={studentForm.lastName}
                  onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select
                value={studentForm.grade}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, grade: parseInt(e.target.value) })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={1}>Grade 1</option>
                <option value={2}>Grade 2</option>
                <option value={3}>Grade 3</option>
                <option value={4}>Grade 4</option>
                <option value={5}>Grade 5</option>
                <option value={6}>Grade 6</option>
                <option value={7}>Grade 7</option>
                <option value={8}>Grade 8</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setIsAddStudentModalOpen(false);
                  setStudentForm({ firstName: '', lastName: '', grade: 1 });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStudent}
                disabled={!studentForm.firstName.trim() || !studentForm.lastName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Add Student
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Student Modal */}
        <Modal
          isOpen={isEditStudentModalOpen}
          onClose={() => {
            setIsEditStudentModalOpen(false);
            setEditingStudent(null);
            setStudentForm({ firstName: '', lastName: '', grade: 1 });
          }}
          title="Edit Student"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={studentForm.firstName}
                  onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="First name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={studentForm.lastName}
                  onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select
                value={studentForm.grade}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, grade: parseInt(e.target.value) })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={1}>Grade 1</option>
                <option value={2}>Grade 2</option>
                <option value={3}>Grade 3</option>
                <option value={4}>Grade 4</option>
                <option value={5}>Grade 5</option>
                <option value={6}>Grade 6</option>
                <option value={7}>Grade 7</option>
                <option value={8}>Grade 8</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setIsEditStudentModalOpen(false);
                  setEditingStudent(null);
                  setStudentForm({ firstName: '', lastName: '', grade: 1 });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStudent}
                disabled={!studentForm.firstName.trim() || !studentForm.lastName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Update Student
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
