/**
 * Daily summary panel showing aggregated lesson reflections
 * Shows counts and percentages of successful/mixed/reteach lessons
 */

import React from 'react';
import { cn } from '../../utils/cn';
import { useLessonReflection } from '../../hooks/useLessonReflection';
import { TrendingUp, TrendingDown, Activity, MessageSquare } from 'lucide-react';

interface DailyReflectionSummaryProps {
  date: string;
  className?: string;
  compact?: boolean;
}

export const DailyReflectionSummary: React.FC<DailyReflectionSummaryProps> = ({
  date,
  className,
  compact = false
}) => {
  const { dailySummary, dailyReflections, isLoading } = useLessonReflection({ date });

  if (isLoading) {
    return (
      <div className={cn('bg-white border rounded-lg animate-pulse', compact ? 'p-3' : 'p-4', className)}>
        <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-28"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (!dailySummary || dailySummary.total === 0) {
    return (
      <div className={cn(
        'bg-gray-50 border border-gray-200 rounded-lg',
        compact ? 'p-3' : 'p-4',
        className
      )}>
        <p className="text-sm text-gray-500 text-center">
          No reflections recorded for this day
        </p>
      </div>
    );
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 70) return <TrendingUp className="w-4 h-4" />;
    if (percentage >= 40) return <Activity className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className={cn(
      'bg-white border rounded-lg shadow-sm',
      compact ? 'p-3' : 'p-4',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={cn(
          'font-semibold text-gray-900',
          compact ? 'text-sm' : 'text-base'
        )}>
          Daily Reflection Summary
        </h3>
        <div className="flex items-center gap-1 text-gray-500">
          {getStatusIcon(dailySummary.percentSuccess)}
          <span className={cn(
            'font-medium',
            getStatusColor(dailySummary.percentSuccess)
          )}>
            {dailySummary.percentSuccess}% Success
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={cn(
        'grid gap-3',
        compact ? 'grid-cols-2' : 'grid-cols-3'
      )}>
        {/* Success Count */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-2xl">👍</span>
            <span className={cn(
              'font-semibold text-gray-900',
              compact ? 'text-lg' : 'text-xl'
            )}>
              {dailySummary.successful}
            </span>
          </div>
          <span className="text-xs text-gray-500">Went well</span>
        </div>

        {/* Mixed Count */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-2xl">👌</span>
            <span className={cn(
              'font-semibold text-gray-900',
              compact ? 'text-lg' : 'text-xl'
            )}>
              {dailySummary.mixed}
            </span>
          </div>
          <span className="text-xs text-gray-500">Mixed results</span>
        </div>

        {/* Reteach Count */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-2xl">👎</span>
            <span className={cn(
              'font-semibold text-gray-900',
              compact ? 'text-lg' : 'text-xl'
            )}>
              {dailySummary.needsReteaching}
            </span>
          </div>
          <span className="text-xs text-gray-500">Need reteaching</span>
        </div>
      </div>

      {/* Notes indicator */}
      {dailySummary.withNotes > 0 && !compact && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageSquare className="w-4 h-4" />
            <span>
              {dailySummary.withNotes} lesson{dailySummary.withNotes > 1 ? 's' : ''} with notes
            </span>
          </div>
        </div>
      )}

      {/* Percentage bar */}
      {!compact && (
        <div className="mt-3">
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
            {dailySummary.percentSuccess > 0 && (
              <div 
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${dailySummary.percentSuccess}%` }}
              />
            )}
            {dailySummary.percentMixed > 0 && (
              <div 
                className="bg-yellow-500 transition-all duration-500"
                style={{ width: `${dailySummary.percentMixed}%` }}
              />
            )}
            {dailySummary.percentReteach > 0 && (
              <div 
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${dailySummary.percentReteach}%` }}
              />
            )}
          </div>
        </div>
      )}

      {/* Lesson list preview */}
      {dailyReflections && dailyReflections.length > 0 && !compact && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Recent reflections:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {dailyReflections.slice(0, 5).map((reflection) => (
              <div 
                key={reflection.id} 
                className="flex items-center gap-2 text-xs p-1 rounded hover:bg-gray-50"
              >
                <span>{reflection.statusEmoji || reflection.status}</span>
                <span className="text-gray-700 truncate flex-1">
                  Lesson {reflection.lessonId.slice(-6)}
                </span>
                {reflection.note && (
                  <MessageSquare className="w-3 h-3 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReflectionSummary;