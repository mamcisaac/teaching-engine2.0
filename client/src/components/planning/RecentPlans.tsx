import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Calendar, 
  BookOpen, 
  GraduationCap, 
  Clock,
  ChevronRight,
  FileText,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export interface RecentPlan {
  id: string;
  type: 'long-range' | 'unit' | 'lesson' | 'daybook';
  title: string;
  subject?: string;
  grade?: number;
  lastAccessed: Date;
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
    label: 'Long-Range Plan'
  },
  'unit': {
    icon: BookOpen,
    color: 'text-blue-600 bg-blue-100',
    route: '/planner/units',
    label: 'Unit Plan'
  },
  'lesson': {
    icon: GraduationCap,
    color: 'text-green-600 bg-green-100',
    route: '/planner/etfo-lessons',
    label: 'Lesson Plan'
  },
  'daybook': {
    icon: FileText,
    color: 'text-orange-600 bg-orange-100',
    route: '/planner/daybook',
    label: 'Daybook Entry'
  }
};

export function RecentPlans({ plans, isLoading, className }: RecentPlansProps) {
  if (isLoading) {
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
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

  const getStatusBadge = (plan: RecentPlan) => {
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
            to="/planner" 
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {plans.map((plan) => {
            const config = PLAN_TYPE_CONFIG[plan.type];
            const Icon = config.icon;
            const planRoute = `${config.route}/${plan.id}`;

            return (
              <Link
                key={`${plan.type}-${plan.id}`}
                to={planRoute}
                className="block group"
              >
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={cn('p-2 rounded-lg flex-shrink-0', config.color)}>
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
                          {plan.subject && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{plan.subject}</span>
                            </>
                          )}
                          {plan.grade && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">Grade {plan.grade}</span>
                            </>
                          )}
                        </div>
                        {plan.parentTitle && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            in {plan.parentTitle}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 mt-0.5" />
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(plan.lastAccessed, { addSuffix: true })}
                      </span>
                      {getStatusBadge(plan)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {plans.length >= 5 && (
          <div className="mt-4 pt-4 border-t">
            <Link
              to="/planner/history"
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1"
            >
              <TrendingUp className="h-4 w-4" />
              View planning history
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}