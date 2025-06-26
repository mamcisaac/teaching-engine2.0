import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ETFOPlanningCoverage from '../components/ETFOPlanningCoverage';
import CurriculumExpectationCoverage from '../components/CurriculumExpectationCoverage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Target, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Settings, 
  Undo, 
  Redo, 
  Save, 
  Cloud, 
  CloudOff,
  RotateCcw,
  HelpCircle,
  Wand2
} from 'lucide-react';
import { useWorkflowState, ETFOLevel } from '../hooks/useWorkflowState';
import { useWeeklyPlannerStore } from '../stores/weeklyPlannerStore';
import { AutoSaveIndicator } from '@/components/ui/AutoSaveIndicator';
import { HelpButton, HelpTooltip } from '../components/help';
import { useHelp } from '../contexts/HelpContext';
import { PlanningWorkflowIndicator } from '../components/planning/PlanningWorkflowIndicator';
import { PlanningWizard } from '../components/planning/PlanningWizard';
import { RecentPlans } from '../components/planning/RecentPlans';
import { QuickActions } from '../components/planning/QuickActions';
import { DuplicatePlanModal } from '../components/planning/DuplicatePlanModal';
import { useRecentPlans } from '../hooks/useRecentPlans';

export default function PlanningDashboard() {
  const { workflowState } = useWorkflowState();
  const { startTutorial, setCurrentSection } = useHelp();
  const workflowProgress = workflowState?.progress ? 
    Math.round(workflowState.progress.reduce((acc, p) => acc + p.progressPercentage, 0) / workflowState.progress.length) : 0;
  
  // New state for wizard and modals
  const [showWizard, setShowWizard] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  // Recent plans data
  const { data: recentPlans = [], isLoading: recentPlansLoading } = useRecentPlans({ limit: 5 });

  // Weekly planner state management
  const {
    isLoading,
    isSaving,
    hasOfflineChanges,
    undoHistory,
    redoHistory,
    autoSave,
    theme,
    undo,
    redo,
    saveToServer,
    syncWithServer,
    resetToDefaults,
    saveToHistory
  } = useWeeklyPlannerStore();

  const [showSettings, setShowSettings] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Handle auto-save indicator
  useEffect(() => {
    if (!isSaving && !hasOfflineChanges) {
      setLastSaved(new Date());
    }
  }, [isSaving, hasOfflineChanges]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveToServer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveToServer]);

  const handleManualSave = async () => {
    saveToHistory('Manual save');
    await saveToServer();
  };

  const handleSync = async () => {
    await syncWithServer();
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all planner preferences to defaults? This cannot be undone.')) {
      saveToHistory('Reset to defaults');
      resetToDefaults();
      await saveToServer();
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header with State Management Controls */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Planning Dashboard</h1>
            <HelpTooltip 
              content="Your central hub for tracking ETFO planning progress, managing curriculum coverage, and accessing quick actions for all planning levels."
              position="bottom"
            >
              <HelpButton 
                size="sm"
                content="Get help with the Planning Dashboard"
                onClick={() => setCurrentSection('planning')}
              />
            </HelpTooltip>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Track your ETFO planning progress and curriculum coverage
            </p>
            <AutoSaveIndicator 
              isSaving={isSaving}
              hasUnsavedChanges={hasOfflineChanges}
              lastSaved={lastSaved}
              onManualSave={handleManualSave}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* State Management Controls */}
          <div className="flex gap-2 mr-4 border-r pr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={undoHistory.length === 0}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={redoHistory.length === 0}
              title="Redo (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
              title="Save (Ctrl+S)"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isLoading || isSaving}
              title={hasOfflineChanges ? "Sync offline changes" : "Refresh from server"}
            >
              {hasOfflineChanges ? <CloudOff className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              title="Planner Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              title="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Controls */}
          <HelpTooltip 
            content="Start with Long-Range Plans to create your yearly overview. This becomes the foundation for all other planning levels."
            position="bottom"
          >
            <Link to="/planner/long-range">
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Long-Range Plans
              </Button>
            </Link>
          </HelpTooltip>
          <div className="flex gap-2">
            <HelpTooltip 
              content="Create detailed unit plans from your long-range themes. Unit plans break down yearly goals into manageable learning experiences."
              position="bottom"
            >
              <Link to="/planner/units">
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4" />
                  Create Unit Plan
                </Button>
              </Link>
            </HelpTooltip>
            <HelpTooltip 
              content="Start an interactive tutorial to learn the ETFO planning workflow step by step."
              position="bottom"
            >
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => startTutorial('getting-started-tour')}
                className="gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Start Tutorial
              </Button>
            </HelpTooltip>
          </div>
        </div>
      </div>

      {/* Planning-Only Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-blue-900 font-medium">📚 Curriculum Planning Tool</h3>
            <p className="text-blue-800 text-sm mt-1">
              Teaching Engine 2.0 helps you plan and organize your curriculum delivery. 
              For student assessment tracking, grades, and report cards, please use your school board&apos;s designated systems.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Planner Preferences</CardTitle>
            <CardDescription>
              Customize your planning interface and workflow settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlannerSettingsPanel onClose={() => setShowSettings(false)} />
          </CardContent>
        </Card>
      )}

      {/* New Planning Workflow Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Workflow Indicator - Left Column */}
        <div className="lg:col-span-1">
          <PlanningWorkflowIndicator 
            progress={workflowState?.progress || []}
            currentLevel={workflowState?.currentLevel || ETFOLevel.CURRICULUM_EXPECTATIONS}
            className="h-full"
          />
        </div>
        
        {/* Middle Column - Quick Actions and Recent Plans */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <QuickActions 
            onDuplicatePlan={(type) => {
              if (type === 'select') {
                setShowDuplicateModal(true);
              }
            }}
          />
          
          {/* Recent Plans */}
          <RecentPlans 
            plans={recentPlans}
            isLoading={recentPlansLoading}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Workflow Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflowProgress}%</div>
            <p className="text-xs text-muted-foreground">ETFO workflow completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Active Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Across all levels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Lessons planned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3d</div>
            <p className="text-xs text-muted-foreground">Unit 4 completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Coverage Tabs */}
      <Tabs defaultValue="etfo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="etfo">ETFO Planning Coverage</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="etfo" className="space-y-4">
          <ETFOPlanningCoverage />
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          <CurriculumExpectationCoverage />
        </TabsContent>
      </Tabs>

      {/* Helpful Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Planning Resources</CardTitle>
          <CardDescription>
            Quick links to help you complete your planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/curriculum/import" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium mb-1">Import Curriculum</h4>
                <p className="text-sm text-gray-600">
                  Upload PDF or DOCX files to extract curriculum expectations
                </p>
              </div>
            </Link>
            <Link to="/planner/daybook" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium mb-1">Daily Reflections</h4>
                <p className="text-sm text-gray-600">
                  Record daily observations and lesson reflections
                </p>
              </div>
            </Link>
            <Link to="/planner/etfo-lessons" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium mb-1">Lesson Templates</h4>
                <p className="text-sm text-gray-600">
                  Use ETFO-aligned templates for three-part lessons
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Wizard Button - Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => setShowWizard(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all gap-2"
          size="lg"
        >
          <Wand2 className="h-5 w-5" />
          Planning Wizard
        </Button>
      </div>

      {/* Planning Wizard Modal */}
      {showWizard && (
        <PlanningWizard
          currentLevel={workflowState?.currentLevel}
          completedLevels={workflowState?.completedLevels}
          onClose={() => setShowWizard(false)}
        />
      )}

      {/* Duplicate Plan Modal */}
      <DuplicatePlanModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
      />
    </div>
  );
}

