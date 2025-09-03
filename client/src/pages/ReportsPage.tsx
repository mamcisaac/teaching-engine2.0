import { 
  DocumentTextIcon,
  DocumentArrowDownIcon,
  EnvelopeIcon,
  PrinterIcon,
  ShareIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface Report {
  id: string;
  type: 'progress' | 'summary' | 'parent' | 'term' | 'individual';
  title: string;
  studentId?: string;
  studentName?: string;
  dateRange: {
    start: string;
    end: string;
  };
  subjects: string[];
  createdAt: string;
  createdBy: string;
  format: 'pdf' | 'csv' | 'html';
  status: 'draft' | 'final';
  url?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface Assessment {
  studentId: string;
  studentName: string;
  subject: string;
  level: string;
  date: string;
  evidenceType: string;
}

const REPORT_TYPES = [
  {
    type: 'progress',
    title: 'Progress Report',
    description: 'Individual student progress over time',
    icon: ChartBarIcon,
    color: 'blue'
  },
  {
    type: 'summary',
    title: 'Class Summary',
    description: 'Overall class performance summary',
    icon: UserGroupIcon,
    color: 'green'
  },
  {
    type: 'parent',
    title: 'Parent Report',
    description: 'Simplified report for parent communication',
    icon: EnvelopeIcon,
    color: 'purple'
  },
  {
    type: 'term',
    title: 'Term Report',
    description: 'Comprehensive term-end assessment',
    icon: CalendarIcon,
    color: 'orange'
  },
  {
    type: 'individual',
    title: 'Individual Assessment',
    description: 'Detailed individual student assessment',
    icon: ClipboardDocumentCheckIcon,
    color: 'pink'
  }
];

export function ReportsPage(): React.ReactElement {
  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('assessment-reports');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [students] = useState<Student[]>(() => {
    const saved = localStorage.getItem('assessment-students');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [assessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('assessment-records');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'progress',
    studentId: '',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    subjects: [] as string[],
    format: 'pdf' as Report['format'],
    includeArtifacts: false,
    includeComments: true
  });

  const saveReports = (newReports: Report[]) => {
    setReports(newReports);
    localStorage.setItem('assessment-reports', JSON.stringify(newReports));
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      const student = formData.studentId 
        ? students.find(s => s.id === formData.studentId)
        : null;
      
      const reportType = REPORT_TYPES.find(t => t.type === formData.type);
      
      const newReport: Report = {
        id: `report-${Date.now()}`,
        type: formData.type as Report['type'],
        title: student 
          ? `${reportType?.title} - ${student.firstName} ${student.lastName}`
          : `${reportType?.title} - ${new Date().toLocaleDateString()}`,
        studentId: formData.studentId || undefined,
        studentName: student ? `${student.firstName} ${student.lastName}` : undefined,
        dateRange: formData.dateRange,
        subjects: formData.subjects.length > 0 ? formData.subjects : ['All Subjects'],
        createdAt: new Date().toISOString(),
        createdBy: 'Emily McIsaac',
        format: formData.format,
        status: 'draft',
        url: '#' // In a real app, this would be a generated file URL
      };
      
      saveReports([newReport, ...reports]);
      setGeneratingReport(false);
      setShowGenerateModal(false);
      toast.success('Report generated successfully');
      resetForm();
    }, 2000);
  };

  const handleFinalizeReport = (report: Report) => {
    const updatedReports = reports.map(r =>
      r.id === report.id ? { ...r, status: 'final' as const } : r
    );
    saveReports(updatedReports);
    toast.success('Report finalized');
  };

  const handleDeleteReport = (report: Report) => {
    if (confirm(`Delete ${report.title}?`)) {
      saveReports(reports.filter(r => r.id !== report.id));
      toast.success('Report deleted');
    }
  };

  const handleShareReport = (report: Report) => {
    // In a real app, this would handle sharing via email or link
    navigator.clipboard.writeText(`Report: ${report.title}`);
    toast.success('Report link copied to clipboard');
  };

  const handlePrintReport = (report: Report) => {
    window.print();
    toast.success('Print dialog opened');
  };

  const resetForm = () => {
    setFormData({
      type: 'progress',
      studentId: '',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      subjects: [],
      format: 'pdf',
      includeArtifacts: false,
      includeComments: true
    });
  };

  const generatePreviewContent = (report: Report) => {
    const studentAssessments = report.studentId 
      ? assessments.filter(a => a.studentId === report.studentId)
      : assessments;
    
    const dateFilteredAssessments = studentAssessments.filter(a => {
      const assessmentDate = new Date(a.date);
      const startDate = new Date(report.dateRange.start);
      const endDate = new Date(report.dateRange.end);
      return assessmentDate >= startDate && assessmentDate <= endDate;
    });
    
    const subjectFilteredAssessments = report.subjects.includes('All Subjects')
      ? dateFilteredAssessments
      : dateFilteredAssessments.filter(a => report.subjects.includes(a.subject));
    
    return {
      totalAssessments: subjectFilteredAssessments.length,
      subjects: [...new Set(subjectFilteredAssessments.map(a => a.subject))],
      levels: {
        NOT_YET: subjectFilteredAssessments.filter(a => a.level === 'NOT_YET').length,
        APPROACHING: subjectFilteredAssessments.filter(a => a.level === 'APPROACHING').length,
        MEETING: subjectFilteredAssessments.filter(a => a.level === 'MEETING').length,
        EXCEEDING: subjectFilteredAssessments.filter(a => a.level === 'EXCEEDING').length
      },
      evidenceBalance: {
        OBSERVATION: subjectFilteredAssessments.filter(a => a.evidenceType === 'OBSERVATION').length,
        CONVERSATION: subjectFilteredAssessments.filter(a => a.evidenceType === 'CONVERSATION').length,
        PRODUCT: subjectFilteredAssessments.filter(a => a.evidenceType === 'PRODUCT').length
      }
    };
  };

  const availableSubjects = [...new Set(assessments.map(a => a.subject))];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and manage assessment reports</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          data-testid="generate-report-btn"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          Generate Report
        </button>
      </div>

      {/* Report Types Grid */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {REPORT_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.type}
                onClick={() => {
                  setFormData({ ...formData, type: type.type });
                  setShowGenerateModal(true);
                }}
                className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow text-left"
              >
                <Icon className={`w-8 h-8 text-${type.color}-600 mb-2`} />
                <h3 className="font-medium text-sm">{type.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{type.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generated Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Generated Reports ({reports.length})</h2>
        </div>
        
        {reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No reports generated yet</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="mt-3 text-blue-600 hover:underline"
            >
              Generate your first report
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {reports.map(report => {
              const reportType = REPORT_TYPES.find(t => t.type === report.type);
              const Icon = reportType?.icon || DocumentTextIcon;
              
              return (
                <div key={report.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="w-6 h-6 text-gray-600 mt-1" />
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        {report.studentName && (
                          <p className="text-sm text-gray-600">{report.studentName}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>
                            {new Date(report.dateRange.start).toLocaleDateString()} - {' '}
                            {new Date(report.dateRange.end).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="uppercase">{report.format}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {report.subjects.map(subject => (
                            <span key={subject} className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {report.status === 'draft' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                          Draft
                        </span>
                      )}
                      {report.status === 'final' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          Final
                        </span>
                      )}
                      
                      <button
                        onClick={() => {
                          setPreviewReport(report);
                          setShowPreviewModal(true);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Preview"
                        data-testid={`preview-report-${report.id}`}
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handlePrintReport(report)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        title="Print"
                      >
                        <PrinterIcon className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleShareReport(report)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Share"
                      >
                        <ShareIcon className="w-5 h-5" />
                      </button>
                      
                      {report.status === 'draft' && (
                        <button
                          onClick={() => handleFinalizeReport(report)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Finalize
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Generate Report</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_TYPES.map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.type}
                        onClick={() => setFormData({ ...formData, type: type.type })}
                        className={`p-3 rounded-lg border-2 transition-colors text-left ${
                          formData.type === type.type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-sm">{type.title}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {(formData.type === 'progress' || formData.type === 'individual' || formData.type === 'parent') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Student</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    data-testid="report-student"
                  >
                    <option value="">Select student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.dateRange.start}
                    onChange={(e) => setFormData({
                      ...formData,
                      dateRange: { ...formData.dateRange, start: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                    data-testid="report-start-date"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.dateRange.end}
                    onChange={(e) => setFormData({
                      ...formData,
                      dateRange: { ...formData.dateRange, end: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                    data-testid="report-end-date"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subjects</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.subjects.length === 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, subjects: [] });
                        }
                      }}
                    />
                    <span>All Subjects</span>
                  </label>
                  {availableSubjects.map(subject => (
                    <label key={subject} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.subjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              subjects: [...formData.subjects, subject]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              subjects: formData.subjects.filter(s => s !== subject)
                            });
                          }
                        }}
                      />
                      <span>{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pdf', 'csv', 'html'] as const).map(format => (
                    <button
                      key={format}
                      onClick={() => setFormData({ ...formData, format })}
                      className={`p-2 rounded-lg border-2 uppercase text-sm transition-colors ${
                        formData.format === format
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`format-${format}`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.includeArtifacts}
                    onChange={(e) => setFormData({ ...formData, includeArtifacts: e.target.checked })}
                  />
                  <span>Include artifacts/work samples</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.includeComments}
                    onChange={(e) => setFormData({ ...formData, includeComments: e.target.checked })}
                  />
                  <span>Include teacher comments</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                data-testid="generate-btn"
              >
                {generatingReport ? 'Generating...' : 'Generate Report'}
              </button>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
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

      {/* Preview Modal */}
      {showPreviewModal && previewReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{previewReport.title}</h2>
                <p className="text-gray-600">
                  {new Date(previewReport.dateRange.start).toLocaleDateString()} - {' '}
                  {new Date(previewReport.dateRange.end).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewReport(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="border-t pt-4">
              {(() => {
                const content = generatePreviewContent(previewReport);
                return (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Assessment Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Assessments</p>
                          <p className="text-2xl font-bold">{content.totalAssessments}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Subjects Covered</p>
                          <p className="text-2xl font-bold">{content.subjects.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Mastery Levels</h3>
                      <div className="space-y-2">
                        {Object.entries(content.levels).map(([level, count]) => (
                          <div key={level} className="flex items-center justify-between">
                            <span className="text-sm">{level.replace('_', ' ')}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-4">
                                <div
                                  className="h-4 rounded-full bg-blue-500"
                                  style={{
                                    width: `${(count / content.totalAssessments) * 100}%`
                                  }}
                                />
                              </div>
                              <span className="text-sm w-8">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Evidence Types</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries(content.evidenceBalance).map(([type, count]) => (
                          <div key={type} className="text-center">
                            <p className="text-sm text-gray-600">{type}</p>
                            <p className="text-xl font-bold">{count}</p>
                            <p className="text-xs text-gray-500">
                              {Math.round((count / content.totalAssessments) * 100)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t">
                      <button
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download {previewReport.format.toUpperCase()}
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <EnvelopeIcon className="w-5 h-5" />
                        Email Report
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}