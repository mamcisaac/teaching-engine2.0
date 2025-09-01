import { useState, useCallback, useEffect } from 'react';
import type { FlattenedNode } from './types';
import { useCascadeStore } from '../../../stores/cascadeStore';

interface UseTreeKeyboardProps {
  flattenedData: FlattenedNode[];
  onSelect?: (node: FlattenedNode) => void;
  onExpand?: (nodeId: string) => void;
  onCollapse?: (nodeId: string) => void;
}

export function useTreeKeyboard({
  flattenedData,
  onSelect,
  onExpand,
  onCollapse,
}: UseTreeKeyboardProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const isMultiSelectMode = useCascadeStore((state) => state.isMultiSelectMode);
  const toggleNodeSelection = useCascadeStore((state) => state.toggleNodeSelection);
  
  // Focus management
  const focusNode = useCallback((index: number) => {
    if (index >= 0 && index < flattenedData.length) {
      setFocusedIndex(index);
    }
  }, [flattenedData.length]);
  
  const focusFirstNode = useCallback(() => {
    focusNode(0);
  }, [focusNode]);
  
  const focusLastNode = useCallback(() => {
    focusNode(flattenedData.length - 1);
  }, [focusNode, flattenedData.length]);
  
  const focusPreviousNode = useCallback(() => {
    if (focusedIndex > 0) {
      focusNode(focusedIndex - 1);
    }
  }, [focusedIndex, focusNode]);
  
  const focusNextNode = useCallback(() => {
    if (focusedIndex < flattenedData.length - 1) {
      focusNode(focusedIndex + 1);
    }
  }, [focusedIndex, flattenedData.length, focusNode]);
  
  // Find parent node
  const findParentIndex = useCallback((index: number): number => {
    if (index <= 0) return -1;
    
    const node = flattenedData[index];
    const targetLevel = node.level - 1;
    
    for (let i = index - 1; i >= 0; i--) {
      if (flattenedData[i].level === targetLevel) {
        return i;
      }
    }
    
    return -1;
  }, [flattenedData]);
  
  // Find next sibling
  const findNextSiblingIndex = useCallback((index: number): number => {
    const node = flattenedData[index];
    const targetLevel = node.level;
    
    for (let i = index + 1; i < flattenedData.length; i++) {
      const currentNode = flattenedData[i];
      if (currentNode.level < targetLevel) {
        // We've gone up a level, no more siblings
        return -1;
      }
      if (currentNode.level === targetLevel) {
        return i;
      }
    }
    
    return -1;
  }, [flattenedData]);
  
  // Find previous sibling
  const findPreviousSiblingIndex = useCallback((index: number): number => {
    const node = flattenedData[index];
    const targetLevel = node.level;
    
    for (let i = index - 1; i >= 0; i--) {
      const currentNode = flattenedData[i];
      if (currentNode.level < targetLevel) {
        // We've gone up a level, no more siblings
        return -1;
      }
      if (currentNode.level === targetLevel) {
        return i;
      }
    }
    
    return -1;
  }, [flattenedData]);
  
  // Keyboard event handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const node = flattenedData[focusedIndex];
    
    // Prevent default for all arrow keys and space
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Home', 'End'].includes(e.key)
    ) {
      e.preventDefault();
    }
    
    switch (e.key) {
      case 'ArrowUp':
        focusPreviousNode();
        break;
        
      case 'ArrowDown':
        focusNextNode();
        break;
        
      case 'ArrowLeft':
        if (node) {
          if (node.isExpanded && node.hasChildren) {
            // Collapse expanded node
            onCollapse?.(node.id);
          } else {
            // Move to parent
            const parentIndex = findParentIndex(focusedIndex);
            if (parentIndex >= 0) {
              focusNode(parentIndex);
            }
          }
        }
        break;
        
      case 'ArrowRight':
        if (node) {
          if (!node.isExpanded && node.hasChildren) {
            // Expand collapsed node
            onExpand?.(node.id);
          } else if (node.isExpanded && node.children?.length) {
            // Move to first child
            focusNextNode();
          }
        }
        break;
        
      case 'Enter':
        if (node) {
          if (isMultiSelectMode) {
            toggleNodeSelection(node.id);
          } else {
            onSelect?.(node);
          }
        }
        break;
        
      case ' ':
        if (node) {
          if (e.shiftKey && isMultiSelectMode) {
            // Range selection
            const start = Math.min(focusedIndex, 0);
            const end = focusedIndex;
            for (let i = start; i <= end; i++) {
              toggleNodeSelection(flattenedData[i].id);
            }
          } else if (isMultiSelectMode) {
            toggleNodeSelection(node.id);
          } else if (node.hasChildren) {
            // Toggle expand/collapse
            if (node.isExpanded) {
              onCollapse?.(node.id);
            } else {
              onExpand?.(node.id);
            }
          }
        }
        break;
        
      case 'Home':
        if (e.ctrlKey) {
          focusFirstNode();
        } else {
          // Focus first sibling
          const firstSiblingIndex = findPreviousSiblingIndex(focusedIndex);
          if (firstSiblingIndex >= 0) {
            focusNode(firstSiblingIndex);
          }
        }
        break;
        
      case 'End':
        if (e.ctrlKey) {
          focusLastNode();
        } else {
          // Focus last sibling
          const lastSiblingIndex = findNextSiblingIndex(focusedIndex);
          if (lastSiblingIndex >= 0) {
            focusNode(lastSiblingIndex);
          }
        }
        break;
        
      case '*':
        // Expand all siblings
        if (node) {
          const level = node.level;
          flattenedData.forEach((n, i) => {
            if (n.level === level && n.hasChildren && !n.isExpanded) {
              onExpand?.(n.id);
            }
          });
        }
        break;
        
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          // Select all
          e.preventDefault();
          if (isMultiSelectMode) {
            const allIds = flattenedData.map(n => n.id);
            useCascadeStore.getState().selectAllNodes(allIds);
          }
        }
        break;
        
      case 'Escape':
        // Clear selection
        if (isMultiSelectMode) {
          useCascadeStore.getState().clearSelection();
        }
        break;
    }
  }, [
    flattenedData,
    focusedIndex,
    isMultiSelectMode,
    focusFirstNode,
    focusLastNode,
    focusNextNode,
    focusPreviousNode,
    focusNode,
    findParentIndex,
    findNextSiblingIndex,
    findPreviousSiblingIndex,
    onSelect,
    onExpand,
    onCollapse,
    toggleNodeSelection,
  ]);
  
  // Focus first node on mount
  useEffect(() => {
    if (focusedIndex === -1 && flattenedData.length > 0) {
      setFocusedIndex(0);
    }
  }, [focusedIndex, flattenedData.length]);
  
  // Update focused index when data changes
  useEffect(() => {
    if (focusedIndex >= flattenedData.length) {
      setFocusedIndex(Math.max(0, flattenedData.length - 1));
    }
  }, [focusedIndex, flattenedData.length]);
  
  return {
    focusedIndex,
    handleKeyDown,
    focusNode,
  };
}