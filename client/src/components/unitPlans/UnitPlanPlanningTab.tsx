import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CollapsibleSection } from '../ui/MobileOptimizedForm';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import RichTextEditor from '../RichTextEditor';
import ExpectationSelector from '../planning/ExpectationSelector';
import { UnitPlanFormData } from '../../hooks/useUnitPlanForm';
import { LongRangePlan } from '../../hooks/useETFOPlanning';

interface UnitPlanPlanningTabProps {
  formData: UnitPlanFormData;
  updateField: <K extends keyof UnitPlanFormData>(field: K, value: UnitPlanFormData[K]) => void;
  addArrayItem: (field: keyof UnitPlanFormData, value?: string) => void;
  updateArrayItem: (field: keyof UnitPlanFormData, index: number, value: string) => void;
  removeArrayItem: (field: keyof UnitPlanFormData, index: number) => void;
  longRangePlan?: LongRangePlan;
}

export const UnitPlanPlanningTab: React.FC<UnitPlanPlanningTabProps> = ({
  formData,
  updateField,
  addArrayItem,
  updateArrayItem,
  removeArrayItem,
  longRangePlan,
}) => {
  return (
    <div className="space-y-6">
      <CollapsibleSection title="Big Ideas" defaultExpanded>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Big Ideas</label>
          <RichTextEditor
            value={formData.bigIdeas}
            onChange={(value) => updateField('bigIdeas', value)}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Essential Questions" defaultExpanded>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Essential Questions
          </label>
          <div className="space-y-2">
            {formData.essentialQuestions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => updateArrayItem('essentialQuestions', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter an essential question..."
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('essentialQuestions', index)}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('essentialQuestions')}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              + Add Essential Question
            </button>
          </div>
        </div>
      </CollapsibleSection>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Success Criteria
        </label>
        <div className="space-y-2">
          {formData.successCriteria.map((criteria, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={criteria}
                onChange={(e) => updateArrayItem('successCriteria', index, e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Students will be able to..."
              />
              <button
                type="button"
                onClick={() => removeArrayItem('successCriteria', index)}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('successCriteria')}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            + Add Success Criteria
          </button>
        </div>
      </div>

      <div>
        <Label>Key Vocabulary & Terminology</Label>
        <div className="space-y-2 mt-2">
          {formData.keyVocabulary.map((term, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                value={term}
                onChange={(e) => updateArrayItem('keyVocabulary', index, e.target.value)}
                placeholder="Important term or concept..."
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem('keyVocabulary', index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('keyVocabulary')}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Term
          </Button>
        </div>
      </div>

      <div>
        <Label>Prior Knowledge Requirements</Label>
        <Textarea
          value={formData.priorKnowledge}
          onChange={(e) => updateField('priorKnowledge', e.target.value)}
          placeholder="What should students already know before starting this unit?"
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <ExpectationSelector
          selectedIds={formData.expectationIds}
          onChange={(ids) => updateField('expectationIds', ids)}
          grade={longRangePlan?.grade}
          subject={longRangePlan?.subject}
          label="Curriculum Expectations"
          placeholder="Select curriculum expectations for this unit..."
        />
      </div>

      <div>
        <Label>Culminating Task Description</Label>
        <RichTextEditor
          value={formData.culminatingTask}
          onChange={(value) => updateField('culminatingTask', value)}
        />
      </div>
    </div>
  );
};