import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Target,
  Layers,
  FileText,
  CheckCircle,
  Circle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Checkbox } from '../../ui/checkbox';
import type { FlattenedNode } from './types';
import { useCascadeStore } from '../../../stores/cascadeStore';

interface TreeNodeProps {
  node: FlattenedNode;
  isExpanded: boolean;
  isSelected: boolean;
  isMultiSelected: boolean;
  isFocused: boolean;
  level: number;
  onClick: () => void;
  onToggle: (e: React.MouseEvent) => void;
}

export const TreeNode = React.memo(({
  node,
  isExpanded,
  isSelected,
  isMultiSelected,
  isFocused,
  level,
  onClick,
  onToggle,
}: TreeNodeProps) => {
  const loadingNodes = useCascadeStore((state) => state.loadingNodes);
  const errorNodes = useCascadeStore((state) => state.errorNodes);
  const isMultiSelectMode = useCascadeStore((state) => state.isMultiSelectMode);
  const showProgress = useCascadeStore((state) => state.showProgress);
  
  const isLoading = loadingNodes.has(node.id);
  const error = errorNodes.get(node.id);
  
  const getIcon = () => {
    const iconClass = "h-4 w-4 flex-shrink-0";
    
    if (isLoading) {
      return <Loader2 className={cn(iconClass, "animate-spin text-gray-400")} />;
    }
    
    if (error) {
      return <AlertCircle className={cn(iconClass, "text-red-500")} />;
    }
    
    switch (node.type) {
      case 'curriculum':
        return <Target className={iconClass} />;
      case 'lrp':
        return <BookOpen className={iconClass} />;
      case 'unit':
        return <Layers className={iconClass} />;
      case 'lesson':
        return node.data?.daybookEntry ? 
          <CheckCircle className={cn(iconClass, "text-green-600")} /> : 
          <Circle className={cn(iconClass, "text-gray-400")} />;
      default:
        return <FileText className={iconClass} />;
    }
  };
  
  const renderProgress = () => {
    if (!showProgress || !node.progress) return null;
    
    const { completed, total } = node.progress;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {completed}/{total}
        </span>
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${percentage}% complete`}
          />
        </div>
        <span className="text-xs text-gray-600 font-medium">
          {percentage}%
        </span>
      </div>
    );
  };
  
  return (
    <div
      className={cn(
        "tree-node__content flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer transition-colors",
        isSelected && "bg-blue-50 border-l-2 border-blue-500",
        isFocused && "ring-2 ring-blue-400 ring-inset",
        error && "bg-red-50"
      )}
      style={{ paddingLeft: `${level * 20 + 8}px` }}
      onClick={onClick}
      role="treeitem"
      aria-expanded={node.hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-level={level + 1}
      tabIndex={isFocused ? 0 : -1}
    >
      {/* Multi-select checkbox */}
      {isMultiSelectMode && (
        <Checkbox
          checked={isMultiSelected}
          onCheckedChange={() => {
            useCascadeStore.getState().toggleNodeSelection(node.id);
          }}
          className="mr-2"
          aria-label={`Select ${node.label}`}
        />
      )}
      
      {/* Expand/collapse button */}
      {node.hasChildren ? (
        <button
          className="p-0.5 hover:bg-gray-200 rounded transition-colors"
          onClick={onToggle}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
      ) : (
        <div className="w-4" />
      )}
      
      {/* Icon */}
      <div className="mx-2">
        {getIcon()}
      </div>
      
      {/* Label */}
      <span className={cn(
        "flex-1 text-sm truncate",
        isSelected && "font-medium",
        error && "text-red-700"
      )}>
        {node.label}
      </span>
      
      {/* Error message */}
      {error && (
        <span className="text-xs text-red-600 mr-2" role="alert">
          {error}
        </span>
      )}
      
      {/* Progress indicator */}
      {renderProgress()}
    </div>
  );
});

TreeNode.displayName = 'TreeNode';