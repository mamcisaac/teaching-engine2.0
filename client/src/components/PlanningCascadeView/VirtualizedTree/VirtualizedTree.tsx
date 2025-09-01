import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useInView } from 'react-intersection-observer';
import { cn } from '../../../lib/utils';
import { TreeNode } from './TreeNode';
import type { TreeNodeData, FlattenedNode } from './types';
import { useCascadeStore } from '../../../stores/cascadeStore';
import { useTreeKeyboard } from './useTreeKeyboard';

interface VirtualizedTreeProps {
  data: TreeNodeData[];
  onNodeSelect?: (node: TreeNodeData) => void;
  onNodeExpand?: (nodeId: string) => void;
  onNodeCollapse?: (nodeId: string) => void;
  onLoadMore?: (nodeId: string) => void;
  className?: string;
}

export const VirtualizedTree = React.memo(({
  data,
  onNodeSelect,
  onNodeExpand,
  onNodeCollapse,
  onLoadMore,
  className,
}: VirtualizedTreeProps) => {
  const listRef = useRef<List>(null);
  const expandedNodes = useCascadeStore((state) => state.expandedNodes);
  const selectedNode = useCascadeStore((state) => state.selectedNode);
  const isMultiSelectMode = useCascadeStore((state) => state.isMultiSelectMode);
  const selectedNodes = useCascadeStore((state) => state.selectedNodes);
  
  // Flatten the tree structure for virtualization
  const flattenedData = useMemo(() => {
    const flatten = (
      nodes: TreeNodeData[],
      level = 0,
      parentExpanded = true
    ): FlattenedNode[] => {
      if (!parentExpanded) return [];
      
      return nodes.reduce<FlattenedNode[]>((acc, node) => {
        const isExpanded = expandedNodes.has(node.id);
        const flatNode: FlattenedNode = {
          ...node,
          level,
          isExpanded,
          isVisible: parentExpanded,
          isSelected: selectedNode?.id === node.id,
          isMultiSelected: selectedNodes.has(node.id),
        };
        
        acc.push(flatNode);
        
        if (node.children && isExpanded) {
          acc.push(...flatten(node.children, level + 1, isExpanded));
        }
        
        return acc;
      }, []);
    };
    
    return flatten(data);
  }, [data, expandedNodes, selectedNode, selectedNodes]);
  
  // Keyboard navigation
  const { focusedIndex, handleKeyDown } = useTreeKeyboard({
    flattenedData,
    onSelect: (node) => {
      onNodeSelect?.(node);
    },
    onExpand: (nodeId) => {
      onNodeExpand?.(nodeId);
    },
    onCollapse: (nodeId) => {
      onNodeCollapse?.(nodeId);
    },
  });
  
  // Scroll to focused item
  useEffect(() => {
    if (focusedIndex !== -1 && listRef.current) {
      listRef.current.scrollToItem(focusedIndex, 'smart');
    }
  }, [focusedIndex]);
  
  // Row renderer
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const node = flattenedData[index];
    if (!node) return null;
    
    const handleClick = () => {
      if (isMultiSelectMode) {
        useCascadeStore.getState().toggleNodeSelection(node.id);
      } else {
        onNodeSelect?.(node);
      }
    };
    
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (expandedNodes.has(node.id)) {
        onNodeCollapse?.(node.id);
      } else {
        onNodeExpand?.(node.id);
        // Trigger lazy loading if needed
        if (node.hasChildren && !node.children?.length) {
          onLoadMore?.(node.id);
        }
      }
    };
    
    return (
      <div
        style={style}
        className={cn(
          'tree-node',
          focusedIndex === index && 'tree-node--focused'
        )}
      >
        <TreeNode
          node={node}
          isExpanded={node.isExpanded}
          isSelected={node.isSelected}
          isMultiSelected={node.isMultiSelected}
          isFocused={focusedIndex === index}
          level={node.level}
          onClick={handleClick}
          onToggle={handleToggle}
        />
      </div>
    );
  }, [
    flattenedData,
    focusedIndex,
    isMultiSelectMode,
    expandedNodes,
    onNodeSelect,
    onNodeExpand,
    onNodeCollapse,
    onLoadMore,
  ]);
  
  return (
    <div
      className={cn('virtualized-tree', className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="tree"
      aria-label="Planning hierarchy"
      aria-multiselectable={isMultiSelectMode}
    >
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height}
            itemCount={flattenedData.length}
            itemSize={40} // Height of each row
            width={width}
            overscanCount={5}
            className="virtualized-tree__list"
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
});

VirtualizedTree.displayName = 'VirtualizedTree';