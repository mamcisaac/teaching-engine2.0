import React from 'react';
import { MainLayout } from '../MainLayout';
import { usePlanningCascade } from '../../hooks/usePlanningCascade';
import { LoadingSkeleton } from '../performance/LoadingSkeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { CascadeTreeView } from './CascadeTreeView';
import { CascadeDetailPanel } from './CascadeDetailPanel';
import { CascadeBreadcrumb } from './CascadeBreadcrumb';
import { CascadeProgressIndicator } from './CascadeProgressIndicator';
import { FilterBar } from './FilterBar';
import type { CascadeSelection } from './types';

function PlanningCascadeView(): JSX.Element {
  const [selection, setSelection] = React.useState<CascadeSelection | null>(null);
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());
  const [filters, setFilters] = React.useState({
    academicYear: undefined as string | undefined,
    subject: undefined as string | undefined,
    grade: undefined as number | undefined,
  });

  const { data, isLoading, error } = usePlanningCascade({
    ...filters,
    includeProgress: true,
    includeDaybook: true,
    depth: 'full',
  });

  const handleNodeExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleNodeSelect = (selection: CascadeSelection) => {
    setSelection(selection);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <LoadingSkeleton lines={10} />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load planning cascade: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <div className="p-6">
          <Alert>
            <AlertDescription>
              No planning data available. Start by creating a Long Range Plan.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        {/* Header with filters and progress */}
        <div className="border-b bg-white p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Planning Cascade View</h1>
            {data.metrics && <CascadeProgressIndicator metrics={data.metrics} />}
          </div>
          <FilterBar 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          {selection && (
            <div className="mt-3">
              <CascadeBreadcrumb selection={selection} />
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Tree view */}
          <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
            <CascadeTreeView
              data={data}
              expandedNodes={expandedNodes}
              selectedNode={selection}
              onNodeExpand={handleNodeExpand}
              onNodeSelect={handleNodeSelect}
            />
          </div>

          {/* Right panel - Detail view */}
          <div className="flex-1 overflow-y-auto bg-white">
            {selection ? (
              <CascadeDetailPanel selection={selection} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select an item from the tree to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default PlanningCascadeView;
export { PlanningCascadeView };