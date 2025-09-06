/**
 * Anecdotal Notes History List
 * Issue #318: Display chronological list of student observations
 * 
 * Features:
 * - Chronological display with timestamps
 * - Search and filter capabilities
 * - Context information (lesson, subject)
 * - Mobile-optimized layout
 * - Virtual scrolling for performance
 */

import { Search, BookOpen, StickyNote, Clock } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { useAnecdotalNotes } from '../../hooks/useAnecdotalNotes';
import type { AnecdotalNote } from '../../utils/anecdotalNotes';
import { cn } from '../../utils/cn';

interface AnecdotalNotesListProps {
  studentId: string;
  studentName?: string;
  className?: string;
  maxHeight?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  compact?: boolean;
}

export const AnecdotalNotesList: React.FC<AnecdotalNotesListProps> = ({
  studentId,
  studentName,
  className,
  maxHeight = "400px",
  showSearch = true,
  showFilters = true,
  compact = false
}) => {
  const { notes, isLoading, searchNotes, getNotesInRange } = useAnecdotalNotes({ studentId });
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      if (dateFilter === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        startDate.setDate(now.getDate() - 30);
      }
      
      filtered = getNotesInRange(startDate, now);
    }

    // Apply subject filter
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(note => note.subject === subjectFilter);
    }

    // Apply search
    if (searchTerm.trim()) {
      filtered = searchNotes(searchTerm.trim());
    }

    return filtered;
  }, [notes, searchTerm, dateFilter, subjectFilter, searchNotes, getNotesInRange]);

  // Get unique subjects for filter
  const subjects = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(notes.map(note => note.subject).filter(Boolean)));
    return uniqueSubjects.sort();
  }, [notes]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNoteCard = (note: AnecdotalNote, index: number) => (
    <div
      key={note.id || index}
      className={cn(
        'bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow',
        compact && 'p-3'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Note content */}
          <p className={cn(
            'text-gray-900 break-words',
            compact ? 'text-sm' : 'text-base'
          )}>
            {note.text}
          </p>
          
          {/* Metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(note.timestamp)}</span>
            </div>
            
            {note.lessonContext && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span className="truncate max-w-[200px]" title={note.lessonContext}>
                  {note.lessonContext}
                </span>
              </div>
            )}
            
            {note.subject && note.subject !== 'General' && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                {note.subject}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className={cn('bg-gray-50 rounded-lg p-8 text-center', className)}>
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className={cn('bg-white border rounded-lg', className)}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between p-4 border-b',
        compact && 'p-3'
      )}>
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-amber-600" />
          <h3 className={cn(
            'font-semibold text-gray-900',
            compact ? 'text-base' : 'text-lg'
          )}>
            Notes
            {studentName && <span className="text-gray-600 ml-1">• {studentName}</span>}
          </h3>
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className={cn(
          'p-4 border-b space-y-3',
          compact && 'p-3'
        )}>
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2 border rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'text-sm',
                  'touch-manipulation' // Better mobile interaction
                )}
              />
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'all' | 'week' | 'month')}
                className={cn(
                  'px-3 py-1 border rounded text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'bg-white'
                )}
              >
                <option value="all">All time</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
              </select>

              {subjects.length > 0 && (
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className={cn(
                    'px-3 py-1 border rounded text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    'bg-white'
                  )}
                >
                  <option value="all">All subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notes List */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <StickyNote className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm">
              {searchTerm || dateFilter !== 'all' || subjectFilter !== 'all'
                ? 'No notes match your filters.'
                : studentName 
                  ? `No notes recorded for ${studentName} yet.`
                  : 'No notes recorded yet.'
              }
            </p>
            {(searchTerm || dateFilter !== 'all' || subjectFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('all');
                  setSubjectFilter('all');
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={cn(
            'p-4 space-y-3',
            compact && 'p-3 space-y-2'
          )}>
            {filteredNotes.map((note, index) => renderNoteCard(note, index))}
          </div>
        )}
      </div>
    </div>
  );
};

