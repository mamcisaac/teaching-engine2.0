import { useState } from 'react';
import { Plus, FileText, ClipboardCheck, BookOpen } from 'lucide-react';
import {
  LanguageSensitiveAssessmentBuilder,
  AssessmentResultLogger,
  EvidenceQuickEntry,
} from '../components/assessment';
import { useAssessmentTemplates } from '../hooks/useAssessments';
import type { AssessmentTemplate } from '../types';

export default function AssessmentPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'evidence' | 'results'>('templates');
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);
  const [showResultLogger, setShowResultLogger] = useState(false);

  const { data: templates = [], isLoading, refetch } = useAssessmentTemplates();

  const handleCreateSuccess = () => {
    setShowBuilder(false);
    refetch();
  };

  const handleResultSuccess = () => {
    setShowResultLogger(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assessment Tools</h1>
        {activeTab === 'templates' && (
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Assessment
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Assessment Templates
            </div>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'evidence'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Quick Evidence Entry
            </div>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Log Results
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'templates' && (
          <div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assessment templates</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new assessment template.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Assessment
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowResultLogger(true);
                      setActiveTab('results');
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{template.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{template.type}</p>
                        {template.description && (
                          <p className="mt-2 text-sm text-gray-600">{template.description}</p>
                        )}
                      </div>
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {template.outcomeIds?.length || 0} outcomes
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(template);
                          setShowResultLogger(true);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Log Results
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="max-w-4xl mx-auto">
            <EvidenceQuickEntry
              onSuccess={() => {
                // Could show a success message or refresh data
              }}
            />
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            {selectedTemplate ? (
              <div className="max-w-4xl mx-auto">
                <AssessmentResultLogger
                  template={selectedTemplate}
                  onSuccess={handleResultSuccess}
                  onCancel={() => setSelectedTemplate(null)}
                />
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select an assessment</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose an assessment template from the Templates tab to log results.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Assessment Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <LanguageSensitiveAssessmentBuilder
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowBuilder(false)}
            />
          </div>
        </div>
      )}

      {/* Result Logger Modal (when opened from templates grid) */}
      {showResultLogger && selectedTemplate && activeTab === 'templates' && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <AssessmentResultLogger
              template={selectedTemplate}
              onSuccess={handleResultSuccess}
              onCancel={() => {
                setShowResultLogger(false);
                setSelectedTemplate(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
