import React from 'react';

import { RichTextEditor } from '../../../../components/RichTextEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/Label';
import type { ETFOLessonPlanFormData } from '../../hooks/useETFOLessonPlanForm';

interface ThreePartLessonTabProps {
  formData: ETFOLessonPlanFormData;
  updateFormData: (updates: Partial<ETFOLessonPlanFormData>) => void;
}

export function ThreePartLessonTab({ formData, updateFormData }: ThreePartLessonTabProps): React.ReactElement {
  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Minds On</CardTitle>
          <CardDescription>
            Hook and activate prior knowledge (typically 10-15% of lesson time)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="input">Activities (English)</Label>
            <RichTextEditor
              value={formData.mindsOn}
              onChange={(value) => {
                updateFormData({ mindsOn: value });
              }}
            />
          </div>
          <div>
            <Label htmlFor="input">Activities (French)</Label>
            <RichTextEditor
              value={formData.mindsOnFr}
              onChange={(value) => {
                updateFormData({ mindsOnFr: value });
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action</CardTitle>
          <CardDescription>
            Main learning activities and exploration (typically 60-70% of lesson time)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="input">Activities (English)</Label>
            <RichTextEditor
              value={formData.action}
              onChange={(value) => {
                updateFormData({ action: value });
              }}
            />
          </div>
          <div>
            <Label htmlFor="input">Activities (French)</Label>
            <RichTextEditor
              value={formData.actionFr}
              onChange={(value) => {
                updateFormData({ actionFr: value });
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consolidation</CardTitle>
          <CardDescription>
            Summarize, reflect, and assess understanding (typically 20% of lesson time)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="input">Activities (English)</Label>
            <RichTextEditor
              value={formData.consolidation}
              onChange={(value) => {
                updateFormData({ consolidation: value });
              }}
            />
          </div>
          <div>
            <Label htmlFor="input">Activities (French)</Label>
            <RichTextEditor
              value={formData.consolidationFr}
              onChange={(value) => {
                updateFormData({ consolidationFr: value });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}