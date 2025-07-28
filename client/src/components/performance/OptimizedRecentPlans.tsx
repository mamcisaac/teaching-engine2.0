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
import React, { memo, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

import { LoadingSkeleton } from './LoadingSkeleton';
import { VirtualizedList } from './VirtualizedList';

export interface RecentPlan {
  id: string;
  type: 'long-range' | 'unit' | 'lesson' | 'daybook';
  title: string;
  subject?: string;
  grade?: number;
  lastAccessed: string;
  progress?: number;
  status?: 'draft' | 'in-progress' | 'completed';
  parentTitle?: string;
}

interface OptimizedRecentPlansProps {
  plans: RecentPlan[];
  isLoading?: boolean;
  className?: string;
  virtualizeThreshold?: number;
  showViewAll?: boolean;
  compact?: boolean;
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

// Memoized plan item component
const PlanItem = memo(
  ({
    plan,
    compact = false,
  }: {
    plan: RecentPlan & { formattedDate: string; planRoute: string };
    compact?: boolean;
  }) => {
    const config = PLAN_TYPE_CONFIG[plan.type];
    const Icon = config.icon;

    const getStatusBadge = useCallback(() => {
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
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${plan.progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{plan.progress}%</span>
          </div>
        );
      }
      return null;
    }, [plan.status, plan.progress]);

    return (
      <Link className="block group" to={plan.planRoute}>
        <div
          className={cn(
            'flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors',
            compact && 'p-2',
          )}
        >
          <div className={cn('p-2 rounded-lg flex-shrink-0', config.color, compact && 'p-1.5')}>
            <Icon className={cn('h-5 w-5', compact && 'h-4 w-4')} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    'font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate',
                    compact && 'text-sm',
                  )}
                >
                  {plan.title}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('text-xs text-gray-500', compact && 'text-xs')}>
                    {config.label}
                  </span>
                  {(plan.subject && plan.subject !== '') && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{plan.subject}</span>
                    </>
                  )}
                  {(plan.grade && !isNaN(plan.grade) && plan.grade > 0) && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">Grade {plan.grade}</span>
                    </>
                  )}
                </div>
                {(plan.parentTitle && plan.parentTitle !== '') && (
                  <p className="text-xs text-gray-500 mt-0.5">in {plan.parentTitle}</p>
                )}
              </div>
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 mt-0.5',
                  compact && 'h-3 w-3',
                )}
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className={cn('text-xs text-gray-500', compact && 'text-xs')}>
                {plan.formattedDate}
              </span>
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </Link>
    );
  },
  (prevProps, nextProps) => 
    // Optimize re-renders by comparing relevant props
     (
      prevProps.plan.id === nextProps.plan.id &&
      prevProps.plan.title === nextProps.plan.title &&
      prevProps.plan.lastAccessed === nextProps.plan.lastAccessed &&
      prevProps.plan.progress === nextProps.plan.progress &&
      prevProps.plan.status === nextProps.plan.status &&
      prevProps.compact === nextProps.compact
    )
  ,
);

PlanItem.displayName = 'PlanItem';

export const OptimizedRecentPlans = memo(
  ({
    plans,
    isLoading,
    className,
    virtualizeThreshold = 50,
    showViewAll = true,
    compact = false,
  }: OptimizedRecentPlansProps): JSX.Element => {
    // Memoize expensive calculations for plan processing
    const processedPlans = useMemo(() => plans.map((plan, _index) => ({
        ...plan,
        formattedDate: formatDistanceToNow(new Date(plan.lastAccessed), { addSuffix: true }),
        planRoute: `${PLAN_TYPE_CONFIG[plan.type].route}/${plan.id}`,
      })), [plans]);

    // Memoize the render function for virtualized list
    const renderPlanItem = useCallback(
      ({
        item,
        index: _index,
        style,
      }: {
        item: (typeof processedPlans)[0];
        index: number;
        style: React.CSSProperties;
      }) => (
        <div style={style}>
          <PlanItem key={`${item.type}-${item.id}`} compact={compact} plan={item} />
        </div>
      ),
      [compact],
    );

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
              {[1, 2, 3, 4, 5].map((i, _index) => (
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
            {showViewAll && (
              <Link
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                to="/planner"
              >
                View all
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Use virtualization for large lists */}
          {processedPlans.length > virtualizeThreshold ? (
            <VirtualizedList
              className="space-y-1"
              height={400}
              itemHeight={compact ? 60 : 80}
              items={processedPlans}
              renderItem={renderPlanItem}
            />
          ) : (
            <div className="space-y-1">
              {processedPlans.map((plan, _index) => (
                <PlanItem key={`${plan.type}-${plan.id}`} compact={compact} plan={plan} />
              ))}
            </div>
          )}

          {/* View planning history link for large lists */}
          {processedPlans.length >= 10 && (
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
  },
  (prevProps, nextProps) => 
    // Optimize re-renders by comparing plans array length and loading state
     (
      prevProps.plans.length === nextProps.plans.length &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.compact === nextProps.compact &&
      prevProps.plans.every(
        (plan, index) =>
          plan.id === nextProps.plans[index]?.id &&
          plan.lastAccessed === nextProps.plans[index]?.lastAccessed,
      )
    )
  ,
);

OptimizedRecentPlans.displayName = 'OptimizedRecentPlans';
