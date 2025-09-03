import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  BoltIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  WifiIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { backupSystem } from '../../utils/backupSystem';
import { EnhancedQuickActions } from './EnhancedQuickActions';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

type MasteryLevel = 'NOT_YET' | 'APPROACHING' | 'MEETING' | 'EXCEEDING';

interface QuickAssessmentGridProps {
  students: Student[];
  lessonId?: string;
  lessonTitle?: string;
  expectation?: string;
  onClose: () => void;
  onDaybookUpdate?: (summary: string) => void;
}

export interface AssessmentGroups {
  reteaching: string[];
  support: string[];
  independent: string[];
  extension: string[];
  lessonId: string;
  forDate: string; // ISO date string for when these groups should be used
  createdAt: string;
  createdBy?: string;
}

// Keep TomorrowGroups for backwards compatibility
export type TomorrowGroups = AssessmentGroups;

const LEVELS: Record<MasteryLevel, { icon: string; color: string; label: string }> = {
  NOT_YET: { icon: '⭕', color: '#ef4444', label: 'Not Yet' },
  APPROACHING: { icon: '🟡', color: '#f59e0b', label: 'Approaching' },
  MEETING: { icon: '🟢', color: '#10b981', label: 'Meeting' },
  EXCEEDING: { icon: '⭐', color: '#3b82f6', label: 'Exceeding' }
};

