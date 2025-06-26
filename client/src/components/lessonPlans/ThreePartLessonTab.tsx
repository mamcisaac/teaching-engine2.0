import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/Label';
import RichTextEditor from '../RichTextEditor';
import { LessonPlanFormData } from '../../hooks/useETFOLessonPlanForm';
import { LessonPlanService } from '../../services/lessonPlanService';

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
            <Label>Activities (English)</Label>
            <RichTextEditor
              value={formData.mindsOn}
              onChange={(value) => updateField('mindsOn', value)}
            />
          </div>
          <div>
            <Label>Activities (French)</Label>
            <RichTextEditor
              value={formData.mindsOnFr}
              onChange={(value) => updateField('mindsOnFr', value)}
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
            <Label>Activities (English)</Label>
            <RichTextEditor
              value={formData.action}
              onChange={(value) => updateField('action', value)}
            />
          </div>
          <div>
            <Label>Activities (French)</Label>
            <RichTextEditor
              value={formData.actionFr}
              onChange={(value) => updateField('actionFr', value)}
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
            <Label>Activities (English)</Label>
            <RichTextEditor
              value={formData.consolidation}
              onChange={(value) => updateField('consolidation', value)}
            />
          </div>
          <div>
            <Label>Activities (French)</Label>
            <RichTextEditor
              value={formData.consolidationFr}
              onChange={(value) => updateField('consolidationFr', value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};