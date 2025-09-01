import React, { useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMediaQuery } from 'react-responsive';
import { MainLayout } from '../MainLayout';
import { LoadingSkeleton } from '../performance/LoadingSkeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/Button';
import { VirtualizedTree } from './VirtualizedTree/VirtualizedTree';
import { CascadeDetailPanel } from './CascadeDetailPanel';
import { CascadeBreadcrumb } from './CascadeBreadcrumb';
import { CascadeProgressIndicator } from './CascadeProgressIndicator';
import { FilterBar } from './FilterBar';
import { CascadeSearch } from './CascadeSearch/CascadeSearch';
import { MobileCascadeView } from './MobileLayout/MobileCascadeView';
import { ErrorBoundary } from '../ErrorBoundary';
import { useCascadeStore } from '../../stores/cascadeStore';
import { apiClient } from '../../api/core/client';
import type { CascadeSelection } from './types';
import type { TreeNodeData } from './VirtualizedTree/types';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

// Lazy load mobile components
const LazyMobileCascadeView = React.lazy(() => 
  import('./MobileLayout/MobileCascadeView').then(m => ({ default: m.MobileCascadeView }))
);

interface RootData {
  longRangePlans: Array<{
    id: string;
    label: string;
    type: string;
    hasChildren: boolean;
    childrenCount: number;
    data: any;
  }>;
  curriculumSummary: {
    total: number;
    bySubject: Record<string, number>;
  };
}

