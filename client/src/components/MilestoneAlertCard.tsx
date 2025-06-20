import React from 'react';
import { AlertTriangle, Clock, BookOpen, Users, X, Plus } from 'lucide-react';
import { Button } from './ui/Button';

// Combined interface supporting both alert types
export interface MilestoneAlert {
  id?: number;
  type:
    | 'outcome_missed'
    | 'outcome_undercovered'
    | 'outcome_unassessed'
    | 'underassessed_domain'
    | 'theme_unaddressed'
    | 'deadline'
    | 'progress'
    | 'coverage';
  severity: 'warning' | 'notice' | 'low' | 'medium' | 'high' | 'critical';
  title?: string;
  message?: string;
  description?: string;
  milestoneId?: number;
  milestoneName?: string;
  subjectName?: string;
  daysUntilDeadline?: number;
  coveragePercentage?: number;
  createdAt?: string;
  isRead?: boolean;
  // Legacy fields for backward compatibility
  outcomeId?: string;
  outcomeCode?: string;
  domain?: string;
  thematicUnitId?: number;
  thematicUnitTitle?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface MilestoneAlertCardProps {
  alert: MilestoneAlert;
  onDismiss?: (alertId?: number) => void;
  onSnooze?: () => void;
  onPlanActivity?: () => void;
  onViewDetails?: () => void;
  onMarkAsRead?: (alertId: number) => void;
  onViewMilestone?: (milestoneId: number) => void;
}

export const MilestoneAlertCard: React.FC<MilestoneAlertCardProps> = ({
  alert,
  onDismiss,
  onSnooze,
  onPlanActivity,
  onViewDetails,
  onMarkAsRead,
  onViewMilestone,
}) => {
  // Unified severity handling
  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'notice':
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'low':
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
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'progress':
        return <BookOpen className="h-4 w-4" />;
      case 'coverage':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = () => {
    const severity = alert.severity || alert.priority;
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
      case 'warning':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
      case 'notice':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getDisplayTitle = () => {
    if (alert.title) return alert.title;
    if (alert.outcomeCode) return alert.outcomeCode;
    if (alert.domain) return alert.domain;
    if (alert.thematicUnitTitle) return alert.thematicUnitTitle;
    return 'Alert';
  };

  const getDisplayMessage = () => {
    return alert.message || alert.description || 'No description available';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div
      className={`border-l-4 rounded-lg p-4 shadow-sm transition-opacity ${getPriorityColor()} ${alert.isRead ? 'opacity-75' : ''} relative`}
    >
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(alert.id)}
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
            <span className="text-sm font-medium text-gray-700">{getDisplayTitle()}</span>
            {alert.dueDate && (
              <span className="text-xs text-gray-500">Target: {formatDate(alert.dueDate)}</span>
            )}
            {alert.severity === 'warning' && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                ❌ Overdue
              </span>
            )}
            {alert.isRead === false && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-gray-800">{getDisplayMessage()}</p>

          {/* Metadata for new format */}
          {(alert.subjectName ||
            alert.milestoneName ||
            alert.daysUntilDeadline !== undefined ||
            alert.coveragePercentage !== undefined) && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
              {alert.subjectName && (
                <span className="flex items-center gap-1">
                  📚 <strong>{alert.subjectName}</strong>
                </span>
              )}
              {alert.milestoneName && (
                <span className="flex items-center gap-1">🎯 {alert.milestoneName}</span>
              )}
              {alert.daysUntilDeadline !== undefined && (
                <span className="flex items-center gap-1">
                  ⏰ {alert.daysUntilDeadline} days remaining
                </span>
              )}
              {alert.coveragePercentage !== undefined && (
                <span className="flex items-center gap-1">
                  📊 {alert.coveragePercentage.toFixed(1)}% coverage
                </span>
              )}
              {alert.createdAt && (
                <span className="text-gray-500">{formatTimeAgo(alert.createdAt)}</span>
              )}
            </div>
          )}
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
          {onViewMilestone && alert.milestoneId && (
            <Button
              size="sm"
              onClick={() => onViewMilestone(alert.milestoneId!)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              View Milestone
            </Button>
          )}
          {onMarkAsRead && alert.id && !alert.isRead && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onMarkAsRead(alert.id!)}
              className="text-xs"
            >
              Mark as Read
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
