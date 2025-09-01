import React from 'react';
import { BookOpen, Layers, FileText, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CascadeMetrics } from '../../hooks/usePlanningCascade';

interface CascadeProgressIndicatorProps {
  metrics: CascadeMetrics;
}

export function CascadeProgressIndicator({ metrics }: CascadeProgressIndicatorProps): JSX.Element {
  const items = [
    {
      label: 'LRPs',
      value: metrics.totalLongRangePlans,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Units',
      value: metrics.totalUnits,
      icon: Layers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Lessons',
      value: metrics.totalLessons,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Completed',
      value: `${metrics.completedLessons}/${metrics.totalLessons}`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="flex items-center gap-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded', item.bgColor)}>
              <Icon className={cn('h-4 w-4', item.color)} />
            </div>
            <div>
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className="font-semibold text-sm">{item.value}</div>
            </div>
          </div>
        );
      })}
      
      {/* Overall completion percentage */}
      <div className="ml-4 pl-4 border-l">
        <div className="text-xs text-gray-500">Overall Progress</div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${metrics.completionPercentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold">{metrics.completionPercentage}%</span>
        </div>
      </div>
    </div>
  );
}