export function PerfectCascadeView(): JSX.Element {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  
  // Zustand store
  const {
    expandedNodes,
    selectedNode,
    filters,
    searchQuery,
    isSearching,
    loadingNodes,
    errorNodes,
    nodeDataCache,
    toggleNode,
    expandNode,
    collapseNode,
    selectNode,
    setFilters,
    clearFilters,
    setNodeLoading,
    setNodeError,
    setCachedData,
    getCachedData,
    loadState,
    saveState,
  } = useCascadeStore();
  
  // Load persisted state on mount
  useEffect(() => {
    loadState();
    
    // Save state on unmount
    return () => {
      saveState();
    };
  }, [loadState, saveState]);
  
  // Fetch root level data with progressive loading
  const { data: rootData, isLoading: isLoadingRoots, error: rootError, refetch: refetchRoots } = useQuery<RootData>({
    queryKey: ['cascade-roots', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade.toString());
      
      const response = await apiClient.get(`/api/planning-cascade-progressive/roots?${params}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Fetch children for expanded nodes
  const fetchNodeChildren = useCallback(async (nodeId: string, nodeType: string) => {
    // Check cache first
    const cached = getCachedData(nodeId);
    if (cached) {
      return cached;
    }
    
    setNodeLoading(nodeId, true);
    setNodeError(nodeId, null);
    
    try {
      const response = await apiClient.get(
        `/api/planning-cascade-progressive/node/${nodeId}/children`,
        {
          params: {
            nodeType,
            limit: 50,
            offset: 0,
            includeProgress: true,
          },
        }
      );
      
      const children = response.data.children;
      setCachedData(nodeId, children);
      setNodeLoading(nodeId, false);
      
      return children;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load children';
      setNodeError(nodeId, errorMessage);
      setNodeLoading(nodeId, false);
      throw error;
    }
  }, [getCachedData, setCachedData, setNodeLoading, setNodeError]);
  
  // Transform data to tree structure with lazy loading
  const treeData = useMemo((): TreeNodeData[] => {
    if (!rootData) return [];
    
    const transformNode = (node: any): TreeNodeData => {
      const cachedChildren = getCachedData(node.id);
      
      return {
        id: node.id,
        label: node.label,
        type: node.type,
        data: node.data,
        hasChildren: node.hasChildren || node.childrenCount > 0,
        children: cachedChildren ? cachedChildren.map(transformNode) : undefined,
        progress: node.progress,
      };
    };
    
    // Add curriculum root if there are expectations
    const nodes: TreeNodeData[] = [];
    
    if (rootData.curriculumSummary.total > 0) {
      nodes.push({
        id: 'curriculum-root',
        label: `Curriculum Expectations (${rootData.curriculumSummary.total})`,
        type: 'curriculum',
        data: rootData.curriculumSummary,
        hasChildren: true,
        progress: {
          completed: 0,
          total: rootData.curriculumSummary.total,
        },
      });
    }
    
    // Add LRP nodes
    nodes.push(...rootData.longRangePlans.map(transformNode));
    
    return nodes;
  }, [rootData, getCachedData]);
  
  // Handle node expansion with lazy loading
  const handleNodeExpand = useCallback(async (nodeId: string) => {
    expandNode(nodeId);
    
    // Find the node to determine its type
    const findNode = (nodes: TreeNodeData[], id: string): TreeNodeData | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const node = findNode(treeData, nodeId);
    if (node && node.hasChildren && !node.children) {
      // Load children if not already loaded
      try {
        await fetchNodeChildren(nodeId, node.type);
        // Force re-render with new children
        queryClient.invalidateQueries(['cascade-roots']);
      } catch (error) {
        console.error('Failed to load children:', error);
      }
    }
  }, [expandNode, treeData, fetchNodeChildren, queryClient]);
  
  const handleNodeCollapse = useCallback((nodeId: string) => {
    collapseNode(nodeId);
  }, [collapseNode]);
  
  const handleNodeSelect = useCallback((node: TreeNodeData) => {
    selectNode({
      type: node.type as any,
      id: node.id,
      data: node.data,
    });
  }, [selectNode]);
  
  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, [setFilters]);
  
  const handleSearchResultSelect = useCallback((node: TreeNodeData) => {
    // Expand path to node
    const path: string[] = [];
    const findPath = (nodes: TreeNodeData[], targetId: string, currentPath: string[] = []): boolean => {
      for (const n of nodes) {
        if (n.id === targetId) {
          path.push(...currentPath, n.id);
          return true;
        }
        if (n.children && findPath(n.children, targetId, [...currentPath, n.id])) {
          return true;
        }
      }
      return false;
    };
    
    findPath(treeData, node.id);
    
    // Expand all nodes in path
    path.forEach(id => expandNode(id));
    
    // Select the node
    handleNodeSelect(node);
  }, [treeData, expandNode, handleNodeSelect]);
  
  const handleRefresh = useCallback(() => {
    refetchRoots();
    useCascadeStore.getState().clearCache();
  }, [refetchRoots]);
  
  // Error recovery
  const handleRetry = useCallback((nodeId: string) => {
    setNodeError(nodeId, null);
    handleNodeExpand(nodeId);
  }, [setNodeError, handleNodeExpand]);
  
  // Loading state
  if (isLoadingRoots && !rootData) {
    return (
      <MainLayout>
        <div className="p-6">
          <LoadingSkeleton lines={10} />
        </div>
      </MainLayout>
    );
  }
  
  // Error state with retry
  if (rootError && !rootData) {
    return (
      <MainLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load planning cascade: {rootError.message}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRoots()}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }
  
  // Empty state
  if (!rootData || (rootData.longRangePlans.length === 0 && rootData.curriculumSummary.total === 0)) {
    return (
      <MainLayout>
        <div className="p-6">
          <Alert>
            <AlertDescription>
              <p className="mb-3">No planning data available.</p>
              <Button onClick={() => window.location.href = '/planner/long-range'}>
                Create Your First Long Range Plan
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }
  
  // Render mobile view
  if (isMobile) {
    return (
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingSkeleton lines={10} />}>
          <LazyMobileCascadeView
            data={{
              curriculum: rootData.curriculumSummary as any,
              longRangePlans: treeData as any,
              metrics: null,
            }}
            onNodeSelect={handleNodeSelect as any}
            onNodeExpand={handleNodeExpand}
            onNodeCollapse={handleNodeCollapse}
            onFilterChange={handleFilterChange}
          />
        </React.Suspense>
      </ErrorBoundary>
    );
  }
  
  // Desktop/Tablet view
  return (
    <MainLayout>
      <ErrorBoundary>
        <div className="flex flex-col h-full">
          {/* Header with filters and progress */}
          <div className="border-b bg-white p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">Planning Cascade View</h1>
                <CascadeSearch
                  data={treeData}
                  onResultSelect={handleSearchResultSelect}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoadingRoots}
                  aria-label="Refresh data"
                >
                  {isLoadingRoots ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {rootData && (
                <CascadeProgressIndicator 
                  metrics={{
                    totalLongRangePlans: rootData.longRangePlans.length,
                    totalUnits: rootData.longRangePlans.reduce((sum, lrp) => sum + lrp.childrenCount, 0),
                    totalLessons: 0, // Would need to calculate
                    completedLessons: 0,
                    completionPercentage: 0,
                  }}
                />
              )}
            </div>
            <FilterBar 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            {selectedNode && (
              <div className="mt-3">
                <CascadeBreadcrumb selection={selectedNode} />
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left panel - Tree view */}
            <div className={`${isTablet ? 'w-2/5' : 'w-1/3'} border-r bg-gray-50`}>
              <VirtualizedTree
                data={treeData}
                onNodeSelect={handleNodeSelect}
                onNodeExpand={handleNodeExpand}
                onNodeCollapse={handleNodeCollapse}
                onLoadMore={fetchNodeChildren}
                className="h-full"
              />
            </div>

            {/* Right panel - Detail view */}
            <div className="flex-1 overflow-y-auto bg-white">
              {selectedNode ? (
                <CascadeDetailPanel selection={selectedNode} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                  <p className="text-lg mb-4">Select an item from the tree to view details</p>
                  <p className="text-sm">
                    Tip: Use <kbd className="px-2 py-1 bg-gray-100 rounded">↑</kbd> <kbd className="px-2 py-1 bg-gray-100 rounded">↓</kbd> to navigate
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
}

export default PerfectCascadeView;