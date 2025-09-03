import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

// Simple student interface for roster management
export interface SimpleStudent {
  id: string;
  firstName: string;
  lastName: string;
}

interface StudentRosterProps {
  onRosterUpdate?: (students: SimpleStudent[]) => void;
  compact?: boolean;
}

export function StudentRoster({ onRosterUpdate, compact = false }: StudentRosterProps) {
  const [students, setStudents] = useState<SimpleStudent[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '' });
  const [editStudent, setEditStudent] = useState({ firstName: '', lastName: '' });

  // Load students from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('student-roster');
    if (saved) {
      try {
        const roster = JSON.parse(saved);
        setStudents(roster);
      } catch (error) {
        console.error('Failed to load student roster:', error);
        toast.error('Failed to load roster. Please add students manually.');
        setStudents([]);
      }
    } else {
      // First time - start with empty roster
      setStudents([]);
      // Show onboarding message after a short delay
      setTimeout(() => {
        if (!localStorage.getItem('roster-onboarding-seen')) {
          toast.info('Welcome! Start by adding your students to the roster.', {
            duration: 5000
          });
          localStorage.setItem('roster-onboarding-seen', 'true');
        }
      }, 500);
    }
  }, []);

  // Save to localStorage and notify parent whenever students change
  useEffect(() => {
    if (students.length > 0) {
      try {
        localStorage.setItem('student-roster', JSON.stringify(students));
        onRosterUpdate?.(students);
      } catch (error) {
        console.error('Failed to save roster to localStorage:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          toast.error('Storage is full. Please export your data and clear some space.');
        } else {
          toast.error('Failed to save roster. Please try again.');
        }
      }
    }
  }, [students, onRosterUpdate]);

  const handleAddStudent = () => {
    if (!newStudent.firstName.trim() || !newStudent.lastName.trim()) {
      toast.error('Please enter both first and last name');
      return;
    }

    const student: Student = {
      id: Date.now().toString(),
      firstName: newStudent.firstName.trim(),
      lastName: newStudent.lastName.trim()
    };

    setStudents(prev => [...prev, student]);
    setNewStudent({ firstName: '', lastName: '' });
    setIsAdding(false);
    toast.success(`Added ${student.firstName} ${student.lastName}`);
  };

  const handleUpdateStudent = (id: string) => {
    if (!editStudent.firstName.trim() || !editStudent.lastName.trim()) {
      toast.error('Please enter both first and last name');
      return;
    }

    setStudents(prev => prev.map(s => 
      s.id === id 
        ? { ...s, firstName: editStudent.firstName.trim(), lastName: editStudent.lastName.trim() }
        : s
    ));
    setEditingId(null);
    toast.success('Student updated');
  };

  const handleDeleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    if (student && window.confirm(`Remove ${student.firstName} ${student.lastName} from roster?`)) {
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Student removed');
    }
  };

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setEditStudent({ firstName: student.firstName, lastName: student.lastName });
  };

  if (compact) {
    return (
      <div className="text-sm text-gray-600">
        {students.length} students in roster
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Student Roster</h3>
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Add new student form */}
        {isAdding && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="First name"
                value={newStudent.firstName}
                onChange={(e) => setNewStudent(prev => ({ ...prev, firstName: e.target.value }))}
                className="flex-1 px-2 py-1 border border-gray-300 rounded"
                autoFocus
              />
              <input
                type="text"
                placeholder="Last name"
                value={newStudent.lastName}
                onChange={(e) => setNewStudent(prev => ({ ...prev, lastName: e.target.value }))}
                className="flex-1 px-2 py-1 border border-gray-300 rounded"
              />
              <button
                onClick={handleAddStudent}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewStudent({ firstName: '', lastName: '' });
                }}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Student list */}
        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No students in your roster yet.</p>
            <p className="text-sm">Click "Add Student" above to get started!</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {students.map((student) => (
            <div key={student.id} className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded">
              {editingId === student.id ? (
                <>
                  <input
                    type="text"
                    value={editStudent.firstName}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, firstName: e.target.value }))}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editStudent.lastName}
                    onChange={(e) => setEditStudent(prev => ({ ...prev, lastName: e.target.value }))}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => handleUpdateStudent(student.id)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-gray-900">
                    {student.firstName} {student.lastName}
                  </span>
                  <button
                    onClick={() => startEdit(student)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          Total: {students.length} students
        </div>
      </div>
    </div>
  );
}

// Helper function to get students from localStorage
export function getStudentRoster(): SimpleStudent[] {
  try {
    const saved = localStorage.getItem('student-roster');
    if (saved) {
      const roster = JSON.parse(saved);
      // Validate that it's an array
      if (Array.isArray(roster)) {
        return roster;
      }
      console.error('Student roster is not an array');
      return [];
    }
  } catch (error) {
    console.error('Failed to load student roster:', error);
  }
  return [];
}