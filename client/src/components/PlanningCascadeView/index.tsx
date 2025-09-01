import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../MainLayout';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';
import { Loader2, AlertCircle, RefreshCw, ChevronRight, ChevronDown, BookOpen, Target, Layers, FileText, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCascadeStore, type CascadeNode } from '../../stores/cascadeStore';
import { apiClient } from '../../api/core/client';
import { FilterBar } from './FilterBar';
import { CascadeDetailPanel } from './CascadeDetailPanel';
import { CascadeBreadcrumb } from './CascadeBreadcrumb';
import { CascadeProgressIndicator } from './CascadeProgressIndicator';

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
      
      const children = response.data.children.map((child: any): CascadeNode => ({
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
  
  // Render a tree node and its children
  const renderNode = (node: CascadeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const isLoading = loadingNodes.has(node.id);
    const children = nodeChildren.get(node.id);
    
    const getNodeIcon = () => {
      switch (node.type) {
        case 'curriculum': return <Target className="h-4 w-4" />;
        case 'lrp': return <BookOpen className="h-4 w-4" />;
        case 'unit': return <Layers className="h-4 w-4" />;
        case 'lesson': return <FileText className="h-4 w-4" />;
        case 'daybook': return <Calendar className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
      }
    };
    
    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded transition-colors",
            isSelected && "bg-blue-50 border-l-2 border-blue-500",
            level > 0 && "ml-6"
          )}
          onClick={() => selectNode(node.id)}
          role="treeitem"
          aria-expanded={node.hasChildren ? isExpanded : undefined}
          aria-selected={isSelected}
          aria-level={level + 1}
        >
          {/* Expand/Collapse button */}
          {node.hasChildren && (
            <button
              className="p-0.5 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                handleNodeToggle(node);
              }}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          {!node.hasChildren && <div className="w-4" />}
          
          {/* Icon */}
          <div className="text-gray-600">
            {getNodeIcon()}
          </div>
          
          {/* Label */}
          <span className={cn("flex-1 text-sm", isSelected && "font-medium")}>
            {node.label}
          </span>
          
          {/* Progress */}
          {node.progress && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {node.progress.completed}/{node.progress.total}
              </span>
              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${Math.round((node.progress.completed / node.progress.total) * 100)}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Children count */}
          {node.childrenCount !== undefined && node.childrenCount > 0 && !isExpanded && (
            <span className="text-xs text-gray-400">
              ({node.childrenCount})
            </span>
          )}
        </div>
        
        {/* Render children if expanded */}
        {isExpanded && children && (
          <div className="ml-2">
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
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
        
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tree panel */}
          <div className="w-1/2 border-r bg-white overflow-y-auto">
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
                    {fetchError?.message || error || 'Failed to load data'}
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
              
              {/* Tree view */}
              {!isLoading && !fetchError && rootNodes.length > 0 && (
                <div role="tree" aria-label="Planning cascade tree">
                  {rootNodes.map(node => renderNode(node))}
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
          
          {/* Detail panel */}
          <div className="w-1/2 bg-gray-50 overflow-y-auto">
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

export default PlanningCascadeView;