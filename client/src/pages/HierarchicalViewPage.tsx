import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, BookOpen, Layers, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { useLongRangePlans } from '../hooks/useLongRangePlans';
import { useUnitPlans } from '../hooks/useUnitPlans';
import { useLessonPlans } from '../hooks/useLessonPlans';
import { useCurriculumExpectations } from '../hooks/useCurriculumExpectations';
import type { LongRangePlan, UnitPlan, CurriculumExpectation } from '../types';
import type { LongRangePlanWithRelations } from '../hooks/useLongRangePlans';
import type { UnitPlanWithRelations } from '../hooks/useUnitPlans';
import type { ETFOLessonPlanWithRelations } from '../hooks/useLessonPlans';

interface HierarchyNode {
  id: string;
  type: 'lrp' | 'unit' | 'lesson';
  title: string;
  titleFr?: string;
  subject?: string;
  isExpanded: boolean;
  coverage?: {
    total: number;
    covered: number;
    percentage: number;
  };
  children?: HierarchyNode[];
  data?: any;
}

// Subject colors matching WeekViewPage
const SUBJECT_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-50 border-blue-300',
  'Mathématiques': 'bg-green-50 border-green-300',
  'Sciences de la nature': 'bg-purple-50 border-purple-300',
  'Arts visuels': 'bg-orange-50 border-orange-300',
  'Sciences humaines': 'bg-cyan-50 border-cyan-300',
  'Formation personnelle et sociale': 'bg-pink-50 border-pink-300'
};

const SUBJECT_BADGE_COLORS: Record<string, string> = {
  'Français (Immersion)': 'bg-blue-100 text-blue-800',
  'Mathématiques': 'bg-green-100 text-green-800',
  'Sciences de la nature': 'bg-purple-100 text-purple-800',
  'Arts visuels': 'bg-orange-100 text-orange-800',
  'Sciences humaines': 'bg-cyan-100 text-cyan-800',
  'Formation personnelle et sociale': 'bg-pink-100 text-pink-800'
};

