import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '../MainLayout';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/Button';
import { Card } from '../ui/card';
import { Loader2, AlertCircle, RefreshCw, FolderTree, FileText, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCascadeStore, type CascadeNode } from '../../stores/cascadeStore';
import { apiClient } from '../../api/core/client';
import { FilterBar } from './FilterBar';
import { CascadeDetailPanel } from './CascadeDetailPanel';
import { CascadeBreadcrumb } from './CascadeBreadcrumb';
import { CascadeProgressIndicator } from './CascadeProgressIndicator';
import { VirtualTree } from './VirtualTree';
import { ErrorBoundary } from './ErrorBoundary';
import { TreeSkeleton } from './TreeSkeleton';
import { ExportMenu } from './ExportMenu';
import { EmptyState } from './EmptyState';
import { usePerformanceMonitor, getPerformanceWarning, getDeviceType, PERFORMANCE_THRESHOLDS } from './usePerformanceMonitor';
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
 * Planning Cascade View - Hierarchical planning visualization
 * Shows: Curriculum → LRP → Units → Lessons → Days
 * 
 * Performance characteristics:
 * - Tested with ~500-1000 nodes on typical devices
 * - Uses virtualization to render only visible items
 * - Performance may vary based on device and browser
 * - Implements debouncing and request cancellation
 */
