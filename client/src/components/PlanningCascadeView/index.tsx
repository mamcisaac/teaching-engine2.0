import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../MainLayout';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';
import { Loader2, AlertCircle, RefreshCw, FolderTree, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCascadeStore, type CascadeNode } from '../../stores/cascadeStore';
import { apiClient } from '../../api/core/client';
import { FilterBar } from './FilterBar';
import { CascadeDetailPanel } from './CascadeDetailPanel';
import { CascadeBreadcrumb } from './CascadeBreadcrumb';
import { CascadeProgressIndicator } from './CascadeProgressIndicator';
import { VirtualTree } from './VirtualTree';
import { ErrorBoundary } from './ErrorBoundary';
import type { CascadeData } from './types';

interface RootData {
  longRangePlans: Array<{
    id: string;
    title: string;
    titleFr?: string;
    academicYear: string;
    subject: string;
    grade: number;
    _count: {
      unitPlans: number;
      expectations: number;
    };
  }>;
  curriculumSummary: {
    total: number;
    bySubject: Record<string, number>;
  };
}

/**
 * Planning Cascade View - Clean, performant hierarchical planning visualization
 * Shows: Curriculum → LRP → Units → Lessons → Days
 */
export function PlanningCascadeView(): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'tree' | 'detail'>('tree');
  
  // Zustand store - simplified state management
  const {
    expandedNodes,
    selectedNodeId,
    loadingNodes,
    nodeChildren,
    filters,
    searchQuery,
    toggleNode,
    selectNode,
    setNodeChildren,
    setNodeLoading,
    setFilters,
    clearFilters,
    setSearchQuery,
  } = useCascadeStore();
  
  // Fetch root data
  const { 
    data: rootData, 
    isLoading, 
    error: fetchError, 
    refetch 
  } = useQuery<RootData>({
    queryKey: ['cascade-roots', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.grade) params.append('grade', filters.grade.toString());
      
      const response = await apiClient.get(`/api/planning-cascade-progressive/roots?${params}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
  
  // Load children for a node
  const loadNodeChildren = useCallback(async (nodeId: string, nodeType: string) => {
    // Check if already loaded
    if (nodeChildren.has(nodeId)) {
      return;
    }
    
    setNodeLoading(nodeId, true);
    
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
      
      interface ProgressiveResponseChild {
        id: string;
        label?: string;
        title?: string;
        type: 'curriculum' | 'lrp' | 'unit' | 'lesson' | 'daybook';
        hasChildren?: boolean;
        childrenCount?: number;
        data?: CascadeData;
      }
      
      const children = response.data.children.map((child: ProgressiveResponseChild): CascadeNode => ({
        id: child.id,
        label: child.label || child.title,
        type: child.type,
        hasChildren: child.hasChildren || child.childrenCount > 0,
        childrenCount: child.childrenCount,
        data: child.data || child,
        progress: child.progress,
      }));
      
      setNodeChildren(nodeId, children);
    } catch (err) {
      setError(`Failed to load children: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setNodeLoading(nodeId, false);
    }
  }, [nodeChildren, setNodeChildren, setNodeLoading]);
  
  // Handle node expansion
  const handleNodeToggle = useCallback(async (node: CascadeNode) => {
    toggleNode(node.id);
    
    // Load children if expanding and not yet loaded
    if (!expandedNodes.has(node.id) && node.hasChildren && !nodeChildren.has(node.id)) {
      await loadNodeChildren(node.id, node.type);
    }
  }, [expandedNodes, nodeChildren, toggleNode, loadNodeChildren]);
  
  // Transform root data to nodes
  const rootNodes = useMemo((): CascadeNode[] => {
    if (!rootData) return [];
    
    const nodes: CascadeNode[] = [];
    
    // Add curriculum expectations as root node if exists
    if (rootData.curriculumSummary.total > 0) {
      nodes.push({
        id: 'curriculum-root',
        label: `Curriculum Expectations (${rootData.curriculumSummary.total})`,
        type: 'curriculum',
        hasChildren: true,
        data: rootData.curriculumSummary,
        progress: {
          completed: 0,
          total: rootData.curriculumSummary.total,
        },
      });
    }
    
    // Add Long Range Plans
    nodes.push(...rootData.longRangePlans.map(lrp => ({
      id: lrp.id,
      label: lrp.titleFr || lrp.title,
      type: 'lrp' as const,
      hasChildren: lrp._count.unitPlans > 0,
      childrenCount: lrp._count.unitPlans,
      data: lrp,
      progress: {
        completed: 0,
        total: lrp._count.expectations,
      },
    })));
    
    return nodes;
  }, [rootData]);
  
  // Calculate overall metrics
  const metrics = useMemo(() => {
    if (!rootData) return null;
    
    return {
      totalExpectations: rootData.curriculumSummary.total,
      totalLRPs: rootData.longRangePlans.length,
      totalUnits: rootData.longRangePlans.reduce((sum, lrp) => sum + lrp._count.unitPlans, 0),
      completedLessons: 0, // Would be calculated from actual data
      totalLessons: 0,
    };
  }, [rootData]);
  
  // Persist expanded state in localStorage (with debounce)
  useEffect(() => {
    const saved = localStorage.getItem('cascade-expanded');
    if (saved) {
      try {
        const nodeIds = JSON.parse(saved);
        nodeIds.forEach((id: string) => {
          if (!expandedNodes.has(id)) {
            toggleNode(id);
          }
        });
      } catch {}
    }
  }, []);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('cascade-expanded', JSON.stringify(Array.from(expandedNodes)));
    }, 500); // Debounce 500ms
    
    return () => clearTimeout(timer);
  }, [expandedNodes]);
  
  // Simple keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Get all visible nodes
    const visibleNodes: CascadeNode[] = [];
    const collectVisible = (nodes: CascadeNode[]) => {
      nodes.forEach(node => {
        visibleNodes.push(node);
        if (expandedNodes.has(node.id)) {
          const children = nodeChildren.get(node.id);
          if (children) collectVisible(children);
        }
      });
    };
    collectVisible(rootNodes);
    
    if (visibleNodes.length === 0) return;
    
    const currentIndex = focusedNodeId 
      ? visibleNodes.findIndex(n => n.id === focusedNodeId)
      : -1;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = currentIndex < visibleNodes.length - 1 ? currentIndex + 1 : 0;
        setFocusedNodeId(visibleNodes[nextIndex].id);
        selectNode(visibleNodes[nextIndex].id);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleNodes.length - 1;
        setFocusedNodeId(visibleNodes[prevIndex].id);
        selectNode(visibleNodes[prevIndex].id);
        break;
      case 'Enter':
      case ' ':
        if (currentIndex >= 0) {
          e.preventDefault();
          const node = visibleNodes[currentIndex];
          if (node.hasChildren) {
            toggleNode(node.id);
            if (!expandedNodes.has(node.id) && !nodeChildren.has(node.id)) {
              loadNodeChildren(node.id, node.type);
            }
          }
        }
        break;
    }
  }, [rootNodes, expandedNodes, nodeChildren, focusedNodeId, selectNode, toggleNode, loadNodeChildren]);
  
  // Check if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Auto-switch to detail view on mobile when selecting
  const handleNodeSelect = useCallback((nodeId: string) => {
    selectNode(nodeId);
    if (isMobile) {
      setMobileView('detail');
    }
  }, [selectNode, isMobile]);
  
  // Get selected node details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    
    // Search in root nodes
    const findNode = (nodes: CascadeNode[], id: string): CascadeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const children = nodeChildren.get(node.id);
        if (children) {
          const found = findNode(children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findNode(rootNodes, selectedNodeId);
  }, [selectedNodeId, rootNodes, nodeChildren]);
  
  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        {/* Page header */}
        <div className="px-6 py-4 border-b bg-white">
          <h1 className="text-2xl font-semibold text-gray-900">Planning Cascade View</h1>
          <p className="text-sm text-gray-600 mt-1">Navigate your curriculum hierarchy</p>
        </div>
        {/* Header with filters and progress */}
        <div className="border-b bg-white">
          <div className="p-4">
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={clearFilters}
            />
            {metrics && (
              <div className="mt-4">
                <CascadeProgressIndicator metrics={metrics} />
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile tab switcher */}
        <div className="md:hidden border-b bg-white">
          <div className="flex">
            <button
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                mobileView === 'tree' 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setMobileView('tree')}
            >
              <FolderTree className="inline h-4 w-4 mr-1" />
              Tree
            </button>
            <button
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                mobileView === 'detail' 
                  ? "border-blue-500 text-blue-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
              onClick={() => setMobileView('detail')}
            >
              <FileText className="inline h-4 w-4 mr-1" />
              Details
            </button>
          </div>
        </div>
        
        {/* Main content area - responsive */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Tree panel - full on mobile (when selected), half on desktop */}
          <div className={cn(
            "md:w-1/2 md:border-r bg-white overflow-y-auto",
            mobileView === 'tree' ? 'block' : 'hidden md:block'
          )}>
            <div className="p-4">
              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
              
              {/* Error state */}
              {(fetchError || error) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {fetchError instanceof Error ? fetchError.message : error || 'Failed to load data'}
                  </AlertDescription>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setError(null);
                      refetch();
                    }}
                    className="mt-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </Alert>
              )}
              
              {/* Tree view with virtual rendering */}
              {!isLoading && !fetchError && rootNodes.length > 0 && (
                <div 
                  role="tree" 
                  aria-label="Planning cascade tree"
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                  className="focus:outline-none h-full"
                >
                  <VirtualTree
                    nodes={rootNodes}
                    expandedNodes={expandedNodes}
                    selectedNodeId={selectedNodeId}
                    focusedNodeId={focusedNodeId}
                    loadingNodes={loadingNodes}
                    nodeChildren={nodeChildren}
                    onToggle={handleNodeToggle}
                    onSelect={handleNodeSelect}
                    onFocus={setFocusedNodeId}
                  />
                </div>
              )}
              
              {/* Empty state */}
              {!isLoading && !fetchError && rootNodes.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-gray-500 mb-4">
                    No planning data available for the selected filters.
                  </p>
                  <Button onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </Card>
              )}
            </div>
          </div>
          
          {/* Detail panel - full on mobile (when selected), half on desktop */}
          <div className={cn(
            "md:w-1/2 bg-gray-50 overflow-y-auto",
            mobileView === 'detail' ? 'block' : 'hidden md:block'
          )}>
            {selectedNode ? (
              <div className="p-4">
                <CascadeBreadcrumb selection={{
                  type: selectedNode.type,
                  id: selectedNode.id,
                  data: selectedNode.data,
                }} />
                <div className="mt-4">
                  <CascadeDetailPanel selection={{
                    type: selectedNode.type,
                    id: selectedNode.id,
                    data: selectedNode.data,
                  }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select an item to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Wrap with error boundary
function PlanningCascadeViewWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <PlanningCascadeView />
    </ErrorBoundary>
  );
}

export default PlanningCascadeViewWithErrorBoundary;