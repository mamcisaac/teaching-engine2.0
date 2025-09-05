/**
 * PlanningOverviewPage
 * Page component for the planning cascade overview
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlanningCascadeView } from '../components/planning/PlanningCascadeView';
import { PlanningErrorBoundary } from '../components/planning/PlanningErrorBoundary';

export const PlanningOverviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Get year and grade from URL params or use defaults
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const grade = parseInt(searchParams.get('grade') || '1');
  const view = searchParams.get('view') as 'tree' | 'glance' | 'calendar' | 'list' | undefined;

  return (
    <PlanningErrorBoundary>
      <div className="planning-overview-page min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <PlanningCascadeView 
            year={year}
            grade={grade}
            defaultView={view || 'glance'}
          />
        </div>
      </div>
    </PlanningErrorBoundary>
  );
};

export default PlanningOverviewPage;