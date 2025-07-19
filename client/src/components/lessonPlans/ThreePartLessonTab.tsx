import React from 'react';

import type { LessonPlanFormData } from '../../hooks/useETFOLessonPlanForm';
import { LessonPlanService } from '../../services/lessonPlanService';
import { RichTextEditor } from '../RichTextEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/Label';

interface ThreePartLessonTabProps {
  formData: LessonPlanFormData;
  updateField: <K extends keyof LessonPlanFormData>(field: K, value: LessonPlanFormData[K]) => void;
}

export const ThreePartLessonTab: React.FC<ThreePartLessonTabProps> = ({
  formData,
  updateField,
}) => {
  const timeAllocation = LessonPlanService.calculateTimeAllocation(formData.duration);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Minds On ({timeAllocation.mindsOn} min)</CardTitle>
          <CardDescription>
            Hook and activate prior knowledge (typically 10-15% of lesson time)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="input">Activities (English)</Label>
            <RichTextEditor
              onChange={(value) => {
 updateField('mindsOn', value); 
}}
              value={formData.mindsOn}
            />
          </div>
          <div>
            <Label htmlFor="input">Activities (French)</Label>
            <RichTextEditor
              onChange={(value) => {
 updateField('mindsOnFr', value); 
}}
              value={formData.mindsOnFr}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action ({timeAllocation.action} min)</CardTitle>
          <CardDescription>
            Main learning activities and exploration (typically 60-70% of lesson time)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="input">Activities (English)</Label>
            <RichTextEditor
              onChange={(value) => {
 updateField('action', value); 
}}
              value={formData.action}
            />
          </div>
          <div>
            <Label htmlFor="input">Activities (French)</Label>
            <RichTextEditor
              onChange={(value) => {
 updateField('actionFr', value); 
}}
              value={formData.actionFr}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consolidation ({timeAllocation.consolidation} min)</CardTitle>
          <CardDescription>
            Summarize, reflect, and assess understanding (typically 20% of lesson time)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="input">Activities (English)</Label>
            <RichTextEditor
              onChange={(value) => {
 updateField('consolidation', value); 
}}
              value={formData.consolidation}
            />
          </div>
          <div>
            <Label htmlFor="input">Activities (French)</Label>
            <RichTextEditor
              onChange={(value) => {
 updateField('consolidationFr', value); 
}}
              value={formData.consolidationFr}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};