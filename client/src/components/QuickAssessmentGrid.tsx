import React, { useState, useMemo, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { Plus, Users, BookOpen, Calendar, Target, TrendingUp } from 'lucide-react';
import { RequestManager } from '../utils/debounce';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useQuickAssessmentManager, useDifferentiationGroups } from '../hooks/useQuickAssessment';
import { ACHIEVEMENT_LEVELS, SUBJECT_OPTIONS } from '../constants/studentAssessment';
import type { 
  AchievementLevel, 
  CreateStudentAssessmentRequest, 
  StudentAssessment 
} from '../types/studentAssessment';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface QuickAssessmentGridProps {
  students: Student[];
  selectedSubject?: string;
  selectedDate?: string;
  lessonId?: string;
  expectationId?: string;
}

interface ValidationError {
  message: string;
  show: boolean;
}

interface AssessmentCell {
  studentId: string;
  level?: AchievementLevel;
  assessment?: StudentAssessment;
}

export function QuickAssessmentGrid({
  students,
  selectedSubject = '',
  selectedDate = format(new Date(), 'yyyy-MM-dd'),
  lessonId,
  expectationId
}: QuickAssessmentGridProps): React.ReactElement {
  const [subject, setSubject] = useState(selectedSubject);
  const [date, setDate] = useState(selectedDate);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [showDifferentiation, setShowDifferentiation] = useState(false);
  const [validationError, setValidationError] = useState<ValidationError>({
    message: '',
    show: false
  });
  const [processingStudents, setProcessingStudents] = useState<Set<string>>(new Set());
  const requestManagerRef = useRef(new RequestManager());

  // Fetch existing assessments
  const assessmentManager = useQuickAssessmentManager({
    subject: subject || undefined,
    date: date || undefined
  });

  // Fetch differentiation groups
  const differentiationGroups = useDifferentiationGroups({
    subject: subject || '',
    date: date || undefined
  });

  // Create assessment grid data
  const assessmentGrid = useMemo(() => {
    const grid: AssessmentCell[] = students.map(student => {
      const existingAssessment = assessmentManager.assessments.find(
        a => a.studentId === student.id && 
             a.subject === subject &&
             a.date.startsWith(date)
      );

      return {
        studentId: student.id,
        level: existingAssessment?.level,
        assessment: existingAssessment
      };
    });

    return grid;
  }, [students, assessmentManager.assessments, subject, date]);

  // Handle level selection
  const handleLevelSelect = useCallback(async (studentId: string, level: AchievementLevel) => {
    // Clear any previous validation errors
    setValidationError({ message: '', show: false });
    
    if (!subject || !title.trim()) {
      setValidationError({
        message: 'Please select a subject and enter a title before assessing students',
        show: true
      });
      // Auto-hide error after 5 seconds
      setTimeout(() => setValidationError({ message: '', show: false }), 5000);
      return;
    }

    // Prevent multiple concurrent requests for the same student
    if (processingStudents.has(studentId)) {
      console.warn(`Request already in progress for student ${studentId}`);
      return;
    }

    // Mark student as being processed
    setProcessingStudents(prev => new Set([...prev, studentId]));
    
    // Generate unique request ID for race condition handling
    const requestId = requestManagerRef.current.generateRequestId();

    const existingCell = assessmentGrid.find(cell => cell.studentId === studentId);
    
    try {
      if (existingCell?.assessment) {
        // Update existing assessment
        await assessmentManager.updateAssessment({
          id: existingCell.assessment.id,
          data: { level, notes: notes || undefined }
        });
      } else {
        // Create new assessment
        const newAssessment: CreateStudentAssessmentRequest = {
          studentId,
          lessonId,
          expectationId,
          subject,
          title,
          level,
          notes: notes || undefined,
          date: new Date(date).toISOString()
        };

        await assessmentManager.createAssessment(newAssessment);
      }

      // Check if this request is still the current one
      if (!requestManagerRef.current.isCurrentRequest(requestId)) {
        console.warn('Assessment request superseded by newer request');
        return;
      }
    } catch (error) {
      // Check if this request is still the current one before showing error
      if (requestManagerRef.current.isCurrentRequest(requestId)) {
        console.error('Failed to save assessment:', error);
        setValidationError({
          message: 'Failed to save assessment. Please try again.',
          show: true
        });
        setTimeout(() => setValidationError({ message: '', show: false }), 5000);
      }
    } finally {
      // Remove student from processing set
      setProcessingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
      
      // Clear request if it's still current
      requestManagerRef.current.clearRequest(requestId);
    }
  }, [subject, title, notes, date, lessonId, expectationId, assessmentGrid, assessmentManager, setValidationError, processingStudents]);

  // Calculate statistics
  const stats = useMemo(() => {
    const assessedCount = assessmentGrid.filter(cell => cell.level).length;
    const totalCount = students.length;
    const coverage = totalCount > 0 ? Math.round((assessedCount / totalCount) * 100) : 0;

    const levelCounts = assessmentGrid.reduce((acc, cell) => {
      if (cell.level) {
        acc[cell.level] = (acc[cell.level] || 0) + 1;
      }
      return acc;
    }, {} as Record<AchievementLevel, number>);

    return {
      assessed: assessedCount,
      total: totalCount,
      coverage,
      levelCounts
    };
  }, [assessmentGrid, students.length]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Assessment Grid
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Rapid 4-level achievement assessment for all students
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDifferentiation(!showDifferentiation)}
                disabled={!subject || stats.assessed === 0}
              >
                <Users className="h-4 w-4 mr-1" />
                Groups
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Validation Error Message */}
          {validationError.show && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between" role="alert">
              <span>{validationError.message}</span>
              <button 
                onClick={() => setValidationError({ message: '', show: false })}
                className="text-red-400 hover:text-red-600"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}
          {/* Form Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select subject"
                aria-required="true"
              >
                <option value="">Select Subject</option>
                {SUBJECT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Assessment date"
                  aria-required="true"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Assessment Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Math Problem Solving"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Assessment title"
                aria-required="true"
                aria-invalid={validationError.show && !title.trim()}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional context or observations"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              aria-label="Assessment notes"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Coverage: <span className="font-medium">{stats.assessed}/{stats.total}</span> ({stats.coverage}%)
              </span>
              {Object.entries(stats.levelCounts).map(([level, count]) => (
                <Badge
                  key={level}
                  style={{
                    backgroundColor: ACHIEVEMENT_LEVELS[level as AchievementLevel].bgColor,
                    color: ACHIEVEMENT_LEVELS[level as AchievementLevel].color
                  }}
                >
                  {ACHIEVEMENT_LEVELS[level as AchievementLevel].icon} {count}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Grid */}
      {subject && title && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Student Assessment Grid
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                <span>Click level to assess:</span>
                {Object.values(ACHIEVEMENT_LEVELS).map(level => (
                  <div key={level.level} className="flex items-center gap-1">
                    <span>{level.icon}</span>
                    <span>{level.label}</span>
                  </div>
                ))}
              </div>

              {/* Student Rows */}
              {students.map(student => {
                const cell = assessmentGrid.find(c => c.studentId === student.id);
                const currentLevel = cell?.level;
                
                return (
                  <div key={student.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50">
                    <div className="w-32 text-sm font-medium truncate">
                      {student.firstName} {student.lastName}
                    </div>
                    
                    <div className="flex gap-1 flex-1">
                      {Object.values(ACHIEVEMENT_LEVELS).map(level => {
                        const isSelected = currentLevel === level.level;
                        const isLoading = processingStudents.has(student.id) || assessmentManager.isCreating || assessmentManager.isUpdating;
                        
                        return (
                          <button
                            key={level.level}
                            onClick={() => handleLevelSelect(student.id, level.level)}
                            disabled={isLoading}
                            className={`
                              w-12 h-8 rounded text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                              ${isSelected 
                                ? 'shadow-md transform scale-105' 
                                : 'hover:scale-105 border border-gray-200'
                              }
                              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            style={{
                              backgroundColor: isSelected ? level.color : level.bgColor,
                              color: isSelected ? 'white' : level.color
                            }}
                            title={`${level.label}: ${level.description}`}
                            aria-label={`Assess ${student.firstName} ${student.lastName} as ${level.label}`}
                            aria-pressed={isSelected}
                            role="radio"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleLevelSelect(student.id, level.level);
                              }
                            }}
                          >
                            {level.icon}
                          </button>
                        );
                      })}
                    </div>
                    
                    {cell?.assessment && (
                      <div className="text-xs text-gray-500">
                        {format(new Date(cell.assessment.createdAt), 'HH:mm')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Differentiation Groups */}
      {showDifferentiation && differentiationGroups.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Differentiation Groups
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(differentiationGroups.data).map(([groupName, studentIds]) => {
                const groupConfig = {
                  reteaching: { label: 'Re-teaching', level: 'NOT_YET', color: 'text-red-600' },
                  support: { label: 'With Support', level: 'APPROACHING', color: 'text-yellow-600' },
                  independent: { label: 'Independent', level: 'MEETING', color: 'text-green-600' },
                  extension: { label: 'Extension', level: 'EXCEEDING', color: 'text-blue-600' }
                }[groupName as keyof typeof differentiationGroups.data];

                if (!groupConfig) return null;

                return (
                  <div key={groupName} className="border rounded-lg p-3">
                    <div className={`text-sm font-medium mb-2 ${groupConfig.color}`}>
                      {ACHIEVEMENT_LEVELS[groupConfig.level as AchievementLevel].icon} {groupConfig.label}
                      <span className="ml-1 text-gray-500">({studentIds.length})</span>
                    </div>
                    
                    <div className="space-y-1">
                      {studentIds.map(studentId => {
                        const student = students.find(s => s.id === studentId);
                        return student ? (
                          <div key={studentId} className="text-xs text-gray-600">
                            {student.firstName} {student.lastName}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading States */}
      {(assessmentManager.isLoading || differentiationGroups.isLoading) && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )}
    </div>
  );
}