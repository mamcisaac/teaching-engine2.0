import React from 'react';

import { Label } from '../../../../components/ui/Label';
import { Textarea } from '../../../../components/ui/Textarea';
import { InfoTooltip } from '../../../../components/ui/Tooltip';
import type { ETFOLessonPlanFormData } from '../../hooks/useETFOLessonPlanForm';

interface AssessmentTabProps {
  formData: ETFOLessonPlanFormData;
  updateFormData: (updates: Partial<ETFOLessonPlanFormData>) => void;
}

export function AssessmentTab({ formData, updateFormData }: AssessmentTabProps): React.ReactElement {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <div className="flex items-center">
          <Label htmlFor="input">Assessment Type</Label>
          <InfoTooltip content="Choose the primary purpose of assessment for this lesson. You can use multiple types throughout the lesson." />
        </div>
        <select
          className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.assessmentType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            updateFormData({
              assessmentType: e.target.value as 'diagnostic' | 'formative' | 'summative',
            });
          }}
        >
          <option value="diagnostic">
            Diagnostic - Assessment FOR Learning (Before/Beginning)
          </option>
          <option value="formative">Formative - Assessment AS Learning (During)</option>
          <option value="summative">
            Summative - Assessment OF Learning (After/End)
          </option>
        </select>
        <div className="mt-2 text-sm text-gray-600">
          {formData.assessmentType === 'diagnostic' && (
            <p className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <strong>Diagnostic Assessment:</strong> Used at the beginning to determine
              what students already know and identify learning needs.
              <br />
              <strong>Examples:</strong> KWL charts, pre-tests, class discussions,
              entrance tickets, thumbs up/down checks
            </p>
          )}
          {formData.assessmentType === 'formative' && (
            <p className="bg-green-50 p-3 rounded-md border border-green-200">
              <strong>Formative Assessment:</strong> Ongoing assessment during learning
              to provide feedback and adjust teaching. Students actively assess their
              own learning.
              <br />
              <strong>Examples:</strong> Exit tickets, peer feedback, self-reflection
              journals, mini-whiteboards, think-pair-share, observation checklists
            </p>
          )}
          {formData.assessmentType === 'summative' && (
            <p className="bg-purple-50 p-3 rounded-md border border-purple-200">
              <strong>Summative Assessment:</strong> Used at the end to evaluate student
              achievement of learning goals and assign grades.
              <br />
              <strong>Examples:</strong> Unit tests, final projects, presentations,
              portfolios, performance tasks, end-of-term assignments
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center">
          <Label htmlFor="input">Success Criteria</Label>
          <InfoTooltip content="Clear, specific statements that describe what success looks like. Written in student-friendly language starting with 'I can...'" />
        </div>
        <Textarea
          className="mt-1"
          placeholder="Success Criteria (I can statements):
• I can identify the main idea of a text
• I can use evidence from the text to support my answer
• I can work cooperatively with my group

Assessment Strategies:
• Observation during group work
• Exit ticket with key question
• Self-assessment checklist"
          rows={6}
          value={formData.assessmentNotes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            updateFormData({ assessmentNotes: e.target.value });
          }}
        />
        <p className="mt-1 text-xs text-gray-500">
          Include both success criteria and the specific assessment strategies
          you'll use to gather evidence of learning.
        </p>
      </div>
    </div>
  );
}