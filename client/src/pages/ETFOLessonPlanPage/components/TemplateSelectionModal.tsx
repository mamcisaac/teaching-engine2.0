import { BookTemplate } from 'lucide-react';
import React, { useState } from 'react';

import { Dialog } from '../../../components/Dialog';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import type { UnitPlan } from '../../../hooks/useETFOPlanning';
import type { PlanTemplate } from '../../../types/template';

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: PlanTemplate[];
  onApplyTemplate: (template: PlanTemplate) => Promise<void>;
  isApplyingTemplate: boolean;
  unitPlan?: UnitPlan;
}

export function TemplateSelectionModal({
  isOpen,
  onClose,
  templates,
  onApplyTemplate,
  isApplyingTemplate,
  unitPlan,
}: TemplateSelectionModalProps): React.ReactElement {
  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplate | null>(null);

  const handleClose = () => {
    setSelectedTemplate(null);
    onClose();
  };

  const handleApplyTemplate = async () => {
    if (selectedTemplate) {
      await onApplyTemplate(selectedTemplate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <div className="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Choose a Lesson Plan Template</h3>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <BookTemplate className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
            <p className="text-gray-600">
              {unitPlan?.longRangePlan
                ? `No lesson plan templates found for Grade ${unitPlan.longRangePlan.grade} ${unitPlan.longRangePlan.subject}.`
                : 'No lesson plan templates available at this time.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Select a template to get started with your lesson plan. Templates provide
              pre-structured content that you can customize.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer border-2 transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
 setSelectedTemplate(template); 
}}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{template.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.category} • Grade {template.gradeMin}
                          {template.gradeMax !== null && template.gradeMax !== template.gradeMin && `-${template.gradeMax}`}
                          {template.estimatedMinutes !== null && template.estimatedMinutes !== undefined && template.estimatedMinutes > 0 && ` • ${template.estimatedMinutes} minutes`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span className="text-sm">
                          {template.averageRating?.toFixed(1) ?? '—'}
                        </span>
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {(template.tags.length ?? 0) > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          +{(template.tags.length ?? 0) - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Used {template.usageCount} times</span>
                      <span>
                        By{' '}
                        {(template as { createdBy?: { name?: string } | null }).createdBy?.name ??
                          'Anonymous'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={selectedTemplate === null || isApplyingTemplate}
            type="button"
            onClick={handleApplyTemplate}
          >
            {isApplyingTemplate ? 'Loading...' : 'Use This Template'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}