export function QuickAssessmentGrid({ 
  students, 
  lessonId,
  lessonTitle,
  expectation,
  onClose,
  onDaybookUpdate 
}: QuickAssessmentGridProps) {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Map<string, MasteryLevel>>(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem(`assessment-${lessonId || 'current'}`);
    if (saved) {
      const data = JSON.parse(saved);
      return new Map(data.assessments);
    }
    // Initialize all as MEETING
    const initial = new Map<string, MasteryLevel>();
    students.forEach(s => initial.set(s.id, 'MEETING'));
    return initial;
  });
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showGroups, setShowGroups] = useState(false);
  const [groupsCreated, setGroupsCreated] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSaving, setIsSaving] = useState(false);
  const [daybookUpdated, setDaybookUpdated] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Check for empty roster
  if (!students || students.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Students in Roster</h2>
          <p className="text-gray-600 mb-6">
            You need to add students to your roster before you can assess them.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                onClose();
                navigate('/roster');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go to Roster
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Monitor online/offline status and process sync queue
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      // Process sync queue when coming back online
      const queue = JSON.parse(localStorage.getItem('assessment-sync-queue') || '[]');
      if (queue.length > 0) {
        toast.info(`Syncing ${queue.length} offline assessments...`);
        // In production, this would call the API
        // For now, we'll merge with saved assessments
        for (const item of queue) {
          const key = `assessment-${item.lessonId || 'current'}`;
          localStorage.setItem(key, JSON.stringify(item));
        }
        localStorage.setItem('assessment-sync-queue', '[]');
        toast.success('Offline assessments synced!');
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('You are offline. Changes will be saved locally.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save with offline support
  useEffect(() => {
    const data = {
      assessments: Array.from(assessments.entries()),
      lessonId,
      lessonTitle,
      expectation,
      timestamp: new Date().toISOString(),
      synced: !isOffline
    };
    
    // Save to localStorage
    localStorage.setItem(`assessment-${lessonId || 'current'}`, JSON.stringify(data));
    
    // Queue for sync if offline
    if (isOffline) {
      const queue = JSON.parse(localStorage.getItem('assessment-sync-queue') || '[]');
      queue.push(data);
      localStorage.setItem('assessment-sync-queue', JSON.stringify(queue));
    }
  }, [assessments, lessonId, lessonTitle, expectation, isOffline]);

  const cycleLevel = (studentId: string) => {
    if (!studentId) return;
    const levels: MasteryLevel[] = ['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING'];
    const current = assessments.get(studentId) || 'MEETING';
    const nextIndex = (levels.indexOf(current) + 1) % levels.length;
    setLevel(studentId, levels[nextIndex]);
  };

  const setLevel = (studentId: string, level: MasteryLevel) => {
    if (!studentId) return;
    const newAssessments = new Map(assessments);
    newAssessments.set(studentId, level);
    setAssessments(newAssessments);
  };

  const generateGroups = (): AssessmentGroups => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const groups: AssessmentGroups = {
      reteaching: [],
      support: [],
      independent: [],
      extension: [],
      lessonId: lessonId || `temp-${Date.now()}`,
      forDate: tomorrow.toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    students.forEach(student => {
      const level = assessments.get(student.id) || 'MEETING';
      switch (level) {
        case 'NOT_YET':
          groups.reteaching.push(student.id);
          break;
        case 'APPROACHING':
          groups.support.push(student.id);
          break;
        case 'MEETING':
          groups.independent.push(student.id);
          break;
        case 'EXCEEDING':
          groups.extension.push(student.id);
          break;
      }
    });

    return groups;
  };

  const handleCreateGroups = async () => {
    const groups = generateGroups();
    
    // Save groups with date-based key for proper retrieval
    try {
      const groupKey = `assessment-groups-${groups.forDate}`;
      localStorage.setItem(groupKey, JSON.stringify(groups));
      
      // Also keep compatibility with old key
      localStorage.setItem('tomorrow-groups', JSON.stringify(groups));
    } catch (error) {
      console.error('Failed to save groups to localStorage:', error);
      toast.error('Storage is full. Please export your data and clear old assessments.');
      // Continue with the operation even if save fails
    }
    
    // Save to a rolling list of all groups
    const allGroups = JSON.parse(localStorage.getItem('all-assessment-groups') || '[]');
    allGroups.push({
      lessonId: lessonId || 'current',
      forDate: groups.forDate,
      timestamp: groups.createdAt
    });
    
    // Keep only last 30 days of groups
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const filtered = allGroups.filter((g: any) => new Date(g.timestamp) > thirtyDaysAgo);
    localStorage.setItem('all-assessment-groups', JSON.stringify(filtered));
    
    // Auto-backup after creating groups
    try {
      backupSystem.performAutoBackup();
    } catch (error) {
      console.error('Auto-backup failed:', error);
    }
    
    // Update Daybook with group information
    if (onDaybookUpdate) {
      const groupSummary = `
📊 Assessment Groups Created for ${groups.forDate}:
• Reteaching needed (${groups.reteaching.length} students): Focus on fundamentals
• Support group (${groups.support.length} students): Guided practice needed
• Independent work (${groups.independent.length} students): Ready for standard activities
• Extension challenges (${groups.extension.length} students): Ready for enrichment
${expectation ? `\nExpectation assessed: ${expectation}` : ''}
      `.trim();
      
      try {
        await onDaybookUpdate(groupSummary);
        setDaybookUpdated(true);
        toast.success('📔 Daybook updated with group information!');
      } catch (error) {
        console.error('Failed to update daybook:', error);
      }
    }
    
    setGroupsCreated(true);
    setShowGroups(true);
    toast.success(`✅ Groups created for tomorrow! Ready for differentiated instruction on ${groups.forDate}`);
  };

  const handleSaveAndClose = async () => {
    setIsSaving(true);
    
    try {
      // Validate that at least some assessments were made
      const assessedCount = Array.from(assessments.values()).filter(level => level !== 'MEETING').length;
      if (assessedCount === 0) {
        toast.warning('No assessments were made. Please assess at least one student.');
        setIsSaving(false);
        return;
      }
      
      // Generate assessment summary
      const groups = generateGroups();
      const summary = `${expectation || 'Quick Assessment'}: ${groups.reteaching.length} need reteaching, ${groups.support.length} approaching, ${groups.independent.length} meeting, ${groups.extension.length} exceeding.`;
      
      // Update Daybook with error handling
      if (onDaybookUpdate) {
        try {
          await onDaybookUpdate(summary);
          setDaybookUpdated(true);
          toast.success('📔 Daybook updated with assessment summary!');
        } catch (error) {
          console.error('Failed to update daybook:', error);
          toast.error('Failed to update daybook, but assessment was saved locally');
        }
      } else {
        // Fallback: append to localStorage daybook
        try {
          const today = new Date().toISOString().split('T')[0];
          const daybookKey = `daybook-${today}`;
          const existing = localStorage.getItem(daybookKey) || '';
          localStorage.setItem(daybookKey, existing + '\n' + summary);
        } catch (error) {
          console.error('Failed to save to localStorage daybook:', error);
        }
      }
      
      // Save final state with error handling
      try {
        const finalData = {
          assessments: Array.from(assessments.entries()),
          groups: groupsCreated ? groups : null,
          lessonId,
          lessonTitle,
          expectation,
          summary,
          timestamp: new Date().toISOString()
        };
        try {
          // Save with unique key
          localStorage.setItem(`assessment-complete-${lessonId || Date.now()}`, JSON.stringify(finalData));
          
          // Also save to standard assessment-records for compatibility
          const existingRecords = localStorage.getItem('assessment-records');
          const allRecords = existingRecords ? JSON.parse(existingRecords) : [];
          allRecords.push(finalData);
          localStorage.setItem('assessment-records', JSON.stringify(allRecords));
          
          // Save groups if created
          if (groupsCreated && groups) {
            localStorage.setItem('assessment-groups-latest', JSON.stringify(groups));
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowKey = `assessment-groups-${tomorrow.toISOString().split('T')[0]}`;
            localStorage.setItem(tomorrowKey, JSON.stringify(groups));
          }
        } catch (storageError) {
          console.error('Failed to save assessment to localStorage:', storageError);
          toast.warning('Storage is full. Assessment saved temporarily. Please export your data.');
        }
        
        // Perform auto-backup
        try {
          backupSystem.performAutoBackup();
        } catch (backupError) {
          console.error('Auto-backup failed:', backupError);
          // Don't fail the save operation if backup fails
        }
        
        // Also save to service for sync
        if (window.assessmentService) {
          await window.assessmentService.saveAssessment({
            lessonId: lessonId || 'current',
            lessonTitle,
            expectation,
            assessments: Array.from(assessments.entries()),
            timestamp: new Date().toISOString(),
            synced: navigator.onLine
          });
        }
      } catch (error) {
        console.error('Failed to save assessment:', error);
        toast.error('Failed to save assessment completely. Some data may be lost.');
      }
      
      toast.success('Assessment saved!');
      onClose();
    } catch (error) {
      console.error('Unexpected error during save:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const gridWidth = 5;
      const maxIndex = students.length - 1;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(0, i - gridWidth));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(maxIndex, i + gridWidth));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex(i => Math.max(0, i - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex(i => Math.min(maxIndex, i + 1));
          break;
        case '1':
          setLevel(students[selectedIndex]?.id, 'NOT_YET');
          break;
        case '2':
          setLevel(students[selectedIndex]?.id, 'APPROACHING');
          break;
        case '3':
          setLevel(students[selectedIndex]?.id, 'MEETING');
          break;
        case '4':
          setLevel(students[selectedIndex]?.id, 'EXCEEDING');
          break;
        case 'Enter':
          cycleLevel(students[selectedIndex]?.id);
          break;
        case 'g':
        case 'G':
          handleCreateGroups();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [students, selectedIndex, assessments, onClose, handleCreateGroups, cycleLevel, setLevel]);

  const groups = generateGroups();
  const stats = {
    NOT_YET: groups.reteaching.length,
    APPROACHING: groups.support.length,
    MEETING: groups.independent.length,
    EXCEEDING: groups.extension.length
  };

  const assessedCount = students.filter(s => 
    assessments.get(s.id) !== 'MEETING'
  ).length;
  
  // Calculate progress for workflow indicator
  const workflowStep = groupsCreated ? 3 : (assessedCount > 0 ? 2 : 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Offline Status Banner */}
        {isOffline && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Working Offline - Changes will sync when connection restored
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span>Offline Mode</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <BoltIcon className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold">Quick Assessment Grid</h2>
              </div>
              {lessonTitle && (
                <p className="text-sm text-gray-600 mt-1">Lesson: {lessonTitle}</p>
              )}
              {expectation && (
                <p className="text-sm text-gray-700">{expectation}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Daybook Status Indicator */}
              {daybookUpdated && (
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 text-sm font-medium animate-pulse">
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Daybook Updated</span>
                </div>
              )}
              <EnhancedQuickActions 
                students={students}
                onImportComplete={() => {
                  // Close the assessment grid and let parent component refresh
                  toast.success('Data imported successfully. Please reopen the assessment.');
                  onClose();
                }}
              />
              <button
                onClick={handleSaveAndClose}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                Save & Close
              </button>
            </div>
          </div>
          
          {/* Workflow Indicator */}
          <div className="mt-4 bg-white rounded-lg p-3">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <div className={`flex items-center gap-2 ${workflowStep >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                <span className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  {assessedCount > 0 ? <CheckCircleIcon className="w-5 h-5" /> : '1'}
                </span>
                <span>Assess Students</span>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              <div className={`flex items-center gap-2 ${workflowStep >= 2 ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                <span className="bg-green-100 rounded-full w-8 h-8 flex items-center justify-center text-sm">
                  {groupsCreated ? <CheckCircleIcon className="w-5 h-5" /> : '2'}
                </span>
                <span>Create Groups</span>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              <div className={`flex items-center gap-2 ${workflowStep >= 3 ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
                <span className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                <span>Plan Tomorrow</span>
              </div>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-4">
              {Object.entries(LEVELS).map(([key, info]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-lg">{info.icon}</span>
                  <span className="text-sm font-medium">{stats[key as MasteryLevel]}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {assessedCount}/{students.length} assessed
              </span>
              <button
                onClick={() => setShowGroups(!showGroups)}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <UserGroupIcon className="w-4 h-4" />
                {showGroups ? 'Hide' : 'Show'} Groups
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showGroups ? (
            /* Assessment Grid */
            <div>
              <div ref={gridRef} className="grid grid-cols-5 gap-2 mb-4">
                {students.map((student, index) => {
                  const level = assessments.get(student.id) || 'MEETING';
                  const info = LEVELS[level];
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <button
                      key={student.id}
                      onClick={() => {
                        setSelectedIndex(index);
                        cycleLevel(student.id);
                      }}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}
                        hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500
                      `}
                      style={{ backgroundColor: `${info.color}20` }}
                      aria-label={`${student.firstName} ${student.lastName}: ${info.label}. Press to change.`}
                      aria-pressed={level !== 'MEETING'}
                      role="button"
                      tabIndex={isSelected ? 0 : -1}
                    >
                      <div className="text-2xl mb-1" aria-hidden="true">{info.icon}</div>
                      <div className="text-xs font-medium">{student.firstName}</div>
                      <div className="text-xs text-gray-600">{student.lastName}</div>
                      <div className="sr-only">Current level: {info.label}</div>
                    </button>
                  );
                })}
              </div>
              
              {/* Prominent Action Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleCreateGroups}
                  className={`
                    transform transition-all duration-200 
                    ${
                      groupsCreated 
                        ? 'px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg border-2 border-green-400'
                        : 'px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 animate-pulse'
                    }
                    font-bold text-lg flex items-center gap-3
                  `}
                  aria-label={groupsCreated ? 'Groups have been created' : 'Create groups for tomorrow based on assessment'}
                >
                  {groupsCreated ? (
                    <>
                      <CheckCircleIcon className="w-7 h-7" />
                      <span>Groups Created for Tomorrow ✓</span>
                    </>
                  ) : (
                    <>
                      <UserGroupIcon className="w-7 h-7" />
                      <div className="flex flex-col items-start">
                        <span className="text-xl">Create Groups for Tomorrow</span>
                        <span className="text-xs opacity-90 font-normal">Smart grouping based on assessment</span>
                      </div>
                      <ChevronRightIcon className="w-6 h-6 animate-bounce" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Groups View */
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">⭕</span>
                    Reteaching Group ({groups.reteaching.length})
                  </h3>
                  <div className="text-sm text-gray-700">
                    {groups.reteaching.length > 0 ? (
                      groups.reteaching.map(id => {
                        const s = students.find(st => st.id === id);
                        return s ? `${s.firstName} ${s.lastName[0]}.` : '';
                      }).filter(Boolean).join(', ')
                    ) : (
                      <span className="italic text-gray-500">No students need reteaching</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-red-600">
                    Strategy: Use manipulatives, break into smaller steps
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">🟡</span>
                    Support Group ({groups.support.length})
                  </h3>
                  <div className="text-sm text-gray-700">
                    {groups.support.length > 0 ? (
                      groups.support.map(id => {
                        const s = students.find(st => st.id === id);
                        return s ? `${s.firstName} ${s.lastName[0]}.` : '';
                      }).filter(Boolean).join(', ')
                    ) : (
                      <span className="italic text-gray-500">No students in support group</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-yellow-600">
                    Strategy: Guided practice with scaffolding
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">🟢</span>
                    Independent Group ({groups.independent.length})
                  </h3>
                  <div className="text-sm text-gray-700">
                    {groups.independent.length > 0 ? (
                      groups.independent.map(id => {
                        const s = students.find(st => st.id === id);
                        return s ? `${s.firstName} ${s.lastName[0]}.` : '';
                      }).filter(Boolean).join(', ')
                    ) : (
                      <span className="italic text-gray-500">No students in independent group</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    Strategy: Self-directed practice with choice
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    Extension Group ({groups.extension.length})
                  </h3>
                  <div className="text-sm text-gray-700">
                    {groups.extension.length > 0 ? (
                      groups.extension.map(id => {
                        const s = students.find(st => st.id === id);
                        return s ? `${s.firstName} ${s.lastName[0]}.` : '';
                      }).filter(Boolean).join(', ')
                    ) : (
                      <span className="italic text-gray-500">No students ready for extension</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    Strategy: Challenge problems, peer teaching
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <p className="text-sm text-indigo-700 font-medium">
                  ✓ These groups will appear in tomorrow's lesson planning view
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Assessment summary will be added to your Daybook reflection
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            Keyboard: ↑↓←→ navigate • 1-4 set level • Enter cycle • G create groups • Esc close
          </p>
        </div>
      </div>
    </div>
  );
}