import { X, FileText, Calendar, Clock, Users, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import type { PlanTemplate, UnitPlanContent, LessonPlanContent } from '../../types/template';

interface TemplatePreviewModalProps {
  template: PlanTemplate;
  onClose: () => void;
  onApply: (template: PlanTemplate) => void;
}

export default function TemplatePreviewModal({
  template,
  onClose,
  onApply,
}: TemplatePreviewModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const renderUnitPlanContent = (content: UnitPlanContent) => {
    const sections = [
      { key: 'overview', title: 'Overview', content: content.overview },
      { key: 'bigIdeas', title: 'Big Ideas', content: content.bigIdeas },
      { key: 'learningGoals', title: 'Learning Goals', content: content.learningGoals, isList: true },
      { key: 'essentialQuestions', title: 'Essential Questions', content: content.essentialQuestions, isList: true },
      { key: 'assessments', title: 'Assessments', content: content.assessments, isAssessments: true },
      { key: 'successCriteria', title: 'Success Criteria', content: content.successCriteria, isList: true },
      { key: 'keyVocabulary', title: 'Key Vocabulary', content: content.keyVocabulary, isList: true },
      { key: 'differentiationStrategies', title: 'Differentiation Strategies', content: content.differentiationStrategies, isDiff: true },
      { key: 'culminatingTask', title: 'Culminating Task', content: content.culminatingTask },
    ];

    return (
      <div className="space-y-4">
        {sections.map(({ key, title, content, isList, isAssessments, isDiff }) => {
          if (!content || (Array.isArray(content) && content.length === 0)) return null;

          const isExpanded = expandedSections.has(key);

          return (
            <div key={key} className="border rounded-lg">
              <button
                onClick={() => toggleSection(key)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-left">{title}</h4>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {isExpanded && (
                <div className="px-4 pb-3">
                  {isList && Array.isArray(content) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {content.map((item, index) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  ) : isAssessments && Array.isArray(content) ? (
                    <div className="space-y-2">
                      {content.map((assessment, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="font-medium">{assessment.type}</div>
                          <div className="text-gray-700">{assessment.description}</div>
                          {assessment.timing && (
                            <div className="text-sm text-gray-500 mt-1">Timing: {assessment.timing}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : isDiff && typeof content === 'object' ? (
                    <div className="space-y-2">
                      {Object.entries(content).map(([key, strategies]) => (
                        <div key={key}>
                          <div className="font-medium text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </div>
                          <ul className="list-disc list-inside ml-4">
                            {(strategies as string[]).map((strategy, index) => (
                              <li key={index} className="text-gray-700 text-sm">{strategy}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700">{content}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderLessonPlanContent = (content: LessonPlanContent) => {
    const sections = [
      { key: 'objectives', title: 'Learning Objectives', content: content.objectives, isList: true },
      { key: 'materials', title: 'Materials', content: content.materials, isList: true },
      { key: 'mindsOn', title: 'Minds On', content: content.mindsOn },
      { key: 'action', title: 'Action', content: content.action },
      { key: 'consolidation', title: 'Consolidation', content: content.consolidation },
      { key: 'accommodations', title: 'Accommodations', content: content.accommodations, isList: true },
      { key: 'modifications', title: 'Modifications', content: content.modifications, isList: true },
      { key: 'extensions', title: 'Extensions', content: content.extensions, isList: true },
      { key: 'assessment', title: 'Assessment', content: content.assessmentNotes, assessmentType: content.assessmentType },
    ];

    return (
      <div className="space-y-4">
        {sections.map(({ key, title, content, isList, assessmentType }) => {
          if (!content || (Array.isArray(content) && content.length === 0)) return null;

          const isExpanded = expandedSections.has(key);

          return (
            <div key={key} className="border rounded-lg">
              <button
                onClick={() => toggleSection(key)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-left">{title}</h4>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {isExpanded && (
                <div className="px-4 pb-3">
                  {isList && Array.isArray(content) ? (
                    <ul className="list-disc list-inside space-y-1">
                      {content.map((item, index) => (
                        <li key={index} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  ) : key === 'assessment' ? (
                    <div>
                      {assessmentType && (
                        <div className="mb-2">
                          <span className="font-medium">Type:</span>{' '}
                          <span className="capitalize">{assessmentType}</span>
                        </div>
                      )}
                      <p className="text-gray-700">{content}</p>
                    </div>
                  ) : (
                    <p className="text-gray-700">{content}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {template.type === 'UNIT_PLAN' ? (
              <FileText className="h-6 w-6 text-blue-600" />
            ) : (
              <Calendar className="h-6 w-6 text-green-600" />
            )}
            <div>
              <h2 className="text-xl font-semibold">{template.title}</h2>
              <p className="text-sm text-gray-600">
                {template.type === 'UNIT_PLAN' ? 'Unit Plan Template' : 'Lesson Plan Template'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Metadata */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {template.subject && (
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="capitalize">{template.subject}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-400" />
              <span>
                {template.gradeMin && template.gradeMax
                  ? template.gradeMin === template.gradeMax
                    ? `Grade ${template.gradeMin}`
                    : `Grades ${template.gradeMin}-${template.gradeMax}`
                  : 'All grades'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>
                {template.type === 'UNIT_PLAN' && template.estimatedWeeks
                  ? `${template.estimatedWeeks} weeks`
                  : template.type === 'LESSON_PLAN' && template.estimatedMinutes
                  ? `${template.estimatedMinutes} minutes`
                  : 'Duration varies'}
              </span>
            </div>
          </div>

          {/* Description */}
          {template.description && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700">{template.description}</p>
            </div>
          )}

          {/* Tags */}
          {template.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template Content */}
          <div>
            <h3 className="font-medium mb-3">Template Content</h3>
            {template.type === 'UNIT_PLAN'
              ? renderUnitPlanContent(template.content as UnitPlanContent)
              : renderLessonPlanContent(template.content as LessonPlanContent)}
          </div>

          {/* Structure */}
          {template.type === 'UNIT_PLAN' && template.unitStructure && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Unit Structure</h3>
              {template.unitStructure.phases && template.unitStructure.phases.length > 0 && (
                <div className="space-y-3">
                  {template.unitStructure.phases.map((phase, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium">{phase.name}</div>
                      {phase.description && (
                        <p className="text-gray-700 text-sm mt-1">{phase.description}</p>
                      )}
                      {phase.estimatedDays && (
                        <p className="text-gray-500 text-sm mt-1">
                          Estimated: {phase.estimatedDays} days
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {template.createdByUser ? (
              <span>Created by {template.createdByUser.name}</span>
            ) : (
              <span>System template</span>
            )}
            {template.usageCount > 0 && (
              <span className="ml-2">• Used {template.usageCount} times</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onApply(template)}>
              Use This Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}