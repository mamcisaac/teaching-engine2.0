import React, { useRef, useEffect, useState, memo } from 'react';
import { cn } from '../../lib/utils';
import { ChevronRight, ChevronDown, BookOpen, Target, Layers, FileText, Calendar, Loader2 } from 'lucide-react';
import type { CascadeNode } from '../../stores/cascadeStore';

interface VirtualTreeProps {
  nodes: CascadeNode[];
  expandedNodes: Set<string>;
  selectedNodeId: string | null;
  focusedNodeId: string | null;
  loadingNodes: Set<string>;
  nodeChildren: Map<string, CascadeNode[]>;
  onToggle: (node: CascadeNode) => void;
  onSelect: (nodeId: string) => void;
  onFocus: (nodeId: string) => void;
}

interface FlatNode {
  node: CascadeNode;
  level: number;
}

// Simple virtual rendering - only render nodes in viewport
export const VirtualTree = memo(function VirtualTree({
  nodes,
  expandedNodes,
  selectedNodeId,
  focusedNodeId,
  loadingNodes,
  nodeChildren,
  onToggle,
  onSelect,
  onFocus,
}: VirtualTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  // Flatten tree to array for virtual rendering
  const flattenNodes = (): FlatNode[] => {
    const flat: FlatNode[] = [];
    
    const traverse = (nodes: CascadeNode[], level: number) => {
      for (const node of nodes) {
        flat.push({ node, level });
        if (expandedNodes.has(node.id)) {
          const children = nodeChildren.get(node.id);
          if (children) traverse(children, level + 1);
        }
      }
    };
    
    traverse(nodes, 0);
    return flat;
  };
  
  const flatNodes = flattenNodes();
  const nodeHeight = 32; // Height of each node in pixels
  const totalHeight = flatNodes.length * nodeHeight;
  
  // Update visible range on scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateVisibleRange = () => {
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      
      const start = Math.floor(scrollTop / nodeHeight);
      const end = Math.ceil((scrollTop + clientHeight) / nodeHeight);
      
      // Add buffer for smooth scrolling
      setVisibleRange({
        start: Math.max(0, start - 5),
        end: Math.min(flatNodes.length, end + 5)
      });
    };
    
    updateVisibleRange();
    container.addEventListener('scroll', updateVisibleRange);
    
    return () => container.removeEventListener('scroll', updateVisibleRange);
  }, [flatNodes.length]);
  
  const getIcon = (type: CascadeNode['type']) => {
    const cls = "h-4 w-4";
    switch (type) {
      case 'curriculum': return <Target className={cls} />;
      case 'lrp': return <BookOpen className={cls} />;
      case 'unit': return <Layers className={cls} />;
      case 'lesson': return <FileText className={cls} />;
      case 'daybook': return <Calendar className={cls} />;
      default: return <FileText className={cls} />;
    }
  };
  
  const visibleNodes = flatNodes.slice(visibleRange.start, visibleRange.end);
  const offsetY = visibleRange.start * nodeHeight;
  
  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto"
      style={{ position: 'relative' }}
    >
      {/* Total height placeholder for scrollbar */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Rendered nodes */}
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleNodes.map(({ node, level }, index) => {
            const isExpanded = expandedNodes.has(node.id);
            const isSelected = selectedNodeId === node.id;
            const isFocused = focusedNodeId === node.id;
            const isLoading = loadingNodes.has(node.id);
            
            return (
              <div
                key={node.id}
                className={cn(
                  "flex items-center gap-2 px-2 h-8 hover:bg-gray-100 cursor-pointer",
                  isSelected && "bg-blue-50 border-l-2 border-blue-500",
                  isFocused && "ring-2 ring-blue-400"
                )}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
                onClick={() => {
                  onSelect(node.id);
                  onFocus(node.id);
                }}
                role="treeitem"
                aria-level={level + 1}
                aria-selected={isSelected}
                tabIndex={isFocused ? 0 : -1}
              >
                {node.hasChildren && (
                  <button
                    className="p-0.5 hover:bg-gray-200 rounded"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(node);
                    }}
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
                
                {getIcon(node.type)}
                
                <span className={cn("flex-1 text-sm truncate", isSelected && "font-medium")}>
                  {node.label}
                </span>
                
                {node.progress && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-gray-500">
                      {node.progress.completed}/{node.progress.total}
                    </span>
                    <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ 
                          width: `${node.progress.total > 0 
                            ? Math.round((node.progress.completed / node.progress.total) * 100) 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {node.childrenCount !== undefined && node.childrenCount > 0 && !isExpanded && (
                  <span className="text-xs text-gray-400 px-1">
                    {node.childrenCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});