export function PlanningCascadeView(): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'tree' | 'detail'>('tree');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);
  
  // Store active abort controllers for request cancellation
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  // Performance monitoring
  const device = getDeviceType();
  const performanceTimerRef = useRef<NodeJS.Timeout>();
  
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
  
  // Retry logic with exponential backoff
  const retryWithBackoff = useCallback(async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error | undefined;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on abort
        if (lastError.name === 'AbortError') {
          throw lastError;
        }
        
        // Check if it's a network error worth retrying
        const isNetworkError = 
          lastError.message?.includes('network') ||
          lastError.message?.includes('fetch') ||
          (error as any)?.code === 'ECONNABORTED' ||
          (error as any)?.response?.status >= 500;
        
        if (!isNetworkError || i === maxRetries - 1) {
          throw lastError;
        }
        
        // Exponential backoff
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }, []);
  
  // Load children for a node with progressive loading
  const loadNodeChildren = useCallback(async (nodeId: string, nodeType: string, loadMore = false) => {
    // Get current state
    const store = useCascadeStore.getState();
    const existingChildren = store.nodeChildren.get(nodeId) || [];
    const loadedCount = store.nodeLoadedCount.get(nodeId) || 0;
    
    // For initial load, check if already loaded
    if (!loadMore && existingChildren.length > 0) {
      return;
    }
    
    // Cancel any existing request for this node
    const existingController = abortControllersRef.current.get(nodeId);
    if (existingController) {
      existingController.abort();
    }
    
    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllersRef.current.set(nodeId, abortController);
    
    setNodeLoading(nodeId, true);
    
    // Progressive loading - start with 20 items, load more on demand
    const limit = 20;
    const offset = loadMore ? loadedCount : 0;
    
    try {
      const response = await retryWithBackoff(async () => 
        apiClient.get(
          `/api/planning-cascade-progressive/node/${nodeId}/children`,
          {
            params: {
              nodeType,
              limit,
              offset,
              includeProgress: true,
            },
            signal: abortController.signal,
          }
        )
      );
      
      interface ProgressiveResponseChild {
        id: string;
        label?: string;
        title?: string;
        type: 'curriculum' | 'lrp' | 'unit' | 'lesson' | 'daybook';
        hasChildren?: boolean;
        childrenCount?: number;
        data?: CascadeData;
        progress?: {
          completed: number;
          total: number;
        };
      }
      
      const newChildren = response.data.children.map((child: ProgressiveResponseChild): CascadeNode => ({
        id: child.id,
        label: child.label || child.title || '',
        type: child.type,
        hasChildren: child.hasChildren || (child.childrenCount ? child.childrenCount > 0 : false),
        childrenCount: child.childrenCount,
        data: child.data,
        progress: child.progress,
      }));
      
      // Update store with pagination info
      const store = useCascadeStore.getState();
      const allChildren = loadMore ? [...existingChildren, ...newChildren] : newChildren;
      const totalCount = response.data.totalCount || response.data.total || allChildren.length;
      const hasMore = allChildren.length < totalCount;
      
      // Batch update
      setNodeChildren(nodeId, allChildren);
      store.nodeLoadedCount.set(nodeId, allChildren.length);
      store.nodeTotalCount.set(nodeId, totalCount);
      store.nodeHasMore.set(nodeId, hasMore);
      
      // Trigger re-render
      useCascadeStore.setState({
        nodeLoadedCount: new Map(store.nodeLoadedCount),
        nodeTotalCount: new Map(store.nodeTotalCount),
        nodeHasMore: new Map(store.nodeHasMore),
      });
    } catch (err) {
      // Don't show error for aborted requests
      if (err instanceof Error && err.name === 'AbortError') {
        console.log(`Request cancelled for node ${nodeId}`);
      } else {
        setError(`Failed to load children: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setNodeLoading(nodeId, false);
      // Clean up the controller reference
      abortControllersRef.current.delete(nodeId);
    }
  }, [setNodeChildren, setNodeLoading, retryWithBackoff]);
  
  // Transform root data to nodes (needed for visibleNodeCount)
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
        data: undefined, // Summary data is in the node itself
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
  
  // Count visible nodes for performance monitoring (needed by handleNodeToggle)
  const visibleNodeCount = useMemo(() => {
    let count = 0;
    const countVisible = (nodes: CascadeNode[]) => {
      nodes.forEach(node => {
        count++;
        if (expandedNodes.has(node.id)) {
          const children = nodeChildren.get(node.id);
          if (children) countVisible(children);
        }
      });
    };
    countVisible(rootNodes);
    return count;
  }, [rootNodes, expandedNodes, nodeChildren]);
  
  // Handle loading more children for a node
  const handleLoadMore = useCallback(async (nodeId: string) => {
    const node = rootNodes.find(n => n.id === nodeId) || 
                 Array.from(nodeChildren.values()).flat().find(n => n.id === nodeId);
    if (node) {
      await loadNodeChildren(nodeId, node.type, true);
    }
  }, [rootNodes, nodeChildren, loadNodeChildren]);
  
  // Handle node expansion with performance monitoring
  const handleNodeToggle = useCallback(async (node: CascadeNode) => {
    // Check if we're about to exceed performance limits
    const willExpand = !expandedNodes.has(node.id);
    
    if (willExpand) {
      // Use device-specific thresholds
      const maxNodes = PERFORMANCE_THRESHOLDS.maxNodes[device];
      const warnNodes = PERFORMANCE_THRESHOLDS.warningNodes[device];
      
      // Count total visible nodes after expansion
      let estimatedVisible = visibleNodeCount;
      if (node.childrenCount) {
        estimatedVisible += node.childrenCount;
      } else {
        estimatedVisible += 10; // Conservative estimate
      }
      
      // Block expansion if at max limit
      if (estimatedVisible >= maxNodes) {
        setPerformanceWarning(
          `Cannot expand. Maximum ${maxNodes} nodes for ${device}. Currently showing ${visibleNodeCount} nodes.`
        );
        return;
      }
      
      // Warn if approaching limit
      if (estimatedVisible >= warnNodes && estimatedVisible < maxNodes) {
        setPerformanceWarning(
          `Performance warning: ${visibleNodeCount} visible nodes. Limit is ${maxNodes} for ${device}.`
        );
        // Auto-clear warning after 5 seconds
        if (performanceTimerRef.current) {
          clearTimeout(performanceTimerRef.current);
        }
        performanceTimerRef.current = setTimeout(() => {
          setPerformanceWarning(null);
        }, 5000);
      }
    }
    
    toggleNode(node.id);
    
    // Load children if expanding and not yet loaded
    if (!expandedNodes.has(node.id) && node.hasChildren && !nodeChildren.has(node.id)) {
      await loadNodeChildren(node.id, node.type);
    }
  }, [expandedNodes, nodeChildren, toggleNode, loadNodeChildren, device, visibleNodeCount]);
  
  // Calculate overall metrics with REAL data
  const metrics = useMemo(() => {
    if (!rootData) return null;
    
    let totalLessons = 0;
    let completedLessons = 0;
    
    // Count all loaded lessons and their completion status
    const countLessons = (nodes: CascadeNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'lesson') {
          totalLessons++;
          // Check if lesson is completed based on data status
          if (node.data && 'status' in node.data && node.data.status === 'completed') {
            completedLessons++;
          }
        }
        
        // Accumulate from progress if available
        if (node.progress) {
          // Don't double count - only use progress from non-lesson nodes
          if (node.type !== 'lesson' && node.progress.total > 0) {
            // This represents aggregated lesson counts from units/LRPs
            const nodeCompleted = node.progress.completed || 0;
            const nodeTotal = node.progress.total || 0;
            
            // Only add if we haven't traversed the children yet
            if (!nodeChildren.has(node.id) && node.type === 'unit') {
              totalLessons += nodeTotal;
              completedLessons += nodeCompleted;
            }
          }
        }
        
        // Recurse through loaded children
        const children = nodeChildren.get(node.id);
        if (children) countLessons(children);
      });
    };
    
    countLessons(rootNodes);
    
    // If no lessons counted yet, estimate from unit counts
    if (totalLessons === 0) {
      // Estimate 4 lessons per unit as a reasonable default
      const totalUnits = rootData.longRangePlans.reduce((sum, lrp) => sum + lrp._count.unitPlans, 0);
      totalLessons = totalUnits * 4;
    }
    
    return {
      totalExpectations: rootData.curriculumSummary.total,
      totalLRPs: rootData.longRangePlans.length,
      totalUnits: rootData.longRangePlans.reduce((sum, lrp) => sum + lrp._count.unitPlans, 0),
      completedLessons,
      totalLessons,
    };
  }, [rootData, rootNodes, nodeChildren]);
  
  // Use performance monitoring
  const performanceMetrics = usePerformanceMonitor(expandedNodes.size, visibleNodeCount);
  
  // Check performance and update warnings
  useEffect(() => {
    const warning = getPerformanceWarning(performanceMetrics);
    if (warning !== performanceWarning) {
      setPerformanceWarning(warning);
      if (warning && performanceTimerRef.current) {
        clearTimeout(performanceTimerRef.current);
      }
      if (warning) {
        performanceTimerRef.current = setTimeout(() => {
          setPerformanceWarning(null);
        }, 7000);
      }
    }
  }, [performanceMetrics, performanceWarning]);
  
  // Load expanded state from localStorage on mount
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    // Only restore once and after initial data load
    if (hasRestoredRef.current || !rootData) return;
    
    const saved = localStorage.getItem('cascade-expanded');
    if (saved) {
      try {
        const nodeIds = JSON.parse(saved);
        // Use store's batch update to restore all at once
        const store = useCascadeStore.getState();
        const currentExpanded = new Set(store.expandedNodes);
        
        nodeIds.forEach((id: string) => {
          currentExpanded.add(id);
        });
        
        // Single state update
        useCascadeStore.setState({ expandedNodes: currentExpanded });
        hasRestoredRef.current = true;
      } catch (error) {
        console.error('Failed to load expanded state:', error);
      }
    }
  }, [rootData]); // Run after data loads
  
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('cascade-expanded', JSON.stringify(Array.from(expandedNodes)));
    }, 500); // Debounce 500ms
    
    return () => clearTimeout(timer);
  }, [expandedNodes]);
  
  // Debounce search query updates with race condition prevention
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    let cancelled = false;
    
    // Only update if component is still mounted and timer wasn't cancelled
    timer = setTimeout(() => {
      if (!cancelled) {
        setSearchQuery(localSearchQuery);
      }
    }, 300); // Debounce 300ms for search
    
    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [localSearchQuery, setSearchQuery]);
  
  // Cancel all pending requests on unmount
  useEffect(() => {
    return () => {
      // Cancel all active requests when component unmounts
      abortControllersRef.current.forEach(controller => {
        controller.abort();
      });
      abortControllersRef.current.clear();
    };
  }, []);
  
  // Enhanced ARIA-compliant keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // Build flat list with level information
    interface FlatNodeWithLevel {
      node: CascadeNode;
      level: number;
    }
    const visibleNodes: FlatNodeWithLevel[] = [];
    const collectVisible = (nodes: CascadeNode[], level: number = 0) => {
      nodes.forEach(node => {
        visibleNodes.push({ node, level });
        if (expandedNodes.has(node.id)) {
          const children = nodeChildren.get(node.id);
          if (children) collectVisible(children, level + 1);
        }
      });
    };
    collectVisible(rootNodes);
    
    if (visibleNodes.length === 0) return;
    
    const currentIndex = focusedNodeId 
      ? visibleNodes.findIndex(n => n.node.id === focusedNodeId)
      : -1;
    
    const currentItem = currentIndex >= 0 ? visibleNodes[currentIndex] : null;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = currentIndex < visibleNodes.length - 1 ? currentIndex + 1 : 0;
        setFocusedNodeId(visibleNodes[nextIndex].node.id);
        selectNode(visibleNodes[nextIndex].node.id);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleNodes.length - 1;
        setFocusedNodeId(visibleNodes[prevIndex].node.id);
        selectNode(visibleNodes[prevIndex].node.id);
        break;
        
      case 'ArrowRight':
        // Expand if has children and collapsed, or move to first child if expanded
        if (currentItem) {
          e.preventDefault();
          const { node } = currentItem;
          if (node.hasChildren) {
            if (!expandedNodes.has(node.id)) {
              // Expand the node
              toggleNode(node.id);
              if (!nodeChildren.has(node.id)) {
                loadNodeChildren(node.id, node.type);
              }
            } else {
              // Move to first child if expanded
              const children = nodeChildren.get(node.id);
              if (children && children.length > 0) {
                setFocusedNodeId(children[0].id);
                selectNode(children[0].id);
              }
            }
          }
        }
        break;
        
      case 'ArrowLeft':
        // Collapse if expanded, or move to parent
        if (currentItem) {
          e.preventDefault();
          const { node, level } = currentItem;
          if (expandedNodes.has(node.id)) {
            // Collapse the node
            toggleNode(node.id);
          } else if (level > 0) {
            // Move to parent node
            for (let i = currentIndex - 1; i >= 0; i--) {
              if (visibleNodes[i].level === level - 1) {
                setFocusedNodeId(visibleNodes[i].node.id);
                selectNode(visibleNodes[i].node.id);
                break;
              }
            }
          }
        }
        break;
        
      case 'Home':
        // Move to first node
        e.preventDefault();
        if (visibleNodes.length > 0) {
          setFocusedNodeId(visibleNodes[0].node.id);
          selectNode(visibleNodes[0].node.id);
        }
        break;
        
      case 'End':
        // Move to last node
        e.preventDefault();
        if (visibleNodes.length > 0) {
          const lastNode = visibleNodes[visibleNodes.length - 1];
          setFocusedNodeId(lastNode.node.id);
          selectNode(lastNode.node.id);
        }
        break;
        
      case 'Enter':
      case ' ':
        // Toggle expansion
        if (currentItem) {
          e.preventDefault();
          const { node } = currentItem;
          if (node.hasChildren) {
            toggleNode(node.id);
            if (!expandedNodes.has(node.id) && !nodeChildren.has(node.id)) {
              loadNodeChildren(node.id, node.type);
            }
          }
        }
        break;
        
      case '*':
        // Expand all siblings
        if (currentItem) {
          e.preventDefault();
          const { level } = currentItem;
          visibleNodes.forEach(({ node: sibling, level: siblingLevel }) => {
            if (siblingLevel === level && sibling.hasChildren && !expandedNodes.has(sibling.id)) {
              toggleNode(sibling.id);
              if (!nodeChildren.has(sibling.id)) {
                loadNodeChildren(sibling.id, sibling.type);
              }
            }
          });
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
        
        {/* Search Bar with Export Actions */}
        <div className="border-b bg-white">
          <div className="p-4 flex justify-between items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cascade (name, code, title)..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                aria-label="Search planning cascade"
              />
              {localSearchQuery && (
                <button
                  onClick={() => setLocalSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {/* Export Menu */}
            <div className="ml-4">
              <ExportMenu 
                nodes={rootNodes}
                expandedNodes={expandedNodes}
                nodeChildren={nodeChildren}
              />
            </div>
          </div>
          
          {/* Performance Warning */}
          {performanceWarning && (
            <div className="px-4 pb-3">
              <Alert variant={performanceWarning.includes('Maximum') ? 'destructive' : 'default'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {performanceWarning}
                  <button
                    onClick={() => setPerformanceWarning(null)}
                    className="ml-2 text-sm underline"
                  >
                    Dismiss
                  </button>
                </AlertDescription>
              </Alert>
            </div>
          )}
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
            
            {/* Performance Debug Panel (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
                <div className="grid grid-cols-3 gap-2">
                  <div>FPS: {performanceMetrics.fps}</div>
                  <div>Render: {Math.round(performanceMetrics.renderTime)}ms</div>
                  <div>Memory: {performanceMetrics.memoryUsed || 'N/A'}MB</div>
                  <div>Expanded: {expandedNodes.size}</div>
                  <div>Visible: {visibleNodeCount}</div>
                  <div>Device: {device}</div>
                </div>
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
              {/* Loading state with skeleton */}
              {isLoading && (
                <TreeSkeleton count={8} className="py-4" />
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
                    searchQuery={searchQuery}
                    onToggle={handleNodeToggle}
                    onSelect={handleNodeSelect}
                    onFocus={setFocusedNodeId}
                    onLoadMore={handleLoadMore}
                  />
                </div>
              )}
              
              {/* Empty state */}
              {!isLoading && !fetchError && rootNodes.length === 0 && (
                <EmptyState 
                  type={filters.academicYear || filters.subject || filters.grade ? "filtered-empty" : "no-data"}
                  onAction={filters.academicYear || filters.subject || filters.grade ? clearFilters : undefined}
                />
              )}
            </div>
          </div>
          
          {/* Detail panel - full on mobile (when selected), half on desktop */}
          <div className={cn(
            "md:w-1/2 bg-gray-50 overflow-y-auto",
            mobileView === 'detail' ? 'block' : 'hidden md:block'
          )}>
            {selectedNode ? (
              selectedNode.data ? (
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
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading details...
                </div>
              )
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