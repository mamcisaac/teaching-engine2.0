/**
 * Planning Cascade View - Issue #309 Implementation
 * Single, navigable map of year: LRP terms → Units → Lessons
 * Shows scheduled dates and expectation tags with highlighting
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList } from 'react-window';

import { useDebounce } from '../../hooks/useDebounce';
import { usePlanningCascade } from '../../hooks/usePlanningCascade';

// Type definitions for cascade data
interface Lesson {
  id: string;
  type: 'lesson';
  title: string;
  date: Date | null;
  duration: number;
  status: string;
  isOverdue: boolean;
  isTaught: boolean;
  subject?: string;
  expectations: number;
}

interface Week {
  id: string;
  type: 'week';
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  lessons: Lesson[];
  progress: {
    total: number;
    taught: number;
    overdue: number;
  };
}

interface Unit {
  id: string;
  type: 'unit';
  title: string;
  titleFr?: string;
  startDate: Date;
  endDate: Date;
  weeks: Week[];
  progress: {
    total: number;
    taught: number;
    overdue: number;
  };
}

interface Subject {
  id: string;
  type: 'subject';
  subject: string;
  grade: number;
  units: Unit[];
  progress: {
    total: number;
    taught: number;
    overdue: number;
  };
}

interface Term {
  id: string;
  type: 'term';
  term: string;
  termNumber: number;
  startDate: Date;
  endDate: Date;
  subjects: Subject[];
  progress: {
    total: number;
    taught: number;
    overdue: number;
  };
}

interface CascadeData {
  cascade: {
    id: string;
    type: string;
    academicYear: string;
    terms: Term[];
    progress: {
      total: number;
      taught: number;
      overdue: number;
    };
  };
  statistics: {
    totalLessons: number;
    taughtLessons: number;
    plannedLessons: number;
    overdueCount: number;
    completionPercentage: number;
  };
  expectations?: Array<{
    id: string;
    code: string;
    description: string;
  }>;
}

interface FlattenedItem {
  id: string;
  type: 'term' | 'subject' | 'unit' | 'week' | 'lesson';
  title: string;
  level: number;
  data: Term | Subject | Unit | Week | Lesson;
  hasChildren: boolean;
  isExpanded?: boolean;
}

export const PlanningCascadeView: React.FC = () => {
  const navigate = useNavigate();
  const { data: rawData, isLoading, error } = usePlanningCascade();
  const data = rawData as CascadeData | undefined;
  
  // State for tree expansion
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnscheduledOnly, setShowUnscheduledOnly] = useState(false);
  const [highlightExpectation, setHighlightExpectation] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Tree ref for keyboard navigation
  const treeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<FixedSizeList | null>(null);
  
  // Debounce search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Initialize expansion state when data loads
  useEffect(() => {
    if (data?.cascade?.terms?.[0] && expandedNodes.size === 0) {
      const initial = new Set<string>();
      // Expand first term to show subjects
      const firstTerm = data.cascade.terms[0];
      initial.add(firstTerm.id);
      // Expand first subject to show units
      if (firstTerm.subjects?.[0]) {
        initial.add(firstTerm.subjects[0].id);
      }
      setExpandedNodes(initial);
    }
  }, [data, expandedNodes.size]);
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = (): void => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Initialize with first levels expanded
  useEffect(() => {
    if (data?.cascade) {
      const initial = new Set<string>();
      // Expand first term and subject by default
      if (data.cascade.terms[0]) {
        initial.add(data.cascade.terms[0].id);
        if (data.cascade.terms[0].subjects[0]) {
          initial.add(data.cascade.terms[0].subjects[0].id);
          // Expand first unit too
          if (data.cascade.terms[0].subjects[0].units[0]) {
            initial.add(data.cascade.terms[0].subjects[0].units[0].id);
            // And first week to show lessons
            if (data.cascade.terms[0].subjects[0].units[0].weeks[0]) {
              initial.add(data.cascade.terms[0].subjects[0].units[0].weeks[0].id);
            }
          }
        }
      }
      setExpandedNodes(initial);
    }
  }, [data]);
  
  // Toggle node expansion
  const toggleExpansion = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);
  
  // Expand all nodes
  const expandAll = useCallback(() => {
    if (!data?.cascade) return;
    const all = new Set<string>();
    data.cascade.terms.forEach(term => {
      all.add(term.id);
      term.subjects.forEach(subject => {
        all.add(subject.id);
        subject.units.forEach(unit => {
          all.add(unit.id);
          unit.weeks.forEach(week => {
            all.add(week.id);
          });
        });
      });
    });
    setExpandedNodes(all);
  }, [data]);
  
  // Collapse all nodes
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);
  
  // Navigation handlers
  const handleLessonClick = useCallback((lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  }, [navigate]);
  
  const handleUnitClick = useCallback((unitId: string) => {
    navigate(`/units/${unitId}`);
  }, [navigate]);
  
  const handleDateClick = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    navigate(`/day/${dateStr}`);
  }, [navigate]);
  
  // Format date for display
  const formatDate = useCallback((date: Date | null): string => {
    if (!date) return '';
    // Parse as Date if it's a string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC'
    });
  }, []);
  
  // Filter data based on search and filters using debounced term
  const filteredData = useMemo(() => {
    if (!data?.cascade) return null;
    if (!debouncedSearchTerm && !showUnscheduledOnly) return data.cascade;
    
    // Filter cascade data
    const filteredTerms = data.cascade.terms
      .map(term => ({
        ...term,
        subjects: term.subjects
          .map(subject => ({
            ...subject,
            units: subject.units
              .map(unit => ({
                ...unit,
                weeks: unit.weeks
                  .map(week => ({
                    ...week,
                    lessons: week.lessons.filter(lesson => {
                      const matchesSearch = !debouncedSearchTerm || 
                        lesson.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
                      const matchesUnscheduled = !showUnscheduledOnly || !lesson.date;
                      return matchesSearch && matchesUnscheduled;
                    })
                  }))
                  .filter(week => week.lessons.length > 0)
              }))
              .filter(unit => unit.weeks.length > 0)
          }))
          .filter(subject => subject.units.length > 0)
      }))
      .filter(term => term.subjects.length > 0);
    
    return {
      ...data.cascade,
      terms: filteredTerms
    };
  }, [data, debouncedSearchTerm, showUnscheduledOnly]);
  
  // Flatten tree for virtualization
  const flattenedItems = useMemo(() => {
    if (!filteredData) return [];
    const items: FlattenedItem[] = [];
    
    filteredData.terms.forEach(term => {
      items.push({
        id: term.id,
        type: 'term',
        title: term.term,
        level: 0,
        data: term,
        hasChildren: term.subjects.length > 0,
        isExpanded: expandedNodes.has(term.id)
      });
      
      if (expandedNodes.has(term.id)) {
        term.subjects.forEach(subject => {
          items.push({
            id: subject.id,
            type: 'subject',
            title: subject.subject,
            level: 1,
            data: subject,
            hasChildren: subject.units.length > 0,
            isExpanded: expandedNodes.has(subject.id)
          });
          
          if (expandedNodes.has(subject.id)) {
            subject.units.forEach(unit => {
              items.push({
                id: unit.id,
                type: 'unit',
                title: unit.title,
                level: 2,
                data: unit,
                hasChildren: unit.weeks.length > 0,
                isExpanded: expandedNodes.has(unit.id)
              });
              
              if (expandedNodes.has(unit.id)) {
                unit.weeks.forEach(week => {
                  items.push({
                    id: week.id,
                    type: 'week',
                    title: `Week ${week.weekNumber}`,
                    level: 3,
                    data: week,
                    hasChildren: week.lessons.length > 0,
                    isExpanded: expandedNodes.has(week.id)
                  });
                  
                  if (expandedNodes.has(week.id)) {
                    week.lessons.forEach(lesson => {
                      items.push({
                        id: lesson.id,
                        type: 'lesson',
                        title: lesson.title,
                        level: 4,
                        data: lesson,
                        hasChildren: false
                      });
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
    
    return items;
  }, [filteredData, expandedNodes]);
  
  // Count unscheduled lessons - MUST be before conditional returns
  const unscheduledCount = useMemo(() => {
    if (!data?.cascade) return 0;
    let count = 0;
    data.cascade.terms.forEach(term => {
      term.subjects.forEach(subject => {
        subject.units.forEach(unit => {
          unit.weeks.forEach(week => {
            week.lessons.forEach(lesson => {
              if (!lesson.date) count++;
            });
          });
        });
      });
    });
    return count;
  }, [data]);
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!flattenedItems.length) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = Math.min(prev + 1, flattenedItems.length - 1);
          listRef.current?.scrollToItem(next, 'smart');
          return next;
        });
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = Math.max(prev - 1, 0);
          listRef.current?.scrollToItem(next, 'smart');
          return next;
        });
        break;
        
      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        listRef.current?.scrollToItem(0);
        break;
        
      case 'End':
        e.preventDefault();
        setSelectedIndex(flattenedItems.length - 1);
        listRef.current?.scrollToItem(flattenedItems.length - 1);
        break;
        
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const selectedItem = flattenedItems[selectedIndex];
        if (selectedItem) {
          if (selectedItem.type === 'lesson') {
            handleLessonClick(selectedItem.id);
          } else if (selectedItem.hasChildren) {
            toggleExpansion(selectedItem.id);
          }
        }
        break;
      }
    }
  }, [flattenedItems, selectedIndex, handleLessonClick, toggleExpansion]);
  
  // Row renderer for virtualized list
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = flattenedItems[index];
    if (!item) return null;
    
    const isSelected = selectedIndex === index;
    const isHighlighted = highlightExpectation && 
      item.type === 'lesson' && 
      (item.data as Lesson).expectations > 0;
    
    // Calculate padding based on level for CSS indentation test
    const paddingLeft = `${item.level * 16}px`;
    
    return (
      <div
        style={{
          ...style,
          paddingLeft,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          backgroundColor: isSelected ? '#e3f2fd' : (isHighlighted ? '#fff3cd' : 'transparent')
        }}
        className={isHighlighted ? 'bg-yellow-100' : ''}
        onClick={() => {
          if (item.type === 'lesson') {
            handleLessonClick(item.id);
          } else if (item.type === 'unit') {
            handleUnitClick(item.id);
          } else if (item.hasChildren) {
            toggleExpansion(item.id);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (item.type === 'lesson') {
              handleLessonClick(item.id);
            } else if (item.type === 'unit') {
              handleUnitClick(item.id);
            } else if (item.hasChildren) {
              toggleExpansion(item.id);
            }
          }
        }}
        role="treeitem"
        aria-expanded={item.hasChildren ? item.isExpanded : undefined}
        aria-level={item.level + 1}
        aria-selected={isSelected}
        tabIndex={-1}
      >
        {item.hasChildren && (
          <button
            aria-label={`${item.isExpanded ? 'Collapse' : 'Expand'} ${item.title}`}
            data-testid={item.type === 'unit' ? `expand-collapse-${item.title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: 0,
              marginRight: '0.5rem'
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpansion(item.id);
            }}
          >
            {item.isExpanded ? '▼' : '▶'}
          </button>
        )}
        
        {/* Icons based on type */}
        <span style={{ marginRight: '0.5rem' }}>
          {item.type === 'term' && '📅'}
          {item.type === 'subject' && '📋'}
          {item.type === 'unit' && '📚'}
          {item.type === 'lesson' && ((item.data as Lesson).isTaught ? '📖' : '📝')}
        </span>
        
        {/* Title */}
        {item.type === 'unit' ? (
          <button
            style={{ 
              margin: 0, 
              fontSize: '1rem', 
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              fontWeight: 'bold',
              textAlign: 'left'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleUnitClick(item.id);
            }}
          >
            {item.title}
          </button>
        ) : item.type === 'week' ? (
          <h5 style={{ margin: 0, fontSize: '0.9rem' }}>
            {item.title} ({formatDate((item.data as Week).startDate)} - {formatDate((item.data as Week).endDate)})
          </h5>
        ) : item.type === 'term' ? (
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{item.title}</h2>
        ) : item.type === 'subject' ? (
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.title}</h3>
        ) : (
          <span style={{ flex: 1 }}>{item.title}</span>
        )}
        
        {/* Date/status for lessons */}
        {item.type === 'lesson' && (
          <>
            {(item.data as Lesson).date ? (
              <span
                className={(item.data as Lesson).isTaught ? 'text-green-600' : 'text-orange-600'}
                style={{ 
                  marginLeft: '0.5rem',
                  color: (item.data as Lesson).isTaught ? 'green' : 'orange',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const date = (item.data as Lesson).date;
                  if (date) handleDateClick(typeof date === 'string' ? new Date(date) : date);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    const date = (item.data as Lesson).date;
                    if (date) handleDateClick(typeof date === 'string' ? new Date(date) : date);
                  }
                }}
                tabIndex={0}
                role="button"
              >
                {formatDate((item.data as Lesson).date)} ✓
              </span>
            ) : (
              <span
                className="text-yellow-600"
                style={{ marginLeft: '0.5rem', color: 'red' }}
              >
                Not scheduled ⚠️
              </span>
            )}
          </>
        )}
      </div>
    );
  };
  
  // Loading state
  if (isLoading) {
    return <div>Loading planning cascade...</div>;
  }
  
  // Error state
  if (error) {
    return (
      <div className="planning-cascade-view">
        <h1>Planning Overview</h1>
        <div>Authentication required. Please log in to view your planning cascade.</div>
      </div>
    );
  }
  
  // No data state
  if (!data?.cascade) {
    return (
      <div className="planning-cascade-view">
        <h1>Planning Overview</h1>
        <div>No cascade data available</div>
      </div>
    );
  }
  
  // Calculate statistics
  const totalLessons = data.statistics?.totalLessons || 0;
  const taughtLessons = data.statistics?.taughtLessons || 0;
  const plannedLessons = data.statistics?.plannedLessons || 0;
  
  // Use virtualization for large datasets
  const useVirtualization = totalLessons > 100;
  
  return (
    <div className={`planning-cascade-view ${isMobile ? 'flex-col' : ''}`} style={{ padding: '1rem' }}>
      <h1>Planning Overview</h1>
      
      {/* Search and filter controls */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search lessons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          aria-label="Search lessons"
        />
        
        <button
          onClick={() => setShowUnscheduledOnly(!showUnscheduledOnly)}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: showUnscheduledOnly ? '#007bff' : '#e0e0e0',
            color: showUnscheduledOnly ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Show Unscheduled Only
        </button>
        
        {showUnscheduledOnly && (
          <span style={{ marginLeft: '1rem', color: '#666' }}>
            {unscheduledCount} not scheduled
          </span>
        )}
        
        {data.expectations && (
          <select
            value={highlightExpectation}
            onChange={(e) => setHighlightExpectation(e.target.value)}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            aria-label="Highlight expectation"
          >
            <option value="">Highlight expectation...</option>
            {data.expectations.map(exp => (
              <option key={exp.id} value={exp.id}>
                {exp.code} - {exp.description}
              </option>
            ))}
          </select>
        )}
        
        <button
          onClick={expandAll}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Expand All
        </button>
        
        <button
          onClick={collapseAll}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Collapse All
        </button>
      </div>
      
      {/* Progress statistics */}
      <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <strong>{totalLessons} lessons</strong> • 
        <span style={{ color: 'green' }}> {taughtLessons} taught</span> • 
        <span style={{ color: 'orange' }}> {plannedLessons} planned</span> • 
        <span style={{ color: 'red' }}> {unscheduledCount} unscheduled</span>
      </div>
      
      {/* Tree view - virtualized for large datasets */}
      <div 
        ref={treeRef}
        className="cascade-tree"
        role="tree"
        aria-label="Planning cascade tree"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ outline: 'none', height: useVirtualization ? '600px' : 'auto', overflow: 'auto' }}
      >
        {useVirtualization && flattenedItems.length > 0 ? (
          <FixedSizeList
            ref={listRef}
            height={600}
            itemCount={flattenedItems.length}
            itemSize={40}
            width="100%"
            className="virtual-list"
          >
            {Row}
          </FixedSizeList>
        ) : (
          // Non-virtualized rendering for smaller datasets
          flattenedItems.map((item, index) => (
            <div key={item.id}>
              {Row({ index, style: { height: 40 } })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};