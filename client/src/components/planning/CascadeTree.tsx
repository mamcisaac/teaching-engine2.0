/**
 * CascadeTree Component
 * Interactive tree visualization of planning hierarchy
 */

import { ChevronRight, ChevronDown, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import React, { useState, useCallback, useMemo } from 'react';

import type { CascadeNode, CascadeViewOptions, PanicLevel } from '../../types/planningCascade';
import { calculateNodeStatistics } from '../../utils/planningCascade';

interface CascadeTreeProps {
  node: CascadeNode;
  options?: CascadeViewOptions;
  onNodeClick?: (node: CascadeNode) => void;
  onStatusChange?: (nodeId: string, status: CascadeNode['status']) => void;
  level?: number;
}

export const CascadeTree: React.FC<CascadeTreeProps> = ({
  node,
  options = {
    collapsed: new Set(),
    showCompleted: true,
    showBlocked: true,
    highlightOverdue: true,
    view: 'tree'
  },
  onNodeClick,
  onStatusChange,
  level = 0
}) => {
  const [localCollapsed, setLocalCollapsed] = useState<Set<string>>(options.collapsed);

  const toggleCollapse = useCallback((nodeId: string) => {
    setLocalCollapsed(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const isCollapsed = localCollapsed.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  // Calculate node statistics
  const stats = useMemo(() => calculateNodeStatistics(node), [node]);

  // Determine if node should be shown based on options
  const shouldShow = useMemo(() => {
    if (!options.showCompleted && node.status === 'completed') return false;
    if (!options.showBlocked && node.status === 'blocked') return false;
    return true;
  }, [node.status, options.showCompleted, options.showBlocked]);

  // Check if node is overdue
  const isOverdue = useMemo(() => {
    if (!options.highlightOverdue) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nodeEnd = new Date(node.endDate);
    nodeEnd.setHours(0, 0, 0, 0);
    return nodeEnd < today && node.status !== 'completed';
  }, [node.endDate, node.status, options.highlightOverdue]);

  // Get panic level from metadata
  const panicLevel = (node.metadata?.panicLevel as PanicLevel) || 'calm';

  // Get status icon
  const getStatusIcon = () => {
    switch (node.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'blocked':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        if (isOverdue) {
          return <AlertCircle className="w-4 h-4 text-orange-500" />;
        }
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get panic indicator
  const getPanicIndicator = () => {
    switch (panicLevel) {
      case 'extreme':
        return <span className="ml-2 px-2 py-0.5 text-xs bg-red-600 text-white rounded">URGENT</span>;
      case 'high':
        return <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded">HIGH</span>;
      case 'moderate':
        return <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded">MODERATE</span>;
      case 'mild':
        return <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-500 text-white rounded">MILD</span>;
      default:
        return null;
    }
  };

  // Get node style based on type
  const getNodeStyle = () => {
    const baseStyle = "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors";
    let bgColor = "";
    
    switch (node.type) {
      case 'year':
        bgColor = level === 0 ? "bg-blue-50 hover:bg-blue-100" : "bg-indigo-50 hover:bg-indigo-100";
        break;
      case 'term':
        bgColor = "bg-purple-50 hover:bg-purple-100";
        break;
      case 'unit':
        bgColor = "bg-green-50 hover:bg-green-100";
        break;
      case 'week':
        bgColor = "bg-yellow-50 hover:bg-yellow-100";
        break;
      case 'lesson':
        bgColor = node.status === 'completed' ? "bg-gray-50 hover:bg-gray-100" :
                  node.status === 'blocked' ? "bg-red-50 hover:bg-red-100" :
                  isOverdue ? "bg-orange-50 hover:bg-orange-100" :
                  "bg-white hover:bg-gray-50";
        break;
      default:
        bgColor = "bg-gray-50 hover:bg-gray-100";
    }

    return `${baseStyle} ${bgColor} ${isOverdue ? 'border-l-4 border-orange-500' : ''}`;
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={`cascade-node ${level > 0 ? 'ml-4' : ''}`}>
      <div className={getNodeStyle()}>
        {/* Expand/Collapse toggle */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(node.id);
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
        
        {/* Status icon */}
        {getStatusIcon()}
        
        {/* Node content */}
        <div
          className="flex-1 flex items-center justify-between"
          onClick={() => onNodeClick?.(node)}
        >
          <div className="flex items-center">
            <span className="font-medium">{node.name}</span>
            {node.description && (
              <span className="ml-2 text-sm text-gray-600">({node.description})</span>
            )}
            {getPanicIndicator()}
          </div>
          
          {/* Progress and stats */}
          <div className="flex items-center gap-4 text-sm">
            {node.type !== 'lesson' && (
              <>
                <span className="text-gray-500">
                  {stats.completedItems}/{stats.totalItems} lessons
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${node.completionPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{node.completionPercentage}%</span>
                </div>
              </>
            )}
            
            {/* Date range for non-lesson nodes */}
            {node.type !== 'lesson' && (
              <span className="text-xs text-gray-500">
                {new Date(node.startDate).toLocaleDateString()} - {new Date(node.endDate).toLocaleDateString()}
              </span>
            )}
            
            {/* Date and time for lessons */}
            {node.type === 'lesson' && (
              <span className="text-xs text-gray-500">
                {new Date(node.startDate).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Status change dropdown for lessons */}
        {node.type === 'lesson' && onStatusChange && (
          <select
            value={node.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(node.id, e.target.value as CascadeNode['status']);
            }}
            onClick={(e) => e.stopPropagation()}
            className="ml-2 px-2 py-1 text-sm border rounded"
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        )}
      </div>
      
      {/* Render children */}
      {hasChildren && !isCollapsed && (
        <div className="mt-1">
          {node.children!.map(child => (
            <CascadeTree
              key={child.id}
              node={child}
              options={{ ...options, collapsed: localCollapsed }}
              onNodeClick={onNodeClick}
              onStatusChange={onStatusChange}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Virtualized version for large trees
export const VirtualizedCascadeTree: React.FC<CascadeTreeProps> = (props) => {
  // For now, just use the regular tree
  // In a production app, would implement virtualization with react-window
  return <CascadeTree {...props} />;
};