import React from 'react';
import { Button } from './ui/Button';

interface MilestoneAlert {
  id: number;
  type: 'deadline' | 'progress' | 'coverage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  milestoneId: number;
  milestoneName: string;
  subjectName: string;
  daysUntilDeadline?: number;
  coveragePercentage?: number;
  createdAt: string;
  isRead: boolean;
}

interface MilestoneAlertCardProps {
  alert: MilestoneAlert;
  onMarkAsRead: (alertId: number) => void;
  onViewMilestone: (milestoneId: number) => void;
  onDismiss: (alertId: number) => void;
}

export default function MilestoneAlertCard({
  alert,
  onMarkAsRead,
  onViewMilestone,
  onDismiss,
}: MilestoneAlertCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
      default:
        return 'ℹ️';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return '📅';
      case 'progress':
        return '📊';
      case 'coverage':
        return '📋';
      default:
        return '📌';
    }
  };

  const formatTimeAgo = (dateString: string) => {
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
      className={`border-l-4 rounded-lg p-4 shadow-sm transition-opacity ${getSeverityColor(
        alert.severity,
      )} ${alert.isRead ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
            <span className="text-sm">{getTypeIcon(alert.type)}</span>
            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
            {!alert.isRead && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-3">{alert.description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              📚 <strong>{alert.subjectName}</strong>
            </span>
            <span className="flex items-center gap-1">🎯 {alert.milestoneName}</span>
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
            <span className="text-gray-500">{formatTimeAgo(alert.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Dismiss alert"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          onClick={() => onViewMilestone(alert.milestoneId)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          View Milestone
        </Button>
        {!alert.isRead && (
          <Button size="sm" variant="secondary" onClick={() => onMarkAsRead(alert.id)}>
            Mark as Read
          </Button>
        )}
      </div>
    </div>
  );
}
