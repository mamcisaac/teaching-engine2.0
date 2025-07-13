import { format } from 'date-fns';
import { Star, Calendar, Clock, Users, FileText, Copy } from 'lucide-react';
import React from 'react';

import type { PlanTemplate } from '../../types/template';
import { Button } from '../ui/Button';

interface TemplateCardProps {
  template: PlanTemplate;
  onPreview: (template: PlanTemplate) => void;
  onApply: (template: PlanTemplate) => void;
  onDuplicate?: (template: PlanTemplate) => void;
}

export default function TemplateCard({
  template,
  onPreview,
  onApply,
  onDuplicate,
}: TemplateCardProps): React.ReactElement {
  const getTypeIcon = (): React.ReactElement => template.type === 'UNIT_PLAN' ? (
      <FileText className="h-5 w-5 text-blue-600" />
    ) : (
      <Calendar className="h-5 w-5 text-green-600" />
    );

  const getDuration = (): string => {
    if (template.type === 'UNIT_PLAN' && template.estimatedWeeks !== null && template.estimatedWeeks !== undefined && template.estimatedWeeks > 0) {
      return `${template.estimatedWeeks} week${template.estimatedWeeks > 1 ? 's' : ''}`;
    } else if (template.type === 'LESSON_PLAN' && template.estimatedMinutes !== null && template.estimatedMinutes !== undefined && template.estimatedMinutes > 0) {
      return `${template.estimatedMinutes} minutes`;
    }
    return 'Duration not specified';
  };

  const getGradeRange = (): string => {
    if (template.gradeMin !== null && template.gradeMin !== undefined && template.gradeMax !== undefined) {
      return template.gradeMin === template.gradeMax
        ? `Grade ${template.gradeMin}`
        : `Grades ${template.gradeMin}-${template.gradeMax}`;
    }
    return 'All grades';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {getTypeIcon()}
          <div>
            <h3 className="font-semibold text-lg">{template.title}</h3>
            {template.subject !== null && template.subject !== undefined && template.subject !== '' && (
              <p className="text-sm text-gray-600 capitalize">{template.subject}</p>
            )}
          </div>
        </div>
        {template.isSystem && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            System
          </span>
        )}
      </div>

      {/* Description */}
      {template.description !== null && template.description !== undefined && template.description !== '' && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {template.description}
        </p>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-4 w-4" />
          <span>{getGradeRange()}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{getDuration()}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm">
          {template.averageRating !== null && template.averageRating !== undefined && template.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{template.averageRating.toFixed(1)}</span>
              {template._count?.ratings !== null && template._count?.ratings !== undefined && template._count.ratings > 0 && (
                <span className="text-gray-500">({template._count.ratings})</span>
              )}
            </div>
          )}
          <div className="text-gray-500">
            Used {template.usageCount} time{template.usageCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag, _index) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 text-gray-500 text-xs">
              +{template.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          size="sm"
          variant="outline"
          onClick={() => {
 onPreview(template); 
}}
        >
          Preview
        </Button>
        <Button
          className="flex-1"
          size="sm"
          onClick={() => {
 onApply(template); 
}}
        >
          Use Template
        </Button>
        {onDuplicate !== undefined && (
          <Button
            size="sm"
            title="Duplicate template"
            variant="ghost"
            onClick={() => {
 onDuplicate(template); 
}}
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Created info */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        {template.createdByUser !== null && template.createdByUser !== undefined ? (
          <span>Created by {template.createdByUser.name}</span>
        ) : (
          <span>System template</span>
        )}
        {template.lastUsedAt !== null && template.lastUsedAt !== undefined && template.lastUsedAt !== '' && (
          <span className="ml-2">
            • Last used {format(new Date(template.lastUsedAt), 'MMM d, yyyy')}
          </span>
        )}
      </div>
    </div>
  );
}
