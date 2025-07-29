import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { SafeHtmlRenderer } from '../../../utils/sanitization';

interface ThreePartLessonDisplayProps {
  mindsOn?: string;
  action?: string;
  consolidation?: string;
}

export function ThreePartLessonDisplay({ 
  mindsOn, 
  action, 
  consolidation 
}: ThreePartLessonDisplayProps): React.ReactElement {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Minds On</CardTitle>
          <CardDescription>Activating prior knowledge</CardDescription>
        </CardHeader>
        <CardContent>
          {mindsOn && mindsOn !== '' ? (
            <SafeHtmlRenderer
              className="prose max-w-none text-sm"
              html={mindsOn}
            />
          ) : (
            <p className="text-sm text-gray-500">No content provided</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Action</CardTitle>
          <CardDescription>Main learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          {action && action !== '' ? (
            <SafeHtmlRenderer
              className="prose max-w-none text-sm"
              html={action}
            />
          ) : (
            <p className="text-sm text-gray-500">No content provided</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consolidation</CardTitle>
          <CardDescription>Summarizing and reflection</CardDescription>
        </CardHeader>
        <CardContent>
          {consolidation && consolidation !== '' ? (
            <SafeHtmlRenderer
              className="prose max-w-none text-sm"
              html={consolidation}
            />
          ) : (
            <p className="text-sm text-gray-500">No content provided</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}