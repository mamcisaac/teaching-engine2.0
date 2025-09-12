import {
  ChartBarIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import React from 'react';

import { useExpectationProgress } from '../../hooks/useExpectationProgress';
import type { Student } from '../../services/api/students';

interface ExpectationProgressViewProps {
  student: Student;
}

const levelColors = {
  EXCEEDING: 'text-purple-600 bg-purple-50 border-purple-200',
  MEETING: 'text-green-600 bg-green-50 border-green-200',
  APPROACHING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  BEGINNING: 'text-orange-600 bg-orange-50 border-orange-200',
  NOT_YET: 'text-red-600 bg-red-50 border-red-200'
};

const levelLabels = {
  EXCEEDING: 'Exceeding',
  MEETING: 'Meeting',
  APPROACHING: 'Approaching',
  BEGINNING: 'Beginning',
  NOT_YET: 'Not Yet'
};

export function ExpectationProgressView({ student }: ExpectationProgressViewProps): React.ReactElement {
  const { data, isLoading, error } = useExpectationProgress(student.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">Failed to load expectation progress</p>
      </div>
    );
  }

  if (!data || data.totalExpectationsAssessed === 0) {
    return (
      <div className="text-center py-8">
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No expectation progress data available</p>
        <p className="text-sm text-gray-400 mt-1">Assess this student against curriculum expectations to see progress</p>
      </div>
    );
  }

  // Flatten all progress items from all subjects
  const allProgress: any[] = [];
  Object.values(data.progressBySubject).forEach(subjectProgress => {
    allProgress.push(...subjectProgress);
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.totalExpectationsAssessed}</div>
            <div className="text-sm text-blue-800">Expectations Assessed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Object.keys(data.progressBySubject).length}</div>
            <div className="text-sm text-blue-800">Subjects Covered</div>
          </div>
        </div>
      </div>

      {/* Expectation Progress List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Progress by Expectation</h3>
        
        {allProgress.map((progress) => (
          <div key={progress.expectationId} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-semibold text-gray-700">
                    {progress.expectationCode}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {progress.subject}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{progress.expectationTitle}</p>
              </div>
              
              {/* Trend Indicator */}
              <div className="flex items-center gap-2">
                {progress.trend === 'improving' && (
                  <div className="flex items-center text-green-600">
                    <ArrowUpIcon className="h-4 w-4" />
                    <span className="text-xs">Improving</span>
                  </div>
                )}
                {progress.trend === 'declining' && (
                  <div className="flex items-center text-red-600">
                    <ArrowDownIcon className="h-4 w-4" />
                    <span className="text-xs">Declining</span>
                  </div>
                )}
                {progress.trend === 'stable' && (
                  <div className="flex items-center text-gray-600">
                    <MinusIcon className="h-4 w-4" />
                    <span className="text-xs">Stable</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Current Level */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${levelColors[progress.currentLevel as keyof typeof levelColors]}`}>
                  {levelLabels[progress.currentLevel as keyof typeof levelLabels]}
                </span>
                
                {progress.previousLevel && progress.previousLevel !== progress.currentLevel && (
                  <>
                    <span className="text-gray-400">←</span>
                    <span className="text-sm text-gray-500 line-through">
                      {levelLabels[progress.previousLevel as keyof typeof levelLabels]}
                    </span>
                  </>
                )}
              </div>

              {/* Assessment Count */}
              <div className="flex items-center gap-1">
                <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{progress.assessments.length} lessons</span>
              </div>
            </div>

            {/* Evidence Balance - ETFO Triangulation */}
            {progress.evidenceBalance && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-600 font-medium mb-2">Evidence Triangulation (ETFO):</div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-base">👁️</span>
                      <span className="text-xs text-gray-600">Observation</span>
                      <span className="text-xs font-bold text-gray-800 ml-1">
                        {progress.evidenceBalance.observation || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-base">💬</span>
                      <span className="text-xs text-gray-600">Conversation</span>
                      <span className="text-xs font-bold text-gray-800 ml-1">
                        {progress.evidenceBalance.conversation || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-base">📄</span>
                      <span className="text-xs text-gray-600">Product</span>
                      <span className="text-xs font-bold text-gray-800 ml-1">
                        {progress.evidenceBalance.product || 0}
                      </span>
                    </div>
                  </div>
                  {/* Balance indicator */}
                  {progress.evidenceBalance && (
                    <div className="text-xs">
                      {Math.abs((progress.evidenceBalance.observation || 0) - (progress.evidenceBalance.conversation || 0)) <= 1 &&
                       Math.abs((progress.evidenceBalance.conversation || 0) - (progress.evidenceBalance.product || 0)) <= 1 &&
                       Math.abs((progress.evidenceBalance.observation || 0) - (progress.evidenceBalance.product || 0)) <= 1 ? (
                        <span className="text-green-600 font-medium">✓ Balanced</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">⚠ Imbalanced</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{progress.totalEvidencePieces} pieces of evidence</span>
              <span>Last assessed: {new Date(progress.lastAssessmentDate).toLocaleDateString()}</span>
            </div>

            {/* Show assessment details if available */}
            {progress.assessments.length > 0 && (
              <div className="mt-3 border-t pt-2">
                <div className="text-xs text-gray-600 font-medium mb-1">Recent Assessments:</div>
                <div className="space-y-1">
                  {progress.assessments.slice(-3).map((assessment: any) => (
                    <div key={assessment.id} className="text-xs text-gray-500 flex justify-between">
                      <span>{assessment.lessonTitle}</span>
                      <span className={`font-medium ${
                        assessment.level === 'EXCEEDING' ? 'text-purple-600' :
                        assessment.level === 'MEETING' ? 'text-green-600' :
                        assessment.level === 'APPROACHING' ? 'text-yellow-600' :
                        'text-orange-600'
                      }`}>
                        {levelLabels[assessment.level as keyof typeof levelLabels]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}