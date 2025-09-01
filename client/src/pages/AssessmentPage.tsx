import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  AcademicCapIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon,
  CameraIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface Assessment {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  subject: string;
  expectation: string;
  expectationCode: string;
  level: 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';
  evidenceType: 'OBSERVATION' | 'CONVERSATION' | 'PRODUCT';
  description: string;
  notes?: string;
  artifacts?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
}

const MASTERY_LEVELS = [
  { value: 'NOT_YET', label: 'Not Yet', color: 'red', icon: XCircleIcon },
  { value: 'APPROACHING', label: 'Approaching', color: 'yellow', icon: ExclamationTriangleIcon },
  { value: 'MEETING', label: 'Meeting', color: 'green', icon: CheckCircleIcon },
  { value: 'EXCEEDING', label: 'Exceeding', color: 'blue', icon: ArrowTrendingUpIcon }
];

const EVIDENCE_TYPES = [
  { value: 'OBSERVATION', label: 'Observation', icon: AcademicCapIcon, description: 'What you see' },
  { value: 'CONVERSATION', label: 'Conversation', icon: ChatBubbleLeftRightIcon, description: 'What you hear' },
  { value: 'PRODUCT', label: 'Product', icon: DocumentTextIcon, description: 'What they produce' }
];

const SUBJECTS = [
  'Français (Immersion)',
  'Mathématiques',
  'Sciences de la nature',
  'Sciences humaines',
  'Arts visuels',
  'Formation personnelle et sociale'
];

