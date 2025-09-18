import { PlusIcon, DocumentArrowUpIcon, PencilIcon, TrashIcon, ViewColumnsIcon, Squares2X2Icon, ChartBarIcon } from '@heroicons/react/24/outline';
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

import { QuickNoteButton } from '../components/anecdotal-notes/QuickNoteButton';
import { StudentProgressDashboard } from '../components/student/StudentProgressDashboard';
import { studentsApi, type Student } from '../services/api/students';


export function StudentsPage(): React.ReactElement {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [showProgressDashboard, setShowProgressDashboard] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    dateOfBirth: '',
    grade: 1,
    program: 'French Immersion',
    hasIEP: false,
    iepGoals: [] as string[],
    accommodations: [] as string[],
    notes: ''
  });

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower)
    );
  });

  // Load students on component mount
  useEffect(() => {
    void loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (err) {
      setError('Failed to load students. Using local storage as fallback.');
      // Fallback to localStorage
      const saved = localStorage.getItem('assessment-students');
      if (saved) {
        setStudents(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  // Simple flow to clear the entire roster
  const handleResetClass = async () => {
    try {
      // Best-effort server deletion
      await studentsApi.deleteAll().catch(() => {});
    } catch {
      // ignore - rely on local clear below
    }
    // Clear local state and localStorage (authoritative for UI)
    setStudents([]);
    localStorage.removeItem('assessment-students');
    toast.success('Class reset. No students in roster.');
    setShowResetConfirm(false);
  };

  // Create many students from pasted names (one per line: First Last)
  const handleCreateFromPastedNames = async () => {
    const lines = pasteText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      toast.error('Please paste at least one name.');
      return;
    }

    const now = Date.now();
    const newlyCreated: Student[] = [];
    for (let i = 0; i < lines.length; i++) {
      const fullname = lines[i];
      const [firstName, ...rest] = fullname.split(' ');
      const lastName = rest.join(' ');
      const sid = `S-${(firstName || 'S')[0]?.toLowerCase()}${lastName.replace(/\s+/g,'').toLowerCase()}-${now}${i+1}`;
      try {
        const created = await studentsApi.create({
          firstName: firstName || fullname,
          lastName: lastName || 'Unknown',
        });
        newlyCreated.push(created);
      } catch {
        // Fallback: local-only creation
        const local: Student = {
          id: `student-${now}-${i+1}`,
          firstName: firstName || fullname,
          lastName: lastName || 'Unknown',
          studentId: sid,
          dateOfBirth: '2018-01-01',
          grade: 1,
          program: 'French Immersion',
          hasIEP: false,
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          assessmentCount: 0
        };
        newlyCreated.push(local);
      }
    }
    const updated = [...newlyCreated];
    setStudents(updated);
    localStorage.setItem('assessment-students', JSON.stringify(updated));
    toast.success(`Added ${updated.length} students to the roster`);
    setShowPasteModal(false);
    setPasteText('');
  };

  const handleAddStudent = async () => {
    try {
      const newStudent = await studentsApi.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      setStudents([...students, newStudent]);
      // Also save to localStorage as backup
      localStorage.setItem('assessment-students', JSON.stringify([...students, newStudent]));
      
      toast.success(`Added ${formData.firstName} ${formData.lastName}`);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      // Fallback to local-only creation
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        ...formData,
        studentId: formData.studentId || `S${Date.now()}`,
        dateOfBirth: formData.dateOfBirth || '2018-01-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        assessmentCount: 0
      };
      
      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
      
      toast.success(`Added ${formData.firstName} ${formData.lastName} (offline mode)`);
      setShowAddModal(false);
      resetForm();
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent) return;
    
    try {
      const updated = await studentsApi.update(editingStudent.id, formData);
      const updatedStudents = students.map(s => 
        s.id === editingStudent.id ? updated : s
      );
      setStudents(updatedStudents);
      localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
      toast.success(`Updated ${formData.firstName} ${formData.lastName}`);
    } catch (err) {
      // Fallback to local-only update
      const updatedStudents = students.map(s => 
        s.id === editingStudent.id 
          ? { ...editingStudent, ...formData, updatedAt: new Date().toISOString() }
          : s
      );
      setStudents(updatedStudents);
      localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
      toast.success(`Updated ${formData.firstName} ${formData.lastName} (offline mode)`);
    }
    
    setShowEditModal(false);
    setEditingStudent(null);
    resetForm();
  };

  const handleDeleteStudent = async (student: Student) => {
    if (confirm(`Are you sure you want to remove ${student.firstName} ${student.lastName}?`)) {
      try {
        await studentsApi.delete(student.id);
        const updatedStudents = students.filter(s => s.id !== student.id);
        setStudents(updatedStudents);
        localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
        toast.success(`Removed ${student.firstName} ${student.lastName}`);
      } catch (err) {
        // Fallback to local-only deletion
        const updatedStudents = students.filter(s => s.id !== student.id);
        setStudents(updatedStudents);
        localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
        toast.success(`Removed ${student.firstName} ${student.lastName} (offline mode)`);
      }
    }
  };

  const handleArchiveStudent = async (student: Student) => {
    try {
      // Note: The API doesn't support updating status through the update method
      // This is a frontend-only operation for now
      const archivedStudent: Student = { ...student, status: 'archived' };
      const updatedStudents = students.map(s =>
        s.id === student.id ? archivedStudent : s
      );
      setStudents(updatedStudents);
      localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
      toast.success(`Archived ${student.firstName} ${student.lastName}`);
    } catch (err) {
      // Fallback to local-only archive
      const updatedStudents = students.map(s =>
        s.id === student.id ? { ...s, status: 'archived' as const, updatedAt: new Date().toISOString() } : s
      );
      setStudents(updatedStudents);
      localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
      toast.success(`Archived ${student.firstName} ${student.lastName} (offline mode)`);
    }
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Try API import first
      const importedStudents = await studentsApi.importFromCSV(file);
      const updatedStudents = [...students, ...importedStudents];
      setStudents(updatedStudents);
      localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
      toast.success(`Imported ${importedStudents.length} students`);
      setShowImportModal(false);
    } catch (err) {
      // Fallback to client-side CSV parsing
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const _headers = lines[0].split(',').map(h => h.trim());
        
        const newStudents: Student[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length > 1) {
            newStudents.push({
              id: `student-${Date.now()}-${i}`,
              firstName: values[0] || '',
              lastName: values[1] || '',
              studentId: values[2] || `S${Date.now()}${i}`,
              dateOfBirth: values[3] || '2018-01-01',
              grade: parseInt(values[4] || '1'),
              program: values[5] || 'French Immersion',
              hasIEP: values[6]?.toLowerCase() === 'true',
              notes: values[7] || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active',
              assessmentCount: 0
            });
          }
        }
        
        const updatedStudents = [...students, ...newStudents];
        setStudents(updatedStudents);
        localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
        toast.success(`Imported ${newStudents.length} students (offline mode)`);
        setShowImportModal(false);
      };
      
      reader.readAsText(file);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      studentId: '',
      dateOfBirth: '',
      grade: 1,
      program: 'French Immersion',
      hasIEP: false,
      iepGoals: [],
      accommodations: [],
      notes: ''
    });
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      studentId: student.studentId,
      dateOfBirth: student.dateOfBirth,
      grade: student.grade,
      program: student.program,
      hasIEP: student.hasIEP,
      iepGoals: student.iepGoals || [],
      accommodations: student.accommodations || [],
      notes: student.notes || ''
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" data-testid="students-page">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
        <p className="text-gray-600">Manage your Grade 1 French Immersion class</p>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            data-testid="add-student-btn"
          >
            <PlusIcon className="w-5 h-5" />
            Add Student
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            data-testid="import-csv-btn"
          >
            <DocumentArrowUpIcon className="w-5 h-5" />
            Import CSV
          </button>
          <button
            onClick={() => setShowPasteModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            data-testid="paste-names-btn"
          >
            Paste Names
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            data-testid="reset-class-btn"
          >
            Reset Class
          </button>
        </div>

        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64"
            data-testid="search-input"
          />
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              data-testid="list-view-btn"
            >
              <ViewColumnsIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              data-testid="grid-view-btn"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Student Count and Error Display */}
      <div className="mb-4">
        <div className="text-sm text-gray-600">
          {loading ? 'Loading students...' : `${filteredStudents.length} students`}
        </div>
        {error && (
          <div className="text-sm text-orange-600 mt-1">{error}</div>
        )}

      {/* Paste Names Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Paste Names (one per line)</h2>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={"e.g.\nFrancis Abdallah\nEllis Baglole\n..."}
              className="w-full h-56 px-3 py-2 border rounded-lg"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCreateFromPastedNames}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Students
              </button>
              <button
                onClick={() => setShowPasteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reset Class</h2>
            <p className="text-gray-700 mb-4">This will remove all students from your class. This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={handleResetClass}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Students Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grade</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Program</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">IEP</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Assessments</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      {student.notes && (
                        <div className="text-sm text-gray-500">{student.notes}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{student.studentId}</td>
                  <td className="px-4 py-3 text-gray-600">{student.grade}</td>
                  <td className="px-4 py-3 text-gray-600">{student.program}</td>
                  <td className="px-4 py-3">
                    {student.hasIEP && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        IEP
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {student.assessmentCount || 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowProgressDashboard(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Progress"
                      >
                        <ChartBarIcon className="h-4 w-4" />
                      </button>
                      <QuickNoteButton
                        studentId={student.id}
                        studentName={`${student.firstName} ${student.lastName}`}
                        variant="icon"
                        onNoteSaved={() => {
                          toast.success(`Note saved for ${student.firstName}`);
                          // Refresh students list to get updated assessment count
                          void loadStudents();
                        }}
                      />
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        data-testid={`edit-student-${student.id}`}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        data-testid={`delete-student-${student.id}`}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{student.studentId}</p>
                </div>
                {student.hasIEP && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    IEP
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>Grade {student.grade} - {student.program}</p>
                <p>{student.assessmentCount || 0} assessments</p>
                {student.notes && <p className="italic">{student.notes}</p>}
              </div>
              
              <div className="mt-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedStudent(student);
                    setShowProgressDashboard(true);
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm flex items-center"
                >
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Progress
                </button>
                <QuickNoteButton
                  studentId={student.id}
                  studentName={`${student.firstName} ${student.lastName}`}
                  variant="compact"
                  onNoteSaved={() => {
                    toast.success(`Note saved for ${student.firstName}`);
                    // Refresh students list to get updated assessment count
                    void loadStudents();
                  }}
                />
                <button
                  onClick={() => openEditModal(student)}
                  className="flex-1 px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 min-w-[60px]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleArchiveStudent(student)}
                  className="flex-1 px-3 py-1 text-gray-600 border border-gray-600 rounded hover:bg-gray-50 min-w-[70px]"
                >
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="add-student-firstname" className="block text-sm font-medium mb-1">First Name</label>
                <input
                  id="add-student-firstname"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="student-firstname"
                />
              </div>
              
              <div>
                <label htmlFor="add-student-lastname" className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  id="add-student-lastname"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="student-lastname"
                />
              </div>
              
              <div>
                <label htmlFor="add-student-id" className="block text-sm font-medium mb-1">Student ID</label>
                <input
                  id="add-student-id"
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="student-id"
                />
              </div>
              
              <div>
                <label htmlFor="add-student-dob" className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  id="add-student-dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="student-dob"
                />
              </div>
              
              <div>
                <label htmlFor="add-student-has-iep" className="flex items-center gap-2">
                  <input
                    id="add-student-has-iep"
                    type="checkbox"
                    checked={formData.hasIEP}
                    onChange={(e) => setFormData({ ...formData, hasIEP: e.target.checked })}
                    data-testid="student-iep"
                  />
                  <span>Has IEP</span>
                </label>
              </div>
              
              {formData.hasIEP && (
                <div>
                  <label htmlFor="add-student-iep-goals" className="block text-sm font-medium mb-1">IEP Goals</label>
                  <textarea
                    id="add-student-iep-goals"
                    value={formData.iepGoals.join('\n')}
                    onChange={(e) => setFormData({ ...formData, iepGoals: e.target.value.split('\n').filter(g => g) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Enter each goal on a new line"
                    data-testid="student-iep-goals"
                  />
                </div>
              )}
              
              <div>
                <label htmlFor="add-student-notes" className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  id="add-student-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  data-testid="student-notes"
                />
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleAddStudent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                data-testid="save-student-btn"
              >
                Add Student
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Student</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-student-firstname" className="block text-sm font-medium mb-1">First Name</label>
                <input
                  id="edit-student-firstname"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="edit-student-lastname" className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  id="edit-student-lastname"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="edit-student-id" className="block text-sm font-medium mb-1">Student ID</label>
                <input
                  id="edit-student-id"
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="edit-student-dob" className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  id="edit-student-dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label htmlFor="edit-student-has-iep" className="flex items-center gap-2">
                  <input
                    id="edit-student-has-iep"
                    type="checkbox"
                    checked={formData.hasIEP}
                    onChange={(e) => setFormData({ ...formData, hasIEP: e.target.checked })}
                  />
                  <span>Has IEP</span>
                </label>
              </div>
              
              {formData.hasIEP && (
                <>
                  <div>
                    <label htmlFor="edit-student-iep-goals" className="block text-sm font-medium mb-1">IEP Goals</label>
                    <textarea
                      id="edit-student-iep-goals"
                      value={formData.iepGoals.join('\n')}
                      onChange={(e) => setFormData({ ...formData, iepGoals: e.target.value.split('\n').filter(g => g) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      placeholder="Enter each goal on a new line"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-student-accommodations" className="block text-sm font-medium mb-1">Accommodations</label>
                    <textarea
                      id="edit-student-accommodations"
                      value={formData.accommodations.join('\n')}
                      onChange={(e) => setFormData({ ...formData, accommodations: e.target.value.split('\n').filter(a => a) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      placeholder="Enter each accommodation on a new line"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label htmlFor="edit-student-notes" className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  id="edit-student-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleEditStudent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStudent(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Import Students from CSV</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                CSV should have columns: FirstName, LastName, StudentID, DateOfBirth, Grade, Program, HasIEP, Notes
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="w-full"
                data-testid="csv-file-input"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Progress Dashboard Modal */}
      {showProgressDashboard && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <StudentProgressDashboard
              student={selectedStudent}
              onClose={() => {
                setShowProgressDashboard(false);
                setSelectedStudent(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}