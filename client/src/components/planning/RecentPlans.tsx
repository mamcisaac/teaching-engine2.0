/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { formatDistanceToNow } from 'date-fns';
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  ChevronRight,
  FileText,
  TrendingUp,
} from 'lucide-react';
import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { LoadingSkeleton } from '../performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface RecentPlan {
  id: string;
  type: 'long-range' | 'unit' | 'lesson' | 'daybook';
  title: string;
  subject?: string;
  grade?: number;
  lastAccessed: string; // ISO string from server
  progress?: number;
  status?: 'draft' | 'in-progress' | 'completed';
  parentTitle?: string; // For showing hierarchy (e.g., unit name for lesson)
}

interface RecentPlansProps {
  plans: RecentPlan[];
  isLoading?: boolean;
  className?: string;
}

const PLAN_TYPE_CONFIG = {
  'long-range': {
    icon: Calendar,
    color: 'text-purple-600 bg-purple-100',
    route: '/planner/long-range',
    label: 'Long-Range Plan',
  },
  unit: {
    icon: BookOpen,
    color: 'text-blue-600 bg-blue-100',
    route: '/planner/units',
    label: 'Unit Plan',
  },
  lesson: {
    icon: GraduationCap,
    color: 'text-green-600 bg-green-100',
    route: '/planner/etfo-lessons',
    label: 'Lesson Plan',
  },
  daybook: {
    icon: FileText,
    color: 'text-orange-600 bg-orange-100',
    route: '/planner/daybook',
    label: 'Daybook Entry',
  },
};

export const RecentPlans = memo(({
  plans,
  isLoading,
  className,
}: RecentPlansProps): JSX.Element => {
  // Memoize expensive calculations for plan processing
  const processedPlans = useMemo(() => plans.map((plan, _index) => ({
      ...plan,
      formattedDate: formatDistanceToNow(new Date(plan.lastAccessed), { addSuffix: true }),
      planRoute: `${PLAN_TYPE_CONFIG[plan.type].route}/${plan.id}`,
    })), [plans]);

  if (isLoading === true) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Plans
          </CardTitle>
          <CardDescription>Your recently accessed planning documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i, _index) => (
              <LoadingSkeleton 
                key={i} 
                layout={[
                  { type: 'avatar', size: 'md' },
                  { type: 'text', lines: 2 },
                ]}
                variant="complex"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (plans.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Plans
          </CardTitle>
          <CardDescription>Your recently accessed planning documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No recent plans yet</p>
            <p className="text-xs mt-1">Your recently accessed plans will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (plan: RecentPlan): React.ReactElement | null => {
    if (plan.status === 'completed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completed
        </span>
      );
    } else if (plan.status === 'draft') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Draft
        </span>
      );
    } else if (plan.progress !== undefined) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-16">
            <div
              className="bg-indigo-600 h-1.5 rounded-full"
              style={{ width: `${plan.progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">{plan.progress}%</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Plans
            </CardTitle>
            <CardDescription>Your recently accessed planning documents</CardDescription>
          </div>
          <Link
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            to="/planner"
          >
            View all
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {processedPlans.map((plan, _index) => {
            const config = PLAN_TYPE_CONFIG[plan.type];
            const Icon = config.icon;

            return (
              <Link className="block group" key={`${plan.type}-${plan.id}`} to={plan.planRoute}>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={cn('p-2 rounded-lg flex-shrink-0', config.color) as string}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                          {plan.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{config.label}</span>
                          {(plan.subject !== undefined && plan.subject !== '') ? (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{plan.subject}</span>
                            </>
                          ) : null}
                          {(plan.grade !== undefined) ? (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">Grade {plan.grade}</span>
                            </>
                          ) : null}
                        </div>
                        {(plan.parentTitle !== undefined && plan.parentTitle !== '') ? (
                          <p className="text-xs text-gray-500 mt-0.5">in {plan.parentTitle}</p>
                        ) : null}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 mt-0.5" />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{plan.formattedDate}</span>
                      {getStatusBadge(plan)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {processedPlans.length >= 5 && (
          <div className="mt-4 pt-4 border-t">
            <Link
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1"
              to="/planner/history"
            >
              <TrendingUp className="h-4 w-4" />
              View planning history
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

RecentPlans.displayName = 'RecentPlans';
