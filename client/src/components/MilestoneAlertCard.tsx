import React from 'react';
import { AlertTriangle, Clock, BookOpen, Users, X, Plus } from 'lucide-react';
import { Button } from './ui/Button';

export interface MilestoneAlert {
  type:
    | 'outcome_missed'
    | 'outcome_undercovered'
    | 'outcome_unassessed'
    | 'underassessed_domain'
    | 'theme_unaddressed';
  outcomeId?: string;
  outcomeCode?: string;
  domain?: string;
  thematicUnitId?: number;
  thematicUnitTitle?: string;
  message: string;
  severity: 'warning' | 'notice';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

interface MilestoneAlertCardProps {
  alert: MilestoneAlert;
  onDismiss?: () => void;
  onSnooze?: () => void;
  onPlanActivity?: () => void;
  onViewDetails?: () => void;
}

export const MilestoneAlertCard: React.FC<MilestoneAlertCardProps> = ({
  alert,
  onDismiss,
  onSnooze,
  onPlanActivity,
  onViewDetails,
}) => {
  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'notice':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeIcon = () => {
    switch (alert.type) {
      case 'outcome_missed':
      case 'outcome_undercovered':
      case 'outcome_unassessed':
        return <BookOpen className="h-4 w-4" />;
      case 'underassessed_domain':
        return <Users className="h-4 w-4" />;
      case 'theme_unaddressed':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (alert.priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTag = () => {
    if (alert.outcomeCode) return alert.outcomeCode;
    if (alert.domain) return alert.domain;
    if (alert.thematicUnitTitle) return alert.thematicUnitTitle;
    return 'Alert';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getPriorityColor()} relative`}>
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {getSeverityIcon()}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {getTypeIcon()}
            <span className="text-sm font-medium text-gray-700">{getTag()}</span>
            <span className="text-xs text-gray-500">Target: {formatDate(alert.dueDate)}</span>
            {alert.severity === 'warning' && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                ❌ Overdue
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800">{alert.message}</p>
          {alert.description && <p className="text-xs text-gray-600 mt-1">{alert.description}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {onPlanActivity && (
            <Button size="sm" variant="outline" onClick={onPlanActivity} className="text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Plan activity
            </Button>
          )}
          {onViewDetails && (
            <Button size="sm" variant="ghost" onClick={onViewDetails} className="text-xs">
              📖 View details
            </Button>
          )}
        </div>

        {onSnooze && (
          <Button size="sm" variant="ghost" onClick={onSnooze} className="text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            Snooze
          </Button>
        )}
      </div>
    </div>
  );
};

export default MilestoneAlertCard;
