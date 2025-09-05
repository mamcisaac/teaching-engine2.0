/**
 * Coverage Widget Component
 * Displays curriculum coverage metrics on the dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { apiClient } from '../api/core/client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/Progress';

interface CoverageMetric {
  subject: string;
  total: number;
  covered: number;
  percentage: number;
}

interface CoverageResponse {
  metrics: CoverageMetric[];
}

export function CoverageWidget(): React.ReactElement {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['curriculum-coverage', 'metrics'],
    queryFn: async () => {
      const response = await apiClient.get<CoverageResponse>('/curriculum-coverage/metrics');
      return response.data;
    },
  });

  const getCoverageClass = (percentage: number): string => {
    if (percentage >= 80) return 'coverage-high';
    if (percentage >= 30) return 'coverage-medium';
    return 'coverage-low';
  };

  const getCoverageColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleSubjectClick = (subject: string): void => {
    navigate(`/coverage/${encodeURIComponent(subject)}`);
  };

  if (isLoading) {
    return (
      <Card data-testid="coverage-widget">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Curriculum Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="coverage-widget">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Curriculum Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Unable to load coverage data</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = data?.metrics || [];
  const overallCovered = metrics.reduce((sum, m) => sum + m.covered, 0);
  const overallTotal = metrics.reduce((sum, m) => sum + m.total, 0);
  const overallPercentage = overallTotal > 0 
    ? Math.round((overallCovered / overallTotal) * 100)
    : 0;

  return (
    <Card data-testid="coverage-widget" className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Curriculum Coverage
          </div>
          <div className="text-sm font-normal">
            {overallCovered}/{overallTotal} ({overallPercentage}%)
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div
            key={metric.subject}
            data-testid={`coverage-bar-${metric.subject}`}
            className={`${getCoverageClass(metric.percentage)} cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors`}
            onClick={() => handleSubjectClick(metric.subject)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSubjectClick(metric.subject);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${metric.subject} coverage`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">{metric.subject}</span>
              <div className="flex items-center gap-2">
                <span 
                  data-testid="coverage-stats" 
                  className="text-xs text-gray-600"
                >
                  {metric.covered}/{metric.total}
                </span>
                <span 
                  data-testid="coverage-percentage"
                  className="font-bold text-sm"
                >
                  {metric.percentage}%
                </span>
              </div>
            </div>
            <Progress 
              value={metric.percentage} 
              className={`h-2 ${getCoverageColor(metric.percentage)}`}
            />
          </div>
        ))}
        
        {overallPercentage < 100 && (
          <button
            onClick={() => navigate('/coverage')}
            className="w-full mt-4 p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            View Uncovered Expectations
          </button>
        )}
      </CardContent>
    </Card>
  );
}