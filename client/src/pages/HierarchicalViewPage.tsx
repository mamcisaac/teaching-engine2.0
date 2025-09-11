import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, BookOpen, Layers, Target, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useLongRangePlans } from '../hooks/useLongRangePlans';
import { useUnitPlans } from '../hooks/useUnitPlans';
import { useAllLessonPlans } from '../hooks/useAllLessonPlans';
import { useCurriculumExpectations } from '../hooks/useCurriculumExpectations';
import { useCoverageCalculation } from '../hooks/useCoverageCalculation';
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
  const navigate = useNavigate();
  const { longRangePlans, loading: lrpLoading } = useLongRangePlans();
  const { unitPlans, loading: unitLoading } = useUnitPlans();
  const { lessonPlans, loading: lessonLoading } = useAllLessonPlans(); // Use ALL lessons for hierarchy
  const { expectations, loading: expectationsLoading } = useCurriculumExpectations();
  
  const [hierarchyTree, setHierarchyTree] = useState<HierarchyNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  
  // Use shared coverage calculation
  const coverage = useCoverageCalculation(longRangePlans, expectations, lessonPlans);

  // Build the hierarchical tree structure
  useEffect(() => {
    if (!lrpLoading && !unitLoading && !lessonLoading && !expectationsLoading) {
      buildHierarchy();
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
      
      // Add units for this LRP - sort by startDate and add numbering
      const lrpUnits = unitPlans?.filter((unit: UnitPlanWithRelations) => unit.longRangePlanId === lrp.id) || [];
      const sortedUnits = [...lrpUnits].sort((a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return dateA - dateB;
      });
      
      lrpNode.children = sortedUnits.map((unit: UnitPlanWithRelations, index: number) => {
        const unitNode: HierarchyNode = {
          id: `unit-${unit.id}`,
          type: 'unit',
          title: unit.title || 'Untitled Unit',
          titleFr: unit.titleFr,
          isExpanded: false,
          children: [],
          data: unit,
          unitNumber: index + 1 // Add unit number for display
        } as HierarchyNode & { unitNumber: number };
        
        // Add lessons for this unit (now we have ALL lessons loaded)
        const unitLessons = lessonPlans?.filter((lesson: ETFOLessonPlanWithRelations) => lesson.unitPlanId === unit.id) || [];
        // Sort lessons by lessonNumber
        const sortedLessons = [...unitLessons].sort((a, b) => {
          const numA = a.lessonNumber || 999;
          const numB = b.lessonNumber || 999;
          return numA - numB;
        });
        
        // Store unit expectations for lesson coloring
        const unitExpectationCodes = new Set<string>();
        if (unit.expectations) {
          unit.expectations.forEach((exp: any) => {
            const code = exp.expectation?.code || exp.code;
            if (code) unitExpectationCodes.add(code);
          });
        }
        
        unitNode.children = sortedLessons.map((lesson: ETFOLessonPlanWithRelations) => ({
          id: `lesson-${lesson.id}`,
          type: 'lesson',
          title: lesson.title || 'Untitled Lesson',
          titleFr: lesson.titleFr,
          isExpanded: false,
          data: lesson,
          unitExpectations: unitExpectationCodes // Pass unit expectations to lesson for coloring
        } as HierarchyNode & { unitExpectations: Set<string> }));
        
        // Use actual loaded lesson count (should match _count now that we load all)
        (unitNode as any).totalLessonCount = unitLessons.length;
        
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
    // Get unit's directly linked expectations
    const unitDirectExpectations = new Set<string>();
    if (unit.expectations) {
      unit.expectations.forEach((exp: any) => {
        const code = exp.expectation?.code || exp.code;
        if (code) unitDirectExpectations.add(code);
      });
    }
    
    // Get all expectations for this unit's subject (for total count)
    const subjectExpectations = new Set<string>();
    const subject = (unit as any).longRangePlan?.subject;
    if (subject) {
      expectations?.forEach((exp: CurriculumExpectation) => {
        if (exp.subject === subject) {
          subjectExpectations.add(exp.code);
        }
      });
    }
    
    return {
      covered: unitDirectExpectations.size,  // Unit's directly linked expectations
      total: subjectExpectations.size,       // Total subject expectations
      percentage: subjectExpectations.size > 0 
        ? Math.round((unitDirectExpectations.size / subjectExpectations.size) * 100)
        : 0,
      unitExpectations: unitDirectExpectations // Store for lesson coloring
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
    
    // Get all lessons from all units in this LRP
    const lrpLessons: ETFOLessonPlanWithRelations[] = [];
    units.forEach(unit => {
      if (unit.children) {
        unit.children.forEach(child => {
          if (child.type === 'lesson' && child.data) {
            lrpLessons.push(child.data);
          }
        });
      }
    });
    
    // Check which expectations are actually covered by lessons
    lrpLessons.forEach(lesson => {
      lesson.expectations?.forEach((exp: any) => {
        const code = exp.expectation?.code || exp.code;
        if (code && lrpExpectations.has(code)) {
          coveredExpectations.add(code);
        }
      });
    });
    
    return {
      total: lrpExpectations.size,
      covered: coveredExpectations.size,
      percentage: lrpExpectations.size > 0 
        ? Math.round((coveredExpectations.size / lrpExpectations.size) * 100)
        : 0
    };
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
    
    // Determine background color based on node type
    let bgColor = 'bg-white';
    if (node.type === 'lrp' && node.subject) {
      bgColor = SUBJECT_COLORS[node.subject] || 'bg-gray-50';
    } else if (node.type === 'lesson' && node.data) {
      // Color-code lessons by type
      const lessonType = node.data.lessonType || 'core';
      bgColor = lessonType === 'core' ? 'bg-green-50' : 'bg-blue-50';
    }
    
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
            // Navigate to lesson detail page when clicking on a lesson
            if (node.type === 'lesson' && node.data?.id) {
              navigate(`/planner/lessons/${node.data.id}`);
            }
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
          {node.type === 'lesson' && (
            <Target className={`w-5 h-5 ${
              node.data?.lessonType === 'extension' ? 'text-blue-600' : 'text-green-600'
            }`} />
          )}
          
          {/* Title with numbering */}
          <div className="flex-1">
            <div className="font-semibold flex items-center gap-2">
              {node.type === 'unit' && (node as any).unitNumber && (
                <span>Unit {(node as any).unitNumber}:</span>
              )}
              {node.type === 'lesson' && node.data?.lessonNumber && (
                <span>Lesson {node.data.lessonNumber}:</span>
              )}
              <span>{node.titleFr || node.title}</span>
              
              {/* Date display */}
              {node.type === 'lesson' && node.data?.date && (
                <span className="text-sm font-normal text-gray-600">
                  | {(() => {
                    const date = new Date(node.data.date);
                    return date.getFullYear() > 2026 
                      ? <span className="text-orange-600">Not scheduled</span>
                      : format(date, 'MMM d');
                  })()}
                </span>
              )}
              
              {/* Unit date range */}
              {node.type === 'unit' && node.data && (
                <span className="text-sm font-normal text-gray-600">
                  | {node.data.startDate && node.data.endDate 
                    ? `${format(new Date(node.data.startDate), 'MMM d')} - ${format(new Date(node.data.endDate), 'MMM d')}`
                    : 'Dates TBD'}
                </span>
              )}
              
              {/* Expectation badges for lessons - colored by primary/secondary */}
              {node.type === 'lesson' && node.data?.expectations && node.data.expectations.length > 0 && (
                <span className="flex gap-1">
                  | {node.data.expectations.map((exp: any, idx: number) => {
                    const code = exp.expectation?.code || exp.code;
                    if (!code) return null;
                    
                    // Check if this expectation is primary (linked to unit) or secondary
                    const unitExpectations = (node as any).unitExpectations as Set<string> | undefined;
                    const isPrimary = unitExpectations?.has(code);
                    
                    return (
                      <span 
                        key={idx} 
                        className={`px-1.5 py-0.5 text-xs rounded ${
                          isPrimary 
                            ? 'bg-purple-100 text-purple-700' // Primary expectations in purple
                            : 'bg-gray-100 text-gray-600'      // Secondary expectations in gray
                        }`}
                        title={isPrimary ? 'Primary unit expectation' : 'Secondary expectation'}
                      >
                        {code}
                      </span>
                    );
                  })}
                </span>
              )}
              
              {/* Expectation badges for units */}
              {node.type === 'unit' && node.data?.expectations && node.data.expectations.length > 0 && (
                <span className="flex gap-1">
                  | {(() => {
                    const uniqueCodes = new Set<string>();
                    node.data.expectations.forEach((exp: any) => {
                      const code = exp.expectation?.code || exp.code;
                      if (code) uniqueCodes.add(code);
                    });
                    const codesArray = Array.from(uniqueCodes);
                    const displayLimit = 3; // Show only 3 expectations to keep it concise
                    return (
                      <>
                        {codesArray.slice(0, displayLimit).map((code, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                            {code}
                          </span>
                        ))}
                        {codesArray.length > displayLimit && (
                          <span className="text-xs text-gray-500">+{codesArray.length - displayLimit}</span>
                        )}
                      </>
                    );
                  })()}
                </span>
              )}
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
          
          {/* Coverage Indicator - only show fraction for units */}
          {node.type === 'unit' && node.coverage && (
            <div className="text-sm text-gray-600">
              {node.coverage.covered}/{node.coverage.total}
            </div>
          )}
          
          {/* LRP still shows percentage and bar */}
          {node.type === 'lrp' && node.coverage && (
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
          {node.type === 'unit' && (
            <span className="text-sm text-gray-600">
              {(node as any).totalLessonCount || node.children?.length || 0} lessons
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
      {/* Back to Dashboard Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-4 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

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
              Tracking {coverage.totalExpectations} curriculum expectations across all subjects
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {coverage.coveragePercentage}%
            </div>
            <div className="text-sm text-gray-600">
              {coverage.coveredExpectations} of {coverage.totalExpectations} covered
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                coverage.coveragePercentage >= 80 ? 'bg-green-500' :
                coverage.coveragePercentage >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${coverage.coveragePercentage}%` }}
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
                <p className="mt-1 text-gray-600">
                  {typeof selectedNode.data.overarchingQuestions === 'string' 
                    ? selectedNode.data.overarchingQuestions 
                    : JSON.stringify(selectedNode.data.overarchingQuestions, null, 2)}
                </p>
              </div>
            )}
            
            {selectedNode.data?.themes && (
              <div>
                <span className="font-medium">Themes:</span>
                <p className="mt-1 text-gray-600">
                  {typeof selectedNode.data.themes === 'string' 
                    ? selectedNode.data.themes 
                    : JSON.stringify(selectedNode.data.themes, null, 2)}
                </p>
              </div>
            )}
            
            {selectedNode.type === 'lesson' && selectedNode.data?.expectations && selectedNode.data.expectations.length > 0 && (
              <div>
                <span className="font-medium">Curriculum Expectations:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedNode.data.expectations.map((exp: any, index: number) => {
                    const code = exp.expectation?.code || exp.code;
                    return code ? (
                      <span key={code || index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {code}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}