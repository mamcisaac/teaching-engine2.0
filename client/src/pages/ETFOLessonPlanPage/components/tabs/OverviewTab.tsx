import React from 'react';

import { ExpectationSelector } from '../../../../components/planning/ExpectationSelector';
import { RichTextEditor } from '../../../../components/RichTextEditor';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Input } from '../../../../components/ui/Input';
import { Label } from '../../../../components/ui/Label';
import { CollapsibleSection } from '../../../../components/ui/MobileOptimizedForm';
import { Textarea } from '../../../../components/ui/Textarea';
import type { ETFOLessonPlanFormData } from '../../hooks/useETFOLessonPlanForm';

interface OverviewTabProps {
  formData: ETFOLessonPlanFormData;
  updateFormData: (updates: Partial<ETFOLessonPlanFormData>) => void;
  unitPlan?: any;
}

export function OverviewTab({ formData, updateFormData, unitPlan }: OverviewTabProps): React.ReactElement {
  return (
    <div className="space-y-4 mt-4">
      <CollapsibleSection defaultExpanded required title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="input">Lesson Title *</Label>
            <Input
              required
              placeholder="e.g., Introduction to Ecosystems"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateFormData({ title: e.target.value });
              }}
            />
          </div>
          <div>
            <Label htmlFor="input">Title (French)</Label>
            <Input
              placeholder="e.g., Introduction aux écosystèmes"
              value={formData.titleFr}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateFormData({ titleFr: e.target.value });
              }}
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection defaultExpanded title="Scheduling & Duration">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="input">Date *</Label>
            <Input
              required
              type="date"
              value={formData.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateFormData({ date: e.target.value });
              }}
            />
          </div>
          <div>
            <Label htmlFor="input">Duration (minutes) *</Label>
            <Input
              required
              max="300"
              min="15"
              type="number"
              value={formData.duration}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateFormData({ duration: Number(e.target.value) });
              }}
            />
          </div>
          <div>
            <Label htmlFor="input">Grouping</Label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.grouping}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                updateFormData({ grouping: e.target.value });
              }}
            >
              <option value="whole">Whole Class</option>
              <option value="small">Small Groups</option>
              <option value="pairs">Pairs</option>
              <option value="individual">Individual</option>
              <option value="mixed">Mixed Groupings</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection defaultExpanded title="Learning Goals">
        <div>
          <Label htmlFor="input">Learning Goals</Label>
          <RichTextEditor
            value={formData.learningGoals}
            onChange={(value) => {
              updateFormData({ learningGoals: value });
            }}
          />
        </div>

        <div>
          <Label htmlFor="input">Learning Goals (French)</Label>
          <RichTextEditor
            value={formData.learningGoalsFr}
            onChange={(value) => {
              updateFormData({ learningGoalsFr: value });
            }}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection defaultExpanded={false} title="Special Considerations">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.isSubFriendly}
              id="subFriendly"
              onCheckedChange={(checked) => {
                updateFormData({ isSubFriendly: checked as boolean });
              }}
            />
            <Label className="font-normal" htmlFor="subFriendly">
              This lesson is substitute teacher friendly
            </Label>
          </div>

          {formData.isSubFriendly && (
            <div>
              <Label htmlFor="input">Substitute Teacher Notes</Label>
              <Textarea
                placeholder="Special instructions for substitute teachers..."
                rows={3}
                value={formData.subNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  updateFormData({ subNotes: e.target.value });
                }}
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection defaultExpanded title="Curriculum Expectations">
        <div>
          <ExpectationSelector
            grade={unitPlan?.longRangePlan?.grade}
            label="Curriculum Expectations"
            placeholder="Select curriculum expectations for this lesson..."
            selectedIds={formData.expectationIds}
            subject={unitPlan?.longRangePlan?.subject}
            onChange={(ids) => {
              updateFormData({ expectationIds: ids });
            }}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}