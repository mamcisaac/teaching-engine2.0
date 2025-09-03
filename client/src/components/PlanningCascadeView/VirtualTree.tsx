import React, { useMemo, memo, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../lib/utils';
import { ChevronRight, ChevronDown, BookOpen, Target, Layers, FileText, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmptyState } from './EmptyState';
import type { CascadeNode } from '../../stores/cascadeStore';
import { useCascadeStore } from '../../stores/cascadeStore';

interface VirtualTreeProps {
  nodes: CascadeNode[];
  expandedNodes: Set<string>;
  selectedNodeId: string | null;
  focusedNodeId: string | null;
  loadingNodes: Set<string>;
  nodeChildren: Map<string, CascadeNode[]>;
  searchQuery: string;
  onToggle: (node: CascadeNode) => void;
  onSelect: (nodeId: string) => void;
  onFocus: (nodeId: string) => void;
}

interface FlatNode {
  node: CascadeNode;
  level: number;
  visible: boolean;
}

// TRUE virtualization with @tanstack/react-virtual
export const VirtualTree = memo(function VirtualTree({
  nodes,
  expandedNodes,
  selectedNodeId,
  focusedNodeId,
  loadingNodes,
  nodeChildren,
  searchQuery,
  onToggle,
  onSelect,
  onFocus,
  onLoadMore,
}: VirtualTreeProps & { onLoadMore?: (nodeId: string) => void }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Get pagination state from store
  const { nodeHasMore, nodeLoadedCount, nodeTotalCount } = useCascadeStore();
  
  // Memoize flattened and filtered nodes
  const flatNodes = useMemo(() => {
    const flat: FlatNode[] = [];
    const query = searchQuery.toLowerCase();
    
    const traverse = (nodes: CascadeNode[], level: number, parentVisible: boolean = true) => {
      for (const node of nodes) {
        // Check if node matches search
        const matchesSearch = !query || 
          node.label.toLowerCase().includes(query) ||
          (!!node.data?.code && String(node.data.code).toLowerCase().includes(query)) ||
          (!!node.data?.title && String(node.data.title).toLowerCase().includes(query));
        
        // Node is visible if parent is visible and (no search or matches search)
        const visible = parentVisible && (!query || matchesSearch);
        
        flat.push({ node, level, visible });
        
        // Always traverse children if expanded (they might match search)
        if (expandedNodes.has(node.id)) {
          const children = nodeChildren.get(node.id);
          if (children) {
            // If this node matches search, all children are visible
            // If not, children might still match
            traverse(children, level + 1, visible || !query);
          }
          
          // Add "Load More" button if there are more children to load
          const hasMore = nodeHasMore.get(node.id);
          if (hasMore && visible) {
            const loadedCount = nodeLoadedCount.get(node.id) || 0;
            const totalCount = nodeTotalCount.get(node.id) || 0;
            flat.push({
              node: {
                id: `${node.id}-load-more`,
                label: `Load more (${loadedCount} of ${totalCount})`,
                type: 'lesson' as const, // Use any type, it's just for the button
                hasChildren: false,
                data: { isLoadMore: true, parentId: node.id } as any
              },
              level: level + 1,
              visible: true
            });
          }
        }
      }
    };
    
    traverse(nodes, 0);
    return flat;
  }, [nodes, expandedNodes, nodeChildren, searchQuery, nodeHasMore, nodeLoadedCount, nodeTotalCount]);
  
  // Filter to only visible nodes for virtualizer
  const visibleNodes = useMemo(() => 
    flatNodes.filter(n => n.visible),
    [flatNodes]
  );
  
  // Setup virtualizer for TRUE virtualization
  const virtualizer = useVirtualizer({
    count: visibleNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // Each row is 32px
    overscan: 5, // Render 5 extra items above/below viewport
  });
  
  const getIcon = useCallback((type: CascadeNode['type']) => {
    const cls = "h-4 w-4 flex-shrink-0";
    switch (type) {
      case 'curriculum': return <Target className={cls} />;
      case 'lrp': return <BookOpen className={cls} />;
      case 'unit': return <Layers className={cls} />;
      case 'lesson': return <FileText className={cls} />;
      case 'daybook': return <Calendar className={cls} />;
      default: return <FileText className={cls} />;
    }
  }, []);
  
  const items = virtualizer.getVirtualItems();
  
  // Highlight search matches
  const highlightMatch = useCallback((text: string) => {
    if (!searchQuery) return text;
    
    const query = searchQuery.toLowerCase();
    const index = text.toLowerCase().indexOf(query);
    
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <mark className="bg-yellow-200 px-0.5">{text.slice(index, index + searchQuery.length)}</mark>
        {text.slice(index + searchQuery.length)}
      </>
    );
  }, [searchQuery]);
  
  return (
    <div 
      ref={parentRef}
      className="h-full overflow-auto"
      role="tree"
      aria-label="Planning cascade tree"
      aria-multiselectable="false"
      aria-describedby="tree-instructions"
    >
      {/* Screen reader instructions */}
      <div id="tree-instructions" className="sr-only">
        Navigate with arrow keys. Right arrow to expand, left arrow to collapse. 
        Enter or Space to select. Press asterisk to expand all siblings.
      </div>
      
      {/* Live region for announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {searchQuery && `Showing ${visibleNodes.length} results for "${searchQuery}"`}
      </div>
      
      {visibleNodes.length === 0 && searchQuery ? (
        <EmptyState 
          type="no-results" 
          searchQuery={searchQuery}
          onAction={() => {}} // Parent handles clearing
        />
      ) : visibleNodes.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No items to display</p>
        </div>
      ) : (
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {items.map((virtualItem) => {
            const { node, level } = visibleNodes[virtualItem.index];
            const isExpanded = expandedNodes.has(node.id);
            const isSelected = selectedNodeId === node.id;
            const isFocused = focusedNodeId === node.id;
            const isLoading = loadingNodes.has(node.id);
            
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div
                  className={cn(
                    "flex items-center gap-2 px-2 h-8 hover:bg-gray-100 cursor-pointer transition-all duration-200 ease-out",
                    isSelected && "bg-blue-50 border-l-2 border-blue-500",
                    isFocused && "ring-2 ring-blue-400 ring-inset"
                  )}
                  style={{ paddingLeft: `${level * 20 + 8}px` }}
                  onClick={() => {
                    // Check if this is a "Load More" button
                    if (node.data?.isLoadMore && onLoadMore) {
                      onLoadMore(node.data.parentId as string);
                    } else {
                      onSelect(node.id);
                      onFocus(node.id);
                    }
                  }}
                  role="treeitem"
                  aria-level={level + 1}
                  aria-selected={isSelected}
                  aria-expanded={node.hasChildren ? isExpanded : undefined}
                  aria-label={`${node.type}: ${node.label}${node.progress ? `, ${node.progress.completed} of ${node.progress.total} completed` : ''}`}
                  aria-describedby={node.hasChildren && !isExpanded && node.childrenCount ? `children-${node.id}` : undefined}
                  tabIndex={isFocused ? 0 : -1}
                >
                  {/* Special rendering for "Load More" button */}
                  {node.data?.isLoadMore ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      )}
                      {node.label}
                    </Button>
                  ) : (
                    <>
                  {node.hasChildren && (
                    <button
                      className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(node);
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ChevronRight className={cn(
                          "h-3 w-3 transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )} />
                      )}
                    </button>
                  )}
                  {!node.hasChildren && <div className="w-4" />}
                  
                  {getIcon(node.type)}
                  
                  <span className={cn(
                    "flex-1 text-sm truncate",
                    isSelected && "font-medium"
                  )}>
                    {highlightMatch(node.label)}
                  </span>
                  
                  {node.progress && node.progress.total > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-500">
                        {node.progress.completed}/{node.progress.total}
                      </span>
                      <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all"
                          style={{ 
                            width: `${Math.round((node.progress.completed / node.progress.total) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {node.childrenCount !== undefined && node.childrenCount > 0 && !isExpanded && (
                    <span 
                      id={`children-${node.id}`}
                      className="text-xs text-gray-400 px-1"
                      aria-label={`${node.childrenCount} child items`}
                    >
                      {node.childrenCount}
                    </span>
                  )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});