export function HierarchicalViewPage() {
  const { longRangePlans, loading: lrpLoading } = useLongRangePlans();
  const { unitPlans, loading: unitLoading } = useUnitPlans();
  const { lessonPlans, loading: lessonLoading } = useLessonPlans();
  const { expectations, loading: expectationsLoading } = useCurriculumExpectations();
  
  const [hierarchyTree, setHierarchyTree] = useState<HierarchyNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [coverageStats, setCoverageStats] = useState({
    totalExpectations: 0,
    coveredExpectations: 0,
    coveragePercentage: 0
  });

  // Build the hierarchical tree structure
  useEffect(() => {
    if (!lrpLoading && !unitLoading && !lessonLoading && !expectationsLoading) {
      buildHierarchy();
      calculateGlobalCoverage();
    }
  }, [longRangePlans, unitPlans, lessonPlans, expectations, lrpLoading, unitLoading, lessonLoading, expectationsLoading]);

  const buildHierarchy = () => {
    const tree: HierarchyNode[] = [];
    
    // Build LRP level
    longRangePlans?.forEach((lrp: LongRangePlanWithRelations) => {
      const lrpNode: HierarchyNode = {
        id: `lrp-${lrp.id}`,
        type: 'lrp',
        title: lrp.title || 'Untitled LRP',
        titleFr: lrp.titleFr,
        subject: lrp.subject,
        isExpanded: false,
        children: [],
        data: lrp
      };
      
      // Add units for this LRP
      const lrpUnits = unitPlans?.filter((unit: UnitPlanWithRelations) => unit.longRangePlanId === lrp.id) || [];
      lrpNode.children = lrpUnits.map((unit: UnitPlanWithRelations) => {
        const unitNode: HierarchyNode = {
          id: `unit-${unit.id}`,
          type: 'unit',
          title: unit.title || 'Untitled Unit',
          titleFr: unit.titleFr,
          isExpanded: false,
          children: [],
          data: unit
        };
        
        // Add lessons for this unit
        const unitLessons = lessonPlans?.filter((lesson: ETFOLessonPlanWithRelations) => lesson.unitPlanId === unit.id) || [];
        unitNode.children = unitLessons.map((lesson: ETFOLessonPlanWithRelations) => ({
          id: `lesson-${lesson.id}`,
          type: 'lesson',
          title: lesson.title || 'Untitled Lesson',
          titleFr: lesson.titleFr,
          isExpanded: false,
          data: lesson
        }));
        
        // Calculate unit coverage
        unitNode.coverage = calculateUnitCoverage(unit, unitLessons);
        
        return unitNode;
      });
      
      // Calculate LRP coverage
      lrpNode.coverage = calculateLRPCoverage(lrp, lrpNode.children || []);
      
      tree.push(lrpNode);
    });
    
    setHierarchyTree(tree);
  };

  const calculateUnitCoverage = (unit: UnitPlanWithRelations, lessons: ETFOLessonPlanWithRelations[]) => {
    const unitExpectations = new Set<string>();
    const coveredExpectations = new Set<string>();
    
    // Get all expectations for this unit's subject
    const subject = (unit as any).longRangePlan?.subject;
    if (subject) {
      expectations?.forEach((exp: CurriculumExpectation) => {
        if (exp.subject === subject) {
          unitExpectations.add(exp.code);
        }
      });
    }
    
    // Check which expectations are covered by lessons
    lessons.forEach((lesson: ETFOLessonPlanWithRelations) => {
      lesson.expectations?.forEach((exp: any) => {
        if (unitExpectations.has(exp.code)) {
          coveredExpectations.add(exp.code);
        }
      });
    });
    
    return {
      total: unitExpectations.size,
      covered: coveredExpectations.size,
      percentage: unitExpectations.size > 0 
        ? Math.round((coveredExpectations.size / unitExpectations.size) * 100)
        : 0
    };
  };

  const calculateLRPCoverage = (lrp: LongRangePlanWithRelations, units: HierarchyNode[]) => {
    const lrpExpectations = new Set<string>();
    const coveredExpectations = new Set<string>();
    
    // Get all expectations for this LRP's subject
    expectations?.forEach(exp => {
      if (exp.subject === lrp.subject) {
        lrpExpectations.add(exp.code);
      }
    });
    
    // Aggregate coverage from all units
    units.forEach(unit => {
      if (unit.coverage) {
        // This is simplified - in reality we'd track specific expectations
        const unitCoveredCount = unit.coverage.covered;
        // Add to covered set (simplified for demo)
        for (let i = 0; i < unitCoveredCount; i++) {
          coveredExpectations.add(`${unit.id}-${i}`);
        }
      }
    });
    
    return {
      total: lrpExpectations.size,
      covered: Math.min(coveredExpectations.size, lrpExpectations.size),
      percentage: lrpExpectations.size > 0 
        ? Math.round((Math.min(coveredExpectations.size, lrpExpectations.size) / lrpExpectations.size) * 100)
        : 0
    };
  };

  const calculateGlobalCoverage = () => {
    const allExpectations = new Set<string>();
    const coveredExpectations = new Set<string>();
    
    expectations?.forEach(exp => {
      allExpectations.add(exp.code);
    });
    
    lessonPlans?.forEach((lesson: ETFOLessonPlanWithRelations) => {
      lesson.expectations?.forEach((exp: any) => {
        if (allExpectations.has(exp.code)) {
          coveredExpectations.add(exp.code);
        }
      });
    });
    
    setCoverageStats({
      totalExpectations: allExpectations.size,
      coveredExpectations: coveredExpectations.size,
      coveragePercentage: allExpectations.size > 0 
        ? Math.round((coveredExpectations.size / allExpectations.size) * 100)
        : 0
    });
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNode = (node: HierarchyNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;
    
    const bgColor = node.type === 'lrp' && node.subject 
      ? SUBJECT_COLORS[node.subject] || 'bg-gray-50'
      : 'bg-white';
    
    const badgeColor = node.type === 'lrp' && node.subject
      ? SUBJECT_BADGE_COLORS[node.subject] || 'bg-gray-100 text-gray-800'
      : '';

    return (
      <div key={node.id} className={`ml-${level * 4}`}>
        <div
          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
            bgColor
          } ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          } hover:shadow-md`}
          onClick={() => {
            if (hasChildren) toggleNode(node.id);
            setSelectedNode(node);
          }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <button className="p-1">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          {/* Node Icon */}
          {node.type === 'lrp' && <BookOpen className="w-5 h-5 text-blue-600" />}
          {node.type === 'unit' && <Layers className="w-5 h-5 text-green-600" />}
          {node.type === 'lesson' && <Target className="w-5 h-5 text-purple-600" />}
          
          {/* Title */}
          <div className="flex-1">
            <div className="font-semibold">
              {node.titleFr || node.title}
            </div>
            {node.titleFr && node.title !== node.titleFr && (
              <div className="text-sm text-gray-600">{node.title}</div>
            )}
          </div>
          
          {/* Subject Badge for LRP */}
          {node.type === 'lrp' && node.subject && (
            <span className={`px-2 py-1 text-xs rounded-full ${badgeColor}`}>
              {node.subject}
            </span>
          )}
          
          {/* Coverage Indicator */}
          {node.coverage && (
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">
                {node.coverage.percentage}%
              </div>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    node.coverage.percentage >= 80 ? 'bg-green-500' :
                    node.coverage.percentage >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${node.coverage.percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">
                {node.coverage.covered}/{node.coverage.total}
              </div>
            </div>
          )}
          
          {/* Lesson Count for Units */}
          {node.type === 'unit' && node.children && (
            <span className="text-sm text-gray-600">
              {node.children.length} lessons
            </span>
          )}
        </div>
        
        {/* Render Children */}
        {isExpanded && hasChildren && (
          <div className="ml-4 mt-2 space-y-2">
            {node.children?.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const loading = lrpLoading || unitLoading || lessonLoading || expectationsLoading;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Hierarchical Planning Structure
        </h1>
        <p className="text-gray-600">
          Visualize how Long Range Plans lead to Unit Plans and Lessons, tracking curriculum coverage
        </p>
      </div>
      
      {/* Global Coverage Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Overall Curriculum Coverage</h2>
            <p className="text-gray-600">
              Tracking {coverageStats.totalExpectations} curriculum expectations across all subjects
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {coverageStats.coveragePercentage}%
            </div>
            <div className="text-sm text-gray-600">
              {coverageStats.coveredExpectations} of {coverageStats.totalExpectations} covered
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                coverageStats.coveragePercentage >= 80 ? 'bg-green-500' :
                coverageStats.coveragePercentage >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${coverageStats.coveragePercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{longRangePlans?.length || 0}</div>
              <div className="text-sm text-gray-600">Long Range Plans</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{unitPlans?.length || 0}</div>
              <div className="text-sm text-gray-600">Unit Plans</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold">{lessonPlans?.length || 0}</div>
              <div className="text-sm text-gray-600">Lessons</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tree View */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Planning Hierarchy</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setExpandedNodes(new Set(hierarchyTree.map(n => n.id)))}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Expand All LRPs
            </button>
            <button
              onClick={() => setExpandedNodes(new Set())}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Collapse All
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-600">Loading hierarchical structure...</div>
          </div>
        ) : (
          <div className="space-y-3">
            {hierarchyTree.map(node => renderNode(node))}
          </div>
        )}
      </div>
      
      {/* Selected Node Details */}
      {selectedNode && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedNode.type === 'lrp' && 'Long Range Plan Details'}
            {selectedNode.type === 'unit' && 'Unit Plan Details'}
            {selectedNode.type === 'lesson' && 'Lesson Details'}
          </h3>
          
          <div className="space-y-3">
            <div>
              <span className="font-medium">Title:</span> {selectedNode.titleFr || selectedNode.title}
            </div>
            
            {selectedNode.data?.description && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-gray-600">{selectedNode.data.descriptionFr || selectedNode.data.description}</p>
              </div>
            )}
            
            {selectedNode.data?.overarchingQuestions && (
              <div>
                <span className="font-medium">Overarching Questions:</span>
                <p className="mt-1 text-gray-600">{selectedNode.data.overarchingQuestions}</p>
              </div>
            )}
            
            {selectedNode.data?.themes && (
              <div>
                <span className="font-medium">Themes:</span>
                <p className="mt-1 text-gray-600">{selectedNode.data.themes}</p>
              </div>
            )}
            
            {selectedNode.type === 'lesson' && selectedNode.data?.expectations && (
              <div>
                <span className="font-medium">Curriculum Expectations:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedNode.data.expectations.map((exp: any) => (
                    <span key={exp.code} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {exp.code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}