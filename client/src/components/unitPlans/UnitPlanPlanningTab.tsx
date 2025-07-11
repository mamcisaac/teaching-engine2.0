import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

import type { LongRangePlan } from '../../hooks/useETFOPlanning';
import type { UnitPlanFormData } from '../../hooks/useUnitPlanForm';
import ExpectationSelector from '../planning/ExpectationSelector';
import RichTextEditor from '../RichTextEditor';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { CollapsibleSection } from '../ui/MobileOptimizedForm';
import { Textarea } from '../ui/Textarea';

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
}) => (
    <div className="space-y-6">
      <CollapsibleSection defaultExpanded title="Big Ideas">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Big Ideas</label>
          <RichTextEditor
            value={formData.bigIdeas}
            onChange={(value) => {
 updateField('bigIdeas', value); 
}}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection defaultExpanded title="Essential Questions">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Essential Questions
          </label>
          <div className="space-y-2">
            {formData.essentialQuestions.map((question, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter an essential question..."
                  type="text"
                  value={question}
                  onChange={(e) => {
 updateArrayItem('essentialQuestions', index, e.target.value); 
}}
                />
                <button
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                  type="button"
                  onClick={() => {
 removeArrayItem('essentialQuestions', index); 
}}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="text-sm text-indigo-600 hover:text-indigo-700"
              type="button"
              onClick={() => {
 addArrayItem('essentialQuestions'); 
}}
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
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Students will be able to..."
                type="text"
                value={criteria}
                onChange={(e) => {
 updateArrayItem('successCriteria', index, e.target.value); 
}}
              />
              <button
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                type="button"
                onClick={() => {
 removeArrayItem('successCriteria', index); 
}}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="text-sm text-indigo-600 hover:text-indigo-700"
            type="button"
            onClick={() => {
 addArrayItem('successCriteria'); 
}}
          >
            + Add Success Criteria
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="input">Key Vocabulary & Terminology</Label>
        <div className="space-y-2 mt-2">
          {formData.keyVocabulary.map((term, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Important term or concept..."
                type="text"
                value={term}
                onChange={(e) => {
 updateArrayItem('keyVocabulary', index, e.target.value); 
}}
              />
              <Button
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => {
 removeArrayItem('keyVocabulary', index); 
}}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            className="w-full"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => {
 addArrayItem('keyVocabulary'); 
}}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Term
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="input">Prior Knowledge Requirements</Label>
        <Textarea
          className="mt-2"
          placeholder="What should students already know before starting this unit?"
          rows={3}
          value={formData.priorKnowledge}
          onChange={(e) => {
 updateField('priorKnowledge', e.target.value); 
}}
        />
      </div>

      <div>
        <ExpectationSelector
          grade={longRangePlan?.grade}
          label="Curriculum Expectations"
          placeholder="Select curriculum expectations for this unit..."
          selectedIds={formData.expectationIds}
          subject={longRangePlan?.subject}
          onChange={(ids) => {
 updateField('expectationIds', ids); 
}}
        />
      </div>

      <div>
        <Label htmlFor="input">Culminating Task Description</Label>
        <RichTextEditor
          value={formData.culminatingTask}
          onChange={(value) => {
 updateField('culminatingTask', value); 
}}
        />
      </div>
    </div>
  );