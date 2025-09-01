import React from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Target, 
  Layers, 
  FileText, 
  Calendar,
  CheckCircle,
  Circle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { PlanningCascadeData } from '../../hooks/usePlanningCascade';
import type { CascadeSelection, TreeNode } from './types';

interface CascadeTreeViewProps {
  data: PlanningCascadeData;
  expandedNodes: Set<string>;
  selectedNode: CascadeSelection | null;
  onNodeExpand: (nodeId: string) => void;
  onNodeSelect: (selection: CascadeSelection) => void;
}

export function CascadeTreeView({
  data,
  expandedNodes,
  selectedNode,
  onNodeExpand,
  onNodeSelect,
}: CascadeTreeViewProps): JSX.Element {
  const getIcon = (type: string, isCompleted?: boolean) => {
    const iconClass = "h-4 w-4 mr-2 flex-shrink-0";
    
    switch (type) {
      case 'curriculum':
        return <Target className={iconClass} />;
      case 'lrp':
        return <BookOpen className={iconClass} />;
      case 'unit':
        return <Layers className={iconClass} />;
      case 'lesson':
        return isCompleted ? 
          <CheckCircle className={cn(iconClass, "text-green-600")} /> : 
          <Circle className={cn(iconClass, "text-gray-400")} />;
      case 'daybook':
        return <FileText className={iconClass} />;
      default:
        return <Calendar className={iconClass} />;
    }
  };

  const renderProgressBar = (completed: number, total: number) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {completed}/{total}
        </span>
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-600 font-medium">
          {percentage}%
        </span>
      </div>
    );
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.hasChildren && node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer transition-colors",
            isSelected && "bg-blue-50 border-l-2 border-blue-500",
            level > 0 && "border-l border-gray-200"
          )}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              onNodeExpand(node.id);
            }
            onNodeSelect({
              type: node.type,
              id: node.id,
              data: node.data,
            });
          }}
        >
          {hasChildren && (
            <button
              className="p-0.5 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onNodeExpand(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          {getIcon(node.type, node.type === 'lesson' && node.data?.daybookEntry)}
          
          <span className={cn(
            "flex-1 text-sm truncate",
            isSelected && "font-medium"
          )}>
            {node.label}
          </span>
          
          {node.progress && (
            renderProgressBar(node.progress.completed, node.progress.total)
          )}
        </div>
        
        {isExpanded && node.children && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Build tree structure from data
  const buildTreeNodes = (): TreeNode[] => {
    const nodes: TreeNode[] = [];

    // Add curriculum expectations as root level if available
    if (data.curriculum && data.curriculum.expectations.length > 0) {
      const curriculumNode: TreeNode = {
        id: 'curriculum-root',
        label: `Curriculum Expectations (${data.curriculum.covered}/${data.curriculum.total})`,
        type: 'curriculum',
        data: data.curriculum,
        hasChildren: true,
        progress: {
          completed: data.curriculum.covered,
          total: data.curriculum.total,
        },
        children: data.curriculum.expectations.map(exp => ({
          id: exp.id,
          label: `${exp.code}: ${exp.description}`,
          type: 'curriculum',
          data: exp,
          hasChildren: false,
        })),
      };
      nodes.push(curriculumNode);
    }

    // Add long range plans
    data.longRangePlans.forEach(lrp => {
      const lrpNode: TreeNode = {
        id: lrp.id,
        label: lrp.title,
        type: 'lrp',
        data: lrp,
        hasChildren: lrp.unitPlans && lrp.unitPlans.length > 0,
        progress: lrp.progress ? {
          completed: lrp.progress.completedLessons,
          total: lrp.progress.totalLessons,
        } : undefined,
        children: [],
      };

      // Add unit plans as children
      if (lrp.unitPlans) {
        lrpNode.children = lrp.unitPlans.map(unit => {
          const unitNode: TreeNode = {
            id: unit.id,
            label: unit.title,
            type: 'unit',
            data: unit,
            hasChildren: unit.lessonPlans && unit.lessonPlans.length > 0,
            progress: unit.progress ? {
              completed: unit.progress.completedLessons || 0,
              total: unit.progress.totalLessons || 0,
            } : undefined,
            children: [],
          };

          // Add lesson plans as children
          if (unit.lessonPlans) {
            unitNode.children = unit.lessonPlans.map(lesson => ({
              id: lesson.id,
              label: lesson.title,
              type: 'lesson',
              data: lesson,
              hasChildren: false,
            }));
          }

          return unitNode;
        });
      }

      nodes.push(lrpNode);
    });

    return nodes;
  };

  const treeNodes = buildTreeNodes();

  return (
    <div className="py-2">
      {treeNodes.length > 0 ? (
        treeNodes.map(node => renderTreeNode(node))
      ) : (
        <div className="p-4 text-center text-gray-500">
          No planning data available
        </div>
      )}
    </div>
  );
}