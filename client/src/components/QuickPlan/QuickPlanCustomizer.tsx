import React from 'react';
import { Save, Sparkles } from 'lucide-react';

import type { QuickPlanData, TemplatePreference } from '../../hooks/useQuickPlan';
import { useUnitPlans } from '../../hooks/useETFOPlanning';
import { useQuickPlanTemplates } from '../../hooks/useQuickPlan';

interface Props {
  planData: QuickPlanData;
  customizations: Partial<QuickPlanData>;
  onUpdate: (field: keyof QuickPlanData, value: any) => void;
  onSaveTemplate: () => void;
  onApplyTemplate?: (templateData: QuickPlanData) => void;
  onRegenerateWithPreference?: (preference: TemplatePreference) => void;
}

export function QuickPlanCustomizer({ 
  planData, 
  customizations, 
  onUpdate, 
  onSaveTemplate,
  onApplyTemplate,
  onRegenerateWithPreference 
}: Props): React.ReactElement {
  const { data: unitPlans = [] } = useUnitPlans({});
  const { templates, applyTemplate } = useQuickPlanTemplates();

  const handleTemplateSelect = (templateId: string): void => {
    const templateData = applyTemplate(templateId);
    if (templateData && onApplyTemplate) {
      onApplyTemplate(templateData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Preference Selector */}
      {onRegenerateWithPreference && (
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-3">Regenerate with Different Style</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['engaging', 'structured', 'creative', 'balanced'] as TemplatePreference[]).map(preference => (
              <button
                key={preference}
                onClick={() => onRegenerateWithPreference(preference)}
                className="px-3 py-2 bg-white border border-indigo-300 rounded-md hover:bg-indigo-100 transition-colors text-sm capitalize"
              >
                <Sparkles className="h-3 w-3 inline mr-1" />
                {preference}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Apply Saved Template */}
      {templates.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Apply Saved Template
          </label>
          <select
            onChange={(e) => e.target.value && handleTemplateSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a template...</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.subject} (Grade {template.grade})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Basic Info */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Title
            </label>
            <input
              type="text"
              value={customizations.title || planData.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (French)
            </label>
            <input
              type="text"
              value={customizations.titleFr || planData.titleFr}
              onChange={(e) => onUpdate('titleFr', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="120"
              step="5"
              value={customizations.duration || planData.duration}
              onChange={(e) => onUpdate('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={customizations.date || planData.date || new Date().toISOString().split('T')[0]}
              onChange={(e) => onUpdate('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Unit Plan Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link to Unit Plan (Optional)
        </label>
        <select
          value={customizations.unitPlanId || planData.unitPlanId || ''}
          onChange={(e) => onUpdate('unitPlanId', e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">No unit plan selected</option>
          {unitPlans.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.title} - {unit.longRangePlan?.subject}
            </option>
          ))}
        </select>
      </div>

      {/* Learning Goals */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Learning Goals</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              English
            </label>
            <textarea
              value={customizations.learningGoals || planData.learningGoals}
              onChange={(e) => onUpdate('learningGoals', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              French
            </label>
            <textarea
              value={customizations.learningGoalsFr || planData.learningGoalsFr}
              onChange={(e) => onUpdate('learningGoalsFr', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Lesson Activities */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Lesson Activities</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minds On Activity
            </label>
            <textarea
              value={customizations.mindsOn || planData.mindsOn}
              onChange={(e) => onUpdate('mindsOn', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="How will you engage students at the start?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action (Main Activity)
            </label>
            <textarea
              value={customizations.action || planData.action}
              onChange={(e) => onUpdate('action', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="What is the main learning activity?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consolidation
            </label>
            <textarea
              value={customizations.consolidation || planData.consolidation}
              onChange={(e) => onUpdate('consolidation', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="How will students demonstrate their learning?"
            />
          </div>
        </div>
      </div>

      {/* Materials */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Materials (one per line)
        </label>
        <textarea
          value={(customizations.materials || planData.materials).join('\n')}
          onChange={(e) => onUpdate('materials', e.target.value.split('\n').filter(m => m.trim()))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="List materials needed..."
        />
      </div>

      {/* Assessment Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assessment Notes
        </label>
        <textarea
          value={customizations.assessmentNotes || planData.assessmentNotes}
          onChange={(e) => onUpdate('assessmentNotes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="How will you assess student learning?"
        />
      </div>

      {/* Save as Template Option */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Save as Template</h4>
            <p className="text-sm text-gray-600">
              Save this lesson structure for future use
            </p>
          </div>
          <button
            onClick={onSaveTemplate}
            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}