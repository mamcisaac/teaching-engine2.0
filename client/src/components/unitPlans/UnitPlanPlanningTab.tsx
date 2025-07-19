import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

import type { LongRangePlan } from '../../hooks/useETFOPlanning';
import type { UnitPlanFormData } from '../../hooks/useUnitPlanForm';
import { ExpectationSelector } from '../planning/ExpectationSelector';
import { RichTextEditor } from '../RichTextEditor';
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
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="unit-big-ideas">Big Ideas</label>
          <RichTextEditor
            id="unit-big-ideas"
            onChange={(value) => {
 updateField('bigIdeas', value); 
}}
            value={formData.bigIdeas}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection defaultExpanded title="Essential Questions">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="unit-questions">
            Essential Questions
          </label>
          <div className="space-y-2">
            {formData.essentialQuestions.map((question, index) => (
              <div className="flex gap-2" key={index}>
                <input
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  onChange={(e) => {
 updateArrayItem('essentialQuestions', index, e.target.value); 
}}
                  placeholder="Enter an essential question..."
                  type="text"
                  value={question}
                />
                <button
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                  onClick={() => {
 removeArrayItem('essentialQuestions', index); 
}}
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="text-sm text-indigo-600 hover:text-indigo-700"
              onClick={() => {
 addArrayItem('essentialQuestions'); 
}}
              type="button"
            >
              + Add Essential Question
            </button>
          </div>
        </div>
      </CollapsibleSection>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="unit-success-criteria">
          Success Criteria
        </label>
        <div className="space-y-2">
          {formData.successCriteria.map((criteria, index) => (
            <div className="flex gap-2" key={index}>
              <input
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                onChange={(e) => {
 updateArrayItem('successCriteria', index, e.target.value); 
}}
                placeholder="Students will be able to..."
                type="text"
                value={criteria}
              />
              <button
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                onClick={() => {
 removeArrayItem('successCriteria', index); 
}}
                type="button"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            className="text-sm text-indigo-600 hover:text-indigo-700"
            onClick={() => {
 addArrayItem('successCriteria'); 
}}
            type="button"
          >
            + Add Success Criteria
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="input">Key Vocabulary & Terminology</Label>
        <div className="space-y-2 mt-2">
          {formData.keyVocabulary.map((term, index) => (
            <div className="flex gap-2" key={index}>
              <Input
                onChange={(e) => {
 updateArrayItem('keyVocabulary', index, e.target.value); 
}}
                placeholder="Important term or concept..."
                type="text"
                value={term}
              />
              <Button
                onClick={() => {
 removeArrayItem('keyVocabulary', index); 
}}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            className="w-full"
            onClick={() => {
 addArrayItem('keyVocabulary'); 
}}
            size="sm"
            type="button"
            variant="outline"
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
          onChange={(e) => {
 updateField('priorKnowledge', e.target.value); 
}}
          placeholder="What should students already know before starting this unit?"
          rows={3}
          value={formData.priorKnowledge}
        />
      </div>

      <div>
        <ExpectationSelector
          grade={longRangePlan?.grade}
          label="Curriculum Expectations"
          onChange={(ids) => {
 updateField('expectationIds', ids); 
}}
          placeholder="Select curriculum expectations for this unit..."
          selectedIds={formData.expectationIds}
          subject={longRangePlan?.subject}
        />
      </div>

      <div>
        <Label htmlFor="input">Culminating Task Description</Label>
        <RichTextEditor
          onChange={(value) => {
 updateField('culminatingTask', value); 
}}
          value={formData.culminatingTask}
        />
      </div>
    </div>
  );