export function AssessmentPage(): React.ReactElement {
  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('assessment-records');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('assessment-students');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showQuickAssessment, setShowQuickAssessment] = useState(false);
  const [showBulkAssessment, setShowBulkAssessment] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    expectation: '',
    expectationCode: '',
    level: 'MEETING' as Assessment['level'],
    evidenceType: 'OBSERVATION' as Assessment['evidenceType'],
    description: '',
    notes: ''
  });

  const [bulkStudents, setBulkStudents] = useState<string[]>([]);

  useEffect(() => {
    // Update student assessment counts
    const counts: Record<string, number> = {};
    assessments.forEach(a => {
      counts[a.studentId] = (counts[a.studentId] || 0) + 1;
    });
    
    const updatedStudents = students.map(s => ({
      ...s,
      assessmentCount: counts[s.id] || 0,
      lastAssessment: assessments
        .filter(a => a.studentId === s.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0]?.date
    }));
    
    localStorage.setItem('assessment-students', JSON.stringify(updatedStudents));
  }, [assessments]);

  const saveAssessments = (newAssessments: Assessment[]) => {
    setAssessments(newAssessments);
    localStorage.setItem('assessment-records', JSON.stringify(newAssessments));
  };

  const handleQuickAssessment = () => {
    if (!formData.studentId || !formData.subject || !formData.expectation) {
      toast.error('Please fill in all required fields');
      return;
    }

    const student = students.find(s => s.id === formData.studentId);
    if (!student) return;

    const newAssessment: Assessment = {
      id: `assessment-${Date.now()}`,
      studentId: formData.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      date: new Date().toISOString(),
      subject: formData.subject,
      expectation: formData.expectation,
      expectationCode: formData.expectationCode || 'CUSTOM',
      level: formData.level,
      evidenceType: formData.evidenceType,
      description: formData.description,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveAssessments([...assessments, newAssessment]);
    toast.success(`Assessment recorded for ${student.firstName}`);
    setShowQuickAssessment(false);
    resetForm();
  };

  const handleBulkAssessment = () => {
    if (bulkStudents.length === 0 || !formData.subject || !formData.expectation) {
      toast.error('Please select students and fill in required fields');
      return;
    }

    const newAssessments: Assessment[] = bulkStudents.map(studentId => {
      const student = students.find(s => s.id === studentId);
      return {
        id: `assessment-${Date.now()}-${studentId}`,
        studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        date: new Date().toISOString(),
        subject: formData.subject,
        expectation: formData.expectation,
        expectationCode: formData.expectationCode || 'CUSTOM',
        level: formData.level,
        evidenceType: formData.evidenceType,
        description: formData.description,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    saveAssessments([...assessments, ...newAssessments]);
    toast.success(`Recorded ${newAssessments.length} assessments`);
    setShowBulkAssessment(false);
    setBulkStudents([]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      subject: '',
      expectation: '',
      expectationCode: '',
      level: 'MEETING',
      evidenceType: 'OBSERVATION',
      description: '',
      notes: ''
    });
  };

  const filteredAssessments = assessments.filter(a => {
    let matches = true;
    if (selectedStudent) matches = matches && a.studentId === selectedStudent;
    if (selectedSubject) matches = matches && a.subject === selectedSubject;
    if (filterDate) matches = matches && a.date.startsWith(filterDate);
    return matches;
  });

  const getEvidenceBalance = () => {
    const counts = { OBSERVATION: 0, CONVERSATION: 0, PRODUCT: 0 };
    filteredAssessments.forEach(a => {
      counts[a.evidenceType]++;
    });
    const total = filteredAssessments.length || 1;
    return {
      observation: Math.round((counts.OBSERVATION / total) * 100),
      conversation: Math.round((counts.CONVERSATION / total) * 100),
      product: Math.round((counts.PRODUCT / total) * 100)
    };
  };

  const balance = getEvidenceBalance();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment</h1>
        <p className="text-gray-600">ETFO 4-Level Mastery Tracking</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => setShowQuickAssessment(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          data-testid="quick-assess-btn"
        >
          <ClipboardDocumentCheckIcon className="w-5 h-5" />
          Quick Assessment
        </button>
        
        <button
          onClick={() => setShowBulkAssessment(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          data-testid="bulk-assess-btn"
        >
          <PlusIcon className="w-5 h-5" />
          Bulk Assessment
        </button>
        
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          data-testid="upload-artifact-btn"
        >
          <CameraIcon className="w-5 h-5" />
          Upload Artifact
        </button>
      </div>

      {/* Evidence Triangulation Balance */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Evidence Triangulation</h2>
        <div className="grid grid-cols-3 gap-4">
          {EVIDENCE_TYPES.map(type => {
            const percentage = balance[type.value.toLowerCase() as keyof typeof balance];
            const isBalanced = percentage >= 25 && percentage <= 40;
            const Icon = type.icon;
            
            return (
              <div key={type.value} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon className={`w-8 h-8 ${isBalanced ? 'text-green-600' : 'text-orange-500'}`} />
                </div>
                <div className="text-sm font-medium">{type.label}</div>
                <div className="text-2xl font-bold">{percentage}%</div>
                <div className="text-xs text-gray-500">{type.description}</div>
                {!isBalanced && percentage < 25 && (
                  <div className="text-xs text-orange-600 mt-1">Needs more data</div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Target: 33% each for balanced assessment
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="px-4 py-2 border rounded-lg"
          data-testid="filter-student"
        >
          <option value="">All Students</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.firstName} {student.lastName}
            </option>
          ))}
        </select>
        
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border rounded-lg"
          data-testid="filter-subject"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2 border rounded-lg"
          data-testid="filter-date"
        />
      </div>

      {/* Assessment List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Recent Assessments ({filteredAssessments.length})</h2>
        </div>
        
        <div className="divide-y">
          {filteredAssessments.slice(0, 20).map(assessment => {
            const level = MASTERY_LEVELS.find(l => l.value === assessment.level);
            const evidence = EVIDENCE_TYPES.find(e => e.value === assessment.evidenceType);
            const LevelIcon = level?.icon || CheckCircleIcon;
            const EvidenceIcon = evidence?.icon || DocumentTextIcon;
            
            return (
              <div key={assessment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{assessment.studentName}</span>
                      <span className="text-sm text-gray-600">{assessment.subject}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(assessment.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-sm text-gray-700">{assessment.expectation}</span>
                      {assessment.expectationCode && (
                        <span className="ml-2 text-xs text-gray-500">({assessment.expectationCode})</span>
                      )}
                    </div>
                    
                    {assessment.description && (
                      <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${level?.color === 'red' ? 'bg-red-100 text-red-700' : ''}
                        ${level?.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${level?.color === 'green' ? 'bg-green-100 text-green-700' : ''}
                        ${level?.color === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
                      `}>
                        <LevelIcon className="w-4 h-4" />
                        {level?.label}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <EvidenceIcon className="w-4 h-4" />
                        {evidence?.label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Assessment Modal */}
      {showQuickAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Quick Assessment</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="assessment-student"
                >
                  <option value="">Select student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  data-testid="assessment-subject"
                >
                  <option value="">Select subject</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Learning Expectation</label>
              <input
                type="text"
                value={formData.expectation}
                onChange={(e) => setFormData({ ...formData, expectation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Can count to 10 in French"
                data-testid="assessment-expectation"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Mastery Level</label>
              <div className="grid grid-cols-4 gap-2">
                {MASTERY_LEVELS.map(level => {
                  const Icon = level.icon;
                  return (
                    <button
                      key={level.value}
                      onClick={() => setFormData({ ...formData, level: level.value as Assessment['level'] })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.level === level.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`level-${level.value.toLowerCase()}`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1
                        ${level.color === 'red' ? 'text-red-600' : ''}
                        ${level.color === 'yellow' ? 'text-yellow-600' : ''}
                        ${level.color === 'green' ? 'text-green-600' : ''}
                        ${level.color === 'blue' ? 'text-blue-600' : ''}
                      `} />
                      <div className="text-xs font-medium">{level.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Evidence Type</label>
              <div className="grid grid-cols-3 gap-2">
                {EVIDENCE_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, evidenceType: type.value as Assessment['evidenceType'] })}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        formData.evidenceType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`evidence-${type.value.toLowerCase()}`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-1 text-gray-700" />
                      <div className="text-xs font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="What did you observe?"
                data-testid="assessment-description"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Professional Judgment Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Additional context or next steps"
                data-testid="assessment-notes"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleQuickAssessment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                data-testid="save-assessment-btn"
              >
                Save Assessment
              </button>
              <button
                onClick={() => {
                  setShowQuickAssessment(false);
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

      {/* Bulk Assessment Modal */}
      {showBulkAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Bulk Assessment</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Students</label>
              <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                {students.map(student => (
                  <label key={student.id} className="flex items-center gap-2 p-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={bulkStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkStudents([...bulkStudents, student.id]);
                        } else {
                          setBulkStudents(bulkStudents.filter(id => id !== student.id));
                        }
                      }}
                    />
                    <span>{student.firstName} {student.lastName}</span>
                  </label>
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {bulkStudents.length} students selected
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select subject</option>
                {SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Learning Expectation</label>
              <input
                type="text"
                value={formData.expectation}
                onChange={(e) => setFormData({ ...formData, expectation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Participated in group discussion"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Default Level</label>
              <div className="grid grid-cols-4 gap-2">
                {MASTERY_LEVELS.map(level => {
                  const Icon = level.icon;
                  return (
                    <button
                      key={level.value}
                      onClick={() => setFormData({ ...formData, level: level.value as Assessment['level'] })}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        formData.level === level.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto
                        ${level.color === 'red' ? 'text-red-600' : ''}
                        ${level.color === 'yellow' ? 'text-yellow-600' : ''}
                        ${level.color === 'green' ? 'text-green-600' : ''}
                        ${level.color === 'blue' ? 'text-blue-600' : ''}
                      `} />
                      <div className="text-xs">{level.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Evidence Type</label>
              <div className="grid grid-cols-3 gap-2">
                {EVIDENCE_TYPES.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, evidenceType: type.value as Assessment['evidenceType'] })}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        formData.evidenceType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto text-gray-700" />
                      <div className="text-xs">{type.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleBulkAssessment}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Record for {bulkStudents.length} Students
              </button>
              <button
                onClick={() => {
                  setShowBulkAssessment(false);
                  setBulkStudents([]);
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
    </div>
  );
}