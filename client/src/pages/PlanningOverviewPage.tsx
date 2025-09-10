/**
 * PlanningOverviewPage
 * Page component for the emergency planning dashboard
 */

import React from 'react';

import { PlanningCascadeView } from '../components/planning/PlanningCascadeView';
import { PlanningErrorBoundary } from '../components/planning/PlanningErrorBoundary';

export const PlanningOverviewPage: React.FC = () => {
  return (
    <PlanningErrorBoundary>
      <div className="planning-overview-page min-h-screen bg-gray-50" data-testid="planning-cascade">
        <div className="max-w-7xl mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Planning Dashboard</h1>
          <PlanningCascadeView />
        </div>
      </div>
    </PlanningErrorBoundary>
  );
};