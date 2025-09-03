import React, { useState, useEffect } from 'react';
import { UserGroupIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { AssessmentGroups, TomorrowGroups } from './QuickAssessmentGrid';
import { assessmentService } from '../../services/assessmentService';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface TomorrowGroupsProps {
  lessonId?: string;
  lessonDate?: string; // ISO date string
  students?: Student[];
  compact?: boolean;
}

export function TomorrowGroupsDisplay({ lessonId, lessonDate, students = [], compact = false }: TomorrowGroupsProps) {
  const [groups, setGroups] = useState<AssessmentGroups | null>(null);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setLoadError(null);
    
    try {
      // Try to load groups for the specific date if provided
      if (lessonDate) {
        const dateGroups = assessmentService.getGroupsForDate(lessonDate);
        if (dateGroups) {
          setGroups(dateGroups);
          return;
        }
      }
      
      // Fall back to 'tomorrow-groups' for backward compatibility
      const savedGroups = localStorage.getItem('tomorrow-groups');
      if (savedGroups) {
        try {
          const parsedGroups = JSON.parse(savedGroups) as AssessmentGroups;
          // Check if groups are for this lesson or if no lessonId specified
          if (!lessonId || parsedGroups.lessonId === lessonId) {
            setGroups(parsedGroups);
          }
        } catch (parseError) {
          console.error('Failed to parse assessment groups:', parseError);
          setLoadError('Failed to load assessment groups');
        }
      }

      // Check if this lesson has groups
      if (lessonId) {
        try {
          const lessonsWithGroups = JSON.parse(localStorage.getItem('lessons-with-groups') || '[]');
          if (!lessonsWithGroups.includes(lessonId)) {
            setGroups(null);
          }
        } catch (parseError) {
          console.error('Failed to parse lessons with groups:', parseError);
        }
      }
    } catch (error) {
      console.error('Error loading assessment groups:', error);
      setLoadError('Error loading assessment groups');
      setGroups(null);
    }
  }, [lessonId, lessonDate]);

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">{loadError}</span>
        </div>
      </div>
    );
  }
  
  if (!groups) {
    return null;
  }

  const getStudentName = (studentId: string): string => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName[0]}.` : studentId;
  };

  const clearGroups = () => {
    try {
      // Clear the specific date-based groups if we have a date
      if (groups?.forDate) {
        localStorage.removeItem(`assessment-groups-${groups.forDate}`);
      }
      
      // Also clear the legacy tomorrow-groups
      localStorage.removeItem('tomorrow-groups');
      
      if (lessonId) {
        try {
          const lessonsWithGroups = JSON.parse(localStorage.getItem('lessons-with-groups') || '[]');
          const updated = lessonsWithGroups.filter((id: string) => id !== lessonId);
          localStorage.setItem('lessons-with-groups', JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to update lessons with groups:', error);
        }
      }
      
      setGroups(null);
    } catch (error) {
      console.error('Failed to clear groups:', error);
      setLoadError('Failed to clear groups');
    }
  };

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">
            Differentiation Groups Ready
          </span>
        </div>
        <span className="text-xs text-indigo-600">
          {groups.reteaching.length + groups.support.length + groups.independent.length + groups.extension.length} students
        </span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4" />
          Today's Differentiation Groups
        </h3>
        <div className="flex items-center gap-2">
          {compact && (
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
          {!compact && (
            <button
              onClick={clearGroups}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Reteaching Group */}
        {groups.reteaching.length > 0 && (
          <div className="p-2 bg-red-50 rounded">
            <div className="font-medium text-red-700 mb-1">
              ⭕ Reteaching ({groups.reteaching.length})
            </div>
            <div className="text-gray-600">
              {students.length > 0 
                ? groups.reteaching.map(id => getStudentName(id)).join(', ')
                : 'Students marked for reteaching'}
            </div>
          </div>
        )}

        {/* Support Group */}
        {groups.support.length > 0 && (
          <div className="p-2 bg-yellow-50 rounded">
            <div className="font-medium text-yellow-700 mb-1">
              🟡 Support ({groups.support.length})
            </div>
            <div className="text-gray-600">
              {students.length > 0 
                ? groups.support.map(id => getStudentName(id)).join(', ')
                : 'Students needing support'}
            </div>
          </div>
        )}

        {/* Independent Group */}
        {groups.independent.length > 0 && (
          <div className="p-2 bg-green-50 rounded">
            <div className="font-medium text-green-700 mb-1">
              🟢 Independent ({groups.independent.length})
            </div>
            <div className="text-gray-600">
              {students.length > 0 
                ? groups.independent.map(id => getStudentName(id)).join(', ')
                : 'Students ready for independent work'}
            </div>
          </div>
        )}

        {/* Extension Group */}
        {groups.extension.length > 0 && (
          <div className="p-2 bg-blue-50 rounded">
            <div className="font-medium text-blue-700 mb-1">
              ⭐ Extension ({groups.extension.length})
            </div>
            <div className="text-gray-600">
              {students.length > 0 
                ? groups.extension.map(id => getStudentName(id)).join(', ')
                : 'Students ready for extension'}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t text-xs text-gray-500">
        Based on yesterday's assessment
      </div>
    </div>
  );
}