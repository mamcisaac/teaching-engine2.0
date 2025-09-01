import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusIcon, UserGroupIcon, DocumentArrowUpIcon, PencilIcon, TrashIcon, ViewColumnsIcon, Squares2X2Icon, ChartBarIcon } from '@heroicons/react/24/outline';
import { studentsApi, type Student } from '../services/api/students';


export function StudentsPage(): React.ReactElement {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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
    loadStudents();
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

  const handleAddStudent = async () => {
    try {
      const newStudent = await studentsApi.create({
        ...formData,
        studentId: formData.studentId || `S${Date.now()}`,
        dateOfBirth: formData.dateOfBirth || '2018-01-01'
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
    // Archive functionality temporarily disabled - status field not available in update API
    // For now, just update locally
    const updatedStudents = students.map(s =>
      s.id === student.id ? { ...s, status: 'archived' as const, updatedAt: new Date().toISOString() } : s
    );
    setStudents(updatedStudents);
    localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
    toast.success(`Archived ${student.firstName} ${student.lastName} (local only)`);
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
        const headers = lines[0].split(',').map(h => h.trim());
        
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
    <div className="p-6 max-w-7xl mx-auto">
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
                        onClick={() => navigate(`/students/${student.id}/progress`)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        data-testid={`view-progress-${student.id}`}
                        title="View Progress"
                      >
                        <ChartBarIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        data-testid={`edit-student-${student.id}`}
                        title="Edit Student"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        data-testid={`delete-student-${student.id}`}
                        title="Delete Student"
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
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/students/${student.id}/progress`)}
                  className="flex-1 px-3 py-1 text-green-600 border border-green-600 rounded hover:bg-green-50"
                >
                  Progress
                </button>
                <button
                  onClick={() => openEditModal(student)}
                  className="flex-1 px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleArchiveStudent(student)}
                  className="flex-1 px-3 py-1 text-gray-600 border border-gray-600 rounded hover:bg-gray-50"
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
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="student-firstname"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="student-lastname"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Student ID</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="student-id"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="student-dob"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
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
                  <label className="block text-sm font-medium mb-1">IEP Goals</label>
                  <textarea
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
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
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
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Student ID</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
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
                    <label className="block text-sm font-medium mb-1">IEP Goals</label>
                    <textarea
                      value={formData.iepGoals.join('\n')}
                      onChange={(e) => setFormData({ ...formData, iepGoals: e.target.value.split('\n').filter(g => g) })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      placeholder="Enter each goal on a new line"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Accommodations</label>
                    <textarea
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
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
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
    </div>
  );
}