// Planner Settings Panel Component
interface PlannerSettingsPanelProps {
  onClose: () => void;
}

function PlannerSettingsPanel({ onClose }: PlannerSettingsPanelProps) {
  const {
    defaultView,
    timeSlotDuration,
    showWeekends,
    startOfWeek,
    workingHours,
    sidebarExpanded,
    showMiniCalendar,
    showResourcePanel,
    compactMode,
    theme,
    autoSave,
    autoSaveInterval,
    showUncoveredOutcomes,
    defaultLessonDuration,
    maxHistorySize,
    setDefaultView,
    setTimeSlotDuration,
    setShowWeekends,
    setStartOfWeek,
    setWorkingHours,
    setSidebarExpanded,
    setShowMiniCalendar,
    setShowResourcePanel,
    setCompactMode,
    setTheme,
    setAutoSave,
    setAutoSaveInterval,
    setShowUncoveredOutcomes,
    setDefaultLessonDuration,
    saveToHistory,
    saveToServer
  } = useWeeklyPlannerStore();

  const handleSave = async () => {
    saveToHistory('Updated planner settings');
    await saveToServer();
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* View Preferences */}
      <div>
        <h3 className="text-lg font-medium mb-4">View Preferences</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Default View</label>
            <select 
              value={defaultView} 
              onChange={(e) => setDefaultView(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="week">Week View</option>
              <option value="month">Month View</option>
              <option value="agenda">Agenda View</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Time Slot Duration</label>
            <select 
              value={timeSlotDuration} 
              onChange={(e) => setTimeSlotDuration(Number(e.target.value) as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showWeekends"
              checked={showWeekends}
              onChange={(e) => setShowWeekends(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showWeekends" className="text-sm font-medium">Show Weekends</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Start of Week</label>
            <select 
              value={startOfWeek} 
              onChange={(e) => setStartOfWeek(Number(e.target.value) as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Working Hours Start</label>
            <input
              type="time"
              value={workingHours.start}
              onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Working Hours End</label>
            <input
              type="time"
              value={workingHours.end}
              onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* UI Preferences */}
      <div>
        <h3 className="text-lg font-medium mb-4">Interface Preferences</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sidebarExpanded"
              checked={sidebarExpanded}
              onChange={(e) => setSidebarExpanded(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="sidebarExpanded" className="text-sm font-medium">Expanded Sidebar</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showMiniCalendar"
              checked={showMiniCalendar}
              onChange={(e) => setShowMiniCalendar(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showMiniCalendar" className="text-sm font-medium">Show Mini Calendar</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showResourcePanel"
              checked={showResourcePanel}
              onChange={(e) => setShowResourcePanel(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showResourcePanel" className="text-sm font-medium">Show Resource Panel</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="compactMode"
              checked={compactMode}
              onChange={(e) => setCompactMode(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="compactMode" className="text-sm font-medium">Compact Mode</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Planning Preferences */}
      <div>
        <h3 className="text-lg font-medium mb-4">Planning Preferences</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoSave"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoSave" className="text-sm font-medium">Auto-save</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Auto-save Interval (seconds)</label>
            <input
              type="number"
              min="5"
              max="300"
              value={autoSaveInterval}
              onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showUncoveredOutcomes"
              checked={showUncoveredOutcomes}
              onChange={(e) => setShowUncoveredOutcomes(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showUncoveredOutcomes" className="text-sm font-medium">Show Uncovered Outcomes</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Default Lesson Duration (minutes)</label>
            <input
              type="number"
              min="15"
              max="240"
              step="15"
              value={defaultLessonDuration}
              onChange={(e) => setDefaultLessonDuration(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}