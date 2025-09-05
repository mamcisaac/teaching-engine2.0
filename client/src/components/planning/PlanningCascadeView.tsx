/**
 * PlanningCascadeView Component
 * Main component for hierarchical curriculum planning
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  TreePine, 
  BarChart3, 
  Calendar, 
  List, 
  Filter, 
  RefreshCw, 
  Download, 
  Upload,
  AlertCircle,
  Search,
  Settings
} from 'lucide-react';
import { CascadeTree } from './CascadeTree';
import { YearAtGlanceView } from './YearAtGlanceView';
import { usePlanningCascade } from '../../hooks/usePlanningCascade';
import { 
  buildCascadeTree, 
  filterCascade,
  findLessonPanicking,
  getUpcomingLessons
} from '../../utils/planningCascade';
import type { 
  CascadeNode, 
  CascadeFilter, 
  CascadeViewOptions,
  LessonPlan 
} from '../../types/planningCascade';

interface PlanningCascadeViewProps {
  year?: string;
  grade?: number;
  defaultView?: 'tree' | 'glance' | 'calendar' | 'list';
}

export const PlanningCascadeView: React.FC<PlanningCascadeViewProps> = ({
  year = new Date().getFullYear().toString(),
  grade = 1,
  defaultView = 'glance'
}) => {
  // State
  const [currentView, setCurrentView] = useState<'tree' | 'glance' | 'calendar' | 'list'>(defaultView);
  const [selectedNode, setSelectedNode] = useState<CascadeNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewOptions, setViewOptions] = useState<CascadeViewOptions>({
    collapsed: new Set(),
    showCompleted: true,
    showBlocked: true,
    highlightOverdue: true,
    view: 'tree'
  });

  // Fetch data using React Query
  const {
    yearPlan,
    statistics,
    upcomingLessons,
    isLoading,
    error,
    validateCurriculum,
    updateLessonStatus,
    rescheduleLesson,
    refetchYearPlan,
    refetchStatistics
  } = usePlanningCascade(year, grade, {
    subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined
  });

  // Build cascade tree from year plan
  const cascadeTree = useMemo(() => {
    if (!yearPlan) return null;
    return buildCascadeTree(yearPlan);
  }, [yearPlan]);

  // Apply filters to cascade tree
  const filteredTree = useMemo(() => {
    if (!cascadeTree) return null;
    
    const filter: CascadeFilter = {
      subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      searchTerm: searchTerm || undefined
    };
    
    return filterCascade(cascadeTree, filter) || cascadeTree;
  }, [cascadeTree, selectedSubjects, searchTerm]);

  // Get unique subjects from year plan
  const availableSubjects = useMemo(() => {
    if (!yearPlan) return [];
    return yearPlan.subjects.map(s => s.subject);
  }, [yearPlan]);

  // Handle node click
  const handleNodeClick = useCallback((node: CascadeNode) => {
    setSelectedNode(node);
    // Could open a detail panel or navigate to lesson detail
  }, []);

  // Handle status change
  const handleStatusChange = useCallback(async (nodeId: string, status: CascadeNode['status']) => {
    // Map cascade status to lesson status
    const lessonStatus = status === 'completed' ? 'taught' : 
                        status === 'blocked' ? 'skipped' :
                        'planned';
    
    await updateLessonStatus.mutateAsync({
      lessonId: nodeId,
      status: lessonStatus
    });
  }, [updateLessonStatus]);

  // Handle validation
  const handleValidate = useCallback(async () => {
    const result = await validateCurriculum.mutateAsync({ grade, year });
    if (result.errors.length > 0) {
      console.error('Validation errors:', result.errors);
    }
  }, [validateCurriculum, grade, year]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetchYearPlan(),
      refetchStatistics()
    ]);
  }, [refetchYearPlan, refetchStatistics]);

  // Toggle subject filter
  const toggleSubjectFilter = useCallback((subject: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      }
      return [...prev, subject];
    });
  }, []);

  // Get panic status for header
  const panicStatus = useMemo(() => {
    if (!yearPlan) return null;
    
    const allLessons: LessonPlan[] = [];
    for (const subject of yearPlan.subjects) {
      for (const term of subject.terms) {
        for (const unit of term.units) {
          for (const week of unit.weeks) {
            allLessons.push(...week.lessons);
          }
        }
      }
    }
    
    return findLessonPanicking(allLessons);
  }, [yearPlan]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading planning data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load planning data</span>
        </div>
      </div>
    );
  }

  return (
    <div className="planning-cascade-view">
      {/* Header with panic indicator */}
      {panicStatus && panicStatus.level !== 'calm' && (
        <div className={`mb-4 p-4 rounded-lg ${
          panicStatus.level === 'extreme' ? 'bg-red-100 border border-red-500' :
          panicStatus.level === 'high' ? 'bg-orange-100 border border-orange-500' :
          panicStatus.level === 'moderate' ? 'bg-yellow-100 border border-yellow-500' :
          'bg-blue-100 border border-blue-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">{panicStatus.message}</span>
            </div>
            <button
              onClick={() => setCurrentView('tree')}
              className="px-3 py-1 bg-white rounded hover:bg-gray-50"
            >
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          {/* View Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('glance')}
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                currentView === 'glance' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Year at a Glance
            </button>
            <button
              onClick={() => setCurrentView('tree')}
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                currentView === 'tree' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <TreePine className="w-4 h-4" />
              Cascade Tree
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                currentView === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              disabled
            >
              <Calendar className="w-4 h-4" />
              Calendar (Coming Soon)
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                currentView === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              disabled
            >
              <List className="w-4 h-4" />
              List View (Coming Soon)
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {selectedSubjects.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {selectedSubjects.length}
                </span>
              )}
            </button>

            {/* Validate */}
            <button
              onClick={handleValidate}
              disabled={validateCurriculum.isPending}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Validate
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Export */}
            <button
              className="px-3 py-2 border rounded-lg hover:bg-gray-50"
              disabled
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              className="px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Subject
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSubjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => toggleSubjectFilter(subject)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedSubjects.includes(subject)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border hover:bg-gray-100'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={viewOptions.showCompleted}
                  onChange={(e) => setViewOptions(prev => ({
                    ...prev,
                    showCompleted: e.target.checked
                  }))}
                />
                <span className="text-sm">Show Completed</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={viewOptions.showBlocked}
                  onChange={(e) => setViewOptions(prev => ({
                    ...prev,
                    showBlocked: e.target.checked
                  }))}
                />
                <span className="text-sm">Show Blocked</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={viewOptions.highlightOverdue}
                  onChange={(e) => setViewOptions(prev => ({
                    ...prev,
                    highlightOverdue: e.target.checked
                  }))}
                />
                <span className="text-sm">Highlight Overdue</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6">
        {currentView === 'glance' && statistics && (
          <YearAtGlanceView
            statistics={statistics}
            year={year}
            grade={grade}
            onSubjectClick={(subject) => {
              setSelectedSubjects([subject]);
              setCurrentView('tree');
            }}
          />
        )}

        {currentView === 'tree' && filteredTree && (
          <div className="bg-white rounded-lg shadow p-4">
            <CascadeTree
              node={filteredTree}
              options={viewOptions}
              onNodeClick={handleNodeClick}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Calendar view coming soon...</p>
          </div>
        )}

        {currentView === 'list' && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">List view coming soon...</p>
          </div>
        )}
      </div>

      {/* Selected Node Detail Panel */}
      {selectedNode && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedNode.name}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ×
              </button>
            </div>
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto">
              {JSON.stringify(selectedNode, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};